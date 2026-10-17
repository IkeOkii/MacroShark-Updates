// ==UserScript==
// @name         MacroShark
// @namespace    macroshark-ike
// @version      Plus.37
// @description  Macro para WPlace en PC y móvil: plantillas por selección, captura, coordenadas y AutoDraw
// @author       Ike
// @license      MPL-2.0
// @run-at       document-start
// @match        *://wplace.live/*
// @updateURL    https://raw.githubusercontent.com/IkeOkii/MacroShark/main/MacroShark.user.js
// @downloadURL  https://raw.githubusercontent.com/IkeOkii/MacroShark/main/MacroShark.user.js
// @grant        unsafeWindow
// @grant        GM_info
// @connect      wplace.live
// @connect      backend.wplace.live
// Wplace  --> https://wplace.live
// ==/UserScript==

/*
 *  ██╗██╗  ██╗███████╗ ██████╗ ██╗  ██╗██╗
 *  ██║██║ ██╔╝██╔════╝██╔═══██╗██║ ██╔╝██║
 *  ██║█████╔╝ █████╗  ██║   ██║█████╔╝ ██║
 *  ██║██╔═██╗ ██╔══╝  ██║   ██║██╔═██╗ ██║
 *  ██║██║  ██╗███████╗╚██████╔╝██║  ██╗██║
 *  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝
 *
 *                    Ike
 */

;
const MACROSHARK_STRATEGIES = [["LEFT", "Izquierda a derecha", "Left to right"], ["RIGHT", "Derecha a izquierda", "Right to left"], ["DOWN", "Arriba hacia abajo", "Top to bottom"], ["UP", "Abajo hacia arriba", "Bottom to top"], ["SPIRAL_FROM_CENTER", "Circular hacia afuera", "Circular outward"], ["SPIRAL_TO_CENTER", "Circular hacia adentro", "Circular inward"], ["EDGE_OUT", "Borde hacia afuera", "Edges outward"], ["EDGE_IN", "Borde hacia adentro", "Edges inward"], ["HUMANIZED", "Pintado humanizado", "Humanized painting"], ["COLOR_SEQUENCE", "Secuencia de colores", "Color sequence"]];
function macrosharkColorSequence(points, random = Math.random) {
  // Partition only eligible pending pixels, then paint short same-color runs nearby.
  const zones = new Map(),
    side = 24;
  for (const point of points) {
    const zx = Math.floor(point.x / side),
      zy = Math.floor(point.y / side),
      key = zx + ':' + zy;
    if (!zones.has(key)) zones.set(key, {
      x: zx,
      y: zy,
      colors: new Map()
    });
    const colors = zones.get(key).colors;
    if (!colors.has(point.color)) colors.set(point.color, []);
    colors.get(point.color).push(point);
  }
  const orderedZones = [...zones.values()].sort((a, b) => a.y - b.y || (a.y % 2 ? b.x - a.x : a.x - b.x));
  const result = [];
  for (const zone of orderedZones) {
    for (const pixels of zone.colors.values()) {
      for (let i = pixels.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [pixels[i], pixels[j]] = [pixels[j], pixels[i]];
      }
    }
    let previous;
    while (zone.colors.size) {
      const choices = [...zone.colors.entries()].filter(([color]) => zone.colors.size === 1 || color !== previous);
      choices.sort((a, b) => b[1].length - a[1].length);
      const [color, pixels] = choices[0];
      const count = Math.min(pixels.length, 12 + Math.floor(random() * 17));
      for (let i = 0; i < count; i++) result.push(pixels.pop());
      if (!pixels.length) zone.colors.delete(color);
      previous = color;
    }
  }
  return result;
}
function macrosharkNormalizeStrategy(mode) {
  return MACROSHARK_STRATEGIES.some(m => m[0] === mode) ? mode : typeof mode === 'string' && mode.startsWith('HUMAN_') ? 'HUMANIZED' : 'COLOR_SEQUENCE';
}

function zo(o, a) {
  let l = o.indexOf(a);
  if (l !== -1) o.splice(l, 1);
  return l;
}
function Q(o) {
  return new Promise(a => setTimeout(a, o));
}
function Z(o, a, l = ["error"], i = "addEventListener") {
  return new Promise((r, s) => {
    for (let c = 0; c < a.length; c++) o[i]?.(a[c], r);
    for (let c = 0; c < l.length; c++) o[i]?.(l[c], s);
  });
}

var G = "macroshark-settings",
  Zo = [];
var Y = "macroshark:control-session-v5",
  Co = "macroshark:control-settings-v5",
  Go = "macroshark:local-device-id";

function wo() {
  return Po(localStorage, Co, {});
}
function $(o) {
  let a = wo();
  localStorage.setItem(Co, JSON.stringify({
    ...a,
    ...o
  }));
}
function Po(o, a, l) {
  try {
    let i = o.getItem(a);
    if (!i) return l;
    return JSON.parse(i);
  } catch {
    return l;
  }
}
var xo = ["macroshark:locale"],
  bo = {
    en: {
      widgetTitle: "MacroShark",
      draw: "Draw",
      drawAndPaint: "Draw + Paint",
      generalSection: "General",
      actionsSection: "Actions",
      strategySection: "Draw strategy",
      imagesSection: "Images",
      externalToolsSection: "External tools",
      toolColorConverter: "Color converter",
      toolSamuelArchive: "Samuel archive",
      toolEralyonArchive: "Eralyon archive",
      externalToolsHelp: "Opens tools centered on the current Wplace URL zone when lat/lng/zoom are available.",
      progressSection: "Progress",
      addImage: "Add image",
      strategy: "Strategy",
      sequential: "Sequential",
      all: "All",
      percentage: "Percentage",
      opacity: "Opacity",
      random: "Random",
      humanized: "Hand-painted blocks",
      humanSoftDither: "Soft hand dithering",
      humanPatchy: "Patchy hand fill",
      humanSweepArcs: "Arc hand sweeps",
      humanMicroCorrections: "Micro touch-ups",
      humanJitterFill: "Jittered hand fill",
      humanCornerBias: "Corner-first hand pass",
      humanLongStrokes: "Long hand strokes",
      humanTapClusters: "Tap clusters",
      humanMessySpiral: "Messy spiral pass",
      humanDrunkWalk: "Wandering hand path",
      humanNoiseCloud: "Noisy cloud pass",
      humanPatchJump: "Patch hopping",
      humanHesitantLines: "Hesitant hand lines",
      humanOverlapSweeps: "Overlapping hand sweeps",
      humanWobbleDrift: "Wobble drift",
      humanGapRecovery: "Gap recovery pass",
      humanStaircase: "Stair-step hand pass",
      humanEdgeHugger: "Edge-hugging hand pass",
      humanBlobs: "Blobby hand fill",
      humanBacktrack: "Backtracking hand pass",
      humanShakyDiagonal: "Shaky diagonal sweep",
      humanLateFixes: "Late fix-up pass",
      zigzag: "Zigzag",
      brushStrokes: "Brush strokes",
      diagonalBrush: "Diagonal brush",
      scribble: "Scribble",
      crosshatch: "Crosshatch",
      waveSweep: "Wave sweep",
      scatteredLines: "Scattered lines",
      contourJitter: "Contour jitter",
      spiralWobble: "Spiral wobble",
      clusterBursts: "Cluster bursts",
      orbital: "Orbital",
      flowField: "Flow field",
      edgeIn: "Edge in",
      down: "Down",
      up: "Up",
      left: "Left",
      right: "Right",
      spiralOut: "Spiral out",
      spiralIn: "Spiral in",
      resetSize: "Reset size",
      eraseTransparent: "Erase transparent pixels",
      drawColorsInOrder: "Draw colors in order",
      keyboardShortcuts: "Shortcuts",
      shortcutToggleWidget: "Toggle widget",
      shortcutToggleOverlay: "Toggle overlays",
      shortcutMinimizePanel: "Minimize panel",
      shortcutShowPanel: "Show panel",
      shortcutHidePanel: "Hide panel",
      shortcutDraw: "Draw",
      shortcutAddImage: "Add image",
      shortcutOpenSettings: "Open settings",
      shortcutNextImage: "Next image",
      shortcutPreviousImage: "Previous image",
      shortcutColorPanel: "Color panel",
      shortcutLockImage: "Lock image",
      shortcutClickPaintWhenReady: "Wait + click Paint",
      shortcutStartAutoFarm: "Start auto drawing",
      shortcutStopAutoFarm: "Stop auto drawing",
      shortcutColorConverter: "Open color converter",
      shortcutSamuelArchive: "Open Samuel archive",
      shortcutEralyonArchive: "Open Eralyon archive",
      shortcutsHelp: "Shift+B toggle widget · Shift+M minimize panel · Shift+S show panel · Shift+H hide panel · Shift+V hide/show \
overlays · Shift+Enter draw · Shift+I add image · Shift+/ open settings · Shift+N next image · Shift+P previou\
s image · Shift+O color panel (active image) · Shift+L lock/unlock active image · Shift+R wait cooldown and cl\
ick Paint · Shift+F start auto farm · Shift+G stop auto farm",
      language: "Language",
      openConfig: "Config",
      settingsModalTitle: "Settings",
      proxyTitle: "Proxy (Beta)",
      proxyEnabled: "Enable proxy for web requests (beta)",
      shieldTitle: "Shield",
      shieldEnabled: "Enable Script Shield",
      showShortcuts: "Show shortcuts",
      minimize: "Minimize panel",
      expandPanel: "Expand panel",
      panelHidden: "Panel hidden",
      restorePanel: "Restore panel",
      reopenHelp: "Use Shift+B or floating button to reopen",
      mobileControls: "Mobile controls",
      mobileMinimize: "Hide panel",
      mobileShowPanel: "Show panel",
      close: "Close",
      overlayColors: "Overlay colors",
      enabled: "Enabled",
      disabled: "Disabled",
      premium: "Premium",
      buy: "Buy",
      openColorPanel: "Open color panel",
      searchColors: "Search by hex, English or Spanish",
      colorPanelResults: "Color panel results",
      colorPanelHelp: "Turn colors on/off with a click. Drag blocks in the strip or cards in this panel to set which color paints first.",
      colorPanelOrderHint: "Color #1 is painted first.",
      skipUnavailableColors: "Paint only available colors",
      allColorsEnabled: "Enable all colors",
      enableAllColors: "Enable all",
      disableAllColors: "Disable all",
      replaceWith: "Replace with",
      shieldProfile: "Profile",
      shieldProfileAuto: "Auto",
      shieldExpires: "Expires",
      shieldRefreshProfile: "Refresh profile",
      shieldTest: "Test shield + proxy",
      shieldChecker: "Shield checker",
      shieldInfo: "Shield info",
      shieldInfoTitle: "Injected Shield data",
      shieldInfoInjected: "Injected data",
      shieldInfoEnabled: "Protection",
      shieldInfoBrowser: "Detected browser",
      shieldInfoProxyHint: "Proxy hint",
      shieldInfoProfiles: "Available profiles",
      shieldInfoModules: "Enabled modules",
      publicIpTitle: "Detected public IP",
      publicIpChecking: "Checking IP…",
      publicIpUnavailable: "IP unavailable",
      publicIpProxyRoute: "Browser/proxy route",
      publicIpShieldRoute: "Direct browser route (Shield only)",
      shieldCheckInjected: "Injected shield data present",
      shieldCheckSettings: "Settings stored",
      shieldCheckProfile: "Profile resolved",
      shieldCheckChoices: "Profile choices loaded",
      shieldCheckNavigator: "Navigator spoofing reachable",
      scriptUpdate: "Update script",
      scriptUpdateRequiredTitle: "Update required",
      scriptUpdateRequiredBody: "A new version ({remoteVersion}) is available. Your current version is {currentVersion}. Update to keep using the macro.",
      scriptUpdateOpenUrl: "Open update URL",
      proxyTest: "Test proxy",
      proxyTesting: "Testing proxy…",
      proxyOk: "Proxy OK",
      proxyFail: "Proxy test failed",
      shieldFeatureNavigator: "Navigator",
      shieldFeatureUaData: "UA-Data",
      shieldFeatureScreen: "Screen",
      shieldFeatureTimezone: "Timezone",
      shieldFeatureCanvas: "Canvas",
      shieldFeatureWebgl: "WebGL",
      shieldFeatureAudio: "Audio",
      shieldFeaturePlugins: "Plugins",
      shieldFeatureMediaDevices: "Media devices",
      shieldFeatureStorage: "Storage",
      shieldFeatureBattery: "Battery",
      shieldFeatureSpeech: "Speech",
      shieldFeatureFonts: "Fonts",
      shieldFeatureMatchMedia: "Match media",
      shieldFeatureSharedArrayBuffer: "SharedArrayBuffer",
      smartReplaceMode: "Show smart replacement suggestions",
      previewStrategy: "Preview strategy",
      previewStrategyTitle: "Paint preview",
      previewStrategyHelp: "Animated visual reference of the currently selected paint mode using your current image.",
      captureTemplate: "Capture image",
      captureFormatPrompt: "Capture format (png)",
      exportImage: "Export image settings",
      lockImage: "Lock/unlock image",
      deleteImage: "Delete image",
      toggleOverlay: "Hide/show overlays",
      overlaySection: "Overlay",
      autoFarmSection: "Auto farm",
      configureAutoFarm: "Configure auto farm",
      autoFarmStopped: "Stopped",
      autoFarmRunning: "Running",
      autoFarmModalTitle: "Auto farm timer",
      autoFarmHelp: "Draw random pixels, click Paint, then repeat by timer.",
      autoFarmTimer: "Timer",
      autoFarmPixelsPerCycle: "Pixels per cycle",
      autoFarmStart: "Start auto farm",
      autoFarmStop: "Stop auto farm",
      autoFarmNeedsConfig: "Configure auto farm first",
      autoFarmTransparentUnavailable: "Transparent color unavailable",
      autoFarmNoTransparentTasks: "No drawable pixels were found in viewport",
      autoOverlaySection: "Auto draw",
      configureAutoOverlay: "Configure auto draw",
      autoOverlayStopped: "Stopped",
      autoOverlayRunning: "Running",
      autoOverlayModalTitle: "Auto draw timer",
      autoOverlayHelp: "Draw overlay image pixels, click Paint, then repeat by timer.",
      autoOverlayTimer: "Timer",
      autoOverlayPixelsPerCycle: "Pixels per cycle",
      autoOverlayStart: "Start auto drawing",
      autoOverlayStop: "Stop auto drawing",
      autoOverlayNeedsConfig: "Configure auto draw first",
      autoOverlayNoTasks: "No pending overlay pixels found in images",
      seconds: "Seconds",
      minutes: "Minutes",
      hours: "Hours",
      accessTitle: "Access key",
      accessHelp: "Enter your serial key.",
      accessInputLabel: "Serial key",
      accessInputPlaceholder: "MACROSHARK-********",
      accessContinue: "Continue",
      invalidAccessKey: "Invalid serial key. Please try again.",
      taskInitializing: "Initializing",
      taskAddingImage: "Adding image",
      taskCapturingMapImage: "Capturing map image",
      taskReadingTiles: "Reading tiles",
      taskDrawing: "Drawing",
      taskInitializingDraw: "Initializing draw",
      taskReadingMap: "Reading map",
      taskWaitingFor: "Waiting for",
      taskErrorPrefix: "Error",
      taskWaitingPaintButton: "Waiting for paint button",
      taskWaitingChallengeResolve: "Challenge detected. Auto-solver running before continuing…",
      taskDrawingRandomPixels: "Drawing random pixels",
      taskDrawingOverlayPixels: "Drawing overlay pixels",
      captureHintSelectArea: "Select area",
      loginTitle: "Sign in",
      loginHelp: "Enter your serial key.",
      loginSerialKey: "Serial key",
      loginSubmit: "Validate serial",
      loginChecking: "Checking...",
      loginErrorUnknown: "Could not sign in. Try again later.",
      accessDenied: "Access denied by Control API.",
      accessLoginRequired: "Sign in to continue.",
      accessDeviceLimit: "Device limit reached for this serial key.",
      runtimeBetaRequiredTitle: "No special Tampermonkey version is required.",
      runtimeBetaRequiredBody: "No special Tampermonkey version is required.",
      runtimeBetaInstall: "Continue",
      runtimeReload: "Reload",
      accountInfoTitle: "User information",
      accountInfoRefresh: "Refresh information",
      accountInfoLoading: "Loading information",
      settingsAccessStatus: "Access status",
      settingsApiMode: "API mode",
      settingsControlUser: "Control API session",
      settingsLicenseUser: "License username",
      settingsUserRole: "Role",
      settingsSerialStatus: "Serial status",
      settingsSerialValidatedAt: "Serial validated at",
      settingsLicenseOwner: "License owner",
      settingsDeviceLimit: "Device limit",
      settingsWplaceId: "WPlace ID",
      settingsWplaceName: "WPlace name",
      settingsDiscord: "Discord",
      settingsDiscordId: "Discord ID",
      settingsCountry: "Country",
      settingsAlliance: "Alliance",
      settingsAllianceRole: "Alliance role",
      settingsLevel: "Level",
      settingsPixelsPainted: "Pixels painted",
      settingsDroplets: "Droplets",
      settingsCharges: "Charges",
      settingsCustomer: "Customer",
      settingsSuspension: "Suspension",
      settingsTimeout: "Timeout until",
      settingsLocalDeviceId: "Local device ID",
      settingsFingerprint: "Device fingerprint",
      settingsUserAgent: "User agent",
      settingsPlatform: "Platform",
      settingsLanguage: "Language",
      settingsTimezone: "Timezone",
      settingsScreen: "Screen",
      settingsTouchSupport: "Touch support",
      settingsHardwareConcurrency: "CPU threads",
      settingsDeviceMemory: "Device memory",
      settingsMacAddress: "MAC address",
      settingsMacUnavailable: "Unavailable from browser",
      autoFarmUsePixelRange: "Use pixel range in Farm",
      autoDrawUsePixelRange: "Use pixel range in Auto Draw",
      pixelRange: "Pixel range",
      pixelRangeMin: "Minimum pixels",
      pixelRangeMax: "Maximum pixels",
      pixelRangeInvalid: "The minimum range cannot be greater than the maximum.",
      widgetImagesCollapse: "Collapse images",
      widgetImagesExpand: "Expand images",
      nextRunIn: "next in"
    },
    es: {
      widgetTitle: "MacroShark Macro",
      draw: "Dibujar",
      drawAndPaint: "Dibujar + Pintar",
      generalSection: "General",
      actionsSection: "Acciones",
      strategySection: "Estrategia de pintado",
      imagesSection: "Imágenes",
      externalToolsSection: "Herramientas externas",
      toolColorConverter: "Convertidor de color",
      toolSamuelArchive: "Archivo Samuel",
      toolEralyonArchive: "Archivo Eralyon",
      externalToolsHelp: "Abre herramientas centradas en la zona actual de la URL de Wplace cuando hay lat/lng/zoom.",
      progressSection: "Progreso",
      addImage: "Agregar imagen",
      strategy: "Estrategia",
      sequential: "Secuencial",
      all: "Todo",
      percentage: "Porcentaje",
      opacity: "Opacidad",
      random: "Aleatorio",
      humanized: "Bloques pintados a mano",
      humanSoftDither: "Difuminado manual suave",
      humanPatchy: "Relleno manual por parches",
      humanSweepArcs: "Barridos manuales en arco",
      humanMicroCorrections: "Micro retoques manuales",
      humanJitterFill: "Relleno manual con temblor",
      humanCornerBias: "Barrido manual desde esquinas",
      humanLongStrokes: "Trazos manuales largos",
      humanTapClusters: "Toques manuales por grupos",
      humanMessySpiral: "Espiral manual desordenada",
      humanDrunkWalk: "Recorrido manual inestable",
      humanNoiseCloud: "Nube manual con ruido",
      humanPatchJump: "Saltos manuales entre parches",
      humanHesitantLines: "Líneas manuales con duda",
      humanOverlapSweeps: "Barridos manuales superpuestos",
      humanWobbleDrift: "Deriva manual temblorosa",
      humanGapRecovery: "Pasada manual de relleno de huecos",
      humanStaircase: "Pasada manual en escalera",
      humanEdgeHugger: "Pasada manual pegada al borde",
      humanBlobs: "Relleno manual en manchas",
      humanBacktrack: "Pasada manual con retrocesos",
      humanShakyDiagonal: "Barrido diagonal tembloroso",
      humanLateFixes: "Retoques manuales al final",
      zigzag: "Zigzag",
      brushStrokes: "Pinceladas",
      diagonalBrush: "Pincel diagonal",
      scribble: "Garabato",
      crosshatch: "Tramado",
      waveSweep: "Barrido ondulado",
      scatteredLines: "Líneas dispersas",
      contourJitter: "Contorno irregular",
      spiralWobble: "Espiral oscilante",
      clusterBursts: "Ráfagas por grupos",
      orbital: "Orbital",
      flowField: "Campo fluido",
      edgeIn: "Borde hacia adentro",
      down: "Abajo",
      up: "Arriba",
      left: "Izquierda",
      right: "Derecha",
      spiralOut: "Espiral hacia fuera",
      spiralIn: "Espiral hacia dentro",
      resetSize: "Restablecer tamaño",
      eraseTransparent: "Borrar píxeles transparentes",
      drawColorsInOrder: "Dibujar colores en orden",
      keyboardShortcuts: "Atajos",
      shortcutToggleWidget: "Mostrar/ocultar widget",
      shortcutToggleOverlay: "Mostrar/ocultar overlays",
      shortcutMinimizePanel: "Minimizar panel",
      shortcutShowPanel: "Mostrar panel",
      shortcutHidePanel: "Ocultar panel",
      shortcutDraw: "Dibujar",
      shortcutAddImage: "Agregar imagen",
      shortcutOpenSettings: "Abrir configuración",
      shortcutNextImage: "Siguiente imagen",
      shortcutPreviousImage: "Imagen anterior",
      shortcutColorPanel: "Panel de colores",
      shortcutLockImage: "Bloquear imagen",
      shortcutClickPaintWhenReady: "Esperar + click en Pintar",
      shortcutStartAutoFarm: "Iniciar auto dibujo",
      shortcutStopAutoFarm: "Detener auto dibujo",
      shortcutColorConverter: "Abrir convertidor de color",
      shortcutSamuelArchive: "Abrir archivo Samuel",
      shortcutEralyonArchive: "Abrir archivo Eralyon",
      shortcutsHelp: "Shift+B mostrar widget · Shift+M minimizar panel · Shift+S mostrar panel · Shift+H ocultar panel · Shift+V oc\
ultar/mostrar overlays · Shift+Enter dibujar · Shift+I agregar imagen · Shift+/ abrir configuración · Shift+N \
siguiente imagen · Shift+P imagen anterior · Shift+O panel de colores (imagen activa) · Shift+L bloquear/desbl\
oquear imagen activa · Shift+R esperar cooldown y click en Pintar · Shift+F iniciar auto farm · Shift+G detene\
r auto farm",
      language: "Idioma",
      openConfig: "Config",
      settingsModalTitle: "Configuración",
      proxyTitle: "Proxy (Beta)",
      proxyEnabled: "Habilitar proxy para solicitudes web (beta)",
      shieldTitle: "Shield",
      shieldEnabled: "Activar Script Shield",
      showShortcuts: "Ver atajos",
      minimize: "Minimizar panel",
      expandPanel: "Expandir panel",
      panelHidden: "Panel oculto",
      restorePanel: "Restaurar panel",
      reopenHelp: "Usa Shift+B o el botón flotante para reabrir",
      mobileControls: "Controles móviles",
      mobileMinimize: "Ocultar panel",
      mobileShowPanel: "Mostrar panel",
      close: "Cerrar",
      overlayColors: "Colores del overlay",
      enabled: "Activo",
      disabled: "Desactivado",
      premium: "Premium",
      buy: "Comprar",
      openColorPanel: "Abrir panel de colores",
      searchColors: "Buscar por hexa, inglés o español",
      colorPanelResults: "Resultados del panel de color",
      colorPanelHelp: "Activa o desactiva colores con un clic. Arrastra bloques en la barra o tarjetas en este panel para definir qué color se pinta primero.",
      colorPanelOrderHint: "El color #1 se pinta primero.",
      skipUnavailableColors: "Pintar solo colores disponibles",
      allColorsEnabled: "Activar todos los colores",
      enableAllColors: "Activar todos",
      disableAllColors: "Desactivar todos",
      replaceWith: "Reemplazar por",
      shieldProfile: "Perfil",
      shieldProfileAuto: "Auto",
      shieldExpires: "Expira",
      shieldRefreshProfile: "Refrescar perfil",
      shieldTest: "Probar shield + proxy",
      shieldChecker: "Shield checker",
      shieldInfo: "Info Shield",
      shieldInfoTitle: "Data inyectada del Shield",
      shieldInfoInjected: "Data inyectada",
      shieldInfoEnabled: "Protección",
      shieldInfoBrowser: "Navegador detectado",
      shieldInfoProxyHint: "Pista de proxy",
      shieldInfoProfiles: "Perfiles disponibles",
      shieldInfoModules: "Módulos activos",
      publicIpTitle: "IP pública detectada",
      publicIpChecking: "Comprobando IP…",
      publicIpUnavailable: "IP no disponible",
      publicIpProxyRoute: "Ruta navegador/proxy",
      publicIpShieldRoute: "Ruta directa del navegador (solo Shield)",
      shieldCheckInjected: "Data inyectada del Shield presente",
      shieldCheckSettings: "Configuración guardada",
      shieldCheckProfile: "Perfil resuelto",
      shieldCheckChoices: "Perfiles cargados",
      shieldCheckNavigator: "Spoof de navegador accesible",
      scriptUpdate: "Actualizar script",
      scriptUpdateRequiredTitle: "Actualización requerida",
      scriptUpdateRequiredBody: "Hay una versión nueva ({remoteVersion}) disponible. Tu versión actual es {currentVersion}. Actualiza para seguir usando la macro.",
      scriptUpdateOpenUrl: "Abrir URL de actualización",
      proxyTest: "Test proxy",
      proxyTesting: "Probando proxy…",
      proxyOk: "Proxy OK",
      proxyFail: "Falló el test del proxy",
      shieldFeatureNavigator: "Navegador",
      shieldFeatureUaData: "UA-Data",
      shieldFeatureScreen: "Pantalla",
      shieldFeatureTimezone: "Zona horaria",
      shieldFeatureCanvas: "Canvas",
      shieldFeatureWebgl: "WebGL",
      shieldFeatureAudio: "Audio",
      shieldFeaturePlugins: "Plugins",
      shieldFeatureMediaDevices: "Dispositivos",
      shieldFeatureStorage: "Almacenamiento",
      shieldFeatureBattery: "Batería",
      shieldFeatureSpeech: "Voz",
      shieldFeatureFonts: "Fuentes",
      shieldFeatureMatchMedia: "Match media",
      shieldFeatureSharedArrayBuffer: "SharedArrayBuffer",
      smartReplaceMode: "Mostrar sugerencias inteligentes de reemplazo",
      previewStrategy: "Estrategia de vista previa",
      previewStrategyTitle: "Previsualización de pintado",
      previewStrategyHelp: "Referencia visual animada del modo de pintado seleccionado usando tu imagen actual.",
      captureTemplate: "Capturar imagen",
      captureFormatPrompt: "Formato de captura (png)",
      exportImage: "Exportar configuración de imagen",
      lockImage: "Bloquear/desbloquear imagen",
      deleteImage: "Eliminar imagen",
      toggleOverlay: "Ocultar/mostrar overlays",
      overlaySection: "Superposición",
      autoFarmSection: "Auto farm",
      configureAutoFarm: "Configurar auto farm",
      autoFarmStopped: "Detenido",
      autoFarmRunning: "Activo",
      autoFarmModalTitle: "Temporizador auto farm",
      autoFarmHelp: "Dibuja píxeles aleatorios, pulsa Pintar y repite por temporizador.",
      autoFarmTimer: "Temporizador",
      autoFarmPixelsPerCycle: "Píxeles por ciclo",
      autoFarmStart: "Iniciar auto farm",
      autoFarmStop: "Detener auto farm",
      autoFarmNeedsConfig: "Primero configura el auto farm",
      autoFarmTransparentUnavailable: "Color transparente no disponible",
      autoFarmNoTransparentTasks: "No se encontraron píxeles dibujables en vista",
      autoOverlaySection: "Auto draw",
      configureAutoOverlay: "Configurar auto draw",
      autoOverlayStopped: "Detenido",
      autoOverlayRunning: "Activo",
      autoOverlayModalTitle: "Temporizador auto draw",
      autoOverlayHelp: "Dibuja píxeles de la imagen overlay, pulsa Pintar y repite por temporizador.",
      autoOverlayTimer: "Temporizador",
      autoOverlayPixelsPerCycle: "Píxeles por ciclo",
      autoOverlayStart: "Iniciar auto dibujo",
      autoOverlayStop: "Detener auto dibujo",
      autoOverlayNeedsConfig: "Primero configura el auto draw",
      autoOverlayNoTasks: "No hay píxeles pendientes en las imágenes overlay",
      seconds: "Segundos",
      minutes: "Minutos",
      hours: "Horas",
      accessTitle: "Clave de acceso",
      accessHelp: "Ingresa tu serial.",
      accessInputLabel: "Serial",
      accessInputPlaceholder: "MACROSHARK-********",
      accessContinue: "Continuar",
      invalidAccessKey: "Serial inválido. Inténtalo de nuevo.",
      taskInitializing: "Inicializando",
      taskAddingImage: "Agregando imagen",
      taskCapturingMapImage: "Capturando imagen del mapa",
      taskReadingTiles: "Leyendo teselas",
      taskDrawing: "Dibujando",
      taskInitializingDraw: "Inicializando dibujo",
      taskReadingMap: "Leyendo mapa",
      taskWaitingFor: "Esperando",
      taskErrorPrefix: "Error",
      taskWaitingPaintButton: "Esperando botón de pintar",
      taskWaitingChallengeResolve: "Se detectó un challenge. Ejecutando auto-solver antes de continuar…",
      taskDrawingRandomPixels: "Dibujando píxeles aleatorios",
      taskDrawingOverlayPixels: "Dibujando píxeles del overlay",
      captureHintSelectArea: "Selecciona área",
      loginTitle: "Iniciar sesión",
      loginHelp: "Ingresa tu serial.",
      loginSerialKey: "Serial",
      loginSubmit: "Validar serial",
      loginChecking: "Validando...",
      loginErrorUnknown: "No se pudo iniciar sesión. Inténtalo más tarde.",
      accessDenied: "Acceso denegado por Control API.",
      accessLoginRequired: "Inicia sesión para continuar.",
      accessDeviceLimit: "Límite de dispositivos alcanzado para este serial.",
      runtimeBetaRequiredTitle: "No se requiere una versión especial de Tampermonkey.",
      runtimeBetaRequiredBody: "No se requiere una versión especial de Tampermonkey.",
      runtimeBetaInstall: "Continuar",
      runtimeReload: "Recargar",
      accountInfoTitle: "Información del usuario",
      accountInfoRefresh: "Actualizar información",
      accountInfoLoading: "Cargando información",
      settingsAccessStatus: "Estado de acceso",
      settingsApiMode: "Modo de API",
      settingsControlUser: "Sesión Control API",
      settingsLicenseUser: "Usuario de licencia",
      settingsUserRole: "Rol",
      settingsSerialStatus: "Estado del serial",
      settingsSerialValidatedAt: "Serial validado en",
      settingsLicenseOwner: "Dueño de licencia",
      settingsDeviceLimit: "Límite de dispositivos",
      settingsWplaceId: "ID de WPlace",
      settingsWplaceName: "Nombre en WPlace",
      settingsDiscord: "Discord",
      settingsDiscordId: "Discord ID",
      settingsCountry: "País",
      settingsAlliance: "Alianza",
      settingsAllianceRole: "Rol en alianza",
      settingsLevel: "Nivel",
      settingsPixelsPainted: "Píxeles pintados",
      settingsDroplets: "Droplets",
      settingsCharges: "Cargas",
      settingsCustomer: "Cliente",
      settingsSuspension: "Suspensión",
      settingsTimeout: "Timeout hasta",
      settingsLocalDeviceId: "ID local del dispositivo",
      settingsFingerprint: "Fingerprint del dispositivo",
      settingsUserAgent: "User agent",
      settingsPlatform: "Plataforma",
      settingsLanguage: "Idioma",
      settingsTimezone: "Zona horaria",
      settingsScreen: "Pantalla",
      settingsTouchSupport: "Soporte táctil",
      settingsHardwareConcurrency: "Hilos CPU",
      settingsDeviceMemory: "Memoria del dispositivo",
      settingsMacAddress: "MAC address",
      settingsMacUnavailable: "No disponible desde navegador",
      autoFarmUsePixelRange: "Usar rango de píxeles en Farm",
      autoDrawUsePixelRange: "Usar rango de píxeles en Auto Draw",
      pixelRange: "Rango de píxeles",
      pixelRangeMin: "Píxeles mínimos",
      pixelRangeMax: "Píxeles máximos",
      pixelRangeInvalid: "El mínimo del rango no puede ser mayor que el máximo.",
      widgetImagesCollapse: "Colapsar imágenes",
      widgetImagesExpand: "Expandir imágenes",
      nextRunIn: "siguiente en"
    }
  };
function Ga() {
  return "es";
}
function oo() {
  let o = localStorage.getItem("macroshark:locale");
  if (o && o in bo) return o;
  for (let a = 0; a < xo.length; a++) {
    let l = localStorage.getItem(xo[a]);
    if (!l || !(l in bo)) continue;
    return localStorage.setItem("macroshark:locale", l), l;
  }
  return Ga();
}
function uo(o) {
  localStorage.setItem("macroshark:locale", o);
}
function f(o) {
  const mode = MACROSHARK_STRATEGIES.find(m => 'macroshark_' + m[0] === o);
  if (mode) return mode[oo() === 'en' ? 2 : 1];
  let a = oo();
  return bo[a][o];
}
function U(o) {
  for (let a of o.querySelectorAll("[data-i18n]")) a.textContent = f(a.dataset.i18n);
  for (let a of o.querySelectorAll("[data-i18n-title]")) a.setAttribute("title", f(a.dataset.i18nTitle));
  for (let a of o.querySelectorAll("[data-i18n-aria-label]")) a.setAttribute("aria-label", f(a.dataset.i18nAriaLabel));
  for (let a of o.querySelectorAll("[data-i18n-placeholder]")) a.setAttribute("placeholder", f(a.dataset.i18nPlaceholder));
}
class SharkDisposable {
  runOnDestroy = [];
  destroy() {
    for (let o = 0; o < this.runOnDestroy.length; o++) this.runOnDestroy[o]();
  }
  populateElementsWithSelector(o, a) {
    for (let l in a) this[l] = o.querySelector(a[l]);
  }
  registerEvent(o, a, l, i = {}) {
    i.passive ??= !0, o.addEventListener(a, l, i), this.runOnDestroy.push(() => {
      o.removeEventListener(a, l, i);
    });
  }
}
function Ho(e) {
  return e > 0.04045 ? ((e + 0.055) / 1.055) ** 2.4 : e / 12.92;
}
function Xo(e, t, o) {
  let i = Ho(e / 255),
    a = Ho(t / 255),
    r = Ho(o / 255),
    n = Math.cbrt(0.4122214708 * i + 0.5363325363 * a + 0.0514459929 * r),
    s = Math.cbrt(0.2119034982 * i + 0.6806995451 * a + 0.1073969566 * r),
    l = Math.cbrt(0.0883024619 * i + 0.2817188376 * a + 0.6299787005 * r),
    c = 0.2104542553 * n + 0.793617785 * s - 0.0040720468 * l,
    u = 1.9779984951 * n - 2.428592205 * s + 0.4505937099 * l,
    p = 0.0259040371 * n + 0.7827717662 * s - 0.808675766 * l;
  return [c, u, p];
}
function Ro(e, t, o) {
  let [i, a, r] = e,
    [n, s, l] = t,
    c = fe => fe * 180 / Math.PI,
    u = fe => fe * Math.PI / 180,
    p = 1,
    h = 1,
    g = 1,
    b = Math.sqrt(a ** 2 + r ** 2),
    y = Math.sqrt(s ** 2 + l ** 2),
    m = (b + y) / 2,
    f = 0.5 * (1 - Math.sqrt(m ** 7 / (m ** 7 + 6103515625))),
    w = a * (1 + f),
    x = s * (1 + f),
    C = Math.sqrt(w ** 2 + r ** 2),
    S = Math.sqrt(x ** 2 + l ** 2),
    M = r === 0 && w === 0 ? 0 : c(Math.atan2(r, w)) % 360,
    T = l === 0 && x === 0 ? 0 : c(Math.atan2(l, x)) % 360,
    R = n - i,
    X = S - C,
    O = 0;
  if (C * S !== 0) {
    if (O = T - M, O > 180) O -= 360;else if (O < -180) O += 360;
  }
  let ae = 2 * Math.sqrt(C * S) * Math.sin(u(O) / 2),
    re = (i + n) / 2,
    ne = (C + S) / 2,
    j = (M + T) / 2;
  if (Math.abs(M - T) > 180) j += 180;
  let mt = 1 - 0.17 * Math.cos(u(j - 30)) + 0.24 * Math.cos(u(2 * j)) + 0.32 * Math.cos(u(3 * j + 6)) - 0.2 * Math.cos(u(4 * j - 63)),
    ft = 1 + 0.015 * (re - 50) ** 2 / Math.sqrt(20 + (re - 50) ** 2),
    _e = 1 + 0.045 * ne,
    Pe = 1 + 0.015 * ne * mt,
    bt = 30 * Math.exp((-((j - 275) / 25)) ** 2),
    yt = -(2 * Math.sqrt(ne ** 7 / (ne ** 7 + 6103515625))) * Math.sin(u(2 * bt));
  return Math.sqrt((R / (1 * ft)) ** 2 + (X / (1 * _e)) ** 2 + (ae / (1 * Pe)) ** 2 + yt * (X / (1 * _e)) * (ae / (1 * Pe))) - R * o;
}
var x = [[Number.NaN, Number.NaN, Number.NaN], [0, 0, 0], [0.356, 0, 0], [0.573, 0, 0], [0.864, 0, 0], [1, 0, 0], [0.31, 0.119, 0.037], [0.603, 0.209, 0.107], [0.732, 0.118, 0.137], [0.791, 0.039, 0.16], [0.895, -0.026, 0.168], [0.974, -0.019, 0.077], [0.691, -0.154, 0.075], [0.812, -0.185, 0.096], [0.898, -0.17, 0.149], [0.541, -0.097, 0.005], [0.678, -0.114, -0.018], [0.814, -0.15, 0.011], [0.447, -0.019, -0.134], [0.65, -0.048, -0.137], [0.895, -0.124, -0.027], [0.561, 0.054, -0.229], [0.771, 0, -0.11], [0.431, 0.145, -0.143], [0.557, 0.168, -0.127], [0.796, 0.102, -0.097], [0.551, 0.225, -0.023], [0.62, 0.238, 0], [0.759, 0.127, 0.006], [0.428, 0.036, 0.041], [0.552, 0.03, 0.092], [0.817, 0.055, 0.097], [0.738, 0, 0], [0.46, 0.163, 0.074], [0.735, 0.134, 0.071], [0.642, 0.137, 0.122], [0.794, 0.023, 0.054], [0.62, -0.005, 0.105], [0.747, -0.019, 0.138], [0.864, -0.023, 0.136], [0.489, -0.06, 0.058], [0.609, -0.092, 0.08], [0.76, -0.099, 0.085], [0.54, -0.067, -0.079], [0.941, -0.064, -0.007], [0.803, -0.05, -0.096], [0.438, 0.048, -0.192], [0.421, 0.03, -0.102], [0.593, 0.036, -0.119], [0.781, 0.031, -0.09], [0.757, 0.036, 0.098], [0.676, 0.076, 0.09], [0.868, 0.051, 0.061], [0.524, 0.087, 0.047], [0.684, 0.091, 0.045], [0.835, 0.068, 0.048], [0.519, 0.022, 0.034], [0.629, 0.017, 0.043], [0.342, -0.004, -0.016], [0.564, 0, -0.038], [0.789, 0.003, -0.035], [0.502, -0.006, 0.055], [0.638, -0.005, 0.047], [0.82, -0.007, 0.053]],
  T = ["NaN", "0,0,0", "60,60,60", "120,120,120", "210,210,210", "255,255,255", "96,0,24", "237,28,36", "255,127,39", "246,170,9", "249,221,59", "255,250,188", "14,185,104", "19,230,123", "135,255,94", "12,129,110", "16,174,166", "19,225,190", "40,80,158", "64,147,228", "96,247,242", "107,80,246", "153,177,251", "120,12,153", "170,56,185", "224,159,249", "203,0,122", "236,31,128", "243,141,169", "104,70,52", "149,104,42", "248,178,119", "170,170,170", "165,14,30", "250,128,114", "228,92,26", "214,181,148", "156,132,49", "197,173,49", "232,212,95", "74,107,58", "90,148,74", "132,197,115", "15,121,159", "187,250,242", "125,199,255", "77,49,184", "74,66,132", "122,113,196", "181,174,241", "219,164,99", "209,128,81", "255,197,165", "155,82,73", "209,128,120", "250,182,164", "123,99,82", "156,132,107", "51,57,65", "109,117,141", "179,185,209", "109,100,63", "148,140,107", "205,197,158"];
function ko(o) {
  if (o === 0) return "transparent";
  let a = x[o],
    l = `oklab(${a[0] * 100}% ${a[1]} ${a[2]})`;
  if (typeof CSS < "u" && CSS.supports("color", l)) return l;
  let [i = 0, r = 0, s = 0] = (T[o] ?? "0,0,0").split(",").map(c => Number.parseInt(c, 10));
  return `rgb(${i} ${r} ${s})`;
}
var Yo = `<div class="wtopbar">\r
  <button\r
    class="open-colors"\r
    type="button"\r
    data-i18n-title="openColorPanel"\r
    data-i18n-aria-label="openColorPanel"\r
  >\r
    <i class="icon fa-solid fa-palette" aria-hidden="true"></i>\r
  </button>\r
  <button\r
    class="open-preview"\r
    type="button"\r
    data-i18n-title="previewStrategyTitle"\r
    data-i18n-aria-label="previewStrategyTitle"\r
  >\r
    <i class="icon fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i>\r
  </button>\r
  <button class="export" data-i18n-title="exportImage" data-i18n-aria-label="exportImage">\r
    <i class="icon fa-solid fa-download" aria-hidden="true"></i>\r
  </button>\r
  <button class="lock" data-i18n-title="lockImage" data-i18n-aria-label="lockImage">\r
    <i class="icon icon-lock-open fa-solid fa-lock-open" aria-hidden="true"></i>\r
    <i class="icon icon-lock-closed fa-solid fa-lock" aria-hidden="true"></i>\r
  </button>\r
  <button class="delete" data-i18n-title="deleteImage" data-i18n-aria-label="deleteImage">\r
    <i class="icon fa-solid fa-trash" aria-hidden="true"></i>\r
  </button>\r
</div>\r
<div class="wrapper">\r
  <div class="wform">\r
    <div class="wprogress">\r
      <div></div>\r
      <span></span>\r
    </div>\r
    <label><span data-i18n="opacity">Opacity</span>:&nbsp;<input class="opacity" type="range" min="0" max="100"/></label>\r
    <label class="strategy-row">\r
      <span data-i18n="previewStrategy">Preview strategy</span>:&nbsp;\r
      <span class="strategy-controls">\r
        <select class="strategy"><option value="LEFT" data-i18n="macroshark_LEFT">Izquierda a derecha</option>
<option value="RIGHT" data-i18n="macroshark_RIGHT">Derecha a izquierda</option>
<option value="DOWN" data-i18n="macroshark_DOWN">Arriba hacia abajo</option>
<option value="UP" data-i18n="macroshark_UP">Abajo hacia arriba</option>
<option value="SPIRAL_FROM_CENTER" data-i18n="macroshark_SPIRAL_FROM_CENTER">Circular hacia afuera</option>
<option value="SPIRAL_TO_CENTER" data-i18n="macroshark_SPIRAL_TO_CENTER">Circular hacia adentro</option>
<option value="EDGE_OUT" data-i18n="macroshark_EDGE_OUT">Borde hacia afuera</option>
<option value="EDGE_IN" data-i18n="macroshark_EDGE_IN">Borde hacia adentro</option>
<option value="HUMANIZED" data-i18n="macroshark_HUMANIZED">Pintado humanizado</option>
<option value="COLOR_SEQUENCE" data-i18n="macroshark_COLOR_SEQUENCE">Secuencia de colores</option></select>\r
        \r
      </span>\r
    </label>\r
    <button class="reset-size"><span data-i18n="resetSize">Reset size</span> [<span></span>px]</button>\r
    <label class="macroshark-switch-row">\r
      <span class="with-icon"><svg class="macroshark-option-icon macroshark-option-icon-transparent" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3" fill="#f8fafc"/><path d="M4 8h16M4 16h16M8 4v16M16 4v16" stroke="#cbd5e1" stroke-width="1.2"/><path d="M7 17L17 7" stroke="#fb7185" stroke-width="2.4" stroke-linecap="round"/><circle cx="17" cy="7" r="2.8" fill="#38bdf8"/><path d="M7 17l3 1.4-1.4-3z" fill="#f59e0b"/></svg><span data-i18n="eraseTransparent">Erase transparent pixels</span></span>\r
      <span class="macroshark-switch">\r
        <input type="checkbox" class="draw-transparent" />\r
        <span class="macroshark-switch-slider" aria-hidden="true"></span>\r
      </span>\r
    </label>\r
    <label class="macroshark-switch-row">\r
      <span class="with-icon"><svg class="macroshark-option-icon macroshark-option-icon-order" viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="2.5" fill="#fb7185"/><circle cx="6" cy="12" r="2.5" fill="#facc15"/><circle cx="6" cy="18" r="2.5" fill="#34d399"/><path d="M11 6h8M11 12h8M11 18h8" stroke="#93c5fd" stroke-width="2.2" stroke-linecap="round"/><path d="M17 4l2 2-2 2M17 10l2 2-2 2M17 16l2 2-2 2" fill="none" stroke="#c084fc" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><span data-i18n="drawColorsInOrder">Draw colors in order</span></span>\r
      <span class="macroshark-switch">\r
        <input type="checkbox" class="draw-colors-in-order" />\r
        <span class="macroshark-switch-slider" aria-hidden="true"></span>\r
      </span>\r
    </label>\r
    <label class="macroshark-switch-row">\r
      <span class="with-icon"><svg class="macroshark-option-icon macroshark-option-icon-available" viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="8" r="3" fill="#ef4444"/><circle cx="16" cy="8" r="3" fill="#22c55e"/><circle cx="8" cy="16" r="3" fill="#3b82f6"/><circle cx="16" cy="16" r="3" fill="#f59e0b"/><path d="M5 13l3 3 6-7" fill="none" stroke="#f8fafc" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.5 15.5l3 3m0-3l-3 3" stroke="#0f172a" stroke-width="1.8" stroke-linecap="round"/></svg><span data-i18n="skipUnavailableColors">Paint only available colors</span></span>\r
      <span class="macroshark-switch">\r
        <input type="checkbox" class="skip-unavailable" />\r
        <span class="macroshark-switch-slider" aria-hidden="true"></span>\r
      </span>\r
    </label>\r
  </div>\r
  <dialog class="macroshark-modal colors-dialog">\r
    <div class="macroshark-modal-head colors-dialog-head">\r
      <strong data-i18n="overlayColors">Overlay colors</strong>\r
      <button\r
        class="modal-close close-colors"\r
        type="button"\r
        aria-label="Close"\r
        data-i18n-aria-label="close"\r
      >\r
        <i class="icon fa-solid fa-xmark" aria-hidden="true"></i>\r
      </button>\r
    </div>\r
    <p class="colors-dialog-help" data-i18n="colorPanelHelp">\r
      Toggle each color to enable/disable it. Drag colors in the strip to reorder paint priority.\r
    </p>\r
    <p class="colors-dialog-help order" data-i18n="colorPanelOrderHint">\r
      Color #1 paints first.\r
    </p>\r
    <div class="color-tools">\r
      <label class="macroshark-switch-row color-bulk-toggle">\r
        <span class="with-icon"><i class="fa-solid fa-palette" aria-hidden="true"></i><span data-i18n="allColorsEnabled">All colors enabled</span></span>\r
        <span class="macroshark-switch">\r
          <input type="checkbox" class="toggle-all-colors" checked />\r
          <span class="macroshark-switch-slider" aria-hidden="true"></span>\r
        </span>\r
      </label>\r
    </div>\r
    <input class="color-search" type="search" data-i18n-placeholder="searchColors" placeholder="Search color by hex, English or Spanish"/>\r
    <div class="colors-dialog-list"></div>\r
  </dialog>\r
  <dialog class="macroshark-modal preview-dialog">\r
    <div class="macroshark-modal-head preview-dialog-head">\r
      <strong data-i18n="previewStrategyTitle">Paint preview</strong>\r
      <button\r
        class="modal-close close-preview"\r
        type="button"\r
        aria-label="Close"\r
        data-i18n-aria-label="close"\r
      >\r
        <i class="icon fa-solid fa-xmark" aria-hidden="true"></i>\r
      </button>\r
    </div>\r
    <p class="preview-dialog-help" data-i18n="previewStrategyHelp">\r
      Referencia visual de MacroShark.\r
    </p>\r
    <label class="strategy-row preview-strategy-row">\r
      <span data-i18n="previewStrategy">Preview strategy</span>:&nbsp;\r
      <span class="strategy-controls">\r
        <select class="preview-strategy-select macroshark-select" data-i18n-aria-label="previewStrategy" aria-label="Preview strategy"></select>\r
      </span>\r
    </label>\r
    <div class="preview-dialog-list"></div>\r
  </dialog>\r
  <button class="resize n" type="button" aria-label="Ajustar tamaño desde arriba"></button>\r
  <button class="resize ne" type="button" aria-label="Ajustar tamaño desde la esquina superior derecha"></button>\r
  <button class="resize e" type="button" aria-label="Ajustar tamaño desde la derecha"></button>\r
  <button class="resize se" type="button" aria-label="Ajustar tamaño desde la esquina inferior derecha"></button>\r
  <button class="resize s" type="button" aria-label="Ajustar tamaño desde abajo"></button>\r
  <button class="resize sw" type="button" aria-label="Ajustar tamaño desde la esquina inferior izquierda"></button>\r
  <button class="resize w" type="button" aria-label="Ajustar tamaño desde la izquierda"></button>\r
  <button class="resize nw" type="button" aria-label="Ajustar tamaño desde la esquina superior izquierda"></button>\r
</div>\r
`;
function sharkExactMouseMove(x, y) {
  const event = new MouseEvent('mousemove', {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    buttons: 0,
    shiftKey: true
  });
  // MouseEventInit truncates fractional CSS coordinates in some browsers.
  // Keep the actual pixel center when several map pixels share a screen pixel.
  Object.defineProperties(event, {
    clientX: {
      value: x
    },
    clientY: {
      value: y
    }
  });
  return event;
}
function sharkTraversal(width, height, mode) {
  const result = new Uint32Array(width * height);
  let count = 0;
  const put = (x, y) => {
    result[count++] = y * width + x;
  };
  if (mode === 'LEFT' || mode === 'RIGHT') {
    for (let c = 0; c < width; c++) {
      const x = mode === 'LEFT' ? c : width - 1 - c;
      for (let y = 0; y < height; y++) put(x, y);
    }
  } else if (mode === 'UP' || mode === 'DOWN') {
    for (let r = 0; r < height; r++) {
      const y = mode === 'DOWN' ? r : height - 1 - r;
      for (let x = 0; x < width; x++) put(x, y);
    }
  } else if (mode === 'EDGE_IN' || mode === 'EDGE_OUT') {
    let left = 0,
      right = width - 1,
      top = 0,
      bottom = height - 1;
    while (left <= right && top <= bottom) {
      for (let x = left; x <= right; x++) put(x, top);
      for (let y = top + 1; y <= bottom; y++) put(right, y);
      if (top < bottom) for (let x = right - 1; x >= left; x--) put(x, bottom);
      if (left < right) for (let y = bottom - 1; y > top; y--) put(left, y);
      left++;
      right--;
      top++;
      bottom--;
    }
    if (mode === 'EDGE_OUT') result.reverse();
  } else if (mode === 'HUMANIZED') {
    const side = Math.max(4, Math.floor(Math.min(width, height) / 10)),
      cols = Math.ceil(width / side),
      rows = Math.ceil(height / side),
      blocks = Uint32Array.from({
        length: cols * rows
      }, (_, i) => i);
    for (let i = blocks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)),
        tmp = blocks[i];
      blocks[i] = blocks[j];
      blocks[j] = tmp;
    }
    for (const block of blocks) {
      const x0 = block % cols * side,
        y0 = Math.floor(block / cols) * side,
        x1 = Math.min(width, x0 + side),
        y1 = Math.min(height, y0 + side);
      for (let y = y0; y < y1; y++) {
        if (Math.random() > .35) for (let x = x0; x < x1; x++) put(x, y);else for (let x = x1 - 1; x >= x0; x--) put(x, y);
      }
    }
  } else {
    for (let n = 0; n < result.length; n++) result[n] = n;
    if (mode === 'SPIRAL_FROM_CENTER' || mode === 'SPIRAL_TO_CENTER') {
      const cx = (width - 1) / 2,
        cy = (height - 1) / 2,
        rings = new Uint32Array(result.length),
        angles = new Float32Array(result.length);
      for (let n = 0; n < result.length; n++) {
        const dx = n % width - cx,
          dy = Math.floor(n / width) - cy;
        rings[n] = Math.floor(Math.hypot(dx, dy));
        angles[n] = (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2);
      }
      result.sort((a, b) => rings[a] - rings[b] || angles[a] - angles[b] || a - b);
      if (mode === 'SPIRAL_TO_CENTER') result.reverse();
    }
  }
  return result;
}
class SharkTaskQueue {
  constructor(owner, order) {
    this.owner = owner;
    this.order = order;
    this.mask = new Uint8Array(owner.pixels.width * owner.pixels.height);
    this.count = 0;
    this.cursor = 0;
    this.dispatched = [];
  }
  get length() {
    return this.count;
  }
  setPending(index, value) {
    const old = this.mask[index] === 1;
    if (old !== value) this.count += value ? 1 : -1;
    this.mask[index] = value ? 1 : 0;
  }
  shift() {
    while (this.cursor < this.order.length) {
      const index = this.order[this.cursor++];
      if (this.mask[index] !== 1) continue;
      this.mask[index] = 2;
      this.count--;
      this.dispatched.push(index);
      const w = this.owner.pixels.width;
      return {
        queue: this,
        index,
        color: this.owner.pixels.indices[index],
        position: new SharkMapPosition(this.owner.bot, this.owner.position.globalX + index % w, this.owner.position.globalY + Math.floor(index / w))
      };
    }
  }
}
function sharkIndexedEncode(bytes) {
  let text = '';
  for (let i = 0; i < bytes.length; i += 8192) text += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(text);
}
function sharkPackIndices(bytes) {
  const runs = [];
  for (let i = 0; i < bytes.length;) {
    const color = bytes[i];
    let count = 1;
    while (i + count < bytes.length && bytes[i + count] === color && count < 65535) count++;
    runs.push(count & 255, count >>> 8, color);
    i += count;
    if (runs.length >= bytes.length) return {
      encoding: 'raw',
      data: sharkIndexedEncode(bytes)
    };
  }
  return {
    encoding: 'rle',
    data: sharkIndexedEncode(Uint8Array.from(runs))
  };
}
function sharkUnpackIndices(record, size) {
  const raw = atob(record.data);
  if (record.encoding !== 'rle') return raw.length === size ? Uint8Array.from(raw, c => c.charCodeAt(0)) : null;
  if (raw.length % 3) return null;
  const result = new Uint8Array(size);
  let offset = 0;
  for (let i = 0; i < raw.length; i += 3) {
    const count = raw.charCodeAt(i) | raw.charCodeAt(i + 1) << 8,
      color = raw.charCodeAt(i + 2);
    if (!count || offset + count > size) return null;
    result.fill(color, offset, offset + count);
    offset += count;
  }
  return offset === size ? result : null;
}
function sharkSourceCanvas(image, width) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = Math.max(1, Math.round(width * image.naturalHeight / image.naturalWidth));
  canvas.getContext('2d').imageSmoothingEnabled = false;
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
  canvas.naturalWidth = canvas.width;
  canvas.naturalHeight = canvas.height;
  canvas.src = canvas.toDataURL('image/png');
  return canvas;
}
// Color interpretation follows the supplied 5.1.20 reader. Cached IDs never pass through RGB again.
function macrosharkReadPixelColor(data, offset, cache, exactColor) {
  if (data[offset + 3] < 100) return 0;
  const r = data[offset],
    g = data[offset + 1],
    b = data[offset + 2];
  const key = r << 16 | g << 8 | b;
  if (cache.has(key)) return cache.get(key);
  if (exactColor) return -1;
  let distance = Infinity,
    color = 0;
  const lab = Xo(r, g, b);
  for (let index = 0; index < x.length; index++) {
    const candidate = Ro(lab, x[index], 0);
    if (candidate < distance) {
      distance = candidate;
      color = index;
    }
  }
  if (cache.size < 65536) cache.set(key, color);
  return color;
}
class SharkPixelData {
  bot;
  image;
  width;
  exactColor;
  static async fromJSON(o, a) {
    const image = new Image();
    let objectUrl;
    try {
      let source = a.url;
      if (typeof source === 'string' && /^https?:/i.test(source)) {
        const url = new URL(source);
        if (url.origin !== 'https://backend.wplace.live' || !/^\/files\/s\d+\/tiles\/\d+\/\d+\.png$/.test(url.pathname) || url.username || url.password) throw new Error('Solo se permiten imágenes locales y teselas oficiales de WPlace.');
        const response = await o.request(url.href, {
          cache: 'no-store',
          credentials: 'omit',
          redirect: 'error',
          signal: AbortSignal.timeout(20000)
        });
        if (!response.ok) throw new Error('No se pudo cargar la tesela de WPlace (' + response.status + ').');
        objectUrl = URL.createObjectURL(await response.blob());
        source = objectUrl;
      } else source = macrosharkLocalImageUrl(source);
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error('No se pudo cargar la imagen guardada.'));
        image.src = source;
      });
      const result = new SharkPixelData(o, image, a.width, a.exactColor, a.indexed);
      if (a.exactColor) {
        result.canvas.width = result.canvas.height = 1;
        image.src = '';
        result.image = null;
        result.analyzedImage = null;
        result.chunks = [];
      }
      return result;
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  }
  canvas = document.createElement("canvas");
  context = this.canvas.getContext("2d");
  pixels;
  colors = new Map();
  resolution;
  get height() {
    return Math.max(1, Math.round(this.width / this.resolution));
  }
  set height(o) {
    this.width = o * this.resolution | 0;
  }
  constructor(o, a, l = a.naturalWidth, i = !1, indexed = null) {
    this.savedIndices = indexed;
    this.bot = o;
    this.image = a;
    this.width = l;
    this.exactColor = i;
    if (i) this.resolution = 1, this.width = 1000;else this.resolution = this.image.naturalWidth / this.image.naturalHeight;
    this.update();
  }
  update() {
    const width = Math.max(1, Math.round(this.width)),
      height = Math.max(1, this.height);
    if (this.analyzedWidth === width && this.analyzedHeight === height && this.analyzedImage === this.image) return;
    this.width = width;
    this.canvas.width = width;
    this.canvas.height = height;
    this.colors.clear();
    this.context.imageSmoothingEnabled = false;
    this.context.imageSmoothingQuality = "low";
    this.context.drawImage(this.image, 0, 0, width, height);
    this.indices = this.exactColor ? new Int8Array(width * height) : new Uint8Array(width * height);
    const data = this.context.getImageData(0, 0, width, height);
    const rgb = new Map();
    for (let c = 1; c < T.length; c++) {
      const v = T[c].split(',').map(Number);
      rgb.set(v[0] << 16 | v[1] << 8 | v[2], c);
    }
    let saved = null;
    if (this.savedIndices && this.savedIndices.width === width && this.savedIndices.height === height && this.savedIndices.palette === 1) {
      try {
        saved = sharkUnpackIndices(this.savedIndices, this.indices.length);
        if (saved?.some(c => c >= T.length)) saved = null;
      } catch {}
    }
    const palette = T.map(v => v.split(',').map(Number));
    for (let n = 0; n < this.indices.length; n++) {
      const p = n * 4;
      const color = saved ? saved[n] : macrosharkReadPixelColor(data.data, p, rgb, this.exactColor);
      this.indices[n] = color;
      if (!this.exactColor) {
        if (color === 0) {
          data.data[p + 3] = 0;
          continue;
        }
        const v = palette[color];
        data.data[p] = v[0];
        data.data[p + 1] = v[1];
        data.data[p + 2] = v[2];
        data.data[p + 3] = 255;
        const entry = this.colors.get(color);
        if (entry) entry.amount++;else this.colors.set(color, {
          color,
          realColor: color,
          amount: 1
        });
      }
    }
    this.pixels = Array.from({
      length: height
    }, (_, y) => this.indices.subarray(y * width, (y + 1) * width));
    this.chunks = [];
    for (let cy = 0; cy < height; cy += 128) for (let cx = 0; cx < width; cx += 128) {
      const chunk = {
        x: cx,
        y: cy,
        width: Math.min(128, width - cx),
        height: Math.min(128, height - cy),
        opaque: false
      };
      for (let y = cy; y < cy + chunk.height && !chunk.opaque; y++) for (let x = cx; x < cx + chunk.width; x++) if (this.indices[y * width + x] > 0) {
        chunk.opaque = true;
        break;
      }
      this.chunks.push(chunk);
    }
    if (!this.exactColor) this.context.putImageData(data, 0, 0);
    this.analyzedWidth = width;
    this.analyzedHeight = height;
    this.analyzedImage = this.image;
    this.analysisVersion = (this.analysisVersion || 0) + 1;
    this.savedIndices = null;
    this.serialized = null;
  }
  toJSON() {
    if (!this.serialized) {
      const source = this.image.src?.startsWith('data:') ? this.image.src : sharkSourceCanvas(this.image, this.image.naturalWidth).src;
      this.serialized = {
        url: source,
        width: this.width,
        exactColor: this.exactColor,
        indexed: {
          width: this.width,
          height: this.height,
          palette: 1,
          ...sharkPackIndices(this.indices)
        }
      };
    }
    return this.serialized;
  }
}
function Ca() {
  let o = [G, ...Zo];
  for (let a = 0; a < o.length; a++) {
    let l = o[a],
      i = localStorage.getItem(l);
    if (!i) continue;
    return {
      json: i,
      key: l
    };
  }
  return;
}
function Oo() {
  let o = Ca();
  if (!o) return;
  let a;
  try {
    if (a = JSON.parse(o.json), typeof a !== "object") throw Error("NOT VALID SAVE");
    if (a.version === 1) {
      let l = a.widget;
      if (l) a.images = l.images, a.strategy = l.strategy, delete a.widget;
    }
    if (o.key !== G) localStorage.setItem(G, o.json);
  } catch {
    localStorage.removeItem(o.key), a = void 0;
  }
  return a;
}
var Eo;
function H(o, a = !1) {
  if (clearTimeout(Eo), a) localStorage.setItem(G, JSON.stringify(o));else Eo = setTimeout(() => {
    localStorage.setItem(G, JSON.stringify(o));
  }, 600);
}
var k = 1000,
  La = 2048,
  E = k * La,
  C = [],
  O = [],
  Ta = Date.now();
function lo(o) {
  C.push(o), O.push({
    id: Ta++,
    latitude: (2 * Math.atan(Math.exp(-(o.y / E * (2 * Math.PI) - Math.PI))) - Math.PI / 2) * 180 / Math.PI,
    longitude: (o.x / E * (2 * Math.PI) - Math.PI) * 180 / Math.PI,
    name: "macroshark_FAVORITE"
  });
}
lo({
  x: E / 3 | 0,
  y: E / 3 | 0
});
lo({
  x: E / 3 * 2 | 0,
  y: E / 3 * 2 | 0
});
function V(element) {
  // Typed CSS values retain precision that style.transform can round at high zoom.
  try {
    const components = element?.attributeStyleMap?.get('transform');
    if (components) {
      let point;
      for (const part of components) {
        if (part.x?.unit === 'px' && part.y?.unit === 'px') point = {
          x: part.x.value,
          y: part.y.value
        };
      }
      if (point && Number.isFinite(point.x) && Number.isFinite(point.y)) return point;
    }
  } catch {}
  const transform = element?.style?.transform || (element?.isConnected ? getComputedStyle(element).transform : '');
  const matches = [...transform.matchAll(/translate(?:3d)?\(\s*([-+\d.e]+)px\s*,\s*([-+\d.e]+)px(?:\s*,\s*[-+\d.e]+(?:px)?)?\s*\)/gi)];
  if (matches.length) {
    const value = matches[matches.length - 1];
    return {
      x: Number(value[1]),
      y: Number(value[2])
    };
  }
  if (/^matrix(?:3d)?\(/.test(transform)) {
    try {
      const matrix = new DOMMatrixReadOnly(transform);
      return {
        x: matrix.m41,
        y: matrix.m42
      };
    } catch {}
  }
  return {
    x: NaN,
    y: NaN
  };
}
class SharkMapPosition {
  bot;
  static fromJSON(o, a) {
    return new SharkMapPosition(o, ...a);
  }
  static fromScreenPosition(o, a) {
    let {
      anchorScreenPosition: l,
      pixelSize: i,
      anchorWorldPosition: r
    } = o.findAnchorsForScreen(a);
    return new SharkMapPosition(o, r.x + (a.x - l.x) / i | 0, r.y + (a.y - l.y) / i | 0);
  }
  globalX = 0;
  globalY = 0;
  get tileX() {
    return this.globalX / k | 0;
  }
  set tileX(o) {
    this.globalX = o * k + this.x;
  }
  get tileY() {
    return this.globalY / k | 0;
  }
  set tileY(o) {
    this.globalY = o * k + this.y;
  }
  get x() {
    return this.globalX % k;
  }
  set x(o) {
    this.globalX = this.tileX * k + o;
  }
  get y() {
    return this.globalY % k;
  }
  set y(o) {
    this.globalY = this.tileY * k + o;
  }
  anchor1Index;
  anchor2Index;
  get pixelSize() {
    const projection = this.bot.getMapProjection?.();
    if (projection) return projection.scale;
    return (V(this.bot.$stars[this.anchor2Index]).x - V(this.bot.$stars[this.anchor1Index]).x) / (C[this.anchor2Index].x - C[this.anchor1Index].x);
  }
  constructor(o, a, l, i, r) {
    this.bot = o;
    if (i === void 0 || r === void 0) this.globalX = a, this.globalY = l;else this.globalX = a * k + i, this.globalY = l * k + r;
    this.updateAnchor();
  }
  updateAnchor() {
    this.anchor1Index = 0, this.anchor2Index = 1;
    let o = 1 / 0,
      a = 1 / 0;
    for (let l = 0; l < C.length; l++) {
      let {
        x: i,
        y: r
      } = C[l];
      if (i < this.globalX && r < this.globalY) {
        let s = this.globalX - i + (this.globalY - r);
        if (s < o) o = s, this.anchor1Index = l;
      } else if (i > this.globalX && r > this.globalY) {
        let s = i - this.globalX + (r - this.globalY);
        if (s < a) a = s, this.anchor2Index = l;
      }
    }
  }
  toScreenPosition() {
    const p = this.bot.getMapProjection?.();
    if (p) return {
      x: (this.globalX - p.worldX) * p.scale + p.screenX,
      y: (this.globalY - p.worldY) * p.scale + p.screenY
    };
    let o = C[this.anchor1Index],
      a = V(this.bot.$stars[this.anchor1Index]);
    return {
      x: (this.globalX - o.x) * this.pixelSize + a.x,
      y: (this.globalY - o.y) * this.pixelSize + a.y
    };
  }
  getMapColor() {
    return this.bot.mapsCache.get(this.tileX + "/" + this.tileY).pixels[this.y][this.x];
  }
  setMapColor(o) {
    let a = this.bot.mapsCache.get(this.tileX + "/" + this.tileY);
    if (!a) return;
    let l = a.pixels[this.y];
    if (!l) return;
    l[this.x] = o;
  }
  scrollScreenTo() {
      return this.bot.focusMapPosition(this).catch(error => {
        this.bot.widget.status = error.message;
        return false;
      });
    }
  clone() {
    return new SharkMapPosition(this.bot, this.tileX, this.tileY, this.x, this.y);
  }
  toJSON() {
    return [this.globalX, this.globalY];
  }
}

class SharkImage extends SharkDisposable {
  bot;
  position;
  pixels;
  strategy;
  opacity;
  drawTransparentPixels;
  drawColorsInOrder;
  skipUnavailableColors;
  colors;
  lock;
  displayName;
  nativeOverlayId = '';
  nativeOverlayRevision = 0;
  nativeImageSignature = ''; 
  paintSpeed = 1;
  confirmPaint = true;
  autoDrawConfig = null;
  paintSelected = false;
  static PREVIEW_MASK_BASE_WIDTH = 96;
  static PREVIEW_MASK_BASE_HEIGHT = 96;
  static async fromJSON(o, a) {
    const image = new SharkImage(o, SharkMapPosition.fromJSON(o, a.position), await SharkPixelData.fromJSON(o, a.pixels), a.strategy, a.opacity, a.drawTransparentPixels, a.drawColorsInOrder, a.skipUnavailableColors, a.colors, a.lock);
    image.displayName = typeof a.displayName === 'string' ? a.displayName : '';
    image.nativeOverlayId = typeof a.nativeOverlayId === 'string' ? a.nativeOverlayId : '';
    image.nativeOverlayRevision = Number.isFinite(a.nativeOverlayRevision) ? a.nativeOverlayRevision : 0;
    image.nativeImageSignature = typeof a.nativeImageSignature === 'string' ? a.nativeImageSignature : '';
    image.paintSpeed = [1, 2, 4].includes(a.paintSpeed) ? a.paintSpeed : 1;
    image.confirmPaint = a.confirmPaint !== false;
    image.autoDrawConfig = a.autoDrawConfig && typeof a.autoDrawConfig === 'object' ? a.autoDrawConfig : null;
    image.paintSelected = a.paintSelected === true;
    return image;
  }
  element = document.createElement("div");
  tasks = [];
  moveInfo;
  $canvas;
  $colorsDialog;
  $colorsDialogList;
  $colorSearch;
  $openColors;
  $openPreview;
  $toggleAllColors;
  $closeColors;
  $closePreview;
  $delete;
  $drawColorsInOrder;
  $drawTransparent;
  $skipUnavailable;
  $export;
  $lock;
  $opacity;
  $progressLine;
  $progressText;
  $previewDialog;
  $previewDialogList;
  $previewStrategySelect;
  $resetSize;
  $resetSizeSpan;
  $settings;
  $strategy;
  $topbar;
  $wrapper;
  colorDialogDragState;
  suppressNextColorDialogBackdropClick = !1;
  previewCacheSignature;
  previewSequenceCache = new Map();
  previewAnimations = new WeakMap();
  previewAnimationHandles = new Set();
  constructor(o, a, l, i = "SPIRAL_FROM_CENTER", r = 50, s = !1, c = !1, g = !0, p = [], d = !1) {
    super();
    this.bot = o;
    this.position = a;
    this.pixels = l;
    this.strategy = macrosharkNormalizeStrategy(i);
    this.opacity = r;
    this.drawTransparentPixels = s;
    this.drawColorsInOrder = c;
    this.skipUnavailableColors = g;
    this.colors = p;
    this.lock = d;
    this.element.innerHTML = Yo, this.element.classList.add("wimage"), U(this.element), document.body.append(this.element), this.populateElementsWithSelector(this.element, {
      $colorsDialog: ".colors-dialog",
      $colorsDialogList: ".colors-dialog-list",
      $colorSearch: ".color-search",
      $openColors: ".open-colors",
      $openPreview: ".open-preview",
      $toggleAllColors: ".toggle-all-colors",
      $closeColors: ".close-colors",
      $closePreview: ".close-preview",
      $delete: ".delete",
      $drawColorsInOrder: ".draw-colors-in-order",
      $drawTransparent: ".draw-transparent",
      $skipUnavailable: ".skip-unavailable",
      $export: ".export",
      $lock: ".lock",
      $opacity: ".opacity",
      $progressLine: ".wprogress div",
      $progressText: ".wprogress span",
      $previewDialog: ".preview-dialog",
      $previewDialogList: ".preview-dialog-list",
      $previewStrategySelect: ".preview-strategy-select",
      $resetSize: ".reset-size",
      $settings: ".wform",
      $strategy: ".strategy",
      $topbar: ".wtopbar",
      $wrapper: ".wrapper"
    }), this.$resetSizeSpan = this.$resetSize.querySelector("span"), this.$canvas = this.pixels.canvas, this.$wrapper.prepend(this.pixels.canvas), document.body.append(this.$colorsDialog, this.$previewDialog), this.registerEvent(this.$strategy, "change", () => {
      this.strategy = this.$strategy.value;
      this.update();
      this.$previewStrategySelect.value = this.strategy;
      H(this.bot);
    }), this.registerEvent(this.$previewStrategySelect, "change", () => {
      this.$strategy.value = this.$previewStrategySelect.value;
      this.$strategy.dispatchEvent(new Event("change"));
      this.renderStrategyPreviewSamples();
    }), this.registerEvent(this.$opacity, "input", () => {
      this.opacity = this.$opacity.valueAsNumber, this.$opacity.style.setProperty("--val", this.opacity + "%"), this.update(), H(this.bot);
    }), this.registerEvent(this.$opacity, "change", () => {}), this.$opacity.style.setProperty("--val", this.opacity + "%"), this.registerEvent(this.$resetSize, "click", () => {
      this.pixels.width = this.pixels.image.naturalWidth;
      this.pixels.update();
      this.updateColors();
      this.update();
      H(this.bot);
    }), this.registerEvent(this.$drawTransparent, "click", () => {
      this.drawTransparentPixels = this.$drawTransparent.checked;
      H(this.bot);
    }), this.registerEvent(this.$skipUnavailable, "click", () => {
      this.skipUnavailableColors = this.$skipUnavailable.checked;
      this.updateTasks();
      H(this.bot);
    }), this.registerEvent(this.$drawColorsInOrder, "click", () => {
      this.drawColorsInOrder = this.$drawColorsInOrder.checked;
      H(this.bot);
    }), this.registerEvent(this.$lock, "click", () => {
      this.lock = !this.lock;
      this.update();
      H(this.bot);
    }), this.registerEvent(this.$delete, "click", () => {
      this.destroy();
    }), this.registerEvent(this.$openColors, "click", () => {
      this.openColorPanel();
    }), this.registerEvent(this.$openPreview, "click", () => {
      this.openPreviewPanel();
    }), this.registerEvent(this.$closeColors, "click", () => {
      this.closeDialog(this.$colorsDialog);
    }), this.registerEvent(this.$closePreview, "click", () => {
      this.closeDialog(this.$previewDialog);
    }), this.registerEvent(this.$colorsDialog.querySelector(".colors-dialog-head"), "pointerdown", this.startColorDialogDrag.bind(this)), this.registerEvent(document, "pointermove", this.moveColorDialog.bind(this), {
      passive: !1
    }), this.registerEvent(document, "pointerup", this.stopColorDialogDrag.bind(this)), this.registerEvent(document, "pointercancel", this.stopColorDialogDrag.bind(this)), this.registerEvent(this.$colorsDialog, "click", t => {
      if (this.suppressNextColorDialogBackdropClick) {
        this.suppressNextColorDialogBackdropClick = !1;
        return;
      }
      if (t.target === this.$colorsDialog) this.closeDialog(this.$colorsDialog);
    }), this.registerEvent(this.$previewDialog, "click", t => {
      if (t.target === this.$previewDialog) this.closeDialog(this.$previewDialog);
    }), this.registerEvent(this.$colorSearch, "input", () => {
      this.updateColors();
    }), this.registerEvent(this.$toggleAllColors, "change", () => {
      let t = !this.$toggleAllColors.checked;
      for (let w of this.colors) w.disabled = t || void 0;
      this.syncColorBulkToggle();
      this.updateTasks();
      this.updateColors();
      H(this.bot);
    }), this.registerEvent(this.$export, "click", () => {
      this.export();
    }), this.registerEvent(this.$topbar, "mousedown", this.moveStart.bind(this)), this.registerEvent(this.$canvas, "mousedown", this.moveStart.bind(this)), this.registerEvent(document, "mouseup", this.moveStop.bind(this)), this.registerEvent(document, "mousemove", this.move.bind(this));
    this.installResizeHandles();
    this.installMobileImageDrag();
    this.update(), this.updateColors();
  }
  installMobileImageDrag() {
    const start = event => {
      if (this.lock || event.target.closest('button,input,select,textarea,a')) return;
      if (event.touches.length !== 1) {
        if (this.mobileTouchDrag) this.finishMobileImageDrag();
        return;
      }
      const touch = event.changedTouches[0],
        scale = this.position.pixelSize;
      if (!touch || !Number.isFinite(scale) || scale <= 0) return;
      this.mobileTouchDrag = {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        worldX: this.position.globalX,
        worldY: this.position.globalY,
        scale
      };
      event.preventDefault();
      event.stopPropagation();
    };
    const move = event => {
      const drag = this.mobileTouchDrag;
      if (!drag) return;
      if (this.lock || event.touches.length !== 1) {
        this.finishMobileImageDrag();
        return;
      }
      const touch = Array.from(event.touches).find(t => t.identifier === drag.id);
      if (!touch) return;
      event.preventDefault();
      event.stopPropagation();
      this.position.globalX = drag.worldX + Math.round((touch.clientX - drag.x) / drag.scale);
      this.position.globalY = drag.worldY + Math.round((touch.clientY - drag.y) / drag.scale);
      this.updatePlacement();
    };
    const end = event => {
      const drag = this.mobileTouchDrag;
      if (!drag) return;
      if (Array.from(event.changedTouches).some(t => t.identifier === drag.id)) {
        event.stopPropagation();
        this.finishMobileImageDrag();
      }
    };
    for (const target of [this.$canvas, this.$topbar]) this.registerEvent(target, 'touchstart', start, {
      passive: false
    });
    this.registerEvent(document, 'touchmove', move, {
      passive: false,
      capture: true
    });
    this.registerEvent(document, 'touchend', end, {
      passive: false,
      capture: true
    });
    this.registerEvent(document, 'touchcancel', end, {
      passive: false,
      capture: true
    });
    this.runOnDestroy.push(() => {
      this.mobileTouchDrag = null;
    });
  }
  finishMobileImageDrag() {
    const drag = this.mobileTouchDrag;
    if (!drag) return;
    this.mobileTouchDrag = null;
    if (this.position.globalX === drag.worldX && this.position.globalY === drag.worldY) return;
    this.position.updateAnchor();
    this.updatePlacement();
    H(this.bot, true);
    // Reload the new map area before rebuilding pixel tasks for the moved image.
    this.bot.readMap().then(() => {
      if (this.bot.images.includes(this)) {
        this.bot.updateTasks();
        this.bot.widget.update();
      }
    }).catch(error => {
      console.error('[MacroShark Plus] Map refresh after drag failed', error);
      this.bot.widget.status = 'No se pudo actualizar esta zona del mapa. Vuelve a intentarlo antes de pintar.';
    });
  }
  toJSON() {
    return {
      pixels: this.pixels.toJSON(),
      galleryPreview: macrosharkGalleryPreview(this),
      position: this.position.toJSON(),
      strategy: this.strategy,
      opacity: this.opacity,
      drawTransparentPixels: this.drawTransparentPixels,
      drawColorsInOrder: this.drawColorsInOrder,
      skipUnavailableColors: this.skipUnavailableColors,
      colors: this.colors,
      lock: this.lock,
      displayName: this.displayName || '',
      nativeOverlayId: this.nativeOverlayId,
      nativeOverlayRevision: this.nativeOverlayRevision,
      nativeImageSignature: this.nativeImageSignature,
      paintSpeed: this.paintSpeed,
      confirmPaint: this.confirmPaint,
      autoDrawConfig: this.autoDrawConfig,
      paintSelected: this.paintSelected
    };
  }
  updateTasks() {
    const w = this.pixels.width,
      h = this.pixels.height;
    const disabled = new Set(this.colors.filter(c => c.disabled || this.skipUnavailableColors && this.bot.unavailableColors.has(c.realColor)).map(c => c.realColor));
    const signature = [w, h, this.pixels.analysisVersion, this.position.globalX, this.position.globalY, this.strategy, this.drawTransparentPixels, this.drawColorsInOrder, [...disabled].join(','), this.colors.map(c => c.realColor).join(',')].join('|');
    const reset = this.queueSignature !== signature || !(this.tasks instanceof SharkTaskQueue);
    if (reset) {
      let order;
      if (this.strategy === 'COLOR_SEQUENCE') {
        const pending = new Uint32Array(w * h);
        let pendingCount = 0;
        // Keep only integer positions per color within each local zone.
        for (let zy = 0; zy < h; zy += 24) for (let zx = 0; zx < w; zx += 24) {
          const buckets = new Map();
          for (let y = zy; y < Math.min(h, zy + 24); y++) for (let x = zx; x < Math.min(w, zx + 24); x++) {
            const n = y * w + x,
              c = this.pixels.indices[n];
            if (!c && !this.drawTransparentPixels || disabled.has(c)) continue;
            if (!buckets.has(c)) buckets.set(c, []);
            buckets.get(c).push(n);
          }
          let previous = -1;
          while (buckets.size) {
            let options = [...buckets].filter(([c]) => c !== previous);
            if (!options.length) options = [...buckets];
            options.sort((a, b) => b[1].length - a[1].length);
            const [c, items] = options[0],
              count = 12 + Math.floor(Math.random() * 17);
            for (let i = 0; i < count && items.length; i++) {
              const at = Math.floor(Math.random() * items.length);
              pending[pendingCount++] = items[at];
              items[at] = items[items.length - 1];
              items.pop();
            }
            if (!items.length) buckets.delete(c);
            previous = c;
          }
        }
        order = pending.slice(0, pendingCount);
      } else {
        const all = new Uint32Array(w * h);
        let count = 0;
        for (const index of sharkTraversal(w, h, this.strategy)) {
          const c = this.pixels.indices[index];
          if ((c || this.drawTransparentPixels) && !disabled.has(c)) all[count++] = index;
        }
        order = all.slice(0, count);
      }
      if (this.drawColorsInOrder && this.strategy !== 'COLOR_SEQUENCE') {
        const priority = new Map(this.colors.map((c, i) => [c.realColor, i]));
        order.sort((a, b) => (priority.get(this.pixels.indices[a]) ?? 0) - (priority.get(this.pixels.indices[b]) ?? 0));
      }
      this.tasks = new SharkTaskQueue(this, order);
      this.queueSignature = signature;
    }
    const dirty = new Set(this.bot.changedTiles ?? []);
    for (const index of this.tasks.dispatched) {
      const gx = this.position.globalX + index % w,
        gy = this.position.globalY + Math.floor(index / w);
      dirty.add(Math.floor(gx / k) + '/' + Math.floor(gy / k));
    }
    this.tasks.dispatched = [];
    for (const chunk of this.pixels.chunks) {
      if (!chunk.opaque && !this.drawTransparentPixels) continue;
      const x0 = this.position.globalX + chunk.x,
        y0 = this.position.globalY + chunk.y;
      if (!reset && this.bot.changedTiles && ![[Math.floor(x0 / k), Math.floor(y0 / k)], [Math.floor((x0 + chunk.width - 1) / k), Math.floor(y0 / k)], [Math.floor(x0 / k), Math.floor((y0 + chunk.height - 1) / k)], [Math.floor((x0 + chunk.width - 1) / k), Math.floor((y0 + chunk.height - 1) / k)]].some(([x, y]) => dirty.has(x + '/' + y))) continue;
      for (let y = chunk.y; y < chunk.y + chunk.height; y++) for (let x = chunk.x; x < chunk.x + chunk.width; x++) {
        const index = y * w + x,
          color = this.pixels.indices[index],
          gx = this.position.globalX + x,
          gy = this.position.globalY + y,
          key = Math.floor(gx / k) + '/' + Math.floor(gy / k);
        if (!reset && this.bot.changedTiles && !dirty.has(key)) continue;
        const server = this.bot.mapsCache.get(key)?.pixels[gy % k]?.[gx % k];
        const current=this.bot.stagedPixels.get(key+'/'+(gx%k)+'/'+(gy%k))?.color??server;
        this.tasks.setPending(index, (color !== 0 || this.drawTransparentPixels) && !disabled.has(color) && Number.isInteger(current) && current >= 0 && current !== color);
      }
    }
    this.tasks.cursor = 0;
    this.update();
    this.bot.widget.update();
  }
  updatePlacement() {
    const point = this.position.toScreenPosition(),
      scale = this.position.pixelSize;
    // At smaller map scales WPlace no longer displays the painted pixel layer.
    this.element.classList.toggle('macroshark-zoom-hidden', !Number.isFinite(scale) || scale < 0.25);
    const width = scale * this.pixels.width,
      height = scale * this.pixels.height;
    if (![point.x, point.y, width, height].every(Number.isFinite) || width <= 0 || height <= 0) return;
    const transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
    if (this.element.style.transform !== transform) this.element.style.transform = transform;
    if (this.element.style.width !== width + 'px') this.element.style.width = width + 'px';
    if (this.element.style.height !== height + 'px') this.element.style.height = height + 'px';
    if (!this.bot.placingImages) this.bot.renderReferencePreview?.();
  }
  update() {
    if (this.lock && this.mobileTouchDrag) this.finishMobileImageDrag();
    this.element.classList.toggle("mobile-drag-unlocked", !this.lock);
    this.updatePlacement();
    this.$canvas.style.opacity = `${this.opacity}%`, this.element.classList.remove("hidden"), this.$resetSizeSpan.textContent = this.pixels.width.toString(), this.$strategy.value = this.strategy, this.$opacity.valueAsNumber = this.opacity, this.$drawTransparent.checked = this.drawTransparentPixels, this.$drawColorsInOrder.disabled = this.strategy === "COLOR_SEQUENCE", this.$drawColorsInOrder.checked = this.strategy !== "COLOR_SEQUENCE" && this.drawColorsInOrder, this.$skipUnavailable.checked = this.skipUnavailableColors;
    let r = this.pixels.pixels.length * this.pixels.pixels[0].length,
      pending = this.pendingPixelCount(),
      s = Math.max(0, r - pending),
      c = r > 0 ? s / r * 100 | 0 : 0;
    this.$progressText.textContent = `${s}/${r} ${c}% ETA: ${pending / 120 | 0}h`, this.$progressLine.style.transform = `scaleX(${c / 100})`, this.$canvas.classList[this.lock ? "add" : "remove"]("no-pointer-events");
    for (let g of this.element.querySelectorAll(".resize")) g.classList[this.lock ? "add" : "remove"]("no-pointer-events");
    this.$lock.classList[this.lock ? "add" : "remove"]("locked");
  }
  pendingPixelCount() {
    let pending = this.tasks.length;
    if (!this.bot.stagedPixels?.size) return pending;
    const width = this.pixels.width, height = this.pixels.height;
    for (const entry of this.bot.stagedPixels.values()) {
      const [tileX, tileY] = entry.tile.split('/').map(Number);
      const x = tileX * k + entry.x - this.position.globalX;
      const y = tileY * k + entry.y - this.position.globalY;
      if (x < 0 || y < 0 || x >= width || y >= height) continue;
      const index = y * width + x;
      if (this.bot.mapsCache.get(entry.tile)?.pixels[entry.y]?.[entry.x] !== entry.color && this.pixels.indices[index] === entry.color && this.tasks?.mask?.[index] !== 1) pending++;
    }
    return Math.min(width * height, pending);
  }
  exportImage() {
    this.export();
  }
  destroy() {
    super.destroy(), this.element.remove(), this.$colorsDialog.remove(), this.$previewDialog.remove(), zo(this.bot.images, this), this.bot.widget.update(), H(this.bot);
  }
  openColorPanel() {
    if (this.$colorsDialog.open) {
      this.$colorSearch.focus();
      return;
    }
    this.$colorsDialog.style.position = "fixed", this.$colorsDialog.style.left = "", this.$colorsDialog.style.top = "", this.$colorsDialog.style.margin = "auto", this.$colorsDialog.showModal(), this.$colorSearch.focus();
  }
  openPreviewPanel() {
    if (this.syncPreviewStrategySelect(), this.$previewDialog.open) {
      this.renderStrategyPreviewSamples();
      return;
    }
    this.$previewDialog.style.position = "fixed", this.$previewDialog.style.left = "", this.$previewDialog.style.top = "", this.$previewDialog.style.margin = "auto", this.$previewDialog.showModal(), this.renderStrategyPreviewSamples();
  }
  syncPreviewStrategySelect() {
    if (!this.$previewStrategySelect.childElementCount) {
      let o = document.createDocumentFragment();
      for (let a of this.$strategy.options) {
        let l = document.createElement("option");
        l.value = a.value, l.textContent = a.textContent, o.append(l);
      }
      this.$previewStrategySelect.append(o);
    }
    this.$previewStrategySelect.value = this.strategy;
  }
  closeDialog(o) {
    if (!o.open) return;
    if (o === this.$previewDialog) this.stopPreviewAnimations();
    if (typeof o.requestClose === "function") o.requestClose();else o.close();
  }
  stopPreviewAnimations() {
    for (let o of this.previewAnimationHandles) cancelAnimationFrame(o);
    this.previewAnimationHandles.clear();
  }
  startColorDialogDrag(o) {
    if (o.button !== 0) return;
    if (o.target?.closest("button,input,select,textarea,a,label")) return;
    let l = this.$colorsDialog.getBoundingClientRect();
    this.colorDialogDragState = {
      pointerId: o.pointerId,
      offsetX: o.clientX - l.left,
      offsetY: o.clientY - l.top,
      moved: !1
    }, o.preventDefault();
  }
  moveColorDialog(o) {
    if (!this.colorDialogDragState) return;
    if (o.pointerId !== this.colorDialogDragState.pointerId) return;
    let a = this.$colorsDialog.getBoundingClientRect(),
      l = Math.max(8, window.innerWidth - a.width - 8),
      i = Math.max(8, window.innerHeight - a.height - 8),
      r = Math.min(l, Math.max(8, o.clientX - this.colorDialogDragState.offsetX)),
      s = Math.min(i, Math.max(8, o.clientY - this.colorDialogDragState.offsetY));
    if (!this.colorDialogDragState.moved && (Math.abs(o.movementX) > 0 || Math.abs(o.movementY) > 0)) this.colorDialogDragState.moved = !0;
    this.$colorsDialog.style.left = `${Math.round(r)}px`, this.$colorsDialog.style.top = `${Math.round(s)}px`, o.preventDefault();
  }
  stopColorDialogDrag(o) {
    if (!this.colorDialogDragState) return;
    if (o.pointerId !== this.colorDialogDragState.pointerId) return;
    if (this.colorDialogDragState.moved) this.suppressNextColorDialogBackdropClick = !0;
    this.colorDialogDragState = void 0;
  }
  renderStrategyPreviewSamples() {
    this.stopPreviewAnimations(), this.invalidatePreviewCacheIfNeeded();
    let o = this.$strategy.value;
    this.$previewDialogList.innerHTML = "";
    let a = document.createDocumentFragment(),
      l = document.createElement("article");
    l.className = "preview-card";
    let i = document.createElement("strong");
    i.textContent = this.getStrategyLabel(o);
    let r = document.createElement("canvas");
    r.className = "preview-canvas", r.width = 156, r.height = 156, this.paintStrategyPreview(r, o), l.append(i, r), a.append(l), this.$previewDialogList.append(a);
  }
  invalidatePreviewCacheIfNeeded() {
    let o = this.colors.map((l, i) => `${i}:${l.realColor}:${l.disabled ? 1 : 0}`).join("|"),
      a = `${this.pixels.width}x${this.pixels.height}:${this.pixels.image.src.length}:${this.drawColorsInOrder ? 1 : 0}:${o}`;
    if (this.previewCacheSignature === a) return;
    this.previewCacheSignature = a, this.previewSequenceCache.clear();
  }
  getStrategyLabel(mode) {
    return f("macroshark_" + macrosharkNormalizeStrategy(mode));
  }
  paintStrategyPreview(o, a) {
    let l = o.getContext("2d");
    if (!l) return;
    l.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--ms-preview-surface").trim() || getComputedStyle(this.$previewDialog).backgroundColor, l.fillRect(0, 0, o.width, o.height);
    let i = this.getSampledImagePreviewData(),
      r = this.getCachedPreviewSequence(a, i.mask, i.width, i.height),
      s = Math.min(o.width / i.width, o.height / i.height),
      c = (o.width - i.width * s) / 2,
      g = (o.height - i.height * s) / 2,
      p = this.previewAnimations.get(o);
    if (p) cancelAnimationFrame(p), this.previewAnimationHandles.delete(p);
    let d = u => {
        let m = requestAnimationFrame(z => {
          this.previewAnimationHandles.delete(m), u(z);
        });
        return this.previewAnimationHandles.add(m), m;
      },
      t = u => {
        l.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--ms-preview-surface").trim() || getComputedStyle(this.$previewDialog).backgroundColor, l.fillRect(0, 0, o.width, o.height);
        for (let m = 0; m < Math.min(u, r.length); m++) {
          let z = r[m],
            M = i.colors.get(`${z.x}:${z.y}`) ?? 0;
          if (!M) continue;
          l.fillStyle = ko(M), l.fillRect(c + z.x * s, g + z.y * s, Math.max(1, s), Math.max(1, s));
        }
      },
      w = Math.min(3400, Math.max(900, r.length * 8)),
      b = w + 220,
      h = (u, m) => {
        if (!this.$previewDialog.open) return;
        let z = (m - u) % b,
          M = Math.min(1, z / w),
          D = M * M * (3 - 2 * M);
        t(Math.floor(r.length * D));
        let P = d(N => {
          h(u, N);
        });
        this.previewAnimations.set(o, P);
      },
      e = performance.now();
    h(e, e);
  }
  getCachedPreviewSequence(o, a, l = this.pixels.width, i = this.pixels.height) {
    let r = this.colors.map((p, d) => `${d}:${p.realColor}:${p.disabled ? 1 : 0}`).join("|"),
      s = `${o}:${l}x${i}:${a.length}:${this.drawColorsInOrder ? 1 : 0}:${r}`,
      c = this.previewSequenceCache.get(s);
    if (c) return c;
    let g = l === this.pixels.width && i === this.pixels.height ? this.getExactPreviewSequence(o, a) : this.getApproxPreviewSequence(o, a, l, i);
    if (this.drawColorsInOrder && o !== "COLOR_SEQUENCE") {
      let p = new Map();
      for (let d = 0; d < this.colors.length; d++) p.set(this.colors[d].realColor, d);
      g.sort((d, t) => (p.get(this.pixels.pixels[d.y]?.[d.x] ?? 0) ?? 0) - (p.get(this.pixels.pixels[t.y]?.[t.x] ?? 0) ?? 0));
    }
    return this.previewSequenceCache.set(s, g), g;
  }
  getExactPreviewSequence(o, a) {
    if (o === "COLOR_SEQUENCE") return macrosharkColorSequence(a.map(p => ({
      ...p,
      color: this.pixels.pixels[p.y]?.[p.x] ?? 0
    })));
    let l = this.strategy;
    this.strategy = o;
    let i = [...this.strategyPositionIterator()];
    this.strategy = l;
    let r = new Set(a.map(({
      x: s,
      y: c
    }) => `${s}:${c}`));
    return i.filter(({
      x: s,
      y: c
    }) => r.has(`${s}:${c}`));
  }
  getApproxPreviewSequence(mode, mask, width, height) {
    if (mode === "COLOR_SEQUENCE") {
      const colors = this.getSampledImagePreviewData().colors;
      return macrosharkColorSequence(mask.map(p => ({
        ...p,
        color: colors.get(p.x + ":" + p.y) ?? 0
      })));
    }
    const points = new Set(mask.map(p => p.x + ':' + p.y));
    const context = {
      strategy: macrosharkNormalizeStrategy(mode),
      pixels: {
        pixels: Array.from({
          length: height
        }, () => ({
          length: width
        }))
      }
    };
    return [...SharkImage.prototype.strategyPositionIterator.call(context)].filter(p => points.has(p.x + ':' + p.y));
  }
  getSampledImagePreviewData() {
    let o = this.pixels.width,
      a = this.pixels.height,
      l = SharkImage.PREVIEW_MASK_BASE_WIDTH,
      i = SharkImage.PREVIEW_MASK_BASE_HEIGHT,
      r = Math.min(1, l / Math.max(1, o), i / Math.max(1, a)),
      s = Math.max(1, Math.round(o * r)),
      c = Math.max(1, Math.round(a * r)),
      g = new Set();
    for (let w = 0; w < this.colors.length; w++) {
      let n = this.colors[w];
      if (n.disabled) g.add(n.realColor);
    }
    let p = new Map(),
      d = new Map();
    for (let w = 0; w < a; w++) for (let n = 0; n < o; n++) {
      let b = this.pixels.pixels[w]?.[n] ?? 0;
      if (!b || g.has(b)) continue;
      let h = Math.min(s - 1, Math.floor(n / o * s)),
        e = Math.min(c - 1, Math.floor(w / a * c)),
        u = `${h}:${e}`;
      if (!p.has(u)) p.set(u, {
        x: h,
        y: e
      });
      if (!d.has(u)) d.set(u, b);
    }
    let t = [...p.values()];
    if (!t.length) {
      let w = this.fallbackPreviewMask();
      return {
        width: o,
        height: a,
        mask: w,
        colors: new Map(w.map(n => [`${n.x}:${n.y}`, this.pixels.pixels[n.y]?.[n.x] ?? 0]))
      };
    }
    return {
      width: s,
      height: c,
      mask: t,
      colors: d
    };
  }
  getImagePreviewMask() {
    let o = this.pixels.width,
      a = this.pixels.height,
      l = new Set();
    for (let r = 0; r < this.colors.length; r++) {
      let s = this.colors[r];
      if (s.disabled) l.add(s.realColor);
    }
    let i = [];
    for (let r = 0; r < a; r++) for (let s = 0; s < o; s++) {
      let c = this.pixels.pixels[r]?.[s] ?? 0;
      if (c !== 0 && !l.has(c)) i.push({
        x: s,
        y: r
      });
    }
    return i.length ? i : this.fallbackPreviewMask();
  }
  fallbackPreviewMask() {
    let o = [],
      a = this.pixels.width / 2,
      l = this.pixels.height / 2,
      i = Math.max(4, Math.min(this.pixels.width, this.pixels.height) / 2.5);
    for (let r = 0; r < this.pixels.height; r++) for (let s = 0; s < this.pixels.width; s++) if ((s - a) ** 2 + (r - l) ** 2 <= i ** 2) o.push({
      x: s,
      y: r
    });
    return o;
  }
  applyLocale() {
    if (U(this.element), this.updateColors(), this.$previewDialog.open) this.renderStrategyPreviewSamples();
  }
  colorHex(o) {
    let a = T[o] ?? "0,0,0",
      [l = 0, i = 0, r = 0] = a.split(",").map(s => Number.parseInt(s, 10));
    return `#${[l, i, r].map(s => s.toString(16).padStart(2, "0")).join("")}`;
  }
  colorKeywords(o) {
    let a = T[o] ?? "0,0,0",
      [l = 0, i = 0, r = 0] = a.split(",").map(p => Number.parseInt(p, 10)),
      s = Math.max(l, i, r),
      c = Math.min(l, i, r);
    if (s - c < 15) return ["gray", "grey", "gris", "neutral", "neutro"];
    if (l > i + 30 && l > r + 30) return ["red", "rojo"];
    if (i > l + 30 && i > r + 30) return ["green", "verde"];
    if (r > l + 30 && r > i + 30) return ["blue", "azul"];
    if (l > 170 && i > 120 && r < 130) return ["orange", "naranja"];
    if (l > 170 && i > 110 && r > 140) return ["pink", "rosa"];
    if (l > 120 && i < 100 && r > 120) return ["purple", "violet", "morado"];
    if (l > 130 && i > 130 && r < 90) return ["yellow", "amarillo"];
    return ["brown", "cafe", "marron"];
  }
  updateColors() {
    this.$colorsDialogList.innerHTML = "";
    let o = this.pixels.pixels.length * this.pixels.pixels[0].length;
    this.$colorsDialogList.setAttribute("aria-label", f("colorPanelResults"));
    let a = this.$colorSearch.value.trim().toLowerCase();
    if (this.colors.length !== this.pixels.colors.size || this.colors.some(l => !this.pixels.colors.has(l.realColor))) {
      let l = new Map(this.colors.map(i => [i.realColor, i]));
      this.colors = Array.from(this.pixels.colors.values()).sort((i, r) => r.amount - i.amount).map(i => ({
        realColor: i.realColor,
        disabled: l.get(i.realColor)?.disabled
      })), H(this.bot);
    }
    this.syncColorBulkToggle();
    for (let l = 0; l < this.colors.length; l++) {
      let i = this.colors[l],
        r = this.pixels.colors.get(i.realColor),
        s = !1,
        c = r.amount / o * 100,
        g = this.colorHex(r.realColor),
        p = this.colorKeywords(r.realColor),
        d = this.bot.unavailableColors.has(i.realColor),
        t = Boolean(i.disabled) || this.skipUnavailableColors && d,
        w = () => {
          if (this.skipUnavailableColors && d) return;
          i.disabled = i.disabled ? void 0 : !0, n.classList.toggle("disabled", Boolean(i.disabled));
          let e = n.querySelector(".state");
          if (e) e.textContent = i.disabled || this.skipUnavailableColors && d ? f("disabled") : f("enabled");
          this.syncColorBulkToggle();
          H(this.bot);
        },
        n = document.createElement("button");
      n.className = `color-chip ${t ? "disabled" : ""}`, n.draggable = !0, n.setAttribute("aria-label", `${f("overlayColors")} #${l + 1}: ${g.toUpperCase()}`), n.innerHTML = `<span class="order-index">#${l + 1}</span>
<span class="drag" title="${f("up")} / ${f("down")}">⋮⋮</span>
<span class="swatch"></span>
<span class="meta">
  <span class="coverage">${c.toFixed(1)}%</span>
  <span class="hex">${g.toUpperCase()}</span>
  <span class="state">${t ? f("disabled") : f("enabled")}</span>
</span>
<span class="premium"></span>`, n.querySelector(".swatch").style.setProperty("--swatch-color", ko(r.realColor)), n.addEventListener("click", () => {
        if (s) {
          s = !1;
          return;
        }
        w(), this.updateTasks();
      }), n.addEventListener("dragstart", e => {
        s = !0, n.classList.add("dragging"), e.dataTransfer?.setData("text/plain", String(l)), e.dataTransfer.effectAllowed = "move";
      }), n.addEventListener("dragend", () => {
        n.classList.remove("dragging");
      }), n.addEventListener("dragover", e => {
        e.preventDefault(), n.classList.add("drag-target");
      }), n.addEventListener("dragleave", () => {
        n.classList.remove("drag-target");
      }), n.addEventListener("drop", e => {
        e.preventDefault(), n.classList.remove("drag-target");
        let u = Number.parseInt(e.dataTransfer?.getData("text/plain") ?? "-1", 10);
        if (u < 0 || u === l || u >= this.colors.length) return;
        this.colors.splice(l, 0, ...this.colors.splice(u, 1)), H(this.bot), this.updateColors();
      });
      let b = document.createElement("button");
      b.textContent = f("buy"), b.className = "buy-chip", b.addEventListener("click", e => {
        e.stopPropagation(), document.getElementById("color-" + r.realColor)?.click();
      }), n.append(b);
      let h = `${g} ${p.join(" ")} ${r.realColor} ${T[r.realColor]}`;
      if (!a || h.toLowerCase().includes(a)) this.$colorsDialogList.append(n);
    }
  }
  syncColorBulkToggle() {
    let o = this.colors.filter(l => !l.disabled).length,
      a = o === this.colors.length;
    this.$toggleAllColors.checked = a, this.$toggleAllColors.indeterminate = o > 0 && !a;
  }
  *strategyPositionIterator() {
    let o = this.pixels.pixels[0].length,
      a = this.pixels.pixels.length;
    switch (this.strategy) {
      case "DOWN":
        {
          for (let l = 0; l < a; l++) for (let i = 0; i < o; i++) yield {
            x: i,
            y: l
          };
          break;
        }
      case "UP":
        {
          for (let l = a - 1; l >= 0; l--) for (let i = 0; i < o; i++) yield {
            x: i,
            y: l
          };
          break;
        }
      case "LEFT":
        {
          for (let l = 0; l < o; l++) for (let i = 0; i < a; i++) yield {
            x: l,
            y: i
          };
          break;
        }
      case "RIGHT":
        {
          for (let l = o - 1; l >= 0; l--) for (let i = 0; i < a; i++) yield {
            x: l,
            y: i
          };
          break;
        }
      case "COLOR_SEQUENCE":
        {
          for (let y = 0; y < a; y++) for (let x = 0; x < o; x++) yield {
            x,
            y
          };
          break;
        }
      case "HUMANIZED":
        {
          let l = Math.max(4, Math.floor(Math.min(o, a) / 10)),
            i = [];
          for (let r = 0; r < a; r += l) for (let s = 0; s < o; s += l) i.push({
            x: s,
            y: r
          });
          for (let r = i.length - 1; r >= 0; r--) {
            let s = Math.floor(Math.random() * (r + 1)),
              c = i[r];
            i[r] = i[s], i[s] = c;
          }
          for (let r = 0; r < i.length; r++) {
            let s = i[r],
              c = Math.min(a, s.y + l),
              g = Math.min(o, s.x + l);
            for (let p = s.y; p < c; p++) if (Math.random() > 0.35) for (let t = s.x; t < g; t++) yield {
              x: t,
              y: p
            };else for (let t = g - 1; t >= s.x; t--) yield {
              x: t,
              y: p
            };
          }
          break;
        }
      case "SPIRAL_FROM_CENTER":
      case "SPIRAL_TO_CENTER":
        {
          // One-pixel circular bands around the geometric center, without stretching rectangles.
          const centerX = (o - 1) / 2,
            centerY = (a - 1) / 2,
            points = [];
          for (let y = 0; y < a; y++) for (let x = 0; x < o; x++) {
            const dx = x - centerX,
              dy = y - centerY;
            points.push({
              x,
              y,
              ring: Math.floor(Math.hypot(dx, dy)),
              angle: (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2)
            });
          }
          points.sort((p, q) => p.ring - q.ring || p.angle - q.angle || p.y - q.y || p.x - q.x);
          if (this.strategy === "SPIRAL_TO_CENTER") points.reverse();
          for (const {
            x,
            y
          } of points) yield {
            x,
            y
          };
          break;
        }
      case 'EDGE_OUT':
      case 'EDGE_IN':
        {
          const points = [];
          let left = 0,
            right = o - 1,
            top = 0,
            bottom = a - 1;
          while (left <= right && top <= bottom) {
            for (let x = left; x <= right; x++) points.push({
              x,
              y: top
            });
            for (let y = top + 1; y <= bottom; y++) points.push({
              x: right,
              y
            });
            if (top < bottom) for (let x = right - 1; x >= left; x--) points.push({
              x,
              y: bottom
            });
            if (left < right) for (let y = bottom - 1; y > top; y--) points.push({
              x: left,
              y
            });
            left++;
            right--;
            top++;
            bottom--;
          }
          if (this.strategy === 'EDGE_OUT') points.reverse();
          yield* points;
          break;
        }
    }
  }
  moveStart(o) {
    if (o.button !== 0) return;
    if (o.preventDefault(), o.stopPropagation(), !this.lock) {this.moveInfo = {
      globalX: this.position.globalX,
      globalY: this.position.globalY,
      clientX: o.clientX,
      clientY: o.clientY
    };}
  }
  moveStop() {
    if (this.moveInfo) {
      let o = this.moveInfo,
        a = o.width !== void 0 || o.height !== void 0 ? "resize" : "move";
      this.moveInfo = void 0;
      this.position.updateAnchor();
      this.pixels.update();
      this.updateColors();
      H(this.bot);
    }
  }
  move(o) {
    if (!this.moveInfo) return;
    let a = Math.round((o.clientX - this.moveInfo.clientX) / this.position.pixelSize),
      l = Math.round((o.clientY - this.moveInfo.clientY) / this.position.pixelSize);
    if (this.moveInfo.globalX !== void 0) {
      if (this.position.globalX = a + this.moveInfo.globalX, this.moveInfo.width !== void 0) this.pixels.width = Math.max(1, this.moveInfo.width - a);
    } else if (this.moveInfo.width !== void 0) this.pixels.width = Math.max(1, a + this.moveInfo.width);
    if (this.moveInfo.globalY !== void 0) {
      if (this.position.globalY = l + this.moveInfo.globalY, this.moveInfo.height !== void 0) this.pixels.height = Math.max(1, this.moveInfo.height - l);
    } else if (this.moveInfo.height !== void 0) this.pixels.height = Math.max(1, l + this.moveInfo.height);
    this.update(), H(this.bot);
  }
  installResizeHandles() {
    const select = () => {
      for (const image of this.bot.images) image.element.classList.remove('shark-resize-selected');
      this.element.classList.add('shark-resize-selected');
    };
    this.registerEvent(this.$canvas, 'pointerdown', select);
    for (const handle of this.element.querySelectorAll('.resize')) {
      this.registerEvent(handle, 'pointerdown', event => {
        if (this.lock || !event.isPrimary || event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        select();
        const direction = [...handle.classList].find(name => /^(?:n|ne|e|se|s|sw|w|nw)$/.test(name));
        const scale = this.position.pixelSize;
        if (!direction || !Number.isFinite(scale) || scale <= 0) return;
        const drag = {
          id: event.pointerId, direction, scale,
          clientX: event.clientX, clientY: event.clientY,
          x: this.position.globalX, y: this.position.globalY,
          width: this.pixels.width, height: this.pixels.height
        };
        this.resizeGesture = drag;
        handle.setPointerCapture?.(event.pointerId);
      }, { passive: false });
      this.registerEvent(handle, 'pointermove', event => {
        const drag = this.resizeGesture;
        if (!drag || drag.id !== event.pointerId) return;
        event.preventDefault();
        const dx = (event.clientX - drag.clientX) / drag.scale;
        const dy = (event.clientY - drag.clientY) / drag.scale;
        const horizontal = drag.direction.includes('w') ? -dx : dx;
        const vertical = (drag.direction.includes('n') ? -dy : dy) * this.pixels.resolution;
        const corner = drag.direction.length === 2;
        const delta = corner ? Math.abs(horizontal) >= Math.abs(vertical) ? horizontal : vertical
          : /[ew]/.test(drag.direction) ? horizontal : vertical;
        const maximum = Math.max(drag.width, Math.floor(Math.sqrt(16000000 * this.pixels.resolution)));
        const width = Math.max(1, Math.min(maximum, Math.round(drag.width + delta)));
        const height = Math.max(1, Math.round(width / this.pixels.resolution));
        this.pixels.width = width;
        this.position.globalX = drag.direction.includes('w') ? drag.x + drag.width - width
          : drag.direction.includes('e') ? drag.x : drag.x + Math.round((drag.width - width) / 2);
        this.position.globalY = drag.direction.includes('n') ? drag.y + drag.height - height
          : drag.direction.includes('s') ? drag.y : drag.y + Math.round((drag.height - height) / 2);
        this.updatePlacement();
      }, { passive: false });
      const finish = event => {
        const drag = this.resizeGesture;
        if (!drag || drag.id !== event.pointerId) return;
        event.preventDefault();
        event.stopPropagation();
        this.resizeGesture = null;
        if (drag.width === this.pixels.width && drag.x === this.position.globalX && drag.y === this.position.globalY) return;
        this.position.updateAnchor();
        this.pixels.update();
        this.updateColors();
        this.update();
        H(this.bot, true);
        this.bot.readMap().then(() => {
          if (!this.bot.images.includes(this)) return;
          this.bot.updateTasks();
          this.bot.widget.update();
        }).catch(error => {
          console.error('[MacroShark] No se pudo actualizar el mapa tras redimensionar', error);
          this.bot.widget.status = 'No se pudo actualizar el mapa tras cambiar el tamaño. Vuelve a intentarlo antes de pintar.';
        });
      };
      this.registerEvent(handle, 'pointerup', finish, { passive: false });
      this.registerEvent(handle, 'pointercancel', finish, { passive: false });
    }
  }
  export() {
      this.bot.widget.openImageExport(this);
    }
}
var SHARK_STYLES = `/* stylelint-disable declaration-no-important */
/* stylelint-disable plugin/no-low-performance-animation-properties */
/* stylelint-disable no-descending-specificity */
/* stylelint-disable declaration-block-single-line-max-declarations */

:root {
  --hover: #1f2433;
  --text-invert: #fff;
  --error: #ff5c7c;
  --resize: 8px;
  --text: #ecf2ff;
  --background: #0f111a;
  --background-hover: #20263a;
  --background-disabled: #2f3448;
  --main: #6d7bff;
  --main-hover: #7f8bff;
  --border: #2a3044;
  --surface-card: #141c31;
  --surface-card-hover: #1b2743;
  --glow-main: rgb(122 148 255 / 40%);
  --ring: rgb(129 140 248 / 55%);
  --input-bg: #111a2e;
  --input-border: rgb(148 163 255 / 28%);
  --input-hover: #17233d;
  --card-radius: 12px;
  --action-download: #55d977;
  --action-lock: #ffd166;
  --action-delete: #ff6b6b;
  --action-palette: #ff9f43;
}

.maplibregl-marker[title*='macroshark_FAVORITE'],
.maplibregl-marker[aria-label*='macroshark_FAVORITE'] {
  opacity: 0 !important;
  pointer-events: none !important;
}

.wwidget {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(380px, 100vw);
  height: 100dvh;
  color: var(--text);
  font-family: Poppins, sans-serif;
  pointer-events: none;
  container-type: inline-size;
}

.wwidget .title {
  display: grid;
  gap: 12px;
  padding: 16px 12px 12px 66px;
  border-bottom: var(--border) 1px solid;
  background-color: #0f1424;
  color: var(--text-invert);
  font-weight: 700;
  font-size: 18px;
  text-align: left;
  pointer-events: auto;
  transition: transform 0.26s ease;
  transform: translateX(-100%);
}

.wwidget .widget-logo {
  object-fit: contain;
  width: 52px;
  height: auto;
  border-radius: 14px;
  filter: drop-shadow(0 8px 14px rgb(0 0 0 / 35%))
    drop-shadow(0 0 14px rgb(125 145 255 / 35%));
  animation: logo-float 3.6s ease-in-out infinite;
}

.wwidget .widget-brand {
  display: flex;
  gap: 10px;
  align-items: center;
}

.wwidget .widget-brand-text {
  position: relative;
  color: #e8ecff;
  font-weight: 700;
  font-size: 20px;
  letter-spacing: 0.4px;
  text-shadow:
    0 0 12px rgb(109 123 255 / 35%),
    0 0 26px rgb(87 189 255 / 22%);
}

.wwidget .widget-brand-text::after {
  content: '';
  position: absolute;
  right: -8px;
  bottom: -2px;
  width: 46px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, #6d7bff, #8fd8ff);
  box-shadow: 0 0 10px rgb(143 216 255 / 55%);
}

.wwidget .wform,
.wwidget .widget-section,
.wwidget .images,
.wimage .wform,
.macroshark-modal,
.preview-dialog-list,
.colors-dialog-list,
.replacement-grid {
  scrollbar-width: thin;
  scrollbar-color: rgb(141 160 255 / 62%) rgb(16 24 43 / 72%);
}

.wwidget .wform::-webkit-scrollbar,
.wwidget .widget-section::-webkit-scrollbar,
.wwidget .images::-webkit-scrollbar,
.wimage .wform::-webkit-scrollbar,
.macroshark-modal::-webkit-scrollbar,
.preview-dialog-list::-webkit-scrollbar,
.colors-dialog-list::-webkit-scrollbar,
.replacement-grid::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.wwidget .wform::-webkit-scrollbar-track,
.wwidget .widget-section::-webkit-scrollbar-track,
.wwidget .images::-webkit-scrollbar-track,
.wimage .wform::-webkit-scrollbar-track,
.macroshark-modal::-webkit-scrollbar-track,
.preview-dialog-list::-webkit-scrollbar-track,
.colors-dialog-list::-webkit-scrollbar-track,
.replacement-grid::-webkit-scrollbar-track {
  border-radius: 999px;
  background: rgb(16 24 43 / 72%);
}

.wwidget .wform::-webkit-scrollbar-thumb,
.wwidget .widget-section::-webkit-scrollbar-thumb,
.wwidget .images::-webkit-scrollbar-thumb,
.wimage .wform::-webkit-scrollbar-thumb,
.macroshark-modal::-webkit-scrollbar-thumb,
.preview-dialog-list::-webkit-scrollbar-thumb,
.colors-dialog-list::-webkit-scrollbar-thumb,
.replacement-grid::-webkit-scrollbar-thumb {
  border: 2px solid rgb(16 24 43 / 72%);
  border-radius: 999px;
  background: linear-gradient(180deg, #6d7bff, #8ea4ee);
}

@keyframes logo-float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }

  50% {
    transform: translateY(-2px) scale(1.02);
  }
}

.wwidget .widget-actions {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.wwidget .widget-section-autofarm .widget-actions,
.wwidget .widget-section-tools .widget-actions {
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid rgb(143 162 255 / 20%);
}

.wwidget .widget-actions strong {
  color: #c1cdf3;
  font-size: 11px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.wwidget .widget-actions button {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 34px;
  padding: 7px 10px;
  border: var(--border) 1px solid;
  border-radius: 8px;
  background: #1a2032;
  color: var(--text);
  font-weight: 600;
  font-size: 11px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.wwidget .widget-section-head {
  display: flex;
  gap: 10px;
  justify-content: space-between;
  align-items: center;
}

.wwidget .actions-inline {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(128px, 100%), 1fr));
  gap: 8px;
}

.wwidget .actions-inline button {
  flex-direction: column;
  gap: 4px;
  min-height: 50px;
  padding: 8px 6px;
  line-height: 1.2;
  text-align: center;
  white-space: normal;
}

.wwidget .actions-inline button i {
  font-size: 14px;
}

.wwidget .open-config-toggle {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  width: auto;
  min-height: 32px;
  border-radius: 999px;
  background: linear-gradient(90deg, #253864, #1b2848);
  color: #dce6ff;
}

.wwidget .open-config-toggle i {
  color: #8fd8ff;
}

.wwidget .widget-actions button:hover {
  background: #24304d;
  box-shadow: 0 6px 14px rgb(0 0 0 / 30%);
  transform: translateY(-1px);
}

.wwidget .capture-template {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.wwidget .widget-section-actions button {
  display: inline-flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.wwidget .widget-section-summary {
  position: sticky;
  top: -12px;
  z-index: 1;
  display: flex;
  gap: 8px;
  justify-content: space-between;
  align-items: center;
  min-width: 0;
  margin: -12px -12px 0;
  padding: 12px;
  border-radius: 12px 12px 0 0;
  background: linear-gradient(180deg, rgb(20 30 52 / 98%), rgb(16 25 45 / 94%));
  list-style: none;
  cursor: pointer;
}

.wwidget .widget-section-summary .widget-section-title {
  flex: 1 1 auto;
  min-width: 0;
  text-align: left;
  white-space: normal;
  overflow-wrap: anywhere;
}

.wwidget .widget-section-summary::-webkit-details-marker {
  display: none;
}

.wwidget .widget-section-summary i {
  flex: 0 0 auto;
  color: #95abf9;
  transition: transform 0.2s ease;
}

.wwidget details[open] > .widget-section-summary i {
  transform: rotate(180deg);
}

.wwidget .widget-image-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.wwidget .widget-image-actions .strategy-row {
  grid-column: 1 / -1;
  justify-self: stretch;
}

.wwidget.wopen {
  pointer-events: none;
}

.wwidget.wopen .title,
.wwidget.wopen .wform {
  box-shadow: 0 12px 30px rgb(15 23 42 / 30%);
  transform: translateX(0);
}

.wwidget .wopen-button svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentcolor;
  stroke-width: 2.5;
  stroke-linecap: round;
}

.wwidget .wopen-button {
  position: fixed;
  top: 14px;
  left: 16px;
  z-index: 1002;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: var(--border) 1px solid;
  border-color: #3b4360;
  border-radius: 999px;
  background-color: #171d2d;
  color: #e7ecff;
  box-shadow: 0 8px 24px rgb(2 6 23 / 55%);
  cursor: pointer;
  pointer-events: auto;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.wwidget .wopen-button:hover {
  background-color: #202943;
  box-shadow: 0 10px 26px rgb(2 6 23 / 65%);
  transform: scale(1.05);
}

.wwidget .images {
  display: grid;
  gap: 10px;
  overflow-y: auto;
  max-height: 32dvh;
  padding: 4px 8px;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

.wwidget .images .image {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
  align-items: stretch;
  width: 100%;
  min-height: 72px;
  padding: 8px;
  border: 1px solid rgb(109 123 255 / 20%);
  border-radius: 12px;
  background: linear-gradient(180deg, #1a2440, #141b2f);
  box-shadow:
    0 10px 24px rgb(0 0 0 / 30%),
    0 0 0 1px rgb(109 123 255 / 10%);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.wwidget .images .image:hover {
  border-color: rgb(109 123 255 / 55%);
  box-shadow:
    0 14px 28px rgb(0 0 0 / 38%),
    0 0 0 1px rgb(109 123 255 / 24%);
  transform: translateY(-1px);
}

.wwidget .images .image .preview {
  display: grid;
  place-items: center;
  width: 100%;
  min-height: 88px;
  margin: 0;
  padding: 0;
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 14px;
  background: #0f1321;
}

.wwidget .images .image img {
  object-fit: contain;
  max-width: 100%;
  max-height: 84px;
  margin: 0 auto;
  border-radius: 12px;
  cursor: pointer;
}

.wwidget .images .image .image-controls {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  align-content: center;
}

.wwidget .images .image .image-controls button {
  display: grid;
  place-items: center;
  width: 100%;
  height: 30px;
  padding: 0;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 8px;
  background: linear-gradient(180deg, #212b45, #1a2238);
  color: #d9e3ff;
  font-size: 14px;
  line-height: 1;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;
}

.wwidget .images .image .image-controls button:hover {
  border-color: rgb(109 123 255 / 55%);
  box-shadow: 0 8px 16px rgb(0 0 0 / 30%);
  filter: saturate(1.12);
  transform: scale(1.06);
}

.wwidget .images .image .image-controls .colors {
  color: var(--action-palette);
}

.wwidget .images .image .image-controls .focus-map {
  color: #60a5fa;
}

.wwidget .images .image .image-controls .available-colors {
  color: #d8b4ff;
}

.wwidget .images .image .image-controls .download {
  color: var(--action-download);
}

.wwidget .images .image .image-controls .up,
.wwidget .images .image .image-controls .down {
  color: #b7c4f8;
}

.macroshark-modal .shortcuts {
  display: grid;
  gap: 8px;
  overflow: hidden;
  width: calc(100% - 10px);
  margin: 4px 5px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #151d30;
  text-align: left;
  white-space: normal;
}

.macroshark-modal .shortcuts .shortcuts-summary {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  color: #d7e1ff;
  list-style: none;
  font-size: 11px;
  cursor: pointer;
}

.macroshark-modal .shortcuts .shortcuts-summary:hover {
  background: rgb(129 151 240 / 10%);
}

.macroshark-modal .shortcuts .shortcuts-summary::-webkit-details-marker {
  display: none;
}

.macroshark-modal .shortcuts .shortcuts-summary-title {
  display: inline-flex;
  gap: 7px;
  align-items: center;
}

.macroshark-modal .shortcuts .shortcuts-summary-title i {
  color: #9db3ff;
  font-size: 12px;
}

.macroshark-modal .shortcuts .shortcuts-chevron {
  color: #8ea4ee;
  font-size: 10px;
  transition: transform 0.2s ease;
}

.macroshark-modal .shortcuts[open] .shortcuts-chevron {
  transform: rotate(180deg);
}

.macroshark-modal .shortcuts .shortcut-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  overflow-y: auto;
  width: 100%;
  max-height: 220px;
  margin: 0;
  padding: 0 10px 10px;
  list-style: none;
  text-align: left;
  scrollbar-width: thin;
  scrollbar-color: rgb(141 160 255 / 60%) rgb(16 24 43 / 75%);
}

.macroshark-modal .shortcuts .shortcut-list::-webkit-scrollbar {
  width: 7px;
}

.macroshark-modal .shortcuts .shortcut-list::-webkit-scrollbar-track {
  border-radius: 999px;
  background: rgb(16 24 43 / 75%);
}

.macroshark-modal .shortcuts .shortcut-list::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: linear-gradient(180deg, #6d7bff, #8ea4ee);
}

.macroshark-modal .shortcuts .shortcut-item {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  align-items: start;
  padding: 7px;
  border: 1px solid rgb(140 159 255 / 22%);
  border-radius: 10px;
  background: linear-gradient(180deg, rgb(18 27 46 / 92%), rgb(11 19 33 / 92%));
  text-align: left;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.macroshark-modal .shortcuts .shortcut-item:hover {
  border-color: rgb(129 151 240 / 55%);
  box-shadow: 0 10px 20px rgb(0 0 0 / 25%);
  transform: translateY(-1px);
}

.macroshark-modal .shortcuts .shortcut-label {
  display: inline-flex;
  gap: 6px;
  justify-content: flex-start;
  align-items: center;
  min-width: 0;
  color: #cfdbff;
  font-weight: 600;
  font-size: 11px;
  text-align: left;
}

.macroshark-modal .shortcuts .shortcut-label span {
  line-height: 1.25;
  white-space: normal;
  overflow-wrap: anywhere;
}

.macroshark-modal .shortcuts .shortcut-label i {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: linear-gradient(180deg, #2f5287, #22385f);
  color: #eff5ff;
  box-shadow: 0 3px 8px rgb(0 0 0 / 25%);
  font-size: 12px;
}

.macroshark-modal .shortcuts .shortcut-item-color-panel .shortcut-label i {
  color: var(--action-palette);
}

.macroshark-modal .shortcuts .shortcut-item-lock-image .shortcut-label i {
  color: var(--action-lock);
}

.macroshark-modal .shortcuts .shortcut-keys {
  display: inline-flex;
  flex-wrap: nowrap;
  gap: 4px;
  justify-content: flex-start;
  align-items: center;
  place-self: end start;
}

.macroshark-modal .shortcuts .shortcut-item:nth-child(3n + 1) .shortcut-label i {
  background: linear-gradient(180deg, #3f7cff, #2552d3);
}

.macroshark-modal .shortcuts .shortcut-item:nth-child(3n + 2) .shortcut-label i {
  background: linear-gradient(180deg, #17b26a, #14804e);
}

.macroshark-modal .shortcuts .shortcut-item:nth-child(3n) .shortcut-label i {
  background: linear-gradient(180deg, #f97316, #d9480f);
}

.macroshark-modal .shortcuts kbd {
  min-width: 28px;
  padding: 3px 8px;
  border: 1px solid rgb(173 191 255 / 62%);
  border-bottom-width: 3px;
  border-radius: 6px;
  background: linear-gradient(180deg, #3a4b77 0%, #273a63 45%, #1a2641 100%);
  color: #ebf1ff;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 24%),
    inset 0 -1px 0 rgb(6 10 20 / 55%),
    0 1px 2px rgb(3 7 15 / 45%);
  font-weight: 700;
  font-size: 11px;
  font-family: Poppins, sans-serif;
  letter-spacing: 0.3px;
  text-align: center;
  text-transform: uppercase;
}

.macroshark-modal .shortcuts .shortcut-keys kbd + kbd {
  position: relative;
  margin-left: 9px;
}

.macroshark-modal .shortcuts .shortcut-keys kbd + kbd::before {
  content: '+';
  position: absolute;
  top: 50%;
  left: -9px;
  color: #9cb2f8;
  font-weight: 700;
  font-size: 11px;
  transform: translateY(-50%);
}

.macroshark-modal .shortcuts.shortcut-pulse {
  border-color: rgb(109 123 255 / 75%);
  box-shadow: 0 0 0 1px rgb(109 123 255 / 35%);
}

.wimage {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9;
  container-type: normal;
}

.wimage canvas {
  width: 100%;
  height: 100%;
  box-shadow: inset var(--text) 0 0 0 1px;
  cursor: all-scroll;
  image-rendering: pixelated;
}

.wimage .wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  border: 1px dashed rgb(109 123 255 / 75%);
  border-radius: 6px;
  box-shadow: 0 0 0 1px rgb(9 12 20 / 65%);
}

.wimage .wform {
  position: absolute;
  top: calc(100% + 50px);
  left: 0;
  overflow: auto;
  width: 320px;
  max-height: min(70dvh, 520px);
  border: var(--border) 1px solid;
  border-radius: 10px;
  background-color: #151c2d;
  color: var(--text);
  box-shadow: 0 18px 36px rgb(2 6 23 / 45%);
  transform-origin: top left;
}

.wimage:hover .wrapper .wform,
.wimage:hover .wtopbar {
  opacity: 1;
}

.wform {
  font-weight: 700;
  font-size: 13px;
  font-family: Poppins, sans-serif;
}

.wform > * {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: calc(100% - 10px);
  margin: 5px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wwidget .wform {
  display: grid;
  gap: 8px;
  overflow-y: auto;
  max-height: calc(100dvh - 92px);
  padding: 0 8px max(14px, env(safe-area-inset-bottom));
  border-right: var(--border) 1px solid;
  background: linear-gradient(180deg, #101526, #0b0e18);
  pointer-events: auto;
  transition: transform 0.26s ease;
  transform: translateX(-100%);
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

.wwidget .wform > * {
  margin: 4px;
}

.wwidget .wform > .widget-section {
  display: grid;
  gap: 8px;
  overflow: hidden;
  width: auto;
  min-height: 0;
  margin: 0;
  padding: 12px;
  border: 1px solid rgb(129 140 248 / 24%);
  border-radius: 12px;
  background: linear-gradient(180deg, rgb(20 30 52 / 86%), rgb(14 22 40 / 88%));
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 4%),
    0 8px 18px rgb(0 0 0 / 18%);
}

.wwidget .wform > details.widget-section[open],
.wwidget .wform > .widget-section-actions {
  overflow-y: auto;
  max-height: min(430px, 48dvh);
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

.wwidget .wform > .widget-section-images[open] {
  max-height: min(520px, 54dvh);
}

.wwidget .widget-section-title {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  min-width: 0;
  color: #dbe5ff;
  font-weight: 700;
  font-size: 11px;
  line-height: 1.25;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.wwidget .widget-section-images .images {
  max-height: min(30dvh, 320px);
  padding: 4px 0;
}

.wwidget .wform button,
.wwidget .wform input,
.wwidget .wform select,
.wwidget .wform textarea,
.wwidget .wform label:has(input[type='checkbox']) {
  padding: 10px 12px;
}

.wwidget .widget-section-actions > button,
.wwidget .widget-image-actions button {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
}

.wwidget .widget-section-actions > button i,
.wwidget .widget-image-actions button i {
  color: #8fd8ff;
}

.wwidget .widget-actions button i {
  color: #8fd8ff;
}

.wwidget .mobile-controls {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  width: 100%;
}

.wwidget .mobile-controls button {
  display: inline-flex;
  flex-direction: column;
  gap: 5px;
  justify-content: center;
  align-items: center;
  min-height: 48px;
  padding: 8px 6px;
  line-height: 1.15;
  text-align: center;
  white-space: normal;
}

.wwidget .mobile-controls button i {
  color: #8fd8ff;
  font-size: 14px;
}

.wwidget .autooverlay-start i,
.wwidget .autofarm-start i {
  color: #5fe39a;
}

.wwidget .autooverlay-stop i,
.wwidget .autofarm-stop i {
  color: #ff7b8f;
}

.wwidget .autooverlay-config i,
.wwidget .autofarm-config i {
  color: #ffcf66;
}

.wwidget .external-tools-actions button {
  justify-content: center;
  width: 100%;
  min-height: 44px;
  text-align: center;
  white-space: normal;
}

.wwidget .external-tools-actions button span {
  min-width: 0;
  overflow-wrap: anywhere;
}

.wwidget .tool-color-converter i {
  color: #ff8bd1;
}

.wwidget .tool-samuel-archive i {
  color: #a7f3d0;
}

.wwidget .tool-eralyon-archive i {
  color: #93c5fd;
}

.wwidget .external-tools-help {
  margin-top: 8px;
  color: #aebcf1;
  font-size: 11px;
  line-height: 1.35;
  white-space: normal;
  overflow-wrap: anywhere;
}

.wform button,
.wform input,
.wform select,
.wform textarea,
.wform label:has(input[type='checkbox']) {
  padding: 9px 10px;
  border: 1px solid var(--input-border);
  border-radius: var(--card-radius);
  background: linear-gradient(180deg, #17233d 0%, var(--input-bg) 100%);
  color: var(--text);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 4%),
    0 1px 0 rgb(7 11 22 / 35%);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    filter 0.2s ease;
}

.wform input[type='range'] {
  width: 100%;
  height: 32px;
  background: linear-gradient(
    to right,
    var(--main) var(--val),
    var(--background-disabled) var(--val)
  );
  cursor: ew-resize;
  appearance: none;
}

.wform input[type='range']::-moz-range-thumb {
  width: 0;
  height: 0;
  opacity: 0;
}

.wform button:hover,
.wform input:hover,
.wform select:hover {
  border-color: rgb(129 140 248 / 66%);
  background: linear-gradient(180deg, #1a2947 0%, var(--input-hover) 100%);
  box-shadow: 0 8px 18px rgb(0 0 0 / 20%);
  filter: saturate(1.08);
  transform: translateY(-1px);
}

.wform button:focus-visible,
.wform input:focus-visible,
.wform select:focus-visible {
  border-color: rgb(165 180 252 / 85%);
  box-shadow:
    0 0 0 3px var(--ring),
    0 10px 22px rgb(0 0 0 / 26%);
  outline: none;
}

.wform input::placeholder {
  color: #9ba9d8;
}

.wform select {
  padding-right: 12px;
  background-image: linear-gradient(180deg, #1a2948 0%, #131d34 100%);
  background-position: 0 0;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  color: #edf2ff;
  font-weight: 700;
  font-size: 12px;
  appearance: none;
  color-scheme: dark;
}

.wform select option {
  background: #111a2f;
  color: #ecf2ff;
  font-weight: 700;
  font-size: 12px;
}

.wform select option:checked {
  background: #265fc2;
  color: #fff;
}

.wform select option:hover {
  background: #1a315d;
}

.wform button:active,
.wform select:active {
  transform: scale(0.98);
}

.wform button:disabled,
.wform input:disabled {
  background-color: var(--background-disabled);
  cursor: no-drop;
}

.wform label input:not([type='checkbox']) {
  width: inherit;
}

.wform .strategy-row {
  align-items: stretch;
}

.wform .strategy-controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 6px;
  align-items: center;
  width: 100%;
}

.wform .strategy-controls .open-preview {
  min-width: 86px;
  padding: 8px 10px;
  font-size: 11px;
  white-space: nowrap;
}

.wwidget .preview-dialog .preview-strategy-row {
  margin: 0 0 10px;
}

.wwidget .preview-dialog .preview-strategy-row .strategy-controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}

.macroshark-modal .macroshark-select {
  width: 100%;
  min-height: 38px;
  padding: 9px 34px 9px 12px;
  border: 1px solid var(--input-border);
  border-radius: 10px;
  background: linear-gradient(180deg, #1a2948 0%, #131d34 100%);
  color: #edf2ff;
  font-weight: 700;
  font-size: 12px;
  appearance: none;
  color-scheme: dark;
}

.macroshark-modal .macroshark-select option {
  background: #111a2f;
  color: #ecf2ff;
}

.macroshark-button-grid {
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(180px, 100%), 1fr)
  ) !important;
  gap: 10px !important;
  align-items: stretch;
}

.macroshark-button-grid .shield-checker i {
  color: #22c55e;
}

.macroshark-button-grid .shield-info i {
  color: #60a5fa;
}

.macroshark-button-grid .shield-refresh-profile i {
  color: #fbbf24;
}

.macroshark-capture-overlay {
  position: fixed;
  inset: 0;
  z-index: 999999;
  background: rgb(7 12 24 / 18%);
  cursor: crosshair;
}

.macroshark-capture-hint {
  position: fixed;
  top: 16px;
  left: 50%;
  padding: 6px 10px;
  border: 1px solid rgb(129 140 248 / 45%);
  border-radius: 8px;
  background: rgb(12 18 34 / 88%);
  color: #e8eeff;
  font-weight: 700;
  font-size: 12px;
  pointer-events: none;
  transform: translateX(-50%);
}

.macroshark-capture-box {
  position: fixed;
  border: 1px solid #7ea4ff;
  background: rgb(126 164 255 / 24%);
  box-shadow:
    0 0 0 1px rgb(5 8 16 / 45%),
    inset 0 0 0 1px rgb(211 224 255 / 28%);
  pointer-events: none;
}

.wform .wprogress {
  position: relative;
  display: grid;
  place-items: center;
  overflow: hidden;
  width: 100%;
  height: 48px;
  margin: 0;
  border: 1px solid rgb(129 140 248 / 28%);
  border-radius: 14px;
  background: linear-gradient(180deg, #111a2e, #0e1628);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 5%),
    inset 0 -1px 0 rgb(0 0 0 / 35%);
}

.wform .wprogress div {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  background:
    linear-gradient(90deg, rgb(99 102 241 / 95%), rgb(56 189 248 / 88%)),
    linear-gradient(180deg, rgb(255 255 255 / 18%), transparent);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 24%),
    0 0 18px rgb(99 102 241 / 35%);
  transition: transform 0.28s ease-out;
  transform-origin: left;
}

.wform .wprogress div::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    transparent 0%,
    rgb(255 255 255 / 10%) 35%,
    rgb(255 255 255 / 28%) 50%,
    rgb(255 255 255 / 10%) 65%,
    transparent 100%
  );
  animation: progress-shimmer 1.8s linear infinite;
}

.wform .wprogress span {
  position: relative;
  z-index: 1;
  color: #e9eeff;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.2px;
  text-shadow: 0 1px 6px rgb(3 8 18 / 60%);
  mix-blend-mode: normal;
}

@keyframes progress-shimmer {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(100%);
  }
}

.macroshark-modal {
  overflow: auto;
  box-sizing: border-box;
  width: min(100% - 16px, var(--macroshark-modal-width, 560px));
  max-width: calc(100vw - 16px);
  max-height: calc(100dvh - 16px);
  margin: auto;
  border: 1px solid rgb(130 150 255 / 35%);
  border-radius: 14px;
  background: linear-gradient(180deg, #131c34 0%, #0e1526 100%);
  color: var(--text);
  box-shadow:
    0 24px 46px rgb(2 6 23 / 62%),
    0 0 0 1px rgb(143 162 255 / 22%);
  container-type: inline-size;
}

.macroshark-modal::backdrop {
  background:
    radial-gradient(circle at 50% 20%, rgb(90 122 255 / 20%), transparent 55%),
    rgb(4 8 16 / 72%);
  backdrop-filter: blur(5px) saturate(1.15);
}

.macroshark-modal-head {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  justify-content: space-between;
  align-items: center;
  min-width: 0;
  margin: -2px -2px 10px;
  padding: 4px 44px 10px 2px;
  background: linear-gradient(180deg, rgb(19 28 52 / 98%), rgb(19 28 52 / 72%));
  backdrop-filter: blur(4px);
}

.macroshark-modal-head strong {
  min-width: 0;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.colors-dialog {
  --macroshark-modal-width: 560px;

  min-width: min(320px, calc(100vw - 16px));
  min-height: min(420px, calc(100dvh - 16px));
  max-height: min(85dvh, 680px);
  padding: 12px;
  resize: both;
}

.colors-dialog-head {
  cursor: move;
  user-select: none;
}

.close-colors {
  min-width: 34px;
}

.macroshark-modal .modal-close {
  position: absolute;
  top: 0;
  right: 0;
  display: grid;
  place-items: center;
  width: 34px;
  min-width: 34px;
  height: 34px;
  padding: 0;
  border: 1px solid #6c79ad;
  border-radius: 999px;
  background: linear-gradient(180deg, #2a3963, #1f2c4d);
  color: #f0f4ff;
  box-shadow: 0 10px 20px rgb(7 12 24 / 30%);
  font-weight: 600;
}

.macroshark-modal .modal-close .icon {
  font-size: 14px;
  line-height: 1;
}

.macroshark-modal .modal-close:hover {
  border-color: #9fb0ff;
  box-shadow:
    0 10px 22px rgb(7 12 24 / 40%),
    0 0 0 1px rgb(159 176 255 / 35%);
}

.preview-dialog {
  --macroshark-modal-width: 760px;

  min-width: min(330px, calc(100vw - 16px));
  max-height: min(86dvh, 720px);
  padding: 12px;
}

.preview-dialog-help {
  margin: 0 0 10px;
  color: #b4bfdc;
  font-size: 12px;
}

.autofarm-dialog {
  --macroshark-modal-width: 520px;

  max-height: min(88dvh, 760px);
  padding: 14px;
}

.update-required-dialog {
  --macroshark-modal-width: 460px;

  padding: 14px;
}

.update-required-dialog .macroshark-modal-head {
  padding-right: 2px;
}

.update-required-text {
  margin: 0 0 14px;
  color: #c8d3ee;
  font-size: 13px;
  line-height: 1.5;
}

.autofarm-form {
  display: grid;
  gap: 12px;
}

.autofarm-help {
  margin: 0;
  color: #b8c4e6;
  font-size: 12px;
}

.autofarm-label {
  display: grid;
  gap: 6px;
}

.macroshark-switch-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  overflow: visible;
  box-sizing: border-box;
  min-height: 48px;
  padding: 10px 12px;
  border: 1px solid rgb(143 162 255 / 24%);
  border-radius: 10px;
  background: linear-gradient(180deg, rgb(22 34 60 / 96%), rgb(17 26 46 / 96%));
  text-align: left;
  white-space: normal;
}

.macroshark-switch-row .with-icon {
  display: inline-flex;
  gap: 9px;
  justify-content: flex-start;
  align-items: center;
  min-width: 0;
  line-height: 1.25;
}

.macroshark-switch-row .with-icon span {
  min-width: 0;
}

.macroshark-switch-row .with-icon svg {
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
}

.macroshark-switch-row .macroshark-option-icon {
  overflow: visible;
  filter: drop-shadow(0 0 6px rgb(125 211 252 / 22%));
}

.macroshark-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 44px;
  height: 26px;
}

.macroshark-switch input {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
}

.macroshark-switch-slider {
  position: relative;
  width: 44px;
  height: 26px;
  border: 1px solid rgb(141 160 255 / 45%);
  border-radius: 999px;
  background: #233357;
  box-shadow: inset 0 2px 4px rgb(3 8 18 / 38%);
  transition:
    background 0.22s ease,
    border-color 0.22s ease;
}

.macroshark-switch-slider::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(180deg, #f2f6ff, #d4deff);
  box-shadow: 0 3px 10px rgb(1 6 15 / 35%);
  transition: transform 0.22s ease;
}

.macroshark-switch input:checked + .macroshark-switch-slider {
  border-color: rgb(80 209 150 / 76%);
  background: linear-gradient(180deg, #1f7c5f, #1b5d4a);
}

.macroshark-switch input:checked + .macroshark-switch-slider::after {
  transform: translateX(18px);
}

.macroshark-switch input:focus-visible + .macroshark-switch-slider {
  box-shadow:
    0 0 0 3px rgb(129 140 248 / 35%),
    inset 0 2px 4px rgb(3 8 18 / 38%);
}

.autofarm-fields {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}

.autofarm-value,
.autofarm-unit {
  min-height: 34px;
  border: 1px solid var(--input-border);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text);
}

.autofarm-value {
  padding: 0 10px;
}

.autofarm-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.autofarm-actions button {
  min-height: 34px;
  border: 1px solid rgb(141 160 255 / 34%);
  border-radius: 8px;
  background: linear-gradient(180deg, #273559, #1b2743);
  color: #ebf1ff;
  font-weight: 600;
}

.preview-dialog-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  align-items: start;
  overflow: auto;
  max-height: min(70dvh, 600px);
  padding-right: 2px;
}

.preview-card {
  display: grid;
  gap: 8px;
  align-content: start;
  padding: 10px;
  border: 1px solid rgb(143 162 255 / 22%);
  border-radius: 12px;
  background: linear-gradient(180deg, #1a2542, #131d34);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 4%);
  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease;
}

.preview-card:hover {
  border-color: rgb(143 162 255 / 48%);
  box-shadow:
    0 12px 24px rgb(0 0 0 / 24%),
    inset 0 1px 0 rgb(255 255 255 / 5%);
  transform: translateY(-1px);
}

.preview-card strong {
  color: #dce6ff;
  font-size: 13px;
  line-height: 1.25;
}

.preview-canvas {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 8px;
  background: #0d1324;
  image-rendering: pixelated;
}

.colors-dialog-help {
  margin: 0 0 8px;
  color: #b4bfdc;
  font-size: 12px;
  line-height: 1.35;
}

.colors-dialog-help.order {
  color: #d6defa;
  font-weight: 600;
}

.color-search {
  width: 100%;
  margin-bottom: 10px;
}

.color-tools {
  display: grid;
  gap: 6px;
  margin-bottom: 10px;
}

.color-tools .macroshark-switch-row {
  margin: 0;
}

.color-tools .with-icon i {
  color: #8fd8ff;
  font-size: 17px;
}

.colors-dialog-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 8px;
  overflow: auto;
  max-height: min(62dvh, 520px);
  padding-right: 2px;
}

.access-dialog {
  --macroshark-modal-width: 440px;

  padding: 14px;
}

.access-form {
  display: grid;
  gap: 10px;
}

.access-label {
  display: grid;
  gap: 6px;
  font-size: 12px;
}

.access-input,
.access-serial,
.access-locale,
.access-submit {
  min-height: 38px;
}

.access-submit {
  border: 1px solid #5c6bc9;
  border-radius: 8px;
  background: #233155;
  color: #edf2ff;
  font-weight: 600;
}

.access-error {
  min-height: 18px;
  color: #ff9bb0;
}

.account-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 8px;
  margin-top: 10px;
}

.account-info-card {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 8px;
  border: 1px solid rgb(143 162 255 / 18%);
  border-radius: 8px;
  background: #10182b;
}

.account-info-card span {
  color: #aab7df;
  font-weight: 700;
  font-size: 10px;
  text-transform: uppercase;
}

.account-info-card strong {
  color: #edf2ff;
  font-size: 11px;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.images-collapse-state {
  margin-left: auto;
  color: #aab7df;
  font-weight: 700;
  font-size: 10px;
  text-transform: uppercase;
}

.autofarm-range-row[hidden] {
  display: none;
}

.colors-dialog .color-chip {
  display: grid !important;
  grid-template-columns: auto 18px 18px minmax(0, 1fr) auto auto;
  gap: 6px;
  align-items: center;
  width: 100%;
  padding: 6px;
  border: 1px solid rgb(143 162 255 / 20%) !important;
  border-radius: 8px;
  background: linear-gradient(180deg, #1a2540, #151d31) !important;
  color: var(--text) !important;
  font-size: 11px;
  text-align: left;
  white-space: normal;
  transition:
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    transform 0.22s ease;
}

.colors-dialog .color-chip:hover {
  border-color: rgb(143 162 255 / 52%);
  box-shadow: 0 10px 18px rgb(0 0 0 / 25%);
  transform: translateY(-1px);
}

.colors-dialog .color-chip .order-index {
  padding: 2px 6px;
  border-radius: 999px;
  background: #202a43;
  color: #b8c8ff;
  font-weight: 700;
  font-size: 10px;
}

.colors-dialog .color-chip.disabled {
  opacity: 0.65;
}

.colors-dialog .color-chip .swatch {
  width: 14px;
  height: 14px;
  border: 1px solid rgb(255 255 255 / 15%);
  border-radius: 4px;
  background: var(--swatch-color) !important;
}

.colors-dialog .color-chip .meta {
  display: grid;
  gap: 2px;
  justify-items: start;
  min-width: 0;
}

.colors-dialog .color-chip .meta .hex {
  padding: 1px 6px;
  border: 1px solid rgb(143 162 255 / 30%);
  border-radius: 999px;
  background: rgb(17 25 43 / 75%);
  color: #e6ecff;
  font-size: 10px;
  letter-spacing: 0.2px;
}

.colors-dialog .color-chip .premium.on {
  color: #ffd166;
}

.colors-dialog .color-chip .buy-chip {
  padding: 3px 6px;
  border-radius: 6px;
  font-size: 10px;
}

.replacement-dialog {
  --macroshark-modal-width: 760px;
}

.replacement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
  overflow: auto;
  max-height: 62dvh;
  padding: 6px 4px 2px;
}

.replacement-option {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  align-items: center;
  min-height: 44px;
  border: 1px solid rgb(143 162 255 / 24%);
  border-radius: 8px;
  background: #17233f;
  color: #ebf1ff;
}

.replacement-option .dot {
  width: 14px;
  height: 14px;
  border: 1px solid rgb(255 255 255 / 25%);
  border-radius: 4px;
  background: var(--option-color);
}

.replacement-option.active {
  border-color: rgb(95 227 154 / 70%);
  box-shadow: 0 0 0 1px rgb(95 227 154 / 45%) inset;
}

.wtopbar {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(44px, 1fr));
  gap: 6px;
  width: min(268px, calc(100vw - 20px));
  margin-bottom: 4px;
  opacity: 0.92;
}

.wtopbar button {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 36px;
  border: 1px solid rgb(125 146 255 / 34%);
  background: linear-gradient(180deg, #202d50, #19223d);
  color: #b9c8ff;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 8%);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease,
    filter 0.2s ease;
}

.wtopbar button:hover {
  background: linear-gradient(180deg, #2b3960, #1f2c4b);
  box-shadow: 0 8px 18px rgb(0 0 0 / 30%);
  filter: saturate(1.12);
  transform: translateY(-1px);
}

.wtopbar button .icon {
  font-size: 15px;
  line-height: 1;
}

.wtopbar button .fa-solid {
  width: 16px;
  text-align: center;
}

.wtopbar .lock .icon-lock-closed {
  display: none;
}

.wtopbar .lock.locked .icon-lock-open {
  display: none;
}

.wtopbar .lock.locked .icon-lock-closed {
  display: inline;
}

.wtopbar button.delete {
  color: var(--action-delete);
  text-shadow: 0 0 12px rgb(255 107 107 / 35%);
}

.wtopbar button.open-colors {
  color: var(--action-palette);
  text-shadow: 0 0 12px rgb(255 159 67 / 35%);
}

.wtopbar button.export {
  color: var(--action-download);
  text-shadow: 0 0 12px rgb(85 217 119 / 32%);
}

.wtopbar button.lock.locked {
  color: var(--action-lock);
  text-shadow: 0 0 12px rgb(255 209 102 / 40%);
}

.wtopbar button.lock {
  color: var(--action-lock);
  text-shadow: 0 0 10px rgb(255 209 102 / 25%);
}

.wwidget .images .image .image-controls .colors,
.wwidget .images .image .image-controls .download,
.wwidget .images .image .image-controls .delete,
.wwidget .images .image .image-controls .available-colors {
  display: grid;
  place-items: center;
}

.wwidget .images .image .image-controls button i {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 14px;
  height: 14px;
  font-size: 14px;
  line-height: 1;
}

.macroshark-modal .shield-config-open i {
  color: #8fd8ff;
}

.shield-control-grid {
  display: grid;
  gap: 6px;
  margin-top: 8px;
}

.shield-controls .wp {
  margin-bottom: 6px;
}

.wwidget .images .image .image-controls .delete {
  color: var(--action-delete);
}

.resize {
  position: absolute;
  background: transparent;
}

.resize.n,
.resize.s {
  left: 0;
  width: 100%;
  height: var(--resize);
  cursor: ns-resize;
}

.resize.n {
  top: calc(var(--resize) / -2);
}

.resize.s {
  bottom: calc(var(--resize) / -2);
}

.resize.e,
.resize.w {
  top: 0;
  width: var(--resize);
  height: 100%;
  cursor: ew-resize;
}

.resize.e {
  right: calc(var(--resize) / -2);
}

.resize.w {
  left: calc(var(--resize) / -2);
}

.hidden {
  display: none !important;
}

.overlay-hidden .wimage {
  display: none !important;
}

.macroshark-access-locked .wwidget,
.macroshark-access-locked .wimage,
.macroshark-access-locked .wopen-button {
  display: none !important;
}

.no-pointer-events {
  pointer-events: none;
}

.colors-dialog .color-chip .drag {
  color: #8da1e5;
  font-size: 12px;
  cursor: grab;
  user-select: none;
}

.colors-dialog .color-chip.dragging {
  border-style: dashed;
  opacity: 0.45;
}

.colors-dialog .color-chip.drag-target {
  border-color: #8fa2ff;
  box-shadow: 0 0 0 1px rgb(143 162 255 / 45%);
}

@container (width <= 320px) {
  .wwidget .actions-inline {
    grid-template-columns: 1fr;
  }

  .wwidget .actions-inline button {
    min-height: 42px;
  }
}

@media (width <= 700px) {
  .wwidget {
    width: 100vw;
    max-width: 100vw;
  }

  .wwidget .images {
    max-height: 26dvh;
  }

  .wimage .wform {
    width: min(320px, calc(100vw - 20px));
  }

  .colors-dialog-list {
    grid-template-columns: 1fr;
  }

  .preview-dialog-list {
    grid-template-columns: 1fr;
  }

  .wwidget .images .image {
    grid-template-columns: 1fr;
  }

  .wwidget .images .image .image-controls {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (width <= 480px) {
  .wwidget .title {
    padding: 12px 10px 10px 58px;
    font-size: 16px;
  }

  .wwidget .widget-logo {
    width: 42px;
  }

  .wwidget .widget-brand-text {
    font-size: 17px;
  }

  .wwidget .wopen-button {
    top: 10px;
    left: 10px;
    width: 38px;
    height: 38px;
  }

  .wform {
    font-size: 12px;
  }

  .wform > * {
    width: calc(100% - 8px);
    margin: 4px;
    white-space: normal;
  }

  .wwidget .wform button,
  .wwidget .wform input,
  .wwidget .wform select,
  .wwidget .wform textarea,
  .wwidget .wform label:has(input[type='checkbox']) {
    padding: 10px 11px;
  }

  .wwidget .images {
    max-height: 22dvh;
    padding: 4px 6px;
  }

  .macroshark-modal .shortcuts .shortcut-item {
    grid-template-columns: minmax(0, 1fr);
    padding: 6px 7px;
  }

  .macroshark-modal .shortcuts .shortcut-label,
  .macroshark-modal .shortcuts kbd {
    font-size: 10px;
  }

  .macroshark-modal .shortcuts .shortcut-keys {
    justify-self: start;
  }

  .macroshark-modal .shortcuts .shortcut-list {
    grid-template-columns: 1fr;
  }

  .macroshark-switch-row {
    grid-template-columns: 1fr;
    gap: 8px;
    align-items: start;
  }

  .macroshark-switch {
    justify-self: end;
  }
}

@media (width <= 360px) {
  .wwidget .title {
    padding-left: 52px;
  }

  .wwidget .widget-brand {
    gap: 8px;
  }

  .wwidget .widget-brand-text {
    font-size: 15px;
  }

  .wwidget .widget-brand-text::after {
    width: 34px;
  }

  .wform .wprogress span {
    font-size: 10px;
  }

  .wwidget .images .image .image-controls {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .wwidget .images .image .image-controls button {
    width: 100%;
    height: 28px;
  }
}

.wwidget .widget-section-progress {
  gap: 10px;
  padding: 14px;
  border-color: rgb(103 205 255 / 30%);
  background:
    radial-gradient(circle at 90% 20%, rgb(56 189 248 / 18%), transparent 52%),
    linear-gradient(180deg, rgb(21 35 61 / 92%), rgb(13 24 43 / 92%));
}

.wwidget .widget-section-progress .widget-section-head {
  justify-content: flex-start;
}

.wwidget .widget-section-progress .widget-section-title i {
  color: #67d0ff;
}

.shield-profile-row {
  display: grid;
  gap: 6px;
  margin: 8px 0;
}

.shield-profile-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #334;
  border-radius: 8px;
  background: #111a2e;
  color: #fff;
}

.shield-refresh-profile i,
.shield-checker i {
  margin-right: 6px;
  color: #8fd8ff;
}

.shield-ip-card {
  display: grid;
  gap: 5px;
  margin: 8px 0 10px;
  padding: 10px 12px;
  border: 1px solid rgb(143 162 255 / 26%);
  border-radius: 12px;
  background:
    radial-gradient(circle at 92% 20%, rgb(143 216 255 / 12%), transparent 45%),
    linear-gradient(180deg, rgb(19 30 53 / 96%), rgb(13 22 40 / 96%));
}

.shield-ip-card span {
  color: #9eb1ee;
  font-weight: 700;
  font-size: 10px;
  letter-spacing: 0.45px;
  text-transform: uppercase;
}

.shield-ip-card strong {
  color: #eef6ff;
  font-size: 15px;
  letter-spacing: 0.2px;
}

.shield-ip-card small {
  color: #b7c7f5;
  font-size: 11px;
  line-height: 1.35;
}

.shield-checker-output {
  display: grid;
  gap: 6px;
  margin-bottom: 10px;
  color: #dce8ff;
  font-size: 12px;
}

.shield-checker-output .ok {
  color: #9bf2c5;
}

.shield-checker-output .fail {
  color: #ffb4bc;
}

.macroshark-modal .challenge-button,
.wwidget .challenge-button {
  position: relative;
  display: inline-flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border-color: rgb(126 146 255 / 42%);
  border-radius: 12px;
  background: linear-gradient(180deg, #14203a 0%, #111a30 100%);
  color: #e6eeff;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 5%),
    0 1px 0 rgb(7 11 22 / 35%);
  line-height: 1.2;
  text-align: center;
  white-space: normal;
}

.macroshark-modal .challenge-button i,
.macroshark-modal .challenge-button span,
.wwidget .challenge-button i,
.wwidget .challenge-button span {
  position: relative;
  z-index: 1;
}

.macroshark-modal .challenge-button i,
.wwidget .challenge-button i {
  display: inline-grid;
  flex: 0 0 20px;
  place-items: center;
  width: 20px;
  height: 20px;
  margin: 0;
  font-size: 15px;
  line-height: 1;
}

.macroshark-modal .challenge-button span,
.wwidget .challenge-button span {
  min-width: 0;
  overflow-wrap: anywhere;
}

.macroshark-modal .challenge-button::before,
.wwidget .challenge-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    transparent 0%,
    rgb(143 216 255 / 18%) 45%,
    transparent 72%
  );
  opacity: 0;
  transform: translateX(-120%);
}

.macroshark-modal .challenge-button:hover,
.wwidget .challenge-button:hover {
  border-color: rgb(143 216 255 / 64%);
  background: linear-gradient(180deg, #172845 0%, #13213a 100%);
  box-shadow:
    0 10px 22px rgb(3 8 18 / 30%),
    0 0 0 1px rgb(143 216 255 / 20%);
}

.macroshark-modal .challenge-button:hover::before,
.wwidget .challenge-button:hover::before {
  opacity: 1;
  animation: button-shine 0.82s ease forwards;
}

.macroshark-modal .challenge-button:disabled,
.wwidget .challenge-button:disabled {
  opacity: 0.72;
  filter: grayscale(0.25);
  cursor: wait;
}

.script-update i,
.proxy-test i,
.shield-refresh-profile i,
.shield-checker i,
.shield-info i {
  color: #8fd8ff;
  filter: drop-shadow(0 0 8px rgb(143 216 255 / 34%));
}

.shield-info-dialog {
  --macroshark-modal-width: 680px;

  max-height: min(88dvh, 760px);
  padding: 14px;
}

.shield-info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.shield-info-card {
  display: grid;
  gap: 6px;
  min-width: 0;
  padding: 10px;
  border: 1px solid rgb(143 162 255 / 24%);
  border-radius: 12px;
  background: linear-gradient(180deg, rgb(24 36 64 / 96%), rgb(15 24 43 / 96%));
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 7%);
  animation: card-rise 0.28s ease both;
}

.shield-info-card span,
.shield-info-modules span {
  color: #9eb1ee;
  font-weight: 700;
  font-size: 10px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.shield-info-card strong {
  overflow: hidden;
  color: #eef4ff;
  font-size: 12px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shield-info-modules {
  display: grid;
  gap: 6px;
  margin-top: 10px;
  padding: 10px;
  border: 1px solid rgb(143 162 255 / 20%);
  border-radius: 12px;
  background: rgb(15 23 42 / 68%);
}

.shield-info-modules p {
  margin: 0;
  color: #dce8ff;
  font-size: 12px;
  line-height: 1.5;
}

.shield-checker-output .pending {
  color: #b8c7ff;
}

@keyframes button-shine {
  from {
    transform: translateX(-120%);
  }

  to {
    transform: translateX(120%);
  }
}

@keyframes card-rise {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (width <= 700px) {
  .shield-info-grid {
    grid-template-columns: 1fr;
  }
}

/* Continuous panel surface; reserve the remaining viewport for its content. */
.wwidget {gap:0;box-sizing:border-box;}
.wwidget.wopen {background:#0b0e18;}
.wwidget > .title {flex:0 0 auto;}
.wwidget > .wform {flex:1 1 0;min-height:0;max-height:none;box-sizing:border-box;overflow-x:hidden;padding-top:8px;align-content:start;grid-auto-rows:max-content;}

/* Settings stays reachable in the header; status messages remain available. */
.wwidget > .title {display:flex;align-items:center;gap:10px;}
.wwidget .widget-brand {flex:1;min-width:0;}
.wwidget .header-config {display:flex;align-items:center;justify-content:center;flex:0 0 42px;width:42px;height:42px;padding:0;border:1px solid #39466b;border-radius:12px;background:#1c2949;color:#cfe1ff;cursor:pointer;}
.wwidget .header-config:hover {background:#29395e;}
.wwidget .header-config:focus-visible {outline:2px solid #8fd8ff;outline-offset:2px;}
.wwidget .wstatus:empty {display:none;}
.wwidget .wstatus:not(:empty) {width:auto;white-space:normal;overflow-wrap:anywhere;}

/* One scrollbar for every section and image card. */
.wwidget .wform > .widget-section,
.wwidget .wform > details.widget-section[open],
.wwidget .wform > .widget-section-actions,
.wwidget .wform > .widget-section-images[open],
.wwidget .wform .images {max-height:none;overflow:visible;scrollbar-gutter:auto;}
.wwidget .image-progress {display:grid;gap:5px;width:100%;min-width:0;}
.wwidget .image-progress-label {font-size:11px;line-height:1.3;color:#d9e5ff;text-align:right;}
.wwidget .image-progress progress {display:block;appearance:none;width:100%;height:6px;border:0;border-radius:6px;overflow:hidden;background:#27334e;}
.wwidget .image-progress progress::-webkit-progress-bar {background:#27334e;border-radius:6px;}
.wwidget .image-progress progress::-webkit-progress-value {background:linear-gradient(90deg,#8176ff,#42b6dc);border-radius:6px;}
.wwidget .image-progress progress::-moz-progress-bar {background:linear-gradient(90deg,#8176ff,#42b6dc);border-radius:6px;}
.wwidget .widget-logo {width:52px;height:52px;object-fit:cover;animation:none;}
@media(width<=420px){.wwidget .widget-logo{width:40px;height:40px;}}

.macroshark-mobile-import{box-sizing:border-box;width:min(92vw,430px);max-height:85dvh;overflow:auto;padding:18px;}
.macroshark-mobile-file{display:grid;gap:10px;margin:18px 0;white-space:normal;}
.macroshark-mobile-file input[type="file"]{display:block;position:static;opacity:1;width:100%;min-width:0;min-height:48px;font-size:16px;color:#e8ecff;pointer-events:auto;}
.macroshark-mobile-file input::file-selector-button{min-height:44px;margin-right:8px;padding:8px 12px;background:#26355b;color:#e8ecff;border:1px solid #596b9c;border-radius:8px;}

.wwidget .macroshark-inline-file {
  position:relative;display:flex;align-items:center;justify-content:center;
  grid-column:1 / -1;box-sizing:border-box;width:100%;min-width:0;min-height:48px;
  overflow:hidden;border:1px solid #596b9c;border-radius:10px;
  background:#26355b;color:#eef2ff;font-size:14px;font-weight:600;cursor:pointer;
}
.wwidget .macroshark-inline-file > span {pointer-events:none;}
/* The native input receives the tap directly, including in Safari/Stay. */
.wwidget .macroshark-inline-file > input.add-image {
  position:absolute;inset:0;display:block;box-sizing:border-box;width:100%;height:100%;
  min-width:0;margin:0;padding:0;opacity:0;pointer-events:auto;cursor:pointer;
}
.wwidget .macroshark-inline-file:focus-within {outline:2px solid #8fd8ff;outline-offset:2px;}
.wwidget .macroshark-inline-file:has(input:disabled) {opacity:.5;cursor:wait;}

/* Touch drags belong to the image only while it is unlocked. */
.wwidget .shark-resume[hidden]{display:none!important;}

.wwidget .shark-actions-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;width:100%}
.wwidget .shark-actions-grid>button{width:100%;min-width:0;min-height:62px;margin:0!important;padding:8px 5px;display:flex;align-items:center;justify-content:center;gap:5px;white-space:normal;line-height:1.25;font-size:12px;box-sizing:border-box}
.wwidget .shark-actions-grid>button span{min-width:0;overflow-wrap:anywhere}
.wwidget button.shark-running{background:#176443!important;border-color:#50db8c!important;color:white}
.wwidget .shark-settings-storage[hidden],.wwidget .autooverlay-stop[hidden]{display:none!important}
.wwidget .shark-overlay-compact{width:auto!important;min-width:112px!important;height:28px;min-height:0;padding:3px!important;margin-left:auto;font-size:11px!important;display:inline-flex;gap:5px;align-items:center;justify-content:center;white-space:nowrap}

.macroshark-reference-layer{position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none!important;z-index:10}
.macroshark-reference-layer[hidden]{display:none!important}
.macroshark-reference-on .wimage{visibility:hidden!important;pointer-events:none!important}
.wwidget .widget-section-images>.widget-section-summary{gap:5px;flex-wrap:wrap}
.wwidget .macroshark-reference-toggle{height:28px;min-height:28px;min-width:0!important;width:auto!important;padding:3px 7px!important;font-size:11px;white-space:nowrap;margin:0;display:inline-flex;align-items:center;justify-content:center}
.wwidget .widget-section-images>.widget-section-summary .widget-section-title{margin-right:auto}
.wwidget .shark-overlay-compact{min-width:0!important;padding:3px 6px!important;margin-left:0}

.wwidget .shark-overlay-compact i{font-size:13px}.wwidget .widget-section-images .images-collapse-state{display:none}
.wwidget .shark-subpanel{pointer-events:auto;position:absolute;inset:82px 0 0;z-index:90;display:flex;flex-direction:column;background:rgb(13 20 37 / 87%);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);border:1px solid #303e65;border-radius:12px 12px 0 0;min-height:0;box-sizing:border-box}
.wwidget.shark-subpanel-open .wform{visibility:hidden;pointer-events:none}
.wwidget .shark-subpanel-head{display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid #303e65;flex-shrink:0}
.wwidget .shark-subpanel button{background:#17233b;color:#e4ebff;border:1px solid #405477;border-radius:10px;cursor:pointer;font-family:inherit}.wwidget .shark-subpanel button:disabled{opacity:.45;cursor:default}.wwidget .shark-subpanel-head button{padding:8px;min-width:0}
.wwidget .shark-editor .macroshark-inline-file{position:relative;display:flex;align-items:center;justify-content:center;min-height:48px;width:100%;box-sizing:border-box;overflow:hidden}
.wwidget .shark-editor .editor-file{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
.wwidget .shark-editor .macroshark-inline-file span{white-space:normal}
.wwidget .shark-subpanel-body{overflow:auto;min-height:0;padding:12px;overscroll-behavior:contain}
.wwidget .shark-auto-settings{display:flex;flex-direction:column;gap:18px;font-size:14px}.wwidget .shark-auto-settings label{display:flex;flex-direction:column;gap:8px}.wwidget .shark-auto-settings .shark-random-label{flex-direction:row}.wwidget .shark-auto-settings input[type=number],.wwidget .shark-auto-settings select{width:100%;min-width:0;box-sizing:border-box;padding:10px;background:#17233b;color:#e4ebff;border:1px solid #405477;border-radius:8px;font-size:16px}.wwidget .shark-auto-fields{display:grid;grid-template-columns:minmax(0,1fr) 110px;gap:8px}.wwidget .shark-auto-settings button{min-height:44px}.wwidget .shark-auto-range,.wwidget .shark-auto-error{font-size:12px;line-height:1.5;white-space:normal}.wwidget .shark-auto-error:empty{display:none}
.wwidget .shark-paint-settings{display:flex;flex-direction:column;gap:12px}
.wwidget .shark-paint-settings>button{width:100%;min-height:48px}
.wwidget .shark-editor{display:flex;flex-direction:column;gap:12px;width:100%;min-width:0}
.wwidget .shark-editor p{font-size:12px;line-height:1.45;margin:0;color:#bbc8e3;white-space:normal}
.wwidget .shark-editor input[type=number],.wwidget .shark-editor select{width:100%;min-width:0;box-sizing:border-box;font-size:16px;padding:8px;background:#17233f;color:#e4ebff;border:1px solid #485b85;border-radius:8px}
.wwidget .editor-dimensions,.wwidget .editor-footer{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.wwidget .editor-dimensions label{font-size:12px;min-width:0}
.wwidget .editor-preview{display:block;width:auto;max-width:100%;height:auto;max-height:220px;object-fit:contain;align-self:center;background:repeating-conic-gradient(#23304c 0% 25%,#111b30 0% 50%) 50% / 16px 16px;image-rendering:pixelated}
.wwidget .editor-colors{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px}
.wwidget .editor-colors label{position:relative;display:block;height:36px;cursor:pointer}
.wwidget .editor-colors input{position:absolute;z-index:1;left:0;top:0;width:15px;height:15px;margin:0;accent-color:#44bce6}
.wwidget .editor-colors span{display:block;height:100%;border-radius:6px;border:1px solid #9dabc5}
.wwidget .editor-colors input:not(:checked)+span{opacity:.3}
.wwidget .editor-footer button{min-width:0;min-height:48px;white-space:normal;padding:6px;font-size:12px}

.wwidget .shark-random-label{display:flex;align-items:center;gap:8px;padding:8px 12px;font-size:13px;white-space:normal}.wwidget .shark-random-hint{margin:0 12px 12px;color:#b5c2df;font-size:12px;white-space:normal}.wwidget .shark-pixel-limit{display:flex;flex-direction:column;gap:6px;padding:8px 12px;font-size:12px}.wwidget .shark-pixel-range{width:100%;accent-color:#55bde8}.wwidget .shark-auto-state{font-size:10px;margin-left:6px}.wwidget .draw-and-paint[aria-pressed="true"]{background:#245e77;border-color:#66d7f4}.wwidget .shark-manual-label{display:flex;align-items:center;gap:8px;white-space:normal;font-size:12px;}

.wwidget.wopen > .wform {background:transparent;}
.wwidget .wform > .widget-section {background:linear-gradient(180deg,rgb(20 30 52 / 83%),rgb(14 22 40 / 86%));backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);}
.wwidget .widget-section-summary {background:linear-gradient(180deg,rgb(20 30 52 / 72%),rgb(16 25 45 / 76%));}
.wwidget > .title {background:rgb(10 17 32 / 65%);}
.wwidget .widget-logo {object-fit:contain;width:54px;height:60px;border-radius:0;animation:none;filter:none;}
.wwidget .header-config {font-size:25px;font-weight:800;}
.macroshark-guide {box-sizing:border-box;width:min(680px,calc(100vw - 24px));max-height:calc(100dvh - 32px);padding:0;margin:auto;border:1px solid #465c89;border-radius:16px;background:#111b30;color:#e7efff;font:14px/1.6 system-ui,sans-serif;overflow:auto;overscroll-behavior:contain;}
.macroshark-guide::backdrop {background:#020712b8;}
.macroshark-guide-head {position:sticky;top:0;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px;background:#15243e;border-bottom:1px solid #334970;}
.macroshark-guide-head strong {font-size:20px;}
.macroshark-guide-head small {display:block;color:#9cc5df;}
.macroshark-guide .guide-close {flex:0 0 44px;width:44px;height:44px;border:1px solid #526b93;border-radius:10px;background:#223858;color:#fff;font-size:26px;cursor:pointer;}
.macroshark-guide-body {padding:8px 20px 24px;overflow-wrap:anywhere;}
.macroshark-guide details {margin:12px 0;padding:12px;border:1px solid #334970;border-radius:10px;background:#17243c;}
.macroshark-guide summary {font-weight:700;color:#bceaff;cursor:pointer;white-space:normal;}
.macroshark-guide dt {margin-top:14px;font-weight:700;color:#a5ddff;}
.macroshark-guide dd {margin:4px 0 0;}
.macroshark-guide li {margin:8px 0;}
.macroshark-guide button:focus-visible,.macroshark-guide summary:focus-visible {outline:2px solid #7fd8ff;outline-offset:3px;}

/* Stretch the image section's contents instead of centering their intrinsic widths. */
.wwidget .wform > .widget-section-images {justify-content:stretch;justify-items:stretch;grid-template-columns:minmax(0,1fr);min-width:0;}
.wwidget .widget-section-images > .widget-image-actions,
.wwidget .widget-section-images > .images {width:100%;min-width:0;box-sizing:border-box;justify-self:stretch;}
.wwidget .widget-image-actions {grid-template-columns:minmax(0,1fr);}
.wwidget .images .image {min-width:0;box-sizing:border-box;}


/* Plus.24: independent canvas card and compact controls inside the main panel. */
.wwidget{height:auto;max-height:100dvh;gap:0;overflow:hidden;pointer-events:none}
.wwidget.wopen{height:auto;max-height:100dvh;background:transparent}
.wwidget>.title{display:flex;gap:6px;padding:8px 8px 8px 58px;min-height:64px;box-sizing:border-box;border:1px solid #39466b;border-radius:0 0 12px 0;background:rgb(10 17 32 / 89%);transform:none;pointer-events:auto}
.wwidget .widget-brand{min-width:0;overflow:hidden}
.wwidget .widget-brand-text{font-size:18px;white-space:nowrap}
.wwidget .header-config{flex:0 0 38px;width:38px;height:38px;font-size:22px}
.wwidget .shark-check-updates{font-size:16px}
.wwidget>.title>.wopen-button{position:static;flex:0 0 38px;width:38px;height:38px;border-radius:10px;box-shadow:none}
.wwidget>.wform{display:grid;flex:0 1 auto;min-height:0;max-height:calc(100dvh - 64px);padding:8px 8px max(8px,env(safe-area-inset-bottom));overflow-y:auto;overflow-x:hidden;background:transparent;transform:none;pointer-events:auto}
.wwidget .wstatus:not(:empty){margin:0;padding:10px;border:1px solid #39466b;border-radius:10px;background:rgb(12 21 39 / 89%)}
.wwidget .wform>.widget-section-actions,.wwidget .wform>.widget-section-images{margin:0;width:100%;box-sizing:border-box}
.wwidget .wform>.widget-section-images{margin-top:7px}
.wwidget .shark-canvas-toggle{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:40px;margin:0;border:1px solid #39466b;border-radius:10px;background:#1c2949;color:#e7ecff;font-weight:700;cursor:pointer}
.wwidget .shark-canvas-toggle.shark-running{background:#116344;color:white;border-color:#36bb80}
.wwidget .shark-hide-canvas{display:grid;place-items:center;flex:0 0 28px;width:28px;height:28px;min-height:0;padding:0!important;border:1px solid #52658d;border-radius:8px;background:#1c2949;color:#e7ecff;cursor:pointer}
.wwidget.shark-canvas-hidden .widget-section-images{display:none!important}
.wwidget .shark-mini-grid{display:none}
.wwidget:not(.wopen)>.title,.wwidget:not(.wopen)>.wform>.wstatus,.wwidget:not(.wopen)>.wform>.shark-main-actions,.wwidget:not(.wopen)>.wform>.shark-settings-storage{display:none!important}
.wwidget:not(.wopen)>.wform{width:100%;max-height:100dvh;padding-top:8px}
.wwidget:not(.wopen) .shark-mini-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;padding:8px;border:1px solid #39466b;border-radius:12px;background:rgb(12 21 39 / 92%)}
.wwidget .shark-mini-grid>button{position:static;display:grid;place-items:center;box-sizing:border-box;width:100%;min-width:0;min-height:44px;margin:0;padding:0;border:1px solid #39466b;border-radius:9px;background:#1c2949;color:#e7ecff;box-shadow:none;cursor:pointer}
.wwidget .shark-mini-grid>button.shark-running{background:#116344;color:white;border-color:#36bb80}
.wwidget .shark-mini-grid>button:disabled{opacity:.45;cursor:not-allowed}
.wwidget .shark-mini-grid>button i{font-size:18px}
@media(width<=480px){.wwidget>.title{padding-left:52px}.wwidget .widget-brand-text{font-size:16px}.wwidget .header-config{flex-basis:36px;width:36px;height:36px}}

/* Plus.24: floating panels without a full-height backdrop. */
.wwidget{background:transparent!important}
.wwidget.wopen>.wform{flex:0 1 auto;max-height:calc(100dvh - 64px);row-gap:0;background:transparent}
.wwidget>.title{margin:8px 8px 0 8px;width:calc(100% - 16px);border-radius:12px}
.wwidget .shark-main-actions{margin-top:7px!important;border-radius:12px 12px 0 0!important;border-bottom:0!important}
.wwidget .shark-canvas-toggle{margin-top:0;border-radius:0 0 12px 12px}
.wwidget .widget-section-images{margin-top:7px!important}
.wwidget:not(.wopen)>.wform{max-height:100dvh}
.wwidget .shark-subpanel{inset:82px 8px auto;height:min(560px,calc(100dvh - 90px));max-height:calc(100dvh - 90px);border-radius:12px}

/* Plus.24: two independently positioned floating cards. */
.wwidget,.wwidget.wopen{top:8px;left:8px;width:min(380px,calc(100vw - 16px));height:auto;max-height:calc(100dvh - 16px);overflow:visible;container-type:normal;background:rgb(10 17 32 / 94%)!important;border:1px solid #39466b;border-radius:12px;box-shadow:0 12px 30px rgb(0 0 0 / 35%)}
.wwidget>.title{width:100%;margin:0;border:0;border-bottom:1px solid #39466b;border-radius:12px 12px 0 0;cursor:grab;touch-action:none}
.wwidget.shark-dragging>.title{cursor:grabbing}
.wwidget>.wform,.wwidget.wopen>.wform{width:100%;max-height:calc(100dvh - 82px);padding:8px;overflow-y:auto;overflow-x:hidden;transform:none!important}
.wwidget .shark-main-actions{margin-top:0!important;border-radius:10px 10px 0 0!important}
.wwidget .shark-canvas-toggle{border-radius:0 0 10px 10px}
.wwidget .widget-section-images{position:fixed;top:8px;left:calc(100vw - min(380px,100vw - 16px) - 8px);z-index:1001;display:grid;width:min(380px,calc(100vw - 16px))!important;max-height:calc(100dvh - 16px)!important;margin:0!important;box-sizing:border-box;overflow-y:auto;pointer-events:auto;box-shadow:0 12px 30px rgb(0 0 0 / 35%)}
.wwidget .widget-section-images>.widget-section-summary{cursor:grab;touch-action:none}
.wwidget .widget-section-images.shark-dragging>.widget-section-summary{cursor:grabbing}
.wwidget:not(.wopen)>.wform{max-height:calc(100dvh - 16px)}

/* WPlace-inspired compact toolbar. */
.wwidget:not(.wopen){width:max-content;max-width:calc(100vw - 16px);border:2px solid #1b2a44;border-radius:4px;background:#fff!important;box-shadow:4px 4px 0 rgb(2 20 49 / 30%);color:#394e6a;font-family:Geist,ui-sans-serif,system-ui,sans-serif}
.wwidget:not(.wopen)>.wform{width:auto;max-height:none;padding:6px;background:#fff!important;overflow:visible}
.wwidget:not(.wopen) .shark-mini-grid{display:flex;align-items:center;gap:5px;padding:0;border:0;border-radius:0;background:transparent}
.wwidget:not(.wopen) .shark-mini-grip{display:grid;place-items:center;width:13px;min-height:40px;color:#71849f;font-size:16px;line-height:1;cursor:grab;touch-action:none;user-select:none}
.wwidget:not(.wopen) .shark-mini-grid>button{flex:0 0 40px;width:40px;height:40px;min-height:40px;border:2px solid #a9b8ce;border-radius:3px;background:#e3e9f4;color:#394e6a;box-shadow:2px 2px 0 rgb(2 20 49 / 20%)}
.wwidget:not(.wopen) .shark-mini-grid>button.shark-running{background:#0069ff;border-color:#004fbf;color:white}
.wwidget:not(.wopen) .shark-mini-grid>button:hover{background:#d1dded}
.wwidget:not(.wopen) .shark-mini-grid>button.shark-running:hover{background:#005bdc}
.wwidget:not(.wopen) .shark-mini-grid>button i{font-size:16px}
.wwidget:not(.wopen)>.wform>.shark-canvas-toggle{display:none}
.wwidget:not(.wopen) .widget-section-images{color:#e7ecff;font-family:Poppins,sans-serif}
.macroshark-native-notice{position:fixed;top:max(16px,env(safe-area-inset-top));left:50%;right:auto;transform:translateX(-50%);z-index:2147483646;width:min(360px,calc(100vw - 120px));box-sizing:border-box;padding:12px;border:2px solid #1b2a44;border-radius:3px;background:#fff;color:#394e6a;box-shadow:4px 4px 0 rgb(2 20 49 / 30%);font:13px Geist,ui-sans-serif,system-ui,sans-serif}
.macroshark-native-notice strong{display:inline-block;margin-bottom:5px;font-size:14px}
.macroshark-native-notice button{float:right;border:1px solid #a9b8ce;border-radius:2px;background:#e3e9f4;color:#394e6a;cursor:pointer}
.macroshark-native-notice p{clear:both;margin:0;line-height:1.4;overflow-wrap:anywhere}

/* Keep map-image controls touchable, with bounded growth as the image zooms. */
.wimage > .wtopbar {
  box-sizing: border-box;
  width: clamp(244px, 100%, 304px);
  max-width: calc(100vw - 20px);
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 6px;
  font-size: 16px;
  -webkit-text-size-adjust: none;
  text-size-adjust: none;
}
.wimage > .wtopbar button {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 44px;
  max-height: 56px;
  aspect-ratio: 1;
  padding: 0;
}
.wimage.mobile-drag-unlocked canvas,.wimage.mobile-drag-unlocked > .wtopbar{touch-action:none;-webkit-user-select:none;user-select:none;}
.wimage:not(.mobile-drag-unlocked) canvas{touch-action:auto;}
@media (pointer:coarse){.wimage > .wtopbar{opacity:1;}.wimage > .wtopbar button{min-width:40px;min-height:40px;}}

/* Plus.25: follow WPlace's live theme variables and data-game-ui style. */
.wwidget{
  --shark-surface:var(--color-base-100,#fff);
  --shark-raised:var(--color-base-200,#f2f7fe);
  --shark-control:var(--color-base-300,#e3e9f4);
  --shark-ink:var(--color-base-content,#394e6a);
  --shark-accent:var(--color-primary,#0069ff);
  --shark-line:color-mix(in srgb,var(--shark-ink) 32%,transparent);
  color:var(--shark-ink);
}
.wwidget.wopen{background:var(--shark-surface)!important;border-color:var(--shark-line);color:var(--shark-ink)}
.wwidget.wopen>.title,.wwidget.wopen .wform>.widget-section,.wwidget.wopen .widget-section-summary,.wwidget.wopen .widget-section-images,.wwidget.wopen .shark-subpanel,.wwidget.wopen .wstatus:not(:empty){background:var(--shark-surface);border-color:var(--shark-line);color:var(--shark-ink)}
.wwidget.wopen .wform>.widget-section,.wwidget.wopen .widget-section-images,.wwidget.wopen .shark-subpanel{background:var(--shark-raised)}
.wwidget.wopen button:not(.shark-running),.wwidget.wopen .macroshark-inline-file,.wwidget.wopen select,.wwidget.wopen input:not([type=checkbox]):not([type=range]),.wwidget.wopen .images .image{background:var(--shark-control)!important;background-image:none!important;border-color:var(--shark-line)!important;color:var(--shark-ink)!important}
.wwidget.wopen .widget-brand-text,.wwidget.wopen .widget-section-title,.wwidget.wopen .image-progress-label,.wwidget.wopen .shark-editor p,.wwidget.wopen .shark-random-hint{color:var(--shark-ink)}
.wwidget.wopen .images .image .preview{background:var(--shark-surface);border-color:var(--shark-line)}
.wwidget.wopen .shark-subpanel button:not(.shark-running){background:var(--shark-control);color:var(--shark-ink);border-color:var(--shark-line)}
.wwidget.wopen .shark-canvas-toggle.shark-running,.wwidget.wopen button.shark-running{background:var(--shark-accent)!important;border-color:var(--shark-accent)!important;color:var(--color-primary-content,#fff)}
.wwidget:not(.wopen){top:clamp(180px,38vh,390px);left:auto;right:8px;width:calc(var(--shark-quick-size,40px) + 8px);max-width:calc(var(--shark-quick-size,40px) + 8px);max-height:none;border:0!important;border-radius:0;background:transparent!important;box-shadow:none!important;color:var(--shark-ink)}
.wwidget:not(.wopen)>.wform{padding:0;border:0!important;background:transparent!important;box-shadow:none!important;overflow:visible}
.wwidget:not(.wopen) .shark-mini-grid{display:flex;flex-direction:column;gap:8px;padding:4px;background:transparent;cursor:grab;touch-action:none}
.wwidget:not(.wopen) .shark-mini-grid>button{flex:0 0 var(--shark-quick-size,40px);width:var(--shark-quick-size,40px);height:var(--shark-quick-size,40px);min-height:var(--shark-quick-size,40px);padding:0;border:1px solid var(--shark-line);border-radius:999px;background:var(--shark-control);color:var(--shark-ink);box-shadow:0 2px 5px rgb(0 0 0 / 22%);cursor:pointer}
.wwidget:not(.wopen) .shark-mini-grid>button.shark-running{background:var(--shark-accent);border-color:var(--shark-accent);color:var(--color-primary-content,#fff)}
.wwidget:not(.wopen) .shark-mini-grid>button:hover:not(.shark-running){background:var(--shark-raised)}
html[data-game-ui] .wwidget,html[data-game-ui] .wwidget button,html[data-game-ui] .wwidget input,html[data-game-ui] .wwidget select{font-family:var(--font-pixel,Geist,ui-sans-serif,system-ui,sans-serif)}
html[data-game-ui] .wwidget.wopen,html[data-game-ui] .wwidget.wopen>.title,html[data-game-ui] .wwidget.wopen .widget-section,html[data-game-ui] .wwidget.wopen .widget-section-summary,html[data-game-ui] .wwidget.wopen .widget-section-images,html[data-game-ui] .wwidget.wopen button,html[data-game-ui] .wwidget.wopen input,html[data-game-ui] .wwidget.wopen select{border-radius:2px}
html[data-game-ui] .wwidget.wopen{box-shadow:4px 4px 0 color-mix(in srgb,var(--shark-ink) 40%,transparent)}
html[data-game-ui] .wwidget:not(.wopen) .shark-mini-grid>button{border-width:2px;border-radius:2px;box-shadow:3px 3px 0 color-mix(in srgb,var(--shark-ink) 38%,transparent)}

/* Plus.28: canvas gallery and independent settings for every image. */
.wwidget .widget-section-images{position:fixed;z-index:1002;box-sizing:border-box;width:min(940px,calc(100vw - 16px))!important;max-height:min(82dvh,760px)!important;min-height:min(460px,calc(100dvh - 16px));padding:0!important;overflow-y:auto;border:2px solid var(--shark-line);border-radius:8px;background:var(--shark-raised);color:var(--shark-ink)}
.wwidget .widget-section-images>.widget-section-summary{position:sticky;top:0;z-index:2;box-sizing:border-box;min-height:62px;margin:0;padding:12px 16px;border-bottom:1px solid var(--shark-line);border-radius:0;background:var(--shark-control);color:var(--shark-ink)}
.wwidget .widget-section-images .widget-section-title{font-size:15px;color:var(--shark-ink)}
.wwidget .shark-gallery-count{font-size:11px;opacity:.75;margin-right:auto}
.wwidget .widget-section-images>.widget-image-actions{display:grid;grid-template-columns:minmax(0,1fr) 180px;gap:8px;padding:12px 16px;border-bottom:1px solid var(--shark-line)}
.wwidget .shark-gallery-search{box-sizing:border-box;width:100%;min-width:0;padding:10px 12px;border:1px solid var(--shark-line);border-radius:5px;background:var(--shark-surface);color:var(--shark-ink)}
.wwidget .widget-section-images .macroshark-inline-file{grid-column:auto;min-height:42px;border-radius:5px;background:var(--shark-accent);color:var(--color-primary-content,#fff)}
.wwidget .widget-section-images .images{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;width:100%;max-height:none;padding:16px;box-sizing:border-box;overflow:visible}
.wwidget .images .shark-gallery-card{position:relative;display:flex;flex-direction:column;gap:7px;min-width:0;min-height:220px;padding:10px;border:1px solid var(--shark-line);border-radius:5px;background:var(--shark-surface);color:var(--shark-ink);box-shadow:3px 3px 0 color-mix(in srgb,var(--shark-ink) 15%,transparent)}
.wwidget .images .shark-gallery-card[hidden]{display:none!important}
.wwidget .images .shark-gallery-card .preview{min-height:118px;max-height:150px;overflow:hidden;border:0;border-radius:2px;background:repeating-conic-gradient(var(--shark-control) 0% 25%,var(--shark-raised) 0% 50%) 50% / 16px 16px}
.wwidget .images .shark-gallery-card .preview img{max-height:138px;max-width:100%;border-radius:0;image-rendering:pixelated}
.wwidget .shark-card-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;min-width:0;font-size:13px}
.wwidget .shark-card-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wwidget .shark-card-size{flex:none;font-size:10px;opacity:.7}
.wwidget .shark-gallery-card .image-progress{margin-top:auto}
.wwidget .shark-gallery-card .image-progress-label{text-align:left;color:var(--shark-ink)}
.wwidget .shark-gallery-card .shark-detail-back,.wwidget .shark-gallery-card .shark-image-settings,.wwidget .shark-gallery-card .image-controls{display:none}
.wwidget .images .shark-gallery-card:not(.shark-detail-active) .image-controls{display:none!important}
.wwidget .images.shark-detail-mode{display:block}
.wwidget .images.shark-detail-mode>.shark-gallery-card:not(.shark-detail-active){display:none}
.wwidget .images .shark-gallery-card.shark-detail-active{display:grid;grid-template-columns:minmax(180px,32%) minmax(0,1fr);grid-template-rows:auto auto auto 1fr auto;gap:12px;min-height:400px;padding:16px}
.wwidget .shark-detail-active .shark-detail-back{display:block;grid-column:1/-1;justify-self:start;width:auto;min-height:36px}
.wwidget .shark-detail-active .preview{grid-column:1;grid-row:2/6;align-self:stretch;max-height:none;min-height:260px}
.wwidget .shark-detail-active .preview img{max-height:280px}
.wwidget .shark-detail-active .shark-card-heading{grid-column:2;grid-row:2;font-size:18px}
.wwidget .shark-detail-active .image-progress{grid-column:2;grid-row:3;margin:0}
.wwidget .shark-detail-active .shark-image-settings{display:grid;grid-column:2;grid-row:4;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;align-content:start}
.wwidget .shark-image-settings label{display:flex;flex-wrap:wrap;align-items:center;gap:7px;padding:8px;border:1px solid var(--shark-line);border-radius:4px;background:var(--shark-control)!important;color:var(--shark-ink)!important;font-size:12px}
.wwidget .shark-image-settings label:first-child,.wwidget .shark-image-settings label:nth-child(2){grid-column:1/-1}
.wwidget .shark-image-settings select,.wwidget .shark-image-settings input[type=range]{width:100%;min-width:0}
.wwidget .shark-image-settings input[type=checkbox]{accent-color:var(--shark-accent)}
.wwidget .shark-detail-active .image-controls{display:grid;grid-column:2;grid-row:5;grid-template-columns:repeat(8,minmax(0,1fr))}
.wwidget .shark-detail-active .image-controls button{min-width:0;height:36px}
.wwidget .widget-section-images:has(.shark-detail-mode)>.widget-image-actions{display:none}
@media(max-width:700px){.wwidget .widget-section-images{max-height:calc(100dvh - 16px)!important;min-height:0}.wwidget .widget-section-images .images{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:10px}.wwidget .widget-section-images>.widget-image-actions{grid-template-columns:minmax(0,1fr) 130px;padding:8px}.wwidget .widget-section-images>.widget-image-actions .shark-open-editor{grid-column:1/-1}.wwidget .widget-section-images .shark-gallery-count,.wwidget .widget-section-images .images-collapse-state{display:none}.wwidget .widget-section-images>.widget-section-summary{flex-wrap:nowrap;gap:5px;padding:8px}.wwidget .widget-section-images .shark-overlay-compact span,.wwidget .widget-section-images .macroshark-reference-toggle span{display:none}.wwidget .widget-section-images .macroshark-reference-toggle{width:30px;min-width:30px;padding:0!important}.wwidget .widget-section-images .macroshark-reference-toggle::before{content:'◫';font-size:16px}.wwidget .images .shark-gallery-card.shark-detail-active{grid-template-columns:1fr;grid-template-rows:auto auto auto auto auto auto}.wwidget .shark-detail-active .shark-detail-back,.wwidget .shark-detail-active .preview,.wwidget .shark-detail-active .shark-card-heading,.wwidget .shark-detail-active .image-progress,.wwidget .shark-detail-active .shark-image-settings,.wwidget .shark-detail-active .image-controls{grid-column:1;grid-row:auto}.wwidget .shark-detail-active .preview{min-height:180px}.wwidget .shark-detail-active .image-controls{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(max-width:420px){.wwidget .widget-section-images .images{grid-template-columns:1fr}.wwidget .widget-section-images>.widget-image-actions{grid-template-columns:1fr}.wwidget .shark-detail-active .shark-image-settings{grid-template-columns:1fr}.wwidget .shark-image-settings label{grid-column:1/-1}}
html[data-game-ui] .wwidget .widget-section-images,html[data-game-ui] .wwidget .images .shark-gallery-card,html[data-game-ui] .wwidget .shark-gallery-search{border-radius:2px}
/* Plus.28: apply WPlace's active palette and normal/pixel geometry across MacroShark. */
:root{--ms-surface:var(--color-base-100,#fff);--ms-raised:var(--color-base-200,#f2f7fe);--ms-control:var(--color-base-300,#e3e9f4);--ms-ink:var(--color-base-content,#394e6a);--ms-accent:var(--color-primary,#6157f5);--ms-on-accent:var(--color-primary-content,#fff);--ms-border:color-mix(in srgb,var(--ms-ink) 30%,transparent)}
.wwidget,.macroshark-guide,.macroshark-modal,.macroshark-native-notice,.wimage .wform,.wimage .wtopbar{color:var(--ms-ink)!important;border-color:var(--ms-border)!important}
.wwidget.wopen,.wwidget.wopen>.title,.wwidget .widget-section-images,.wwidget .shark-subpanel,.macroshark-guide,.macroshark-modal,.macroshark-native-notice,.wimage .wform,.wimage .wtopbar{background:var(--ms-surface)!important}
.wwidget .shark-main-actions,.wwidget .wform>.widget-section,.wwidget .widget-section-images .images,.wwidget .shark-image-settings label,.macroshark-guide details,.macroshark-guide-head,.macroshark-modal-head,.macroshark-modal .color-tools{background:var(--ms-raised)!important;color:var(--ms-ink)!important;border-color:var(--ms-border)!important}
.wwidget.wopen button:not(.shark-running),.wwidget .widget-section-images button:not(.shark-running),.macroshark-guide button,.macroshark-modal button,.macroshark-native-notice button,.wimage .wtopbar button{background:var(--ms-control)!important;color:var(--ms-ink)!important;border-color:var(--ms-border)!important}
.wwidget button.shark-running,.wwidget .shark-canvas-toggle.shark-running,.wwidget .widget-section-images .macroshark-inline-file,.macroshark-modal button.is-active{background:var(--ms-accent)!important;color:var(--ms-on-accent)!important;border-color:var(--ms-accent)!important}
.wwidget select,.wwidget input:not([type=checkbox]):not([type=range]),.macroshark-modal select,.macroshark-modal input:not([type=checkbox]):not([type=range]),.macroshark-guide input,.shark-gallery-search{background:var(--ms-surface)!important;color:var(--ms-ink)!important;border-color:var(--ms-border)!important}
.wwidget.wopen,.wwidget.wopen>.title,.wwidget .widget-section-images,.wwidget .shark-subpanel,.macroshark-guide,.macroshark-modal,.macroshark-native-notice{border-radius:24px!important;box-shadow:0 9px 24px rgb(0 0 0 / 22%)}
.wwidget .shark-main-actions{border-radius:20px!important}.wwidget .widget-section-images>.widget-section-summary,.macroshark-guide-head,.macroshark-modal-head{border-radius:22px 22px 0 0!important}
.wwidget.wopen button,.wwidget .widget-section-images button,.macroshark-guide button,.macroshark-modal button,.macroshark-native-notice button,.wimage .wtopbar button{border-radius:999px!important}
.wwidget .images .shark-gallery-card,.wwidget .shark-image-settings label,.macroshark-guide details{border-radius:18px!important;box-shadow:none!important}
.wwidget .shark-gallery-search,.wwidget select,.wwidget input:not([type=checkbox]):not([type=range]),.macroshark-modal select,.macroshark-modal input:not([type=checkbox]):not([type=range]){border-radius:12px!important}
.wwidget .images .shark-gallery-card .preview{border-radius:14px!important;background:repeating-conic-gradient(var(--ms-control) 0% 25%,var(--ms-raised) 0% 50%) 50% / 16px 16px!important;box-shadow:none!important}
.wimage .wform{border-radius:20px!important;box-shadow:0 9px 24px rgb(0 0 0 / 22%)!important}.wimage .wform label,.wimage .wform .macroshark-switch-row,.wimage .wform .strategy-row{background:var(--ms-raised)!important;color:var(--ms-ink)!important;border-color:var(--ms-border)!important}.wimage .wform button,.wimage .wform select{background:var(--ms-control)!important;color:var(--ms-ink)!important;border-color:var(--ms-border)!important;border-radius:999px!important}
.macroshark-guide summary,.macroshark-guide dt,.macroshark-guide-head small,.macroshark-modal strong,.macroshark-modal label,.macroshark-modal p{color:var(--ms-ink)!important}
#macroshark-update-screen{color:var(--ms-ink)!important}#macroshark-update-screen>div,#macroshark-startup-error{background:var(--ms-surface)!important;color:var(--ms-ink)!important;border-color:var(--ms-border)!important;border-radius:24px!important;box-shadow:0 9px 24px rgb(0 0 0 / 22%)!important}#macroshark-update-screen button{background:var(--ms-control)!important;color:var(--ms-ink)!important;border-color:var(--ms-border)!important;border-radius:999px!important}#macroshark-update-screen a{background:var(--ms-accent)!important;color:var(--ms-on-accent)!important;border-color:var(--ms-accent)!important;border-radius:999px!important}
html[data-game-ui] .wwidget.wopen,html[data-game-ui] .wwidget.wopen>.title,html[data-game-ui] .wwidget .widget-section-images,html[data-game-ui] .wwidget .shark-subpanel,html[data-game-ui] .macroshark-guide,html[data-game-ui] .macroshark-modal,html[data-game-ui] .macroshark-native-notice,html[data-game-ui] #macroshark-update-screen>div,html[data-game-ui] #macroshark-startup-error{border-radius:2px!important;box-shadow:4px 4px 0 color-mix(in srgb,var(--ms-ink) 35%,transparent)!important}
html[data-game-ui] .wwidget .shark-main-actions,html[data-game-ui] .wwidget .widget-section-images>.widget-section-summary,html[data-game-ui] .wwidget .images .shark-gallery-card,html[data-game-ui] .wwidget .shark-image-settings label,html[data-game-ui] .macroshark-guide-head,html[data-game-ui] .macroshark-guide details,html[data-game-ui] .macroshark-modal-head,html[data-game-ui] .wwidget button,html[data-game-ui] .macroshark-guide button,html[data-game-ui] .macroshark-modal button,html[data-game-ui] .macroshark-native-notice button,html[data-game-ui] #macroshark-update-screen button,html[data-game-ui] #macroshark-update-screen a,html[data-game-ui] .wwidget select,html[data-game-ui] .wwidget input,html[data-game-ui] .shark-gallery-search,html[data-game-ui] .wimage .wtopbar button{border-radius:2px!important}
html[data-game-ui] .wwidget .images .shark-gallery-card .preview,html[data-game-ui] .wimage .wform,html[data-game-ui] .wimage .wform button,html[data-game-ui] .wimage .wform select{border-radius:2px!important}
/* Plus.28: keep Canvas centered as its content changes and use neutral shadows. */
.wwidget .widget-section-images{position:fixed!important;top:50dvh!important;left:50vw!important;right:auto!important;transform:translate(-50%,-50%)!important;width:min(940px,calc(100vw - 16px))!important;max-height:calc(100dvh - 16px)!important;min-height:0!important;margin:0!important;overflow-y:auto}
.wwidget .widget-section-images>.widget-section-summary{min-height:52px;padding:8px 14px;cursor:default;touch-action:auto}
.wwidget .widget-section-images>.widget-section-summary::marker{content:''}
.wwidget .widget-section-images>.widget-section-summary::-webkit-details-marker{display:none}
.wwidget .widget-section-images>.widget-section-summary>.shark-hide-canvas i{transform:none!important}
.wwidget:not(.wopen) .shark-mini-grid{gap:8px}
.wwidget:not(.wopen) .shark-mini-grid{position:relative;z-index:1003}
.wwidget:not(.wopen) .shark-mini-grid>button{flex:0 0 var(--shark-quick-size,40px);width:var(--shark-quick-size,40px);height:var(--shark-quick-size,40px);min-height:var(--shark-quick-size,40px);border-radius:999px}
html[data-game-ui] .wwidget:not(.wopen) .shark-mini-grid>button{border-radius:2px}
.wwidget .widget-section-images:has(.shark-detail-mode){width:min(820px,calc(100vw - 16px))!important}
.wwidget .images .shark-gallery-card.shark-detail-active{grid-template-columns:minmax(160px,30%) minmax(0,1fr);grid-template-rows:auto auto auto auto auto;gap:8px;min-height:0;padding:10px}
.wwidget .shark-detail-active .shark-detail-back{min-height:30px}
.wwidget .shark-detail-active .preview{grid-row:2/6;min-height:180px;max-height:230px}
.wwidget .shark-detail-active .preview img{max-height:215px}
.wwidget .shark-detail-active .shark-image-settings{gap:6px}
.wwidget .shark-image-settings label{gap:4px;padding:6px 8px}
.wwidget .shark-image-settings label:nth-child(2){grid-column:1}
.wwidget .shark-image-settings .shark-card-reset-size{grid-column:2;min-height:42px;padding:5px 8px}
.wimage .wrapper>.wform{display:none!important}
.wimage.macroshark-zoom-hidden{display:none!important}
.wwidget .shark-detail-active .image-controls{gap:5px}
.wwidget .shark-detail-active .image-controls button{height:30px}
.wwidget.wopen,.wwidget.wopen>.title,.wwidget .widget-section-images,.wwidget .shark-subpanel,.macroshark-guide,.macroshark-modal,.macroshark-native-notice,.wimage .wform,#macroshark-update-screen>div,#macroshark-startup-error{box-shadow:0 9px 24px rgb(0 0 0 / 30%)!important}
.wimage .wrapper{border-color:var(--ms-border)!important;box-shadow:0 0 0 1px rgb(0 0 0 / 45%)!important}
html[data-game-ui] .wwidget.wopen,html[data-game-ui] .wwidget.wopen>.title,html[data-game-ui] .wwidget .widget-section-images,html[data-game-ui] .wwidget .shark-subpanel,html[data-game-ui] .macroshark-guide,html[data-game-ui] .macroshark-modal,html[data-game-ui] .macroshark-native-notice,html[data-game-ui] .wimage .wform,html[data-game-ui] #macroshark-update-screen>div,html[data-game-ui] #macroshark-startup-error{box-shadow:4px 4px 0 rgb(0 0 0 / 45%)!important}
html[data-game-ui] .wwidget:not(.wopen) .shark-mini-grid>button{box-shadow:3px 3px 0 rgb(0 0 0 / 40%)!important}
@media(max-width:700px){.wwidget .widget-section-images{max-height:calc(100dvh - 12px)!important}.wwidget .images .shark-gallery-card.shark-detail-active{grid-template-columns:1fr;grid-template-rows:none}.wwidget .shark-detail-active .preview{grid-row:auto;min-height:120px;max-height:180px}.wwidget .shark-detail-active .preview img{max-height:165px}.wwidget .shark-detail-active .shark-image-settings{grid-template-columns:repeat(2,minmax(0,1fr))}.wwidget .shark-detail-active .image-controls{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(max-width:420px){.wwidget .widget-section-images>.widget-section-summary{min-height:44px;padding:6px 8px}.wwidget .images .shark-gallery-card.shark-detail-active{padding:8px}.wwidget .shark-detail-active .shark-image-settings{grid-template-columns:1fr}.wwidget .shark-image-settings label:nth-child(2),.wwidget .shark-image-settings .shark-card-reset-size{grid-column:1}}
/* WPlace-style painting dock and independent shark launcher. */
.macroshark-launcher{position:fixed;z-index:1004;width:52px;height:52px;pointer-events:auto}
.macroshark-launcher[hidden]{display:none!important}
.macroshark-launcher>.wopen-button{position:static!important;display:grid;place-items:center;width:52px!important;height:52px!important;margin:0!important;padding:3px!important;border:2px solid var(--ms-accent)!important;border-radius:999px!important;background:var(--ms-accent)!important;color:var(--ms-on-accent)!important;box-shadow:0 3px 12px rgb(0 0 0 / 35%)!important}
.macroshark-launcher.shark-in-paint-bar,.macroshark-launcher.shark-in-paint-bar>.wopen-button{width:var(--shark-integrated-size,32px)!important;height:var(--shark-integrated-size,32px)!important}
.macroshark-launcher.shark-in-paint-bar>.wopen-button{padding:1px!important;border:1px solid var(--ms-border)!important;background:var(--ms-control)!important;box-shadow:none!important}
.wwidget>.title>.wopen-button .shark-close-symbol{display:grid;place-items:center;width:100%;height:100%;font-size:26px;line-height:1;font-weight:400}
.macroshark-launcher .shark-update-symbol{font-size:27px;font-weight:700;line-height:1}
.macroshark-launcher>.wopen-button img,.wwidget>.title>.wopen-button img{display:block;width:100%;height:100%;object-fit:contain;image-rendering:auto}
.wwidget.wopen{position:fixed!important;top:auto!important;bottom:var(--shark-dock-bottom,76px)!important;left:8px!important;right:8px!important;width:min(1380px,calc(100vw - 16px))!important;max-width:none!important;max-height:calc(100dvh - var(--shark-dock-bottom,76px) - 8px)!important;margin-inline:auto!important;overflow:visible!important;border:2px solid var(--ms-border)!important;background:var(--ms-surface)!important}
.wwidget.wopen>.title{box-sizing:border-box;width:100%;min-height:50px;margin:0;padding:6px 10px;border:0;border-bottom:1px solid var(--ms-border);border-radius:22px 22px 0 0!important;background:var(--ms-surface)!important;cursor:default;touch-action:auto}
.wwidget.wopen>.title>.wopen-button{flex:0 0 38px;width:38px;height:38px;border:1px solid var(--ms-border);padding:2px}
.wwidget.wopen>.wform{display:grid;gap:7px;box-sizing:border-box;width:100%;max-height:min(48dvh,430px);padding:8px 10px 10px;overflow-y:auto;overflow-x:hidden;background:var(--ms-raised)!important;border-radius:0 0 22px 22px;scrollbar-gutter:stable}
.wwidget.wopen .wform>.shark-main-actions{width:100%;max-height:none!important;margin:0!important;padding:0!important;overflow:visible!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}
.wwidget.wopen .shark-main-actions>.widget-section-summary{display:none}
.wwidget.wopen .shark-actions-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}
.wwidget.wopen .shark-actions-grid>button{min-height:56px;padding:6px;line-height:1.15}
.wwidget .shark-actions-grid>button.shark-running,.wwidget:not(.wopen) .shark-mini-grid>button.shark-running,.wwidget .widget-section-images button.shark-running{background:var(--ms-accent)!important;border-color:var(--ms-accent)!important;color:var(--ms-on-accent)!important}
.wwidget .wstatus,.wwidget .autooverlay-status,.wwidget .shark-resume{display:none!important}
.wwidget.wopen .autooverlay-status{grid-column:1/-1;min-height:0}
.wwidget.wopen.shark-subpanel-open{height:min(560px,calc(100dvh - var(--shark-dock-bottom,76px) - 8px))!important}
.wwidget.wopen.shark-subpanel-open .shark-subpanel{position:absolute!important;inset:0!important;box-sizing:border-box;width:100%!important;height:100%!important;max-height:none!important;margin:0!important;overflow:hidden;border-radius:inherit!important}
.wwidget:not(.wopen) .shark-mini-grid{z-index:1}
html[data-game-ui] .macroshark-launcher>.wopen-button,html[data-game-ui] .wwidget.wopen>.title,html[data-game-ui] .wwidget.wopen>.wform{border-radius:2px!important}
html[data-game-ui] .wwidget.wopen{border-width:3px!important}
@media(max-width:920px){.wwidget.wopen .shark-actions-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(max-width:620px){.macroshark-launcher,.macroshark-launcher>.wopen-button{width:46px!important;height:46px!important}.wwidget.wopen>.title{min-height:44px;padding:5px 7px}.wwidget.wopen .widget-brand-text{font-size:15px}.wwidget.wopen .widget-brand img{width:30px;height:30px}.wwidget.wopen .header-config{flex-basis:32px;width:32px;height:32px}.wwidget.wopen>.title>.wopen-button{flex-basis:32px;width:32px;height:32px}.wwidget.wopen>.wform{max-height:min(52dvh,460px);padding:7px}.wwidget.wopen .shark-actions-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.wwidget.wopen .shark-actions-grid>button{min-height:50px;font-size:11px}.wwidget.wopen.shark-subpanel-open{height:min(68dvh,calc(100dvh - var(--shark-dock-bottom,76px) - 8px))!important}}
.macroshark-capture-panel{position:fixed;z-index:1006;top:50dvh;left:50vw;transform:translate(-50%,-50%);box-sizing:border-box;width:min(640px,calc(100vw - 16px));max-height:calc(100dvh - 16px);overflow:auto;border:2px solid var(--ms-border);border-radius:24px;background:var(--ms-surface);color:var(--ms-ink);box-shadow:0 9px 24px rgb(0 0 0 / 30%);font:14px/1.4 system-ui,sans-serif}
.macroshark-capture-panel[hidden]{display:none!important}
.macroshark-capture-panel header{position:sticky;top:0;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid var(--ms-border);background:var(--ms-surface)}
.macroshark-capture-panel header strong{font-size:17px}
.macroshark-capture-panel .capture-body{display:grid;gap:12px;padding:16px}
.macroshark-capture-panel p{margin:0}
.macroshark-capture-panel .capture-points{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.macroshark-capture-panel button{min-height:44px;padding:8px 12px;border:1px solid var(--ms-border);border-radius:999px;background:var(--ms-control);color:var(--ms-ink);font:inherit;cursor:pointer}
.macroshark-capture-panel button:disabled{opacity:.5;cursor:not-allowed}
.macroshark-capture-panel .capture-close{min-width:38px;min-height:38px;padding:0;font-size:24px}
.macroshark-capture-panel .capture-download{background:var(--ms-accent);color:var(--ms-on-accent)}
.macroshark-capture-panel .capture-preview{display:grid;place-items:center;height:220px;overflow:hidden;border:1px solid var(--ms-border);border-radius:16px;background:repeating-conic-gradient(var(--ms-control) 0% 25%,var(--ms-raised) 0% 50%) 50% / 16px 16px}
.macroshark-capture-panel .capture-preview canvas{display:block;width:100%;height:100%;object-fit:contain;image-rendering:pixelated}
.macroshark-capture-panel .capture-status{min-height:20px;font-size:12px}
.macroshark-capture-picker{position:fixed;inset:0;z-index:1007;cursor:crosshair;touch-action:none}
.macroshark-capture-picker span{position:absolute;top:8px;left:50%;transform:translateX(-50%);max-width:calc(100vw - 16px);padding:8px 12px;border-radius:999px;background:var(--ms-surface);color:var(--ms-ink);box-shadow:0 2px 10px rgb(0 0 0 / 40%);text-align:center;white-space:nowrap;pointer-events:none}
html[data-game-ui] .macroshark-capture-panel,html[data-game-ui] .macroshark-capture-panel button,html[data-game-ui] .macroshark-capture-panel .capture-preview,html[data-game-ui] .macroshark-capture-picker span{border-radius:2px}
@media(max-width:620px){.macroshark-capture-panel .capture-body{padding:10px}.macroshark-capture-panel .capture-points{grid-template-columns:1fr}.macroshark-capture-panel .capture-preview{height:180px}}
.macroshark-launcher,.macroshark-launcher>.wopen-button{width:var(--shark-quick-size,40px)!important;height:var(--shark-quick-size,40px)!important}
.macroshark-quick-rail{position:fixed;z-index:1004;box-sizing:border-box;width:calc(var(--shark-quick-size,40px) + 8px);pointer-events:none}
.macroshark-quick-rail .shark-mini-grid{display:flex;flex-direction:column;gap:8px;padding:4px;pointer-events:auto}
.macroshark-quick-rail .shark-mini-grid>button{display:grid;place-items:center;box-sizing:border-box;flex:0 0 var(--shark-quick-size,40px);width:var(--shark-quick-size,40px);height:var(--shark-quick-size,40px);min-height:var(--shark-quick-size,40px);margin:0;padding:0;border:1px solid var(--ms-border);border-radius:999px;background:var(--ms-control);color:var(--ms-ink);box-shadow:0 2px 5px rgb(0 0 0 / 22%);cursor:pointer}
.macroshark-quick-rail .shark-mini-grid>button.shark-running{background:var(--ms-accent);border-color:var(--ms-accent);color:var(--ms-on-accent)}
.macroshark-quick-rail .shark-mini-grid>button:disabled{opacity:.45;cursor:not-allowed}
html[data-game-ui] .macroshark-quick-rail .shark-mini-grid>button{border:2px solid var(--ms-border);border-radius:2px;box-shadow:3px 3px 0 rgb(0 0 0 / 40%)}
.wwidget:not(.shark-canvas-hidden){z-index:1005}
/* Plus.34: Canvas branding and a compact, balanced image detail. */
.wwidget .shark-canvas-brand{display:flex;align-items:center;gap:9px;min-width:0;margin-right:auto}
.wwidget .shark-canvas-brand img{width:34px;height:34px;object-fit:contain;flex:none}
.wwidget .shark-canvas-brand .widget-section-title{margin:0!important;white-space:nowrap}
.wwidget .shark-canvas-brand-name{font-size:15px;font-weight:800;white-space:nowrap}
.wwidget .shark-gallery-count{margin-right:0}
.wwidget .shark-detail-active .preview{grid-row:2!important;min-height:170px;max-height:230px}
.wwidget .shark-detail-active .image-controls{grid-column:1!important;grid-row:3/6!important;align-self:start;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px}
.wwidget .shark-detail-active .image-controls button{min-height:38px!important}
.wwidget .shark-detail-active .shark-card-heading{justify-content:flex-start}
.wwidget .shark-detail-active .shark-card-name{flex:0 1 auto}
.wwidget .shark-detail-active .shark-card-size{margin-left:auto}
.wwidget .shark-card-rename{display:none;flex:none;align-items:center;justify-content:center;width:30px;min-height:30px!important;padding:0!important}
.wwidget .shark-detail-active .shark-card-rename{display:flex}
.wwidget .shark-card-name-input{box-sizing:border-box;flex:1;min-width:0;max-width:100%;padding:5px 7px;font:inherit}
.wwidget .shark-card-name-input[hidden],.wwidget .shark-card-name[hidden],.wwidget .shark-card-rename[hidden]{display:none!important}
/* WPlace-style resize points: a large touch target around each small circle. */
.wimage>.wtopbar,.wimage .wrapper>.wform{display:none!important}
.wimage .wrapper>.resize{position:absolute;z-index:4;box-sizing:border-box;width:28px;height:28px;min-width:28px;min-height:28px;margin:0;padding:0;border:0;background:transparent;opacity:0;pointer-events:none;touch-action:none;user-select:none;transform:translate(-50%,-50%)}
.wimage .wrapper>.resize::after{content:'';position:absolute;inset:6px;border:2px solid #65a8ff;border-radius:50%;background:#f8fbff;box-shadow:0 1px 5px rgb(0 0 0 / 65%)}
.wimage.shark-resize-selected .wrapper>.resize,.wimage:hover .wrapper>.resize{opacity:1;pointer-events:auto}
.wimage .wrapper>.resize.no-pointer-events{opacity:0!important;pointer-events:none!important}
.wimage .wrapper>.resize.n{top:0;left:50%;right:auto;bottom:auto;cursor:ns-resize}
.wimage .wrapper>.resize.ne{top:0;left:100%;right:auto;bottom:auto;cursor:nesw-resize}
.wimage .wrapper>.resize.e{top:50%;left:100%;right:auto;bottom:auto;cursor:ew-resize}
.wimage .wrapper>.resize.se{top:100%;left:100%;right:auto;bottom:auto;cursor:nwse-resize}
.wimage .wrapper>.resize.s{top:100%;left:50%;right:auto;bottom:auto;cursor:ns-resize}
.wimage .wrapper>.resize.sw{top:100%;left:0;right:auto;bottom:auto;cursor:nesw-resize}
.wimage .wrapper>.resize.w{top:50%;left:0;right:auto;bottom:auto;cursor:ew-resize}
.wimage .wrapper>.resize.nw{top:0;left:0;right:auto;bottom:auto;cursor:nwse-resize}
@media(max-width:700px){.wwidget .shark-detail-active .preview,.wwidget .shark-detail-active .image-controls{grid-column:1!important;grid-row:auto!important}.wwidget .shark-detail-active .image-controls{grid-template-columns:repeat(3,minmax(0,1fr))!important}.wwidget .shark-canvas-brand-name{font-size:13px}.wwidget .shark-canvas-brand img{width:28px;height:28px}}
@media(max-width:420px){.wwidget .shark-canvas-brand{gap:5px}.wwidget .shark-canvas-brand-name{font-size:12px}.wwidget .shark-canvas-brand .widget-section-title{font-size:13px}}
html[data-game-ui] .wimage .wrapper>.resize::after{border-radius:2px;box-shadow:2px 2px 0 rgb(0 0 0 / 60%)}
/* Plus.34: one centered Canvas workspace with native-style progress and image actions. */
.wwidget.wopen{width:0!important;height:0!important;min-height:0!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;pointer-events:none}
.wwidget.wopen.shark-subpanel-open{width:0!important;height:0!important;min-height:0!important}
.wwidget.wopen>.title,.wwidget .shark-main-actions,.wwidget .shark-settings-storage,.wwidget.wopen>.wform>.wstatus{display:none!important}
.wwidget.wopen>.wform{display:contents!important}
.wwidget .widget-section-images{pointer-events:auto}
.wwidget.wopen.shark-subpanel-open .widget-section-images>.shark-subpanel{position:absolute!important;inset:0!important;z-index:5;box-sizing:border-box;width:100%!important;height:100%!important;max-height:none!important;overflow:auto;border-radius:inherit!important;visibility:visible!important;pointer-events:auto!important}
.wwidget .widget-section-images>.widget-section-summary{display:flex;align-items:center;gap:6px}
.wwidget .widget-section-images .header-config{flex:none;width:32px;height:32px;min-height:32px;padding:0;font-size:17px}
.wwidget .widget-section-images>.widget-image-actions{grid-template-columns:minmax(0,1fr) 150px 180px;align-items:stretch;gap:8px}
.wwidget .widget-section-images>.widget-image-actions>*{min-width:0;min-height:40px;box-sizing:border-box}
.wwidget .widget-section-images .shark-sync-wplace{display:flex;align-items:center;justify-content:center;gap:6px;padding:5px 9px;white-space:nowrap;font-size:12px}
.wwidget .widget-section-images .macroshark-inline-file{width:100%;min-height:40px;grid-column:auto}
.wwidget .images .shark-gallery-card.shark-paint-target{border-color:var(--ms-accent)!important;box-shadow:0 0 0 1px var(--ms-accent),3px 3px 0 color-mix(in srgb,var(--ms-ink) 15%,transparent)}
.wwidget .shark-progress-track{display:flex;width:100%;height:6px;overflow:hidden;border-radius:var(--game-radius,9999px);background:var(--ms-control)}
.wwidget .shark-progress-track span{display:block;height:100%;flex:none;transition:width .2s ease}
.wwidget .shark-progress-done{background:#17a862}
.wwidget .shark-progress-remaining{background:#e0475a}
.wwidget .shark-gallery-card .image-progress{display:flex;flex-direction:column;gap:5px}
.wwidget .shark-gallery-card .image-progress-label{font-size:11px;opacity:.55;font-variant-numeric:tabular-nums}
.wwidget .shark-image-actions{display:none}
.wwidget .shark-detail-active .shark-image-actions{display:grid;grid-column:1/-1;grid-row:2;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}
.wwidget .shark-image-actions button{min-height:40px;padding:6px;overflow:hidden;white-space:normal;font-size:11px;line-height:1.2}
.wwidget .shark-image-actions button i{margin-right:4px}
.wwidget .shark-detail-active .preview{grid-column:1!important;grid-row:3!important}
.wwidget .shark-detail-active .shark-card-heading{grid-column:2!important;grid-row:3!important}
.wwidget .shark-detail-active .image-progress{grid-column:2!important;grid-row:4!important}
.wwidget .shark-detail-active .shark-image-settings{grid-column:2!important;grid-row:5!important}
.wwidget .shark-detail-active .image-controls{grid-column:1!important;grid-row:4/6!important}
.wwidget .shark-image-select[aria-pressed=true]{background:var(--ms-accent)!important;color:var(--ms-on-accent)!important;border-color:var(--ms-accent)!important}
@media(max-width:700px){.wwidget .widget-section-images>.widget-image-actions{grid-template-columns:repeat(2,minmax(0,1fr))}.wwidget .widget-section-images>.widget-image-actions .shark-gallery-search{grid-column:1/-1}.wwidget .widget-section-images .shark-canvas-brand{margin-right:auto}.wwidget .shark-detail-active .shark-image-actions{grid-template-columns:repeat(2,minmax(0,1fr))}.wwidget .shark-detail-active .shark-image-select{grid-column:1/-1}.wwidget .shark-detail-active .preview,.wwidget .shark-detail-active .shark-card-heading,.wwidget .shark-detail-active .image-progress,.wwidget .shark-detail-active .shark-image-settings,.wwidget .shark-detail-active .image-controls{grid-column:1!important;grid-row:auto!important}}
@media(max-width:420px){.wwidget .widget-section-images>.widget-image-actions{grid-template-columns:repeat(2,minmax(0,1fr))}.wwidget .widget-section-images>.widget-image-actions .shark-sync-wplace span{font-size:11px}.wwidget .widget-section-images>.widget-section-summary{flex-wrap:wrap}.wwidget .widget-section-images .shark-canvas-brand{flex:1 1 100%}.wwidget .widget-section-images .header-config{width:30px;height:30px;min-height:30px}}
html[data-game-ui] .wwidget .shark-progress-track,html[data-game-ui] .wwidget .shark-image-actions button{border-radius:2px!important}

/* Plus.37: shared theme for detached dialogs and per-image settings. */
:root{--ms-preview-surface:var(--color-base-200,#f2f7fe)}
.wwidget,.macroshark-modal,.macroshark-guide,.wimage{--text:var(--ms-ink);--bg:var(--ms-surface);--panel:var(--ms-raised);--border:var(--ms-border);--accent:var(--ms-accent);--text-invert:var(--ms-on-accent);--main:var(--ms-accent);--main-hover:var(--ms-accent);--hover:var(--ms-control);--background:var(--ms-surface);--background-hover:var(--ms-raised);--background-disabled:var(--ms-control);--surface-card:var(--ms-raised);--surface-card-hover:var(--ms-control);--input-bg:var(--ms-surface);--input-border:var(--ms-border);--input-hover:var(--ms-raised);--ring:var(--ms-accent);--glow-main:transparent;--action-download:var(--ms-ink);--action-edit:var(--ms-ink);--action-delete:var(--ms-ink);--action-palette:var(--ms-ink);--action-lock:var(--ms-ink)}
.wwidget [hidden],.macroshark-modal [hidden],.shark-auto-countdown[hidden]{display:none!important}
.macroshark-modal .color-chip,.macroshark-modal .preview-card,.macroshark-modal .color-tools,.macroshark-modal .toggle-row,.macroshark-modal .preview-strategy-row,.macroshark-modal .strategy-controls,.macroshark-modal .bulk-toggle{background:var(--ms-raised)!important;background-image:none!important;color:var(--ms-ink)!important;border-color:var(--ms-border)!important;box-shadow:none!important}
.macroshark-modal .color-chip .order-index,.macroshark-modal .color-chip .hex,.macroshark-modal .color-chip .buy-chip{background:var(--ms-control)!important;color:var(--ms-ink)!important;border-color:var(--ms-border)!important}
.macroshark-modal .color-chip .swatch{background:var(--swatch-color)!important}
.macroshark-modal p,.macroshark-modal label,.macroshark-modal strong,.macroshark-modal .meta,.macroshark-modal .drag,.macroshark-modal .color-chip .premium.on,.macroshark-guide p,.macroshark-guide small{color:var(--ms-ink)!important}
.macroshark-modal option,.wwidget option{background:var(--ms-surface)!important;color:var(--ms-ink)!important}
.macroshark-modal input,.macroshark-modal select,.wwidget input[type=checkbox]{accent-color:var(--ms-accent)}
.macroshark-modal input[type=checkbox]:checked{background-color:var(--ms-accent)!important;border-color:var(--ms-accent)!important}
.macroshark-modal .toggle-track,.macroshark-modal .toggle-slider{background:var(--ms-control)!important;border-color:var(--ms-border)!important}
.macroshark-modal input:checked+.toggle-track,.macroshark-modal input:checked+.toggle-slider{background:var(--ms-accent)!important}
.macroshark-modal .macroshark-switch-row{background:var(--ms-raised)!important;border-color:var(--ms-border)!important;color:var(--ms-ink)!important}
.macroshark-modal .macroshark-switch-slider{background:var(--ms-control)!important;border-color:var(--ms-border)!important}
.macroshark-modal .macroshark-switch-slider::after{background:var(--ms-on-accent)!important}
.macroshark-modal .macroshark-switch input:checked+.macroshark-switch-slider{background:var(--ms-accent)!important;border-color:var(--ms-accent)!important}
.macroshark-modal .color-chip.drag-target{border-color:var(--ms-accent)!important;box-shadow:0 0 0 1px var(--ms-accent)!important}
.wwidget button .icon,.wwidget button i,.macroshark-modal button .icon{color:inherit!important}
.macroshark-modal .preview-canvas{background:var(--ms-preview-surface)!important;border-color:var(--ms-border)!important}
.wwidget select:focus,.macroshark-modal select:focus,.macroshark-modal input:focus{outline-color:var(--ms-accent)!important;border-color:var(--ms-accent)!important}
.wwidget,.wwidget *,.macroshark-modal,.macroshark-modal *,.macroshark-guide{scrollbar-color:color-mix(in srgb,var(--ms-ink) 40%,transparent) var(--ms-raised)}
.macroshark-modal::-webkit-scrollbar-track,.macroshark-modal *::-webkit-scrollbar-track,.wwidget *::-webkit-scrollbar-track{background:var(--ms-raised)!important}
.macroshark-modal::-webkit-scrollbar-thumb,.macroshark-modal *::-webkit-scrollbar-thumb,.wwidget *::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--ms-ink) 40%,transparent)!important;border-color:var(--ms-raised)!important}
.wwidget .macroshark-reference-toggle{gap:5px}
.wwidget,.macroshark-modal,.macroshark-guide{font-family:var(--font-sans,Geist,system-ui,sans-serif)}
.wwidget .shark-card-opacity{accent-color:var(--ms-accent);border-color:var(--ms-border)!important;background:var(--ms-surface)!important}
.wwidget input[type=range]::-webkit-slider-thumb{background:var(--ms-accent)!important;border-color:var(--ms-border)!important}
.wwidget input[type=range]::-moz-range-thumb{background:var(--ms-accent)!important;border-color:var(--ms-border)!important}
.wwidget .image-controls i{color:inherit!important}
.fa-gauge-high{--macroshark-icon:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M4 18a9 9 0 1 1 16 0M12 13l4-5M6 12H4m8-7V3m6 9h2M5 18h14'/%3E%3C/svg%3E")}
.fa-check{--macroshark-icon:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m5 12 4 4L19 6'/%3E%3C/svg%3E")}
.wwidget .macroshark-reference-toggle::before{content:none!important}
.wwidget .shark-auto-inline{grid-column:2!important;grid-row:4/7!important;z-index:1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;align-self:start;align-content:start;margin:0;padding:12px;min-width:0;border:1px solid var(--ms-border);border-radius:16px;background:var(--ms-raised);color:var(--ms-ink);font-size:12px}
.wwidget .shark-auto-inline .shark-auto-heading{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center}
.wwidget .shark-auto-inline label{display:grid;gap:6px;min-width:0;padding:0;margin:0}
.wwidget .shark-auto-inline .shark-auto-fields{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:5px}
.wwidget .shark-auto-inline input:not([type=checkbox]),.wwidget .shark-auto-inline select{box-sizing:border-box;width:100%;min-width:0;min-height:36px;padding:6px 8px;font:inherit;border:1px solid var(--ms-border)}
.wwidget .shark-auto-inline .shark-random-label{display:flex;align-items:center;gap:6px;grid-column:1/-1}
.wwidget .shark-auto-inline label.shark-random-label{background:var(--ms-control)!important;color:var(--ms-ink)!important;border-color:var(--ms-border)!important}
.wwidget .shark-auto-inline p,.wwidget .shark-auto-inline output{grid-column:1/-1;margin:0;line-height:1.45}
.wwidget .shark-auto-inline button[type=submit]{grid-column:1/-1;min-height:36px;background:var(--ms-accent)!important;color:var(--ms-on-accent)!important}
.wwidget .shark-auto-inline .shark-auto-close{width:28px;min-height:28px;padding:0;font-size:20px}
.wwidget .shark-detail-active:has(.shark-auto-inline)>.image-progress,.wwidget .shark-detail-active:has(.shark-auto-inline)>.shark-image-settings{visibility:hidden}
.macroshark-quick-rail .shark-mini-auto{position:relative;overflow:visible}
.shark-auto-countdown{position:absolute;right:calc(100% + 10px);top:50%;transform:translateY(-50%);display:block;padding:5px 8px;border:1px solid var(--ms-border);border-radius:999px;background:var(--ms-surface);color:var(--ms-ink);font:600 12px/1.25 system-ui,sans-serif;font-variant-numeric:tabular-nums;white-space:nowrap;pointer-events:none;box-shadow:0 2px 7px rgb(0 0 0 / 20%)}
.macroshark-native-notice:not(.shark-inline-notice){max-width:calc(100vw - 128px)!important}
.wwidget .widget-section-images>.shark-inline-notice{position:relative!important;inset:auto!important;transform:none!important;width:auto!important;max-width:none!important;margin:8px 12px!important;box-shadow:none!important;border:1px solid var(--ms-border)!important;border-radius:12px!important;pointer-events:auto}
html[data-game-ui] .wwidget .widget-section-images>.shark-inline-notice{border-radius:2px!important}
.shark-export-dialog{width:min(420px,calc(100vw - 20px))!important;box-sizing:border-box;resize:none!important}
.shark-export-dialog form{display:grid;gap:12px;padding-top:12px}
.shark-export-dialog label{display:grid;gap:6px}
.shark-export-dialog select{width:100%;min-width:0;min-height:42px;padding:8px}
.shark-export-dialog form button{min-height:42px;background:var(--ms-accent)!important;color:var(--ms-on-accent)!important}
.macroshark-modal .color-chip,.macroshark-modal .preview-card{border-radius:14px!important}
html[data-game-ui] .macroshark-modal .color-chip,html[data-game-ui] .macroshark-modal .preview-card,html[data-game-ui] .wwidget .shark-auto-inline,html[data-game-ui] .shark-auto-countdown{border-radius:2px!important}
@media(max-width:700px){.wwidget .shark-auto-inline{grid-column:1!important;grid-row:auto!important;margin:0}.wwidget .shark-detail-active:has(.shark-auto-inline)>.image-progress,.wwidget .shark-detail-active:has(.shark-auto-inline)>.shark-image-settings{display:none!important}.wwidget .widget-section-images>.widget-section-summary{flex-wrap:wrap;min-height:44px}.wwidget .shark-canvas-brand{flex:1 1 auto!important}.wwidget .macroshark-reference-toggle{flex:0 0 30px!important;min-width:30px!important;width:30px!important}.wwidget .shark-detail-active .shark-card-heading{min-height:34px}.wwidget .shark-auto-inline{grid-template-columns:1fr}.shark-auto-inline>label{grid-column:1/-1}}
/* Plus.37: global map capture, free map gestures and uncropped preview. */
.wwidget .widget-section-images>.widget-image-actions{grid-template-columns:minmax(0,1fr) 150px 116px 180px}
.wwidget .shark-capture-global{display:flex;align-items:center;justify-content:center;gap:6px;min-width:40px;font-size:12px}
.wwidget .shark-detail-active .shark-image-actions{grid-template-columns:repeat(4,minmax(0,1fr))}

.shark-deferred-card .preview{display:flex;align-items:center;justify-content:center}.shark-template-placeholder{font:64px/1 system-ui;opacity:.5}.shark-template-state{font:12px/1.4 system-ui;margin:8px 0 0;color:var(--ms-ink)}.shark-template-loading::before{content:'';display:inline-block;width:12px;height:12px;margin-right:7px;border:2px solid var(--ms-border);border-top-color:var(--ms-accent);border-radius:50%;vertical-align:-3px;animation:shark-template-spin .8s linear infinite}@keyframes shark-template-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.shark-template-loading::before{animation:none}}
.macroshark-capture-picker{pointer-events:none!important;touch-action:auto!important}
.macroshark-capture-picker span{max-width:calc(100vw - 110px);white-space:normal;line-height:1.35}
.macroshark-capture-picker button{pointer-events:auto;min-height:32px;margin-left:8px;padding:4px 9px;border:1px solid var(--ms-border);border-radius:999px;background:var(--ms-control);color:var(--ms-ink);font:inherit}
.macroshark-capture-panel .capture-preview{box-sizing:content-box;justify-self:center;width:100%;max-width:calc(100% - 2px);height:auto;min-height:0;max-height:none;overflow:hidden}
.macroshark-capture-panel .capture-preview img{display:block;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain;image-rendering:pixelated}
html[data-game-ui] .macroshark-capture-picker button{border-radius:2px}
@media(max-width:700px){.wwidget .widget-section-images>.widget-image-actions{grid-template-columns:minmax(0,1fr) 40px minmax(0,1fr)}.wwidget .shark-capture-global span{display:none}.wwidget .shark-detail-active .shark-image-actions{grid-template-columns:repeat(2,minmax(0,1fr))}}
.wwidget .shark-capture-global{overflow:hidden;white-space:nowrap}
.macroshark-capture-panel .capture-save-actions{display:flex;flex-wrap:wrap;gap:8px}
.macroshark-capture-panel .capture-save-actions>button{flex:1 1 140px;min-width:0}
.macroshark-capture-panel .capture-save-actions [hidden]{display:none!important}
.macroshark-photo-save{position:fixed;inset:8px;z-index:1008;overflow:auto;box-sizing:border-box;border:2px solid var(--ms-border);border-radius:24px;background:var(--ms-surface);color:var(--ms-ink);font:14px/1.5 system-ui,sans-serif;padding:12px;touch-action:auto}
.macroshark-photo-save header{position:sticky;top:-12px;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;background:var(--ms-surface)}
.macroshark-photo-save p{margin:8px 0 16px}
.macroshark-photo-save button{min-height:44px;padding:8px 16px;border:1px solid var(--ms-border);border-radius:999px;background:var(--ms-control);color:var(--ms-ink);font:inherit;cursor:pointer}
.macroshark-photo-save img{display:block;margin:0 auto;width:auto;height:auto;max-width:100%;max-height:70dvh;object-fit:contain;image-rendering:pixelated;pointer-events:auto!important;touch-action:auto!important;-webkit-touch-callout:default!important;-webkit-user-select:auto!important;user-select:auto!important}
html[data-game-ui] .macroshark-photo-save,html[data-game-ui] .macroshark-photo-save button{border-radius:2px}
.macroshark-quick-rail[hidden]{display:none!important}
.wwidget .widget-section-images{overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain}
.macroshark-launcher>.shark-rail-toggle[aria-expanded="false"]{background:var(--ms-control)!important;border-color:var(--ms-border)!important;color:var(--ms-ink)!important}
.wwidget .shark-detail-visual{display:contents}
.wwidget .shark-paint-starts{display:none}
.wwidget .shark-detail-active .shark-detail-visual{display:grid;gap:8px;align-content:start;min-width:0}
.wwidget .shark-detail-active .shark-detail-visual>.preview{grid-column:1!important;grid-row:auto!important;align-self:start;min-height:0;height:150px;max-height:150px;margin:0}
.wwidget .shark-detail-active .shark-detail-visual>.preview img{height:100%;width:100%;max-height:150px;object-fit:contain}
.wwidget .shark-detail-active .shark-detail-visual>.image-controls{grid-column:1!important;grid-row:auto!important;margin:0}
.wwidget .shark-detail-active .shark-paint-starts{display:grid;grid-template-columns:1fr;gap:6px;min-width:0}
.wwidget .shark-paint-starts>button{display:flex;align-items:center;justify-content:center;gap:7px;min-height:42px;min-width:0;width:100%;padding:8px;font-size:12px;font-weight:600;line-height:1.25;white-space:normal}
.wwidget .shark-paint-starts>button.shark-running{background:var(--ms-accent)!important;border-color:var(--ms-accent)!important;color:var(--ms-on-accent)!important}
.wwidget .shark-detail-active .shark-card-heading{align-self:start;min-height:34px;margin:0;padding:0;line-height:1.25;min-width:0}
@media(min-width:701px){.wwidget .images .shark-gallery-card.shark-detail-active{grid-template-rows:auto auto minmax(34px,max-content) max-content minmax(0,1fr)}.wwidget .shark-detail-active .shark-detail-visual{grid-column:1;grid-row:3/6}.wwidget .shark-auto-inline{grid-row:4/6!important}}
@media(max-width:700px){.wwidget .shark-detail-active .shark-detail-visual{grid-column:1!important;grid-row:auto!important}.wwidget .shark-detail-active .shark-paint-starts{grid-template-columns:repeat(2,minmax(0,1fr))}}
.wwidget .shark-image-coordinates{display:none}
.wwidget .shark-detail-active>.shark-image-coordinates{display:grid;grid-template-columns:1fr 1fr;gap:8px;grid-column:2;grid-row:5;min-width:0}
.shark-image-coordinates label{display:grid;gap:4px;font-size:11px;min-width:0}
.shark-image-coordinates input,.shark-capture-coordinates input{width:100%;box-sizing:border-box;min-width:0;padding:8px;border:1px solid var(--ms-border);background:var(--ms-surface);color:var(--ms-ink);font:inherit}
.shark-capture-coordinates{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}
@media(min-width:701px){.wwidget .images .shark-gallery-card.shark-detail-active{grid-template-rows:auto auto minmax(34px,max-content) max-content max-content minmax(0,1fr)}.wwidget .shark-detail-active .shark-detail-visual{grid-row:3/7}.wwidget .shark-detail-active>.shark-image-settings{grid-row:6!important}.wwidget .shark-auto-inline{grid-row:4/7!important}}
.wwidget .shark-detail-active:has(.shark-auto-inline)>.shark-image-coordinates{display:none}
@media(max-width:700px){.wwidget .shark-detail-active>.shark-image-coordinates{grid-column:1;grid-row:auto;grid-template-columns:1fr}.shark-capture-coordinates{grid-template-columns:1fr}}
`;
class mo extends Error {
  name = "macrosharkError";
  constructor(o, a) {
    super(o);
    a.widget.status = o;
  }
}
class Jo extends mo {
  name = "NoImageError";
  constructor(o) {
    super("❌ No image is selected", o);
  }
}
var A = {
  toggleWidget: {
    key: "b",
    shift: !0
  },
  minimizeWidget: {
    key: "m",
    shift: !0
  },
  showWidgetPanel: {
    key: "s",
    shift: !0
  },
  hideWidgetPanel: {
    key: "h",
    shift: !0
  },
  toggleOverlay: {
    key: "v",
    shift: !0
  },
  draw: {
    key: "enter",
    shift: !0
  },
  addImage: {
    key: "i",
    shift: !0
  },
  showShortcuts: {
    key: "/",
    shift: !0
  },
  focusNextImage: {
    key: "n",
    shift: !0
  },
  focusPreviousImage: {
    key: "p",
    shift: !0
  },
  openColorPanel: {
    key: "o",
    shift: !0
  },
  toggleImageLock: {
    key: "l",
    shift: !0
  },
  clickPaintWhenReady: {
    key: "r",
    shift: !0
  },
  startAutoOverlay: {
    key: "f",
    shift: !0
  },
  stopAutoOverlay: {
    key: "g",
    shift: !0
  },
  openColorConverterTool: {
    key: "1",
    shift: !0
  },
  openSamuelArchiveTool: {
    key: "2",
    shift: !0
  },
  openEralyonArchiveTool: {
    key: "3",
    shift: !0
  },
  openReceiveSmssTool: {
    key: "4",
    shift: !0
  },
  openEsimplusTool: {
    key: "5",
    shift: !0
  },
  openReceiveSmsFreeTool: {
    key: "6",
    shift: !0
  },
  openQuackrTool: {
    key: "7",
    shift: !0
  },
  openTextverifiedTool: {
    key: "8",
    shift: !0
  }
};
function F(o, a) {
  let l = a.key.toLowerCase(),
    i = o.key.toLowerCase(),
    r = (o.code ?? "").toLowerCase(),
    s = l === "/" && (i === "/" || i === "?" || r === "slash"),
    c = a.shift === !0 && /^\d$/.test(l) && (r === `digit${l}` || r === `numpad${l}`),
    g = s || c || i === l,
    p = a.ctrl === !0 ? o.ctrlKey || o.metaKey : !o.ctrlKey,
    d = a.ctrl === !0 ? !0 : a.meta === !0 ? o.metaKey : !o.metaKey;
  return g && o.shiftKey === Boolean(a.shift) && p && d && o.altKey === Boolean(a.alt);
}
function $o(o) {
  if (typeof HTMLElement > "u") return !1;
  if (!(o instanceof HTMLElement)) return !1;
  let a = o.tagName.toLowerCase();
  return a === "input" || a === "textarea" || o.isContentEditable || o.closest('[contenteditable="true"]') !== null;
}
var yo = `<button class="wopen-button" aria-label="Toggle widget">\r
  <svg viewBox="0 0 24 24" aria-hidden="true">\r
    <path d="M4 7h16M4 12h16M4 17h16"/>\r
  </svg>\r
</button>\r
<div class="title">\r
  <div class="widget-brand">\r
    <img class="widget-logo" src="" alt="Tiburón de MacroShark" />\r
    <span class="widget-brand-text">MacroShark</span>\r
  </div>
  <button class="shark-check-updates header-config" type="button" title="Comprobar actualizaciones" aria-label="Comprobar actualizaciones"><span aria-hidden="true">↻</span></button>
  <button hidden class="shark-open-paint header-config" type="button" title="Configurar pintado" aria-label="Configurar pintado"><i class="fa-solid fa-sliders" aria-hidden="true"></i></button>
  <button class="open-config header-config" type="button" title="Guía de MacroShark" aria-label="Guía de MacroShark"><span aria-hidden="true">?</span></button>\r
</div>\r
<div class="wform">\r
  <div class="wp wstatus" role="status" aria-live="polite"></div>
  <div class="shark-mini-grid" role="group" aria-label="Controles rápidos"></div>
\r
<details class="widget-section widget-section-actions shark-main-actions" open>
<summary class="widget-section-summary"><strong class="widget-section-title">ACCIONES</strong><i class="fa-solid fa-chevron-down"></i></summary>
<div class="shark-actions-grid">
<button class="shark-speed" type="button" title="Cambiar velocidad de pintado"><i class="fa-solid fa-gauge-high"></i><span>Velocidad de pintado · x1</span></button>
<button class="shark-confirm" type="button" aria-pressed="true" title="Confirmar automáticamente al terminar Dibujar"><i class="fa-solid fa-check"></i><span>Confirmar pintado</span></button>
<button class="autooverlay-config"><i class="fa-solid fa-clock-rotate-left"></i><span>Configurar AutoDraw</span></button>
<button class="capture-template" disabled><i class="fa-solid fa-camera"></i><span>Capturar imagen</span></button>
</div>
<button class="autooverlay-stop" hidden><i class="fa-solid fa-stop"></i></button>
<div class="wp autooverlay-status"></div>
</details>
<div class="shark-settings-storage" hidden><button class="draw" disabled><i class="fa-solid fa-pen-nib"></i><span>Dibujar</span></button><button class="autooverlay-start"><i class="fa-solid fa-play"></i><span>Iniciar AutoDraw</span></button><button class="shark-open-canvas" type="button"><i class="fa-solid fa-images" aria-hidden="true"></i><span>Canvas</span></button><div class="shark-paint-settings"><button class="draw-and-paint" disabled type="button" aria-pressed="false"><i class="fa-solid fa-wand-magic-sparkles"></i><span>Pintar automáticamente</span><span class="shark-auto-state">Apagado</span></button><label class="shark-pixel-limit">Píxeles por tanda: <output class="shark-pixel-value">Todos disponibles</output><input class="shark-pixel-range" type="range" min="1" max="1" value="1" step="1" aria-label="Píxeles por tanda"></label>\r<label class="shark-random-label"><input class="shark-random-quantity" type="checkbox"> Aleatorizar cantidad</label><p class="shark-random-hint">Desactivado: usa el límite elegido.</p></div></div>
<section class="widget-section widget-section-images">
    <div class="widget-section-summary">
      <div class="shark-canvas-brand"><img class="shark-canvas-logo" alt="" aria-hidden="true"><strong class="shark-canvas-brand-name">MacroShark</strong></div><span class="shark-gallery-count"></span>
      <button type="button" class="toggle-overlay shark-overlay-compact" title="Ocultar/mostrar overlays" aria-label="Ocultar/mostrar overlays"><i class="fa-solid fa-layer-group"></i></button><button type="button" class="macroshark-reference-toggle" aria-pressed="false" title="Referencia visual para pintar a mano"><i class="fa-solid fa-eye" aria-hidden="true"></i><span>Vista previa</span></button>
      <button class="shark-hide-canvas" type="button" title="Ocultar panel de imágenes" aria-label="Ocultar panel de imágenes"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
    </div>
    <div class="widget-image-actions">\r
      <input class="shark-gallery-search" type="search" placeholder="Buscar plantillas" aria-label="Buscar plantillas">\r
      <button class="shark-sync-wplace" type="button" title="Actualizar canvas desde WPlace"><i class="fa-solid fa-rotate" aria-hidden="true"></i><span>Actualizar canvas</span></button>\r
      <label class="macroshark-inline-file"><span>Importar Imagen</span><input class="add-image" type="file" accept="image/*,.wplace" aria-label="Importar imagen o plantilla"></label>\r
      \r
    </div>\r
    <div class="images"></div>\r
  </section>\r
</div>\r
`;
var oa = "macroshark:overlay-hidden",
  ia = "macroshark:auto-overlay-config",
  Ea = "data:image/webp;base64,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";
class SharkWidget extends SharkDisposable {
  bot;
  element = document.createElement("div");
  get status() {
    return this.$status.innerHTML;
  }
  set status(o) {
    this.$status.innerHTML = o;
    const message = this.$status.textContent?.trim();
    if (message && /error|fall[oó]|pausa|cerrad|verificaci[oó]n|no se pudo|actualizad/i.test(message)) this.showNativeNotice(message);
  }
  showNativeNotice(message) {
      this.$nativeNotice?.remove();
      const notice=document.createElement('div');notice.className='macroshark-native-notice';notice.setAttribute('role','status');
      const title=document.createElement('strong');title.textContent='MacroShark';
      const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','Cerrar aviso');close.onclick=()=>notice.remove();
      const body=document.createElement('p');body.textContent=message;notice.append(title,close,body);
      const workspace=this.element.querySelector('.widget-section-images');
      if(this.open&&workspace){notice.classList.add('shark-inline-notice');workspace.querySelector('.widget-section-summary').after(notice);}
      else document.body.append(notice);
      this.$nativeNotice=notice;
      setTimeout(()=>notice.remove(),10000);
    }
  get open() {
    return this.element.classList.contains("wopen");
  }
  set open(o) {
    if (!o) this.closeWorkspacePanel?.();
    if (o) this.element.classList.add("wopen");else this.element.classList.remove("wopen");
    this.canvasVisible = !!o;
    this.syncCanvasPanel?.();
    const a = this.$wopenButton;
    if (!a) return;
    a.setAttribute("aria-expanded", String(o)), a.setAttribute("aria-label", o ? f("mobileMinimize") : f("mobileShowPanel")), a.title = o ? f("mobileMinimize") : f("mobileShowPanel");
    if (!this.updateRequired) a.replaceChildren(o ? Object.assign(document.createElement('span'), { className: 'shark-close-symbol', textContent: '×' }) : Object.assign(document.createElement('img'), { src: Ea, alt: '' }));
    this.syncQuickPanel?.();
  }
  $settings;
  $status;
  $openConfig;
  $topbar;
  $draw;
  $drawAndPaint;
  $addImage;
  $captureTemplate;
  $toggleOverlay;
  $autoOverlayConfig;
  $autoOverlayStart;
  $autoOverlayStop;
  $autoOverlayStatus;
  $images;
  $imagesSection;
  $imagesCollapseState;
  $wopenButton;
  $widgetLogo;
  activeImageIndex = -1;
  autoOverlayIntervalId;
  autoOverlayConfig;
  autoOverlayTickRunning = !1;
  autoOverlayPendingTick = !1;
  autoOverlayNextTickAt;
  statusRefreshIntervalId;
  challengeWatcherObserver;
  challengeWatcherRunning = !1;
  imagesListDirty = !0;
  constructor(o) {
    super();
    this.bot = o;
    this.element.classList.add("wwidget"), this.element.innerHTML = yo, U(this.element), document.body.append(this.element), this.populateElementsWithSelector(this.element, {
      $wopenButton: ".wopen-button",
      $widgetLogo: ".widget-logo",
      $settings: ".wform",
      $status: ".wstatus",
      $openConfig: ".open-config",
      $topbar: ".wtopbar",
      $draw: ".draw",
      $drawAndPaint: ".draw-and-paint",
      $addImage: ".add-image",
      $captureTemplate: ".capture-template",
      $toggleOverlay: ".toggle-overlay",
      $autoOverlayConfig: ".autooverlay-config",
      $autoOverlayStart: ".autooverlay-start",
      $autoOverlayStop: ".autooverlay-stop",
      $autoOverlayStatus: ".autooverlay-status",
      $images: ".images",
      $imagesSection: ".widget-section-images"
    }), this.$widgetLogo.src = Ea, this.element.querySelector('.shark-canvas-logo').src = Ea, this.$wopenButton.replaceChildren(Object.assign(document.createElement('img'), { src: Ea, alt: '' })), this.$imagesSection.querySelector('.widget-section-summary').insertBefore(this.element.querySelector('.shark-check-updates'), this.element.querySelector('.shark-hide-canvas')), this.$imagesSection.querySelector('.widget-section-summary').insertBefore(this.element.querySelector('.shark-open-paint'), this.element.querySelector('.shark-hide-canvas')), this.$imagesSection.querySelector('.widget-section-summary').insertBefore(this.$openConfig, this.element.querySelector('.shark-hide-canvas')), this.$wopenButton.addEventListener("click", () => {
      if (this.updateRequired) {
        macrosharkShowUpdate(this.updateRequired);
        return;
      }
      this.open = !this.open;
      if (!this.open) this.positionLauncher();
    }), this.element.querySelector('.shark-check-updates').addEventListener('click', () => globalThis.macrosharkCheckUpdates?.()); this.$draw.addEventListener("click", () => {
      this.drawAndClickPaintWhenReady().catch(error => {
        this.status = error.message;
      });
    }), this.$drawAndPaint.addEventListener("click", () => {
      this.manualConfirmation = !this.manualConfirmation;
      this.syncPaintControls();
      localStorage.setItem("macroshark:manual-confirmation", String(this.manualConfirmation));
    }), this.element.querySelector('.shark-confirm').addEventListener('click', () => {
      this.manualConfirmation = !this.manualConfirmation;
      this.syncPaintControls();
      localStorage.setItem('macroshark:manual-confirmation', String(this.manualConfirmation));
    }), this.element.querySelector('.shark-speed').addEventListener('click', () => {
      this.paintSpeed = this.paintSpeed === 1 ? 2 : this.paintSpeed === 2 ? 4 : 1;
      localStorage.setItem('macroshark:paint-speed', String(this.paintSpeed));
      this.syncPaintControls();
      this.showNativeNotice(this.paintSpeed === 1 ? 'Velocidad x1: ritmo más prudente. Ninguna velocidad garantiza evitar controles o límites de WPlace.' : `Velocidad x${this.paintSpeed}: prepara píxeles más rápido, si WPlace lo permite.`);
    }), this.registerMobileFileInputs(), this.$openConfig.addEventListener("click", () => {
      this.openGuideModal();
    }), this.$captureTemplate.addEventListener("click", () => {
      this.captureTemplate();
    }), this.$toggleOverlay.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      this.toggleOverlay();
    }), this.$autoOverlayConfig.addEventListener("click", () => {
      this.openAutoOverlayModal();
    }), this.$autoOverlayStart.addEventListener("click", () => {
      if (this.autoOverlayIntervalId || this.autoOverlayTickRunning) this.stopAutoOverlay();else if (!this.drawActionRunning) this.startAutoOverlay();
    }), this.$autoOverlayStop.addEventListener("click", () => {
      this.stopAutoOverlay();
    }), this.installMobileQuickActions(), this.installFloatingPanels(), this.installSafetyControls(), this.installWorkspacePanels(), this.installReferencePreview(), this.element.querySelector('.shark-gallery-search').addEventListener('input', () => this.filterGallery()), this.element.querySelector('.shark-sync-wplace').addEventListener('click', event => this.syncNativeCanvas(event.currentTarget)), this.initializeImagesSection(), this.registerEvent(document, "keydown", this.handleKeyboard.bind(this), {
      passive: !1
    }), this.update(), this.syncOverlayVisibilityFromStorage(), this.loadAutoOverlayConfigFromStorage(), this.refreshAutoOverlayStatusText(), this.statusRefreshIntervalId = window.setInterval(() => {
      this.refreshAutoOverlayStatusText(), this.refreshProgress();
    }, 1000), this.runOnDestroy.push(() => clearInterval(this.statusRefreshIntervalId)), this.open = !1, console.log("[MACROSHARK][Widget] Widget mounted minimized");
  }
  addImage() {
    this.$addImage.scrollIntoView({
      block: 'center'
    });
    this.$addImage.focus();
  }
  installMobileQuickActions() {
    const title = this.element.querySelector('.title');
    title.append(this.$wopenButton);
    this.$launcher = document.createElement('div');
    this.$launcher.className = 'macroshark-launcher';
    document.body.append(this.$launcher);
    const grid = this.element.querySelector('.shark-mini-grid');
    this.$miniGrid = grid;
    this.$quickRail = document.createElement('div');
    this.$quickRail.className = 'macroshark-quick-rail';
    this.$quickRail.id='macroshark-quick-rail';
    this.quickActionsVisible=localStorage.getItem('macroshark:rail-expanded')!=='false';
    this.$railToggle=document.createElement('button');this.$railToggle.type='button';this.$railToggle.className='wopen-button shark-rail-toggle';
    this.$railToggle.setAttribute('aria-controls',this.$quickRail.id);
    this.$railToggle.append(Object.assign(document.createElement('img'),{src:Ea,alt:''}));
    this.$launcher.append(this.$railToggle);
    this.$railToggle.onclick=()=>{if(this.updateRequired){macrosharkShowUpdate(this.updateRequired);return;}this.quickActionsVisible=!this.quickActionsVisible;localStorage.setItem('macroshark:rail-expanded',String(this.quickActionsVisible));this.syncQuickPanel();};
    this.$quickRail.append(grid);
    document.body.append(this.$quickRail);
    const make = (source, label, extraClass) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'shark-mini-action ' + extraClass;
      button.title = label;
      button.setAttribute('aria-label', label);
      button.append(source.querySelector('i').cloneNode(true));
      button.addEventListener('click', () => source.click());
      grid.append(button);
      return button;
    };
    this.$quickDraw = make(this.$draw, 'Dibujar', 'shark-mini-draw');
    this.$quickAuto = make(this.$autoOverlayStart, 'Iniciar AutoDraw', 'shark-mini-auto');
    this.$quickCanvas = document.createElement('button');
    this.$quickCanvas.type = 'button';
    this.$quickCanvas.className = 'shark-mini-action shark-mini-canvas';
    this.$quickCanvas.innerHTML = '<i class="fa-solid fa-images" aria-hidden="true"></i>';
    this.$quickCanvas.addEventListener('click', () => {
      this.open = !this.open;
    });
    grid.prepend(this.$quickCanvas);
    this.$quickCapture=make(this.$captureTemplate,'Captura','shark-mini-capture');
    this.$quickCanvas.after(this.$quickCapture);
    this.element.querySelector('.shark-open-canvas').addEventListener('click', () => {
      this.open = !this.open;
    });
    this.element.querySelector('.shark-hide-canvas').addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      this.open = false;
    });
    this.canvasVisible = false;
    this.syncCanvasPanel();
    this.syncQuickPanel();
    this.positionLauncher();
    window.addEventListener('resize', () => this.positionLauncher());
    const positionTimer = window.setInterval(() => this.positionLauncher(), 1000);
    this.runOnDestroy.push(() => clearInterval(positionTimer));
  }
  syncCanvasPanel() {
    this.element.classList.toggle('shark-canvas-hidden', !this.canvasVisible);
    const dockButton = this.element.querySelector('.shark-open-canvas');
    dockButton.classList.toggle('shark-running', this.canvasVisible);
    dockButton.setAttribute('aria-pressed', String(this.canvasVisible));
    dockButton.querySelector('span').textContent = this.canvasVisible ? 'Ocultar canvas' : 'Canvas';
    this.$quickCanvas?.classList.toggle('shark-running', this.canvasVisible);
    if (this.$quickCanvas) {
      const label = this.canvasVisible ? 'Ocultar canvas' : 'Mostrar canvas';
      this.$quickCanvas.title = label;
      this.$quickCanvas.setAttribute('aria-label', label);
      this.$quickCanvas.setAttribute('aria-expanded', String(this.canvasVisible));
    }
    if (this.canvasVisible) requestAnimationFrame(() => {this.placeFloatingCanvas();this.galleryThumbnailState?.schedule();});
  }
  installFloatingPanels() {
    const main = this.element;
    const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max));
    const drag = (panel, handle) => {
      let start = null;
      let dragged = false;
      handle.addEventListener('pointerdown', event => {
        if (event.button !== 0 || event.target.closest('button, a, input, select, label')) return;
        const rect = panel.getBoundingClientRect();
        start = { id: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
        dragged = false;
        panel.classList.add('shark-dragging');
        handle.setPointerCapture?.(event.pointerId);
        event.preventDefault();
      });
      handle.addEventListener('pointermove', event => {
        if (!start || event.pointerId !== start.id) return;
        if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 4) dragged = true;
        const left = clamp(start.left + event.clientX - start.x, 8, innerWidth - panel.offsetWidth - 8);
        const top = clamp(start.top + event.clientY - start.y, 8, innerHeight - panel.offsetHeight - 8);
        panel.style.left = left + 'px';
        panel.style.top = top + 'px';
      });
      const finish = event => {
        if (!start || event.pointerId !== start.id) return;
        start = null;
        panel.classList.remove('shark-dragging');
        const rect = panel.getBoundingClientRect();
        if (panel === main && !this.open) {
          panel.style.left = '';
          panel.style.right = '8px';
          panel.style.top = clamp(rect.top, 8, innerHeight - rect.height - 8) + 'px';
          return;
        }
        const left = rect.left + rect.width / 2 < innerWidth / 2 ? 8 : Math.max(8, innerWidth - rect.width - 8);
        panel.style.left = left + 'px';
        panel.style.top = clamp(rect.top, 8, innerHeight - rect.height - 8) + 'px';
      };
      handle.addEventListener('pointerup', finish);
      handle.addEventListener('pointercancel', finish);
      handle.addEventListener('click', event => {
        if (!dragged) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        dragged = false;
      }, true);
    };
    drag(main, main.querySelector('.title'));
    window.addEventListener('resize', () => {
      for (const panel of [main]) {
        if (panel === main && !this.open) {
          panel.style.left = '';
          panel.style.right = '8px';
        }
        if (panel.style.left) panel.style.left = clamp(parseFloat(panel.style.left), 8, innerWidth - panel.offsetWidth - 8) + 'px';
        if (panel.style.top) panel.style.top = clamp(parseFloat(panel.style.top), 8, innerHeight - panel.offsetHeight - 8) + 'px';
      }
    });
  }
  placeFloatingCanvas() {
    if (!this.canvasVisible) return;
    const canvas = this.$imagesSection;
    canvas.style.removeProperty('left');
    canvas.style.removeProperty('top');
    canvas.style.removeProperty('right');
  }
  syncQuickPanel() {
    if(!this.$miniGrid)return;
    const expanded=this.quickActionsVisible!==false;
    this.$quickRail.hidden=!expanded;this.$launcher.hidden=false;
    this.$railToggle?.setAttribute('aria-expanded',String(expanded));
    this.$railToggle?.setAttribute('aria-pressed',String(expanded));
    this.$railToggle?.classList.toggle('shark-running',expanded);
    if(this.$railToggle){const label=this.updateRequired?'Actualizar MacroShark':expanded?'Ocultar controles de MacroShark':'Mostrar controles de MacroShark';this.$railToggle.title=label;this.$railToggle.setAttribute('aria-label',label);}
    this.positionLauncher();this.syncActionButtons();
  }
  requireUpdate(version) {
    this.updateRequired = version;
    this.stopAutoOverlay();
    this.bot.cancelDrawing = true;
    this.open = false;
    this.$draw.disabled = true;
    this.$autoOverlayStart.disabled = true;
    this.$quickDraw.disabled = true;
    this.$quickAuto.disabled = true;
    this.$wopenButton.replaceChildren(Object.assign(document.createElement('span'), { className: 'shark-update-symbol', textContent: '↻' }));
    this.$wopenButton.setAttribute('aria-label', 'Actualizar MacroShark');
    this.$wopenButton.title = 'Actualizar MacroShark';
    this.$railToggle?.replaceChildren(Object.assign(document.createElement('span'), { className: 'shark-update-symbol', textContent: '↻' }));
    this.$launcher?.classList.add('shark-update-required');
    this.syncQuickPanel();
  }
  positionLauncher() {
    if (!this.$launcher) return;
    const button = this.findNativePaintButton();
    const rect = button?.getBoundingClientRect();
    const nearBottom = rect && rect.width > 0 && rect.height > 0 && rect.top > innerHeight * 0.4 && rect.bottom > innerHeight * 0.65;
    let dockTop = nearBottom ? rect.top : innerHeight;
    if (nearBottom && this.bot.isPaletteOpen()) for (let parent = button.parentElement, depth = 0; parent && depth < 6; parent = parent.parentElement, depth++) {
      const bounds = parent.getBoundingClientRect();
      if (bounds.width > innerWidth * 0.55 && bounds.height > 90 && bounds.height < innerHeight * 0.55 && bounds.bottom > innerHeight - 80) {
        dockTop = Math.min(dockTop, bounds.top);
      }
    }
    this.element.style.setProperty('--shark-dock-bottom', Math.max(12, innerHeight - dockTop + 8) + 'px');
    this.$launcher.classList.remove('shark-in-paint-bar');
    this.positionQuickActions(dockTop);
  }
  positionQuickActions(dockTop) {
      if(!this.$quickRail)return;
      // WPlace's fixed top-right control group, never map features or popups.
      const roots=[...document.querySelectorAll('.top-safe-2.right-safe-2, [data-wplace-controls="top-right"]')];
      const buttons=roots.flatMap(root=>[...root.querySelectorAll('button.btn,button[data-native-control]')]).filter(node=>!node.closest('.maplibregl-canvas-container,.maplibregl-marker,.maplibregl-popup,.wwidget,.macroshark-quick-rail,.macroshark-launcher,dialog'));
      const native=buttons.map(node=>({node,rect:node.getBoundingClientRect()})).filter(({node,rect:r})=>getComputedStyle(node).visibility!=='hidden'&&r.width>=28&&r.width<=80&&r.height>=28&&r.height<=80&&r.right>innerWidth-100&&r.bottom<dockTop-8).sort((a,b)=>a.rect.bottom-b.rect.bottom);
      const rail=native.at(-1)?.rect;
      const size=Math.max(36,Math.min(52,rail?.width||(innerWidth<=620?44:40)));
      const height=this.quickActionsVisible===false?size:size*5+32;
      let x=rail?rail.left+(rail.width-size)/2:innerWidth-size-8;
      let top=rail?rail.bottom+10:Math.min(innerHeight*.28,180);
      if(top+height>dockTop-8){x-=size+12;top=Math.max(8,Math.min(rail?.top??top,dockTop-height-8));}
      x=Math.max(8,Math.min(x,innerWidth-size-8));top=Math.max(8,Math.min(top,innerHeight-height-8));
      this.$quickRail.style.setProperty('--shark-quick-size',size+'px');
      this.$quickRail.style.left=x-4+'px';this.$quickRail.style.top=top+size+8+'px';
      this.$launcher.style.setProperty('--shark-quick-size',size+'px');
      this.$launcher.style.left=x+'px';this.$launcher.style.top=top+'px';
    }
  registerMobileFileInputs() {
    const input = this.$addImage;
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file || this.mobileImportBusy) return;
      this.mobileImportBusy = true;
      input.disabled = true;
      this.importMobileImage(file).catch(error => {
        console.error('[MacroShark Plus]', error);
        this.status = 'No se pudo importar: ' + (error?.message ?? 'error de lectura');
      }).finally(() => {
        this.mobileImportBusy = false;
        input.disabled = false;
        input.value = '';
      });
    });
  }
  async waitForMobileReady() {
    if (this.bot.mobileReady) return;
    if (!this.bot.mobileInitialization) throw new Error('El mapa todavía no está listo. Recarga WPlace.');
    let timer;
    try {
      await Promise.race([this.bot.mobileInitialization, new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('El mapa no terminó de cargar. Inicia sesión en WPlace y vuelve a intentarlo.')), 15000);
      })]);
    } finally {
      clearTimeout(timer);
    }
    if (this.bot.mobileInitializationError) throw this.bot.mobileInitializationError;
  }
  async syncNativeCanvas(button){
  if(button.disabled||this.loadingGalleryImage)return;button.disabled=true;
  try{
    await this.waitForMobileReady();
    const records=await macrosharkReadNativeOverlays(new Map(this.bot.images.filter(i=>i.nativeOverlayId).map(i=>[i.nativeOverlayId,i.nativeOverlayRevision])));
    let added=0,updated=0;
    for(const record of records){
      const old=this.bot.images.find(i=>i.nativeOverlayId===record.id);if(record.unchanged)continue;
      const template=macrosharkParseWplace(JSON.stringify(record));
      const p=template.position||{x:0,y:0};
      const raw={...(old?.toJSON()||{}),pixels:{url:template.url,width:template.displayWidth,height:Math.round(template.displayWidth*template.height/template.width)},position:[p.x,p.y],displayName:record.name||old?.displayName||'Canvas de WPlace',nativeOverlayId:record.id,nativeOverlayRevision:Number(record.updatedAt)||0,nativeImageSignature:record.sourceSignature||'',opacity:old?.opacity??template.opacity,lock:old?.lock??template.locked,paintSelected:!!old?.paintSelected};
      if(old&&old.nativeImageSignature===raw.nativeImageSignature){raw.pixels=old.toJSON().pixels;raw.galleryPreview=old.toJSON().galleryPreview;}else delete raw.galleryPreview;
      const next=new SharkDeferredImage(this.bot,raw);
      if(old){const at=this.bot.images.indexOf(old);old.destroy();this.bot.images.splice(at,0,next);if(this.selectedGalleryImage===old)this.selectedGalleryImage=null;updated++;}else{this.bot.images.push(next);added++;}
    }
    H(this.bot,true);this.renderImagesList();
    this.showNativeNotice(records.length?'Canvas actualizados: '+added+' nuevos y '+updated+' modificados. Toca una imagen para cargarla.':'WPlace no tiene Canvas locales importados en este navegador.');
  }catch(error){this.showNativeNotice('No se pudieron actualizar los Canvas: '+error.message);}finally{button.disabled=false;}
}
  importMobileImage(file) {
    return console.log("[MACROSHARK][Widget] Add image flow started"), this.setDisabled("add-image", !0), this.run(f("taskAddingImage"), async () => {
      try {
        const l = file;
        if (!l) return;
        await this.waitForMobileReady();
        await this.bot.updateColors();
        console.log("[MACROSHARK][Widget] File selected", {
          name: l.name,
          size: l.size,
          type: l.type
        });
        let i;
        if (l.name.toLowerCase().endsWith(".wplace")) {
          const template = macrosharkParseWplace(await l.text());
          const image = new Image();
          image.src = template.url;
          await Z(image, ['load'], ['error']);
          if (image.naturalWidth !== template.width || image.naturalHeight !== template.height) throw Error('La imagen .wplace no coincide con sus dimensiones guardadas.');
          let position;
          if (template.position) position = new SharkMapPosition(this.bot, template.position.x, template.position.y);
          else {
            await this.waitForStableViewportProjection();
            position = SharkMapPosition.fromScreenPosition(this.bot, this.defaultImageScreenPosition());
          }
          i = new SharkImage(this.bot, position, new SharkPixelData(this.bot, sharkSourceCanvas(image, template.displayWidth)), undefined, template.opacity, false, false, true, [], template.locked);
          image.src = '';
        } else {
          let s = new FileReader();
          s.readAsDataURL(l), await Z(s, ["load"], ["error"]);
          let g = new Image();
          g.src = s.result;
          await Z(g, ['load'], ['error']);
          const optimized = await this.optimizeImportedImage(g);
          g.src = '';
          await this.waitForStableViewportProjection();
          i = new SharkImage(this.bot, SharkMapPosition.fromScreenPosition(this.bot, this.defaultImageScreenPosition()), new SharkPixelData(this.bot, optimized));
        }
        if (!i.displayName) i.displayName = l.name.replace(/\.(?:wplace|png|jpe?g|webp|gif)$/i, '') || l.name;
        this.bot.images.push(i);
        console.log("[MACROSHARK][Widget] Image instance added", {
          images: this.bot.images.length
        }), await this.bot.readMap(), this.bot.updateTasks(), H(this.bot, !0), this.update();
      } catch (a) {
        throw a;
      }
    }, () => {
      this.setDisabled("add-image", !1);
    });
  }
  captureTemplate() {
      this.$captureClose?.();
      this.open=false;
      this.guideDialog?.close();
      for(const dialog of document.querySelectorAll('.macroshark-modal[open]'))dialog.close();
      if(this.autoOverlayIntervalId)this.stopAutoOverlay();
      if(this.drawActionRunning)this.bot.cancelDrawing=true;
      const panel=document.createElement('section');
      panel.className='macroshark-capture-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Capturar imagen');
      panel.innerHTML='<header><strong>Capturar imagen</strong><button type="button" class="capture-close" aria-label="Cerrar captura">×</button></header><div class="capture-body"><p>Elige A y B. Puedes mover o acercar el mapa; un toque sin arrastrar selecciona el píxel.</p><div class="capture-points"><button type="button" class="capture-point-a">Punto A: elegir en el mapa</button><button type="button" class="capture-point-b">Punto B: elegir en el mapa</button></div><div class="shark-capture-coordinates"><input class="capture-coordinate-a" aria-label="Coordenadas A de captura" placeholder="0, 0, 0, 0" spellcheck="false"><input class="capture-coordinate-b" aria-label="Coordenadas B de captura" placeholder="0, 0, 0, 0" spellcheck="false"></div><div class="capture-preview"><span>Selecciona A y B para ver la zona completa.</span></div><p class="capture-status" role="status" aria-live="polite"></p><div class="capture-save-actions"><button type="button" class="capture-download" disabled>Descargar PNG</button><button type="button" class="capture-photos" hidden disabled>Abrir para Fotos</button></div></div>';
      document.body.append(panel);this.$capturePanel=panel;
      const state={a:null,b:null,blob:null,url:null,generation:0,busy:false,width:0,height:0,photoView:null};
      const preview=panel.querySelector('.capture-preview'),status=panel.querySelector('.capture-status'),download=panel.querySelector('.capture-download');
      const photos=panel.querySelector('.capture-photos');
      const mobile=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)||navigator.userAgentData?.mobile===true;
      if(mobile){photos.hidden=false;download.textContent='Guardar en Archivos';}
      const points={a:panel.querySelector('.capture-point-a'),b:panel.querySelector('.capture-point-b')};
      let clearPicker=()=>{};
      const fitPreview=()=>{
        if(!state.width||!state.height||panel.hidden)return;
        const parent=preview.parentElement;
        const style=getComputedStyle(parent);
        const available=Math.max(1,parent.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)-2);
        const maxHeight=Math.max(80,Math.min(460,innerHeight*.44));
        const width=Math.min(available,maxHeight*state.width/state.height);
        preview.style.width=width+'px';preview.style.height=width*state.height/state.width+'px';
      };
      const close=()=>{
        state.generation++;clearPicker();
        state.photoView?.remove();state.photoView=null;
        if(state.url)URL.revokeObjectURL(state.url);
        window.removeEventListener('resize',fitPreview);
        panel.remove();
        if(this.$capturePanel===panel)this.$capturePanel=null;
        if(this.$captureClose===close)this.$captureClose=null;
      };
      this.$captureClose=close;panel.querySelector('.capture-close').onclick=close;
      window.addEventListener('resize',fitPreview);
      const renderPreview=async()=>{
        const generation=++state.generation;
        if(state.url)URL.revokeObjectURL(state.url);
        state.url=null;state.blob=null;download.disabled=true;photos.disabled=true;
        if(!state.a||!state.b)return;
        const bounds={minGlobalX:Math.min(state.a.x,state.b.x),minGlobalY:Math.min(state.a.y,state.b.y),maxGlobalX:Math.max(state.a.x,state.b.x),maxGlobalY:Math.max(state.a.y,state.b.y)};
        state.width=bounds.maxGlobalX-bounds.minGlobalX+1;state.height=bounds.maxGlobalY-bounds.minGlobalY+1;
        if(state.width>8192||state.height>8192||state.width*state.height>4194304){status.textContent='La zona supera 4 millones de píxeles. Elige un área menor.';preview.replaceChildren();return;}
        fitPreview();preview.replaceChildren();status.textContent='Cargando la zona seleccionada…';
        const active=()=>generation===state.generation&&panel.isConnected;
        try {
          const canvas=await this.buildCaptureCanvas(bounds,(done,total)=>{if(active())status.textContent='Cargando mapa: '+done+'/'+total;},active);
          if(!active())return;
          const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('No se pudo crear la imagen.')),'image/png'));
          if(!active())return;
          state.blob=blob;state.url=URL.createObjectURL(blob);
          const image=document.createElement('img');image.alt='Área completa: '+state.width+' × '+state.height+' píxeles';image.width=state.width;image.height=state.height;image.src=state.url;
          preview.replaceChildren(image);fitPreview();canvas.width=canvas.height=0;
          status.textContent=state.width+' × '+state.height+' píxeles listos para descargar.';download.disabled=false;photos.disabled=false;
        } catch(error){if(active())status.textContent='No se pudo crear la vista previa: '+error.message;}
      };
      const choosePoint=which=>{
        clearPicker();panel.hidden=true;
        const picker=document.createElement('div');picker.className='macroshark-capture-picker';
        picker.innerHTML='<span>Mueve el mapa y toca el píxel del punto '+which.toUpperCase()+' <button type="button">Cancelar</button></span>';
        document.body.append(picker);this.$capturePicker=picker;
        const activePointers=new Set();let gesture=null,tap=null;
        const isMap=target=>!!target?.closest?.('.maplibregl-canvas');
        const restore=()=>{clearPicker();panel.hidden=false;fitPreview();};
        const down=event=>{
          if(!isMap(event.target))return;
          activePointers.add(event.pointerId);tap=null;
          if(activePointers.size>1){if(gesture)gesture.moved=true;return;}
          gesture={id:event.pointerId,x:event.clientX,y:event.clientY,started:performance.now(),moved:false};
        };
        const move=event=>{if(gesture?.id===event.pointerId&&Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)>8)gesture.moved=true;};
        const up=event=>{
          activePointers.delete(event.pointerId);
          if(gesture?.id!==event.pointerId)return;
          if(!gesture.moved&&activePointers.size===0&&performance.now()-gesture.started<800)tap={x:event.clientX,y:event.clientY,time:performance.now()};
          else tap=null;
          gesture=null;
        };
        const cancel=event=>{activePointers.delete(event.pointerId);gesture=null;tap=null;};
        const click=async event=>{
          if(!isMap(event.target)||!tap||performance.now()-tap.time>1000)return;
          event.preventDefault();event.stopImmediatePropagation();
          const selected=tap;tap=null;
          try {
            await new Promise(resolve=>requestAnimationFrame(resolve));
            if(!panel.isConnected)return;
            this.bot.updateStars();
            const p=this.bot.getMapProjection();
            const point=p&&Number.isFinite(p.scale)&&p.scale>0?new SharkMapPosition(this.bot,Math.floor(p.worldX+(selected.x-p.screenX)/p.scale),Math.floor(p.worldY+(selected.y-p.screenY)/p.scale)):SharkMapPosition.fromScreenPosition(this.bot,selected);
            if(!Number.isFinite(point.globalX)||!Number.isFinite(point.globalY))throw new Error('No se pudo leer ese píxel.');
            state[which]={x:point.globalX,y:point.globalY};
            panel.querySelector('.capture-coordinate-'+which).value=macrosharkFormatCoordinates(point);
            restore();void renderPreview();
          } catch(error){restore();status.textContent=error.message;}
        };
        const key=event=>{if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();restore();}};
        const events=[['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',cancel],['click',click],['keydown',key]];
        clearPicker=()=>{
          for(const [name,listener] of events)window.removeEventListener(name,listener,true);
          picker.remove();if(this.$capturePicker===picker)this.$capturePicker=null;
          clearPicker=()=>{};
        };
        for(const [name,listener] of events)window.addEventListener(name,listener,{capture:true,passive:name!=='click'&&name!=='keydown'});
        picker.querySelector('button').onclick=restore;
      };
      points.a.onclick=()=>choosePoint('a');points.b.onclick=()=>choosePoint('b');
      for(const which of ['a','b']){
        const input=panel.querySelector('.capture-coordinate-'+which);
        input.addEventListener('input',()=>input.setCustomValidity(''));
        input.addEventListener('change',()=>{
          try{state[which]=macrosharkParseCoordinates(input.value);input.value=macrosharkFormatCoordinates(state[which]);void renderPreview();}
          catch(error){input.setCustomValidity(error.message);input.reportValidity();}
        });
        input.addEventListener('keydown',event=>{event.stopPropagation();if(event.key==='Enter'){event.preventDefault();input.dispatchEvent(new Event('change'));}});
      }
      download.onclick=()=>{
        if(!state.blob||!state.url||state.busy)return;
        state.busy=true;download.disabled=true;
        try {
          const name='wplace-capture-'+Date.now()+'.png';
          // A separate URL survives closing the preview while Safari starts saving.
          const url=URL.createObjectURL(state.blob),link=document.createElement('a');
          link.href=url;link.download=name;document.body.append(link);
          try{link.click();}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
          status.textContent=mobile?'Descarga solicitada. Búscala en Archivos > Descargas.':'Descarga solicitada. Revisa las descargas del navegador.';
        } catch(error){status.textContent='No se pudo iniciar la descarga: '+error.message;}
        finally{state.busy=false;download.disabled=!state.url;}
      };
      photos.onclick=async()=>{
        if(!state.blob||!state.url||state.busy)return;
        const generation=state.generation;
        photos.disabled=true;
        try {
          const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('No se pudo abrir la imagen.'));reader.readAsDataURL(state.blob);});
          if(!panel.isConnected||generation!==state.generation)return;
          state.photoView?.remove();
          const view=document.createElement('section');view.className='macroshark-photo-save';view.setAttribute('role','dialog');view.setAttribute('aria-label','Guardar en Fotos');
          view.innerHTML='<header><strong>Guardar en Fotos</strong><button type="button" class="photo-save-back">Volver</button></header><p>Mantén pulsada la imagen y elige Guardar en Fotos o Guardar imagen en el menú del teléfono. Para guardarla como archivo, vuelve y pulsa Guardar en Archivos.</p>';
          const image=document.createElement('img');image.src=data;image.alt='Captura completa para guardar en Fotos';image.width=state.width;image.height=state.height;
          view.append(image);document.body.append(view);state.photoView=view;panel.hidden=true;
          const back=()=>{view.remove();if(state.photoView===view)state.photoView=null;if(panel.isConnected){panel.hidden=false;fitPreview();}};
          view.querySelector('button').onclick=back;
        } catch(error){if(panel.isConnected)status.textContent=error.message;}
        finally{photos.disabled=!state.blob;}
      };
    }
  async buildCaptureCanvas(bounds, onProgress, isActive = () => true) {
    const { minGlobalX: minX, minGlobalY: minY, maxGlobalX: maxX, maxGlobalY: maxY } = bounds;
    const canvas = document.createElement('canvas');
    canvas.width = maxX - minX + 1;
    canvas.height = maxY - minY + 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw Error('No hay contexto de imagen disponible.');
    ctx.imageSmoothingEnabled = false;
    const firstX = Math.floor(minX / k), firstY = Math.floor(minY / k);
    const lastX = Math.floor(maxX / k), lastY = Math.floor(maxY / k);
    const total = (lastX - firstX + 1) * (lastY - firstY + 1);
    let done = 0;
    for (let tileX = firstX; tileX <= lastX; tileX++) for (let tileY = firstY; tileY <= lastY; tileY++) {
      if (!isActive()) throw Error('Captura cancelada.');
      const tile = await this.loadTileImage(tileX, tileY);
      if (!isActive()) throw Error('Captura cancelada.');
      const tileLeft = tileX * k, tileTop = tileY * k;
      const fromX = Math.max(minX, tileLeft), toX = Math.min(maxX, tileLeft + k - 1);
      const fromY = Math.max(minY, tileTop), toY = Math.min(maxY, tileTop + k - 1);
      const width = toX - fromX + 1, height = toY - fromY + 1;
      ctx.drawImage(tile, fromX - tileLeft, fromY - tileTop, width, height, fromX - minX, fromY - minY, width, height);
      onProgress?.(++done, total);
    }
    return canvas;
  }
  async downloadCapture(o, a, l) {
    let i = a === "webp" ? "image/webp" : "image/png",
      r = await new Promise((g, p) => {
        o.toBlob(d => {
          if (!d) {
            p(Error(`Failed to create ${a.toUpperCase()} capture file`));
            return;
          }
          g(d);
        }, i);
      }),
      s = URL.createObjectURL(r),
      c = document.createElement("a");
    c.href = s, c.download = `wplace-capture-${l}.${a}`, c.click(), URL.revokeObjectURL(s);
  }
  async loadTileImage(o, a) {
    let l;
    for (let i = 1; i <= 3; i++) try {
      let r = new Image();
      return r.crossOrigin = "anonymous", r.referrerPolicy = "no-referrer", r.src = `https://backend.wplace.live/files/s0/tiles/${o}/${a}.png?ts=${Date.now()}-${i}`, await Z(r, ["load"], ["error"]), r;
    } catch (r) {
      if (l = r, i < 3) await new Promise(s => setTimeout(s, i * 200));
    }
    throw l instanceof Error ? l : Error(`Tile fetch failed (${o}/${a})`);
  }
  async resolveCaptureBounds() {
    return this.selectCaptureBounds();
  }
  selectCaptureBounds() {
    return new Promise((o, a) => {
      let l = document.createElement("div");
      l.className = "macroshark-capture-overlay", l.innerHTML = `<div class="macroshark-capture-hint">${f("captureHintSelectArea")}: A → B</div><div class="macroshark-capture-box"></div>`;
      let i = l.querySelector(".macroshark-capture-box");
      document.body.append(l);
      let r,
        s,
        c = () => {
          window.removeEventListener("keydown", w, !0), l.removeEventListener("pointermove", d), l.removeEventListener("pointerdown", t), l.remove();
        },
        g = n => {
          let b = Math.min(r.x, n.x),
            h = Math.min(r.y, n.y),
            e = Math.abs(r.x - n.x) + 1,
            u = Math.abs(r.y - n.y) + 1;
          return {
            left: b,
            top: h,
            width: e,
            height: u
          };
        },
        p = n => {
          let {
            left: b,
            top: h,
            width: e,
            height: u
          } = g(n);
          i.style.left = `${b}px`, i.style.top = `${h}px`, i.style.width = `${e}px`, i.style.height = `${u}px`;
        },
        d = n => {
          if (!r) return;
          p({
            x: n.clientX,
            y: n.clientY
          });
        },
        t = n => {
          if (n.preventDefault(), !r) {
            r = {
              x: n.clientX,
              y: n.clientY
            };
            let M = SharkMapPosition.fromScreenPosition(this.bot, r);
            s = {
              x: M.globalX,
              y: M.globalY
            }, p(r);
            return;
          }
          let b = {
              x: n.clientX,
              y: n.clientY
            },
            h = SharkMapPosition.fromScreenPosition(this.bot, b);
          if (c(), !s) {
            a(Error("Capture anchor point unavailable"));
            return;
          }
          let e = Math.min(s.x, h.globalX),
            u = Math.min(s.y, h.globalY),
            m = Math.max(s.x, h.globalX),
            z = Math.max(s.y, h.globalY);
          if (m - e < 1 || z - u < 1) {
            a(Error("Capture area too small"));
            return;
          }
          o({
            minGlobalX: e,
            minGlobalY: u,
            maxGlobalX: m,
            maxGlobalY: z
          });
        },
        w = n => {
          if (n.key !== "Escape") return;
          c(), a(Error("Capture cancelled"));
        };
      window.addEventListener("keydown", w, !0), l.addEventListener("pointermove", d), l.addEventListener("pointerdown", t);
    });
  }
  defaultImageScreenPosition() {
    let o = Math.round(this.element.getBoundingClientRect().width);
    return {
      x: Math.max(256, o),
      y: 32
    };
  }
  async waitForStableViewportProjection() {
    let o = this.defaultImageScreenPosition(),
      a = 0,
      l;
    for (let i = 0; i < 45; i++) {
      await new Promise(d => requestAnimationFrame(() => {
        d();
      }));
      let {
        anchorScreenPosition: {
          x: r,
          y: s
        },
        pixelSize: c
      } = this.bot.findAnchorsForScreen(o);
      if (!Number.isFinite(c) || c <= 0) {
        a = 0;
        continue;
      }
      let g = {
        anchorX: r,
        anchorY: s,
        pixelSize: c
      };
      if (!l) {
        l = g, a = 1;
        continue;
      }
      if (Math.abs(g.anchorX - l.anchorX) + Math.abs(g.anchorY - l.anchorY) + Math.abs(g.pixelSize - l.pixelSize) < 0.0012) a++;else a = 0;
      if (l = g, a >= 3) return;
    }
  }
  update() {
    this.refreshProgress();
    this.renderImagesList();
    this.imagesListDirty = false;
  }
  async enableAvailableImageColors(image, button) {
    button.disabled = true;
    try {
      await this.bot.updateColors();
      await this.bot.readMap();
      image.skipUnavailableColors = true;
      for (const color of image.colors) color.disabled = this.bot.unavailableColors.has(color.realColor);
      image.updateTasks();
      image.updateColors();
      image.update();
      H(this.bot, true);
      this.update();
      this.status = 'Colores disponibles activados; colores bloqueados desactivados para esta imagen.';
    } catch (error) {
      this.status = 'No se pudieron consultar los colores: ' + (error?.message ?? error);
    } finally {
      button.disabled = false;
    }
  }
  loadGalleryImage(image,detail=true){return macrosharkLoadGalleryImage(this,image,detail);}
  getPaintImage() {
    return this.bot.images.find(image => image.paintSelected) || null;
  }
  showPaintSelectionPrompt() {
    this.selectedGalleryImage = null;
    this.open = true;
    this.renderImagesList();
    this.showNativeNotice('Selecciona una imagen en Canvas para empezar a pintar.');
  }
  selectPaintImage(image, rerender = true) {
    if (!this.bot.images.includes(image)) return;
    if(image.isDeferred){void this.loadGalleryImage(image,rerender);return;}
    if (this.autoOverlayTickRunning && this.getPaintImage() !== image) { this.showNativeNotice('Detén AutoDraw antes de cambiar de imagen.'); return; }
    if (this.autoOverlayIntervalId && this.getPaintImage() !== image) this.stopAutoOverlay();
    for (const entry of this.bot.images) entry.paintSelected = entry === image;
    this.activeImageIndex = this.bot.images.indexOf(image);
    this.paintSpeed = image.paintSpeed || 1;
    this.manualConfirmation = image.confirmPaint === false;
    this.autoOverlayConfig = image.autoDrawConfig || null;
    this.refreshAutoOverlayStatusText();
    this.syncPaintControls();
    H(this.bot, true);
    if (rerender) this.renderImagesList();
  }
  renderImagesList() {
    this.bot.referenceSignature = null;
    this.bot.scheduleReferencePreview?.();
    if (this.inlineAutoImage && this.inlineAutoImage !== this.selectedGalleryImage) this.inlineAutoImage = null;
    this.$images.innerHTML = "";
    this.imageProgressRows = new Map();
    if (this.selectedGalleryImage && !this.bot.images.includes(this.selectedGalleryImage)) this.selectedGalleryImage = null;
    this.$images.classList.toggle('shark-detail-mode', !!this.selectedGalleryImage);
    this.$imagesSection.querySelector('.shark-gallery-count').textContent = `${this.bot.images.length} locales`;
    let o = document.createDocumentFragment();
    for (let a = 0; a < this.bot.images.length; a++) {
      const deferred=this.bot.images[a];
      if(deferred.isDeferred){macrosharkRenderDeferredCard(this,deferred,a,o);continue;}
      let l = this.bot.images[a],
        i = document.createElement("div");
      o.append(i), i.className = "image shark-gallery-card", i.innerHTML = `<button class="shark-detail-back" type="button" aria-label="Volver a canvas">← Volver</button><div class="shark-image-actions"><button class="shark-image-select" type="button"></button><button class="shark-image-speed" type="button"><i class="fa-solid fa-gauge-high" aria-hidden="true"></i><span></span></button><button class="shark-image-confirm" type="button"><i class="fa-solid fa-check" aria-hidden="true"></i><span></span></button><button class="shark-image-autodraw" type="button"><i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i><span>Configurar AutoDraw</span></button></div><button class="preview" title="Seleccionar esta plantilla para pintar">
  <img src="${l.pixels.image.src}" alt="Image preview">
</button>
  <div class="shark-card-heading"><strong class="shark-card-name"></strong><input class="shark-card-name-input" type="text" maxlength="80" aria-label="Nuevo nombre de la plantilla" hidden><button class="shark-card-rename" type="button" title="Cambiar nombre" aria-label="Cambiar nombre de la plantilla"><i class="fa-solid fa-pen-nib" aria-hidden="true"></i></button><span class="shark-card-size"></span></div>
  <div class="image-progress"><div class="shark-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-label="Progreso de imagen"><span class="shark-progress-done"></span><span class="shark-progress-remaining"></span></div><span class="image-progress-label"></span></div>
  <div class="shark-image-settings"><label>Modo de pintado<select class="shark-card-strategy" aria-label="Modo de pintado de esta plantilla"></select></label><label>Opacidad <output class="shark-card-opacity-value"></output><input class="shark-card-opacity" type="range" min="0" max="100" aria-label="Opacidad de esta plantilla"></label><label><input class="shark-card-colors-order" type="checkbox"> Dibujar colores en orden</label><label><input class="shark-card-transparent" type="checkbox"> Pintar píxeles transparentes</label><label><input class="shark-card-available" type="checkbox"> Solo colores disponibles</label></div>
  <div class="image-controls">
    <button class="focus-map" title="Go to image position"><i class="fa-solid fa-location-crosshairs" aria-hidden="true"></i></button>
    <button class="colors" title="Show colors"><i class="fa-solid fa-palette" aria-hidden="true"></i></button>
    <button class="strategy-modal" title="Strategy modal"><i class="fa-solid fa-sliders" aria-hidden="true"></i></button>
    <button class="available-colors" title="Activar solo colores disponibles en mi cuenta" aria-label="Activar solo colores disponibles en mi cuenta"><i class="fa-solid fa-circle-check" aria-hidden="true"></i></button>
    <button class="download" title="Download settings"><i class="fa-solid fa-download" aria-hidden="true"></i></button>
    <button class="delete" title="Delete image"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
  </div>`;
      i.querySelector('.shark-card-name').textContent = l.displayName || `Plantilla ${a + 1}`;
      i.querySelector('.shark-card-size').textContent = `${l.pixels.width} × ${l.pixels.height}`;
      i.classList.toggle('shark-paint-target', !!l.paintSelected);
      const select = i.querySelector('.shark-image-select');
      select.textContent = l.paintSelected ? '✓ Imagen seleccionada' : 'Seleccionar para pintar';
      select.setAttribute('aria-pressed', String(!!l.paintSelected));
      select.addEventListener('click', () => this.selectPaintImage(l));
      const speed = i.querySelector('.shark-image-speed');
      speed.querySelector('span').textContent = `Velocidad · x${l.paintSpeed || 1}`;
      speed.addEventListener('click', () => {
        l.paintSpeed = l.paintSpeed === 1 ? 2 : l.paintSpeed === 2 ? 4 : 1;
        speed.querySelector('span').textContent = `Velocidad · x${l.paintSpeed}`;
        if (l.paintSelected) this.paintSpeed = l.paintSpeed;
        H(this.bot, true);
        this.showNativeNotice(l.paintSpeed === 1 ? 'Velocidad x1: ritmo más prudente. Ninguna velocidad garantiza evitar controles de WPlace.' : `Velocidad x${l.paintSpeed} para esta imagen.`);
      });
      const confirm = i.querySelector('.shark-image-confirm');
      const refreshConfirm = () => { confirm.querySelector('span').textContent = `Confirmar pintado · ${l.confirmPaint ? 'activo' : 'apagado'}`; confirm.classList.toggle('shark-running', l.confirmPaint); confirm.setAttribute('aria-pressed', String(l.confirmPaint)); };
      refreshConfirm();
      confirm.addEventListener('click', () => { l.confirmPaint = !l.confirmPaint; if (l.paintSelected) this.manualConfirmation = !l.confirmPaint; refreshConfirm(); H(this.bot, true); });
      i.querySelector('.shark-image-autodraw').addEventListener('click', () => { this.selectPaintImage(l, false); this.autoConfigImage = l; this.openAutoOverlayModal(); });
      const rename = i.querySelector('.shark-card-rename');
      const name = i.querySelector('.shark-card-name');
      const nameInput = i.querySelector('.shark-card-name-input');
      rename.addEventListener('click', () => {
        nameInput.value = l.displayName || `Plantilla ${a + 1}`;
        name.hidden = true;
        nameInput.hidden = false;
        rename.hidden = true;
        nameInput.focus();
        nameInput.select();
      });
      const finishRename = save => {
        if (nameInput.hidden) return;
        const next = nameInput.value.trim();
        if (save && next) {
          l.displayName = next;
          name.textContent = next;
          H(this.bot, true);
        }
        nameInput.hidden = true;
        name.hidden = false;
        rename.hidden = false;
      };
      nameInput.addEventListener('keydown', event => {
        event.stopPropagation();
        if (event.key === 'Enter' || event.key === 'Escape') {
          event.preventDefault();
          finishRename(event.key === 'Enter');
        }
      });
      nameInput.addEventListener('blur', () => finishRename(true));
      i.classList.toggle('shark-detail-active', this.selectedGalleryImage === l);
      this.installImagePaintActions(i,l);
      const strategy = i.querySelector('.shark-card-strategy');
      strategy.replaceChildren(...Array.from(l.$strategy.options, option => option.cloneNode(true)));
      strategy.value = l.strategy;
      strategy.addEventListener('change', () => {
        l.$strategy.value = strategy.value;
        l.$strategy.dispatchEvent(new Event('change'));
        l.updateTasks();
        this.bot.updateTasks();
        H(this.bot);
      });
      const opacity = i.querySelector('.shark-card-opacity');
      const opacityValue = i.querySelector('.shark-card-opacity-value');
      opacity.value = String(l.opacity);
      opacityValue.textContent = l.opacity + '%';
      opacity.addEventListener('input', () => {
        opacityValue.textContent = opacity.value + '%';
        l.$opacity.value = opacity.value;
        l.$opacity.dispatchEvent(new Event('input'));
      });
      for (const [selector, original] of [['.shark-card-colors-order', l.$drawColorsInOrder], ['.shark-card-transparent', l.$drawTransparent], ['.shark-card-available', l.$skipUnavailable]]) {
        const control = i.querySelector(selector);
        control.checked = original.checked;
        control.addEventListener('change', () => {
          original.checked = control.checked;
          original.dispatchEvent(new Event('click'));
          l.updateTasks();
          this.bot.updateTasks();
        });
      }
      this.imageProgressRows.set(l, i.querySelector(".image-progress"));
      i.querySelector('.preview').addEventListener('click', () => {
        this.activeImageIndex = a;
        this.selectedGalleryImage = l;
        this.selectPaintImage(l, false);
        this.renderImagesList();
      });
      i.addEventListener('click', event => {
        if (this.selectedGalleryImage || event.target.closest('button, input, select, label')) return;
        this.activeImageIndex = a;
        this.selectedGalleryImage = l;
        this.selectPaintImage(l, false);
        this.renderImagesList();
      });
      i.querySelector('.shark-detail-back').addEventListener('click', () => {
        this.selectedGalleryImage = null;
        this.renderImagesList();
      }), i.querySelector(".focus-map").addEventListener("click", () => {
        this.activeImageIndex = a;
        new SharkMapPosition(this.bot, l.position.globalX + l.pixels.width / 2, l.position.globalY + l.pixels.height / 2).scrollScreenTo();
      }), i.querySelector(".colors").addEventListener("click", () => {
        this.activeImageIndex = a, l.openColorPanel();
      }), i.querySelector(".strategy-modal").addEventListener("click", () => {
        this.activeImageIndex = a, l.openPreviewPanel();
      }), i.querySelector(".available-colors").addEventListener("click", event => {
        this.activeImageIndex = a;
        this.enableAvailableImageColors(l, event.currentTarget);
      }), i.querySelector(".download").addEventListener("click", () => {
        l.exportImage();
      }), i.querySelector(".delete").addEventListener("click", () => {
        l.destroy();
      });
    }
    this.$images.append(o);
    this.syncActionButtons();
    if (this.inlineAutoImage === this.selectedGalleryImage) this.renderInlineAutoSettings(this.inlineAutoImage);
    this.filterGallery();
    this.refreshProgress();
  }
  filterGallery() {
    const query = this.element.querySelector('.shark-gallery-search')?.value.trim().toLocaleLowerCase() || '';
    let visible = 0;
    for (const card of this.$images.querySelectorAll('.shark-gallery-card')) {
      const matches = !query || card.querySelector('.shark-card-name').textContent.toLocaleLowerCase().includes(query);
      card.hidden = !matches && !card.classList.contains('shark-detail-active');
      if (!card.hidden) visible++;
    }
    const count = this.$imagesSection.querySelector('.shark-gallery-count');
    if (count) count.textContent = `${visible} de ${this.bot.images.length} locales`;
    macrosharkObserveThumbnails(this);
  }
  refreshProgress() {
    for (const [image, row] of this.imageProgressRows ?? []) {
      const total = image.pixels.pixels.length * (image.pixels.pixels[0]?.length ?? 0),
        remaining = image.pendingPixelCount();
      const done = Math.max(0, total - remaining),
        percent = total ? Math.min(100, Math.floor(done / total * 100)) : 0;
      row.querySelector('.image-progress-label').textContent = percent + '% · ' + remaining.toLocaleString() + ' restantes';
      const bar = row.querySelector('.shark-progress-track');
      bar.querySelector('.shark-progress-done').style.width = `${total ? done / total * 100 : 0}%`;
      bar.querySelector('.shark-progress-remaining').style.width = `${total ? remaining / total * 100 : 0}%`;
      bar.setAttribute('aria-valuenow', String(percent));
      bar.setAttribute('aria-valuetext', `${percent}% · ${remaining} restantes`);
    }
  for(const card of this.$images?.querySelectorAll('.shark-gallery-card')||[])card.sharkSyncCoordinates?.();
  }
  syncOverlayVisibilityFromStorage() {
    let o = localStorage.getItem(oa) === "true";
    document.body.classList.toggle("overlay-hidden", o), this.refreshOverlayToggleText();
  }
  toggleOverlay(o) {
    let a = o ?? !document.body.classList.contains("overlay-hidden");
    document.body.classList.toggle("overlay-hidden", a);
    localStorage.setItem(oa, String(a));
    this.refreshOverlayToggleText();
  }
  refreshOverlayToggleText() {
    let o = document.body.classList.contains("overlay-hidden"),
      a = o ? f("disabled") : f("enabled"),
      l = o ? '<i class="fa-solid fa-circle-xmark" aria-hidden="true"></i>' : '<i class="fa-solid fa-circle-check" aria-hidden="true"></i>';
    this.$toggleOverlay.innerHTML = `<i class="fa-solid fa-layer-group"></i><span>${o ? "Mostrar" : "Ocultar"} plantillas</span>`;
    this.$toggleOverlay.title = `${f("toggleOverlay")} (${a})`;
    this.$toggleOverlay.setAttribute("aria-label", this.$toggleOverlay.title);
    this.$toggleOverlay.setAttribute("aria-pressed", String(!o));
    this.$toggleOverlay.classList.toggle("shark-running", !o);
  }
  applyLocaleToUI(o) {
    uo(o), U(this.element);
    for (let a = 0; a < this.bot.images.length; a++) this.bot.images[a].applyLocale();
    this.refreshOverlayToggleText(), this.refreshAutoOverlayStatusText();
  }
  initializeImagesSection() {
    if (this.imagesListDirty) this.renderImagesList(), this.imagesListDirty = false;
  }
  openGuideModal() {
      if(this.guideDialog?.isConnected){this.guideDialog.querySelector('.guide-close').focus();return;}
      const dialog=document.createElement('dialog');dialog.className='macroshark-guide';
      dialog.setAttribute('aria-labelledby','macroshark-guide-title');dialog.innerHTML="<div class=\"macroshark-guide-head\"><div><strong id=\"macroshark-guide-title\">Guía de MacroShark</strong><small>Plus.37 · PC y móvil</small></div><button type=\"button\" class=\"guide-close\" aria-label=\"Cerrar guía\">×</button></div>\n<div class=\"macroshark-guide-body\">\n<p>La galería prepara miniaturas pequeñas de las tarjetas visibles y las guarda para próximas visitas, sin analizar sus colores ni tareas de pintado. Al iniciar se carga la lista de plantillas. Toca una para prepararla; verás un indicador mientras carga. Al cambiar de imagen se libera la anterior de memoria conservando sus datos. El tiburón muestra u oculta los cuatro controles laterales: imágenes, Captura, Dibujar y AutoDraw. El botón de imágenes abre el panel general. Las actualizaciones se comprueban automáticamente. Cuando hay una versión nueva, el pintado queda bloqueado hasta instalarla; el tiburón permite volver a abrir el aviso. Mantén activa una sola copia del macro.</p>\n<details open><summary>Empezar a pintar</summary><ol><li>Importa una imagen o una plantilla .wplace, o usa «Actualizar canvas» para leer las plantillas locales de WPlace.</li><li>Toca una tarjeta para seleccionar la imagen. Sus ajustes se guardan individualmente.</li><li>Usa la mira para ir a la imagen. Desbloquéala para moverla o ajustar su tamaño con los ocho puntos del borde.</li><li>Pulsa «Empezar a pintar» debajo de la imagen, o el lápiz lateral, para preparar una tanda. «Confirmar pintado» decide si esa tanda manual se confirma al terminar. Los píxeles preparados todavía no equivalen a píxeles confirmados.</li></ol></details>\n<details><summary>Controles y ajustes por imagen</summary><p>En la columna derecha están MacroShark, el panel de imágenes, Captura, Dibujar y AutoDraw. El lápiz junto al nombre permite renombrar la imagen. La velocidad alterna x1, x2 y x4; cambia la espera de preparación, no la recarga de la cuenta ni los límites de WPlace.</p><p>En cada ficha puedes elegir el recorrido, opacidad, colores y pintado de transparentes. Los ajustes de AutoDraw se abren en un bloque compacto de esa misma ficha. Al iniciar se cierra el panel para ver el mapa; si faltan ajustes de AutoDraw, la configuración permanece abierta.</p><p>Las barras A y B contienen cuatro números compatibles con las coordenadas de WPlace: por ejemplo, 1024, 1024, 200, 300. A es la esquina superior izquierda y B la inferior derecha. Editar una mueve la imagen y calcula la otra conservando su tamaño. No se pueden cambiar mientras el macro pinta.</p><p>La mira usa el mapa de WPlace para ir directamente al centro de la imagen y conserva el zoom actual. Si ese acceso no está disponible, vuelve al arrastre anterior. Dibujar y AutoDraw no mueven la cámara ni cambian el zoom. Usa la mira antes de pintar si necesitas acercarte a la imagen. «Vista previa», con el ojo, muestra una referencia visual para pintar manualmente. La previsualización animada del recorrido se abre desde la ficha.</p></details>\n<details><summary>Mover el mapa con las flechas</summary><p>Cierra los paneles y usa ↑ ↓ ← → para mover la vista en esa dirección. Con la paleta abierta, cada paso avanza un píxel del mapa; con la paleta cerrada, avanza 40 píxeles de pantalla. Mantener una flecha repite el movimiento y soltarla lo detiene. Si pulsas dos flechas, se usa la última para conservar una dirección recta.</p><p>Para dibujar una línea, abre la paleta de WPlace, elige un color, coloca el cursor sobre el mapa y mantén Espacio junto con una flecha. El macro añade el movimiento; el pintado con Espacio sigue siendo el de WPlace. No confirma la tanda ni cambia el color.</p><p>Las flechas no se interceptan al escribir, utilizar campos o paneles, ni durante Dibujar o AutoDraw. Al cambiar de ventana se detiene el movimiento. Si WPlace no permite acceder directamente al mapa, el respaldo con arrastre puede avanzar más despacio.</p></details>\n<details><summary>Capturar una zona del mapa</summary><p>«Captura» está en la barra principal, entre «Actualizar canvas» e «Importar imagen»; en móvil se muestra con una cámara. Al abrirlo se cierran los otros paneles del macro.</p><ol><li>Pulsa «Punto A» y mueve o acerca el mapa hasta el lugar deseado. Toca un píxel sin arrastrar para seleccionarlo.</li><li>Haz lo mismo con «Punto B». Los arrastres y los gestos de zoom no eligen puntos. «Cancelar» vuelve al panel.</li><li>Revisa las coordenadas y la vista previa completa. Su tamaño se adapta a las proporciones de la selección.</li><li>Pulsa «Descargar PNG» o, en móvil, «Guardar en Archivos». Se solicita una descarga normal, sin abrir Compartir. En iPhone se guarda en la carpeta Descargas de Archivos, según los ajustes de Safari.</li><li>Para la fototeca, pulsa «Abrir para Fotos». Mantén pulsada la imagen que aparece y elige «Guardar en Fotos» o «Guardar imagen» en el menú del teléfono. El macro no puede guardarla automáticamente en la fototeca. «Volver» regresa a la captura.</li></ol><p>Ambas opciones conservan la resolución original del PNG seleccionado.</p></details>\n<details><summary>AutoDraw y cuenta regresiva</summary><p>Configura el intervalo y la cantidad de píxeles por ciclo en la imagen que deseas pintar. «Iniciar AutoDraw», debajo de esa imagen, o el triángulo lateral, inician y detienen los ciclos. Si faltan ajustes, el botón de la ficha abre la configuración primero. Junto al triángulo aparece la cuenta regresiva o «Pintando…».</p><p>Cada ciclo abre la paleta si hace falta, consulta las cargas y el mapa, prepara los píxeles pendientes y confirma automáticamente, aunque «Confirmar pintado» esté apagado. Si faltan cargas, usa las disponibles. Al terminar y comprobar la confirmación espera el intervalo indicado. Si no hay cargas todavía, espera el siguiente intervalo. El intervalo mínimo es de cinco segundos.</p><p>La opción de variar usa el 80–99 % de la cantidad y espera configuradas. Los ciclos no se superponen. Si terminas la imagen, AutoDraw se detiene. Una verificación, límite o fallo de confirmación puede necesitar revisión; se muestra el motivo. Cerrar la paleta durante la espera no cancela AutoDraw.</p></details>\n<details><summary>Importar, sincronizar y descargar</summary><p>La importación directa admite imágenes y archivos .wplace. «Actualizar canvas» lee las plantillas que WPlace guarda localmente en el mismo navegador. La sincronización va de WPlace al macro; las imágenes que cargues únicamente al macro no se envían a WPlace. No sincroniza entre dispositivos.</p><p>La flecha de descarga ofrece plantilla .wplace, PNG con transparencia o JPG con fondo blanco. .wplace guarda la imagen y su ubicación para volver a importarla. PNG y JPG guardan la imagen, sin la ubicación. En iPhone puede abrirse el menú de compartir para guardar el archivo.</p></details>\n<details><summary>Colores y apariencia</summary><p>El modo normal usa bordes redondos; el pixelado usa cuadrados. Paneles, selectores y previsualizaciones siguen el tema claro u oscuro y el acento de WPlace. Los colores de tu imagen no se alteran al cambiar el tema.</p><p>En el panel de colores puedes activar o excluir colores y cambiar su prioridad. Antes de cada tanda se abre la paleta, se lee el mapa confirmado y se revisa la selección pendiente de WPlace. Los píxeles preparados se conservan mientras sigan en esa selección; si se descartan o no llegaron al mapa, vuelven a intentarse. El avance no cuenta los preparados como confirmados.</p></details>\n<details><summary>Teclado y solución de problemas</summary><p>Shift + M: minimizar · Shift + S: abrir · Shift + V: mostrar u ocultar imágenes · Shift + Enter: dibujar · Shift + I: importar · Shift + /: guía · Shift + N/P: siguiente o anterior imagen · Shift + O: colores · Shift + L: candado.</p><p>Después de actualizar, desactiva cualquier copia de prueba y recarga WPlace. Los gestores comparten los datos locales del sitio, por lo que tus imágenes deben conservarse. Si la página necesita una verificación, resuélvela y vuelve a abrir la paleta para actualizar el estado. Safari puede retrasar temporizadores cuando la pestaña está en segundo plano; mantén WPlace visible para probar los ciclos.</p></details>\n</div>\n";
      this.guideDialog=dialog;document.body.append(dialog);
      dialog.querySelector('.guide-close').onclick=()=>dialog.close();
      dialog.addEventListener('close',()=>{dialog.remove();this.guideDialog=null;this.$openConfig.focus();},{once:true});
      dialog.showModal();
    }
  formatCharges(o) {
    if (!o || typeof o !== "object") return "—";
    let a = o,
      l = typeof a.count === "number" ? Math.floor(a.count) : a.count;
    return `${this.formatUnknownValue(l)} / ${this.formatUnknownValue(a.max)} (${this.formatUnknownValue(a.cooldownMs)} ms)`;
  }
  formatUnknownValue(o) {
    if (typeof o === "string" || typeof o === "number" || typeof o === "boolean") return String(o);
    return "—";
  }
  readStorageJson(o, a) {
    try {
      let l = localStorage.getItem(o);
      if (!l) return a;
      return JSON.parse(l);
    } catch {
      return a;
    }
  }
  escapeHtml(o) {
    return String(o).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  refreshAutoOverlayStatusText() {
      this.syncActionButtons?.();
      const active=!!this.autoOverlayIntervalId;
      const label=active?(this.autoOverlayTickRunning?'Pintando…':this.formatCountdown(this.autoOverlayNextTickAt).split(' ').at(-1)):'';
      this.$autoOverlayStatus.textContent=active?label:'';
      if(this.$quickAuto){
        let badge=this.$quickAuto.querySelector('.shark-auto-countdown');
        if(!badge){badge=document.createElement('span');badge.className='shark-auto-countdown';this.$quickAuto.append(badge);}
        badge.textContent=label;badge.hidden=!active;
        const text=active?'Detener AutoDraw · '+label:'Iniciar AutoDraw';
        this.$quickAuto.title=text;this.$quickAuto.setAttribute('aria-label',text);
      }
    }
  formatCountdown(o) {
    if (!o) return "00:00";
    let a = Math.max(0, o - Date.now()),
      l = Math.ceil(a / 1000),
      i = Math.floor(l / 60),
      r = l % 60;
    return `${f("nextRunIn")} ${String(i).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  }
  formatAutoDrawDelay(o) {
    if (o % 3600000 === 0) return `${o / 3600000}h`;
    if (o % 60000 === 0) return `${o / 60000}m`;
    return `${o / 1000}s`;
  }
  stopAutoOverlay() {
    if (this.autoOverlayTickRunning) this.bot.cancelDrawing = true;
    if (!this.autoOverlayIntervalId) {
      this.syncActionButtons?.();
      return;
    }
    clearTimeout(this.autoOverlayIntervalId);
    this.autoOverlayIntervalId = void 0;
    this.autoOverlayNextTickAt = void 0;
    this.autoOverlayPendingTick = !1;
    this.refreshAutoOverlayStatusText();
  }
  startAutoOverlay() {
    if(this.getPaintImage()?.isDeferred){
      if(this.loadingPaintStart)return;this.loadingPaintStart=true;
      this.loadGalleryImage(this.getPaintImage(),true).then(image=>{this.loadingPaintStart=false;if(image)this.startAutoOverlay();}).catch(error=>{this.loadingPaintStart=false;this.showNativeNotice(error.message);});return;
    }
    if(this.loadingGalleryImage){this.showNativeNotice('Espera a que termine de cargar la plantilla.');return;}
    if (this.updateRequired) { macrosharkShowUpdate(this.updateRequired); return; }
    if (this.autoOverlayTickRunning || this.drawActionRunning) return;
    if (!this.getPaintImage()) { this.showPaintSelectionPrompt(); return; }
    try {
      this.bot.assertAutomationReady();
    } catch (error) {
      this.status = error.message;
      return;
    }
    if (!this.autoOverlayConfig) {
      this.status = f('autoOverlayNeedsConfig');
      return;
    }
    this.stopAutoOverlay();
    this.open=false;
    if(document.activeElement?.closest?.('.wwidget'))document.activeElement.blur();
    this.autoOverlayIntervalId = -1;
    this.autoOverlayNextTickAt = undefined;
    this.refreshAutoOverlayStatusText();
    this.runAutoOverlayCycle();
  }
  scheduleAutoOverlayCycle() {
    if (!this.autoOverlayIntervalId) return;
    const delay = this.resolveCycleDelay(this.autoOverlayConfig);
    this.autoOverlayNextTickAt = Date.now() + delay;
    this.autoOverlayIntervalId = setTimeout(() => {
      this.autoOverlayNextTickAt = undefined;
      this.runAutoOverlayCycle();
    }, delay);
    this.refreshAutoOverlayStatusText();
  }
  resolveCycleDelay(config) {
    const base = Math.max(1, Math.floor(config.timerMs));
    return Math.max(5000, config.usePixelRange ? this.randomizeAutoValue(base) : base);
  }
  randomizeAutoValue(base) {
    const min = Math.max(1, Math.ceil(base * .8)),
      max = Math.max(min, Math.floor(base * .99));
    return min + Math.floor(Math.random() * (max - min + 1));
  }
  async runAutoOverlayCycle() {
      if(!this.autoOverlayConfig||this.autoOverlayTickRunning||!this.autoOverlayIntervalId)return;
      this.autoOverlayTickRunning=true;this.bot.cancelDrawing=false;
      this.refreshAutoOverlayStatusText();
      try {
        const image=this.getPaintImage();
        if(!image){this.stopAutoOverlay();this.showPaintSelectionPrompt();return;}
        this.paintSpeed=image.paintSpeed||1;
        const count=await this.bot.drawOverlayPixelsBatch(this.resolveCyclePixelCount(this.autoOverlayConfig));
        this.bot.assertAutomationReady();
        if(!this.autoOverlayIntervalId)return;
        const staged=[...(this.bot.stagedPixels?.values()||[])].some(entry=>{
          if(entry.submittedAt)return false;
          const [tileX,tileY]=entry.tile.split('/').map(Number),x=tileX*k+entry.x,y=tileY*k+entry.y;
          return x>=image.position.globalX&&x<image.position.globalX+image.pixels.width&&y>=image.position.globalY&&y<image.position.globalY+image.pixels.height;
        });
        if(count>0||staged)await this.waitAndClickPaintButton({automatic:true});
        else if(!image.tasks.length){this.stopAutoOverlay();this.showNativeNotice('AutoDraw: imagen terminada.');}
        // With no charges, keep the timer active and try the complete next cycle.
      } catch(error) {
        if(!this.bot.cancelDrawing)this.bot.pauseAutomation(error.message||'No se pudo completar el ciclo de AutoDraw.');
      } finally {
        this.autoOverlayTickRunning=false;this.autoOverlayPendingTick=false;
        if(this.autoOverlayIntervalId)this.scheduleAutoOverlayCycle();else this.refreshAutoOverlayStatusText();
      }
    }
  saveAutoOverlayConfig(o) {
    this.autoOverlayConfig = o;
    const image = this.autoConfigImage || this.getPaintImage();
    if (image) { image.autoDrawConfig = o; H(this.bot, true); }
    this.autoConfigImage = null;
    localStorage.setItem(ia, JSON.stringify(o)); $({
      autoDraw: this.toControlPixelSettings(o)
    });
  }
  resolveCyclePixelCount(config) {
    const pixels = Math.max(1, Math.floor(config.pixels));
    return config.usePixelRange ? this.randomizeAutoValue(pixels) : pixels;
  }
  toControlPixelSettings(o) {
    return {
      usePixelRange: o.usePixelRange,
      pixel: Math.max(1, Math.floor(o.pixels)),
      pixelRange: {
        min: Math.max(1, Math.floor(o.pixelRange.min)),
        max: Math.max(1, Math.floor(o.pixelRange.max))
      }
    };
  }
  getRemotePixelSettings(o) {
    return wo()[o];
  }
  loadAutoOverlayConfigFromStorage() {
    let o = this.getRemotePixelSettings("autoDraw"),
      a = localStorage.getItem(ia);
    if (!a && o) {
      this.autoOverlayConfig = this.createDefaultAutoConfig(o);
      return;
    }
    if (!a) return;
    try {
      let l = JSON.parse(a);
      if (typeof l.value !== "number" || !Number.isFinite(l.value) || l.value < 1) return;
      let i = typeof l.pixels === "number" && Number.isFinite(l.pixels) && l.pixels >= 1 ? Math.floor(l.pixels) : Math.max(1, Math.floor(o?.pixel ?? 60)),
        r = this.normalizePixelRange(l.pixelRange, o),
        s = l.unit === "hours" || l.unit === "minutes" || l.unit === "seconds" ? l.unit : "minutes",
        c = typeof l.timerMs === "number" && l.timerMs > 0 ? l.timerMs : s === "hours" ? l.value * 3600000 : s === "minutes" ? l.value * 60000 : l.value * 1000;
      this.autoOverlayConfig = {
        value: Math.max(1, Math.floor(l.value)),
        pixels: i,
        usePixelRange: l.usePixelRange ?? o?.usePixelRange ?? !1,
        pixelRange: r,
        unit: s,
        timerMs: c
      };
    } catch {
      return;
    }
  }
  createDefaultAutoConfig(o) {
    return {
      value: 1,
      unit: "minutes",
      pixels: Math.max(1, Math.floor(o.pixel ?? 60)),
      usePixelRange: o.usePixelRange ?? !1,
      pixelRange: this.normalizePixelRange(o.pixelRange, o),
      timerMs: 60000
    };
  }
  normalizePixelRange(o, a) {
    let l = o && typeof o === "object" ? o : a?.pixelRange,
      i = typeof l?.min === "number" && Number.isFinite(l.min) ? Math.max(1, Math.floor(l.min)) : 1,
      r = typeof l?.max === "number" && Number.isFinite(l.max) ? Math.max(i, Math.floor(l.max)) : Math.max(i, 5);
    return {
      min: i,
      max: r
    };
  }
  openAutoOverlayModal() {
      const image=this.autoConfigImage||this.getPaintImage();
      if(!image){this.showPaintSelectionPrompt();return;}
      this.open=true;this.selectedGalleryImage=image;this.inlineAutoImage=image;
      this.renderImagesList();
      this.$images.querySelector('.shark-auto-settings')?.scrollIntoView({block:'nearest'});
    }
    renderInlineAutoSettings(image) {
      if(!image)return;
      const card=this.$images.querySelector('.shark-detail-active');if(!card)return;
      card.querySelector('.shark-auto-settings')?.remove();
      const config=image.autoDrawConfig||{value:1,unit:'minutes',pixels:60,usePixelRange:false};
      const form=document.createElement('form');form.className='shark-auto-settings shark-auto-inline';
      form.setAttribute('aria-label','Configuración de AutoDraw de '+(image.displayName||'imagen'));
      form.innerHTML='<div class="shark-auto-heading"><strong>AutoDraw</strong><button type="button" class="shark-auto-close" aria-label="Cerrar ajustes de AutoDraw">×</button></div><label>Intervalo<div class="shark-auto-fields"><input name="amount" type="number" min="1" max="1000000" required aria-label="Intervalo de AutoDraw"><select name="unit" aria-label="Unidad del intervalo"><option value="seconds">Segundos</option><option value="minutes">Minutos</option><option value="hours">Horas</option></select></div></label><label>Píxeles por ciclo<input name="pixels" type="number" min="1" max="16000000" required></label><label class="shark-random-label"><input name="random" type="checkbox">Variar cantidad y espera (80–99 %)</label><p>Confirma cada tanda automáticamente. Si hay menos píxeles, utiliza los disponibles.</p><output class="shark-auto-error" role="status"></output><button type="submit">Guardar</button>';
      form.elements.amount.value=config.value;form.elements.unit.value=config.unit;form.elements.pixels.value=config.pixels;form.elements.random.checked=!!config.usePixelRange;
      form.querySelector('.shark-auto-close').onclick=()=>{this.inlineAutoImage=null;this.autoConfigImage=null;form.remove();};
      form.onsubmit=event=>{
        event.preventDefault();
        if(!form.reportValidity())return;
        const amount=Number(form.elements.amount.value),pixels=Number(form.elements.pixels.value),unit=form.elements.unit.value;
        const timerMs=amount*(unit==='hours'?3600000:unit==='minutes'?60000:1000);
        if(!Number.isSafeInteger(amount)||!Number.isSafeInteger(pixels)||timerMs>2147483647){form.querySelector('output').textContent='Usa cantidades enteras y un intervalo máximo de 24 días.';return;}
        this.autoConfigImage=image;
        this.saveAutoOverlayConfig({value:amount,unit,pixels,timerMs,usePixelRange:form.elements.random.checked,pixelRange:{min:Math.max(1,Math.ceil(pixels*.8)),max:Math.max(1,Math.floor(pixels*.99))}});
        if(this.autoOverlayIntervalId&&!this.autoOverlayTickRunning){clearTimeout(this.autoOverlayIntervalId);this.scheduleAutoOverlayCycle();}
        form.querySelector('output').textContent='Configuración guardada para esta imagen.';
        this.refreshAutoOverlayStatusText();
      };
      card.append(form);
    }
  getCurrentWplaceLocation() {
    let o = w => {
        let n = new URLSearchParams(w.replace(/^#/, "").replace(/^\?/, "")),
          b = Number.parseFloat(n.get("lat") ?? ""),
          h = Number.parseFloat(n.get("lng") ?? ""),
          e = Number.parseFloat(n.get("zoom") ?? "");
        if (Number.isFinite(b) && Number.isFinite(h) && Number.isFinite(e)) return {
          lat: b,
          lng: h,
          zoom: e
        };
      },
      a = globalThis.location.hash,
      l = a.includes("?") ? a.slice(a.indexOf("?") + 1) : "",
      i = [globalThis.location.search, a, l].filter(Boolean);
    for (let w of i) {
      let n = o(w);
      if (n) return n;
    }
    let r = /#?\/?(?<zoom>-?\d+(?:\.\d+)?)\/(?<lat>-?\d+(?:\.\d+)?)\/(?<lng>-?\d+(?:\.\d+)?)/.exec(a);
    if (!r?.groups) return;
    let {
      lat: s,
      lng: c,
      zoom: g
    } = r.groups;
    if (!s || !c || !g) return;
    let p = Number.parseFloat(s),
      d = Number.parseFloat(c),
      t = Number.parseFloat(g);
    if (!Number.isFinite(p) || !Number.isFinite(d) || !Number.isFinite(t)) return;
    return {
      lat: p,
      lng: d,
      zoom: t
    };
  }
  setDisabled(o, a) {
    this.element.querySelector("." + o).disabled = o === "draw" && this.drawActionRunning ? false : a;
  }
  async run(o, a, l, i = "...") {
    console.log("[MACROSHARK][Widget] Task started", {
      status: o
    });
    let r = this.status;
    this.status = `${i} ${o}`;
    try {
      let s = await a();
      return this.status = this.bot.pauseReason || r, console.log("[MACROSHARK][Widget] Task completed", {
        status: o
      }), s;
    } catch (s) {
      if (!(s instanceof mo)) console.error(s), this.status = this.bot.pauseReason || `${f("taskErrorPrefix")}: ${s.message || o}`;
      throw console.error("[MACROSHARK][Widget] Task failed", {
        status: o,
        error: s
      }), s;
    } finally {
      await l?.();
    }
  }
  handleKeyboard(o) {
    if ($o(o.target)) return;
    if (F(o, A.toggleWidget)) {
      o.preventDefault();
      this.open = !this.open;
      return;
    }
    if (F(o, A.minimizeWidget)) {
      o.preventDefault();
      this.open = !1;
      return;
    }
    if (F(o, A.showWidgetPanel)) {
      o.preventDefault();
      this.open = !0;
      return;
    }
    if (F(o, A.hideWidgetPanel)) {
      o.preventDefault();
      this.open = !1;
      return;
    }
    if (F(o, A.showShortcuts)) {
      o.preventDefault(), this.open = !0, this.openGuideModal();
      return;
    }
    if (F(o, A.toggleOverlay)) {
      o.preventDefault(), this.toggleOverlay();
      return;
    }
    if (F(o, A.focusNextImage)) {
      o.preventDefault(), this.focusImageByStep(1);
      return;
    }
    if (F(o, A.focusPreviousImage)) {
      o.preventDefault(), this.focusImageByStep(-1);
      return;
    }
    if (F(o, A.openColorPanel)) {
      o.preventDefault(), this.openColorPanelForActiveImage();
      return;
    }
    if (F(o, A.toggleImageLock)) {
      o.preventDefault(), this.toggleLockForActiveImage();
      return;
    }
    if (F(o, A.clickPaintWhenReady)) {
      o.preventDefault(), this.drawAndClickPaintWhenReady();
      return;
    }
    if (F(o, A.startAutoOverlay)) {
      o.preventDefault(), this.startAutoOverlay();
      return;
    }
    if (F(o, A.stopAutoOverlay)) {
      o.preventDefault(), this.stopAutoOverlay();
      return;
    }
    if (F(o, A.addImage) && !this.$addImage.disabled) {
      o.preventDefault(), this.addImage();
      return;
    }
    if (F(o, A.draw) && !this.$draw.disabled) o.preventDefault(), this.bot.draw();
  }
  focusImageByStep(o) {
    if (!this.bot.images.length) return;
    if (this.activeImageIndex < 0 || this.activeImageIndex >= this.bot.images.length) this.activeImageIndex = o > 0 ? 0 : this.bot.images.length - 1;else this.activeImageIndex = (this.activeImageIndex + o + this.bot.images.length) % this.bot.images.length;
    this.bot.images[this.activeImageIndex].position.scrollScreenTo();
  }
  compareSemver(o, a) {
    let l = o.split(".").map(r => Number(r) || 0),
      i = a.split(".").map(r => Number(r) || 0);
    for (let r = 0; r < 3; r++) {
      if ((l[r] ?? 0) > (i[r] ?? 0)) return 1;
      if ((l[r] ?? 0) < (i[r] ?? 0)) return -1;
    }
    return 0;
  }
  getActiveImage() {
    if (!this.bot.images.length) return;
    if (this.activeImageIndex < 0 || this.activeImageIndex >= this.bot.images.length) this.activeImageIndex = 0;
    return this.bot.images[this.activeImageIndex];
  }
  openColorPanelForActiveImage() {
    let o = this.getActiveImage();
    if (!o) return;
    o.openColorPanel();
  }
  toggleLockForActiveImage() {
    let o = this.getActiveImage();
    if (!o) return;
    o.lock = !o.lock, o.update(), H(this.bot);
  }
  async waitAndClickPaintButton({ automatic = false } = {}) {
    this.bot.assertAutomationReady();
    this.bot.assertPaletteOpen();
    if (this.manualConfirmation && !automatic) {
      this.stopAutoOverlay();
      this.status = 'Dibujo preparado. Revisa el mapa y pulsa Pintar manualmente en WPlace.';
      return false;
    }
    const deadline = Date.now() + 30000;
    while (Date.now() < deadline) {
      this.bot.assertAutomationReady();
      this.bot.assertPaletteOpen();
      const button = this.findNativePaintButton();
      if (button && !button.disabled && button.ariaDisabled !== 'true') return this.triggerNativePaintClickWithChallengeRecovery(button);
      await Q(500);
    }
    this.bot.pauseAutomation('Pintar no estuvo disponible en 30 segundos. Revisa el estado antes de reanudar.');
    throw new Error(this.bot.pauseReason);
  }
  async drawAndClickPaintWhenReady() {
    if(this.getPaintImage()?.isDeferred){
      if(this.loadingPaintStart)return;this.loadingPaintStart=true;
      let image;try{image=await this.loadGalleryImage(this.getPaintImage(),true);}finally{this.loadingPaintStart=false;}
      if(!image)return;
    }
    if(this.loadingGalleryImage){this.showNativeNotice('Espera a que termine de cargar la plantilla.');return;}
    if (this.updateRequired) { macrosharkShowUpdate(this.updateRequired); return; }
    if (!this.getPaintImage()) { this.showPaintSelectionPrompt(); return; }
    if (this.drawActionRunning) {
      this.bot.cancelDrawing = true;
      this.status = 'Deteniendo dibujo…';
      return;
    }
    if (this.$draw.disabled || this.autoOverlayTickRunning || this.autoOverlayIntervalId) return;
    this.drawActionRunning = true;
    this.bot.cancelDrawing = false;
    const image = this.getPaintImage();
    this.paintSpeed = image.paintSpeed || 1;
    this.manualConfirmation = image.confirmPaint === false;
    this.syncActionButtons();
    try {
      await this.bot.openColors();
      this.open=false;
      if(document.activeElement?.closest?.('.wwidget'))document.activeElement.blur();
      await this.bot.draw({
        refreshMapAfterDraw: false
      });
      this.bot.assertAutomationReady();
      await this.waitAndClickPaintButton();
    } finally {
      this.drawActionRunning = false;
      this.bot.cancelDrawing = false;
      this.$draw.disabled = false;
      this.syncActionButtons();
    }
  }
  findNativePaintButton() {
    return ["button.btn.btn-primary.btn-lg.sm\\:btn-xl.relative", "button.btn.btn-primary.btn-lg.relative", "button.btn.btn-primary.btn-lg.relative.z-30", "button.btn.btn-primary.btn-lg.sm\\:btn-xl.relative.z-30", "div.absolute.bottom-0.left-1\\/2.-translate-x-1\\/2 button.btn.btn-primary"].flatMap(l => Array.from(document.querySelectorAll(l))).find(button => {
      if (!/pintar|paint/i.test(button.textContent)) return false;
      const rect = button.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && getComputedStyle(button).visibility !== 'hidden';
    });
  }
  triggerNativePaintClick(o) {
    o.dispatchEvent(new PointerEvent("pointerdown", {
      bubbles: !0,
      cancelable: !0,
      pointerType: "mouse",
      button: 0
    })), o.dispatchEvent(new MouseEvent("mousedown", {
      bubbles: !0,
      cancelable: !0,
      button: 0
    })), o.dispatchEvent(new PointerEvent("pointerup", {
      bubbles: !0,
      cancelable: !0,
      pointerType: "mouse",
      button: 0
    })), o.dispatchEvent(new MouseEvent("mouseup", {
      bubbles: !0,
      cancelable: !0,
      button: 0
    })), o.click();
  }
  async triggerNativePaintClickWithChallengeRecovery(button) {
      this.bot.assertAutomationReady();
      await Q(Math.max(0,(this.nextPaintAt||0)-Date.now()));
      this.bot.assertAutomationReady();this.bot.assertPaletteOpen();
      this.nextPaintAt=Date.now()+5000;this.paintSubmissionRunning=true;
      try {
        const outcome=this.waitForPaintAttemptOutcome(10000);
        this.triggerNativePaintClick(button);
        const result=await outcome;
        if(result!=='painted'){
          this.bot.pauseAutomation('Pintado sin confirmación ('+result+'). Revisa el mapa antes de continuar.');
          throw new Error(this.bot.pauseReason);
        }
        await this.bot.refreshMapAfterPaint();
        // The next cycle owns reopening the palette; it may stay closed during the wait.
        return true;
      } finally {this.paintSubmissionRunning=false;}
    }
  async waitForPaintAttemptOutcome(timeout) {
    return new Promise(resolve => {
      let finished = false;
      const done = result => {
        if (finished) return;
        finished = true;
        clearInterval(poll);
        clearTimeout(timer);
        globalThis.removeEventListener('macroshark:paint-response', listener);
        resolve(result);
      };
      const listener = event => done(event.detail.ok ? 'painted' : 'HTTP ' + event.detail.status);
      const poll = setInterval(() => {
        if (this.isChallengeBlockingPaint()) done('verificación');else if (this.bot.pauseReason || this.bot.cancelDrawing) done('pausa');
      }, 250);
      const timer = setTimeout(() => done('sin respuesta'), timeout);
      globalThis.addEventListener('macroshark:paint-response', listener);
    });
  }
  async waitForChallengeToResolve() {
    this.bot.pauseAutomation('Verificación pendiente. Resuélvela manualmente y reanuda después.');
    throw new Error(this.bot.pauseReason);
  }
  isChallengeBlockingPaint() {
    let l = Array.from(document.querySelectorAll("h-captcha, .h-captcha, .cf-turnstile, iframe[src*=\"challenges.cloudflare.com\"], iframe[src*=\"hcaptcha.com\"\
], iframe[src*=\"newassets.hcaptcha.com\"], iframe[src*=\"captcha\"], [data-hcaptcha-widget-id]")).filter(s => {
      if (s.closest("dialog")?.matches("dialog:not([open])")) return !1;
      let c = globalThis.getComputedStyle(s);
      if (c.display === "none" || c.visibility === "hidden") return !1;
      let g = s.getBoundingClientRect();
      return g.width > 0 && g.height > 0;
    });
    if (!l.length) return !1;
    let i = document.querySelector("dialog.modal[open], dialog[open]");
    if (i?.querySelector("h-captcha, .h-captcha, .cf-turnstile, iframe[src*=\"challenges.cloudflare.com\"], iframe[src*=\"hcaptcha.com\"\
], iframe[src*=\"newassets.hcaptcha.com\"], iframe[src*=\"captcha\"], [data-hcaptcha-widget-id]")) {
      if (!i) return !1;
      if (!Array.from(i.querySelectorAll('textarea[name="h-captcha-response"], textarea[name^="h-captcha-response-"]')).some(c => c.value.trim().length > 0)) return !0;
    }
    return l.some(s => {
      let c = s.closest("h-captcha") ?? s.parentElement ?? document.documentElement,
        g = Array.from(c.querySelectorAll('textarea[name="h-captcha-response"], textarea[name^="h-captcha-response-"]'));
      if (!g.length) return !0;
      return g.every(p => p.value.trim().length === 0);
    });
  }
  async optimizeImportedImage(image) {
    let width = image.naturalWidth;
    if (width * image.naturalHeight > 1048576) {
      width = await new Promise(resolve => {
        const dialog = document.createElement('dialog');
        dialog.className = 'macroshark-guide';
        dialog.innerHTML = "<form class=\"macroshark-guide-body\"><h2>Optimizar imagen</h2><p>Reducir la resolución reduce memoria y camb\
ia el tamaño del dibujo en el mapa.</p><p class=\"source-size\"></p><label>Ancho en píxeles <input class=\"sha\
rk-width\" type=\"number\" min=\"1\" required></label><p class=\"target-size\"></p><button type=\"submit\">Imp\
ortar a este tamaño</button> <button type=\"button\" class=\"keep-size\">Conservar tamaño original</button> <b\
utton type=\"button\" class=\"cancel-import\">Cancelar</button></form>";
        const input = dialog.querySelector('input');
        input.max = image.naturalWidth;
        input.value = Math.max(1, Math.floor(image.naturalWidth * Math.min(1, Math.sqrt(1048576 / (image.naturalWidth * image.naturalHeight)))));
        dialog.querySelector('.source-size').textContent = 'Original: ' + image.naturalWidth + ' × ' + image.naturalHeight;
        const preview = () => {
          const w = Number(input.value);
          dialog.querySelector('.target-size').textContent = 'Resultado: ' + w + ' × ' + Math.max(1, Math.round(w * image.naturalHeight / image.naturalWidth)) + ' píxeles.';
        };
        preview();
        input.oninput = preview;
        let result = null;
        dialog.querySelector('form').onsubmit = e => {
          e.preventDefault();
          if (!input.checkValidity()) return;
          result = Math.round(Number(input.value));
          dialog.close();
        };
        dialog.querySelector('.keep-size').onclick = () => {
          result = image.naturalWidth;
          dialog.close();
        };
        dialog.querySelector('.cancel-import').onclick = () => dialog.close();
        dialog.addEventListener('close', () => {
          dialog.remove();
          resolve(result);
        }, {
          once: true
        });
        document.body.append(dialog);
        dialog.showModal();
      });
      if (width === null) throw new Error('Importación cancelada.');
    }
    return sharkSourceCanvas(image, width);
  }
  syncActionButtons() {
    if(!this.$draw||!this.$autoOverlayStart)return;
    if(this.updateRequired){this.$draw.disabled=true;this.$autoOverlayStart.disabled=true;}
    const drawing=!!this.drawActionRunning,active=!!this.autoOverlayIntervalId,autoBusy=active||!!this.autoOverlayTickRunning;
    this.$draw.querySelector('span').textContent=drawing?'Detener dibujo':'Dibujar';
    this.$draw.classList.toggle('shark-running',drawing);
    this.$autoOverlayStart.querySelector('span').textContent=active?'Detener AutoDraw':'Iniciar AutoDraw';
    this.$autoOverlayStart.classList.toggle('shark-running',active);this.$autoOverlayStart.setAttribute('aria-pressed',String(active));
    if(this.$quickDraw){
      this.$quickDraw.disabled=this.$draw.disabled;
      this.$quickAuto.disabled=!!this.updateRequired;
      this.$quickDraw.classList.toggle('shark-running',drawing);this.$quickDraw.title=drawing?'Detener dibujo':'Dibujar';
      this.$quickAuto.classList.toggle('shark-running',active);this.$quickAuto.title=active?'Detener AutoDraw':'Iniciar AutoDraw';
    }
    for(const card of this.$images?.querySelectorAll('.shark-gallery-card')||[]){
      const own=card.sharkImage===this.getPaintImage(),draw=card.querySelector('.shark-card-draw'),auto=card.querySelector('.shark-card-auto');
      if(!draw||!auto)continue;
      draw.querySelector('span').textContent=drawing&&own?'Detener pintado':'Empezar a pintar';
      draw.disabled=!!this.updateRequired||autoBusy||(!drawing&&this.$draw.disabled)||(drawing&&!own);
      draw.classList.toggle('shark-running',drawing&&own);draw.setAttribute('aria-pressed',String(drawing&&own));
      auto.querySelector('span').textContent=autoBusy&&own?'Detener AutoDraw':'Iniciar AutoDraw';
      auto.disabled=!!this.updateRequired||drawing||(autoBusy&&!own);
      auto.classList.toggle('shark-running',autoBusy&&own);auto.setAttribute('aria-pressed',String(autoBusy&&own));
    }
  }
  installReferencePreview() {
    const button = this.element.querySelector('.macroshark-reference-toggle');
    this.bot.referencePreviewEnabled = localStorage.getItem('macroshark:reference-preview') === 'true';
    const sync = () => {
      const active = this.bot.referencePreviewEnabled;
      button.classList.toggle('shark-running', active);
      button.setAttribute('aria-pressed', String(active));
      document.body.classList.toggle('macroshark-reference-on', active);
      this.bot.referenceSignature = null;
      this.bot.scheduleReferencePreview();
    };
    button.onclick = event => {
      event.preventDefault();
      event.stopPropagation();
      this.bot.referencePreviewEnabled = !this.bot.referencePreviewEnabled;
      localStorage.setItem('macroshark:reference-preview', String(this.bot.referencePreviewEnabled));
      sync();
    };
    sync();
    macrosharkObserveTheme(this);
    this.registerEvent(window, 'resize', () => this.bot.scheduleReferencePreview());
  }
  installWorkspacePanels() {
    const capture=this.element.querySelector('.capture-template');
    capture.classList.add('shark-capture-global');
    capture.querySelector('span').textContent='Captura';
    capture.type='button';capture.title='Capturar imagen del mapa';capture.setAttribute('aria-label','Capturar imagen del mapa');
    const tools=this.element.querySelector('.widget-image-actions');
    tools.insertBefore(capture,tools.querySelector('.macroshark-inline-file'));
    this.element.querySelector('.shark-open-paint').onclick = () => {
      const content = this.element.querySelector('.shark-paint-settings');
      this.openWorkspacePanel('Configurar pintado', content, () => this.element.querySelector('.shark-settings-storage').append(content));
    };
    this.registerEvent(document, 'keydown', event => {
      if (event.key === 'Escape' && this.workspacePanel) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.closeWorkspacePanel();
      }
    }, {
      capture: true
    });
  }
  closeWorkspacePanel() {
    if (!this.workspacePanel) return;
    const {
      panel,
      cleanup,
      trigger
    } = this.workspacePanel;
    this.workspacePanel = null;
    cleanup?.();
    panel.remove();
    this.element.classList.remove('shark-subpanel-open');
    trigger?.focus();
  }
  openWorkspacePanel(title, content, cleanup) {
    this.closeWorkspacePanel();
    const trigger = document.activeElement,
      panel = document.createElement('section');
    panel.className = 'shark-subpanel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', title);
    const head = document.createElement('div');
    head.className = 'shark-subpanel-head';
    const back = document.createElement('button');
    back.type = 'button';
    back.textContent = '← Volver';
    back.onclick = () => this.closeWorkspacePanel();
    const name = document.createElement('strong');
    name.textContent = title;
    head.append(back, name);
    const body = document.createElement('div');
    body.className = 'shark-subpanel-body';
    body.append(content);
    panel.append(head, body);
    this.$imagesSection.append(panel);
    this.element.classList.add('shark-subpanel-open');
    this.workspacePanel = {
      panel,
      cleanup,
      trigger
    };
    back.focus();
  }
  openTemplateEditor() {
    const content = document.createElement('div');
    content.className = 'shark-editor';
    content.innerHTML = `<label class="macroshark-inline-file"><span>Cargar plantilla</span><input class="editor-file" type="file" accept="image/*,.wplace" aria-label="Cargar plantilla para editar"></label>
<p class="editor-status" role="status">Consultando colores disponibles…</p>
<div class="editor-dimensions"><label>Ancho (px)<input class="editor-width" type="number" min="1" max="8192" step="1" disabled></label><label>Alto (px)<input class="editor-height" type="number" min="1" max="8192" step="1" disabled></label></div>
<p>Se mantiene la proporción original. Los cambios se muestran en la vista previa.</p>
<canvas class="editor-preview" width="1" height="1"></canvas>
<strong>Colores disponibles en tu cuenta</strong><p>Desmarca los que no quieras usar: se convertirán al color seleccionado más cercano.</p><div class="editor-colors"></div>
<label>Formato para guardar<select class="editor-format"><option value="wplace">Plantilla .wplace</option><option value="png">Imagen .png</option><option value="jpg">Imagen .jpg (fondo blanco)</option></select></label>
<div class="editor-footer"><button class="editor-add" disabled>Agregar Plantilla</button><button class="editor-save" disabled>Guardar Plantilla</button></div>`;
    const state = {
      source: null,
      base: null,
      result: null,
      allowed: new Set(),
      ready: false,
      closed: false,
      busy: false,
      generation: 0
    };
    const find = name => content.querySelector('.editor-' + name),
      status = message => {
        find('status').textContent = message;
      };
    const enable = () => {
      const disabled = !state.ready || !state.source || state.busy;
      find('add').disabled = disabled;
      find('save').disabled = disabled;
    };
    this.openWorkspacePanel('Edición de plantilla', content, () => {
      state.closed = true;
      clearTimeout(state.timer);
      state.source = null;
      state.base = null;
      state.result = null;
    });
    const render = () => {
      clearTimeout(state.timer);
      if (!state.ready || !state.source || state.closed) return null;
      const width = Number(find('width').value),
        height = Number(find('height').value);
      if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 8192 || height > 8192 || width * height > 4194304) throw Error('Usa dimensiones de 1 a 8192 px y un máximo de 4 millones de píxeles.');
      if (!state.allowed.size) throw Error('Selecciona al menos un color.');
      const signature = width + 'x' + height + '|' + [...state.allowed].join(',');
      if (state.signature === signature && state.result) return state.result;
      if (!state.base || state.base.width !== width || state.base.height !== height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').imageSmoothingEnabled = false;
        canvas.getContext('2d').drawImage(state.source, 0, 0, width, height);
        canvas.naturalWidth = width;
        canvas.naturalHeight = height;
        canvas.src = canvas.toDataURL('image/png');
        state.base = new SharkPixelData(this.bot, canvas, width);
      }
      const base = state.base,
        indices = base.indices.slice(),
        mapping = new Map([[0, 0]]);
      for (const color of base.colors.keys()) {
        if (state.allowed.has(color)) {
          mapping.set(color, color);
          continue;
        }
        let best = Infinity,
          replacement = 1;
        for (const choice of state.allowed) {
          const distance = Ro(x[color], x[choice], 0);
          if (distance < best) {
            best = distance;
            replacement = choice;
          }
        }
        mapping.set(color, replacement);
      }
      const canvas = find('preview');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d'),
        data = ctx.createImageData(width, height);
      const rgbPalette = T.map(value => value.split(',').map(Number));
      for (let n = 0; n < indices.length; n++) {
        const color = mapping.get(indices[n]) ?? 0;
        indices[n] = color;
        if (!color) continue;
        const rgb = rgbPalette[color];
        data.data[n * 4] = rgb[0];
        data.data[n * 4 + 1] = rgb[1];
        data.data[n * 4 + 2] = rgb[2];
        data.data[n * 4 + 3] = 255;
      }
      ctx.putImageData(data, 0, 0);
      const snapshot = document.createElement('canvas');
      snapshot.width = width;
      snapshot.height = height;
      snapshot.getContext('2d').drawImage(canvas, 0, 0);
      snapshot.naturalWidth = width;
      snapshot.naturalHeight = height;
      snapshot.src = snapshot.toDataURL('image/png');
      state.result = new SharkPixelData(this.bot, snapshot, width, false, {
        width,
        height,
        palette: 1,
        ...sharkPackIndices(indices)
      });
      state.signature = signature;
      status(width + ' × ' + height + ' px · ' + state.result.colors.size + ' colores.');
      return state.result;
    };
    const schedule = () => {
      state.signature = null;
      clearTimeout(state.timer);
      state.timer = setTimeout(() => {
        try {
          render();
          enable();
        } catch (error) {
          status(error.message);
          find('add').disabled = find('save').disabled = true;
        }
      }, 250);
    };
    for (const axis of ['width', 'height']) find(axis).oninput = () => {
      if (!state.source) return;
      const value = Number(find(axis).value);
      if (!Number.isFinite(value) || value < 1) {
        find('add').disabled = find('save').disabled = true;
        return;
      }
      const ratio = state.source.naturalWidth / state.source.naturalHeight;
      find(axis === 'width' ? 'height' : 'width').value = Math.max(1, Math.round(axis === 'width' ? value / ratio : value * ratio));
      schedule();
    };
    find('file').onchange = async () => {
      const file = find('file').files?.[0];
      if (!file) return;
      const generation = ++state.generation;
      state.busy = true;
      state.source = null;
      state.base = null;
      state.result = null;
      enable();
      status('Cargando plantilla…');
      try {
        let source;
        {
          const image = new Image();
          let url,
            temporary = false;
          if (file.name.toLowerCase().endsWith('.wplace')) url = macrosharkParseWplace(await file.text()).url;else {
            url = URL.createObjectURL(file);
            temporary = true;
          }
          try {
            await new Promise((resolve, reject) => {
              image.onload = resolve;
              image.onerror = () => reject(Error('No se pudo leer esa imagen.'));
              image.src = url;
            });
            source = await this.optimizeImportedImage(image);
          } finally {
            if (temporary) URL.revokeObjectURL(url);
          }
        }
        if (state.closed || generation !== state.generation) return;
        // Canvas sources expose dimensions for proportional editing and indexed restoration.
        source.naturalWidth = source.naturalWidth || source.width;
        source.naturalHeight = source.naturalHeight || source.height;
        state.source = source;
        state.base = null;
        state.result = null;
        state.signature = null;
        find('width').value = source.naturalWidth;
        find('height').value = source.naturalHeight;
        find('width').disabled = find('height').disabled = false;
        render();
      } catch (error) {
        status(error.message);
      } finally {
        state.busy = false;
        if (!state.closed) enable();
        find('file').value = '';
      }
    };
    find('add').onclick = async () => {
      state.busy = true;
      enable();
      try {
        const pixels = render();
        if (!pixels) throw Error('Carga una plantilla primero.');
        await this.waitForMobileReady();
        await this.waitForStableViewportProjection();
        if (state.closed) return;
        const image = new SharkImage(this.bot, SharkMapPosition.fromScreenPosition(this.bot, this.defaultImageScreenPosition()), pixels);
        this.bot.images.push(image);
        H(this.bot, true);
        this.update();
        this.closeWorkspacePanel();
        try {
          await this.bot.readMap();
          this.bot.updateTasks();
        } catch (error) {
          this.status = 'Plantilla agregada. Falta actualizar el mapa: ' + error.message;
        }
      } catch (error) {
        status(error.message);
      } finally {
        state.busy = false;
        if (!state.closed) enable();
      }
    };
    find('save').onclick = async () => {
      try {
        const pixels = render();
        if (!pixels) throw Error('Carga una plantilla primero.');
        const format = find('format').value;
        let blob;
        if (format === 'wplace') blob = new Blob([JSON.stringify(macrosharkToWplace(pixels.canvas, 'MacroShark', null, 50), null, 2)], { type: 'application/json' });else {
          const canvas = document.createElement('canvas');
          canvas.width = pixels.width;
          canvas.height = pixels.height;
          const ctx = canvas.getContext('2d');
          if (format === 'jpg') {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(pixels.canvas, 0, 0);
          blob = await new Promise(resolve => canvas.toBlob(resolve, format === 'jpg' ? 'image/jpeg' : 'image/png', .95));
          if (!blob) throw Error('No se pudo generar el archivo.');
        }
        const anchor = document.createElement('a'),
          url = URL.createObjectURL(blob);
        anchor.href = url;
        anchor.download = 'macroshark-' + pixels.width + 'x' + pixels.height + '.' + format;
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        status('Archivo preparado para guardar.');
      } catch (error) {
        status(error.message);
      }
    };
    this.bot.updateColors().then(() => {
      if (state.closed) return;
      state.ready = true;
      for (let color = 1; color < T.length; color++) {
        if (this.bot.unavailableColors.has(color)) continue;
        state.allowed.add(color);
        const label = document.createElement('label');
        label.title = 'Color ' + color + ' · rgb(' + T[color] + ')';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = true;
        input.setAttribute('aria-label', label.title);
        const swatch = document.createElement('span');
        swatch.style.background = 'rgb(' + T[color] + ')';
        label.append(input, swatch);
        find('colors').append(label);
        input.onchange = () => {
          if (input.checked) state.allowed.add(color);else state.allowed.delete(color);
          schedule();
        };
      }
      status('Carga una imagen o plantilla .wplace.');
      if (state.source) render();
      enable();
    }).catch(error => {
      if (!state.closed) {
        status('No se pudieron consultar los colores: ' + error.message);
        enable();
      }
    });
  }
  syncPaintControls(available = this.availablePixels ?? 1) {
    this.availablePixels = Math.max(0, Math.floor(Number(available) || 0));
    this.$drawAndPaint.setAttribute('aria-pressed', String(!this.manualConfirmation));
    this.element.querySelector('.shark-auto-state').textContent = this.manualConfirmation ? 'Apagado' : 'Activado';
    const confirm = this.element.querySelector('.shark-confirm');
    confirm.classList.toggle('shark-running', !this.manualConfirmation);
    confirm.setAttribute('aria-pressed', String(!this.manualConfirmation));
    confirm.querySelector('span').textContent = this.manualConfirmation ? 'Confirmar pintado · apagado' : 'Confirmar pintado · activo';
    const speed = this.element.querySelector('.shark-speed');
    speed.querySelector('span').textContent = `Velocidad de pintado · x${this.paintSpeed || 1}`;
    speed.setAttribute('aria-label', `Velocidad de pintado x${this.paintSpeed || 1}. Cambiar a x${this.paintSpeed === 1 ? 2 : this.paintSpeed === 2 ? 4 : 1}`);
    const range = this.element.querySelector('.shark-pixel-range');
    range.max = Math.max(1, this.availablePixels);
    range.disabled = this.availablePixels === 0;
    range.value = this.pixelLimit ? Math.min(this.pixelLimit, this.availablePixels) : this.availablePixels;
    const cap = Math.max(0, Math.min(this.availablePixels, this.pixelLimit || Infinity));
    this.element.querySelector('.shark-random-hint').textContent = this.randomQuantity ? 'Cada tanda: entre ' + Math.ceil(cap * .9) + ' y ' + cap + ' píxeles (90–100 %).' : 'Desactivado: usa el límite elegido.';
    this.element.querySelector('.shark-pixel-value').textContent = this.pixelLimit ? String(Math.min(this.pixelLimit, this.availablePixels)) : 'Todos disponibles (' + this.availablePixels + ')';
  }
  selectedPixelLimit(available, cycleLimit = Infinity, randomize = this.randomQuantity) {
    const cap = Math.max(0, Math.min(Math.floor(Number(available) || 0), this.pixelLimit || Infinity, Math.floor(cycleLimit)));
    if (!randomize || cap === 0) return cap;
    const minimum = Math.max(1, Math.ceil(cap * .9));
    return minimum + Math.floor(Math.random() * (cap - minimum + 1));
  }
  installSafetyControls() {
    if (localStorage.getItem('macroshark:plus31-confirm-initialized') !== 'true') {
      localStorage.setItem('macroshark:manual-confirmation', 'false');
      localStorage.setItem('macroshark:plus31-confirm-initialized', 'true');
    }
    this.manualConfirmation = localStorage.getItem('macroshark:manual-confirmation') === 'true';
    this.paintSpeed = [1, 2, 4].includes(Number(localStorage.getItem('macroshark:paint-speed'))) ? Number(localStorage.getItem('macroshark:paint-speed')) : 1;
    this.pixelLimit = Math.max(0, Number(localStorage.getItem('macroshark:pixel-limit')) || 0);
    this.randomQuantity = localStorage.getItem('macroshark:random-quantity') === 'true';
    const random = this.element.querySelector('.shark-random-quantity');
    random.checked = this.randomQuantity;
    random.onchange = () => {
      this.randomQuantity = random.checked;
      localStorage.setItem('macroshark:random-quantity', String(this.randomQuantity));
      this.syncPaintControls();
    };
    const range = this.element.querySelector('.shark-pixel-range');
    range.oninput = () => {
      this.pixelLimit = Number(range.value) === Number(range.max) ? 0 : Number(range.value);
      localStorage.setItem('macroshark:pixel-limit', String(this.pixelLimit));
      this.syncPaintControls();
    };
    this.syncPaintControls();
    let paletteWasOpen = this.bot.isPaletteOpen();
    let resumeWhenOpen = false;
    const timer = setInterval(() => {
      const paletteOpen = this.bot.isPaletteOpen();
      if ((this.bot.drawingPixels || this.autoOverlayTickRunning) && !this.bot.openingPalette && !this.paintSubmissionRunning && !this.bot.pauseReason && !paletteOpen) this.bot.pauseAutomation('Barra de colores cerrada. Ábrela para actualizar el estado.');
      if (this.isChallengeBlockingPaint() && !this.bot.pauseReason) this.bot.pauseAutomation('Verificación detectada. Resuélvela y vuelve a abrir la barra de colores.');
      if (paletteOpen && !paletteWasOpen) resumeWhenOpen = true;
      if (!paletteOpen) resumeWhenOpen = false;
      paletteWasOpen = paletteOpen;
      if (resumeWhenOpen && paletteOpen && this.bot.pauseReason && !this.bot.resyncing && !this.isChallengeBlockingPaint() && Date.now() >= (this.bot.retryAt || 0)) {
        resumeWhenOpen = false;
        this.bot.resumeAutomation().catch(error => { this.status = error.message; });
      }
    }, 500);
    this.runOnDestroy.push(() => clearInterval(timer));
  }
  pixelPreparationDelay() {
    return Math.max(10, Math.floor(40 / (this.paintSpeed || 1)));
  }

  openImageExport(image) {
      const dialog=document.createElement('dialog');dialog.className='macroshark-modal shark-export-dialog';
      dialog.setAttribute('aria-label','Descargar imagen');
      dialog.innerHTML='<div class="macroshark-modal-head"><strong>Descargar imagen</strong><button type="button" aria-label="Cerrar descarga">×</button></div><form><label>Formato<select name="format"><option value="wplace">Plantilla WPlace (.wplace)</option><option value="png">Imagen PNG · con transparencia</option><option value="jpg">Imagen JPG · fondo blanco</option></select></label><p>La plantilla conserva su ubicación. PNG y JPG guardan la imagen.</p><output role="status"></output><button type="submit">Descargar</button></form>';
      dialog.querySelector('button').onclick=()=>dialog.close();
      dialog.addEventListener('close',()=>dialog.remove(),{once:true});
      dialog.querySelector('form').onsubmit=async event=>{
        event.preventDefault();const submit=event.currentTarget.querySelector('[type=submit]');submit.disabled=true;
        try {await macrosharkExportImage(image,event.currentTarget.elements.format.value);dialog.close();}
        catch(error){dialog.querySelector('output').textContent=error.message;}
        finally{submit.disabled=false;}
      };
      document.body.append(dialog);dialog.showModal();
    }

  installImagePaintActions(card,image) {
    card.sharkImage=image;
    macrosharkInstallImageCoordinates(this,card,image);
    const visual=document.createElement('div');visual.className='shark-detail-visual';
    const preview=card.querySelector('.preview'),controls=card.querySelector('.image-controls');
    card.insertBefore(visual,preview);
    const starts=document.createElement('div');starts.className='shark-paint-starts';
    starts.innerHTML='<button type="button" class="shark-card-draw"><i class="fa-solid fa-pen-nib" aria-hidden="true"></i><span>Empezar a pintar</span></button><button type="button" class="shark-card-auto"><i class="fa-solid fa-play" aria-hidden="true"></i><span>Iniciar AutoDraw</span></button>';
    visual.append(preview,controls,starts);
    starts.querySelector('.shark-card-draw').onclick=()=>{
      if(this.drawActionRunning){this.bot.cancelDrawing=true;return;}
      if(this.autoOverlayIntervalId||this.autoOverlayTickRunning)return;
      this.selectPaintImage(image,false);
      if(this.getPaintImage()===image)this.$draw.click();
    };
    starts.querySelector('.shark-card-auto').onclick=()=>{
      if(this.autoOverlayIntervalId||this.autoOverlayTickRunning){this.stopAutoOverlay();return;}
      if(this.drawActionRunning)return;
      this.selectPaintImage(image,false);
      if(this.getPaintImage()!==image)return;
      if(!image.autoDrawConfig){this.autoConfigImage=image;this.openAutoOverlayModal();this.showNativeNotice('Configura AutoDraw y guarda los ajustes antes de iniciarlo.');return;}
      this.$autoOverlayStart.click();
    };
  }
}
var al = 2;
function ll() {
  let o = globalThis;
  if (!o.__macrosharkUnhandledRejectionPatched) o.__macrosharkUnhandledRejectionPatched = !0, o.addEventListener("unhandledrejection", a => {
    let l = a.reason,
      i = typeof l === "object" && l !== null && "name" in l && typeof l.name === "string" ? l.name : "",
      r = l instanceof Error ? l.message : l;
    if (i === "NotAllowedError" && r.includes("play() failed")) a.preventDefault();
  });
  if (!o.__macrosharkMediaPlayPatched && "HTMLMediaElement" in o) {
    o.__macrosharkMediaPlayPatched = !0;
    let a = Reflect.get(o.HTMLMediaElement.prototype, "play");
    o.HTMLMediaElement.prototype.play = function () {
      return Reflect.apply(a, this, []).catch(r => {
        let s = r instanceof Error ? r.message : r;
        if ((typeof r === "object" && r !== null && "name" in r && typeof r.name === "string" ? r.name : "") === "NotAllowedError" && s.includes("play() failed")) return;
        throw r;
      });
    };
  }
}
var fa = "[MACROSHARK]",
  ta = "macroshark-access-locked";
// Saved templates stay as metadata until the user requests their full pixels.
class SharkDeferredImage {
  isDeferred=true;
  constructor(bot,raw){
    this.bot=bot;this.raw=raw;this.position=SharkMapPosition.fromJSON(bot,raw.position);
    for(const key of ['strategy','opacity','drawTransparentPixels','drawColorsInOrder','skipUnavailableColors','colors','lock','displayName','nativeOverlayId','nativeOverlayRevision','nativeImageSignature','paintSpeed','confirmPaint','autoDrawConfig','paintSelected'])this[key]=raw[key];
    this.colors=raw.colors||[];this.paintSpeed=raw.paintSpeed||1;this.confirmPaint=raw.confirmPaint!==false;
    this.pixels={width:raw.pixels?.width||raw.pixels?.indexed?.width||0,height:raw.pixels?.height||raw.pixels?.indexed?.height||0,image:{src:raw.galleryPreview||''}};
    this.tasks={length:0};this.element=document.createElement('div');this.$previewDialog={open:false};
  }
  toJSON(){return {...this.raw,position:this.position.toJSON(),strategy:this.strategy,opacity:this.opacity,drawTransparentPixels:this.drawTransparentPixels,drawColorsInOrder:this.drawColorsInOrder,skipUnavailableColors:this.skipUnavailableColors,colors:this.colors,lock:this.lock,displayName:this.displayName||'',nativeOverlayId:this.nativeOverlayId,nativeOverlayRevision:this.nativeOverlayRevision,nativeImageSignature:this.nativeImageSignature,paintSpeed:this.paintSpeed,confirmPaint:this.confirmPaint,autoDrawConfig:this.autoDrawConfig,paintSelected:!!this.paintSelected};}
  update(){} updatePlacement(){} updateTasks(){} updateColors(){} applyLocale(){}
  openColorPanel(){void this.bot.widget.loadGalleryImage(this,true).then(image=>image?.openColorPanel());}
  destroy(){this.removed=true;const index=this.bot.images.indexOf(this);if(index>=0)this.bot.images.splice(index,1);this.bot.widget.update();H(this.bot);}
}
function macrosharkGalleryPreview(image){
  if(image.galleryPreview)return image.galleryPreview;
  const canvas=document.createElement('canvas'),scale=Math.min(1,160/image.pixels.width,100/image.pixels.height);
  canvas.width=Math.max(1,Math.round(image.pixels.width*scale));canvas.height=Math.max(1,Math.round(image.pixels.height*scale));
  const context=canvas.getContext('2d');context.imageSmoothingEnabled=false;context.drawImage(image.pixels.canvas,0,0,canvas.width,canvas.height);
  return image.galleryPreview=canvas.toDataURL('image/png');
}
// Only visible gallery cards request a tiny preview; no pixel analysis or overlays.
function macrosharkValidThumbnail(value){return typeof value==='string'&&value.length<100000&&/^data:image\/(?:png|webp);base64,[A-Za-z0-9+/=]+$/.test(value);}
async function macrosharkMakeThumbnail(raw){
  const source=macrosharkLocalImageUrl(raw.pixels?.url);
  const blob=await (await fetch(source,{credentials:'omit'})).blob();
  const width=Number(raw.pixels?.width||raw.pixels?.indexed?.width),height=Number(raw.pixels?.height||raw.pixels?.indexed?.height);
  let bitmap,image,canvas;
  try{
    // Resize during decoding where supported; fallback keeps only one decoded image.
    if(typeof createImageBitmap==='function'&&width>0&&height>0){
      const scale=Math.min(1,96/width,96/height);
      try{bitmap=await createImageBitmap(blob,{resizeWidth:Math.max(1,Math.round(width*scale)),resizeHeight:Math.max(1,Math.round(height*scale)),resizeQuality:'low'});}catch{}
    }
    if(!bitmap){
      image=new Image();
      await new Promise((resolve,reject)=>{
        const timeout=setTimeout(()=>{image.src='';reject(new Error('Tiempo de miniatura agotado.'));},10000);
        image.onload=()=>{clearTimeout(timeout);resolve();};image.onerror=()=>{clearTimeout(timeout);reject(new Error('Miniatura no disponible.'));};image.src=source;
      });
    }
    const input=bitmap||image,w=input.width||input.naturalWidth,h=input.height||input.naturalHeight;
    if(!w||!h)throw new Error('Imagen vacía.');
    const scale=Math.min(1,96/w,96/h);
    canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(w*scale));canvas.height=Math.max(1,Math.round(h*scale));
    const context=canvas.getContext('2d');context.imageSmoothingEnabled=false;context.drawImage(input,0,0,canvas.width,canvas.height);
    const preview=canvas.toDataURL('image/webp',.3);
    if(!macrosharkValidThumbnail(preview))throw new Error('Miniatura demasiado grande.');
    return preview;
  }finally{bitmap?.close();if(image){image.onload=image.onerror=null;image.src='';}if(canvas)canvas.width=canvas.height=1;}
}
function macrosharkThumbnailState(widget){
  if(widget.galleryThumbnailState)return widget.galleryThumbnailState;
  const state={queue:new Map(),failed:new WeakSet(),running:false,disposed:false,timer:0,saveTimer:0};
  const busy=()=>state.disposed||!widget.open||!!widget.selectedGalleryImage||document.hidden||widget.loadingGalleryImage||widget.drawActionRunning||widget.autoOverlayTickRunning;
  const schedule=()=>{if(state.timer||state.running||busy()||!state.queue.size)return;state.timer=setTimeout(run,80);};
  const save=()=>{clearTimeout(state.saveTimer);state.saveTimer=setTimeout(()=>{state.saveTimer=0;if(!state.disposed)H(widget.bot);},1200);};
  const run=async()=>{
    state.timer=0;if(busy())return;
    const next=state.queue.entries().next().value;if(!next)return;
    const [image,card]=next;state.queue.delete(image);
    const bounds=card.getBoundingClientRect(),area=widget.$images.getBoundingClientRect();
    if(!image.isDeferred||!widget.bot.images.includes(image)||!card.isConnected||card.hidden||bounds.bottom<=Math.max(0,area.top)||bounds.top>=Math.min(innerHeight,area.bottom)){schedule();return;}
    state.running=true;
    try{
      const preview=macrosharkValidThumbnail(image.raw.galleryPreview)?image.raw.galleryPreview:await macrosharkMakeThumbnail(image.raw);
      if(state.disposed||!image.isDeferred||!widget.bot.images.includes(image))return;
      image.raw.galleryPreview=preview;image.pixels.image.src=preview;save();
      // A render or selection may have replaced the card while the bitmap decoded.
      for(const current of widget.$images.querySelectorAll('.shark-deferred-card'))if(current.sharkImage===image){
        const img=document.createElement('img');img.alt='Miniatura de la plantilla';img.src=preview;img.decoding='async';
        current.querySelector('.preview').replaceChildren(img);
      }
    }catch{state.failed.add(image);}
    finally{state.running=false;schedule();}
  };
  state.observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      const card=entry.target,image=card.sharkImage;
      if(!entry.isIntersecting){state.queue.delete(image);continue;}
      if(image?.isDeferred&&!macrosharkValidThumbnail(image.raw.galleryPreview)&&!state.failed.has(image))state.queue.set(image,card);
    }
    schedule();
  },{threshold:.01});
  state.schedule=schedule;
  const wake=()=>schedule();document.addEventListener('visibilitychange',wake);
  widget.runOnDestroy.push(()=>{state.disposed=true;state.observer.disconnect();clearTimeout(state.timer);clearTimeout(state.saveTimer);state.queue.clear();document.removeEventListener('visibilitychange',wake);});
  return widget.galleryThumbnailState=state;
}
function macrosharkObserveThumbnails(widget){
  const state=macrosharkThumbnailState(widget);state.observer.disconnect();state.queue.clear();
  for(const card of widget.$images.querySelectorAll('.shark-deferred-card'))if(!card.hidden)state.observer.observe(card);
  state.schedule();
}

function macrosharkRenderDeferredCard(widget,image,index,fragment){
  const card=document.createElement('div');card.className='image shark-gallery-card shark-deferred-card';card.sharkImage=image;
  card.classList.toggle('shark-paint-target',!!image.paintSelected);
  const loading=widget.loadingGalleryImage===image;
  card.setAttribute('aria-busy',String(loading));
  card.innerHTML='<button class="preview" type="button"><span class="shark-template-placeholder" aria-hidden="true">▧</span></button><div class="shark-card-heading"><strong class="shark-card-name"></strong><span class="shark-card-size"></span></div><p class="shark-template-state" role="status"></p>';
  card.querySelector('.shark-card-name').textContent=image.displayName||'Plantilla '+(index+1);
  card.querySelector('.shark-card-size').textContent=image.pixels.width&&image.pixels.height?image.pixels.width+' × '+image.pixels.height:'';
  const button=card.querySelector('.preview');button.title='Cargar y seleccionar esta plantilla';button.disabled=!!widget.loadingGalleryImage;
  const thumbnail=image.raw.galleryPreview;
  if(macrosharkValidThumbnail(thumbnail)){const img=document.createElement('img');img.alt='Miniatura de la plantilla';img.loading='lazy';img.src=thumbnail;button.replaceChildren(img);}
  const state=card.querySelector('.shark-template-state');
  state.textContent=loading?'Cargando plantilla…':image.loadError?'No se pudo cargar. Toca para reintentar.':'Toca para cargar';
  if(loading)state.classList.add('shark-template-loading');
  button.onclick=()=>void widget.loadGalleryImage(image,true);
  fragment.append(card);
}
async function macrosharkLoadGalleryImage(widget,image,detail=true){
  if(!image)return null;
  if(!image.isDeferred)return image;
  if(widget.loadingGalleryImage)return widget.loadingGalleryImage===image?widget.galleryLoadPromise:null;
  if(widget.drawActionRunning||widget.autoOverlayTickRunning){widget.showNativeNotice('Detén el pintado antes de cambiar de imagen.');return null;}
  if(widget.autoOverlayIntervalId)widget.stopAutoOverlay();
  widget.loadingGalleryImage=image;image.loadError=null;widget.selectedGalleryImage=null;widget.open=true;widget.renderImagesList();
  widget.galleryLoadPromise=(async()=>{
    let loaded;
    try{
      // Paint the waiting state before decoding or analysing the selected bitmap.
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      loaded=await SharkImage.fromJSON(widget.bot,image.toJSON());
      const index=widget.bot.images.indexOf(image);
      if(index<0)throw new Error('La plantilla ya no está en la lista.');
      widget.bot.images[index]=loaded;
      loaded.galleryPreview=image.raw.galleryPreview||'';
      for(const other of [...widget.bot.images]){
        if(other===loaded||other.isDeferred)continue;
        const at=widget.bot.images.indexOf(other),raw=other.toJSON();raw.galleryPreview=macrosharkGalleryPreview(other);
        other.destroy();widget.bot.images.splice(at,0,new SharkDeferredImage(widget.bot,raw));
        other.pixels.image.src='';other.pixels.canvas.width=other.pixels.canvas.height=1;
      }
      widget.bot.clearReferenceTiles();
      widget.selectedGalleryImage=detail?loaded:null;widget.selectPaintImage(loaded,false);
      loaded.update();
      await widget.bot.readMap();widget.bot.updateTasks();
      H(widget.bot,true);
      return loaded;
    }catch(error){
      if(loaded){const index=widget.bot.images.indexOf(loaded);if(index>=0){loaded.destroy();widget.bot.images.splice(index,0,image);}}
      widget.selectedGalleryImage=null;image.loadError=error.message;
      widget.showNativeNotice('No se pudo cargar la plantilla: '+error.message);
      return null;
    }finally{
      widget.loadingGalleryImage=null;widget.galleryLoadPromise=null;widget.renderImagesList();widget.syncActionButtons();
    }
  })();
  return widget.galleryLoadPromise;
}

class SharkBot {
  unavailableColors = new Set();
  mapsCache = new Map();
  stagedPixels = new Map();
  me;
  $stars = [];
  strategy = "SEQUENTIAL";
  images = [];
  _widget;
  get widget() {
    if (!this._widget) throw Error("Widget is not initialized yet");
    return this._widget;
  }
  markerPixelPositionResolvers = [];
  lastColor;
  controlAccessAllowed = !1;
  controlAccessHardDenied = !1;
  lastControlAccessFailureReason;
  log(o, a) {
    if (a === void 0) console.log(`${fa} ${o}`);else console.log(`${fa} ${o}`, a);
  }
  getUserscriptRuntimeStatus() {
    let o = this.getUserscriptInfo(),
      a = this.getRuntimeInfoString(o, ["scriptHandler", "scriptHandlerName", "handler"]),
      l = this.getRuntimeInfoString(o, ["version", "scriptHandlerVersion"]);
    return {
      ok: true,
      handler: a || "unknown",
      version: l || "unknown",
      hasTampermonkey: /tampermonkey/i.test(a),
      hasCookieApi: false,
      localPrivacyBuild: true
    };
  }
  isMobileRuntime() {
    let o = navigator.userAgent.toLowerCase();
    return /android|iphone|ipad|ipod|mobile/.test(o) || navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) <= 1024;
  }
  getUserscriptInfo() {
    let o = this.getPageWindow(),
      a = globalThis,
      l = o,
      i = a.GM_info ?? l.GM_info;
    return i && typeof i === "object" ? i : {};
  }
  getRuntimeInfoString(o, a) {
    for (let l of a) {
      let i = o[l];
      if (typeof i === "string" && i.trim()) return i.trim();
      if (typeof i === "number") return String(i);
    }
    return "";
  }
  constructor() {
    this.log("Boot sequence started"), document.body?.classList.add(ta);
    let o = this.getUserscriptRuntimeStatus();
    this.log("Userscript runtime detected (Beta restriction removed)", o);
    let a = Oo();
    if (this.log("Save loaded", {
      hasSave: Boolean(a),
      imageCount: a?.images.length ?? 0,
      strategy: a?.strategy
    }), a) {
      for (let r = 0; r < a.images.length; r++) {
        let s = a.images[r];
        lo({
          x: s.position[0] - 1000,
          y: s.position[1] - 1000
        }), lo({
          x: s.position[0] + 1000,
          y: s.position[1] + 1000
        });
      }
      this.strategy = "SEQUENTIAL";
    }
    this.registerFetchInterceptor();
    this.log("Fetch interceptor registered");
    let i = document.createElement("style");
    i.textContent = SHARK_STYLES.replace("FAKE_FAVORITE_LOCATIONS", O.length.toString()) + "\n/* Self-contained MacroShark SVG icons: no fonts or CDN. */\n.fa-solid{display:inline-block;width:1em;heigh\
t:1em;min-width:1em;vertical-align:-.125em;background-color:currentColor;mask:var(--macroshark-icon) center/co\
ntain no-repeat;-webkit-mask:var(--macroshark-icon) center/contain no-repeat;font-style:normal}.fa-solid::befo\
re{content:none!important}\n.fa-palette{--macroshark-icon:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A\
%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22black%22%\
20stroke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M\
12%203a9%209%200%201%200%200%2018h2a2%202%200%200%200%201-4c-2-1-1-3%201-3h2c5%200%203-11-6-11Z%20M7%209h.01%2\
0M10%206h.01%20M15%206h.01%20M18%209h.01%22%2F%3E%3C%2Fsvg%3E\")}\n.fa-wand-magic-sparkles{--macroshark-icon:u\
rl(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%\
2024%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%2\
0stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m4%2020%2012-12%203%203L7%2023Z%20M14%203v4%20M12%205h4%20M2\
1%202v4%20M19%204h4%20M21%2015v4%20M19%2017h4%22%2F%3E%3C%2Fsvg%3E\")}\n.fa-download{--macroshark-icon:url(\"d\
ata:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%2\
2%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%20strok\
e-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M12%203v12%20m-5-5%205%205%205-5%20M4%2016v5h16v-5%22%2F%3E%3C%2Fs\
vg%3E\")}\n.fa-lock{--macroshark-icon:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2\
000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%22\
1.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%2010h12v11H6Z%20M8\
%2010V6a4%204%200%200%201%208%200v4%20M12%2014v3%22%2F%3E%3C%2Fsvg%3E\")}\n.fa-lock-open{--macroshark-icon:url\
(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%20\
24%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%20s\
troke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%2010h12v11H6Z%20M8%2010V6a4%204%200%200%201%208%200%20M12%2\
014v3%22%2F%3E%3C%2Fsvg%3E\")}\n.fa-trash{--macroshark-icon:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%\
3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22black%2\
2%20stroke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%2\
2M3%206h18%20M9%206V3h6v3%20M6%206l1%2015h10l1-15%20M10%2010v7%20M14%2010v7%22%2F%3E%3C%2Fsvg%3E\")}\n.fa-xmar\
k{--macroshark-icon:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20vie\
wBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.8%22%20stroke-li\
necap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m5%205%2014%2014%20M19%205%205%2019%22%\
2F%3E%3C%2Fsvg%3E\")}\n.fa-sliders{--macroshark-icon:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2\
Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22black%22%20str\
oke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M3%206\
h5%20m4%200h9%20M3%2012h11%20m4%200h3%20M3%2018h3%20m4%200h11%20M8%203v6%20M14%209v6%20M6%2015v6%22%2F%3E%3C%2\
Fsvg%3E\")}\n.fa-compress{--macroshark-icon:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.o\
rg%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width\
%3D%221.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M3%208h5V3%20M2\
1%208h-5V3%20M3%2016h5v5%20M21%2016h-5v5%22%2F%3E%3C%2Fsvg%3E\")}\n.fa-images{--macroshark-icon:url(\"data:ima\
ge/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fil\
l%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%20stroke-linej\
oin%3D%22round%22%3E%3Cpath%20d%3D%22M7%203h14v14%20M3%207h14v14H3Z%20m1%2010%204-4%204%205%202-2%203%203%20M7\
%2011h.01%22%2F%3E%3C%2Fsvg%3E\")}\n.fa-image{--macroshark-icon:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22h\
ttp%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22bla\
ck%22%20stroke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%\
3D%22M3%203h18v18H3Z%20m1%2014%205-6%205%207%203-3%204%205%20M8%207h.01%22%2F%3E%3C%2Fsvg%3E\")}\n.fa-chevron-\
down{--macroshark-icon:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20\
viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.8%22%20stroke\
-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m5%209%207%207%207-7%22%2F%3E%3C%2Fs\
vg%3E\")}\n.fa-pen-nib{--macroshark-icon:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%\
2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D\
%221.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m3%2021%204-13%209\
-5%205%205-5%209Z%20M3%2021l9-9%20M10%2010l4%204%22%2F%3E%3C%2Fsvg%3E\")}\n.fa-camera{--macroshark-icon:url(\"\
data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%\
22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%20stro\
ke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M3%207h5l2-3h4l2%203h5v14H3Z%20M16%2014a4%204%200%201%201-8%200%2\
04%204%200%200%201%208%200%22%2F%3E%3C%2Fsvg%3E\")}\n.fa-layer-group{--macroshark-icon:url(\"data:image/svg+xm\
l,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22no\
ne%22%20stroke%3D%22black%22%20stroke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22\
round%22%3E%3Cpath%20d%3D%22m2%207%2010-5%2010%205-10%205Z%20M2%2012l10%205%2010-5%20M2%2017l10%205%2010-5%22%\
2F%3E%3C%2Fsvg%3E\")}\n.fa-clock-rotate-left{--macroshark-icon:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22ht\
tp%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22blac\
k%22%20stroke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3\
D%22M3%2010a9%209%200%201%201%201%208%20M3%203v7h7%20M12%207v6l4%202%22%2F%3E%3C%2Fsvg%3E\")}\n.fa-play{--macr\
oshark-icon:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%\
220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.8%22%20stroke-linecap%3D\
%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%203%2015%209-15%209Z%22%2F%3E%3C%2Fsvg%3E\")\
}\n.fa-stop{--macroshark-icon:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsv\
g%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.8%22%2\
0stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M5%205h14v14H5Z%22%2F%3E%3C%2\
Fsvg%3E\")}\n.fa-screwdriver-wrench{--macroshark-icon:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%\
2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22black%22%20st\
roke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m4%20\
3%2017%2017-2%202L2%205Z%20M17%202l-3%204%204%204%204-3%20M13%2011%203%2021l-2-2L11%209%22%2F%3E%3C%2Fsvg%3E\"\
)}\n.fa-chart-line{--macroshark-icon:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F20\
00%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221\
.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M3%203v18h18%20M6%2015\
l5-6%204%203%206-8%22%2F%3E%3C%2Fsvg%3E\")}\n.fa-location-crosshairs{--macroshark-icon:url(\"data:image/svg+xm\
l,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22no\
ne%22%20stroke%3D%22black%22%20stroke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22\
round%22%3E%3Cpath%20d%3D%22M12%201v5%20M12%2018v5%20M1%2012h5%20M18%2012h5%20M20%2012a8%208%200%201%201-16%20\
0%208%208%200%200%201%2016%200%20M12%2012h.01%22%2F%3E%3C%2Fsvg%3E\")}\n.fa-arrow-up{--macroshark-icon:url(\"d\
ata:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%2\
2%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%20strok\
e-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M12%2021V3%20m-7%207%207-7%207%207%22%2F%3E%3C%2Fsvg%3E\")}\n.fa-a\
rrow-down{--macroshark-icon:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%\
22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.8%22%20s\
troke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M12%203v18%20m-7-7%207%207%207-\
7%22%2F%3E%3C%2Fsvg%3E\")}\n.fa-circle-xmark{--macroshark-icon:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22ht\
tp%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22blac\
k%22%20stroke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3\
D%22M22%2012a10%2010%200%201%201-20%200%2010%2010%200%200%201%2020%200%20M8%208l8%208%20M16%208l-8%208%22%2F%3\
E%3C%2Fsvg%3E\")}\n.fa-circle-check{--macroshark-icon:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%\
2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22black%22%20st\
roke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M22%2\
012a10%2010%200%201%201-20%200%2010%2010%200%200%201%2020%200%20m-15%200%203%203%207-7%22%2F%3E%3C%2Fsvg%3E\")\
}\n.fa-table-cells-large{--macroshark-icon:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.or\
g%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%\
3D%221.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M3%203h18v18H3Z%\
20M12%203v18%20M3%2012h18%22%2F%3E%3C%2Fsvg%3E\")}\n.fa-keyboard{--macroshark-icon:url(\"data:image/svg+xml,%3\
Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%2\
2%20stroke%3D%22black%22%20stroke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22roun\
d%22%3E%3Cpath%20d%3D%22M2%205h20v14H2Z%20M5%209h1%20m3%200h1%20m3%200h1%20m3%200h1%20M5%2012h1%20m3%200h1%20m\
3%200h1%20m3%200h1%20M7%2016h10%22%2F%3E%3C%2Fsvg%3E\")}\n.fa-eye{--macroshark-icon:url(\"data:image/svg+xml,%\
3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%\
22%20stroke%3D%22black%22%20stroke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22rou\
nd%22%3E%3Cpath%20d%3D%22M1%2012s4-8%2011-8%2011%208%2011%208-4%208-11%208S1%2012%201%2012%20M16%2012a4%204%20\
0%201%201-8%200%204%204%200%200%201%208%200%22%2F%3E%3C%2Fsvg%3E\")}\n.fa-eye-slash{--macroshark-icon:url(\"da\
ta:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22\
%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%20stroke\
-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M3%203l18%2018%20M1%2012s4-8%2011-8%2011%208%2011%208-4%208-11%208S\
1%2012%201%2012%22%2F%3E%3C%2Fsvg%3E\")}\n.fa-forward{--macroshark-icon:url(\"data:image/svg+xml,%3Csvg%20xmln\
s%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%\
3D%22black%22%20stroke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cp\
ath%20d%3D%22m3%204%209%208-9%208Z%20m9%200%209%208-9%208Z%22%2F%3E%3C%2Fsvg%3E\")}\n.fa-backward{--macroshark\
-icon:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%20\
0%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.8%22%20stroke-linecap%3D%22rou\
nd%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m21%204-9%208%209%208Z%20m-9%200-9%208%209%208Z%22%2F\
%3E%3C%2Fsvg%3E\")}\n.fa-hourglass-half{--macroshark-icon:url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A\
%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22black%22%\
20stroke-width%3D%221.8%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M\
5%202h14%20M5%2022h14%20M7%202v4l10%2012v4%20M17%202v4L7%2018v4%22%2F%3E%3C%2Fsvg%3E\")}\n.wtopbar .lock.locke\
d .icon-lock-closed{display:inline-block}\n", (document.head || document.documentElement)?.append(i), this.log("Styles injected", {
      fakeFavoriteLocations: O.length
    }), this.mobileInitialization = (async () => {
      // Keep the map interceptor active at document-start, but wait for the UI DOM.
      if (!document.body) await new Promise(resolve => document.addEventListener("DOMContentLoaded", resolve, {
        once: true
      }));
      if (!i.isConnected) document.head.append(i);
      if (this.log("Widget initialization flow started"), false) return;
      await this.ensureControlAccess(), document.body.classList.remove(ta), this._widget = new SharkWidget(this), globalThis.macrosharkPendingUpdate && this.widget.requireUpdate(globalThis.macrosharkPendingUpdate), await this.widget.run(f("taskInitializing"), async () => {
        let s = await this.waitForElement("canvas", ".maplibregl-canvas-container");
        if (new MutationObserver(c => {
          for (let g = 0; g < c.length; g++) if (c[g].removedNodes.length !== 0) {
            this.updateStars();
            break;
          }
          this.updateImages();
        }).observe(s, {
          attributes: !0,
          childList: !0,
          subtree: !0
        }), this.updateStars(), this.startMobileMapTracking(), this.log("Stars updated after boot", {
          stars: this.$stars.length
        }), a) for (let c = 0; c < a.images.length; c++) {
          let g = new SharkDeferredImage(this, a.images[c]);
          this.images.push(g), g.update();
        }
        const savedSelection = this.images.find(image => image.paintSelected);
        if(savedSelection){this.widget.paintSpeed=savedSelection.paintSpeed;this.widget.manualConfirmation=savedSelection.confirmPaint===false;this.widget.autoOverlayConfig=savedSelection.autoDrawConfig||null;}
        this.log("Saved images restored", {
          images: this.images.length
        });
        this.widget.update();
        this.widget.setDisabled("draw", !1);
        this.widget.setDisabled("draw-and-paint", !1);
        this.widget.setDisabled("add-image", !1);
        this.widget.setDisabled("capture-template", !1);
        this.mobileReady = true;
        globalThis.macrosharkPendingUpdate && this.widget.requireUpdate(globalThis.macrosharkPendingUpdate);
        this.log("Initialization completed; controls enabled");
      });
    })().catch(error => {
      this.mobileInitializationError = error;
      console.error('[MacroShark Plus] Initialization failed', error);
      if (this._widget) this.widget.status = 'Error al preparar el mapa: ' + (error?.message ?? 'error desconocido');
      else macrosharkStartupError(error);
    });
  }
  async ensureControlAccess() {
      // Retire local keys from the removed account-control service.
      try { sessionStorage.removeItem(Y); localStorage.removeItem(Y); localStorage.removeItem(Co); localStorage.removeItem(Go); } catch {}
    }
  isControlAccessAllowed() {
    return true;
  }
  ensureFeatureAccess() {
    return true;
  }
  getPageWindow() {
    return globalThis.unsafeWindow ?? globalThis;
  }
  
  
  getTotalPendingTasks() {
    return this._widget?.getPaintImage()?.tasks.length || 0;
  }
  async draw(o = {}) {
    if (this._widget?.updateRequired) return Promise.reject(new Error('Actualiza MacroShark antes de pintar.'));
    if (!this.ensureFeatureAccess("draw")) return Promise.resolve();
    if(this.widget.loadingGalleryImage)return;
    if(this.widget.getPaintImage()?.isDeferred&&!await this.widget.loadGalleryImage(this.widget.getPaintImage(),false))return;
    const paintImage = this.widget.getPaintImage();
    if (!paintImage) { this.widget.showPaintSelectionPrompt(); return Promise.resolve(); }
    const paintImages = [paintImage];
    this.log("Draw requested", {
      strategy: this.strategy,
      images: this.images.length
    });
    this.widget.setDisabled("draw", !0);
    this.widget.setDisabled("draw-and-paint", !0);
    this.widget.status = "";
    let a = document.querySelector(".maplibregl-canvas"),
      l = i => {
        if (!i.shiftKey) i.stopPropagation();
      };
    return this.widget.run(f("taskDrawing"), async () => {
      await this.widget.run(f("taskInitializingDraw"), async () => {
        await this.openColors();
        await this.updateColors();

        await this.readMap();
      }), globalThis.addEventListener("mousemove", l, !0), a.addEventListener("wheel", l, !0), this.updateTasks();
      let i = await this.request("https://backend.wplace.live/me", {
          credentials: "include"
        }).then(p => p.json()),
        r = this.widget.selectedPixelLimit(i.charges.count);
      this.widget.syncPaintControls(i.charges.count);
      this.drawingPixels = true;
      this.assertPaletteOpen();
      this.log("Charges fetched", {
        charges: r
      });
      let c = 0;
      for (let p = 0; p < paintImages.length; p++) c += paintImages[p].tasks.length;
      switch (this.log("Tasks prepared", {
        tasks: c
      }), this.strategy) {
        case "ALL":
          {
            while (r > 0) {
              let p = !0;
              for (let d = 0; d < paintImages.length && r > 0; d++) {
                let t = paintImages[d].tasks.shift();
                if (!t) continue;
                (await this.drawTask(t)) && r--, await Q(this.widget.pixelPreparationDelay()), p = !1;
              }
              if (p) break;
            }
            break;
          }
        case "PERCENTAGE":
          {
            for (let p = 0; p < c && r > 0; p++) {
              let d = 1,
                t;
              for (let w = 0; w < paintImages.length; w++) {
                let n = paintImages[w],
                  b = 1 - n.tasks.length / (n.pixels.pixels.length * n.pixels.pixels[0].length);
                if (b < d) d = b, t = n;
              }
              if (!t) break;
              if (await this.drawTask(t.tasks.shift())) r--;
              await Q(this.widget.pixelPreparationDelay());
            }
            break;
          }
        case "SEQUENTIAL":
          for (let p = 0; p < paintImages.length; p++) {
            let d = paintImages[p];
            while (r > 0) {
              const t = d.tasks.shift();
              if (!t) break;
              if (await this.drawTask(t)) r--;
              await Q(this.widget.pixelPreparationDelay());
            }
          }
      }
      if (this.widget.update(), o.refreshMapAfterDraw !== !1) await this.readMap(), this.updateTasks();
      let g = this.getTotalPendingTasks();
      this.log("Draw flow finished", {
        remainingCharges: r,
        remainingTasks: g
      });
    }, () => {
      this.drawingPixels = false;
      globalThis.removeEventListener("mousemove", l, !0), a?.removeEventListener("wheel", l, !0), this.widget.setDisabled("draw", !1), this.widget.setDisabled("draw-and-paint", !1);
    });
  }
  refreshMapAfterPaint() {
    return this.widget.run(f("taskReadingMap"), async () => {
      await this.readMap();
      this.updateTasks();
      this.widget.update();
    });
  }
  toJSON() {
    return {
      version: al,
      images: this.images.map(o => o.toJSON()),
      strategy: this.strategy
    };
  }
  async updateColors() {
    // Read account entitlements; child nodes in swatches can be counters or icons.
    const response = await this.request('https://backend.wplace.live/me', {
      credentials: 'include',
      cache: 'no-store',
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) throw new Error('No se pudo consultar la cuenta (' + response.status + ').');
    const account = await response.json();
    if (!account || typeof account !== 'object' || Array.isArray(account)) throw new Error('Respuesta de cuenta inválida.');
    this.widget.syncPaintControls(account.charges?.count);
    const bitmap = account.extraColorsBitmap ?? 0;
    if (!Number.isInteger(bitmap) || bitmap < -2147483648 || bitmap > 4294967295) throw new Error('No se pudieron interpretar los colores desbloqueados.');
    const unavailable = new Set();
    for (let color = 32; color < x.length; color++) {
      if (color >= 64 || !(bitmap & 1 << color - 32)) unavailable.add(color);
    }
    await this.openColors();
    this.unavailableColors = unavailable;
    this.updateImageColors();
    this.log('Account colors refreshed', {
      unavailableColors: unavailable.size
    });
  }
  async moveMap(offset) {
    if(this.mapMovePending)return false;
    this.mapMovePending=true;
    try{return await this.dragMapStep(offset);}finally{this.mapMovePending=false;}
  }
  async dragMapStep(offset) {
    const canvas=document.querySelector('.maplibregl-canvas');
    if(!canvas||![offset.x,offset.y].every(Number.isFinite))throw new Error('El mapa todavía no está disponible.');
    const distance=Math.hypot(offset.x,offset.y);
    if(!distance)return true;
    if(distance<4){
      const extra={x:offset.x/distance*8,y:offset.y/distance*8};
      await this.dragMapStep(extra);
      return this.dragMapStep({x:offset.x-extra.x,y:offset.y-extra.y});
    }
    const r=canvas.getBoundingClientRect(),start={x:r.left+r.width*.5,y:r.top+r.height*.5};
    const frame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
    const emit=(type,x,y,buttons)=>{
      const event=new MouseEvent(type,{bubbles:true,cancelable:true,view:window,clientX:x,clientY:y,button:0,buttons});
      Object.defineProperties(event,{clientX:{value:x},clientY:{value:y}});
      return (type==='mousemove'?document:canvas).dispatchEvent(event);
    };
    // MapLibre observes document moves; WPlace's painting listener is on window.
    // Keep a navigation gesture from drawing while native Space is being held.
    const mute=event=>{if(!event.isTrusted)event.stopPropagation();};
    document.addEventListener('mousemove',mute);
    let pressed=false,x=start.x,y=start.y;
    try {
      canvas.focus({preventScroll:true});emit('mousedown',x,y,1);pressed=true;
      for(let step=1;step<=8;step++){
        x=start.x-offset.x*step/8;y=start.y-offset.y*step/8;
        emit('mousemove',x,y,1);await frame();
      }
      await Q(180);emit('mousemove',x,y,1);await frame();emit('mouseup',x,y,0);pressed=false;
      await frame();await frame();this.updateStars();this.updateImages();
      return true;
    } finally {if(pressed)emit('mouseup',x,y,0);document.removeEventListener('mousemove',mute);}
  }
  async focusMapPosition(position) {
    if(this.mapMovePending)return false;
    this.mapMovePending=true;
    try {
      const connection=await macrosharkConnectMap(this);
      if(connection){const result=await connection.call('focus',{x:position.globalX,y:position.globalY});if(result?.ok){await new Promise(resolve=>requestAnimationFrame(resolve));this.updateStars();this.updateImages();return true;}}
      // Restore the previous multi-frame gesture if the native map is inaccessible.
      const r=document.querySelector('.maplibregl-canvas')?.getBoundingClientRect();
      if(!r)throw new Error('El mapa todavía no está disponible.');
      this.updateStars();
      const screen=position.toScreenPosition();
      if(![screen.x,screen.y].every(Number.isFinite))throw new Error('No se pudo leer la posición del mapa. Recarga WPlace.');
      const dx=screen.x-(r.left+r.width*.5),dy=screen.y-(r.top+r.height*.5);
      if(Math.hypot(dx,dy)>1)await this.dragMapStep({x:dx,y:dy});
      return true;
    } catch(error){this.widget.showNativeNotice('No se pudo ir a la imagen: '+error.message);return false;}
    finally{this.mapMovePending=false;}
  }
  
  
  async readMap() {
    const previousPendingTiles=new Set([...this.stagedPixels.values()].map(entry=>entry.tile));
    const required = new Set();
    for (const image of this.images) {
      if(image.isDeferred)continue;
      const signature = [image.position.globalX, image.position.globalY, image.pixels.analysisVersion, image.drawTransparentPixels, image.skipUnavailableColors, image.colors.map(c => c.realColor + ':' + !!c.disabled).join(','), [...this.unavailableColors].join(',')].join('|');
      if (image.tileSignature !== signature) {
        const keys = new Set(),
          disabled = new Set(image.colors.filter(c => c.disabled || image.skipUnavailableColors && this.unavailableColors.has(c.realColor)).map(c => c.realColor));
        for (const chunk of image.pixels.chunks) {
          if (!chunk.opaque && !image.drawTransparentPixels) continue;
          for (let y = chunk.y; y < chunk.y + chunk.height; y++) for (let x = chunk.x; x < chunk.x + chunk.width; x++) {
            const color = image.pixels.pixels[y][x];
            if (!color && !image.drawTransparentPixels || disabled.has(color)) continue;
            keys.add(Math.floor((image.position.globalX + x) / k) + '/' + Math.floor((image.position.globalY + y) / k));
          }
        }
        image.requiredTiles = keys;
        image.tileSignature = signature;
      }
      for (const key of image.requiredTiles) required.add(key);
    }
    const changed = new Set();
    let done = 0;
    await this.widget.run(f('taskReadingMap'), async () => {
      for (const key of required) {
        const next = await SharkPixelData.fromJSON(this, {
          url: 'https://backend.wplace.live/files/s0/tiles/' + key + '.png?ts=' + Date.now(),
          exactColor: true
        });
        const old = this.mapsCache.get(key);
        if (!old?.indices || old.indices.length !== next.indices.length || next.indices.some((color, index) => color !== old.indices[index])) {
          this.mapsCache.set(key, next);
          changed.add(key);
        }
        this.widget.status = 'Leyendo bloques ' + ++done + ' / ' + required.size;
        await Q(0);
      }
    });
    for (const key of this.mapsCache.keys()) if (!required.has(key)) this.mapsCache.delete(key);
    // Server tiles remain authoritative. Pending selections live in a separate map.
    const connection=await macrosharkConnectPending(this);
    const snapshot=connection?await connection.call('snapshot'):null;
    this.pendingQueueVerified=!!snapshot?.ok;
    this.stagedPixels.clear();
    if(snapshot?.ok)for(const entry of snapshot.points)this.stagedPixels.set(entry.tile+'/'+entry.x+'/'+entry.y,entry);
    for(const key of previousPendingTiles)changed.add(key);
    for(const entry of this.stagedPixels.values())changed.add(entry.tile);
    this.changedTiles = changed;
  }
  waitForUnfocus() {
    return this.widget.run("UNFOCUS WINDOW", () => new Promise(o => {
      if (!document.hasFocus()) o();
      window.addEventListener("blur", () => {
        setTimeout(o, 1);
      }, {
        once: !0
      });
    }), void 0, "\uD83D\uDDB1️");
  }
  findAnchorsForScreen(o) {
    this.updateStars();
    if (this.$stars.length < 2) throw new Error('No se encontraron los marcadores del mapa. Recarga WPlace y activa los favoritos.');
    const p = this.getMapProjection();
    if (p) return {
      anchorScreenPosition: {
        x: p.screenX,
        y: p.screenY
      },
      anchorWorldPosition: {
        x: p.worldX,
        y: p.worldY
      },
      pixelSize: p.scale
    };
    let a = 0,
      l = 1,
      i = 1 / 0,
      r = 1 / 0;
    for (let g = 0; g < this.$stars.length; g++) {
      let {
        x: p,
        y: d
      } = V(this.$stars[g]);
      if (p < o.x && d < o.y) {
        let t = o.x - p + (o.y - d);
        if (t < i) i = t, a = g;
      } else if (p > o.x && d > o.y) {
        let t = p - o.x + (d - o.y);
        if (t < r) r = t, l = g;
      }
    }
    let s = V(this.$stars[a]),
      c = C[a];
    return {
      anchorScreenPosition: s,
      anchorWorldPosition: c,
      pixelSize: (V(this.$stars[l]).x - s.x) / (C[l].x - c.x)
    };
  }
  isPaletteOpen() {
    return Array.from(document.querySelectorAll('button[id^="color-"]')).some(button => {
      if (button.checkVisibility && !button.checkVisibility({
        checkOpacity: true,
        checkVisibilityCSS: true
      })) return false;
      const r = button.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0 || r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) return false;
      for (let p = button.parentElement; p; p = p.parentElement) {
        const style = getComputedStyle(p);
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
        if (/hidden|clip|scroll|auto/.test(style.overflowY)) {
          const a = p.getBoundingClientRect();
          if (r.bottom <= a.top || r.top >= a.bottom || a.height <= 0) return false;
        }
      }
      return true;
    });
  }
  assertPaletteOpen() {
    if (this.isPaletteOpen()) return;
    this.lastColor = undefined;
    this.pauseAutomation("Barra de colores cerrada. Ábrela para actualizar el estado.");
    throw new Error(this.pauseReason);
  }
  async openColors() {
      if (this.isPaletteOpen()) return;
      this.openingPalette = true;
      this.lastColor = undefined;
      try {
        for (let attempt = 0; attempt < 3; attempt++) {
          this.assertAutomationReady();
          // Expanding a collapsed palette must not submit its pending pixels.
          const expand = document.querySelector('button.paint-mini-expand');
          const visible = node => node && node.getBoundingClientRect().width > 0 && getComputedStyle(node).visibility !== 'hidden';
          if (visible(expand)) expand.click();
          else {
            const paint = this.widget.findNativePaintButton();
            if (visible(paint) && !paint.closest('.paint-panel-shell')) paint.click();
          }
          for (let wait = 0; wait < 12; wait++) {
            if (this.isPaletteOpen()) return;
            this.assertAutomationReady();
            await Q(50);
          }
        }
        throw new Error('No se pudo abrir la barra de colores. Ábrela y vuelve a intentarlo.');
      } finally { this.openingPalette = false; }
    }
  async drawTask(o) {
    if (!o) return false;
    let prepared = false;
    try {
      this.assertAutomationReady();
      this.assertPaletteOpen();
      if (this.unavailableColors?.has(o.color)) return false;

      // Recheck at dispatch time: other overlays may have queued this same pixel.
      const current = this.mapsCache.get(o.position.tileX + '/' + o.position.tileY)?.pixels[o.position.y]?.[o.position.x];
      const connection=this.pendingConnection;
      const queued=connection?await connection.call('point',{tx:o.position.tileX,ty:o.position.tileY,x:o.position.x,y:o.position.y}):null;
      const effective=queued?.ok?(queued.point?.color??current):(this.stagedPixels.get([o.position.tileX,o.position.tileY,o.position.x,o.position.y].join('/'))?.color??current);
      if (effective === o.color) {
        prepared = true;
        return false;
      }
      if (!Number.isInteger(current) || current < 0) return false;
      if (this.lastColor !== o.color) {
        let i = document.getElementById("color-" + o.color);
        if (!i || i.disabled || i.getAttribute("aria-disabled") === "true" || i.querySelector(".paint-swatch-lock")) {
          this.log("Skipped draw task: color unavailable or button not found", {
            color: o.color,
            tileX: o.position.tileX,
            tileY: o.position.tileY,
            x: o.position.x,
            y: o.position.y
          });
          return false;
        }
        i.click(), this.lastColor = o.color, this.log("Color switched for draw task", {
          color: o.color
        });
      }
      await Q(0);
      this.assertAutomationReady();
      this.assertPaletteOpen();
      let a = o.position.pixelSize / 2,
        l = o.position.toScreenPosition();
      if (!Number.isFinite(l.x) || !Number.isFinite(l.y)) {
        this.log("Skipped draw task: invalid screen position", {
          color: o.color
        });
        return false;
      }
      const canvas = document.querySelector('.maplibregl-canvas');
      if (!canvas || !Number.isFinite(a) || a <= 0) return false;
      // Use the event origin in the updated script; events bubble to document/window.
      document.documentElement.dispatchEvent(sharkExactMouseMove(l.x + a, l.y + a));
      const keyboard = {
        key: ' ',
        code: 'Space',
        keyCode: 32,
        which: 32,
        bubbles: true,
        cancelable: true
      };
      const beforeCount=connection?null:macrosharkPendingCount();
      const press = new KeyboardEvent('keydown', keyboard);
      try {
        document.documentElement.dispatchEvent(press);
      } finally {
        document.documentElement.dispatchEvent(new KeyboardEvent('keyup', keyboard));
      }
      // The painting handler prevents Space's default action. If it is not
      // ready, do not count this pixel or mark it as drawn in the local cache.
      if (!press.defaultPrevented) return false;
      await Q(0);
      const accepted=connection?await connection.call('point',{tx:o.position.tileX,ty:o.position.tileY,x:o.position.x,y:o.position.y}):null;
      const afterCount=connection?null:macrosharkPendingCount();
      if(connection?(!accepted?.ok||accepted.point?.color!==o.color):(beforeCount===null||afterCount!==beforeCount+1))return false;
      this.stagedPixels.set([o.position.tileX, o.position.tileY, o.position.x, o.position.y].join('/'), { tile: o.position.tileX + '/' + o.position.tileY, x: o.position.x, y: o.position.y, color: o.color, submittedAt: 0 });
      prepared = true;
      return true;
    } finally {
      if (!prepared && o?.queue) o.queue.setPending(o.index, true);
    }
  }
  async paintRandomPixelInViewport() {
    if (!this.ensureFeatureAccess("autoFarm")) return;
    try {
      await this.updateColors();
      let o = Array.from(document.querySelectorAll('button[id^="color-"]')).filter(n => !n.disabled && n.getAttribute("aria-disabled") !== "true" && n.offsetParent !== null);
      if (!o.length) return;
      let a = o[Math.floor(Math.random() * o.length)],
        l = Number.parseInt(a.id.slice(6), 10);
      if (!Number.isFinite(l)) return;
      let i = document.querySelector(".maplibregl-canvas");
      if (!i) return;
      let r = i.getBoundingClientRect(),
        s = 24,
        c = r.left + s,
        g = r.right - s,
        p = r.top + s,
        d = r.bottom - s;
      if (g <= c || d <= p) return;
      let t = c + Math.random() * (g - c),
        w = p + Math.random() * (d - p);
      await this.drawTask({
        color: l,
        position: SharkMapPosition.fromScreenPosition(this, {
          x: t,
          y: w
        })
      });
    } catch (o) {
      this.log("Auto farm tick failed", o);
    }
  }
  async drawOverlayPixelsBatch(count) {
      const image=this.widget.getPaintImage();
      if(!image){this.widget.showPaintSelectionPrompt();return 0;}
      let prepared=0;
      return this.widget.run(f('taskDrawingOverlayPixels'),async()=>{
        this.assertAutomationReady();
        await this.openColors();
        await this.updateColors();

        await this.readMap();
        this.updateTasks();
        this.assertPaletteOpen();
        const reserved=[...this.stagedPixels.values()].filter(entry=>!entry.submittedAt).length;
        const available=Math.max(0,Math.floor(this.me?.charges?.count ?? 0)-reserved);
        const limit=Math.min(available,Math.max(0,Math.floor(count)));
        this.drawingPixels=true;
        try {
          while(prepared<limit) {
            this.assertAutomationReady();
            const task=this.takeNextTaskFromStrategy();
            if(!task)break;
            if(await this.drawTask(task))prepared++;
            await Q(this.widget.pixelPreparationDelay());
          }
          this.widget.update();
          return prepared;
        } finally { this.drawingPixels=false; }
      });
    }
  takeNextTaskFromStrategy() {
    const selected = this._widget?.getPaintImage();
    if (!selected) return;
    switch (this.strategy) {
      case "ALL":
      case "SEQUENTIAL":
        {
          for (let o = 0; o < 1; o++) {
            let a = selected.tasks.shift();
            if (a) return a;
          }
          return;
        }
      case "PERCENTAGE":
        {
          let o,
            a = Number.POSITIVE_INFINITY;
          for (let l = 0; l < 1; l++) {
            let i = selected;
            if (!i.tasks.length) continue;
            let r = i.pixels.pixels.length * i.pixels.pixels[0].length,
              s = 1 - i.tasks.length / r;
            if (s < a) a = s, o = i;
          }
          return o?.tasks.shift();
        }
    }
  }
  registerFetchInterceptor() {
    let o = this.getPageWindow(),
      a = o.fetch.bind(o),
      l = /https:\/\/backend.wplace.live\/s\d+\/pixel\/(-?\d+)\/(-?\d+)\?x=(-?\d+)&y=(-?\d+)/,
      i = async (r, s) => {
        let c = this.resolveFetchUrl(r);
        let g = await a(r, s),
          p = g.clone();
        if (c.startsWith('https://backend.wplace.live/') && [401, 403, 429].includes(g.status)) this.pauseAutomation('Pausa por HTTP ' + g.status + '. Revisa el estado y resincroniza.', g.status === 429 ? Date.now() + 60000 : 0);
        if (this.isWplacePaintRequest(c)) this.emitPaintResponseEvent(c, g);
        if (g.url === "https://backend.wplace.live/me") this.me = await p.json(), (this.me.favoriteLocations ??= []).unshift(...O), this.me.maxFavoriteLocations = 1 / 0, g.json = () => Promise.resolve(this.me), this.log("Patched /me response with favorite locations", {
          totalFavorites: this.me.favoriteLocations.length
        }), void 0;
        let d = l.exec(c);
        if (d) {
          let t = new SharkMapPosition(this, +d[1], +d[2], +d[3], +d[4]);
          for (let w = 0; w < this.markerPixelPositionResolvers.length; w++) this.markerPixelPositionResolvers[w](t);
          this.markerPixelPositionResolvers.length = 0;
          this.log("Resolved marker pixel position from network event");
        }
        return g;
      };
    o.fetch = i, globalThis.fetch = i;
  }
  emitPaintResponseEvent(o, a) {
    // An HTTP response alone does not prove that any individual pixel changed.
    globalThis.dispatchEvent(new CustomEvent("macroshark:paint-response", {
      detail: {
        ok: a.ok,
        status: a.status,
        url: o,
        at: Date.now()
      }
    }));
  }
  isWplacePaintRequest(o) {
    try {
      let a = new URL(o, location.href);
      return a.origin === "https://backend.wplace.live" && a.pathname === "/paint";
    } catch {
      return !1;
    }
  }
  resolveFetchUrl(o) {
    if (typeof o === "string") return this.normalizeFetchUrl(o);
    if (o instanceof URL) return this.normalizeFetchUrl(o.href);
    if (o && typeof o === "object" && "url" in o) {
      let a = o.url;
      if (typeof a === "string") return this.normalizeFetchUrl(a);
    }
    return "";
  }
  normalizeFetchUrl(o) {
    try {
      return new URL(o, location.href).href;
    } catch {
      return o;
    }
  }
  resolveFetchMethod(o, a) {
    if (typeof a?.method === "string") return a.method;
    if (o && typeof o === "object" && "method" in o) {
      let l = o.method;
      if (typeof l === "string") return l;
    }
    return "GET";
  }
  async closeAll() {
    for (let o of document.querySelectorAll("button")) if (o.innerHTML === "✕" || o.innerHTML === "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 -960 960 960\" fill=\"currentColor\" class=\"size-4\"><\
path d=\"m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z\"><\
/path></svg><!---->") o.click(), await Q(1);
  }
  waitForElement(o, a) {
    return this.log("Waiting for element", {
      name: o,
      selector: a
    }), this.widget.run(`${f("taskWaitingFor")} ${o}`, () => {
      return new Promise(l => {
        let i = document.querySelector(a);
        if (i) {
          l(i);
          return;
        }
        let r = new MutationObserver(() => {
          let s = document.querySelector(a);
          if (s) r.disconnect(), l(s);
        });
        r.observe(document.documentElement, {
          childList: !0,
          subtree: !0
        });
      });
    });
  }
  updateStars() {
    this.$stars = [...document.querySelectorAll('.maplibregl-marker[title*="macroshark_FAVORITE"], .maplibregl-marker[aria-label*="macroshark_FAVORITE"]')].slice(0, O.length), this.log("Star cache updated", {
      stars: this.$stars.length
    });
  }
  startMobileMapTracking() {
    this.installMapKeyboard();
    if (this.mobileTrackingInstalled) return;
    this.mobileTrackingInstalled = true;
    let frame = 0,
      running = false,
      lastScan = -Infinity;
    const tick = now => {
      frame = 0;
      if (!running) return;
      if (!document.hidden) {
        try {
          if (now - lastScan > 500 || this.$stars.some(element => !element.isConnected)) {
            const markers = [...document.querySelectorAll('.maplibregl-marker[title*="macroshark_FAVORITE"], .maplibregl-marker[aria-label*="macroshark_FAVORITE"]')].slice(0, O.length);
            if (markers.length !== this.$stars.length || markers.some((element, index) => element !== this.$stars[index])) this.$stars = markers;
            lastScan = now;
          }
          if (this.images.length && this.$stars.length >= 2) this.updateImages();
        } catch (error) {
          console.warn('[MacroShark Plus] Map tracking update failed', error);
        }
      }
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (running || document.hidden) return;
      running = true;
      lastScan = -Infinity;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    window.addEventListener('pagehide', stop);
    window.addEventListener('pageshow', start);
    start();
  }
  getMapProjection() {
    if (this.overlayProjection) return this.overlayProjection;
    const points = [];
    for (let index = 0; index < Math.min(C.length, this.$stars.length); index++) {
      const screen = V(this.$stars[index]),
        world = C[index];
      if (Number.isFinite(screen.x) && Number.isFinite(screen.y)) points.push({
        screen,
        world
      });
    }
    if (points.length < 2) return null;
    let wx = 0,
      wy = 0,
      sx = 0,
      sy = 0;
    for (const p of points) {
      wx += p.world.x;
      wy += p.world.y;
      sx += p.screen.x;
      sy += p.screen.y;
    }
    wx /= points.length;
    wy /= points.length;
    sx /= points.length;
    sy /= points.length;
    let numerator = 0,
      denominator = 0;
    for (const p of points) {
      const x = p.world.x - wx,
        y = p.world.y - wy;
      numerator += x * (p.screen.x - sx) + y * (p.screen.y - sy);
      denominator += x * x + y * y;
    }
    const scale = numerator / denominator;
    if (!Number.isFinite(scale) || scale <= 0) return null;
    return {
      scale,
      worldX: wx,
      worldY: wy,
      screenX: sx,
      screenY: sy
    };
  }
  scheduleReferencePreview() {
    if (this.referenceFrame) return;
    if (!this.referencePreviewEnabled && !this.referenceCanvas) return;
    this.referenceFrame = requestAnimationFrame(() => {
      this.referenceFrame = 0;
      this.renderReferencePreview();
    });
  }
  referenceTile(pixels, tx, ty) {
    this.referenceTiles ??= new Map();
    this.referenceOwners ??= new WeakMap();
    let owner = this.referenceOwners.get(pixels);
    if (!owner || owner.version !== pixels.analysisVersion || owner.indices !== pixels.indices || owner.width !== pixels.width || owner.height !== pixels.height) {
      if (owner) for (const [key, entry] of this.referenceTiles) if (entry.owner === owner) {
        entry.canvas.width = entry.canvas.height = 0;
        this.referenceTiles.delete(key);
      }
      owner = {
        id: this.referenceOwnerId = (this.referenceOwnerId || 0) + 1,
        pixels,
        version: pixels.analysisVersion,
        indices: pixels.indices,
        width: pixels.width,
        height: pixels.height
      };
      this.referenceOwners.set(pixels, owner);
    }
    const key = owner.id + ':' + tx + ':' + ty;
    let tile = this.referenceTiles.get(key);
    if (tile) {
      this.referenceTiles.delete(key);
      this.referenceTiles.set(key, tile);
      return tile;
    }
    const left = tx * 64,
      top = ty * 64,
      width = Math.min(64, pixels.width - left),
      height = Math.min(64, pixels.height - top);
    const canvas = document.createElement('canvas');
    canvas.width = width * 4;
    canvas.height = height * 4;
    const ctx = canvas.getContext('2d');
    this.referenceColors ??= T.map(color => 'rgb(' + color + ')');
    let last = -1;
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const color = pixels.indices[(top + y) * pixels.width + left + x];
      if (color <= 0 || color >= T.length) continue;
      if (color !== last) {
        ctx.fillStyle = this.referenceColors[color];
        last = color;
      }
      ctx.fillRect(x * 4 + 1, y * 4 + 1, 2, 2);
    }
    tile = {
      owner,
      canvas,
      left,
      top,
      width,
      height
    };
    this.referenceTiles.set(key, tile);
    // 128 blocks of 256 x 256 RGBA pixels: at most 32 MiB of cached bitmaps.
    while (this.referenceTiles.size > 128) {
      const oldest = this.referenceTiles.keys().next().value,
        discarded = this.referenceTiles.get(oldest);
      discarded.canvas.width = discarded.canvas.height = 0;
      this.referenceTiles.delete(oldest);
    }
    return tile;
  }
  clearReferenceTiles() {
    if (this.referenceTiles) for (const tile of this.referenceTiles.values()) tile.canvas.width = tile.canvas.height = 0;
    this.referenceTiles = new Map();
    this.referenceOwners = new WeakMap();
    this.referenceSignature = null;
  }
  renderReferencePreview() {
    if (!this.referencePreviewEnabled) {
      if (this.referenceCanvas) {
        this.referenceCanvas.hidden = true;
        this.referenceCanvas.width = this.referenceCanvas.height = 0;
      }
      if (this.referenceTiles?.size) this.clearReferenceTiles();
      this.referenceSignature = null;
      return;
    }
    const activePixels = new Set(this.images.map(image => image.pixels));
    if (this.referenceTiles) for (const [key, tile] of this.referenceTiles) if (!activePixels.has(tile.owner.pixels)) {
      tile.canvas.width = tile.canvas.height = 0;
      this.referenceTiles.delete(key);
    }
    if (!this.referenceCanvas) {
      const canvas = document.createElement('canvas');
      canvas.className = 'macroshark-reference-layer';
      canvas.setAttribute('aria-hidden', 'true');
      document.body.append(canvas);
      this.referenceCanvas = canvas;
    }
    const canvas = this.referenceCanvas;
    canvas.hidden = false;
    const ratio = Math.min(2, window.devicePixelRatio || 1),
      width = innerWidth,
      height = innerHeight;
    const map = document.querySelector('.maplibregl-canvas')?.getBoundingClientRect();
    const clip = map ? {
      left: Math.max(0, map.left),
      top: Math.max(0, map.top),
      right: Math.min(width, map.right),
      bottom: Math.min(height, map.bottom)
    } : {
      left: 0,
      top: 0,
      right: width,
      bottom: height
    };
    const entries = [];
    this.referenceSourceIds ??= new WeakMap();
    for (const image of this.images) {
      if(image.isDeferred)continue;
      try {
        if (!this.referenceSourceIds.has(image.pixels.indices)) this.referenceSourceIds.set(image.pixels.indices, this.referenceSourceSerial = (this.referenceSourceSerial || 0) + 1);
        const p = image.position.toScreenPosition(),
          scale = image.position.pixelSize;
        if ([p.x, p.y, scale].every(Number.isFinite) && scale > 0) entries.push({
          image,
          p,
          scale
        });
      } catch {}
    }
    const signature = [width, height, ratio, clip.left, clip.top, clip.right, clip.bottom, ...entries.map(({
      image,
      p,
      scale
    }) => [this.referenceSourceIds.get(image.pixels.indices), image.pixels.analysisVersion, image.pixels.width, image.pixels.height, p.x, p.y, scale].join(','))].join('|');
    if (this.referenceSignature === signature) return;
    this.referenceSignature = signature;
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.beginPath();
    ctx.rect(clip.left, clip.top, Math.max(0, clip.right - clip.left), Math.max(0, clip.bottom - clip.top));
    ctx.clip();
    ctx.globalAlpha = 1;
    ctx.imageSmoothingEnabled = false;
    for (const {
      image,
      p,
      scale
    } of entries) {
      // Below this scale the separate squares cannot be distinguished reliably.
      if (scale < 2) continue;
      const pixels = image.pixels,
        w = pixels.width,
        h = pixels.height;
      const left = Math.max(0, Math.floor((clip.left - p.x) / scale)),
        top = Math.max(0, Math.floor((clip.top - p.y) / scale)),
        right = Math.min(w, Math.ceil((clip.right - p.x) / scale)),
        bottom = Math.min(h, Math.ceil((clip.bottom - p.y) / scale));
      if (right <= left || bottom <= top) continue;
      for (let ty = Math.floor(top / 64); ty < Math.ceil(bottom / 64); ty++) {
        for (let tx = Math.floor(left / 64); tx < Math.ceil(right / 64); tx++) {
          const tile = this.referenceTile(pixels, tx, ty);
          ctx.drawImage(tile.canvas, p.x + tile.left * scale, p.y + tile.top * scale, tile.width * scale, tile.height * scale);
        }
      }
    }
    ctx.restore();
  }
  updateImages() {
    this.overlayProjection = this.getMapProjection();
    this.placingImages = true;
    try {
      for (const image of this.images) image.updatePlacement();
      if (this.referenceFrame) {
        cancelAnimationFrame(this.referenceFrame);
        this.referenceFrame = 0;
      }
      this.renderReferencePreview();
    } finally {
      this.placingImages = false;
      this.overlayProjection = null;
    }
  }
  updateTasks() {
    for (let o = 0; o < this.images.length; o++) this.images[o].updateTasks();
  }
  updateImageColors() {
    for (let o = 0; o < this.images.length; o++) this.images[o].updateColors();
  }
  pauseAutomation(message, retryAt = 0) {
    this.pauseReason = message;
    this.retryAt = Math.max(this.retryAt || 0, retryAt);
    this.safetyEpoch = (this.safetyEpoch || 0) + 1;
    this._widget?.stopAutoOverlay();
    if (this._widget) {
      this._widget.status = message;
    }
  }
  assertAutomationReady() {
    if (this.cancelDrawing && (this._widget?.drawActionRunning || this._widget?.autoOverlayTickRunning)) throw new Error("Dibujo detenido por el usuario. Los píxeles ya preparados se conservan.");
    if (this._widget?.isChallengeBlockingPaint()) {
      this.pauseAutomation('Verificación detectada. Resuélvela y vuelve a abrir la barra de colores.');
      throw new Error(this.pauseReason);
    }
    if (this.pauseReason && !this.resyncing) throw new Error(this.pauseReason);
  }
  async resumeAutomation() {
    if (this._widget.isChallengeBlockingPaint()) throw new Error('La verificación sigue pendiente.');
    if (Date.now() < (this.retryAt || 0)) throw new Error('Espera ' + Math.ceil((this.retryAt - Date.now()) / 1000) + ' segundos antes de reanudar.');
    this.resyncing = true;
    try {
      await this.updateColors();
      await this.readMap();
      this.updateTasks();
      if (this._widget.isChallengeBlockingPaint()) throw new Error("Verificación pendiente.");
      if (!this.isPaletteOpen()) throw new Error('La barra de colores volvió a cerrarse. Ábrela para actualizar el estado.');
      this.mobileReady = true;
      for (const name of ["draw", "draw-and-paint", "add-image", "capture-template"]) this._widget.setDisabled(name, false);
      this.pauseReason = null;
      this.retryAt = 0;
      this._widget.status = '';
    } finally {
      this.resyncing = false;
    }
  }
  request(url, options = {}) {
    const epoch = this.safetyEpoch || 0;
    const job = async () => {
      this.assertAutomationReady();
      if (epoch !== (this.safetyEpoch || 0)) throw new Error('Petición cancelada tras una pausa.');
      for (let attempt = 0; attempt < 3; attempt++) {
        await Q(Math.max(0, (this.nextRequestAt || 0) - Date.now()));
        this.assertAutomationReady();
        this.nextRequestAt = Date.now() + 350;
        let response;
        try {
          response = await fetch(url, {
            ...options,
            signal: AbortSignal.timeout(20000)
          });
        } catch (error) {
          if (attempt === 2) {
            this.pauseAutomation('Fallo de conexión. Revisa la conexión y resincroniza.');
            throw error;
          }
          await Q(500 * 2 ** attempt);
          continue;
        }
        if ([401, 403, 429].includes(response.status)) {
          const header = response.headers.get('Retry-After'),
            seconds = Number(header);
          const until = response.status === 429 ? Date.now() + (header && Number.isFinite(seconds) ? Math.max(1, seconds) * 1000 : Math.max(60000, (Date.parse(header) || 0) - Date.now())) : 0;
          this.pauseAutomation('Pausa por HTTP ' + response.status + '. Revisa la cuenta o el límite antes de reanudar.', until);
          throw new Error(this.pauseReason);
        }
        if (response.status >= 500) {
          if (attempt < 2) {
            await Q(500 * 2 ** attempt);
            continue;
          }
          this.pauseAutomation('El servidor sigue fallando. Reanuda tras revisar.');
        }
        if (!response.ok) throw new Error('HTTP ' + response.status + ' al consultar WPlace.');
        return response;
      }
    };
    const result = (this.requestChain || Promise.resolve()).then(job);
    this.requestChain = result.catch(() => {});
    return result;
  }

  installMapKeyboard() {
    if(this.mapKeyboard)return;
    const state={keys:[],timer:0,running:false,version:0,cursor:null};this.mapKeyboard=state;
    const directions={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0}};
    const stop=()=>{state.keys=[];state.version++;clearTimeout(state.timer);state.timer=0;};
    const inControl=target=>{
      if(target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"],[role="menu"],.wwidget,.macroshark-modal,.macroshark-guide,.macroshark-capture-panel'))return true;
      return !!target?.closest?.('[role="dialog"]')&&!target.closest('.paint-panel-shell');
    };
    const blocked=()=>document.hidden||this.widget.open||this.widget.$capturePanel||[...document.querySelectorAll('dialog[open],[role="dialog"][aria-modal="true"]')].some(panel=>!panel.matches('.paint-panel-shell')&&panel.getBoundingClientRect().width>0)||this.drawingPixels||this.widget.drawActionRunning||this.widget.autoOverlayIntervalId||this.widget.isChallengeBlockingPaint();
    const tick=async()=>{
      if(state.running||!state.keys.length)return;
      if(blocked()||inControl(document.activeElement)){stop();return;}
      const direction=directions[state.keys[state.keys.length-1]],version=state.version;state.running=true;
      try {
        const connection=await macrosharkConnectMap(this);
        if(version!==state.version||blocked()||!state.keys.length)return;
        const pixels=this.isPaletteOpen();
        let moved=false;
        if(connection){const result=await connection.call('pan',{...direction,pixels});moved=!!result?.ok;}
        if(!moved){
          const p=this.getMapProjection();
          if(!p||!Number.isFinite(p.scale)||p.scale<=0){stop();this.widget.showNativeNotice('No se pudo mover el mapa. Recarga WPlace.');return;}
          const step=pixels?p.scale:40;
          moved=await this.moveMap({x:direction.x*step,y:direction.y*step});
        }
        if(moved){
          await new Promise(resolve=>requestAnimationFrame(resolve));
          this.updateStars();this.updateImages();
          const r=document.querySelector('.maplibregl-canvas')?.getBoundingClientRect(),cursor=state.cursor;
          if(r){
            const point=cursor&&cursor.x>=r.left&&cursor.x<r.right&&cursor.y>=r.top&&cursor.y<r.bottom?cursor:{x:r.left+r.width*.5,y:r.top+r.height*.5};
            // Refresh the native hover; only WPlace decides whether Space paints.
            const hover=sharkExactMouseMove(point.x,point.y);Object.defineProperty(hover,'shiftKey',{value:false});
            document.documentElement.dispatchEvent(hover);
          }
        }
      } catch(error){stop();this.widget.showNativeNotice('Movimiento detenido: '+error.message);}
      finally{state.running=false;if(state.keys.length&&!blocked())state.timer=setTimeout(tick,60);}
    };
    const down=event=>{
      if(!directions[event.code]||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey||event.isComposing||inControl(event.target)||blocked())return;
      event.preventDefault();event.stopImmediatePropagation();
      if(event.repeat||state.keys.includes(event.code))return;
      state.keys.push(event.code);state.version++;
      if(!state.running){clearTimeout(state.timer);state.timer=0;void tick();}
    };
    const up=event=>{if(!directions[event.code])return;state.keys=state.keys.filter(key=>key!==event.code);state.version++;if(!state.keys.length){clearTimeout(state.timer);state.timer=0;}};
    const move=event=>{if(event.isTrusted&&event.target?.closest?.('.maplibregl-canvas'))state.cursor={x:event.clientX,y:event.clientY};};
    const blur=()=>stop(),visibility=()=>{if(document.hidden)stop();},focus=event=>{if(inControl(event.target))stop();};
    window.addEventListener('keydown',down,true);window.addEventListener('keyup',up,true);window.addEventListener('mousemove',move,true);
    window.addEventListener('blur',blur);window.addEventListener('pagehide',blur);window.addEventListener('pointercancel',blur);
    document.addEventListener('visibilitychange',visibility);document.addEventListener('focusin',focus);
    this.widget.runOnDestroy.push(()=>{stop();window.removeEventListener('keydown',down,true);window.removeEventListener('keyup',up,true);window.removeEventListener('mousemove',move,true);window.removeEventListener('blur',blur);window.removeEventListener('pagehide',blur);window.removeEventListener('pointercancel',blur);document.removeEventListener('visibilitychange',visibility);document.removeEventListener('focusin',focus);});
    void macrosharkConnectMap(this).catch(()=>{});
  }
}
function macrosharkStartupError(error) {
  console.error('[MacroShark Plus] No se pudo abrir el panel', error);
  const show = () => {
    if (!document.body || document.getElementById('macroshark-startup-error')) return;
    const notice = document.createElement('button');
    notice.id = 'macroshark-startup-error';
    notice.type = 'button';
    notice.textContent = 'MacroShark no pudo abrirse: ' + String(error?.message ?? error).slice(0, 160) + ' · Toca para cerrar';
    notice.style.cssText = 'position:fixed;top:60px;right:16px;z-index:2147483647;max-width:min(90vw,360px);padding:14px;border:2px solid #1b2a44;border-radius:3px;background:white;color:#394e6a;box-shadow:4px 4px 0 rgb(2 20 49 / 30%);font:14px Geist,ui-sans-serif,system-ui,sans-serif;text-align:left;';
    notice.onclick = () => notice.remove();
    document.body.append(notice);
    window.setTimeout(() => notice.remove(), 10000);
  };
  if (document.body) show();else document.addEventListener('DOMContentLoaded', show, { once: true });
}




const MACROSHARK_RELEASE_URL = 'https://raw.githubusercontent.com/IkeOkii/MacroShark/main/latest.json';
const MACROSHARK_INSTALL_URL = 'https://raw.githubusercontent.com/IkeOkii/MacroShark/main/MacroShark.user.js';
const MACROSHARK_CURRENT_VERSION = 'Plus.37';

function macrosharkVersionNumber(value) {
  const match = /^Plus\.(\d+)$/.exec(value);
  return match ? Number(match[1]) : null;
}

function macrosharkShowUpdate(remoteVersion) {
  globalThis.macrosharkPendingUpdate = remoteVersion;
  try { localStorage.setItem('macroshark:update-required', remoteVersion); } catch {}
  globalThis.macroshark?._widget?.requireUpdate(remoteVersion);
  if (document.getElementById('macroshark-update-screen')) return;
  const screen = document.createElement('div');
  screen.id = 'macroshark-update-screen';
  screen.setAttribute('role', 'alert');
  screen.setAttribute('aria-labelledby', 'macroshark-update-title');
  screen.style.cssText = 'position:fixed;top:60px;right:16px;z-index:2147483647;width:min(360px,calc(100vw - 32px));box-sizing:border-box;color:#394e6a;font:14px Geist,ui-sans-serif,system-ui,sans-serif;';
  const card = document.createElement('div');
  card.style.cssText = 'position:relative;width:100%;box-sizing:border-box;padding:14px;border:2px solid #1b2a44;border-radius:3px;background:#fff;box-shadow:4px 4px 0 rgb(2 20 49 / 30%);text-align:left;';
  const title = document.createElement('h2');
  title.id = 'macroshark-update-title';
  title.textContent = 'Nueva versión de MacroShark';
  title.style.cssText = 'margin:0 0 7px;font-size:15px;line-height:1.25;font-weight:700;';
  const detail = document.createElement('p');
  detail.textContent = 'Tienes ' + MACROSHARK_CURRENT_VERSION + ' y ya está disponible ' + remoteVersion + '.';
  detail.style.cssText = 'margin:0 0 7px;font-size:13px;line-height:1.4;';
  const help = document.createElement('p');
  help.textContent = 'Abre la nueva versión para instalarla. En iPhone, si Stay no la importa automáticamente, copia el enlace e impórtalo desde Stay.';
  help.style.cssText = 'margin:0 0 12px;color:#52647e;font-size:12px;line-height:1.4;';
  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
  const update = document.createElement('a');
  update.href = MACROSHARK_INSTALL_URL;
  update.target = '_blank';
  update.rel = 'noopener noreferrer';
  update.textContent = 'Abrir actualización';
  update.style.cssText = 'display:inline-block;padding:8px 10px;border:2px solid #0054c8;border-radius:3px;background:#0069ff;color:white;text-decoration:none;font-weight:700;font-size:12px;';
  const copy = document.createElement('button');
  copy.type = 'button';
  copy.textContent = 'Copiar enlace para Stay';
  copy.style.cssText = 'padding:8px 10px;border:2px solid #a9b8ce;border-radius:3px;background:#e3e9f4;color:#394e6a;font:inherit;font-size:12px;cursor:pointer;';
  copy.onclick = async () => {
    try {
      await navigator.clipboard.writeText(MACROSHARK_INSTALL_URL);
      copy.textContent = 'Enlace copiado';
    } catch {
      copy.textContent = 'No se pudo copiar; usa «Abrir actualización»';
    }
  };
  const later = document.createElement('button');
  later.type = 'button';
  later.textContent = '×';
  later.setAttribute('aria-label', 'Cerrar aviso de actualización');
  later.style.cssText = 'position:absolute;top:4px;right:5px;padding:3px 7px;border:0;background:transparent;color:#52647e;font:inherit;font-size:20px;cursor:pointer;';
  later.onclick = () => {
    screen.remove();
  };
  actions.append(update, copy);
  card.append(later, title, detail, help, actions);
  screen.append(card);
  document.body.append(screen);
}

function macrosharkStartUpdateChecks() {
  let checking = false;
  const check = async (manual = false) => {
    if (checking || (!manual && document.hidden) || document.getElementById('macroshark-update-screen')) return;
    checking = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(MACROSHARK_RELEASE_URL, { credentials: 'omit', cache: 'no-store', signal: controller.signal });
      if (!response.ok || Number(response.headers.get('content-length') || 0) > 2048) throw new Error('Respuesta no disponible');
      const body = await response.text();
      if (body.length > 2048) throw new Error('Respuesta demasiado grande');
      const version = JSON.parse(body).version;
      const current = macrosharkVersionNumber(MACROSHARK_CURRENT_VERSION);
      const available = macrosharkVersionNumber(version);
      if (current === null || available === null) throw new Error('Versión desconocida');
      if (available <= current) { try { localStorage.removeItem('macroshark:update-required'); } catch {} if (manual) globalThis.macroshark?.widget && (globalThis.macroshark.widget.status = 'MacroShark ' + MACROSHARK_CURRENT_VERSION + ' está actualizado.'); return; }
      if (!manual && globalThis.macrosharkPendingUpdate === version) return;
      if (!document.body) await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
      macrosharkShowUpdate(version);
    } catch (error) {
      console.info('[MacroShark] No se pudo comprobar la actualización', error);
      if (manual && globalThis.macroshark?.widget) globalThis.macroshark.widget.status = 'No se pudo comprobar la actualización. Inténtalo más tarde.';
    } finally {
      clearTimeout(timeout);
      checking = false;
    }
  };
  globalThis.macrosharkCheckUpdates = () => check(true);
  setTimeout(check, 5000);
  setInterval(check, 30 * 60 * 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
}
try {
  if (location.hostname === "wplace.live" || location.hostname.endsWith(".wplace.live")) {
    try {
      const cached = localStorage.getItem('macroshark:update-required');
      if ((macrosharkVersionNumber(cached) ?? 0) > (macrosharkVersionNumber(MACROSHARK_CURRENT_VERSION) ?? 0)) globalThis.macrosharkPendingUpdate = cached;
      else localStorage.removeItem('macroshark:update-required');
    } catch {}
    const root = document.documentElement;
    const shared = globalThis.unsafeWindow ?? globalThis;
    if (!shared.__macrosharkBooting && !root?.hasAttribute('data-macroshark-active') && !document.querySelector('.wwidget')) {
      shared.__macrosharkBooting = true;
      if (root) root.setAttribute('data-macroshark-active', 'Plus.37');
      else document.addEventListener('DOMContentLoaded', () => document.documentElement?.setAttribute('data-macroshark-active', 'Plus.37'), { once: true });
      ll();
      globalThis.macroshark = new SharkBot();
      macrosharkStartUpdateChecks();
    }
  }
} catch (error) {
  macrosharkStartupError(error);
}
function macrosharkLocalImageUrl(value) {
  if (typeof value !== "string" || !/^(data:image\/(png|jpeg|webp|gif|bmp);base64,|blob:)/i.test(value)) throw new Error("Importa la imagen desde un archivo local; se han desactivado las imágenes remotas.");
  return value;
}
function macrosharkParseWplace(text) {
  const record = JSON.parse(text);
  const width = Number(record?.image?.width);
  const height = Number(record?.image?.height);
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width * height > 16000000) throw Error('Dimensiones inválidas en la plantilla .wplace.');
  const url = macrosharkLocalImageUrl(record.image?.dataUrl);
  let position = null;
  let displayWidth = width;
  if (record.bounds && record.hasPlaced !== false) {
    const { north, south, west, east } = record.bounds;
    if (![north, south, west, east].every(Number.isFinite) || north <= south || east <= west) throw Error('Ubicación inválida en la plantilla .wplace.');
    const worldX = longitude => (longitude + 180) / 360 * E;
    const worldY = latitude => (1 - Math.log(Math.tan(latitude * Math.PI / 180) + 1 / Math.cos(latitude * Math.PI / 180)) / Math.PI) / 2 * E;
    const x = Math.round(worldX(west));
    const y = Math.round(worldY(north));
    displayWidth = Math.round(worldX(east)) - x;
    const displayHeight = Math.round(worldY(south)) - y;
    if (displayWidth < 1 || displayHeight < 1 || Math.abs(displayWidth / displayHeight - width / height) > 0.03) throw Error('Los límites .wplace no coinciden con la proporción de la imagen.');
    position = { x, y };
  }
  return { url, width, height, displayWidth, position, opacity: Number.isFinite(record.opacity) ? Math.max(0, Math.min(100, record.opacity * 100)) : 50, locked: !!record.locked };
}
function macrosharkToWplace(canvas, name, position, opacity = 50, locked = false) {
  const x = position?.globalX ?? 0;
  const y = position?.globalY ?? 0;
  const longitude = value => value / E * 360 - 180;
  const latitude = value => Math.atan(Math.sinh(Math.PI * (1 - 2 * value / E))) * 180 / Math.PI;
  return {
    id: globalThis.crypto?.randomUUID?.() || `macroshark-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    schemaVersion: '1', name, opacity: Math.max(0, Math.min(1, opacity / 100)),
    image: { dataUrl: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height },
    bounds: { north: latitude(y), south: latitude(y + canvas.height), west: longitude(x), east: longitude(x + canvas.width) },
    colorMetric: 'lab', dithering: false, useLegacyColors: false, colorPaletteMode: 'all',
    order: 0, locked: !!locked, hasPlaced: !!position, visible: true
  };
}
async function macrosharkReadNativeOverlays(knownRevisions = new Map()) {
  const raw = localStorage.getItem('template-overlays');
  const records = raw ? JSON.parse(raw) : [];
  if (!Array.isArray(records)) throw Error('La lista local de WPlace no tiene un formato válido.');
  const local = records.filter(record => record && typeof record.id === 'string' && !record.canvas);
  if (!local.length) return [];
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open('wplace-templates');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || Error('No se pudo abrir el almacenamiento de WPlace.'));
    request.onblocked = () => reject(Error('Cierra otras pestañas de WPlace y vuelve a intentarlo.'));
  });
  try {
    if (!db.objectStoreNames.contains('images')) throw Error('WPlace no tiene imágenes locales guardadas.');
    const read = id => new Promise((resolve, reject) => {
      const request = db.transaction('images', 'readonly').objectStore('images').get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || Error('No se pudo leer una imagen local.'));
    });
    const result = [];
    for (const record of local) {
      if (knownRevisions.has(record.id) && knownRevisions.get(record.id) === (Number(record.updatedAt) || 0)) { result.push({...record, unchanged:true}); continue; }
      const data = await read(record.id);
      if (!data) continue;
      let url;
      if (data instanceof Blob) url = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(data);
      });
      else if (typeof data === 'string') url = data;
      else if (data?.dataUrl) url = data.dataUrl;
      else if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) url = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(new Blob([data]));
      });
      if (!url) continue;
      result.push({ ...record, sourceSignature: await macrosharkImageSignature(data), image: { dataUrl: macrosharkLocalImageUrl(url), width: record.originalWidth, height: record.originalHeight } });
    }
    return result;
  } finally { db.close(); }
}

// Shared helpers: file export, theme refresh and native source metadata.
async function macrosharkExportImage(image, format) {
  if (!['wplace', 'png', 'jpg'].includes(format)) throw new Error('Formato no compatible.');
  let blob;
  if (format === 'wplace') {
    const record = macrosharkToWplace(image.pixels.canvas, image.displayName || 'MacroShark', image.position, image.opacity, image.lock);
    blob = new Blob([JSON.stringify(record, null, 2)], {type:'application/json'});
  } else {
    const source=image.pixels.canvas;
    let canvas=source;
    if(format==='jpg') {
      canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;
      const context=canvas.getContext('2d');context.fillStyle='#ffffff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(source,0,0);
    }
    blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('No se pudo crear la imagen.')),format==='jpg'?'image/jpeg':'image/png',.94));
    if(canvas!==source)canvas.width=canvas.height=0;
  }
  const name=(image.displayName||'MacroShark').replace(/[<>:"/\\|?*\u0000-\u001f]/g,'_').replace(/\.(?:wplace|png|jpe?g)$/i,'').slice(0,120)+'.'+format;
  const file=typeof File==='function'?new File([blob],name,{type:blob.type}):null;
  if(file&&navigator.canShare?.({files:[file]})&&navigator.share) {
    try { await navigator.share({files:[file],title:name}); return; }
    catch(error) { if(error.name==='AbortError')return; }
  }
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
}

function macrosharkObserveTheme(widget) {
  let queued=false;
  const observer=new MutationObserver(()=>{
    if(queued)return;queued=true;
    requestAnimationFrame(()=>{
      queued=false;
      for(const image of widget.bot.images)if(image.$previewDialog.open)image.renderStrategyPreviewSamples();
      widget.positionLauncher();
    });
  });
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['class','style','data-theme','data-game-ui']});
  widget.runOnDestroy.push(()=>observer.disconnect());
}

async function macrosharkImageSignature(data) {
  // A location/settings change should not repeat palette analysis of the same image.
  if(!globalThis.crypto?.subtle)return '';
  try {
    const bytes=data instanceof Blob?await data.arrayBuffer():data instanceof ArrayBuffer||ArrayBuffer.isView(data)?data:new globalThis.TextEncoder().encode(typeof data==='string'?data:data?.dataUrl||'');
    const digest=await globalThis.crypto.subtle.digest('SHA-256',bytes);
    return [...new Uint8Array(digest)].map(value=>value.toString(16).padStart(2,'0')).join('');
  } catch {return '';}
}

// Connect to the map already created by WPlace, in the page's own module realm.
function macrosharkMapImports(source, nodeUrl) {
  const aliases=new Set([...source.matchAll(/([\w$]+)\.map\s*=\s*[\w$]+/g)].map(match=>match[1]));
  const result=[];
  for(const match of source.matchAll(/import\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/g)) {
    for(const item of match[1].split(',')) {
      const names=item.trim().split(/\s+as\s+/);
      if(!aliases.has(names[1]||names[0]))continue;
      const url=new URL(match[2],nodeUrl);
      if(url.origin===location.origin&&url.pathname.startsWith('/_app/immutable/chunks/'))result.push({url:url.href,name:names[0]});
    }
  }
  return result;
}

async function macrosharkMapCandidates() {
  const entries=globalThis.performance.getEntriesByType('resource');
  const urls=[...new Set(entries.map(entry=>entry.name).filter(name=>{
    try {const url=new URL(name);return url.origin===location.origin&&/^\/_app\/immutable\/nodes\/\d+\.[^/]+\.js$/.test(url.pathname);}catch{return false;}
  }))].reverse().slice(0,8);
  const result=[];
  for(const url of urls) {
    try {
      const response=await fetch(url,{cache:'force-cache',credentials:'omit',signal:AbortSignal.timeout(2500)});
      if(response.ok)result.push(...macrosharkMapImports(await response.text(),url));
      if(result.length)break;
    } catch {}
  }
  return result;
}

// This function is serialized into a module script; it must close over nothing.
async function macrosharkNativeMapRuntime(config) {
  const request='macroshark:map-request:'+config.id,response='macroshark:map-response:'+config.id;
  const holders=[];
  for(const candidate of config.candidates) {
    try {const module=await import(candidate.url);if(module[candidate.name])holders.push(module[candidate.name]);}catch{}
  }
  const getMap=()=>{
    for(const holder of holders) {
      const map=holder?.map;
      if(map&&typeof map.jumpTo==='function'&&typeof map.panBy==='function'&&map.getCanvas?.()===document.querySelector('.maplibregl-canvas'))return map;
    }
    return null;
  };
  const reply=value=>window.dispatchEvent(new CustomEvent(response,{detail:JSON.stringify(value)}));
  const started=Date.now();
  while(holders.length&&!getMap()&&Date.now()-started<1000)await new Promise(resolve=>setTimeout(resolve,40));
  if(!getMap()){reply({seq:0,ok:false});return;}
  const receive=event=>{
    let data;
    try {
      data=JSON.parse(event.detail);
      if(data.type==='dispose'){window.removeEventListener(request,receive);return;}
      const map=getMap();if(!map)throw new Error('Mapa no disponible.');
      if(data.type==='focus') {
        const x=Number(data.x),y=Number(data.y);
        if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>2048000||y<0||y>2048000)throw new Error('Coordenadas no válidas.');
        map.stop();
        map.jumpTo({center:[x/2048000*360-180,Math.atan(Math.sinh(Math.PI*(1-2*y/2048000)))*180/Math.PI]});
      } else if(data.type==='pan') {
        const x=Number(data.x),y=Number(data.y);
        if(!Number.isFinite(x)||!Number.isFinite(y)||Math.abs(x)>1||Math.abs(y)>1)throw new Error('Dirección no válida.');
        const scale=512*2**map.getZoom()/2048000;
        const step=data.pixels?scale:40;
        map.stop();map.panBy([x*step,y*step],{duration:0,animate:false});
      } else if(data.type!=='info')throw new Error('Operación no válida.');
      reply({seq:data.seq,ok:true,zoom:map.getZoom()});
    } catch(error){reply({seq:data?.seq,ok:false,error:error.message});}
  };
  window.addEventListener(request,receive);
  reply({seq:0,ok:true});
}

async function macrosharkConnectMap(bot) {
  if(bot.nativeMapConnection)return bot.nativeMapConnection;
  if(bot.nativeMapLoading)return bot.nativeMapLoading;
  if(Date.now()<(bot.nativeMapRetryAt||0))return null;
  bot.nativeMapLoading=(async()=>{
    const candidates=await macrosharkMapCandidates();
    if(!candidates.length)return null;
    const id=globalThis.crypto.randomUUID(),eventName='macroshark:map-response:'+id;
    const pending=new Map();let serial=0;
    const receive=event=>{
      try {const data=JSON.parse(event.detail),entry=pending.get(data.seq);if(entry){clearTimeout(entry.timer);pending.delete(data.seq);entry.resolve(data);}}catch{}
    };
    window.addEventListener(eventName,receive);
    const wait=seq=>new Promise(resolve=>{
      const timer=setTimeout(()=>{pending.delete(seq);resolve(null);},1500);
      pending.set(seq,{resolve,timer});
    });
    const ready=wait(0),script=document.createElement('script');script.type='module';
    script.textContent='('+macrosharkNativeMapRuntime.toString()+')('+JSON.stringify({id,candidates})+');';
    const nonce=document.querySelector('script[nonce]')?.nonce;if(nonce)script.nonce=nonce;
    (document.head||document.documentElement).append(script);
    const result=await ready;script.remove();
    if(!result?.ok){window.removeEventListener(eventName,receive);return null;}
    const connection={
      async call(type,data={}) {
        const seq=++serial,reply=wait(seq);
        window.dispatchEvent(new CustomEvent('macroshark:map-request:'+id,{detail:JSON.stringify({...data,type,seq})}));
        return reply;
      },
      close(){window.dispatchEvent(new CustomEvent('macroshark:map-request:'+id,{detail:JSON.stringify({type:'dispose'})}));window.removeEventListener(eventName,receive);for(const entry of pending.values()){clearTimeout(entry.timer);entry.resolve(null);}pending.clear();}
    };
    bot._widget?.runOnDestroy.push(()=>connection.close());
    return bot.nativeMapConnection=connection;
  })();
  try {return await bot.nativeMapLoading;}
  finally {bot.nativeMapLoading=null;if(!bot.nativeMapConnection)bot.nativeMapRetryAt=Date.now()+5000;}
}

function macrosharkFormatCoordinates(point) {
  const x=point.globalX??point.x,y=point.globalY??point.y;
  return [Math.floor(x/1000),Math.floor(y/1000),x%1000,y%1000].join(', ');
}
function macrosharkParseCoordinates(text) {
  if(!/^\s*\d+\s*[,; ]\s*\d+\s*[,; ]\s*\d+\s*[,; ]\s*\d+\s*$/.test(text))throw new Error('Introduce cuatro números separados por comas.');
  const values=text.match(/\d+/g).map(Number),[tx,ty,x,y]=values;
  if(!values.every(Number.isSafeInteger)||tx>2047||ty>2047||x>999||y>999)throw new Error('Coordenadas fuera del mapa.');
  return {x:tx*1000+x,y:ty*1000+y};
}
function macrosharkInstallImageCoordinates(widget,card,image) {
  const panel=document.createElement('div');panel.className='shark-image-coordinates';
  panel.innerHTML='<label>A · Esquina superior izquierda<input class="shark-coordinate-a" aria-label="Coordenadas A" inputmode="text" spellcheck="false"></label><label>B · Esquina inferior derecha<input class="shark-coordinate-b" aria-label="Coordenadas B" inputmode="text" spellcheck="false"></label>';
  card.querySelector('.image-progress').after(panel);
  const a=panel.querySelector('.shark-coordinate-a'),b=panel.querySelector('.shark-coordinate-b');
  const busy=()=>widget.drawActionRunning||widget.autoOverlayIntervalId||widget.autoOverlayTickRunning;
  const sync=()=>{
    if(document.activeElement!==a)a.value=macrosharkFormatCoordinates(image.position);
    if(document.activeElement!==b)b.value=macrosharkFormatCoordinates({x:image.position.globalX+image.pixels.width-1,y:image.position.globalY+image.pixels.height-1});
    a.disabled=b.disabled=!!busy();
  };
  card.sharkSyncCoordinates=sync;
  const save=(input,isB)=>{
    if(busy()){sync();return;}
    try{
      const point=macrosharkParseCoordinates(input.value),x=point.x-(isB?image.pixels.width-1:0),y=point.y-(isB?image.pixels.height-1:0);
      if(x<0||y<0||x+image.pixels.width>2048000||y+image.pixels.height>2048000)throw new Error('La imagen quedaría fuera del mapa.');
      image.position.globalX=x;image.position.globalY=y;image.updateTasks();widget.bot.updateTasks();H(widget.bot,true);
      input.blur();sync();
    }catch(error){input.setCustomValidity(error.message);input.reportValidity();}
  };
  for(const [input,isB] of [[a,false],[b,true]]){
    input.addEventListener('input',()=>input.setCustomValidity(''));
    input.addEventListener('change',()=>save(input,isB));
    input.addEventListener('keydown',event=>{event.stopPropagation();if(event.key==='Enter'){event.preventDefault();save(input,isB);}if(event.key==='Escape'){event.preventDefault();input.blur();sync();}});
  }
  sync();
}

// Observe WPlace's existing preview queue. Never call its setter or mutate it.
function macrosharkPendingExport(source, url) {
  if (!source.includes('Pending paint preview listener failed.')) return null;
  const match = /function\s+([\w$]+)\s*\(\s*([\w$]+)\s*\)\s*\{\s*return\s+([\w$]+)\.add\(\s*\2\s*\),[\w$]+\(\s*\2\s*,\s*[\w$]+\s*\),\s*\(\s*\)\s*=>\s*\3\.delete\(\s*\2\s*\)\s*\}/.exec(source);
  if (!match) return null;
  for (const exported of source.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const item of exported[1].split(',')) {
      const names = item.trim().split(/\s+as\s+/);
      if (names[0] === match[1]) return {url, name:names[1] || names[0]};
    }
  }
  return null;
}

async function macrosharkPendingCandidate() {
  const urls = [...new Set(globalThis.performance.getEntriesByType('resource').filter(entry => {
    try {
      const url = new URL(entry.name);
      return url.origin === location.origin && /^\/_app\/immutable\/chunks\/[^/]+\.js$/.test(url.pathname) && (!entry.decodedBodySize || entry.decodedBodySize >= 1000 && entry.decodedBodySize <= 12000);
    } catch { return false; }
  }).map(entry => entry.name))].reverse().slice(0,48);
  let cursor = 0, found = null;
  await Promise.all(Array.from({length:6}, async () => {
    while (!found && cursor < urls.length) {
      const url = urls[cursor++];
      try {
        const response = await fetch(url, {cache:'force-cache', credentials:'omit', signal:AbortSignal.timeout(1000)});
        if (response.ok) found = macrosharkPendingExport(await response.text(), url) || found;
      } catch {}
    }
  }));
  return found;
}

// Runs in the same module realm as WPlace, receiving only read requests.
async function macrosharkPendingRuntime(config) {
  const request = 'macroshark:pending-request:' + config.id;
  const response = 'macroshark:pending-response:' + config.id;
  const reply = data => window.dispatchEvent(new CustomEvent(response, {detail:JSON.stringify(data)}));
  let points = [], unsubscribe;
  const valid = p => Array.isArray(p?.tile) && Array.isArray(p?.pixel) && [...p.tile,...p.pixel,p.colorIdx].every(Number.isInteger) && p.tile.every(n=>n>=0&&n<2048) && p.pixel.every(n=>n>=0&&n<1000) && p.colorIdx>=0 && p.colorIdx<256;
  const record = p => ({tile:p.tile.join('/'),x:p.pixel[0],y:p.pixel[1],color:p.colorIdx,submittedAt:0});
  try {
    const url = new URL(config.candidate.url);
    if (url.origin !== location.origin || !/^\/_app\/immutable\/chunks\/[^/]+\.js$/.test(url.pathname)) throw new Error('Módulo no válido.');
    const module = await import(url.href), subscribe = module[config.candidate.name];
    if (typeof subscribe !== 'function') throw new Error('Cola no disponible.');
    unsubscribe = subscribe(value => { if (Array.isArray(value)) points = value; });
    if (typeof unsubscribe !== 'function') throw new Error('Suscripción no disponible.');
    const receive = event => {
      let data;
      try {
        data = JSON.parse(event.detail);
        if (data.type === 'dispose') { unsubscribe(); window.removeEventListener(request,receive); return; }
        if (data.type === 'snapshot') reply({seq:data.seq,ok:true,points:points.filter(valid).map(record)});
        else if (data.type === 'point') {
          let point = null;
          // The most recently prepared point is normally last: no full queue copy per pixel.
          for (let i=points.length-1;i>=0;i--) {
            const p=points[i];
            if (p?.tile?.[0]===data.tx && p.tile[1]===data.ty && p.pixel?.[0]===data.x && p.pixel[1]===data.y && valid(p)) {point=record(p);break;}
          }
          reply({seq:data.seq,ok:true,point});
        } else reply({seq:data.seq,ok:false});
      } catch { reply({seq:data?.seq,ok:false}); }
    };
    window.addEventListener(request,receive);
    reply({seq:0,ok:true});
  } catch { unsubscribe?.(); reply({seq:0,ok:false}); }
}

async function macrosharkConnectPending(bot) {
  if (bot.pendingConnection) return bot.pendingConnection;
  if (bot.pendingLoading) return bot.pendingLoading;
  if (Date.now() < (bot.pendingRetryAt || 0)) return null;
  bot.pendingLoading = (async () => {
    const candidate = await macrosharkPendingCandidate();
    if (!candidate) return null;
    const id=globalThis.crypto.randomUUID(), pending=new Map();let serial=0;
    const response='macroshark:pending-response:'+id,request='macroshark:pending-request:'+id;
    const receive=event=>{try{const data=JSON.parse(event.detail),entry=pending.get(data.seq);if(entry){clearTimeout(entry.timer);pending.delete(data.seq);entry.resolve(data);}}catch{}};
    window.addEventListener(response,receive);
    const wait=seq=>new Promise(resolve=>{const timer=setTimeout(()=>{pending.delete(seq);resolve(null);},1500);pending.set(seq,{resolve,timer});});
    const ready=wait(0),script=document.createElement('script');script.type='module';
    script.textContent='('+macrosharkPendingRuntime.toString()+')('+JSON.stringify({id,candidate})+');';
    const nonce=document.querySelector('script[nonce]')?.nonce;if(nonce)script.nonce=nonce;
    (document.head||document.documentElement).append(script);
    const result=await ready;script.remove();
    if(!result?.ok){window.dispatchEvent(new CustomEvent(request,{detail:JSON.stringify({type:'dispose'})}));window.removeEventListener(response,receive);return null;}
    const connection={
      call(type,data={}){const seq=++serial,result=wait(seq);window.dispatchEvent(new CustomEvent(request,{detail:JSON.stringify({...data,type,seq})}));return result;},
      close(){window.dispatchEvent(new CustomEvent(request,{detail:JSON.stringify({type:'dispose'})}));window.removeEventListener(response,receive);for(const entry of pending.values()){clearTimeout(entry.timer);entry.resolve(null);}pending.clear();}
    };
    bot.widget.runOnDestroy.push(()=>connection.close());
    return bot.pendingConnection=connection;
  })();
  try {return await bot.pendingLoading;}
  finally {bot.pendingLoading=null;if(!bot.pendingConnection)bot.pendingRetryAt=Date.now()+30000;}
}

function macrosharkPendingCount() {
  for(const element of document.querySelectorAll('.paint-panel-shell h3,.paint-panel-shell [data-ui-title],h3')) {
    const match=/^(?:Pintar p[ií]xel|Paint pixel)\s*\((\d+)\)$/i.exec(element.textContent?.trim()||'');
    if(match && element.getBoundingClientRect().width>0 && !element.closest('[hidden]'))return Number(match[1]);
  }
  return null;
}
