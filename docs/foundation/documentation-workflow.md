# HomeHero - Documentation Architecture & Workflow Standards

**Prepared by**: Technical Documentation Architect  
**Target Audience**: Developers, Writers, and Project Leads  
**Focus**: Markdown Standards, Document Templates, & Maintenance Strategies

---

## 1. Documentation Folder Structure

All documentation must be stored in the root `docs/` folder, organized by product stage:

```
docs/
├── foundation/           # Business Model, Market Research, MVP planning
├── prd/                  # Product Requirement Documents, User stories
├── architecture/         # System architecture blueprints (HLC/LLC)
├── database/             # MongoDB schemas, collections, indexes maps
├── api-docs/             # API reference definitions
├── testing/              # QA test checklists and coverage profiles
├── deployment/           # Render/Vercel guides, CI/CD pipeline variables
├── launch/               # Operations playbook, launch checklist
└── presentations/        # Investor pitch decks and presentation markdown files
```

---

## 2. Naming Conventions & Markdown Standards

### 2.1 File & Directory Naming
- **Directories**: Use lowercase singular or plural descriptors (e.g. `api-docs`, `foundation`).
- **Files**: Use `kebab-case` naming conventions for all markdown files (e.g. `startup-idea-validation.md`, `system-architecture.md`).

### 2.2 Markdown Syntax Rules
- **Headers**: Maintain a single `# Header 1` per file for title definition, followed by structured `## Header 2` and `### Header 3` subdivisions.
- **File Links**: Provide clickable file links using standard markdown link syntax with the `file://` scheme. Use forward slashes (e.g. `[userModel.js](file:///c:/Users/manvi/OneDrive/Desktop/homehero/backend/src/models/userModel.js)`).
- **Code Blocks**: Always declare syntax highlighting language identifiers (e.g. ````javascript ... ````).

---

## 3. Core Documentation Templates

### 3.1 Template: Product Specification (`spec-template.md`)
```markdown
# Product Spec: [Feature Title]

## 1. Objective & Context
*Short summary of why we are building this feature.*

## 2. Core Functional Requirements
- Requirement 1
- Requirement 2

## 3. User Experience Flow
1. User clicks X
2. System returns Y

## 4. Dependencies
- Files modified: [file.js](file:///c:/absolute/path/to/file.js)
```

### 3.2 Template: API Endpoint Reference (`api-template.md`)
```markdown
# API Reference: [Endpoint Module]

## [HTTP METHOD] /api/[endpoint-path]

### Request Payload
```json
{
  "key": "value"
}
```

### Response Codes
- `200 OK`: Request succeeded.
- `400 Bad Request`: Validation failure.
- `401 Unauthorized`: Token missing or expired.
```

---

## 4. Git Integration & Review Process

```
[Write / Edit Doc] ──> [PR Submission on develop] ──> [Peer Review & Link Audit] ──> [Merge & Sync origin]
```

1.  **Branching**: All documentation updates must be developed on a dedicated branch (`docs/feature-name`) branched from `develop`.
2.  **Linting & Link Verifications**: Prior to submitting pull requests, developers must verify that all file links are valid and resolve.
3.  **Review Approvals**: Every documentation pull request requires approval from at least one reviewer.

---

## 5. Long-term Maintenance Strategy

- **Doc-as-Code Rule**: When modifying backend or frontend codebase files, developers must update the corresponding documentation files (API references, system architecture maps) in the same pull request.
- **Bi-Weekly Sync audits**: Product Owners will run automated lint scripts to audit links and update versions on the first and third Mondays of every month.
