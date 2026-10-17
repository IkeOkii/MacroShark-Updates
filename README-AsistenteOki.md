# AsistenteOki 0.1.0

Asistente independiente de coordenadas y capturas para WPlace en computadora y celular. Puedes utilizarlo por sí solo o junto a MacroShark.

**[Instalar AsistenteOki](https://raw.githubusercontent.com/IkeOkii/MacroShark-Updates/main/AsistenteOki.user.js)**

En Tampermonkey, abre el enlace de instalación o importa el archivo `.user.js`. En Stay, utiliza **Importar desde enlace**. Activa el script y recarga WPlace. Si instalaste la copia **MacroShark Explorador · Prueba**, desactívala antes de activar esta publicación para mantener una sola copia del asistente.

## Herramientas

- Personajes MacroShark, Killua y Doroty, con selector, posición guardada y animaciones de espera, reacción, habla y búsqueda.
- Personaje arrastrable con burbuja que se acomoda al espacio disponible. Diálogos escritos locales.
- **Identificar:** actívalo y toca un píxel para mostrar y copiar su ubicación. Arrastrar o ampliar con dos dedos permite navegar sin seleccionar.
- **Buscar píxel:** escribe cuatro números separados por comas. Ejemplo: `1024, 1024, 200, 300`. También admite el texto completo de BlueMarble o dos coordenadas globales X, Y.
- **Capturar:** elige A, esquina superior izquierda, y B, esquina inferior derecha, en el mapa o mediante sus coordenadas. Guarda la imagen en PNG/JPG o copia sus esquinas para compartir la ubicación. Al mostrar y copiar coordenadas aparecen únicamente cuatro números, sin letras ni posiciones adicionales; la copia de una captura contiene una línea por esquina.

Las coordenadas Tile X/Y van de 0 a 2047 y Pixel X/Y de 0 a 999. Los dos números locales que muestra WPlace dentro de una región no bastan para identificar un punto único: usa las cuatro coordenadas completas o X, Y globales.

La búsqueda llega al centro del píxel sin animación de traslado. Con la paleta cerrada abre su selección nativa. Con la paleta abierta lo resalta sin enviar un clic de selección que pueda preparar pintura. Detén un pintado activo de MacroShark antes de seleccionar puntos o trasladarte con el asistente.

## Capturas y celular

La captura incluye los píxeles publicados del mapa, con ambos extremos incluidos y a resolución original. El límite es de 4.194.304 píxeles y 8192 por lado. La vista previa muestra toda la selección; si editas coordenadas debes generar otra antes de descargar. Cerrar la burbuja cancela una captura en curso.

**Guardar PNG/JPG** solicita una descarga normal. En celular revisa Archivos o Descargas. **Abrir para Fotos** muestra la imagen para mantenerla pulsada y elegir Guardar en Fotos/Guardar imagen desde el menú del dispositivo; no guarda automáticamente en la fototeca.

## Actualizaciones independientes

Este asistente usa su propio nombre, espacio de configuración, versión y enlaces `@updateURL`/`@downloadURL`. El archivo `.meta.js` permite comprobar la versión sin descargar todas las imágenes en cada consulta. La frecuencia y aplicación de actualizaciones dependen del gestor de scripts.

AsistenteOki no reemplaza ni actualiza MacroShark. Su publicación tampoco modifica `latest.json`, que pertenece al aviso de actualización del macro. No añade un bloqueo de pintado por actualización.

## Validación

Comprobado localmente con Chromium de escritorio/móvil, WebKit móvil y MapLibre real: personajes, arrastre, persistencia, identificación, búsqueda exacta sin inercia, guarda de paleta, capturas de varios bloques, PNG/JPG, cancelación, errores de red y convivencia con las flechas de MacroShark.

El guardado final en el navegador y teléfono del usuario sigue pendiente de prueba. El Chrome del entorno automatizado cancela incluso una descarga mínima de blob; allí se comprobaron los bytes y nombres solicitados. WebKit sí guardó los archivos PNG/JPG. La vista para Fotos conserva el menú nativo, pero el guardado en la fototeca debe probarse en un dispositivo real.

Autor del script: Ike. Licencia del código: MPL-2.0.
