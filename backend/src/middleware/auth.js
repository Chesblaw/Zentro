const jwtService = require("../config/index");
const User = require("../database/models/user");

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
        code: "TOKEN_MISSING",
      });
    }

    const token = jwtService.jwt.extractTokenFromHeader(authHeader);
    const decoded = jwtService.jwt.verifyAccessToken(token);

    // Check token blacklist BEFORE loading user
    const tokenBlacklist = jwtService.tokenBlacklist;
    if (await tokenBlacklist.isBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        message: "Token revoked",
        code: "TOKEN_REVOKED",
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "User account is inactive",
        code: "USER_INACTIVE",
      });
    }

    req.user = user;
    req.token = token;

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email address",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    // Prevent access with old tokens after password reset
    if (
      user.passwordChangedAt &&
      decoded.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)
    ) {
      return res.status(403).json({
        success: false,
        message: "Token invalid due to password change",
        code: "TOKEN_INVALIDATED",
      });
    }

    return next();

  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error.message?.toLowerCase().includes("expired")) {
      return res.status(403).json({
        success: false,
        message: "Access token expired",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(403).json({
      success: false,
      message: "Invalid access token",
      code: "TOKEN_INVALID",
    });
  }
};

const requireGuest = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    try {
      const token = jwtService.jwt.extractTokenFromHeader(authHeader);
      jwtService.jwt.verifyAccessToken(token);

      return res.status(400).json({
        success: false,
        message: "Already authenticated",
        code: "ALREADY_AUTHENTICATED",
      });
    } catch (_) {}
  }

  next();
};

const requireOwnership = (req, res, next) => {
  if (
    req.params.userId &&
    req.user &&
    req.params.userId !== req.user._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
      code: "FORBIDDEN",
    });
  }

  next();
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        code: "ACCESS_DENIED",
      });
    }
    next();
  };
};

module.exports = {
  requireAuth,
  requireGuest,
  requireOwnership,
  requireRole,
};
