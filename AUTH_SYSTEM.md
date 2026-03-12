# 🔐 SAGE Authentication System Documentation

## Overview

Complete authentication system for SAGE platform with:
- User registration with email verification
- Secure login with rate limiting
- Password reset flow
- Email verification with 6-digit PIN
- Professional UI components using shadcn/ui
- MongoDB database integration
- Brevo email service integration

## Architecture

### Database Models

#### User Model
```typescript
{
  email: string (unique, lowercase)
  password: string (bcrypt hashed)
  firstName: string
  lastName: string
  role: STUDENT | ADVISOR | ADMIN
  status: ACTIVE | PENDING_VERIFICATION | INACTIVE | SUSPENDED
  isEmailVerified: boolean
  emailVerifiedAt: Date (optional)
  lastLoginAt: Date (optional)
  createdAt: Date
  updatedAt: Date
}
```

#### EmailVerificationToken Model
```typescript
{
  userId: ObjectId (ref: User)
  pin: string (6 digits)
  attempts: number (tracks failed attempts)
  maxAttempts: number (default: 5)
  expiresAt: Date (10 minutes)
  createdAt: Date
}
```

#### PasswordResetToken Model
```typescript
{
  userId: ObjectId (ref: User)
  token: string (hashed, unique)
  expiresAt: Date (1 hour)
  usedAt: Date (optional, tracks if already used)
  createdAt: Date
}
```

#### Session Model (for Auth.js compatibility)
```typescript
{
  sessionToken: string (unique)
  userId: ObjectId (ref: User)
  expires: Date
  createdAt: Date
}
```

## API Routes

### 1. Registration
**POST** `/api/auth/register`

**Request:**
```json
{
  "email": "user@university.edu",
  "firstName": "John",
  "lastName": "Doe",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "role": "STUDENT",
  "agreeToTerms": true
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Account created! Check your email for verification code.",
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

**Error Responses:**
- `400`: Validation failed
- `409`: Email already registered

**Email Sent:**
- Welcome email with role confirmation
- Verification PIN (6 digits)

---

### 2. Verify PIN
**POST** `/api/auth/verify-pin`

**Request:**
```json
{
  "email": "user@university.edu",
  "pin": "123456"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "email": "user@university.edu",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT"
  }
}
```

**Error Responses:**
- `400`: Invalid PIN format
- `401`: Invalid PIN (tracks attempts)
- `410`: Verification code expired
- `429`: Too many failed attempts

**Edge Cases Handled:**
- PIN expired (10 minutes)
- Maximum 5 attempts
- Attempts tracking
- PIN regeneration via resend endpoint

---

### 3. Resend PIN
**POST** `/api/auth/resend-pin`

**Request:**
```json
{
  "email": "user@university.edu"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Verification code sent to your email"
}
```

**Edge Cases Handled:**
- Already verified accounts return success
- New PIN generated
- Old PIN invalidated

---

### 4. Login
**POST** `/api/auth/login`

**Request:**
```json
{
  "email": "user@university.edu",
  "password": "SecurePass123!"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "email": "user@university.edu",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT"
  }
}
```

**Session Cookie:**
- `auth_token`: User ID (httpOnly, secure, 7-day expiry)

**Error Responses:**
- `400`: Invalid email format
- `401`: Invalid credentials (generic message)
- `403`: Email not verified / Account not active
- `429`: Too many failed attempts

**Edge Cases Handled:**
- Rate limiting: 5 attempts in 15 minutes
- Account lockout: 15 minutes after max attempts
- Email not verified rejection
- Account status validation
- Last login timestamp update

---

### 5. Forgot Password
**POST** `/api/auth/forgot-password`

**Request:**
```json
{
  "email": "user@university.edu"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

**Email Sent:**
- Reset link: `https://sageadvisor.app/auth/reset-password?token=<token>`
- Link expires in 1 hour
- Security warning about not sharing link

**Edge Cases Handled:**
- Non-existent email returns success (security)
- Old tokens deleted before creating new one
- Token hashing for security

---

### 6. Reset Password
**POST** `/api/auth/reset-password`

**Request:**
```json
{
  "token": "<reset_token_from_email>",
  "password": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Responses:**
- `400`: Invalid/expired token
- `400`: Token already used
- `410`: Reset link expired
- `404`: User not found

**Email Sent:**
- Password reset confirmation

**Edge Cases Handled:**
- Token validation and expiry (1 hour)
- One-time token usage
- Password strength requirements
- Secure token hashing

---

## Frontend Components

### 1. SignupForm
- **Location**: `components/auth/signup-form.tsx`
- **Features**:
  - First name, last name fields
  - Email validation
  - Role selection (STUDENT/ADVISOR)
  - Password strength meter
  - Password confirmation
  - Terms agreement checkbox
  - Success redirect to PIN verification

### 2. LoginForm
- **Location**: `components/auth/login-form.tsx`
- **Features**:
  - Email and password inputs
  - Forgot password link
  - Error handling with attempt tracking display
  - Auto-redirect to verification if needed
  - Session cookie management

### 3. VerifyPinForm
- **Location**: `components/auth/verify-pin-form.tsx`
- **Features**:
  - 6-digit numeric input
  - Pin validation
  - Attempts counter display
  - Resend code functionality
  - Expiry timer display

### 4. ForgotPasswordForm
- **Location**: `components/auth/forgot-password-form.tsx`
- **Features**:
  - Email input
  - Success confirmation with email display
  - Link expiry notice
  - Back to login button

### 5. ResetPasswordForm
- **Location**: `components/auth/reset-password-form.tsx`
- **Features**:
  - Token validation
  - New password input with strength meter
  - Password confirmation
  - Invalid token handling
  - Back to login link

---

## Email Templates

All emails are professionally styled with:
- SAGE branding (gradient background)
- Responsive design
- Clear call-to-action buttons
- Security notices
- Footer with copyright

### Templates:

1. **Welcome Email** - Sent on signup
2. **Verification PIN** - PIN embedded in email
3. **Password Reset Link** - Reset link with expiry notice
4. **Password Reset Success** - Confirmation after reset
5. **Account Locked Notification** - Too many login attempts

---

## Security Features

### Password Security
- ✅ Bcrypt hashing (12 rounds)
- ✅ Minimum 8 characters
- ✅ Must include: uppercase, lowercase, number, special character
- ✅ Passwords never returned in API responses

### Email Verification
- ✅ 6-digit PIN generation
- ✅ 10-minute expiry
- ✅ Maximum 5 attempts
- ✅ Can resend PIN
- ✅ One-time verification

### Rate Limiting
- ✅ Login: 5 attempts in 15 minutes
- ✅ 15-minute lockout after max attempts
- ✅ PIN: 5 attempts before new request needed

### Token Security
- ✅ Reset tokens are hashed and unique
- ✅ 1-hour expiry
- ✅ One-time use only
- ✅ Old tokens deleted on new request

### Data Protection
- ✅ Passwords selected from DB (not returned by default)
- ✅ Secure cookies (httpOnly, sameSite, secure in production)
- ✅ CSRF protection via Next.js
- ✅ Email case-insensitive handling
- ✅ No user enumeration leaks

---

## Configuration

### Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname

# Auth
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=http://localhost:3000

# Brevo Email Service
BREVO_API_KEY=<your-api-key>
BREVO_FROM_EMAIL=your-email@domain.com

# Frontend
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# PIN Configuration
PIN_LENGTH=6
PIN_EXPIRY_MINUTES=10
MAX_PIN_ATTEMPTS=5
```

---

## Usage Examples

### Complete Registration Flow

1. **User visits `/auth/signup`**
   - Fills signup form
   - Submits with email, name, password, role

2. **Backend processes registration**
   - Validates input
   - Checks for duplicate email
   - Hashes password
   - Creates User document
   - Generates PIN and token
   - Sends emails

3. **User redirected to `/auth/verify-pin?email=...`**
   - Receives PIN in email
   - Enters PIN in form
   - Backend verifies PIN
   - User status changed to ACTIVE

4. **User can now login**

### Complete Password Reset Flow

1. **User visits `/auth/forgot-password`**
   - Enters email
   - Receives reset link

2. **User visits reset link**
   - Token extracted from URL
   - Redirected to `/auth/reset-password?token=...`

3. **User enters new password**
   - Validation checks
   - Password updated
   - Token marked as used
   - Confirmation email sent

4. **User can login with new password**

---

## Testing Checklist

- [ ] User registration with valid data
- [ ] Duplicate email rejection
- [ ] Password validation (strength requirements)
- [ ] PIN verification with correct code
- [ ] PIN verification with incorrect code (attempts tracking)
- [ ] PIN resend functionality
- [ ] Login with correct credentials
- [ ] Login with incorrect password (rate limiting)
- [ ] Login with unverified email
- [ ] Forgot password flow
- [ ] Reset password with valid token
- [ ] Reset password with expired token
- [ ] Reset password token one-time use
- [ ] Account lockout after max attempts
- [ ] All email templates rendering correctly

---

## Future Enhancements

- [ ] OAuth integration (Google, GitHub)
- [ ] Two-factor authentication
- [ ] Session management with Redis
- [ ] Admin override capabilities
- [ ] User activity logging
- [ ] Security audit logging
- [ ] Account recovery via backup codes
- [ ] Password history tracking
- [ ] Biometric login options
- [ ] Multi-device session management

---

## Support

For issues or questions about the authentication system, refer to:
- `lib/auth/` - Validation and utility functions
- `lib/db/models.ts` - Database schema
- `lib/email/brevo.ts` - Email service
- `app/api/auth/` - API endpoints
- `components/auth/` - UI components
