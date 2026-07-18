import jwt from "jsonwebtoken";

const COOKIE_NAME = "8waves_admin_session";
const SECRET = process.env.JWT_SECRET;

export function signAdminToken(payload) {
  if (!SECRET) throw new Error("JWT_SECRET is not set.");
  return jwt.sign(payload, SECRET, { expiresIn: "12h" });
}

export function verifyAdminToken(token) {
  if (!SECRET) throw new Error("JWT_SECRET is not set.");
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

export function getSessionFromRequest(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export { COOKIE_NAME };
