# paraClaudia 🐸

Web educativa para Claudia (2 años). Sin dependencias, sin build: tres
archivos estáticos (`index.html`, `style.css`, `app.js`) pensados para
móvil/tablet, con botones enormes para dedos pequeños.

## Larry la rana

Larry saluda, presenta los juegos y celebra los aciertos. **Siempre habla
español** (voz `es-ES` del navegador vía Web Speech API). El botón `🌐` de
la esquina — para papá — cambia a inglés y se recuerda entre sesiones.
Toca a Larry y te saluda.

## Juegos

1. **🎹 Piano — Cumpleaños Feliz**: 8 teclas de colores (Sol–Sol). La
   tecla que toca a continuación brilla; al pulsarla suena la nota (Web
   Audio) y avanza la barra de progreso. Al terminar la canción: confeti,
   fanfarria y felicitación de Larry. El botón `🔊` reproduce la canción
   entera con las teclas iluminándose (demo). Pulsar una tecla equivocada
   solo suena, nunca castiga.
2. **🎨 Adivina el color**: rojo, amarillo y azul. Larry dice el color en
   voz alta y Claudia toca el botón. Acierto → confeti y elogio; fallo →
   Larry nombra el color tocado y repite cuál buscar. Los botones cambian
   de posición en cada ronda. `🔊` repite la pregunta.

## Cómo usarla

- **En el móvil**: publica la carpeta en GitHub Pages (Settings → Pages →
  Deploy from branch) y abre la URL en el navegador del teléfono. En un
  repo privado hace falta GitHub Pro; en uno público es gratis.
- **En local**: `python3 -m http.server` en esta carpeta y abre
  `http://localhost:8000` (o simplemente abre `index.html`).
- La voz necesita un toque inicial (los navegadores móviles bloquean el
  audio hasta el primer gesto): toca a Larry al entrar.

## Notas técnicas

- Rotación soportada: en vertical el piano pasa a 2 filas de 4 teclas y
  los colores se apilan; en horizontal, una fila de 8 y tres columnas.
- `touch-action: manipulation` + viewport fijo: sin zoom por doble toque
  ni scroll accidental.
- Melodía en Do mayor sin sostenidos: solo teclas blancas
  (Sol Sol La Sol Do Si / Sol Sol La Sol Re Do / Sol Sol Sol Mi Do Si La /
  Fa Fa Mi Do Re Do).
