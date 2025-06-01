# SAM'S TransactionService Tester

Este repositorio contiene una aplicación web simple para realizar pruebas de consumo al servicio `TransactionService.svc`, simulando el entorno real de Sam’s Club para desarrolladores y testers.

**La aplicación está construida con**:  
- HTML + Bootstrap 4  
- jQuery  
- Archivos JSON estáticos para catálogos (artículos, métodos de pago, membresías)

---

## 🚀 **¿Cómo probar el sitio web?**

1. **Acceso Web:**  
   Este repositorio está habilitado con GitHub Pages. Acceda desde: https://suusuario.github.io/sams-tester/


2. **Descargar/Clonar:**  
También puede descargar o clonar el repositorio y abrirlo en un servidor local para pruebas avanzadas.

---

## 📁 **Estructura de Archivos**

- `index.html`  
Página principal con formulario para construir requests, enviar consumo, ver JSON y respuesta en tabla.
- `main.js`  
Lógica JS para armar el JSON, realizar la llamada AJAX, y procesar la respuesta.
- `catalogo_articulos.json`  
Catálogo estático de artículos de ejemplo (UPC, descripción, precio, etc.).
- `catalogo_tender.json`  
Catálogo de métodos de pago de ejemplo.
- `catalogo_membresias.json`  
Catálogo de membresías y datos del socio.
- (Opcional) Otras carpetas o assets requeridos.

---

## 🧩 **¿Cómo funciona?**

1. Seleccione los datos requeridos desde los catálogos desplegados (membresía, artículo, método de pago, cantidad, etc.).
2. El formulario construye automáticamente el **JSON request** requerido por el servicio.
3. Al presionar “Enviar Request”, se realiza una llamada AJAX (puede simularse o apuntar al endpoint real).
4. El JSON de respuesta se muestra en un cuadro de texto y en una tabla de recompensas para fácil análisis.

---

## 📝 **Notas Importantes**

- Para evitar errores de CORS o rutas, utilice el sitio desde GitHub Pages, o levante un servidor local (por ejemplo, `python -m http.server`).
- Si desea probar contra un endpoint real, modifique la URL en `main.js` (`$.ajax({ url: ... })`).
- Puede expandir los catálogos JSON agregando más artículos, tender o membresías.
- Este proyecto es para fines didácticos y pruebas internas, no para producción.

---

## 🛠️ **Contribuciones**

¡Pull requests y sugerencias son bienvenidas! Puede contribuir mejorando el frontend, agregando validaciones, nuevos catálogos, documentación o simuladores de respuesta.

---

## 🧑‍💻 **Licencia**

MIT License.

---

### **Desarrollado para pruebas y aprendizaje de consumo de servicios de Sam’s Club / TimeToPlay.**
