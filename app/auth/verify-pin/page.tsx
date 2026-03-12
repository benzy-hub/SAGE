// app/auth/verify-pin/page.tsx
import { Suspense } from "react";
import { VerifyPinForm } from "@/components/auth/verify-pin-form";

export const metadata = {
  title: "Verify Email - SAGE",
  description: "Verify your email address",
};

export default function VerifyPinPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyPinForm />
    </Suspense>
  );
}
