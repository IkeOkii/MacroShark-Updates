# MacroShark

MacroShark para WPlace en PC y móvil. Autor: Ike. Versión publicada: **Plus.25**.

## Instalación y actualizaciones

Instala [MacroShark.user.js](https://raw.githubusercontent.com/IkeOkii/MacroShark-Updates/main/MacroShark.user.js) desde su enlace directo en Tampermonkey (PC) o mediante **Importar desde enlace** en Stay (iPhone). Mantén una sola copia activa y recarga WPlace. Puedes respaldar tus plantillas como `.oki` antes de reemplazar una instalación anterior.

Este repositorio público es la **única fuente de nuevas versiones**. Los metadatos `@updateURL` y `@downloadURL` del script apuntan al archivo de aquí. Para publicar otra versión, se reemplaza `MacroShark.user.js` en `main` y se aumenta `@version`. Después se actualiza `latest.json` con el mismo número: es el archivo pequeño que consulta el aviso de actualización. Publica el script antes que `latest.json` para que el aviso nunca apunte a un archivo antiguo.

El gestor de scripts puede comprobar el enlace del script; la frecuencia y aplicación de las actualizaciones dependen de Tampermonkey o Stay. El aviso propio de MacroShark permite abrir o copiar el enlace y posponerlo 24 horas. No se almacena ningún token de GitHub en el script. Si instalaste Plus.19 desde el repositorio privado, importa Plus.25 una vez desde el enlace anterior: esa versión no tenía configurada la actualización automática.## Nota de actualizaciones

### Plus.25

- La vista minimizada muestra tres controles verticales junto a la barra lateral de WPlace: abrir panel, Dibujar y activar/detener AutoDraw.
- El tema claro u oscuro usa los colores actuales de WPlace y responde a los cambios sin recargar.
- El estilo normal conserva bordes redondeados; el estilo pixelado toma bordes cuadrados y sombras sólidas.
- El panel ampliado se mantiene dentro de la pantalla al abrirlo desde el borde en móvil.



### Plus.24

- Inicia con una barra reducida inspirada en los controles de WPlace.
- Une cabecera y acciones en un panel flotante; el panel de canvas se mueve y oculta por separado. Ambos se ajustan al borde al soltarlos.
- Presenta las alertas y nuevas versiones como notificaciones de estilo WPlace.
- Importa `.wplace` con su posición geográfica, tamaño y opacidad originales; corrige un redondeo que podía quitar una fila de píxeles.
- Evita montar una segunda interfaz durante la misma carga de página.



### Plus.23

- Elimina el fondo estrellado y la superficie de altura completa: los paneles flotan sobre el mapa.
- El canvas inicia oculto y se abre con «Mostrar canvas» desde el panel principal.
- Reduce el tamaño del script al retirar la imagen de fondo incrustada.



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
