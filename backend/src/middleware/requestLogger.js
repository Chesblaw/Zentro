const chalk = require("chalk");

/**
 * Logs incoming HTTP requests with response status,
 * execution time, method, url, and caller info.
 */
const requestLogger = (req, res, next) => {
  const startStamp = process.hrtime.bigint();

  res.on("finish", () => {
    const endStamp = process.hrtime.bigint();
    const durationMs = Number(endStamp - startStamp) / 1_000_000;

    const method = req.method;
    const endpoint = req.originalUrl;
    const ipAddr = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"] || "unknown";

    const status = res.statusCode;

    const color =
      status >= 500
        ? chalk.red
        : status >= 400
        ? chalk.yellow
        : chalk.green;

    const logLine = [
      `${chalk.cyan(method)}`,
      `${endpoint}`,
      `→ ${color(status)}`,
      `${chalk.magenta(durationMs.toFixed(2) + "ms")}`,
      `${chalk.gray(`IP: ${ipAddr}`)}`,
      `${chalk.gray(`UA: ${userAgent}`)}`,
    ].join(" | ");

    console.log(logLine);
  });

  next();
};

module.exports = requestLogger;
