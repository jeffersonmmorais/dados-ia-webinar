import type { APIRoute } from "astro";
import { checkRateLimit } from "../../lib/rate-limit";
import { validateSignup } from "../../lib/validation";

export const prerender = false;

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!isSameOrigin(request)) {
    return json({ message: "Origem da requisição não permitida." }, 403);
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    return json({ message: "Formato de requisição inválido." }, 415);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 12_000) {
    return json({ message: "Requisição muito grande." }, 413);
  }

  const ip = getClientIp(request, clientAddress);
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        message: "Muitas tentativas. Aguarde alguns minutos e tente novamente."
      }),
      {
        status: 429,
        headers: {
          ...JSON_HEADERS,
          "Retry-After": String(rateLimit.retryAfter)
        }
      }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ message: "Não foi possível interpretar os dados enviados." }, 400);
  }

  const { data, fields } = validateSignup(payload);

  // Bots tendem a preencher este campo invisível. Uma resposta neutra evita adaptação.
  if (data.website) {
    return json({ success: true }, 200);
  }

  if (Object.keys(fields).length > 0) {
    return json(
      {
        message: "Revise os campos destacados.",
        fields
      },
      422
    );
  }

  const apiKey = getEnv("BREVO_API_KEY");
  const listId = Number.parseInt(getEnv("BREVO_LIST_ID") || "", 10);

  if (!apiKey || !Number.isInteger(listId) || listId <= 0) {
    console.error("BREVO_API_KEY ou BREVO_LIST_ID não configurado.");
    return json(
      { message: "As inscrições estão temporariamente indisponíveis." },
      503
    );
  }

  const nameAttribute = validAttribute(
    getEnv("BREVO_NAME_ATTRIBUTE"),
    "FIRSTNAME"
  );
  const lastNameAttribute = validAttribute(
    getEnv("BREVO_LASTNAME_ATTRIBUTE"),
    "LASTNAME"
  );
  const nameParts = splitFullName(data.name);
  const attributes: Record<string, string> = {
    [nameAttribute]: nameParts.firstName,
    [lastNameAttribute]: nameParts.lastName
  };

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify({
        email: data.email,
        attributes,
        listIds: [listId],
        updateEnabled: true
      }),
      signal: AbortSignal.timeout(10_000)
    });

    if (!response.ok) {
      const brevoRequestId = response.headers.get("x-request-id");
      console.error("Falha na Brevo", {
        status: response.status,
        requestId: brevoRequestId
      });

      return json(
        { message: "Não foi possível concluir agora. Tente novamente em instantes." },
        502
      );
    }

    return json({ success: true }, 201);
  } catch (error) {
    console.error(
      "Erro de conexão com a Brevo:",
      error instanceof Error ? error.message : "erro desconhecido"
    );
    return json(
      { message: "Não foi possível concluir agora. Tente novamente em instantes." },
      502
    );
  }
};

export const ALL: APIRoute = () =>
  new Response(null, {
    status: 405,
    headers: {
      "Allow": "POST",
      "Cache-Control": "no-store"
    }
  });

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS
  });
}

function validAttribute(value: string | undefined, fallback: string) {
  return value && /^[A-Z][A-Z0-9_]{0,49}$/.test(value) ? value : fallback;
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts.shift() || fullName;
  const lastName = parts.join(" ");

  return { firstName, lastName };
}

function getClientIp(request: Request, clientAddress: string) {
  if (getEnv("TRUST_PROXY") === "true") {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
      return forwarded.split(",")[0]?.trim() || clientAddress;
    }
  }

  return clientAddress;
}

function getEnv(name: string) {
  const astroEnv = import.meta.env as Record<string, string | undefined>;
  return process.env[name] || astroEnv[name];
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) {
    return true;
  }

  try {
    const requestUrl = new URL(request.url);
    return new URL(origin).host === requestUrl.host;
  } catch {
    return false;
  }
}
