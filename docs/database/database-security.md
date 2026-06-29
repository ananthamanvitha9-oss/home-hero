# MongoDB Database Security Specification - HomeHero

**Prepared by**: Database Security Architect  
**Target Audience**: Security Engineers, Database Administrators, & DevOps Teams  
**Focus**: Authentication protocols, transit/rest encryption, injection mitigations, and secrets management

---

## 1. Authentication & Network Access Control

To protect our MongoDB Atlas cluster from unauthorized external access, HomeHero enforces a zero-trust network policy:

### 1.1 IP Access Lists & VPC Peering
- **IP Restrictions**: Database access is restricted to the specific IP addresses of our production servers (e.g. Render Web API nodes). Direct access from external IPs is blocked.
- **VPC Peering**: Production traffic uses AWS VPC Peering to route database connections privately, bypassing the public internet entirely.

### 1.2 Database Users (Least Privilege Principle)
We enforce the principle of least privilege, restricting user accounts to the minimum required database permissions:

```
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE USER ROLES MATRIX                │
├──────────────────┬──────────────────┬───────────────────────┤
│ app_reader       │ readOnly         │ Analytics & logging   │
│ app_writer       │ readWrite        │ Express API Backend   │
│ atlasAdmin       │ dbOwner          │ DBA Operations only   │
└──────────────────┴──────────────────┴───────────────────────┘
```

- **Authentication Protocol**: All users authenticate using SCRAM-SHA-256 with strong, unique passwords.

---

## 2. Encryption Strategy

### 2.1 Encryption in Transit (TLS/SSL)
- All connections to the database must use **TLS/SSL 1.3** encryption.
- Connection URIs must enforce the `ssl=true` parameter. Cleartext (non-SSL) connection attempts are blocked by the database firewall.

### 2.2 Encryption at Rest (AES-256 & FLE)
- **Disk Encryption**: Database disks are encrypted at rest using **AES-256** managed via AWS KMS (Key Management Service).
- **Field-Level Encryption (FLE)**: Highly sensitive fields (such as technician Aadhaar numbers) are encrypted on the client side before being sent to the database. This ensures that even in the event of a database breach, sensitive customer data remains secure.

---

## 3. Query Injection Prevention

To protect against NoSQL injection attacks, HomeHero implements several layers of input validation:

### 3.1 Type Enforcement
- All queries must route through **Mongoose Schema Models**. Mongoose automatically casts incoming payload values to their defined types (e.g., throwing an error if a query tries to inject a MongoDB operator into an `ObjectId` field).

### 3.2 Input Sanitization
- Express endpoints use `express-mongo-sanitize` to strip keys starting with `$` or `.` from request payloads, preventing attackers from injecting malicious database operators:
  ```javascript
  const mongoSanitize = require('express-mongo-sanitize');
  app.use(mongoSanitize());
  ```

---

## 4. Secrets & Environments Management

- **Zero Hardcoded Secrets**: Secrets (such as database connection strings, JWT keys, and API passwords) must never be committed to git.
- **Vault Orchestration**: Production secrets are managed using **Doppler** or **AWS Secrets Manager**, which inject variables into runtime container environments at startup.
- **Local Dev Safes**: Local developers use a `.env` file that is listed in `.gitignore` to prevent credentials from being pushed to version control.

---

## 5. Security Audit Logging & Monitoring

*   **Atlas Audit Logs**: System operations (such as authentication events, user updates, and index changes) are logged continuously.
*   **Real-time Alerts**: Automated alerts trigger via Slack and email in the event of:
    - Multiple failed authentication attempts.
    - Database connections from un-whitelisted IP addresses.
    - Mass document deletion events.
