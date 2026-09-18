const requiredVariables = ["DB_HOST", "DB_USER", "DB_NAME", "JWT_SECRET"];

const isPlaceholder = (value) => /^(change|replace|example|your[_-])/i.test(value);

const validateEnvironment = () => {
  const missing = requiredVariables.filter((name) => !String(process.env[name] || "").trim());
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  const jwtSecret = process.env.JWT_SECRET.trim();
  if (jwtSecret.length < 32 || isPlaceholder(jwtSecret)) {
    throw new Error("JWT_SECRET must be a non-placeholder value with at least 32 characters.");
  }

  const adminEmails = String(process.env.ADMIN_EMAILS || "").trim();
  const bootstrapSecret = String(process.env.ADMIN_BOOTSTRAP_SECRET || "").trim();
  if (adminEmails && (bootstrapSecret.length < 32 || isPlaceholder(bootstrapSecret))) {
    throw new Error(
      "ADMIN_BOOTSTRAP_SECRET must be a separate non-placeholder value with at least 32 characters."
    );
  }

  if (process.env.NODE_ENV === "production" && !process.env.CORS_ORIGINS) {
    throw new Error("CORS_ORIGINS is required in production.");
  }
};

module.exports = { validateEnvironment };
