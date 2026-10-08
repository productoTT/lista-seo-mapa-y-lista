# Bloque 3: asistente conversacional en Home y Lista desktop

Rama `home-ia-preevaluacion`. Es un experimento: no se integra a `main`.

## Qué es simulado y qué funciona

| | Estado |
|---|---|
| **Respuestas del asistente** | **Simuladas.** Reglas fijas en `src/assistant/engine.ts`, sin modelo de lenguaje ni servicios externos. Reconocen operación, tipo, comunas (y "comunas cercanas"), Studio y dormitorios "n+", baños, precio en UF o pesos, cercanía al metro y características. Fuera de eso, piden más detalle con ejemplos. |
| **Demora de respuesta** | Simulada: 700 ms fijos, para mostrar el estado "Escribiendo…". |
| **Error del asistente** | Simulado bajo pedido: abre la app con `?simular=error-asistente` y falla la primera respuesta. No hay controles visibles. |
| **Conteos y carrusel** | **Reales sobre los datos ficticios.** Usan las mismas reglas de filtrado que Lista, Mapa y Dividida. |
| **Borrador y aplicación** | **Funcionan.** Conversar solo cambia el borrador. "Ver N resultados" aplica la búsqueda y abre la Lista. "Volver a la anterior" restaura la búsqueda previa con sus orígenes. |
| **Hilo** | **Funciona** en memoria: se conserva al minimizar y al navegar entre inicio, resultados y ficha. Se pierde al recargar la página, que es el comportamiento de invitado (spec §15). |
| **Notas del hilo** | **Funcionan.** "Ahora estás en…" al cambiar de vista; "Cambiaste tus filtros: … Sigo a partir de ahí." al editar a mano (cabecera, Más filtros, chips, Home o el propio panel). |
| **Datos personales** | **Funciona.** El RUT y los ingresos se ocultan con "•" **antes** de guardar el mensaje. El texto original no se guarda, no llega al motor y no se envía a ningún lado. |
| **Respuestas sobre presupuesto y cotización** | Informativas. Dicen explícitamente que esas funciones todavía no están disponibles en el prototipo. No muestran botones que no funcionan. |

## Qué cambió

- **Un solo asistente para todos los accesos:** la sección de IA del combobox, "Cuéntaselo al asistente", Buscar con una descripción, el botón "Asistente IA" de la cabecera TOCTOC, el botón "Asistente" de la cabecera de resultados y el ícono flotante.
- **Panel** (`AssistantPanel`): superpuesto y sin velo; en mobile del Home, hoja inferior. La cabecera tiene Nueva conversación, Ampliar/Reducir y Minimizar. Debajo:
  - "Estás en … · Tus filtros (N)", con chips que se pueden quitar; su estado abierto o cerrado se conserva;
  - el hilo;
  - sugerencias;
  - el campo de texto con el aviso de datos personales.
- **Respuesta de búsqueda:** texto, carrusel de hasta 10 tarjetas ("Ver propiedad" abre la ficha), "Ver N resultados" y "Criterios de esta búsqueda", con lo que agrega, quita o cambia frente a los filtros actuales.
- **Sin coincidencias:** hasta 3 alternativas con su conteo. Si soltar un solo criterio no alcanza, propone volver a lo esencial (operación, tipo y comuna).
- **Minimizar, Nueva conversación y Eliminar son acciones distintas:**
  - **Minimizar** (botón o Escape) conserva el hilo y deja el ícono con "Conversación activa".
  - **Nueva conversación** pide confirmación y empieza otro hilo sin tocar los filtros. Como no hay ingreso todavía, solo ofrece "Empezar una nueva"; la opción "Ingresar o registrarme" de la spec llega con autenticación.
  - **Eliminar** pertenece al historial, que no se construye en este bloque.
- **IA anterior retirada** (aplicaba filtros automáticamente):
  - el modo "Búsqueda IA" de la cabecera de resultados;
  - el modal "Refinar búsqueda" con pestañas;
  - la pestaña "Búsqueda IA" del buscador mobile;
  - el cargador de 8 segundos;
  - `parseQuery`/`applyInterpretation`.

  Se eliminaron los archivos `components/ia/*`, `SemanticSearchModal.tsx` e `InterpretingScreen.tsx`. Ya no quedan dos mecanismos de IA.
- **Corrección de paso:** el buscador mobile de resultados llamaba a la IA anterior con un texto vacío al presionar Buscar, y eso reescribía la operación. Ahora solo aplica los filtros elegidos.

## Limitación: dónde está integrado el panel

| Superficie | Asistente |
|---|---|
| Home (desktop y mobile) | Disponible |
| Resultados · Lista (desktop) | Disponible (superpuesto, según lo aprobado) |
| Ficha completa (desktop) | Disponible, con contexto básico. Las respuestas específicas de ficha (gastos comunes, entorno, parecidas) siguen pendientes. |
| Resultados · **Mapa y Dividida** (desktop) | **No integrado** (D4 pendiente). El botón "Asistente" se ve atenuado y avisa al presionarlo; el ícono flotante se oculta; si el panel estaba abierto, se minimiza y conserva el hilo. Se mantiene la búsqueda tradicional. |
| Resultados **mobile** | **No integrado** (D5 pendiente). Sin accesos al asistente; la búsqueda tradicional se mantiene. |

## Accesibilidad incluida

- Panel con `role="complementary"` y título. El hilo es `role="log"` con anuncios corteses, y "Escribiendo…" tiene `role="status"`.
- Al abrir, el foco va al campo de texto. Al minimizar (botón o Escape), vuelve al ícono flotante.
- Todos los botones de ícono tienen nombre accesible, y Ampliar indica si está activo con `aria-pressed`.
- El carrusel es una región con botones Anteriores/Siguientes y la posición "n de N" en cada tarjeta.
- La confirmación de nueva conversación es `role="alertdialog"` y lleva el foco a la acción principal.
- El aviso "Volver a la anterior" se anuncia y tiene un botón accesible por teclado.
- Respeta `prefers-reduced-motion`.

## Pendientes registrados

- **Explicación del Home en tres columnas** ("Busca directo · Describe con el asistente · Estima tu presupuesto"): no depende técnicamente del financiamiento ni del historial. Queda para completarse cuando las tres rutas estén disponibles; hoy la estimación no existe.
- **Color del asistente:** se mantiene el índigo existente de forma provisional.
- **Chips con etiqueta de origen "IA"** en resultados: el origen ya se guarda en el estado; mostrarlo es parte del bloque de resultados.
- **Historial, ingreso y "Continúa donde quedaste"**.
- **Las tarjetas existentes con la etiqueta comercial "Recomendado IA"** pueden confundirse con el asistente. No se tocaron: es una etiqueta comercial previa, fuera del alcance.
- Siguen abiertos de los bloques anteriores: controles de metro y características, varias comunas en mobile, lint previo (15 problemas, ninguno nuevo) y la cabecera TOCTOC no adaptada a mobile.

## Comprobaciones

`npm run verify:search` incluye 9 pruebas del motor:
- ocultar RUT e ingresos;
- que conversar no modifique la búsqueda aplicada;
- que la propuesta sea correcta y su conteo igual al filtrado real;
- que el borrador iniciado en el Home no herede las comunas;
- alternativas sin coincidencias;
- "Empezar de cero";
- respuesta ante datos personales.

Prueba de humo en navegador sin interfaz, con teclado real y sin errores de consola:

| # | Prueba | Resultado |
|---|---|---|
| 1 | "Asistente IA" de la cabecera | Abre el panel con el foco en el campo |
| 2 | "2 dormitorios en Ñuñoa cerca del metro" | "Escribiendo…", luego 3 opciones con carrusel; el Home sigue sin criterios extra |
| 3 | "Ver 3 resultados" | Lista con 3; chips Departamentos · Ñuñoa · 2+ dorm. · Metro a 10 min; aviso con "Volver a la anterior"; nota "Ahora estás en tus resultados" |
| 4 | "Volver a la anterior" | Vuelve a 18 y anota "Volviste a tu búsqueda anterior" |
| 5 | Quitar "Departamentos" a mano | Nota "Cambiaste tus filtros: quita Departamentos. Sigo a partir de ahí." |
| 6 | Mensaje con RUT e ingreso | Se guarda como "••.•••.•••-•"; el original no aparece en la página |
| 7 | "casa en Vitacura con 6 dormitorios y terraza" | Sin coincidencias; 2 alternativas con conteo; elegir una propone 1 opción |
| 8 | Minimizar | Ícono "Conversación activa"; foco en el ícono; botón "Asistente (conversación activa)" |
| 9 | Mapa y Dividida | Sin ícono; el acceso avisa y no abre el panel |
| 10 | Volver a Lista y reabrir | Hilo intacto (12 elementos) |
| 11 | Escape | Minimiza y devuelve el foco |
| 12 | Nueva conversación | Pide confirmación; vacía el hilo y conserva los filtros (32) |
| 13 | `?simular=error-asistente` + combobox | Error "No cambié nada de tu búsqueda"; Reintentar responde |
| 14 | "Providencia" + "Cuéntaselo al asistente" | "En Providencia, " listo para completar |
| 15 | Mobile 390 px | Hoja inferior en el Home; "Ver 4 propiedades" lleva a resultados mobile sin panel ni ícono; sin scroll horizontal |

## Capturas

En `capturas-bloque-3/`: panel vacío, cargando, propuesta, aplicado con aviso, nota de filtros, datos personales, sin coincidencias, minimizado, Mapa, nueva conversación, error y mobile.
