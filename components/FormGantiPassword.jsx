"use client";

import { useActionState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { gantiPassword } from "@/app/admin/actions";

const stateAwal = { error: null, sukses: null };

export default function FormGantiPassword() {
  const [state, action, isPending] = useActionState(gantiPassword, stateAwal);

  return (
    <form action={action} className="flex max-w-sm flex-col gap-4">
      <Input
        label="Password baru"
        name="password_baru"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        key={state?.sukses ?? "password_baru"}
      />
      <Input
        label="Ulangi password baru"
        name="konfirmasi_password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        key={state?.sukses ? "konfirmasi_sukses" : "konfirmasi_password"}
      />
      {state?.error && (
        <p role="alert" className="text-sm text-bahaya">
          {state.error}
        </p>
      )}
      {state?.sukses && (
        <p role="status" className="text-sm text-utama">
          {state.sukses}
        </p>
      )}
      <Tombol type="submit" disabled={isPending} className="self-start">
        {isPending ? "Menyimpan..." : "Simpan password"}
      </Tombol>
    </form>
  );
}

