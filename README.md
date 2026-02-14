📦 Sistema de Gestión de Inventario Web

Aplicación web para la gestión de inventario empresarial. Permite administrar productos, controlar entradas y salidas, monitorear niveles de stock y consultar estadísticas clave del inventario en tiempo real.

Desarrollada con HTML5, Bootstrap, JavaScript Vanilla y localStorage, priorizando una estructura clara, control sólido de datos y una experiencia de usuario intuitiva.

🚀 Tecnologías Utilizadas

HTML5 – Estructura de la aplicación
Bootstrap – Diseño responsive y componentes visuales
JavaScript (Vanilla) – Lógica del sistema
localStorage – Persistencia de datos en el navegador

👥 Gestión de Roles
El sistema contempla dos tipos de usuario:
🔐 Administrador
Crear, editar y eliminar productos

Gestionar categorías
Visualizar inventario completo
Consultar historial detallado de movimientos
Acceder a panel de estadísticas (productos con bajo stock, mayor rotación, etc.)

👤 Empleado
Registrar entradas de productos (compras)
Registrar salidas (ventas o pérdidas)
Consultar inventario disponible

El acceso a funcionalidades está protegido según el rol asignado.
📋 Funcionalidades Principales
✔ CRUD completo de productos
✔ Gestión de categorías
✔ Control automático de stock
✔ Validación para evitar salidas sin stock suficiente
✔ Registro detallado de movimientos (tipo, cantidad, fecha, usuario y motivo)
✔ Persistencia total mediante localStorage
✔ Panel de estadísticas básicas
✔ Validaciones y control de integridad de datos

🗂️ Modelo de Datos

El sistema se organiza en tres entidades principales:
Productos
Código único
Nombre
Categoría
Precio
Stock actual
Stock mínimo
Categorías
ID único
Descripción
Movimientos
Tipo (entrada o salida)
Cantidad
Fecha
Usuario
Motivo

⚙️ Lógica de Negocio
El stock se actualiza automáticamente tras cada movimiento.
No se permite registrar salidas si no hay inventario suficiente.
Las operaciones se validan antes de almacenarse.
Se generan alertas cuando el stock baja del mínimo configurado.
Se optimizó el manejo de búsquedas y actualización del DOM para mejorar el rendimiento.
Se protege la integridad referencial (por ejemplo, no se pueden eliminar categorías con productos asociados).

🎨 Experiencia de Usuario
Interfaz clara e intuitiva
Retroalimentación visual inmediata (mensajes de éxito y error)
Código de colores para diferenciar tipos de movimiento
Validaciones en tiempo real
Diseño adaptable a móvil, tablet y escritorio
Estructura de archivos organizada y mantenible

📁 Estructura del Proyecto
/project-root
│── index.html
│── /css
│     └── styles.css
│── /js
│     └── app.js
│── README.md
