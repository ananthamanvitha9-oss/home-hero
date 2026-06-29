# MongoDB Validation Rules & Data Integrity Standards - HomeHero

**Prepared by**: Senior Backend Engineer  
**Target Audience**: Backend Developers, API Engineers, & QA Analysts  
**Focus**: Schema validations, string regex mappings, payload constraints, and error messages

---

## 1. Core Authentication Fields Validation

All user authentication requests are validated using strict length and formatting patterns before writing to the database:

### 1.1 Email Format
- **Constraint**: Must match the standard RFC 5322 regex pattern.
- **Regex**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Error Message**: *"Invalid email address format. Must match user@domain.com."*

### 1.2 Phone Number (E.164 Format)
- **Constraint**: Must include country code prefix, followed by a 10-digit mobile number.
- **Regex**: `/^\+?[1-9]\d{1,14}$/`
- **Error Message**: *"Phone number must be E.164 compliant (e.g. +91 90000 00000)."*

### 1.3 Password Complexity Policy
- **Constraint**: Minimum 8 characters, maximum 64 characters. Must contain at least one uppercase letter, one lowercase letter, one number, and one special character.
- **Regex**: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/`
- **Error Message**: *"Password must be 8-64 characters and include uppercase, lowercase, numbers, and special symbols."*

---

## 2. Profile & Address Validation

### 2.1 Customer Addresses
- **Required Fields**: Label, Street, Area, City, Pincode.
- **Rules**:
  - `label`: Length 2 to 20 characters (e.g. "Home", "Office").
  - `street`: Length 5 to 100 characters.
  - `pincode`: Must match the 6-digit Indian PIN code format: `/^[1-9][0-9]{5}$/`.
- **Error Message**: *"Pincode must be exactly 6 digits and cannot start with 0."*

---

## 3. Transactional Validation Rules

### 3.1 Booking Configuration
- **Validation Constraints**:
  - `customerId`: Must be a valid MongoDB `ObjectId`.
  - `serviceCategory`: Must match one of the active enums: `['Electrician', 'Plumber', 'Carpenter', 'AC Repair']`.
  - `billing.totalPrice`: Must be a positive decimal number greater than 0.
  - `startOtp`: Must be a 4-digit numeric string: `/^[0-9]{4}$/`.
- **Error Message**: *"Start OTP must be exactly 4 digits."*

### 3.2 Payment Records
- **Validation Constraints**:
  - `bookingId`: Must be a unique, valid `ObjectId`.
  - `paymentStatus`: Enum restricted to `['created', 'successful', 'failed']`.
  - `escrowStatus`: Enum restricted to `['held_in_escrow', 'released', 'refunded']`.
- **Error Message**: *"Invalid payment status or escrow stage value provided."*

### 3.3 Reviews & Feedback
- **Validation Constraints**:
  - `rating`: Numeric value from 1 to 5: `min: 1`, `max: 5`.
  - `comment`: Length limit 0 to 500 characters.
- **Error Message**: *"Rating score must be an integer between 1 and 5."*

---

## 4. Security & NoSQL Injection Prevention

To ensure security at the database layer:
*   **Schema Enforcement**: Reject all document writes containing fields not explicitly defined in the Mongoose schemas.
*   **Sanitization Filters**: Filter payload objects using `mongo-sanitize` to strip characters starting with `$` (NoSQL operator injection protection).
*   **Payload Schema Validation**: Run all HTTP request payloads through Joi schema validators in Express middlewares before passing execution to controller methods.
