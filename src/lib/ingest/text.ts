export function cleanText(value: unknown, maxLength = 280) {
  if (typeof value !== "string") {
    return "";
  }

  const decoded = value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  if (decoded.length <= maxLength) {
    return decoded;
  }

  return `${decoded.slice(0, maxLength - 1).trim()}…`;
}

export function normalizeUrl(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

export function sourceNameFromUrl(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return hostname
      .split(".")
      .slice(0, -1)
      .join(" ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  } catch {
    return "Verified source";
  }
}
