// components/auth/verify-pin-form.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function VerifyPinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [pin, setPin] = useState("");
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (pin.length !== 6) {
      setError("PIN must be 6 digits");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid PIN");
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        return;
      }

      if (data.pendingApproval) {
        setPendingApproval(true);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login?verified=true");
      }, 1500);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendPin = async () => {
    setError(null);
    setIsResending(true);

    try {
      const res = await fetch("/api/auth/resend-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend PIN");
        return;
      }

      setPin("");
      setError(null);
      alert("PIN resent to your email");
    } catch (err) {
      setError("Failed to resend PIN. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (pendingApproval) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold">Email Verified!</h2>
        <p className="text-muted-foreground">
          Your advisor account is now <strong>pending admin approval</strong>.
          You&apos;ll receive an email once your account is activated.
        </p>
        <p className="text-sm text-muted-foreground">
          Already approved?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="text-foreground hover:text-primary underline underline-offset-4 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold">Email Verified!</h2>
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Verify Your Email
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Enter the 6-digit code we sent to {email}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="pin">Verification Code</Label>
          <Input
            id="pin"
            type="text"
            inputMode="numeric"
            placeholder="000000"
            className="sage-auth-input text-center text-2xl tracking-widest font-mono"
            value={pin}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
              setPin(value);
            }}
            maxLength={6}
            required
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Code expires in 10 minutes. {attemptsRemaining} attempts remaining.
          </p>
        </div>

        <Button
          type="submit"
          disabled={isLoading || pin.length !== 6}
          className="w-full sage-auth-btn"
        >
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Verifying...
            </>
          ) : (
            "Verify Code"
          )}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-foreground/20" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleResendPin}
          disabled={isResending || isLoading}
          className="w-full sage-auth-btn-outline"
        >
          {isResending ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Sending...
            </>
          ) : (
            "Resend Code"
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Wrong email?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/signup")}
            className="text-foreground hover:text-primary underline underline-offset-4 font-medium"
          >
            Create a new account
          </button>
        </p>
      </form>
    </div>
  );
}
