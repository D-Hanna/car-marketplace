# AGENTS.md - Core Project Directives

## Architecture & Conventions
- **Contract-First**: OpenAPI 3.0 specification (`openapi.yaml`) is the single source of truth.
- **Backend Stack**: Java 21, Spring Boot 3.3+, Spring Data JPA, H2 In-Memory DB, JUnit 5 + MockMvc.
- **Frontend Stack**: React (Vite) + Tailwind CSS.
- **Coding Standard**: Idiomatic Java, Java Records for DTOs, proper HTTP status codes, structured error handling (`ProblemDetail`).

## Operating Boundaries
- No agent may modify files outside its assigned domain without consulting the API contract.
- All backend code must pass `./mvnw clean test-compile` before marking a task complete.
- Never deploy direct to main but always create a feature branch and then create a pr for it and ask for human review and approval before merging.
- Use semantic commit messages.
- Never push directly to main.

## Testing Guidelines
- **Unit Testing (Backend)**:
  - Mock external dependencies using `org.mockito`.
  - Test individual controller methods and service logic.
  - Ensure proper HTTP status code verification.
- **Integration Testing (Optional)**:
  - Use `@SpringBootTest` with `TestRestTemplate` if testing full stack features.

## Branch Strategy
- **Main Branch**: Production-ready code. No direct commits.
- **Feature Branches**: All new work must be done in branches named `feature/TASK-ID-short-description` (e.g., `feature/JIRA-123-add-user-login`).
- **Pull Requests**: Required for all feature branches. Must include description and link to task.

