# Bloque 2: Home y entradas al asistente

> **Actualización (bloque 3):** la vista previa del traspaso se reemplazó por el asistente conversacional. Ver `bloque-3-asistente.md`.

Rama `home-ia-preevaluacion`. Es un experimento: no se integra a `main`.

## Qué cambió

| Área | Cambio | Dónde |
|---|---|---|
| Buscador | Las pestañas "Búsqueda clásica" y "Búsqueda con IA ✨" se reemplazan por un solo buscador. Sigue el patrón del sistema de diseño (`product/web/screens/Home.jsx`): pestañas Comprar/Arrendar unidas a una tarjeta blanca con tipo, ubicación y Buscar. | `components/home/HomeSearch.tsx`, `home.css` |
| Operación y tipo | Leen y escriben la búsqueda compartida (spec §5, principio 1). Se agrega "Todos los tipos". | `HomeSearch.tsx` |
| Combobox de ubicación | Muestra hasta 3 sugerencias y, siempre al final, la sección "Describe lo que buscas con IA". Funciona con flechas, Enter y Escape, y tiene roles ARIA de combobox/listbox. | `components/home/LocationCombobox.tsx` |
| Sugerencias sin texto | Primero las búsquedas recientes y luego las sugeridas (Ñuñoa, Providencia, Las Condes), sin repetir una comuna que ya es una búsqueda reciente. | `LocationCombobox.tsx` |
| Recientes | Solo se registran búsquedas **ejecutadas**: Buscar, "Ver N propiedades", búsquedas frecuentes, una reciente elegida y la búsqueda vigente al volver al inicio desde resultados. Se guardan en memoria (máximo 5). | `App.tsx` (`recordRecent`) |
| Comuna o descripción | Elegir una comuna solo la escribe en el campo; Buscar la aplica. Si el texto escrito es una comuna exacta, la sección de IA ofrece "En [comuna], …" listo para completar. Si no lo es, ofrece enviarlo como primer mensaje. Buscar con un texto que no es comuna también lo traspasa al asistente. | `LocationCombobox.tsx`, `HomeSearch.tsx` |
| "Tu búsqueda ya tiene:" | Aparece cuando la búsqueda tiene criterios además de operación y tipo. Muestra chips que se pueden quitar, "Ver N propiedades" (el número se anuncia al cambiar) y "Limpiar". | `HomeSearch.tsx` |
| Persistencia | Volver al inicio ya no borra la búsqueda: la búsqueda es una sola en todo el sitio. | `App.tsx` |
| Resultados | La cabecera abre en modo **Clásico** al llegar desde la búsqueda tradicional. "Búsqueda IA" solo se abre si se llegó por la IA anterior, que hoy queda únicamente en el buscador mobile de resultados. | `ResultsHeader.tsx`, `ResultsScreen.tsx` |
| Categorías | "Proyectos nuevos" abría la búsqueda IA anterior. Ahora es una búsqueda directa: Comprar + Estado "Nueva". | `HomeScreen.tsx` |
| Búsquedas frecuentes | Nueva sección con 4 accesos (spec §5). | `HomeScreen.tsx` |

## Traspaso al asistente (preparación del bloque 3)

- **Contrato:** `src/assistant/handoff.ts` define la entrada, el primer mensaje, el texto listo para completar y el contexto (vista, más un borrador que parte solo con operación y tipo, según spec §14).
- **No reutiliza la lógica anterior:** `parseQuery`/`applyInterpretation` interpretaban el texto y aplicaban filtros solos, y el Home ya no los usa. Abrir el asistente no cambia la búsqueda aplicada; lo comprueba la prueba de humo.
- **No simula una conversación:** el panel `AssistantHandoffPanel` dice explícitamente "Vista previa del traspaso. El asistente todavía no responde". Muestra qué recibirá y el botón Enviar está deshabilitado.
- **Comportamiento del panel:**
  - Se superpone sin velo; en mobile se ancla abajo.
  - Escape lo cierra y devuelve el foco al campo de origen.
  - Al cerrarlo se descarta el borrador.

## Color del asistente

Sigue pendiente. Se reutiliza el estilo existente, índigo con el ícono de destello, sin asignar un color semántico nuevo. La muestra para decidir está en [muestra-roles/muestra.png](muestra-roles/muestra.png).

## Alcance de §5 que queda para otros bloques

| Elemento | Motivo |
|---|---|
| Sugerencias de registrado (búsquedas guardadas) | Faltan los controles de prueba de usuario. Se propondrán controles compactos cuando se necesiten. |
| "¿Cuánto podrías pagar? Estimar presupuesto" | La calculadora es del bloque 6. No se muestra un enlace que no funciona. |
| Tarjetas de poder de compra y "Dentro de tu presupuesto" | Bloque 6. |
| "Continúa donde quedaste" | Solo aplica a registrado; requiere historial (bloque 3) y simulación de usuario. |
| Explicación en 3 columnas | Una de las columnas describe la estimación (bloque 6). Se agrega cuando las tres funciones existan. |

## Pendientes que siguen abiertos

- Controles de metro y características (bloque de resultados).
- Selección múltiple de comunas en mobile.
- Errores de lint previos: 15 problemas, todos de `main`; este bloque no agrega ninguno.
- El botón "Asistente IA (Nuevo)" de la cabecera TOCTOC ya existía y todavía no abre nada. Se conecta en el bloque 3.
- La cabecera TOCTOC (`ToctocFullHeader`) no se adapta a mobile: en 390 px recorta la navegación. Es un problema previo, fuera del alcance.
- El modo "Búsqueda IA" de la cabecera de resultados y la pestaña IA del buscador mobile siguen con la lógica anterior, que aplica filtros automáticamente, hasta el bloque 3.

## Comprobaciones realizadas

Prueba de humo con un navegador sin interfaz, teclado real y sin errores de consola:

1. Home sin scroll horizontal en 1440 px y en 390 px.
2. Combobox vacío: 3 sugeridas y la sección de IA.
3. "ñu" muestra Ñuñoa más la sección de IA. El primer Enter elige Ñuñoa y no busca; el segundo Enter busca y lleva a **4 propiedades**, con la cabecera en modo Clásico.
4. Lista, Mapa y Dividida muestran 4.
5. Al volver al inicio aparece "Tu búsqueda ya tiene: Ñuñoa · Ver 4 propiedades · Limpiar", y el combobox muestra "Departamentos en venta en Ñuñoa" como reciente.
6. Las flechas mueven la opción activa y Escape cierra la lista.
7. Con "cerca del metro y con patio", el único resultado es la sección de IA. Enter abre la vista previa del traspaso con ese primer mensaje, el foco va al título, la búsqueda aplicada no cambia, y Escape la cierra y devuelve el foco al combobox.
8. "Providencia" más "Cuéntaselo al asistente" deja "En Providencia, " listo para completar, con el foco en el campo.
9. Mobile: la búsqueda Ñuñoa lleva a 4 propiedades.

`npm run verify:search` sigue pasando y `npm run build` compila.

## Capturas

`capturas-bloque-2/`: Home, combobox (vacío, con comuna, con recientes, con descripción), traspaso al asistente, resultados en modo Clásico y combobox en mobile.
