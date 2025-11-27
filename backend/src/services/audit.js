// src/services/audit.js
class AuditService {
  log({ action, userId, metadata = {} }) {
    console.log(`[AUDIT] Action: ${action}, User: ${userId}, Metadata:`, metadata);
    // TODO: save to DB or external audit log if needed
  }
}

module.exports = new AuditService();
