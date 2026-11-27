export const COUNTRY_OPTIONS = [
  { code: "BR", ddi: "55", label: "Brasil", flag: "🇧🇷", lengths: [10, 11] },
  { code: "PT", ddi: "351", label: "Portugal", flag: "🇵🇹", lengths: [9] },
  { code: "US", ddi: "1", label: "Estados Unidos", flag: "🇺🇸", lengths: [10] },
] as const;

export type CountryCode = (typeof COUNTRY_OPTIONS)[number]["code"];

type EmailResult = { ok: true; email: string; domain: string } | { ok: false; message: string };
type PhoneResult = { ok: true; e164: string; country: CountryCode } | { ok: false; message: string };

const DISPOSABLE_DOMAINS = new Set([
  "10minutemail.com", "10minutemail.net", "20minutemail.com", "anonbox.net", "bugmenot.com",
  "burnermail.io", "dispostable.com", "emailondeck.com", "fakeinbox.com", "getnada.com",
  "guerrillamail.com", "guerrillamail.net", "harakirimail.com", "inboxbear.com", "mail-temporaire.fr",
  "maildrop.cc", "mailinator.com", "mailnesia.com", "mintemail.com", "mohmal.com", "mytemp.email",
  "nada.email", "sharklasers.com", "temp-mail.org", "tempail.com", "tempmail.address", "tempmail.dev",
  "tempmail.net", "tempmailo.com", "tempmail.plus", "throwawaymail.com", "trashmail.com", "trashmail.de",
  "trashmail.me", "yopmail.com", "yopmail.fr", "zebra.email",
]);

const DOMAIN_TYPOS: Record<string, string> = {
  "gmal.com": "gmail.com", "gmial.com": "gmail.com", "gmail.co": "gmail.com", "gmail.cm": "gmail.com",
  "gamil.com": "gmail.com", "gnail.com": "gmail.com", "hotmial.com": "hotmail.com", "hotmal.com": "hotmail.com",
  "hotmail.co": "hotmail.com", "hotmail.cm": "hotmail.com", "outlok.com": "outlook.com", "outloo.com": "outlook.com",
  "outlook.co": "outlook.com", "iclould.com": "icloud.com", "icloud.co": "icloud.com", "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com", "yahoo.co": "yahoo.com", "uol.com": "uol.com.br",
};

export function validateEmail(input: string): EmailResult {
  const email = input.trim().toLowerCase();
  if (!email) return { ok: false, message: "Informe seu e-mail." };
  if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { ok: false, message: "Informe um e-mail válido, como nome@exemplo.com." };
  }
  const [local, domain] = email.split("@") as [string, string];
  if (
    local.length > 64 || local.startsWith(".") || local.endsWith(".") || local.includes("..") ||
    domain.startsWith(".") || domain.endsWith(".") || domain.includes("..") ||
    !/^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/.test(domain)
  ) return { ok: false, message: "Revise a estrutura do e-mail informado." };

  if (DISPOSABLE_DOMAINS.has(domain)) return { ok: false, message: "Use um e-mail pessoal ou acadêmico permanente, não um e-mail temporário." };
  const suggestion = DOMAIN_TYPOS[domain];
  if (suggestion) return { ok: false, message: `Você quis dizer ${local}@${suggestion}? Revise o endereço.` };
  return { ok: true, email, domain };
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatWhatsApp(country: CountryCode, input: string) {
  const config = COUNTRY_OPTIONS.find((item) => item.code === country) ?? COUNTRY_OPTIONS[0];
  const digits = onlyDigits(input).slice(0, Math.max(...config.lengths));
  if (country === "BR") {
    if (digits.length <= 2) return digits ? `(${digits}` : "";
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }
  if (country === "PT") return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)].filter(Boolean).join(" ");
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

function obviouslyFictional(national: string) {
  if (/^(\d)\1+$/.test(national)) return true;
  const sequences = ["0123456789", "1234567890", "9876543210", "1098765432"];
  return sequences.some((sequence) => sequence.includes(national) || national.includes(sequence));
}

export function validateWhatsApp(country: CountryCode, input: string): PhoneResult {
  const national = onlyDigits(input);
  const config = COUNTRY_OPTIONS.find((item) => item.code === country) ?? COUNTRY_OPTIONS[0];
  if (!config.lengths.includes(national.length as never)) {
    return { ok: false, message: `Confira o número: o formato para ${config.label} está incompleto.` };
  }
  if (obviouslyFictional(country === "BR" ? national.slice(2) : national)) return { ok: false, message: "Informe um número real; sequências e dígitos repetidos não são aceitos." };
  if (country === "BR") {
    const area = Number(national.slice(0, 2));
    if (area < 11 || ![1, 2, 3, 4, 5, 6, 7, 8, 9].includes(Number(national[2]))) {
      return { ok: false, message: "Revise o DDD e o número informados." };
    }
    if (national.length === 11 && national[2] !== "9") return { ok: false, message: "Para celular no Brasil, use DDD + 9 + 8 dígitos." };
  }
  if (country === "PT" && national[0] !== "9") return { ok: false, message: "Para WhatsApp em Portugal, informe um celular com 9 dígitos iniciado por 9." };
  if (country === "US" && (national[0] === "0" || national[0] === "1" || national[3] === "0" || national[3] === "1")) {
    return { ok: false, message: "Revise o código de área e o número dos Estados Unidos." };
  }
  return { ok: true, e164: `+${config.ddi}${national}`, country };
}
