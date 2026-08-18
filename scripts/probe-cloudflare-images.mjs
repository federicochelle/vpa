const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim() ?? "";
const accountHash = process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH?.trim() ?? "";
const apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN?.trim() ?? "";

const endpoint = accountId
  ? `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`
  : "https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v1";

const variablesDetected = {
  accountId: Boolean(accountId),
  accountHash: Boolean(accountHash),
  apiToken: Boolean(apiToken),
};

if (!accountId || !accountHash || !apiToken) {
  const missingVariables = [
    !accountId ? "CLOUDFLARE_ACCOUNT_ID" : null,
    !accountHash ? "CLOUDFLARE_IMAGES_ACCOUNT_HASH" : null,
    !apiToken ? "CLOUDFLARE_IMAGES_API_TOKEN" : null,
  ].filter(Boolean);

  console.log(
    JSON.stringify(
      {
        ok: false,
        endpoint,
        status: null,
        variablesDetected,
        message: `Faltan variables de entorno de Cloudflare Images: ${missingVariables.join(", ")}.`,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

try {
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  const payload = await response.json().catch(() => null);
  const message = response.ok
    ? "Cloudflare Images conectado."
    : payload?.errors?.[0]?.message ??
      payload?.messages?.[0]?.message ??
      `Cloudflare respondió con status ${response.status}.`;

  console.log(
    JSON.stringify(
      {
        ok: response.ok,
        endpoint,
        status: response.status,
        variablesDetected,
        message,
      },
      null,
      2,
    ),
  );

  if (!response.ok) {
    process.exit(1);
  }
} catch (error) {
  console.log(
    JSON.stringify(
      {
        ok: false,
        endpoint,
        status: null,
        variablesDetected,
        message:
          error instanceof Error
            ? error.message
            : "No se pudo verificar Cloudflare Images.",
      },
      null,
      2,
    ),
  );
  process.exit(1);
}
