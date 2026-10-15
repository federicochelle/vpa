import { createClient } from "@supabase/supabase-js";

const INVITE_REDIRECT_URL = "https://vpa.com.uy/auth/invite";
const emails = process.argv.slice(2).map((email) => email.trim().toLowerCase());

if (emails.length !== 2 || emails.some((email) => !email || !email.includes("@"))) {
  console.error("Uso: npm run auth:invite -- cliente1@ejemplo.com cliente2@ejemplo.com");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

async function ensureEditorProfile(user) {
  const { data: existingProfile, error: profileReadError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileReadError) {
    throw new Error(`No se pudo verificar el perfil: ${profileReadError.message}`);
  }

  if (existingProfile) {
    return existingProfile.role;
  }

  const { error: profileInsertError } = await supabase.from("profiles").insert({
    id: user.id,
    email: user.email ?? "",
    role: "editor",
  });

  if (profileInsertError) {
    throw new Error(`No se pudo crear el perfil: ${profileInsertError.message}`);
  }

  return "editor";
}

async function inviteUser(email) {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "invite",
    email,
    options: {
      redirectTo: INVITE_REDIRECT_URL,
    },
  });

  if (error || !data?.user || !data.properties?.action_link) {
    throw new Error(error?.message ?? "Supabase no devolvió un enlace de invitación.");
  }

  const role = await ensureEditorProfile(data.user);

  return {
    email,
    role,
    userId: data.user.id,
    actionLink: data.properties.action_link,
  };
}

let hasErrors = false;

for (const email of emails) {
  try {
    const result = await inviteUser(email);
    console.log(`\nInvitación preparada para ${result.email}`);
    console.log(`Usuario: ${result.userId}`);
    console.log(`Rol: ${result.role}`);
    console.log(`Enlace para WhatsApp: ${result.actionLink}`);
  } catch (error) {
    hasErrors = true;
    console.error(
      `\nNo se pudo preparar la invitación para ${email}: ${
        error instanceof Error ? error.message : "error desconocido"
      }`,
    );
  }
}

if (hasErrors) {
  process.exitCode = 1;
}
