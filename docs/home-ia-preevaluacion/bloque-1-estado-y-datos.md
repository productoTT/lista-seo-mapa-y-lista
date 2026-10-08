# Bloque 1: estado compartido, borrador y datos

Rama `home-ia-preevaluacion`. Es un experimento: no se integra a `main`.

## Qué cambió

| Área | Cambio | Dónde |
|---|---|---|
| Estado de búsqueda | Hay una sola búsqueda aplicada (`Filters` y `AdvancedFilters` se unen en `SearchCriteria`). Cada criterio guarda su origen: usuario, asistente, guardada, estimación o pre-evaluación. Se puede recuperar la búsqueda anterior ("Volver a la anterior"). El borrador del asistente está separado y no filtra resultados hasta que se aplica. | `src/search/searchState.ts`, `src/search/useSearchState.ts` |
| Reglas de coincidencia | Entre comunas aplica OR. Entre categorías aplica AND. Las características se cumplen todas. Un valor desconocido no coincide con un filtro específico. | `src/search/criteria.ts` |
| Etiquetas y chips | Escritorio, panel de filtros y mobile usan las mismas etiquetas y la misma forma de quitar un criterio. | `activeCriteria`, `removalPatch` en `criteria.ts` |
| Comunas | Se pueden elegir varias comunas en la cabecera de resultados de escritorio (modo Clásico). Los títulos y las migas las nombran todas ("Ñuñoa y Providencia"). | `ResultsHeader.tsx`, `SeoPageInfo.tsx` |
| Tipo | Se agrega "Todos los tipos" en el Home y en la cabecera de resultados. | `HomeScreen.tsx`, `ResultsHeader.tsx` |
| Dormitorios | Opciones: Cualquiera, Studio, 1+, 2+, 3+ y 4+. Studio incluye solo estudios **declarados** (`isStudio`). Los tipos sin dormitorios (oficinas) y los datos desconocidos no coinciden cuando hay filtro. | `AdvancedFiltersContent.tsx`, `MobileSearchModal.tsx`, `src/data/propertyFacts.ts` |
| Etiqueta "Studio" | Las tarjetas de lista, la ficha resumida, las tarjetas del mapa (escritorio y mobile) y la ficha completa muestran "Studio". "0 dormitorios" no alcanza para decidirlo: en una oficina significa "no aplica", y en una vivienda sin estudio declarado, "dato desconocido". En ambos casos el dato se oculta. | `bedroomInfo`, `bedroomsText` en `propertyFacts.ts` |
| Baños, nueva/usada, superficie | Ahora sí filtran. Antes mostraban un chip, pero no cambiaban los resultados. | `criteria.ts` |
| Precio | Se conservan los rangos actuales. Los montos en pesos se calculan con la UF única. Queda preparado `budgetCap` para el tope de poder de compra, que solo aplica a compra y todavía no tiene interfaz. | `AdvancedFiltersContent.tsx`, `criteria.ts` |
| UF | Se usa una UF ficticia de $39.000 en todo el prototipo. | `src/data/uf.ts` |
| Datos | Se agregan minutos caminando al metro y características (terraza, estacionamiento, mascotas, patio, bodega) a las 40 propiedades. | `src/data/mockProperties.ts` |
| Tokens | Se copian los tokens del sistema de diseño sin modificarlos. Los componentes tocados usan tokens de valor idéntico al anterior. | `src/styles/ds-tokens/` |

## Diferencias con `main` que se ven en pantalla

- **Barrio, tour virtual y video están ocultos** en "Más filtros", tanto en escritorio como en mobile. No hay datos ni filtrado para ellos. Los campos siguen en el tipo `AdvancedFilters` para no romper la forma del estado.
- **El selector de dormitorios** cambia de valor exacto (Studio, 1, 2, 3, 4+) a Cualquiera, Studio, 1+, 2+, 3+ y 4+. Se quita el rango "desde–hasta" de dormitorios, porque solo usaba el "desde".
- **Los precios en UF cambian alrededor de un 2,6%,** porque antes se calculaban con 38.000 y ahora con 39.000. Los rangos en pesos de "Más filtros" se recalculan con la misma UF.
- **"Más filtros" de escritorio:** los botones de baños rápidos ahora también limpian el máximo de baños, como ya pasaba en mobile.
- **Los chips de mobile** ahora incluyen baños, que antes no aparecían, y usan "Studio" en lugar de "Estudio".
- **Las casillas Nueva/Usada de escritorio** pasan a ser casillas nativas, operables con teclado. Se ven igual que antes.

## Cambios en los datos ficticios

- **Propiedades 3 y 19:** se declaran como estudio (`isStudio: true`, 0 dormitorios), porque su descripción dice "Studio". Son los únicos estudios y ambos están en arriendo.
- **Propiedad 3:** gana estacionamiento y bodega, porque su descripción los menciona.
- **Metro desconocido** a propósito en las propiedades 15, 17 y 39.
- **Características desconocidas** en la propiedad 21, que ya era el caso de "datos incompletos" de la ficha.

## Accesibilidad incluida en este bloque

- Los botones de opción (dormitorios, baños, precio, superficie y opciones de los menús) anuncian si están seleccionados.
- Los botones para quitar un chip dicen qué quitan ("Quitar Providencia").
- Los menús desplegables anuncian si están abiertos y se cierran con Escape, devolviendo el foco al botón que los abrió.
- El campo de comunas tiene nombre accesible y agrega la primera coincidencia con Enter.

## Pendiente (fuera de este bloque)

| Pendiente | Estado |
|---|---|
| Controles de metro y características | Existen en los datos y en las reglas de filtrado, pero todavía no tienen controles en la interfaz. Se revisan con el bloque de resultados. |
| Selección múltiple de comunas en mobile | El selector muestra "N comunas seleccionadas", pero al elegir una reemplaza la selección. Se resuelve en la revisión mobile. |
| Errores de lint previos | `npm run lint` marca 15 problemas (14 errores y 1 advertencia), todos de `main`, donde eran 18. Este bloque no agrega ninguno. No se corrigen aquí para no tocar archivos fuera del alcance. |
| Orden "Más cerca del metro" | Se mantiene el orden actual, por decisión. Se revisa con resultados. |
| Tema oscuro | El sistema de diseño no lo define. |

## Cómo verificar

```bash
npm run verify:search   # reglas, estado compartido y conteos esperados
npm run build
```
