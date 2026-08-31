import Image from "next/image";
import { loginAction } from "@/features/auth/auth.actions";
import logoVpa from "../../../logovpa.webp";

export function LoginForm() {
  return (
    <form
      action={loginAction}
      className="rounded-[24px] border border-primary-strong bg-primary p-6 text-white shadow-[0_14px_40px_rgba(39,39,39,0.05)] sm:p-8"
    >
      <div className="flex justify-center">
        <Image
          alt="VPA"
          className="h-auto w-96"
          priority
          src={logoVpa}
        />
      </div>
      <div className="mt-8 grid gap-6">
        <label className="flex flex-col gap-2" htmlFor="email">
          <span className="type-body-compact font-medium text-white">Email</span>
          <input
            className="type-input w-full rounded-2xl border border-white bg-white px-4 py-3 text-foreground outline-none transition placeholder:text-muted focus:border-white focus:ring-4 focus:ring-white/20"
            id="email"
            name="email"
            required
            type="email"
          />
        </label>
        <label className="flex flex-col gap-2" htmlFor="password">
          <span className="type-body-compact font-medium text-white">Contrasena</span>
          <input
            className="type-input w-full rounded-2xl border border-white bg-white px-4 py-3 text-foreground outline-none transition placeholder:text-muted focus:border-white focus:ring-4 focus:ring-white/20"
            id="password"
            name="password"
            required
            type="password"
          />
        </label>
      </div>
      <div className="mt-8">
        <button
          className="button-primary inline-flex w-full justify-center"
          type="submit"
        >
          Ingresar
        </button>
      </div>
    </form>
  );
}
