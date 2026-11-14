# Configuración de IA y seguridad

- `AGENTS.md` (<= 100 líneas) y `CLAUDE.md` (`@AGENTS.md`) configurados antes de generar código.
- `.claude/settings.json` con `permissions.deny` para `.env*`, `*.pem`, `*.key`, `*.keystore`, `*.jks` y `Edit(./.claude/**)`.
- Sandbox habilitado (`allowUnsandboxedCommands: false`, `blockReadsOutsideWorkingDirectories: true`, `denyRead: ["~/"]`).
- `env.example` con `EXPO_PUBLIC_API_URL`; cero secretos en la app móvil.
