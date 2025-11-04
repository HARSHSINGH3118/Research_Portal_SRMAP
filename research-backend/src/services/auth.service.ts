import { UserModel } from "../models/user.model";
import bcrypt from "bcrypt";
import { signAccessToken, signRefreshToken } from "../utils/tokens";

/**
 * Registers a new user
 * Supports multiple roles + optional contactNumber
 */
export const registerUser = async (
  name: string,
  email: string,
  password: string,
  roles: string[],
  contactNumber?: string // ✅ optional
) => {
  const existing = await UserModel.findOne({ email });
  if (existing) throw new Error("Email already registered");

  const hashed = await bcrypt.hash(password, 10);

  // ✅ Normalize roles (ensure lowercase array)
  const normalizedRoles = Array.isArray(roles)
    ? roles.map((r) => r.toLowerCase())
    : [String(roles).toLowerCase()];

  const user = await UserModel.create({
    name,
    email,
    password: hashed,
    roles: normalizedRoles,
    contactNumber: contactNumber || undefined, // ✅ save only if given
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    roles: user.roles,
    contactNumber: user.contactNumber || null, // ✅ return it safely
  };
};

/**
 * Logs in an existing user
 */
export const loginUser = async (email: string, password: string) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new Error("Invalid email or password");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid email or password");

  const payload = { userId: user._id.toString(), roles: user.roles };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      contactNumber: user.contactNumber || null, // ✅ return here too
    },
  };
};
