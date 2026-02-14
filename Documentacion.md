SISTEMA DE GESTIÓN DE INVENTARIO

Documentación Técnica y Reflexión del Desarrollo

PROMPTS UTILIZADOS EN EL DESARROLLO

"Quiero desarrollar una aplicación web que simule la gestión de inventario de una empresa. La idea es poder administrar productos, registrar movimientos y generar reportes básicos, utilizando HTML5, Bootstrap como framework CSS, JavaScript Vanilla y almacenamiento con localStorage.

El sistema debe manejar dos roles: administrador y empleado.

El administrador podrá crear, editar y eliminar productos, definir categorías, visualizar todo el inventario, revisar el historial completo de movimientos y acceder a un panel con estadísticas (por ejemplo, productos con bajo stock o los que tienen más movimientos).

El empleado podrá registrar entradas (compras) y salidas (ventas o pérdidas), además de consultar el inventario disponible, pero no podrá eliminar productos.
El sistema debe incluir obligatoriamente:

•	CRUD completo de productos.
•	Control de stock automático que se actualice con cada movimiento.
•	Validación para no permitir salidas sin stock suficiente.
•	Historial detallado de movimientos con fecha y tipo.
•	Persistencia total de la información en localStorage.
•	Protección de vistas y funcionalidades según el rol del usuario.

Además, quiero que la estructura de datos esté bien organizada (productos con código único, nombre, categoría, precio, stock actual y mínimo; categorías con identificador propio; y movimientos con tipo, cantidad, fecha, usuario y motivo).

Me interesa que el código esté separado en archivos HTML, CSS y JS, bien organizado y comentado. También quiero que tenga una lógica sólida de control de stock, validaciones claras, optimización en búsquedas y manejo del DOM, y una experiencia de usuario intuitiva con mensajes visuales, uso coherente de colores y diseño adaptable a distintos dispositivos."


ARQUITECTURA Y TECNOLOGÍAS

Tecnología	          Propósito
HTML5	              Estructura semántica de la aplicación
CSS3 + Bootstrap 5	  Estilos, diseño responsive y componentes UI
JavaScript ES6+	      Lógica de negocio, manejo de eventos y manipulación del DOM
localStorage API	  Persistencia de datos del lado del cliente
Bootstrap Icons	      Iconografía consistente en toda la aplicación

Estructura de Archivos
•	index.html - Estructura HTML completa con todas las vistas y modales
•	styles.css - Estilos personalizados, animaciones y media queries
•	app.js - Lógica completa de la aplicación (~1000 líneas)
