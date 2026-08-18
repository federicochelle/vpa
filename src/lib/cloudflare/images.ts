import "server-only";

interface CloudflareImagesEnv {
  accountId: string;
  accountHash: string;
  apiToken: string;
}

const CLOUDFLARE_PUBLIC_VARIANT = "public";

export interface CloudflareImagesProbeResult {
  ok: boolean;
  endpoint: string;
  status: number | null;
  variablesDetected: {
    accountId: boolean;
    accountHash: boolean;
    apiToken: boolean;
  };
  message: string;
}

export interface CloudflareDirectUploadUrlResult {
  imageId: string;
  uploadURL: string;
}

interface CloudflareApiResponse<T> {
  result?: T;
  success?: boolean;
  errors?: Array<{ code?: number; message?: string }>;
  messages?: Array<{ code?: number; message?: string }>;
}

function getCloudflareImagesEnvState() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim() ?? "";
  const accountHash = process.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH?.trim() ?? "";
  const apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN?.trim() ?? "";

  return {
    accountId,
    accountHash,
    apiToken,
  };
}

function getCloudflareImagesEnv(): CloudflareImagesEnv {
  const { accountId, accountHash, apiToken } = getCloudflareImagesEnvState();

  if (!accountId || !accountHash || !apiToken) {
    const missingVariables = [
      !accountId ? "CLOUDFLARE_ACCOUNT_ID" : null,
      !accountHash ? "CLOUDFLARE_IMAGES_ACCOUNT_HASH" : null,
      !apiToken ? "CLOUDFLARE_IMAGES_API_TOKEN" : null,
    ].filter(Boolean);

    throw new Error(
      `Faltan variables de entorno de Cloudflare Images: ${missingVariables.join(", ")}.`,
    );
  }

  return {
    accountId,
    accountHash,
    apiToken,
  };
}

export function getCloudflareImagesProbeMetadata() {
  const { accountId, accountHash, apiToken } = getCloudflareImagesEnvState();

  return {
    endpoint: accountId
      ? `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`
      : "https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v1",
    variablesDetected: {
      accountId: Boolean(accountId),
      accountHash: Boolean(accountHash),
      apiToken: Boolean(apiToken),
    },
  };
}

function getCloudflareImagesApiBaseUrl(accountId: string) {
  return `https://api.cloudflare.com/client/v4/accounts/${accountId}/images`;
}

function getCloudflareErrorMessage(
  payload: CloudflareApiResponse<unknown> | null,
  fallbackStatus: number | null,
) {
  return (
    payload?.errors?.[0]?.message ??
    payload?.messages?.[0]?.message ??
    (fallbackStatus
      ? `Cloudflare respondió con status ${fallbackStatus}.`
      : "Cloudflare devolvió una respuesta inválida.")
  );
}

export function buildCloudflareImageUrl(
  imageId: string,
  variant = CLOUDFLARE_PUBLIC_VARIANT,
) {
  const { accountHash } = getCloudflareImagesEnv();
  return `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`;
}

export async function createCloudflareDirectUploadUrl(
  metadata?: Record<string, unknown>,
): Promise<CloudflareDirectUploadUrlResult> {
  const { accountId, apiToken } = getCloudflareImagesEnv();
  const endpoint = `${getCloudflareImagesApiBaseUrl(accountId)}/v2/direct_upload`;
  const formData = new FormData();

  if (metadata && Object.keys(metadata).length > 0) {
    formData.set("metadata", JSON.stringify(metadata));
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
    body: formData,
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as CloudflareApiResponse<{
    id?: string;
    uploadURL?: string;
  }> | null;

  if (!response.ok || !payload?.success || !payload.result?.id || !payload.result.uploadURL) {
    throw new Error(getCloudflareErrorMessage(payload, response.status));
  }

  return {
    imageId: payload.result.id,
    uploadURL: payload.result.uploadURL,
  };
}

export async function deleteCloudflareImage(imageId: string) {
  const { accountId, apiToken } = getCloudflareImagesEnv();
  const endpoint = `${getCloudflareImagesApiBaseUrl(accountId)}/v1/${imageId}`;
  const response = await fetch(endpoint, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as CloudflareApiResponse<unknown> | null;

  if (!response.ok || payload?.success === false) {
    throw new Error(getCloudflareErrorMessage(payload, response.status));
  }
}

export async function probeCloudflareImagesConnection(): Promise<CloudflareImagesProbeResult> {
  const metadata = getCloudflareImagesProbeMetadata();

  try {
    const { accountId, apiToken } = getCloudflareImagesEnv();
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`;

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      method: "GET",
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          errors?: Array<{ message?: string }>;
          messages?: Array<{ message?: string }>;
          success?: boolean;
        }
      | null;

    if (!response.ok) {
      const message =
        payload?.errors?.[0]?.message ??
        payload?.messages?.[0]?.message ??
        `Cloudflare respondió con status ${response.status}.`;

      return {
        ok: false,
        endpoint,
        status: response.status,
        variablesDetected: metadata.variablesDetected,
        message,
      };
    }

    return {
      ok: true,
      endpoint,
      status: response.status,
      variablesDetected: metadata.variablesDetected,
      message: "Cloudflare Images conectado.",
    };
  } catch (error) {
    return {
      ok: false,
      endpoint: metadata.endpoint,
      status: null,
      variablesDetected: metadata.variablesDetected,
      message:
        error instanceof Error ? error.message : "No se pudo verificar Cloudflare Images.",
    };
  }
}
