import { FormField } from "@/components/ui/form-field";
import { loginAction } from "@/features/auth/auth.actions";

export function LoginForm() {
  return (
    <form action={loginAction} className="panel p-6 sm:p-8">
      <div className="grid gap-6">
        <FormField htmlFor="email" label="Email">
          <input
            className="input-base"
            id="email"
            name="email"
            required
            type="email"
          />
        </FormField>
        <FormField htmlFor="password" label="Contrasena">
          <input
            className="input-base"
            id="password"
            name="password"
            required
            type="password"
          />
        </FormField>
      </div>
      <div className="mt-8">
        <button className="button-primary w-full justify-center" type="submit">
          Ingresar
        </button>
      </div>
    </form>
  );
}
