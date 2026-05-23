import { createHmac, timingSafeEqual } from "node:crypto";

export const adminCookieName = "replypilot_admin";

const tokenPayload = "replypilot-admin-session";

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() ?? "";
}

export function isAdminConfigured() {
  const password = getAdminPassword();
  return password.length >= 8 && password !== "change-this-admin-password";
}

export function createAdminToken() {
  return createHmac("sha256", getAdminPassword()).update(tokenPayload).digest("hex");
}

export function isValidAdminToken(value: string | undefined) {
  if (!value || !isAdminConfigured()) return false;

  const expected = createAdminToken();
  const providedBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(providedBuffer, expectedBuffer);
}
