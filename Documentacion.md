SISTEMA DE GESTIÓN DE INVENTARIO

Documentación Técnica y Reflexión del Desarrollo

PROMPTS UTILIZADOS EN EL DESARROLLO

1. Diseño de la estructura de datos
Prompt utilizado:
"Ayúdame a crear una estructura donde cada producto tenga su código único, nombre, categoría, precio, stock actual y stock mínimo.
También quiero manejar categorías con su propio ID y descripción, y llevar un registro de cada movimiento (si fue entrada o salida, cantidad, fecha, usuario y motivo).
La idea es que todo esté pensado para que sea fácil buscar productos por categoría, detectar cuáles tienen poco stock y poder sacar estadísticas. Además, que se generen los IDs automáticamente y que no se puedan borrar datos importantes si afectan otras relaciones."
________________________________________
2. Lógica de control de stock
Prompt utilizado:
"Quiero que el sistema actualice el stock automáticamente cada vez que se registre una entrada o una salida.
Si alguien intenta sacar más unidades de las que hay disponibles, no debería permitirlo. Cada movimiento debe guardarse con todos sus datos (tipo, cantidad, usuario, fecha y motivo).
También necesito que el proceso sea seguro: si algo falla al actualizar el stock, no debe guardarse el movimiento incompleto.
Además, quiero que el sistema avise cuando un producto esté por debajo del stock mínimo y que pueda mostrar estadísticas de los productos que más se mueven."
________________________________________
3. Optimización de funciones
Prompt utilizado:
"Quiero que el sistema sea más rápido y eficiente. Ayúdame a mejorar el rendimiento evitando recorridos innecesarios en los arrays, optimizando las búsquedas y reduciendo procesos repetitivos.
También quiero que el DOM solo se actualice cuando sea necesario, que los campos de búsqueda no ejecuten funciones en exceso mientras el usuario escribe, y que el manejo de eventos sea más limpio y organizado.
________________________________________
4. Mejora de experiencia de usuario
Prompt utilizado:
"Necesito que la app sea intuitiva y agradable de usar. Quiero que cada acción tenga una respuesta visual clara (mensajes de éxito o error, cambios de estado, alertas).
Me gustaría usar colores que ayuden a entender rápidamente lo que está pasando (verde para entradas, rojo para salidas, amarillo para alertas).
También quiero validaciones en tiempo real con mensajes claros, animaciones sutiles, diseño adaptable a celular y computador, y que la app sea accesible (por ejemplo, con navegación por teclado y etiquetas adecuadas).
________________________________________
5. Depuración y validación
Prompt utilizado:
"Ayúdame a validar los formularios antes de enviar la información y evitar datos duplicados, como códigos de producto repetidos.
Tampoco debería permitir borrar categorías que todavía tengan productos asociados.
Si ocurre un error al guardar datos, el sistema debe manejarlo correctamente y mostrar un mensaje claro al usuario.
Además, quiero confirmaciones antes de acciones importantes, validaciones de reglas del negocio (como no permitir cantidades negativas) y registros en consola que me ayuden a depurar en caso de problemas."

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
