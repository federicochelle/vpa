import { createClient } from "@supabase/supabase-js";

const INVITE_REDIRECT_URL = "https://www.vpa.com.uy/auth/invite";
const emails = process.argv.slice(2).map((email) => email.trim().toLowerCase());

if (emails.length !== 2 || emails.some((email) => !email || !email.includes("@"))) {
  console.error("Uso: npm run auth:invite -- cliente1@ejemplo.com cliente2@ejemplo.com");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local.",
  );
  process.exit(1);
}

if (serviceRoleKey === publicKey || serviceRoleKey.startsWith("sb_publishable_")) {
  console.error(
    "SUPABASE_SERVICE_ROLE_KEY contiene una clave pública. El script se detuvo sin ejecutar invitaciones.",
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

async function assertProfileTableAccess() {
  const { error } = await supabase.from("profiles").select("id").limit(1);

  if (!error) {
    return;
  }

  if (error.code === "42501" || error.message.toLowerCase().includes("permission denied")) {
    throw new Error(
      "La clave secreta fue cargada, pero service_role no tiene permisos sobre public.profiles. No se ejecutaron invitaciones. Otorgá únicamente SELECT e INSERT a service_role sobre esa tabla y reintentá.",
    );
  }

  throw new Error(`No se pudo verificar el acceso a public.profiles: ${error.message}`);
}

async function listAuthUsers() {
  const users = [];
  const perPage = 1000;

  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });

    if (error) {
      throw new Error(`No se pudieron verificar los usuarios existentes: ${error.message}`);
    }

    users.push(...data.users);

    if (data.users.length < perPage) {
      return users;
    }
  }
}

async function ensureAdminProfile(user, email) {
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
    email: user.email ?? email,
    role: "admin",
  });

  if (profileInsertError) {
    throw new Error(`No se pudo crear el perfil: ${profileInsertError.message}`);
  }

  return "admin";
}

async function generateUserLink(email, type) {
  const { data, error } = await supabase.auth.admin.generateLink({
    type,
    email,
    // Supabase Auth expects redirectTo inside the type-specific options object.
    options: {
      redirectTo: INVITE_REDIRECT_URL,
    },
  });

  if (error || !data?.user || !data.properties?.action_link) {
    throw new Error(error?.message ?? `Supabase no devolvió un enlace ${type}.`);
  }

  if (data.properties.redirect_to !== INVITE_REDIRECT_URL) {
    throw new Error(
      `Supabase devolvió un redirect_to inesperado (${data.properties.redirect_to ?? "vacío"}). No se imprimió el enlace.`,
    );
  }

  return { user: data.user, actionLink: data.properties.action_link };
}

async function prepareUser(email, existingUser) {
  if (existingUser) {
    const role = await ensureAdminProfile(existingUser, email);
    const { actionLink } = await generateUserLink(email, "recovery");

    return {
      email,
      linkType: "recovery",
      role,
      userId: existingUser.id,
      actionLink,
    };
  }

  const { user, actionLink } = await generateUserLink(email, "invite");
  const role = await ensureAdminProfile(user, email);

  return {
    email,
    linkType: "invite",
    role,
    userId: user.id,
    actionLink,
  };
}

try {
  await assertProfileTableAccess();
} catch (error) {
  console.error(error instanceof Error ? error.message : "No se pudo validar el acceso a public.profiles.");
  process.exit(1);
}

let authUsers;

try {
  authUsers = await listAuthUsers();
} catch (error) {
  console.error(error instanceof Error ? error.message : "No se pudieron verificar los usuarios existentes.");
  process.exit(1);
}

let hasErrors = false;

for (const email of emails) {
  try {
    const existingUser = authUsers.find(
      (user) => user.email?.trim().toLowerCase() === email,
    );
    const result = await prepareUser(email, existingUser);
    console.log(`\nEnlace ${result.linkType} preparado para ${result.email}`);
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
