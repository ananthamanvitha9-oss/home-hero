# HomeHero - GitHub DevOps Workflow & Branching Strategy

**Prepared by**: Senior DevOps Engineer  
**Target Audience**: Software Engineers, QA Engineers, & Release Managers  
**Focus**: Git Flow, Conventional Commits, & PR Checklists

---

## 1. Branching Strategy (Git Flow)

HomeHero follows the structured **Git Flow** branching model to manage releases and concurrent feature developments:

```
                  ┌─── [hotfix/*] ───┐
                  │                  ↓
[main] ───────────────────────────> [v1.0.0 Tag] (Production Releases)
  ▲                                  ▲
  │ (Merge Release)                  │
[release/*] ─────────────────────────┘
  ▲
  │ (Start Release)
[develop] ──────────────────────────────────────> (Active Dev Staging)
  ▲                ▲               ▲
  │ (Start)        │               │ (Merge)
  └── [feature/*] ─┴─ [bugfix/*] ──┘
```

*   **`main`**: Production-ready branch. Only direct merges from `release/*` or `hotfix/*` are permitted.
*   **`develop`**: Integration branch for staging. All features merge here first.
*   **`feature/*`**: Feature branches for new components (e.g. `feature/bookings`). Branched from and merged back into `develop`.
*   **`bugfix/*`**: Standard fixes for non-critical bugs found in develop.
*   **`hotfix/*`**: Urgent production bug fixes. Branched directly from `main` and merged to both `main` and `develop`.

---

## 2. Commit Message Conventions

We enforce the **Conventional Commits** specification to keep git logs clear and readable:

```
<type>(<scope>): <short summary description>

[Optional body detailing rationale]

[Optional footer referencing ticket IDs]
```

### 2.1 Commit Types
- **`feat`**: A new feature (e.g., `feat(auth): implement refresh token rotation`).
- **`fix`**: A bug fix (e.g., `fix(payment): verify signature payload format`).
- **`docs`**: Documentation changes (e.g., `docs(prd): update user story requirements`).
- **`style`**: Formatting changes (white-space, formatting, semicolons - no code changes).
- **`refactor`**: Code restructuring (neither fixes a bug nor adds a feature).
- **`test`**: Adding missing tests or correcting existing tests.

---

## 3. Pull Request (PR) Template

Every pull request submitted on GitHub must adhere to this template structure:

```markdown
## Description
*Provide a summary of the changes introduced by this PR and the problem it resolves.*

## Related Issues
Closes #123

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)

## Verification Checklist
- [ ] Staging environment test runs pass.
- [ ] All Joi payload validation rules are tested.
- [ ] ESLint lint checks have completed successfully.
- [ ] Code coverage threshold (>80%) is maintained.
```

---

## 4. Code Review Checklist

During reviews, peers must evaluate:
- **Security Check**: Are credentials (JWT secrets, DB passwords) stored securely? Are endpoints properly protected by role authorization middlewares?
- **Validation**: Are input fields sanitized and validated against Joi schema specifications?
- **Performance**: Are MongoDB queries optimized using proper indexing? Does the code avoid database queries in loops?
- **Quality**: Are all newly added backend/frontend functions covered by Jest or Playwright test suites?

---

## 5. Version Tagging (SemVer)

All releases merged into the `main` branch are tagged using Semantic Versioning rules:

$$\text{Version} = \text{Major} . \text{Minor} . \text{Patch}$$

- **Major (Breaking Change)**: Incompatible API changes (e.g. `v2.0.0`).
- **Minor (New Feature)**: Backwards-compatible features added (e.g. `v1.1.0`).
- **Patch (Bug Fix)**: Backwards-compatible bug fixes (e.g. `v1.0.1`).
- Tagging command: `git tag -a v1.0.0 -m "Release version 1.0.0"` followed by `git push origin v1.0.0`.
