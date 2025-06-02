
# SAM'S TransactionService Tester (versión avanzada)

Este repositorio contiene una aplicación web para pruebas avanzadas de consumo al servicio `TransactionService.svc`, simulando el entorno real de Sam’s Club.

**Características principales:**
- Frontend 100% estático, fácil de publicar en GitHub Pages o servidor local.
- Interfaz dinámica para agregar/remover múltiples artículos por transacción.
- Cálculo automático de totales y acumulaciones.
- Construcción y visualización del JSON request en tiempo real.
- Simulación y visualización de la respuesta del servicio.
- Fácil personalización de catálogos de artículos, métodos de pago y membresías.

## 🚀 ¿Cómo usar este sitio web?

1. **Suba todos los archivos a su repositorio (o servidor).**
2. Si usa GitHub Pages:
   - Habilite Pages sobre la rama `main` y ruta `/root` en Settings > Pages.
   - Espere la URL (ejemplo: https://titomiguel.github.io/sams-tester/)
3. Abra la web y pruebe las distintas funcionalidades de prueba de transacciones.

## 📂 Estructura de archivos

- `index.html` — Página principal.
- `main.js` — Lógica y manipulación del formulario.
- `catalogo_articulos.json` — Catálogo editable con 10 artículos de ejemplo.
- `catalogo_tender.json` — Métodos de pago.
- `catalogo_membresias.json` — Membresías de prueba.
- `README.md` — Este archivo.

## 🧩 ¿Cómo funciona?

- Puede agregar o quitar filas de artículos (LineItem).
- Cada cambio en cantidad, artículo o acumulación actualiza en tiempo real el JSON request y el total de pago.
- El JSON del request siempre se muestra para copiar o validar.
- La respuesta (mock o real) se muestra en texto y tabla.

## 📝 Personalización

- Agregue más artículos, métodos de pago o membresías editando los archivos JSON.
- Para consumir un endpoint real, reemplace la URL en `main.js` por la URL de su API.

## 👨‍💻 Requisitos técnicos

- No requiere backend, base de datos ni instalación.
- Compatible con GitHub Pages o cualquier servidor web estático.
- Para desarrollo local, use un servidor local (ejemplo: `python -m http.server`).

## 🛠️ Contribuciones

Sugerencias, mejoras y Pull Requests son bienvenidos.

MIT License.
