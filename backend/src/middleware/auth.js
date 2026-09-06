import { db } from "../config/db.js";
import { env } from "../config/env.js";
import { AppError, asyncHandler } from "../utils/helpers.js";
import { verifyToken } from "../utils/auth.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[env.cookieName];

  if (!token) {
    throw new AppError("Authentication required.", 401);
  }

  let payload;

  try {
    payload = verifyToken(token);
  } catch {
    throw new AppError(
      "Invalid or expired session. Please log in again.",
      401
    );
  }

  const userDoc = await db
    .collection("teachers")
    .doc(payload.userId)
    .get();

  if (!userDoc.exists) {
    throw new AppError("User no longer exists.", 401);
  }

  req.user = {
    id: userDoc.id,
    ...userDoc.data(),
  };

  next();
});

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(
        new AppError(
          "You do not have permission to perform this action.",
          403
        )
      );
      return;
    }

    next();
  };
}

export const requireAdmin = authorize("admin");

export const optionalDeviceOrAuth = asyncHandler(async (req, res, next) => {
  const deviceKey = req.header("x-device-key");

  if (deviceKey) {
    if (deviceKey !== env.deviceApiKey) {
      throw new AppError("Invalid device key.", 401);
    }

    req.isDevice = true;
    next();
    return;
  }

  return authenticate(req, res, next);
});