"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { masuk } from "@/app/admin/actions";

const stateAwal = { error: null };

export default function FormLogin() {
  const [state, action, isPending] = useActionState(masuk, stateAwal);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      {state?.error && (
        <p role="alert" className="text-sm text-bahaya">
          {state.error}
        </p>
      )}
      <Tombol type="submit" disabled={isPending}>
        {isPending ? "Memproses..." : "Masuk"}
      </Tombol>
    </form>
  );
}

