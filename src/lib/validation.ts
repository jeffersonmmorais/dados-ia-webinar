export interface SignupInput {
  name: string;
  email: string;
  website: string;
  consent: boolean;
}

export interface ValidationResult {
  data: SignupInput;
  fields: Record<string, string>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateSignup(payload: unknown): ValidationResult {
  const source = isRecord(payload) ? payload : {};
  const data: SignupInput = {
    name: cleanText(source.name, 100),
    email: cleanText(source.email, 254).toLowerCase(),
    website: cleanText(source.website, 200),
    consent: source.consent === true || source.consent === "on"
  };
  const fields: Record<string, string> = {};

  if (data.name.length < 3 || !data.name.includes(" ")) {
    fields.name = "Informe seu nome e sobrenome.";
  }

  if (!EMAIL_PATTERN.test(data.email)) {
    fields.email = "Informe um e-mail válido.";
  }

  if (!data.consent) {
    fields.consent = "Confirme o consentimento para concluir.";
  }

  return { data, fields };
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
