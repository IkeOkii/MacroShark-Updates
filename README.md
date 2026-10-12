# MacroShark

MacroShark para WPlace en PC y móvil. Autor: Ike. Versión publicada: **Plus.20**.

## Instalación y actualizaciones

Instala [MacroShark.user.js](https://raw.githubusercontent.com/IkeOkii/MacroShark-Updates/main/MacroShark.user.js) desde su enlace directo en Tampermonkey (PC) o mediante **Importar desde enlace** en Stay (iPhone). Mantén una sola copia activa y recarga WPlace. Puedes respaldar tus plantillas como `.oki` antes de reemplazar una instalación anterior.

Este repositorio público es la **única fuente de nuevas versiones**. Los metadatos `@updateURL` y `@downloadURL` del script apuntan al archivo de aquí. Para publicar otra versión se reemplaza `MacroShark.user.js` en la rama `main` y se aumenta `@version`. El gestor de scripts podrá comprobar ese enlace; la frecuencia y aplicación de las actualizaciones dependen de Tampermonkey o Stay. No se almacena ningún token de GitHub en el script.

Si instalaste Plus.19 desde el repositorio privado, importa Plus.20 una vez desde el enlace anterior. Esa versión previa no tenía configurada la actualización automática.

## Nota de actualizaciones

### Plus.20

- Configura un enlace público estable para las futuras actualizaciones automáticas, sin exponer credenciales.
- Corrige la continuidad de AutoDraw cuando WPlace cierra la paleta después de confirmar una tanda: vuelve a leer el mapa antes de continuar. Ante errores o verificaciones, se pausa.
- Añade un aviso de arranque si falla la carga del panel, para facilitar el diagnóstico en dispositivos móviles.
- Verificaciones locales: sintaxis, arranque simulado en escritorio y móvil, y ciclo de pintado simulado. **El funcionamiento en un iPhone real sigue pendiente de prueba.**

### Plus.19

- Relee el mapa y reabre la paleta tras un pintado confirmado antes de la siguiente tanda.
- Pausa AutoDraw ante errores, verificaciones o cierre manual de la paleta, sin reenviar píxeles a ciegas.
- Conserva las optimizaciones de importación, plantillas `.oki`, lectura de colores y vista previa ligera de Plus.18.

Licencia del script: MPL-2.0.
