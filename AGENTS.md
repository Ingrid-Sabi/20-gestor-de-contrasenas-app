# AGENTS.md — 20-gestor-de-contrasenas-app

## Stack
- Expo + React Native + TypeScript (`strict: true`, `noUncheckedIndexedAccess: true`)
- Expo Router (`app/`)
- SQLite local (`expo-sqlite`) + `expo-secure-store` + `expo-crypto`
- Biometría (`expo-local-authentication`), portapapeles (`expo-clipboard`), sensores (`expo-sensors`)
- Gestos (`react-native-gesture-handler`, `react-native-reanimated`)
- Jest + `jest-expo` + React Native Testing Library

## Comandos
- `npx expo start`: servidor de desarrollo
- `npm run check`: `tsc --noEmit` + `npm run lint` + `npm run format:check` + `npm test`
- `npm test`: ejecuta Jest

## Estructura
- `app/`: pantallas Expo Router (`_layout.tsx`, `bloqueo.tsx`, `(tabs)/index.tsx`, `(tabs)/generador.tsx`, `cuenta/[id].tsx`, `ajustes.tsx`)
- `src/db/`: apertura y migraciones SQLite
- `src/repositories/`: SQL parametrizado
- `src/services/`: cifrado, fortaleza, generador, auto-bloqueo, sincronización
- `src/api/`: cliente HTTP con `EXPO_PUBLIC_API_URL`, Bearer token y refresh
- `src/sensors/`: hooks de acelerómetro/giroscopio con lógica pura testeable
- `src/components/`: UI reutilizable y accesible (`accessibilityLabel`)

## Reglas de código
- Sin `any`, `@ts-ignore`, `@ts-nocheck`, ni `as` para silenciar errores.
- Nunca guardar ni registrar contraseñas en claro ni en logs (`no-console`).
- Cero credenciales en el APK; solo `EXPO_PUBLIC_API_URL` es pública.
- Todo gesto debe tener alternativa por botón accesible.

## Acciones prohibidas
- Leer archivos `.env*`, `*.pem`, `*.key`, `*firebase-adminsdk*.json`, `*.keystore`, `*.jks`.
- Ejecutar `sudo`, `rm -rf`, `curl`, `wget`, `git push --force`, `git reset --hard`.
- Modificar `.claude/**` o acceder fuera del directorio de trabajo.

## En caso de duda
- Preguntar antes de instalar dependencias, hacer `git push` o ejecutar `eas`.
