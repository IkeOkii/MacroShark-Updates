# MacroShark

MacroShark para WPlace en PC y móvil. Autor: Ike. Versión del archivo: **Plus.32**.

## Instalación y actualizaciones

Instala [MacroShark.user.js](https://raw.githubusercontent.com/IkeOkii/MacroShark-Updates/main/MacroShark.user.js) desde su enlace directo en Tampermonkey (PC) o mediante **Importar desde enlace** en Stay (iPhone). Mantén una sola copia activa y recarga WPlace. Puedes respaldar tus plantillas como `.oki` antes de reemplazar una instalación anterior.

Este repositorio público es la **única fuente de nuevas versiones**. Los metadatos `@updateURL` y `@downloadURL` del script apuntan al archivo de aquí. Para publicar otra versión, se reemplaza `MacroShark.user.js` en `main` y se aumenta `@version`. Después se actualiza `latest.json` con el mismo número: es el archivo pequeño que consulta el aviso a pantalla completa. Publica el script antes que `latest.json` para que el aviso nunca apunte a un archivo antiguo.

El gestor de scripts puede comprobar el enlace del script; la frecuencia y aplicación de las actualizaciones dependen de Tampermonkey o Stay. El aviso propio de MacroShark permite abrir o copiar el enlace. Al detectar una versión nueva, bloquea las funciones de pintado hasta actualizar; si cierras el aviso, el botón del macro se convierte en acceso para volver a abrirlo. No se almacena ningún token de GitHub en el script. Si instalaste Plus.19 desde el repositorio privado, importa Plus.32 una vez desde el enlace anterior: esa versión no tenía configurada la actualización automática.

## Nota de actualizaciones

### Plus.32

- Al volver a abrir la barra de colores tras una pausa, vuelve a consultar cuenta y mapa automáticamente; ya no aparece «Reanudar tras revisar». Las verificaciones y esperas pendientes siguen respetándose, y AutoDraw no se reinicia por sí solo.
- Cada nueva tanda lee las teselas después de abrir la paleta. Los píxeles preparados que aún no se confirmaron siguen protegidos contra repintado, pero ya no suman al avance como si estuvieran pintados.
- Retira los mensajes de estado del panel principal y el botón Edición de Canvas. La ventana de Canvas queda por encima de los accesos laterales cuando está abierta para que estos no tapen sus controles.
- Los botones activos usan el color actual de «Pintar» de WPlace, tanto en el tema azul como en el morado.

### Plus.31

- El panel principal muestra cuatro botones: Velocidad de pintado, Confirmar pintado, Configurar AutoDraw y Capturar imagen. Dibujar, AutoDraw y Canvas permanecen en la columna lateral; Edición está dentro de Canvas y Configurar pintado en la cabecera.
- Velocidad de pintado alterna entre x1, x2 y x4. Ajusta la espera entre píxeles preparados a 40, 20 o 10 ms, respectivamente; no altera la recarga de píxeles, las esperas de confirmación ni garantiza que WPlace acepte el ritmo. x1 muestra una nota de prudencia sin prometer invisibilidad.
- Confirmar pintado queda activo al instalar Plus.31 por primera vez, incluso al actualizar desde una versión anterior. Al terminar Dibujar confirma la tanda automáticamente; desactivado, deja los píxeles preparados. Después se conserva la elección del usuario. AutoDraw mantiene su confirmación automática.
- Capturar imagen abre un panel centrado. En móvil y PC permite tocar los píxeles A y B en el mapa, muestra sus coordenadas, carga una vista previa y ofrece guardar el PNG mediante el menú de compartir compatible o descarga.
- El tiburón se coloca sobre Canvas, Dibujar y AutoDraw en una columna vertical alineada con los controles laterales de WPlace. Los avisos ordinarios pasan al centro superior para no cubrir esa columna.

### Plus.30

- En móvil, el tiburón minimizado se coloca encima de «Pintar» cuando la paleta está cerrada. Con la paleta abierta aparece a la izquierda de los controles de su cabecera, sin tapar la información.
- Corrige el botón que quedaba como una X tras minimizar: el tiburón vuelve a mostrarse siempre que el panel esté cerrado.
- Los accesos rápidos de Canvas, Dibujar y AutoDraw se alinean debajo del último botón lateral de WPlace. Adoptan su tamaño, los colores del tema y la forma redonda o cuadrada del modo visual activo.

### Plus.29

- El botón del tiburón usa el color de «Pintar» de WPlace al estar minimizado. Con la paleta abierta se integra como control pequeño en su barra; al expandir MacroShark se convierte en una X para cerrarlo.
- El acceso rápido a Canvas aparece arriba de Dibujar y AutoDraw.
- Los píxeles preparados pero aún sin confirmar se conservan al leer de nuevo el mapa; así una tanda interrumpida continúa sin volver a prepararlos. Se descartan si la paleta visible indica que no hay píxeles pendientes y se resincronizan tras la confirmación.
- Los avisos ordinarios desaparecen en diez segundos. El aviso de actualización permanece hasta cerrarlo y, mientras exista una versión más nueva, las funciones de pintado quedan bloqueadas.
- Reduce el logo incrustado de 863 KB a 23 KB sin cambiar su diseño. El script completo pasa de aproximadamente 1,5 MB a 0,39 MB para facilitar su carga en Stay y Safari.

### Plus.28

- Sustituye el menú flotante principal por una barra de pintura horizontal, adaptable a PC y móvil. El botón con el tiburón aparece junto a «Pintar» de WPlace y abre o minimiza la barra.
- Agrupa Dibujar, Configurar pintado, Capturar imagen, Edición, AutoDraw, Configurar AutoDraw y Canvas en la barra. Los tres accesos rápidos de la derecha conservan Dibujar, AutoDraw y Canvas.
- Canvas permanece centrado al cambiar su contenido o el tamaño de la pantalla. Su cabecera ya no tiene minimizador: se cierra con la X.
- Cada plantilla conserva sus opciones en el detalle de Canvas, incluido restablecer su tamaño. Retira el panel de opciones que aparecía debajo de la imagen colocada en el mapa.
- Oculta la imagen colocada cuando el zoom del mapa baja del nivel en que se muestran los píxeles y vuelve a mostrarla al acercarse.
- Ajusta formas y sombras para los modos normal y pixelado y los temas claro y oscuro. Corrige la selección del botón visible «Pintar» cuando WPlace mantiene otro oculto en la página.

### Plus.27

- Aplica los colores del tema actual de WPlace a los paneles principales, menús de imagen, guía, avisos y botones del macro.
- Usa paneles y botones redondeados con el diseño normal; adopta esquinas cuadradas y sombras sólidas con la interfaz pixelada.
- Conserva la galería de canvas y los modos de pintado individuales añadidos en Plus.26.

### Plus.26

- Al minimizar, los tres controles se alinean con la barra derecha de WPlace, incluso después de mover el panel o cambiar el tamaño de la pantalla.
- El panel de canvas presenta las plantillas como galería con nombre, resolución, avance y búsqueda.
- Al seleccionar una plantilla se abre su vista detallada con modo de pintado, opacidad y opciones propias. Cada plantilla conserva su modo de forma independiente.
- Mantiene el diseño adaptable a los temas claro, oscuro y pixelado en PC y móvil.

### Plus.25

- La vista minimizada muestra tres controles verticales junto a la barra lateral de WPlace: abrir panel, Dibujar y activar/detener AutoDraw.
- El tema claro u oscuro usa los colores actuales de WPlace y responde a los cambios sin recargar.
- El estilo normal conserva bordes redondeados; el estilo pixelado toma bordes cuadrados y sombras sólidas.
- El panel ampliado se mantiene dentro de la pantalla al abrirlo desde el borde en móvil.

### Plus.24

- Inicia con una barra reducida inspirada en los controles de WPlace. Conserva ampliar, dibujar, AutoDraw, configuración y canvas.
- Une cabecera y acciones en un panel flotante; el panel de canvas se mueve y oculta por separado. Ambos se ajustan al borde al soltarlos.
- Presenta las alertas y nuevas versiones como notificaciones de estilo WPlace, sin cubrir toda la pantalla.
- Importa `.wplace` con su posición geográfica, tamaño y opacidad originales. Corrige un redondeo que podía quitar una fila de píxeles.
- Evita montar una segunda interfaz durante la misma carga de página.

### Plus.23

- Retira el fondo estrellado y la superficie que cubría toda la altura de la pantalla. Los controles quedan como paneles flotantes sobre el mapa.
- El panel de canvas empieza oculto y se abre desde «Mostrar canvas» en el panel principal. Se conserva el control para volver a ocultarlo.
- Reduce el tamaño del archivo al retirar la imagen de fondo incrustada. Comprueba la vista en PC y móvil simulados.

### Plus.22

- Divide los controles y las imágenes en dos paneles visuales. El panel principal se minimiza a cuatro controles: ampliar, Dibujar, iniciar/detener AutoDraw y configurar AutoDraw.
- Añade «Mostrar/Ocultar canvas» para abrir o cerrar el panel de imágenes de forma independiente. Los controles activos se muestran en verde.
- Añade el botón de comprobación inmediata de actualizaciones junto a la guía. Actualiza la guía integrada y conserva el fondo estrellado.
- Verificaciones locales: sintaxis, diseño y controles en escritorio y móvil simulados, aviso de actualización y ciclo de pintado.

### Plus.21

- Avisa a pantalla completa cuando detecta una versión nueva, con enlace de instalación e instrucciones para Stay. Comprueba al abrir WPlace y cada 30 minutos mientras siga abierto.
- AutoDraw confirma automáticamente cada tanda aunque «Pintar automáticamente» de Dibujar esté apagado. Conserva las pausas ante errores, límites y verificaciones.
- Actualiza la guía integrada. Pruebas locales del aviso en escritorio y móvil simulados, y de la confirmación de AutoDraw.

### Plus.20

- Configura un enlace público estable para las futuras actualizaciones automáticas, sin exponer credenciales.
- Mejora la continuidad de AutoDraw cuando WPlace cierra la paleta después de confirmar una tanda: vuelve a leer el mapa antes de continuar. Ante errores o verificaciones, se pausa.
- Añade un aviso de arranque si falla la carga del panel, para facilitar el diagnóstico en dispositivos móviles.
- Verificaciones locales: sintaxis, arranque simulado en escritorio y móvil, y ciclo de pintado simulado. El funcionamiento en un iPhone real sigue pendiente de prueba.

### Plus.19

- Relee el mapa y reabre la paleta tras un pintado confirmado antes de la siguiente tanda.
- Pausa AutoDraw ante errores, verificaciones o cierre manual de la paleta, sin reenviar píxeles a ciegas.
- Conserva las optimizaciones de importación, plantillas `.oki`, lectura de colores y vista previa ligera de Plus.18.

Licencia del script: MPL-2.0.
