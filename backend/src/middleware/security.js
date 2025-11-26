const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");

// ─────────────────────────────────────────
// Local audit log store (replace with DB/logger in prod)
// ─────────────────────────────────────────
const activityLogStore = [];

// Audit trail middleware
const recordActivity = (req, res, next) => {
  const requestStart = process.hrtime.bigint();

  res.on("finish", () => {
    const requestEnd = process.hrtime.bigint();
    const msSpent = Number(requestEnd - requestStart) / 1_000_000;

    const uid =
      req.headers["x-user-id"] ||
      req.body?.userId ||
      req.user?._id ||
      "guest";

    const logEntry = {
      at: new Date(),
      userId: uid,
      event: `${req.method} ${req.originalUrl}`,
      outcome: res.statusCode < 400 ? "OK" : "ERROR",
      info: {
        ip: req.ip,
        statusCode: res.statusCode,
        durationMs: msSpent,
        params: req.params,
        query: req.query,
      },
    };

    activityLogStore.push(logEntry);

    console.log(
      `AUDIT | ${logEntry.at.toISOString()} | ${logEntry.userId} | ${logEntry.event} | ${logEntry.outcome} | ${msSpent.toFixed(
        2
      )}ms`
    );
  });

  next();
};

// helper to access audit logs (for internal systems only)
const fetchActivityLogs = () => activityLogStore;

// ─────────────────────────────────────────
// MAIN SECURITY MIDDLEWARE BUNDLE
// ─────────────────────────────────────────
const securityLayer = [
  // 1️⃣ Security headers (helmet)
  helmet(),

  // 2️⃣ Content Security Policy (CSP) — strict, customisable
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://trusted.cdn.com"], // Modify for your environment
      imgSrc: ["'self'", "data:", "https://images.cdn.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      connectSrc: ["'self'", "https://api.yourapp.dev"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"], // prevent clickjacking
      upgradeInsecureRequests: [],
    },
  }),

  // 3️⃣ Prevent NoSQL injection
  mongoSanitize(),

  // 4️⃣ Prevent XSS attacks
  xssClean(),

  // 5️⃣ Clickjacking protection
  helmet.frameguard({ action: "deny" }),

  // 6️⃣ Disable client-side caching for sensitive endpoints
  helmet.noCache(),

  // 7️⃣ Enforce HSTS – HTTPS only (enable only if HTTPS is enabled!)
  helmet.hsts({
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  }),

  // 8️⃣ Prevent sniffing attacks
  helmet.noSniff(),

  // 9️⃣ Secure referrer policy
  helmet.referrerPolicy({ policy: "strict-origin-when-cross-origin" }),

  // 🔟 Audit logging 
  recordActivity,
];

module.exports = {
  securityLayer,
  recordActivity,
  fetchActivityLogs,
};
