import { customAlphabet } from "nanoid";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const generate = customAlphabet(alphabet, 6);

export function generateSlug() {
  return generate();
}

export function normalizeSlug(value: string) {
  return value.trim();
}

export function isValidSlug(value: string) {
  return /^[a-zA-Z0-9_-]{3,64}$/.test(value);
}
