# Bitácora de revisión de IA

1. **Separación de lógica pura en sensores:** se aisló la detección de sacudida e inclinación en funciones puras para poder probarlas con Jest sin hardware real.
2. **Alternativas accesibles:** cada gesto (`LongPress`, `Pan`, `Fling`) cuenta con un botón equivalente con `accessibilityLabel`.
3. **Cero contraseñas en claro en SQLite ni logs:** todas las claves se cifran antes de persistirse y se bloquea `console.log`.
