"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LoginButton() {
  return (
    <Button size="lg" onClick={() => signIn("instagram", { callbackUrl: "/dashboard" })}>
      Entrar com Instagram
    </Button>
  );
}
