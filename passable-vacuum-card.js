import {
  LitElement,
  html,
  css,
  svg,
} from "https://cdn.jsdelivr.net/npm/lit@3.2.1/+esm";

const CARD_VERSION = "1.0.2";

console.info(
  `%c PASSABLE-VACUUM-CARD %c v${CARD_VERSION} `,
  "color: white; background: #3b82f6; font-weight: bold;",
  "color: white; background: #10b981; font-weight: bold;"
);

// --- INLINE ICONS (Lucide) ---
const Icons = {
  Play: html`<svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>`,
  Pause: html`<svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>`,
  Square: html`<svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
  </svg>`,
  Home: html`<svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>`,
  Fan: html`<svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path
      d="M10.827 16.379a6.082 6.082 0 0 1-8.618-7.002l5.412 1.45a6.082 6.082 0 0 1 7.002-8.618l-1.45 5.412a6.082 6.082 0 0 1 8.618 7.002l-5.412-1.45a6.082 6.082 0 0 1-7.002 8.618l1.45-5.412Z"
    />
    <path d="M12 12v.01" />
  </svg>`,
  Droplets: html`<svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path
      d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7 2.9 7 2.9s-2.29 6.16-2.29 6.16c-1.14.93-1.71 2.03-1.71 3.19C3 14.47 4.8 16.3 7 16.3Z"
    />
    <path
      d="M20.3 8.3c-2.2 0-4 1.83-4 4.05 0 1.16.57 2.26 1.71 3.19S20.3 21.7 20.3 21.7s2.29-6.16 2.29-6.16c1.14-.93 1.71-2.03 1.71-3.19 0-2.22-1.8-4.05-4-4.05Z"
    />
    <path
      d="M13.6 15.3c-2.2 0-4 1.83-4 4.05 0 1.16.57 2.26 1.71 3.19S13.6 28.7 13.6 28.7s2.29-6.16 2.29-6.16c1.14-.93 1.71-2.03 1.71-3.19 0-2.22-1.8-4.05-4-4.05Z"
    />
  </svg>`,
  MapIcon: html`<svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
  </svg>`,
  Activity: html`<svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>`,
  AlertCircle: html`<svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>`,
  ZoomIn: html`<svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>`,
  ZoomOut: html`<svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>`,
  LocateFixed: html`<svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <line x1="2" y1="12" x2="5" y2="12" />
    <line x1="19" y1="12" x2="22" y2="12" />
    <line x1="12" y1="2" x2="12" y2="5" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <circle cx="12" cy="12" r="7" />
    <circle cx="12" cy="12" r="3" />
  </svg>`,
  MapPin: html`<svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>`,
  MapPinSolid: html`<svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="white"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" fill="white" />
  </svg>`,
  ListChecks: html`<svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="m3 17 2 2 4-4" />
    <path d="m3 7 2 2 4-4" />
    <line x1="13" y1="6" x2="21" y2="6" />
    <line x1="13" y1="12" x2="21" y2="12" />
    <line x1="13" y1="18" x2="21" y2="18" />
  </svg>`,
  X: html`<svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>`,
  X_Lg: html`<svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>`,
  Check: html`<svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>`,
  Repeat: html`<svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </svg>`,
  CalendarClock: html`<svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h5" />
    <path d="M17.5 17.5 16 16.25V14" />
    <circle cx="16" cy="16" r="6" />
  </svg>`,
  Route: html`<svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="6" cy="19" r="3" />
    <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
    <circle cx="18" cy="5" r="3" />
  </svg>`,
  LayoutGrid: html`<svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>`,
  SquareDashed: html`<svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M5 3a2 2 0 0 0-2 2" />
    <path d="M19 3a2 2 0 0 1 2 2" />
    <path d="M21 19a2 2 0 0 1-2 2" />
    <path d="M5 21a2 2 0 0 1-2-2" />
    <path d="M9 3h1" />
    <path d="M9 21h1" />
    <path d="M14 3h1" />
    <path d="M14 21h1" />
    <path d="M3 9v1" />
    <path d="M21 9v1" />
    <path d="M3 14v1" />
    <path d="M21 14v1" />
  </svg>`,
  Lock: html`<svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>`,
  Unlock: html`<svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>`,
  Trash2: html`<svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>`,
  Volume2: html`<svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>`,
  Wind: html`<svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
    <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
    <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
  </svg>`,
  Zap: html`<svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>`,
};

function formatSettingName(val) {
  if (typeof val !== "string") return val;
  return val
    .replace(/_/g, " ")
    .replace(/\bplus\b/gi, "+")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatDryingTime(timeInSeconds) {
  const num = parseInt(timeInSeconds, 10);
  if (isNaN(num) || num <= 0) return "";
  const h = Math.floor(num / 3600);
  const m = Math.floor((num % 3600) / 60);
  return `${h > 0 ? `${h}h ` : ""}${m}m`;
}

class PassableVacuumCard extends LitElement {
  static async getConfigElement() {
    return document.createElement("passable-vacuum-card-editor");
  }

  static getStubConfig(hass, entities, entitiesFallback) {
    let vacuumEntity = "";
    if (entities && entities.length > 0) {
      vacuumEntity = entities.find((e) => e.startsWith("vacuum.")) || "";
    }
    if (!vacuumEntity && hass && hass.states) {
      vacuumEntity =
        Object.keys(hass.states).find((e) => e.startsWith("vacuum.")) || "";
    }
    if (!vacuumEntity && entitiesFallback && entitiesFallback.length > 0) {
      vacuumEntity = entitiesFallback.find((e) => e.startsWith("vacuum.")) || "";
    }
    let mapCamera = "";
    if (hass && hass.states) {
      mapCamera =
        Object.keys(hass.states).find(
          (e) =>
            (e.startsWith("camera.") || e.startsWith("image.")) &&
            e.toLowerCase().includes("map")
        ) || "";
    }
    return {
      type: "custom:passable-vacuum-card",
      entity: vacuumEntity,
      map_camera: mapCamera,
    };
  }
  static properties = {
    hass: { attribute: false },
    config: { state: true },
    _activeTab: { state: true },
    _mapZoom: { state: true },
    _mapPan: { state: true },
    _isPanning: { state: true },
    _mapMode: { state: true },
    _repeats: { state: true },
    _customZone: { state: true },
    _selectedRoomIds: { state: true },
    _targetPin: { state: true },
    _selectedRoutineId: { state: true },
    _showRoutinePopup: { state: true },
    _mapLocked: { state: true },
    _imgInfo: { state: true },
    _activePopup: { state: true },
    _sliderVal: { state: true },
    _zoneDrag: { state: true },
  };

  constructor() {
    super();
    this._activeTab = "map";
    this._mapZoom = 1;
    this._mapPan = { x: 0, y: 0 };
    this._isPanning = false;
    this._panStart = { x: 0, y: 0 };
    this._mapMode = "rooms";
    this._repeats = 1;
    this._customZone = null;
    this._zoneDrag = null;
    this._selectedRoomIds = [];
    this._targetPin = null;
    this._selectedRoutineId = null;
    this._showRoutinePopup = false;
    this._mapLocked = true;
    this._imgInfo = { w: 800, h: 800, loaded: false };
    this._activePopup = null;
    this._sliderVal = 0;

    this._entityMap = null;
    this._cachedBaseName = null;
  }

  setConfig(config) {
    if (!config) {
      throw new Error("Invalid configuration.");
    }
    this.config = config;
    if (this.hass) {
      this._discoverEntities();
    }
  }

  getCardSize() {
    return 10;
  }

  firstUpdated() {
    const mapEl = this.shadowRoot.querySelector("#map-container");
    if (mapEl) {
      mapEl.addEventListener("wheel", this._handleWheel.bind(this), {
        passive: false,
      });
      mapEl.addEventListener("touchstart", this._handleTouchStart.bind(this), {
        passive: false,
      });
      mapEl.addEventListener("touchmove", this._handleTouchMove.bind(this), {
        passive: false,
      });
      mapEl.addEventListener("touchend", this._handleTouchEnd.bind(this));
    }
  }

  updated(changedProps) {
    if (
      (changedProps.has("hass") || changedProps.has("config")) &&
      this.hass &&
      this.config
    ) {
      this._discoverEntities();
    }
  }

  // --- ENTITY DISCOVERY & DATA PROCESSING ---
  _discoverEntities() {
    if (!this.hass || !this.config) return;
    const vacuumId = this.config.entity || "";
    if (!vacuumId) {
      this._entityMap = {};
      this._cachedBaseName = "";
      return;
    }
    const baseName = vacuumId.split(".")[1] || "";
    this._cachedBaseName = baseName;

    // Improved entity finder that tolerates dock entities naming conventions
    const findEnt = (configVal, domains, keywords) => {
      if (configVal) return configVal;
      const domainArr = Array.isArray(domains) ? domains : [domains];
      
      const allDomainEntities = Object.keys(this.hass.states).filter((e) =>
        domainArr.some((d) => e.startsWith(`${d}.`))
      );

      // 1. Strict match: Entity starts with exact baseName
      for (const entity of allDomainEntities) {
        const objectId = entity.split(".")[1] || "";
        if (objectId.startsWith(baseName) && keywords.some((kw) => objectId.toLowerCase().includes(kw))) {
          return entity;
        }
      }

      // 2. Looser match: Entity contains the baseName (without "_vacuum" or "_robot" suffix)
      const cleanBase = baseName.replace(/_vacuum|_robot/g, "");
      for (const entity of allDomainEntities) {
        const objectId = entity.split(".")[1] || "";
        if (objectId.includes(cleanBase) && keywords.some((kw) => objectId.toLowerCase().includes(kw))) {
          return entity;
        }
      }

      // 3. Absolute fallback: Return any entity matching the keyword
      // (This safely catches dock buttons like button.roborock_q_revo_dock_reset_strainer)
      for (const entity of allDomainEntities) {
        const objectId = entity.split(".")[1] || "";
        if (keywords.some((kw) => objectId.toLowerCase().includes(kw))) {
          return entity;
        }
      }

      return null;
    };

    const c = this.config;
    this._entityMap = {
      mopIntensity: findEnt(c.options?.mop_intensity, "select", [
        "mop_intensity",
        "water_level",
      ]),
      mopMode: findEnt(c.options?.mop_mode, "select", [
        "mop_route",
        "mop_mode",
        "route",
      ]),
      filter: findEnt(c.sensors?.filter, "sensor", ["filter"]),
      mainBrush: findEnt(c.sensors?.main_brush, "sensor", ["main_brush"]),
      sideBrush: findEnt(c.sensors?.side_brush, "sensor", ["side_brush"]),
      sensorDirty: findEnt(c.sensors?.sensors, "sensor", [
        "sensor_time_left",
        "sensor_dirty",
        "care",
      ]),
      battery: findEnt(c.sensors?.battery, "sensor", ["battery"]),
      charging: findEnt(
        c.sensors?.charging,
        ["binary_sensor", "sensor"],
        ["charging", "battery_state"]
      ),
      childLock: findEnt(
        c.options?.child_lock,
        ["switch", "input_boolean"],
        ["child_lock"]
      ),
      emptyMode: findEnt(
        c.options?.empty_mode,
        ["select", "input_select"],
        ["empty_mode", "dust_collection"]
      ),
      cleanWater: findEnt(
        c.sensors?.clean_water,
        ["sensor", "binary_sensor"],
        ["clean_water"]
      ),
      dirtyWater: findEnt(
        c.sensors?.dirty_water,
        ["sensor", "binary_sensor"],
        ["dirty_water"]
      ),
      dockError: findEnt(
        c.sensors?.dock_error,
        ["sensor", "binary_sensor"],
        ["dock_error"]
      ),
      mopDrying: findEnt(
        c.sensors?.mop_drying,
        ["sensor", "binary_sensor"],
        ["mop_drying_status", "mop_drying"]
      ),
      mopDryingTime: findEnt(c.sensors?.mop_drying_time, "sensor", [
        "mop_drying_remaining",
        "drying_time",
      ]),
      strainer: findEnt(c.sensors?.strainer, "sensor", ["strainer"]),
      volume: findEnt(
        c.options?.volume,
        ["number", "input_number"],
        ["volume"]
      ),
      selectedMap: findEnt(
        c.options?.selected_map,
        ["select", "input_select"],
        ["selected_map", "map"]
      ),
      resetFilter: findEnt(c.buttons?.reset_filter, "button", [
        "reset_air_filter",
        "reset_filter",
      ]),
      resetMainBrush: findEnt(c.buttons?.reset_main_brush, "button", [
        "reset_main_brush",
      ]),
      resetSideBrush: findEnt(c.buttons?.reset_side_brush, "button", [
        "reset_side_brush",
      ]),
      resetSensor: findEnt(c.buttons?.reset_sensor, "button", ["reset_sensor"]),
      resetStrainer: findEnt(c.buttons?.reset_strainer, "button", [
        "reset_strainer", "reset_strainer_consumable"
      ]),
    };
  }

  get data() {
    if (!this.hass || !this.config || !this._entityMap) return null;

    const vacuumId = this.config.entity;
    const mapId = this.config.map_camera || null;
    const scheduleEnableId =
      this.config.schedule_enable || "input_boolean.cleaning_enable_schedule";

    const vacuumStateObj = this.hass.states[vacuumId];
    if (!vacuumStateObj) return null;

    const attributes = vacuumStateObj.attributes || {};
    const mapStateObj = mapId ? this.hass.states[mapId] : null;
    const vacuumName = attributes.friendly_name || "RoboVac";

    let batteryLevel = attributes.battery_level || attributes.battery || 0;
    if (this._entityMap.battery && this.hass.states[this._entityMap.battery]) {
      batteryLevel = parseInt(this.hass.states[this._entityMap.battery].state);
    }

    const chargingEnt = this._entityMap.charging
      ? this.hass.states[this._entityMap.charging]
      : null;
    const isCharging = chargingEnt
      ? chargingEnt.state === "on" || chargingEnt.state === "charging"
      : false;

    let mapData = { rooms: [], calibration: null };
    if (mapStateObj?.attributes) {
      const attrs = mapStateObj.attributes;
      mapData.calibration = attrs.calibration_points || null;
      if (attrs.rooms) {
        mapData.rooms = Object.keys(attrs.rooms).map((key) => ({
          id: attrs.rooms[key].number || parseInt(key, 10),
          name: attrs.rooms[key].name,
          x0: attrs.rooms[key].x0,
          y0: attrs.rooms[key].y0,
          x1: attrs.rooms[key].x1,
          y1: attrs.rooms[key].y1,
        }));
      }
    }

    const manualRoutines = Object.keys(this.hass.states)
      .filter(
        (e) =>
          this._cachedBaseName &&
          e.startsWith(`button.${this._cachedBaseName}`) &&
          !e.includes("locate") &&
          !e.includes("reset")
      )
      .map((e) => {
        let cleanName =
          this.hass.states[e]?.attributes?.friendly_name || e.split(".").pop();
        if (cleanName && vacuumName) {
          const escapedName = vacuumName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          cleanName = cleanName.replace(new RegExp(escapedName, "ig"), "").trim();
        }
        if (cleanName) {
          cleanName = cleanName.replace(/roborock/gi, "").trim();
          if (cleanName.startsWith("-"))
            cleanName = cleanName.substring(1).trim();
        }
        return { id: e, name: cleanName || "Routine" };
      });

    const getE = (id) => (id ? this.hass.states[id] : null);

    return {
      vacuumId,
      vacuumName,
      state: vacuumStateObj.state,
      attributes,
      batteryLevel,
      isCharging,
      mapUrl: mapStateObj?.attributes?.entity_picture || null,
      mapData,
      manualRoutines,
      scheduleEnableId,
      scheduleEnableObj: getE(scheduleEnableId),
      entities: {
        mopIntensity: getE(this._entityMap.mopIntensity),
        mopMode: getE(this._entityMap.mopMode),
        filter: getE(this._entityMap.filter),
        mainBrush: getE(this._entityMap.mainBrush),
        sideBrush: getE(this._entityMap.sideBrush),
        sensorDirty: getE(this._entityMap.sensorDirty),
      },
      dock: {
        childLock: getE(this._entityMap.childLock),
        emptyMode: getE(this._entityMap.emptyMode),
        cleanWater: getE(this._entityMap.cleanWater),
        dirtyWater: getE(this._entityMap.dirtyWater),
        dockError: getE(this._entityMap.dockError),
        mopDrying: getE(this._entityMap.mopDrying),
        mopDryingTime: getE(this._entityMap.mopDryingTime),
        strainer: getE(this._entityMap.strainer),
      },
      settings: {
        volume: getE(this._entityMap.volume),
        selectedMap: getE(this._entityMap.selectedMap),
      },
      resets: {
        filter: this._entityMap.resetFilter,
        mainBrush: this._entityMap.resetMainBrush,
        sideBrush: this._entityMap.resetSideBrush,
        sensorDirty: this._entityMap.resetSensor,
        strainer: this._entityMap.resetStrainer,
      },
    };
  }

  // --- ACTIONS ---
  _call(domain, service, data) {
    this.hass.callService(domain, service, data);
  }
  _doAction(action) {
    this._call("vacuum", action, { entity_id: this.config.entity });
  }
  _setFanSpeed(speed) {
    this._call("vacuum", "set_fan_speed", {
      entity_id: this.config.entity,
      fan_speed: speed,
    });
  }
  _setSelect(entity_id, option) {
    this._call("select", "select_option", { entity_id, option });
  }
  _setInpSelect(entity_id, option) {
    this._call("input_select", "select_option", { entity_id, option });
  }
  _trigger(entity_id) {
    this._call("button", "press", { entity_id });
  }
  _toggleBool(entity_id) {
    this._call("input_boolean", "toggle", { entity_id });
  }
  _toggleSwitch(entity_id, state) {
    this._call(
      entity_id.split(".")[0],
      state === "on" ? "turn_off" : "turn_on",
      { entity_id }
    );
  }
  _setNum(entity_id, value) {
    this._call(entity_id.split(".")[0], "set_value", {
      entity_id,
      value: Number(value),
    });
  }
  _sendCmd(command, params) {
    this._call("vacuum", "send_command", {
      entity_id: this.config.entity,
      command,
      params,
    });
  }

  // --- MAP INTERACTIONS ---
  _handleWheel(e) {
    if (this._mapLocked) return;
    e.preventDefault();
    const zoomChange = e.deltaY < 0 ? 0.15 : -0.15;
    this._mapZoom = Math.max(1, Math.min(this._mapZoom + zoomChange, 4));
  }

  _handleTouchStart(e) {
    if (this._mapLocked) return;
    if (e.touches.length === 2) {
      this._initialPinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      this._initialZoom = this._mapZoom;
    }
  }

  _handleTouchMove(e) {
    if (this._mapLocked) return;
    e.preventDefault();
    if (e.touches.length === 2 && this._initialPinchDist) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = currentDist / this._initialPinchDist;
      this._mapZoom = Math.max(1, Math.min(this._initialZoom * scale, 4));
    }
  }

  _handleTouchEnd(e) {
    if (this._mapLocked) return;
    if (e.touches.length < 2) this._initialPinchDist = null;
  }

  _getEventPct(e) {
    const mapWrapper = this.shadowRoot.querySelector("#map-wrapper");
    if (!mapWrapper) return { x: 0, y: 0 };
    const rect = mapWrapper.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  }

  _getScales(mapData) {
    if (
      !mapData.calibration ||
      mapData.calibration.length < 3 ||
      !this._imgInfo.loaded
    )
      return null;
    const cp = mapData.calibration;
    const mapDiffX = cp[1].map.x - cp[0].map.x || 1;
    const mapDiffY = cp[2].map.y - cp[0].map.y || 1;
    return {
      vacScaleX: (cp[1].vacuum.x - cp[0].vacuum.x) / mapDiffX,
      vacScaleY: (cp[2].vacuum.y - cp[0].vacuum.y) / mapDiffY,
      cp0: cp[0],
    };
  }

  _pctToVac(pctX, pctY, mapData) {
    const scales = this._getScales(mapData);
    if (!scales) return { x: 0, y: 0 };
    return {
      x:
        scales.cp0.vacuum.x +
        (pctX * this._imgInfo.w - scales.cp0.map.x) * scales.vacScaleX,
      y:
        scales.cp0.vacuum.y +
        (pctY * this._imgInfo.h - scales.cp0.map.y) * scales.vacScaleY,
    };
  }

  _vacToPct(vacX, vacY, mapData) {
    const scales = this._getScales(mapData);
    if (!scales || !scales.vacScaleX) return { x: 0, y: 0 };
    return {
      x:
        (scales.cp0.map.x + (vacX - scales.cp0.vacuum.x) / scales.vacScaleX) /
        this._imgInfo.w,
      y:
        (scales.cp0.map.y + (vacY - scales.cp0.vacuum.y) / scales.vacScaleY) /
        this._imgInfo.h,
    };
  }

  _startPan(e) {
    if (this._mapLocked) return;
    if (this._mapMode === "rooms" || !e.target.closest(".zone-handle")) {
      this._isPanning = true;
      this._panStart = {
        x: (e.touches ? e.touches[0].clientX : e.clientX) - this._mapPan.x,
        y: (e.touches ? e.touches[0].clientY : e.clientY) - this._mapPan.y,
      };
    }
  }

  _doPan(e) {
    if (this._mapLocked) return;
    if (this._isPanning) {
      this._mapPan = {
        x: (e.touches ? e.touches[0].clientX : e.clientX) - this._panStart.x,
        y: (e.touches ? e.touches[0].clientY : e.clientY) - this._panStart.y,
      };
    }
    if (this._zoneDrag && this._customZone && this._mapMode === "zones") {
      e.stopPropagation();
      const currentPct = this._getEventPct(e);
      const dx = currentPct.x - this._zoneDrag.startPct.x;
      const dy = currentPct.y - this._zoneDrag.startPct.y;
      let newZone = { ...this._zoneDrag.startZone };

      const type = this._zoneDrag.type;
      if (type === "move") {
        newZone.x += dx;
        newZone.y += dy;
      } else if (type === "tl") {
        newZone.x += dx;
        newZone.w -= dx;
        newZone.y += dy;
        newZone.h -= dy;
      } else if (type === "tr") {
        newZone.w += dx;
        newZone.y += dy;
        newZone.h -= dy;
      } else if (type === "bl") {
        newZone.x += dx;
        newZone.w -= dx;
        newZone.h += dy;
      } else if (type === "br") {
        newZone.w += dx;
        newZone.h += dy;
      }

      if (newZone.w < 0.05) {
        newZone.w = 0.05;
        if (type.includes("l"))
          newZone.x =
            this._zoneDrag.startZone.x + this._zoneDrag.startZone.w - 0.05;
      }
      if (newZone.h < 0.05) {
        newZone.h = 0.05;
        if (type.includes("t"))
          newZone.y =
            this._zoneDrag.startZone.y + this._zoneDrag.startZone.h - 0.05;
      }
      this._customZone = newZone;
    }
  }

  _handleMapClick(e, mapData) {
    if (this._isPanning || this._zoneDrag) return;
    if (this._mapMode === "rooms") {
      const vacCoords = this._pctToVac(
        this._getEventPct(e).x,
        this._getEventPct(e).y,
        mapData
      );
      const clickedRoom = mapData.rooms.find(
        (r) =>
          vacCoords.x >= Math.min(r.x0, r.x1) &&
          vacCoords.x <= Math.max(r.x0, r.x1) &&
          vacCoords.y >= Math.min(r.y0, r.y1) &&
          vacCoords.y <= Math.max(r.y0, r.y1)
      );
      if (clickedRoom) {
        if (this._selectedRoomIds.includes(clickedRoom.id)) {
          this._selectedRoomIds = this._selectedRoomIds.filter(
            (id) => id !== clickedRoom.id
          );
        } else {
          this._selectedRoomIds = [...this._selectedRoomIds, clickedRoom.id];
        }
      }
    } else if (this._mapMode === "pin") {
      this._targetPin = this._getEventPct(e);
    }
  }

  _cleanSelected(mapData) {
    if (this._mapMode === "zones" && this._customZone) {
      const p1 = this._pctToVac(
        this._customZone.x,
        this._customZone.y,
        mapData
      );
      const p2 = this._pctToVac(
        this._customZone.x + this._customZone.w,
        this._customZone.y + this._customZone.h,
        mapData
      );
      this._sendCmd("app_zoned_clean", [
        [
          Math.round(Math.min(p1.x, p2.x)),
          Math.round(Math.min(p1.y, p2.y)),
          Math.round(Math.max(p1.x, p2.x)),
          Math.round(Math.max(p1.y, p2.y)),
          this._repeats,
        ],
      ]);
    } else if (this._mapMode === "rooms" && this._selectedRoomIds.length > 0) {
      const roomIds = this._selectedRoomIds.map((id) => parseInt(id, 10));

      if (this._repeats > 1) {
        this._sendCmd("app_segment_clean", [
          { segments: roomIds, repeat: this._repeats },
        ]);
      } else {
        this._sendCmd("app_segment_clean", roomIds);
      }
    } else if (this._mapMode === "pin" && this._targetPin) {
      const p = this._pctToVac(this._targetPin.x, this._targetPin.y, mapData);
      this._sendCmd("app_goto_target", [Math.round(p.x), Math.round(p.y)]);
    } else if (this._mapMode === "routines" && this._selectedRoutineId) {
      this._trigger(this._selectedRoutineId);
    }
    this._customZone = null;
    this._selectedRoomIds = [];
    this._targetPin = null;
    this._selectedRoutineId = null;
    this._mapMode = "rooms";
  }

  // --- RENDERING ---
  render() {
    if (!this.config?.entity) {
      return html`
        <ha-card header="Passable Vacuum Card">
          <div style="padding: 16px; display: flex; align-items: center; gap: 12px; color: var(--secondary-text-color);">
            <ha-icon icon="mdi:robot-vacuum" style="color: var(--primary-color, #3b82f6); --mdc-icon-size: 32px;"></ha-icon>
            <div>
              <div style="font-weight: 600; color: var(--primary-text-color);">Passable Vacuum Card</div>
              <div style="font-size: 13px;">Please select a vacuum entity in the card editor.</div>
            </div>
          </div>
        </ha-card>
      `;
    }

    const data = this.data;
    if (!data) {
      return html`
        <ha-card header="Passable Vacuum Card">
          <div style="padding: 16px; display: flex; align-items: center; gap: 12px; color: var(--secondary-text-color);">
            <ha-icon icon="mdi:alert-circle-outline" style="color: var(--warning-color, #f59e0b); --mdc-icon-size: 28px;"></ha-icon>
            <div>
              <div style="font-weight: 600; color: var(--primary-text-color);">Passable Vacuum Card</div>
              <div style="font-size: 13px;">Entity <code>${this.config.entity}</code> is invalid or not found.</div>
            </div>
          </div>
        </ha-card>
      `;
    }

    const isCleaning = ["cleaning", "returning", "moving"].includes(data.state);

    return html`
      <div class="container">
        <div class="header">
          <div class="header-left">
            <h1 class="title">
              <ha-icon
                icon="mdi:robot-vacuum"
                style="margin-right: 8px; color: var(--primary-color)"
              ></ha-icon>
              ${data.vacuumName}
            </h1>
            <p class="subtitle">Vacuum Status</p>
          </div>
          <div class="header-right">
            <div class="status-chip ${isCleaning ? "active" : ""}">
              ${data.state}
            </div>
          </div>
        </div>

        <div class="nav">
          ${this._renderNavBtn("map", Icons.MapIcon, "Map")}
          ${this._renderNavBtn("scheduling", Icons.CalendarClock, "Scheduling")}
          ${this._renderNavBtn("diagnostics", Icons.Activity, "Health")}
        </div>

        <div class="content-area">
          ${this._activeTab === "map"
            ? this._renderMapTab(data, isCleaning)
            : ""}
          ${this._activeTab === "scheduling"
            ? this._renderSchedulingTab(data)
            : ""}
          ${this._activeTab === "diagnostics"
            ? this._renderDiagnosticsTab(data)
            : ""}
        </div>
      </div>
    `;
  }

  _renderNavBtn(id, icon, label) {
    const active = this._activeTab === id;
    return html`
      <button
        class="nav-btn ${active ? "active" : ""}"
        @click=${() => (this._activeTab = id)}
      >
        ${icon}
        <span class="nav-btn-text ${active ? "active" : ""}">${label}</span>
      </button>
    `;
  }

  _renderMapTab(data, isCleaning) {
    const hasSelection =
      this._selectedRoomIds.length > 0 ||
      (this._mapMode === "zones" && this._customZone) ||
      (this._mapMode === "pin" && this._targetPin) ||
      (this._mapMode === "routines" && this._selectedRoutineId);
    const dryingTimeRaw = data.dock.mopDryingTime?.state;
    const isDryingActive =
      data.dock.mopDrying?.state === "on" || parseFloat(dryingTimeRaw) > 0;

    return html`
      <div
        id="map-container"
        class="map-box ${this._mapLocked ? "locked" : ""}"
        @pointerdown=${this._startPan}
        @pointermove=${this._doPan}
        @pointerup=${() => {
          this._isPanning = false;
          this._zoneDrag = null;
        }}
        @pointerleave=${() => {
          this._isPanning = false;
          this._zoneDrag = null;
        }}
        @click=${(e) => this._handleMapClick(e, data.mapData)}
      >
        <div class="map-tools-left">
          <div class="map-modes-group">
            <button
              class="map-mode-btn ${this._mapMode === "rooms" ? "active" : ""}"
              @click=${(e) => {
                e.stopPropagation();
                this._setMapMode("rooms");
              }}
              title="Rooms"
            >
              ${Icons.LayoutGrid}
            </button>
            <button
              class="map-mode-btn ${this._mapMode === "zones" ? "active" : ""}"
              @click=${(e) => {
                e.stopPropagation();
                this._setMapMode("zones");
              }}
              title="Zones"
            >
              ${Icons.SquareDashed}
            </button>
            <button
              class="map-mode-btn ${this._mapMode === "pin" ? "active" : ""}"
              @click=${(e) => {
                e.stopPropagation();
                this._setMapMode("pin");
              }}
              title="Pin & Go"
            >
              ${Icons.MapPin}
            </button>
            <button
              class="map-mode-btn ${this._mapMode === "routines"
                ? "active"
                : ""}"
              @click=${(e) => {
                e.stopPropagation();
                this._setMapMode("routines");
                this._showRoutinePopup = true;
              }}
              title="Routines"
            >
              ${Icons.ListChecks}
            </button>
          </div>
          ${this._mapMode === "rooms" || this._mapMode === "zones"
            ? html`
                <button
                  class="map-btn"
                  style="width: auto; padding: 0 12px; font-weight: bold;"
                  @click=${(e) => {
                    e.stopPropagation();
                    this._repeats = this._repeats >= 3 ? 1 : this._repeats + 1;
                  }}
                >
                  ${Icons.Repeat}
                  <span style="margin-left: 4px">x${this._repeats}</span>
                </button>
              `
            : ""}
        </div>

        <div class="map-controls">
          <button
            class="map-btn ${this._mapLocked ? "active" : ""}"
            @click=${(e) => {
              e.stopPropagation();
              this._mapLocked = !this._mapLocked;
            }}
          >
            ${this._mapLocked ? Icons.Lock : Icons.Unlock}
          </button>
          <button
            class="map-btn"
            @click=${(e) => {
              e.stopPropagation();
              if (!this._mapLocked)
                this._mapZoom = Math.min(this._mapZoom + 0.5, 4);
            }}
          >
            ${Icons.ZoomIn}
          </button>
          <button
            class="map-btn"
            @click=${(e) => {
              e.stopPropagation();
              if (!this._mapLocked)
                this._mapZoom = Math.max(this._mapZoom - 0.5, 1);
            }}
          >
            ${Icons.ZoomOut}
          </button>
          <button
            class="map-btn"
            @click=${(e) => {
              e.stopPropagation();
              this._mapZoom = 1;
              this._mapPan = { x: 0, y: 0 };
            }}
          >
            ${Icons.LocateFixed}
          </button>
        </div>

        <div
          class="map-transform"
          style="transform: translate(${this._mapPan.x}px, ${this._mapPan
            .y}px) scale(${this._mapZoom}); cursor: ${this._mapMode !==
            "rooms" &&
          this._mapMode !== "pin" &&
          !this._zoneDrag
            ? "default"
            : this._isPanning
            ? "grabbing"
            : "grab"}"
        >
          ${data.mapUrl
            ? html`
                <div
                  id="map-wrapper"
                  style="aspect-ratio: ${this._imgInfo.loaded
                    ? `${this._imgInfo.w} / ${this._imgInfo.h}`
                    : "auto"}"
                >
                  <img
                    src="${data.mapUrl}"
                    @load=${(e) =>
                      (this._imgInfo = {
                        w: e.target.naturalWidth,
                        h: e.target.naturalHeight,
                        loaded: true,
                      })}
                    draggable="false"
                  />

                  ${this._imgInfo.loaded
                    ? data.mapData.rooms.map((r) => {
                        const p1 = this._vacToPct(r.x0, r.y0, data.mapData);
                        const p2 = this._vacToPct(r.x1, r.y1, data.mapData);
                        const isSelected = this._selectedRoomIds.includes(r.id);
                        return html`
                          <div
                            class="room-overlay ${isSelected ? "selected" : ""}"
                            style="left: ${Math.min(p1.x, p2.x) *
                            100}%; top: ${Math.min(p1.y, p2.y) *
                            100}%; width: ${Math.abs(p2.x - p1.x) *
                            100}%; height: ${Math.abs(p2.y - p1.y) *
                            100}%; cursor: ${this._mapMode === "rooms"
                              ? "pointer"
                              : "default"}"
                            @click=${(e) => {
                              if (this._mapMode !== "rooms") return;
                              e.stopPropagation();
                              this._selectedRoomIds = isSelected
                                ? this._selectedRoomIds.filter(
                                    (id) => id !== r.id
                                  )
                                : [...this._selectedRoomIds, r.id];
                            }}
                          >
                            ${isSelected
                              ? html`<div class="room-check">
                                  ${Icons.Check}
                                </div>`
                              : ""}
                          </div>
                        `;
                      })
                    : ""}
                  ${this._mapMode === "pin" && this._targetPin
                    ? html`
                        <div
                          class="target-pin"
                          style="left: ${this._targetPin.x * 100}%; top: ${this
                            ._targetPin.y * 100}%;"
                        >
                          ${Icons.MapPinSolid}
                        </div>
                      `
                    : ""}
                  ${this._mapMode === "zones" && this._customZone
                    ? html`
                        <div
                          class="custom-zone"
                          style="left: ${this._customZone.x * 100}%; top: ${this
                            ._customZone.y * 100}%; width: ${this._customZone
                            .w * 100}%; height: ${this._customZone.h * 100}%;"
                        >
                          <div
                            class="zone-handle fill"
                            @pointerdown=${(e) => {
                              e.stopPropagation();
                              this._zoneDrag = {
                                type: "move",
                                startPct: this._getEventPct(e),
                                startZone: { ...this._customZone },
                              };
                            }}
                          ></div>
                          ${["tl", "tr", "bl", "br"].map(
                            (pos) => html`
                              <div
                                class="zone-handle corner ${pos}"
                                @pointerdown=${(e) => {
                                  e.stopPropagation();
                                  this._zoneDrag = {
                                    type: pos,
                                    startPct: this._getEventPct(e),
                                    startZone: { ...this._customZone },
                                  };
                                }}
                              >
                                <div class="corner-dot"></div>
                              </div>
                            `
                          )}
                        </div>
                      `
                    : ""}
                </div>
              `
            : html`<div style="color: var(--secondary-text-color)">
                No Map Provided
              </div>`}
        </div>

        <div class="battery-badge">
          <div
            class="bat-icon-wrap"
            style="color: ${data.batteryLevel > 50
              ? "var(--success-color, #4ade80)"
              : data.batteryLevel > 20
              ? "var(--warning-color, #facc15)"
              : "var(--error-color, #f87171)"}"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="2" y="7" width="16" height="10" rx="2" ry="2"></rect>
              <line x1="22" y1="11" x2="22" y2="13"></line>
              ${data.batteryLevel > 0
                ? svg`<rect
                    x="3"
                    y="8"
                    width="${(data.batteryLevel / 100) * 14}"
                    height="8"
                    rx="1"
                    fill="currentColor"
                    stroke="none"
                  >
                    ${
                      data.isCharging
                        ? svg`<animate attributeName="width" values="0;${
                            (data.batteryLevel / 100) * 14
                          }" dur="2s" repeatCount="indefinite" />`
                        : ""
                    }
                  </rect>`
                : ""}
            </svg>
          </div>
          <span
            style="color: ${data.isCharging
              ? "var(--success-color, #22c55e)"
              : "var(--primary-text-color)"}"
            >${data.batteryLevel}%</span
          >
          ${data.isCharging
            ? html`<span style="color: var(--success-color, #22c55e)"
                >${Icons.Zap}</span
              >`
            : ""}
        </div>

        ${isDryingActive
          ? html`
              <div class="drying-badge">
                <span
                  class="spin-animation"
                  style="margin-right:6px; display:flex;"
                  >${Icons.Wind}</span
                >
                <span>Drying ${formatDryingTime(dryingTimeRaw)}</span>
              </div>
            `
          : ""}
        ${hasSelection
          ? html`
              <div class="selection-pill">
                <span
                  >${this._mapMode === "zones"
                    ? "1 Zone Selected"
                    : this._mapMode === "pin"
                    ? "Target Set"
                    : this._mapMode === "routines"
                    ? "Routine Selected"
                    : `${this._selectedRoomIds.length} Room(s) Selected`}</span
                >
                <button
                  @click=${(e) => {
                    e.stopPropagation();
                    this._customZone = null;
                    this._selectedRoomIds = [];
                    this._targetPin = null;
                    this._selectedRoutineId = null;
                    this._mapMode = "rooms";
                  }}
                >
                  ${Icons.X}
                </button>
              </div>
            `
          : ""}
      </div>

      ${this._showRoutinePopup
        ? this._renderRoutinePopup(data.manualRoutines)
        : ""}
      ${this._renderControls(data, hasSelection, isCleaning)}
    `;
  }

  _setMapMode(mode) {
    this._mapMode = mode;
    this._customZone =
      mode === "zones" ? { x: 0.35, y: 0.35, w: 0.3, h: 0.3 } : null;
    this._selectedRoomIds = [];
    this._targetPin = null;
    this._selectedRoutineId = null;
  }

  _renderLevel(current, options, isActive) {
    if (!options || options.length <= 1) return "";
    const idx = options.indexOf(current);
    return html`
      <div class="level-dots">
        ${options.map(
          (_, i) =>
            html`<div
              class="dot"
              style="background-color: ${isActive
                ? "var(--text-primary-color, var(--primary-text-color, #fff))"
                : i <= idx
                ? "var(--primary-color, #2563eb)"
                : "var(--disabled-color, #cbd5e1)"};
              opacity: ${isActive && i > idx ? "0.4" : "1"};"
            ></div>`
        )}
      </div>
    `;
  }

  _renderControls(data, hasSelection, isCleaning) {
    const renderPopup = (id, title, opts, current, onSelect) => {
      if (this._activePopup !== id) return "";
      return html`
        <div class="modal-overlay" @click=${() => (this._activePopup = null)}>
          <div class="modal-content" @click=${(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h3>${title}</h3>
              <button @click=${() => (this._activePopup = null)}>
                ${Icons.X_Lg}
              </button>
            </div>
            <div class="modal-body">
              ${opts.map(
                (opt) => html`
                  <button
                    class="modal-opt-btn ${current === opt ? "active" : ""}"
                    @click=${() => {
                      onSelect(opt);
                      this._activePopup = null;
                    }}
                  >
                    <span>${formatSettingName(opt)}</span>${current === opt
                      ? Icons.Check
                      : ""}
                  </button>
                `
              )}
            </div>
          </div>
        </div>
      `;
    };

    const renderSliderPopup = () => {
      if (this._activePopup !== "volume" || !data.settings.volume) return "";
      const v = data.settings.volume;
      return html`
        <div class="modal-overlay" @click=${() => (this._activePopup = null)}>
          <div class="modal-content" @click=${(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h3>Volume</h3>
              <button @click=${() => (this._activePopup = null)}>
                ${Icons.X_Lg}
              </button>
            </div>
            <div
              style="display: flex; align-items: center; gap: 16px; padding: 16px 0;"
            >
              <input
                type="range"
                min="${v.attributes.min || 0}"
                max="${v.attributes.max || 100}"
                step="${v.attributes.step || 1}"
                .value=${this._sliderVal || v.state}
                @input=${(e) => (this._sliderVal = e.target.value)}
                @change=${() => this._setNum(v.entity_id, this._sliderVal)}
                style="flex: 1; accent-color: var(--primary-color, #2563eb);"
              />
              <span style="font-size: 16px; font-weight: 600; min-width: 40px;"
                >${this._sliderVal || v.state}%</span
              >
            </div>
          </div>
        </div>
      `;
    };

    return html`
      <div class="controls-container">
        <div class="control-pill">
          <button
            class="control-btn ${this._activePopup === "fan_speed"
              ? "active"
              : ""}"
            @click=${() => (this._activePopup = "fan_speed")}
            title="Suction Power"
          >
            <span style="margin-bottom: 4px">${Icons.Fan}</span>
            ${this._renderLevel(
              data.attributes.fan_speed,
              data.attributes.fan_speed_list || [
                "quiet",
                "standard",
                "turbo",
                "max",
              ],
              this._activePopup === "fan_speed"
            )}
          </button>

          ${data.entities.mopIntensity
            ? html`
                <button
                  class="control-btn ${this._activePopup === "mop_intensity"
                    ? "active"
                    : ""}"
                  @click=${() => (this._activePopup = "mop_intensity")}
                  title="Mop Intensity"
                >
                  <span style="margin-bottom: 4px">${Icons.Droplets}</span>
                  ${this._renderLevel(
                    data.entities.mopIntensity.state,
                    data.entities.mopIntensity.attributes.options || [],
                    this._activePopup === "mop_intensity"
                  )}
                </button>
              `
            : ""}
          ${data.entities.mopMode
            ? html`
                <button
                  class="control-btn ${this._activePopup === "mop_mode"
                    ? "active"
                    : ""}"
                  @click=${() => (this._activePopup = "mop_mode")}
                  title="Mop Route Mode"
                >
                  <span style="margin-bottom: 4px">${Icons.Route}</span>
                  ${this._renderLevel(
                    data.entities.mopMode.state,
                    data.entities.mopMode.attributes.options || [],
                    this._activePopup === "mop_mode"
                  )}
                </button>
              `
            : ""}
          ${data.settings.volume
            ? html`
                <button
                  class="control-btn ${this._activePopup === "volume"
                    ? "active"
                    : ""}"
                  @click=${() => {
                    this._sliderVal = data.settings.volume.state;
                    this._activePopup = "volume";
                  }}
                  title="Volume"
                >
                  <span style="margin-bottom: 4px">${Icons.Volume2}</span>
                  <span
                    style="position: absolute; bottom: 4px; font-size: 9px; font-weight: bold;"
                    >${data.settings.volume.state}%</span
                  >
                </button>
              `
            : ""}
          ${data.dock.emptyMode || data.dock.childLock
            ? html`<div class="pill-divider"></div>`
            : ""}
          ${data.dock.emptyMode
            ? html`
                <button
                  class="control-btn ${this._activePopup === "empty_mode"
                    ? "active"
                    : ""}"
                  @click=${() => (this._activePopup = "empty_mode")}
                  title="Empty Mode"
                >
                  <span style="margin-bottom: 4px">${Icons.Trash2}</span>
                  ${this._renderLevel(
                    data.dock.emptyMode.state,
                    data.dock.emptyMode.attributes.options || [],
                    this._activePopup === "empty_mode"
                  )}
                </button>
              `
            : ""}
          ${data.dock.childLock
            ? html`
                <button
                  class="control-btn ${data.dock.childLock.state === "on"
                    ? "active"
                    : ""}"
                  @click=${() =>
                    this._toggleSwitch(
                      data.dock.childLock.entity_id,
                      data.dock.childLock.state
                    )}
                  title="Child Lock"
                >
                  ${data.dock.childLock.state === "on"
                    ? Icons.Lock
                    : Icons.Unlock}
                </button>
              `
            : ""}
        </div>

        <div class="control-pill">
          <button
            class="main-play-btn ${hasSelection
              ? "selection"
              : isCleaning
              ? "cleaning"
              : ""}"
            @click=${() =>
              hasSelection
                ? this._cleanSelected(data.mapData)
                : this._doAction(isCleaning ? "pause" : "start")}
          >
            ${isCleaning && !hasSelection
              ? Icons.Pause
              : html`<span style="margin-left: 2px">${Icons.Play}</span>`}
          </button>
          <button
            class="control-btn"
            @click=${() => this._doAction("stop")}
            title="Stop"
          >
            ${Icons.Square}
          </button>
          <button
            class="control-btn"
            @click=${() => this._doAction("return_to_base")}
            title="Return to Dock"
          >
            ${Icons.Home}
          </button>

          ${data.settings.selectedMap
            ? html`
                <div class="pill-divider"></div>
                <button
                  class="control-btn ${this._activePopup === "selected_map"
                    ? "active"
                    : ""}"
                  style="width: auto; padding: 0 16px; border-radius: 24px;"
                  @click=${() => (this._activePopup = "selected_map")}
                  title="Select Map"
                >
                  <span style="margin-right: 6px">${Icons.MapIcon}</span>
                  <span style="font-size: 13px; font-weight: 600;"
                    >${data.settings.selectedMap.state}</span
                  >
                </button>
              `
            : ""}
        </div>
      </div>

      ${renderPopup(
        "fan_speed",
        "Suction Power",
        data.attributes.fan_speed_list || ["quiet", "standard", "turbo", "max"],
        data.attributes.fan_speed,
        (val) => this._setFanSpeed(val)
      )}
      ${data.entities.mopIntensity
        ? renderPopup(
            "mop_intensity",
            "Mop Water Intensity",
            data.entities.mopIntensity.attributes.options || [],
            data.entities.mopIntensity.state,
            (val) => this._setSelect(data.entities.mopIntensity.entity_id, val)
          )
        : ""}
      ${data.entities.mopMode
        ? renderPopup(
            "mop_mode",
            "Mop Route Mode",
            data.entities.mopMode.attributes.options || [],
            data.entities.mopMode.state,
            (val) => this._setSelect(data.entities.mopMode.entity_id, val)
          )
        : ""}
      ${data.dock.emptyMode
        ? renderPopup(
            "empty_mode",
            "Dock Empty Mode",
            data.dock.emptyMode.attributes.options || [],
            data.dock.emptyMode.state,
            (val) => this._setSelect(data.dock.emptyMode.entity_id, val)
          )
        : ""}
      ${data.settings.selectedMap
        ? renderPopup(
            "selected_map",
            "Select Map",
            data.settings.selectedMap.attributes.options || [],
            data.settings.selectedMap.state,
            (val) => this._setSelect(data.settings.selectedMap.entity_id, val)
          )
        : ""}
      ${renderSliderPopup()}
    `;
  }

  _renderRoutinePopup(manualRoutines) {
    return html`
      <div
        class="modal-overlay"
        @click=${() => (this._showRoutinePopup = false)}
      >
        <div class="modal-content" @click=${(e) => e.stopPropagation()}>
          <div class="modal-header">
            <h3>Select Routine</h3>
            <button @click=${() => (this._showRoutinePopup = false)}>
              ${Icons.X_Lg}
            </button>
          </div>
          <div class="modal-body">
            ${manualRoutines.length === 0
              ? html`<p style="color: var(--secondary-text-color)">
                  No routines discovered.
                </p>`
              : ""}
            ${manualRoutines.map(
              (r) => html`
                <button
                  class="modal-opt-btn ${this._selectedRoutineId === r.id
                    ? "active"
                    : ""}"
                  @click=${() => {
                    this._selectedRoutineId = r.id;
                    this._showRoutinePopup = false;
                  }}
                >
                  <span>${r.name}</span>${this._selectedRoutineId === r.id
                    ? Icons.Check
                    : ""}
                </button>
              `
            )}
          </div>
        </div>
      </div>
    `;
  }

  _renderSchedulingTab(data) {
    const days = [
      { id: "sunday", label: "S" },
      { id: "monday", label: "M" },
      { id: "tuesday", label: "T" },
      { id: "wednesday", label: "W" },
      { id: "thursday", label: "T" },
      { id: "friday", label: "F" },
      { id: "saturday", label: "S" },
    ];

    const isEnabled = data.scheduleEnableObj?.state === "on";

    return html`
      <div class="card-panel">
        <div
          style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;"
        >
          <h3 style="margin: 0; font-size: 16px; font-weight: 600;">
            Enable Schedule
          </h3>
          <button
            class="toggle-btn ${isEnabled ? "active" : ""}"
            style="opacity: ${data.scheduleEnableObj ? 1 : 0.5}"
            @click=${() =>
              data.scheduleEnableObj && this._toggleBool(data.scheduleEnableId)}
          >
            <div class="toggle-thumb ${isEnabled ? "active" : ""}"></div>
          </button>
        </div>

        ${data.manualRoutines.length === 0
          ? html`<p
              style="color: var(--secondary-text-color); font-size: 14px;"
            >
              No routines discovered to schedule.
            </p>`
          : html`
              <div style="display: flex; flex-direction: column; gap: 24px;">
                ${data.manualRoutines.map(
                  (routine) => html`
                    <div
                      style="display: flex; flex-direction: column; gap: 12px;"
                    >
                      <span style="font-size: 14px; font-weight: 600;"
                        >${routine.name}</span
                      >
                      <div
                        style="display: flex; justify-content: space-between; gap: 4px;"
                      >
                        ${days.map((day) => {
                          const entId = `input_select.cleaning_routine_${day.id}`;
                          const selectObj = this.hass.states[entId];
                          const isSelected = selectObj?.state === routine.name;
                          return html`
                            <button
                              class="day-btn ${isSelected ? "active" : ""}"
                              style="opacity: ${selectObj ? 1 : 0.5}"
                              @click=${() =>
                                selectObj &&
                                this._setInpSelect(
                                  entId,
                                  isSelected ? "None" : routine.name
                                )}
                            >
                              ${day.label}
                            </button>
                          `;
                        })}
                      </div>
                    </div>
                  `
                )}
              </div>
            `}
      </div>
    `;
  }

  _renderDiagnosticsTab(data) {
    const getVal = (id) =>
      id && this.hass.states[id]
        ? parseInt(this.hass.states[id].state) || 0
        : null; // Allow null to handle entities missing a value sensor but possessing a reset button
        
    const items = [];
    if (data.entities.filter || data.resets.filter)
      items.push({
        label: "Filter",
        value: data.entities.filter ? getVal(data.entities.filter.entity_id) : null,
        max: 150,
        reset: data.resets.filter,
      });
    if (data.entities.sensorDirty || data.resets.sensorDirty)
      items.push({
        label: "Sensors Cleaning",
        value: data.entities.sensorDirty ? getVal(data.entities.sensorDirty.entity_id) : null,
        max: 30,
        reset: data.resets.sensorDirty,
      });
    if (data.entities.sideBrush || data.resets.sideBrush)
      items.push({
        label: "Side Brush",
        value: data.entities.sideBrush ? getVal(data.entities.sideBrush.entity_id) : null,
        max: 200,
        reset: data.resets.sideBrush,
      });
    if (data.entities.mainBrush || data.resets.mainBrush)
      items.push({
        label: "Main Brush",
        value: data.entities.mainBrush ? getVal(data.entities.mainBrush.entity_id) : null,
        max: 300,
        reset: data.resets.mainBrush,
      });
    if (data.dock.strainer || data.resets.strainer)
      items.push({
        label: "Strainer",
        value: data.dock.strainer ? getVal(data.dock.strainer.entity_id) : null,
        max: 150,
        reset: data.resets.strainer,
      });

    const diagRow = (icon, label, entity) => {
      if (
        !entity ||
        entity.state === "unavailable" ||
        entity.state === "unknown"
      )
        return "";
      let isError = false;
      let text = entity.state;
      const cls = entity.attributes?.device_class;
      if (text === "on" || text === "off") {
        isError = text === "on";
        text = isError ? "Check" : "OK";
      } else if (cls === "enum" || entity.attributes?.options) {
        isError =
          text.toLowerCase() !== "ok" &&
          text.toLowerCase() !== "none" &&
          text.toLowerCase() !== "off";
        text = isError ? formatSettingName(text) : "OK";
      } else {
        isError =
          text.toLowerCase() !== "ok" &&
          text.toLowerCase() !== "0" &&
          text.toLowerCase() !== "none" &&
          text.toLowerCase() !== "off";
        text = isError ? formatSettingName(text) : "OK";
      }
      return html`
        <div class="diag-row">
          <div
            class="diag-label"
            style="color: ${isError
              ? "var(--error-color, #ef4444)"
              : "var(--secondary-text-color)"}"
          >
            ${icon}
            <span style="color: var(--primary-text-color)">${label}</span>
          </div>
          <span
            class="diag-val"
            style="color: ${isError
              ? "var(--error-color, #ef4444)"
              : "var(--secondary-text-color)"}"
          >
            ${text} ${entity.attributes?.unit_of_measurement || ""}
          </span>
        </div>
      `;
    };

    return html`
      <div class="card-panel">
        <h4
          style="margin: 0 0 20px 0; padding-bottom: 12px; border-bottom: 1px solid var(--divider-color, #e2e8f0);"
        >
          Diagnostics
        </h4>

        ${items.map((item) => {
          const hasValue = item.value !== null;
          const pct = hasValue ? Math.min((item.value / item.max) * 100, 100) : null;
          const color =
            !hasValue ? "var(--secondary-text-color)" :
            pct < 20
              ? "var(--error-color, #ef4444)"
              : pct < 50
              ? "var(--warning-color, #facc15)"
              : "var(--success-color, #22c55e)";
          return html`
            <div style="margin-bottom: 16px;">
              <div
                style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;"
              >
                <span style="font-size: 14px; font-weight: 500;"
                  >${item.label}</span
                >
                <div style="display: flex; align-items: center; gap: 10px;">
                  ${hasValue ? html`<span style="font-size: 14px; font-weight: 600;">${item.value} h</span>` : ""}
                  ${item.reset
                    ? html`<button
                        class="reset-btn"
                        @click=${() => this._trigger(item.reset)}
                      >
                        Reset
                      </button>`
                    : ""}
                </div>
              </div>
              ${hasValue ? html`
              <div class="progress-bg">
                <div
                  class="progress-fill"
                  style="width: ${pct}%; background-color: ${color};"
                ></div>
              </div>` : ""}
            </div>
          `;
        })}

        <div style="margin-top: 24px;">
          ${diagRow(Icons.Droplets, "Clean Water Box", data.dock.cleanWater)}
          ${diagRow(Icons.Droplets, "Dirty Water Box", data.dock.dirtyWater)}
          ${diagRow(Icons.AlertCircle, "Dock Error", data.dock.dockError)}
        </div>

        ${items.some((d) => d.value !== null && (d.value / d.max) * 100 < 20)
          ? html`
              <div class="warning-box">
                <span style="flex-shrink: 0">${Icons.AlertCircle}</span>
                <span
                  >A consumable has less than 20% life remaining. Please replace
                  soon.</span
                >
              </div>
            `
          : ""}
      </div>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      .container {
        font-family: var(
          --paper-font-body1_-_font-family,
          Roboto,
          "Segoe UI",
          sans-serif
        );
        background-color: var(
          --ha-card-background,
          var(--card-background-color, #fff)
        );
        color: var(--primary-text-color, #212121);
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
        box-sizing: border-box;
        width: 100%;
        position: relative;
        display: flex;
        flex-direction: column;
        height: 750px;
      }
      .header {
        padding: 16px 16px 0;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        padding-bottom: 16px;
        margin-bottom: 16px;
        flex-shrink: 0;
      }
      .header-left {
        display: flex;
        flex-direction: column;
      }
      .title {
        font-size: 24px;
        font-weight: 500;
        margin: 0;
        letter-spacing: -0.01em;
        display: flex;
        align-items: center;
      }
      .subtitle {
        color: var(--secondary-text-color, #757575);
        font-size: 14px;
        margin-top: 4px;
        margin-bottom: 0;
      }
      .status-chip {
        font-size: 11px;
        font-weight: 500;
        padding: 2px 8px;
        border-radius: 12px;
        text-transform: uppercase;
        background: rgba(128, 128, 128, 0.15);
        color: var(--secondary-text-color);
      }
      .status-chip.active {
        background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.15);
        color: var(--primary-color, #2196f3);
      }

      .nav {
        display: flex;
        justify-content: center;
        gap: 24px;
        padding: 0 16px 12px 16px;
        margin-bottom: 12px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        flex-shrink: 0;
      }
      .nav-btn {
        padding: 8px 16px;
        border-radius: 24px;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        color: var(--secondary-text-color);
        transition: all 0.3s ease;
        margin-bottom: 0;
      }
      .nav-btn.active {
        background: var(--primary-color, #2563eb);
        color: var(--text-primary-color, var(--primary-text-color, #fff));
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      }
      .nav-btn:hover:not(.active) {
        background: rgba(var(--rgb-primary-color, 37, 99, 235), 0.05);
      }
      .nav-btn-text {
        max-width: 0;
        opacity: 0;
        overflow: hidden;
        white-space: nowrap;
        transition: all 0.3s ease;
        font-weight: 600;
        font-size: 13px;
        text-transform: uppercase;
        margin-left: 0;
      }
      .nav-btn-text.active {
        max-width: 80px;
        opacity: 1;
        margin-left: 8px;
      }

      .content-area {
        flex: 1;
        padding: 0 16px 16px;
        display: flex;
        flex-direction: column;
        gap: 24px;
        overflow-y: auto;
      }

      /* Map Styles */
      .map-box {
        background-color: var(--secondary-background-color, #0f172a);
        border-radius: 24px;
        flex: 1;
        min-height: 350px;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        touch-action: none;
      }
      .map-box.locked {
        touch-action: auto;
      }
      .map-tools-left {
        position: absolute;
        left: 12px;
        top: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        z-index: 2;
        align-items: flex-start; /* Stops modes-container from stretching to button width */
      }
      .map-controls {
        position: absolute;
        right: 12px;
        top: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        z-index: 2;
      }
      .map-modes-group {
        display: flex;
        flex-direction: column;
        background: var(--card-background-color, rgba(255, 255, 255, 0.95));
        border-radius: 24px;
        padding: 4px;
        gap: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      .map-mode-btn {
        background: transparent;
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--primary-text-color);
        transition: all 0.2s;
        margin: 0;
      }
      .map-mode-btn.active {
        background: var(--primary-color, #2563eb);
        color: var(--text-primary-color, var(--primary-text-color, #fff));
      }
      .map-btn {
        background: var(--card-background-color, rgba(255, 255, 255, 0.95));
        border: none;
        border-radius: 12px;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--primary-text-color);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.2s;
        backdrop-filter: blur(4px);
      }
      .map-btn.active {
        background: var(--primary-color, #2563eb);
        color: var(--text-primary-color, var(--primary-text-color, #fff));
      }

      .map-transform {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: none;
      }
      #map-wrapper {
        position: relative;
        max-width: 100%;
        max-height: 100%;
      }
      #map-wrapper img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
        pointer-events: none;
      }

      .room-overlay {
        position: absolute;
        background-color: transparent;
        border: 1px solid transparent;
        z-index: 1;
        border-radius: 4px;
        transition: background-color 0.2s;
      }
      .room-overlay.selected {
        background-color: rgba(37, 99, 235, 0.4);
        border-color: rgba(37, 99, 235, 0.8);
      }
      .room-check {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
      }

      .target-pin {
        position: absolute;
        transform: translate(-50%, -100%);
        color: #ef4444;
        z-index: 2;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
      }
      .custom-zone {
        position: absolute;
        background-color: rgba(37, 99, 235, 0.2);
        border: 2px dashed #2563eb;
        z-index: 1;
      }
      .zone-handle {
        position: absolute;
        touch-action: none;
      }
      .zone-handle.fill {
        width: 100%;
        height: 100%;
        cursor: move;
      }
      .zone-handle.corner {
        width: 32px;
        height: 32px;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .zone-handle.corner.tl {
        top: -16px;
        left: -16px;
        cursor: nwse-resize;
      }
      .zone-handle.corner.tr {
        top: -16px;
        right: -16px;
        cursor: nesw-resize;
      }
      .zone-handle.corner.bl {
        bottom: -16px;
        left: -16px;
        cursor: nesw-resize;
      }
      .zone-handle.corner.br {
        bottom: -16px;
        right: -16px;
        cursor: nwse-resize;
      }
      .corner-dot {
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        border: 2px solid #2563eb;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
      }

      .battery-badge {
        position: absolute;
        bottom: 12px;
        left: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
        background: var(--card-background-color, rgba(255, 255, 255, 0.95));
        padding: 6px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
        z-index: 2;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .bat-icon-wrap {
        display: flex;
        align-items: center;
      }
      .drying-badge {
        position: absolute;
        bottom: 12px;
        right: 12px;
        display: flex;
        align-items: center;
        background: rgba(37, 99, 235, 0.15);
        color: var(--primary-color, #2563eb);
        padding: 6px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
        z-index: 2;
        border: 1px solid rgba(37, 99, 235, 0.3);
        backdrop-filter: blur(4px);
      }
      .selection-pill {
        position: absolute;
        top: 16px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--card-background-color, rgba(255, 255, 255, 0.95));
        backdrop-filter: blur(12px);
        border-radius: 24px;
        padding: 8px 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 3;
        display: flex;
        align-items: center;
        gap: 8px;
        border: 1px solid var(--primary-color, #2563eb);
        font-size: 12px;
        font-weight: bold;
      }
      .selection-pill button {
        background: none;
        border: none;
        padding: 0;
        display: flex;
        cursor: pointer;
        color: var(--secondary-text-color);
      }

      /* Controls */
      .controls-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-items: center;
        width: 100%;
        margin-top: 8px;
        z-index: 3;
      }
      .control-pill {
        display: flex;
        flex-direction: row;
        background: var(--card-background-color, rgba(255, 255, 255, 0.95));
        border-radius: 32px;
        padding: 6px;
        gap: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        align-items: center;
      }
      .control-btn {
        background: transparent;
        border: none;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--primary-text-color);
        transition: all 0.2s;
        position: relative;
        flex-direction: column;
      }
      .control-btn.active {
        background: var(--primary-color, #2563eb);
        color: var(--text-primary-color, var(--primary-text-color, #fff));
      }
      .pill-divider {
        width: 1px;
        height: 28px;
        background-color: var(--divider-color, #e2e8f0);
        margin: 0 4px;
      }

      .main-play-btn {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: var(--primary-color, #2563eb);
        color: var(--text-primary-color, var(--primary-text-color, #fff));
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
        margin: 0 4px;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .main-play-btn.cleaning {
        background: var(--warning-color, #f59e0b);
        box-shadow: 0 0 15px rgba(245, 158, 11, 0.4);
      }

      /* New Selection Flash Animation */
      .main-play-btn.selection {
        animation: button-flash 1.5s infinite ease-in-out;
      }

      .level-dots {
        display: flex;
        gap: 3px;
        position: absolute;
        bottom: 6px;
      }
      .dot {
        width: 3px;
        height: 3px;
        border-radius: 50%;
      }

      /* Modals */
      .modal-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(2px);
        z-index: 5;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        border-radius: var(--ha-card-border-radius, 12px);
        overflow: hidden;
      }
      .modal-content {
        background: var(--ha-card-background, #fff);
        width: 100%;
        padding: 24px;
        border-radius: 24px 24px 0 0;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
        max-height: 80%;
        overflow-y: auto;
      }
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      .modal-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
      .modal-header button {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--secondary-text-color);
        display: flex;
      }
      .modal-body {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .modal-opt-btn {
        width: 100%;
        padding: 16px 20px;
        border-radius: 16px;
        border: none;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--secondary-background-color, #f1f5f9);
        color: var(--primary-text-color);
      }
      .modal-opt-btn.active {
        background: var(--primary-color, #2563eb);
        color: var(--text-primary-color, var(--primary-text-color, #fff));
      }

      /* Tabs */
      .card-panel {
        background: var(--ha-card-background, #fff);
        border: 1px solid var(--divider-color, #e2e8f0);
        border-radius: 24px;
        padding: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
      }
      .toggle-btn {
        width: 44px;
        height: 24px;
        border-radius: 12px;
        background: var(--disabled-color, #cbd5e1);
        border: none;
        position: relative;
        padding: 0;
        transition: background 0.2s;
      }
      .toggle-btn.active {
        background: var(--primary-color, #2563eb);
      }
      .toggle-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #fff;
        position: absolute;
        top: 2px;
        left: 2px;
        transition: left 0.2s;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      }
      .toggle-thumb.active {
        left: 22px;
      }
      .day-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--secondary-background-color, #f1f5f9);
        color: var(--primary-text-color);
        font-weight: 600;
        font-size: 14px;
        transition: all 0.2s;
      }
      .day-btn.active {
        background: var(--primary-color, #2563eb);
        color: var(--text-primary-color, var(--primary-text-color, #fff));
        box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
      }

      .progress-bg {
        width: 100%;
        background: var(--secondary-background-color, #e2e8f0);
        border-radius: 9999px;
        height: 8px;
        overflow: hidden;
      }
      .progress-fill {
        height: 8px;
        border-radius: 9999px;
        transition: width 0.5s ease;
      }
      .reset-btn {
        background: var(--secondary-background-color, #f1f5f9);
        border: 1px solid var(--divider-color, #e2e8f0);
        border-radius: 12px;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        color: var(--primary-text-color);
      }
      .diag-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid var(--divider-color, #e2e8f0);
      }
      .diag-label {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        font-weight: 500;
      }
      .diag-val {
        font-size: 14px;
        font-weight: 600;
        text-transform: capitalize;
      }
      .warning-box {
        background: var(--secondary-background-color, #fef2f2);
        padding: 16px;
        border-radius: 16px;
        display: flex;
        gap: 12px;
        border: 1px solid var(--error-color, #fecaca);
        margin-top: 24px;
        color: var(--error-color, #991b1b);
        font-size: 14px;
        font-weight: 500;
        line-height: 1.5;
      }

      @keyframes button-flash {
        0%,
        100% {
          background-color: var(--primary-color, #2563eb);
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7);
        }
        50% {
          background-color: var(--success-color, #22c55e);
          transform: scale(1.08);
          box-shadow: 0 0 0 12px rgba(34, 197, 94, 0);
        }
      }
      @keyframes spin-slow {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
      .spin-animation {
        animation: spin-slow 2s linear infinite;
      }
    `;
  }
}

class PassableVacuumCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
  };

  setConfig(config) {
    this._config = config;
  }

  _schema = [
    {
      name: "entity",
      label: "Vacuum Entity *",
      selector: { entity: { domain: "vacuum" } },
    },
    {
      name: "map_camera",
      label: "Map Camera / Image",
      selector: { entity: { domain: ["camera", "image"] } },
    },
    {
      name: "schedule_enable",
      label: "Enable Schedule Entity",
      selector: { entity: { domain: "input_boolean" } },
    },
    {
      name: "selected_map",
      label: "Selected Map (Optional Override)",
      selector: { entity: { domain: ["select", "input_select"] } },
    },
    {
      name: "volume",
      label: "Volume Control (Optional Override)",
      selector: { entity: { domain: ["number", "input_number"] } },
    },
    {
      name: "child_lock",
      label: "Child Lock (Optional)",
      selector: { entity: { domain: ["switch", "input_boolean"] } },
    },
    {
      name: "empty_mode",
      label: "Empty Mode (Optional)",
      selector: { entity: { domain: ["select", "input_select"] } },
    },
    {
      name: "battery",
      label: "Battery Sensor (Optional Override)",
      selector: { entity: { domain: "sensor" } },
    },
    {
      name: "charging",
      label: "Charging Sensor (Optional Override)",
      selector: { entity: { domain: ["binary_sensor", "sensor"] } },
    },
    {
      name: "mop_intensity",
      label: "Mop Intensity (Optional Override)",
      selector: { entity: { domain: "select" } },
    },
    {
      name: "mop_mode",
      label: "Mop Route Mode (Optional Override)",
      selector: { entity: { domain: "select" } },
    },
    {
      name: "filter",
      label: "Filter Sensor (Optional Override)",
      selector: { entity: { domain: "sensor" } },
    },
    {
      name: "main_brush",
      label: "Main Brush (Optional Override)",
      selector: { entity: { domain: "sensor" } },
    },
    {
      name: "side_brush",
      label: "Side Brush (Optional Override)",
      selector: { entity: { domain: "sensor" } },
    },
    {
      name: "sensors",
      label: "Sensors Clean (Optional Override)",
      selector: { entity: { domain: "sensor" } },
    },
    {
      name: "clean_water",
      label: "Clean Water Box (Optional Override)",
      selector: { entity: { domain: ["sensor", "binary_sensor"] } },
    },
    {
      name: "dirty_water",
      label: "Dirty Water Box (Optional Override)",
      selector: { entity: { domain: ["sensor", "binary_sensor"] } },
    },
    {
      name: "dock_error",
      label: "Dock Error (Optional Override)",
      selector: { entity: { domain: ["sensor", "binary_sensor"] } },
    },
    {
      name: "mop_drying",
      label: "Mop Drying Status (Optional Override)",
      selector: { entity: { domain: ["sensor", "binary_sensor"] } },
    },
    {
      name: "mop_drying_time",
      label: "Mop Drying Time (Optional Override)",
      selector: { entity: { domain: "sensor" } },
    },
    {
      name: "strainer",
      label: "Strainer Time Left (Optional Override)",
      selector: { entity: { domain: "sensor" } },
    },
    {
      name: "reset_filter",
      label: "Reset Filter Button",
      selector: { entity: { domain: "button" } },
    },
    {
      name: "reset_main_brush",
      label: "Reset Main Brush Button",
      selector: { entity: { domain: "button" } },
    },
    {
      name: "reset_side_brush",
      label: "Reset Side Brush Button",
      selector: { entity: { domain: "button" } },
    },
    {
      name: "reset_sensor",
      label: "Reset Sensors Button",
      selector: { entity: { domain: "button" } },
    },
    {
      name: "reset_strainer",
      label: "Reset Strainer Button",
      selector: { entity: { domain: "button" } },
    },
  ];

  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    const val = ev.detail.value;
    const newConfig = {
      ...this._config,
      entity: val.entity,
      map_camera: val.map_camera,
      schedule_enable: val.schedule_enable,
    };

    if (
      val.mop_intensity ||
      val.mop_mode ||
      val.child_lock ||
      val.empty_mode ||
      val.selected_map ||
      val.volume
    ) {
      newConfig.options = {
        mop_intensity: val.mop_intensity,
        mop_mode: val.mop_mode,
        child_lock: val.child_lock,
        empty_mode: val.empty_mode,
        selected_map: val.selected_map,
        volume: val.volume,
      };
    }

    if (
      val.filter ||
      val.main_brush ||
      val.side_brush ||
      val.sensors ||
      val.battery ||
      val.charging ||
      val.clean_water ||
      val.dirty_water ||
      val.dock_error ||
      val.mop_drying ||
      val.mop_drying_time ||
      val.strainer
    ) {
      newConfig.sensors = {
        filter: val.filter,
        main_brush: val.main_brush,
        side_brush: val.side_brush,
        sensors: val.sensors,
        battery: val.battery,
        charging: val.charging,
        clean_water: val.clean_water,
        dirty_water: val.dirty_water,
        dock_error: val.dock_error,
        mop_drying: val.mop_drying,
        mop_drying_time: val.mop_drying_time,
        strainer: val.strainer,
      };
    }

    if (
      val.reset_filter ||
      val.reset_main_brush ||
      val.reset_side_brush ||
      val.reset_sensor ||
      val.reset_strainer
    ) {
      newConfig.buttons = {
        reset_filter: val.reset_filter,
        reset_main_brush: val.reset_main_brush,
        reset_side_brush: val.reset_side_brush,
        reset_sensor: val.reset_sensor,
        reset_strainer: val.reset_strainer,
      };
    }

    const event = new Event("config-changed", {
      bubbles: true,
      composed: true,
    });
    event.detail = { config: newConfig };
    this.dispatchEvent(event);
  }

  render() {
    if (!this.hass || !this._config) return html``;
    const data = {
      entity: this._config.entity || "",
      map_camera: this._config.map_camera || "",
      schedule_enable: this._config.schedule_enable || "",
      selected_map: this._config.options?.selected_map || "",
      volume: this._config.options?.volume || "",
      child_lock: this._config.options?.child_lock || "",
      empty_mode: this._config.options?.empty_mode || "",
      mop_intensity: this._config.options?.mop_intensity || "",
      mop_mode: this._config.options?.mop_mode || "",
      filter: this._config.sensors?.filter || "",
      main_brush: this._config.sensors?.main_brush || "",
      side_brush: this._config.sensors?.side_brush || "",
      sensors: this._config.sensors?.sensors || "",
      battery: this._config.sensors?.battery || "",
      charging: this._config.sensors?.charging || "",
      clean_water: this._config.sensors?.clean_water || "",
      dirty_water: this._config.sensors?.dirty_water || "",
      dock_error: this._config.sensors?.dock_error || "",
      mop_drying: this._config.sensors?.mop_drying || "",
      mop_drying_time: this._config.sensors?.mop_drying_time || "",
      strainer: this._config.sensors?.strainer || "",
      reset_filter: this._config.buttons?.reset_filter || "",
      reset_main_brush: this._config.buttons?.reset_main_brush || "",
      reset_side_brush: this._config.buttons?.reset_side_brush || "",
      reset_sensor: this._config.buttons?.reset_sensor || "",
      reset_strainer: this._config.buttons?.reset_strainer || "",
    };

    return html`
      <div style="padding: 0 16px 16px; color: var(--primary-text-color);">
        <ha-form
          .hass=${this.hass}
          .data=${data}
          .schema=${this._schema}
          .computeLabel=${(s) => s.label || s.name}
          @value-changed=${this._valueChanged}
        ></ha-form>
        <p
          style="font-size: 12px; color: var(--secondary-text-color); margin-top: 24px; border-top: 1px solid var(--divider-color); padding-top: 12px;"
        >
          * Note: Leave optional overrides blank to auto-discover entities.
          Rooms and Routines are auto-discovered from your Map attributes and
          Button entities respectively.
        </p>
      </div>
    `;
  }
}

// --- REGISTRATION ---
if (!customElements.get("passable-vacuum-card-editor")) {
  customElements.define(
    "passable-vacuum-card-editor",
    PassableVacuumCardEditor
  );
}

PassableVacuumCard.getConfigElement = async () =>
  document.createElement("passable-vacuum-card-editor");

PassableVacuumCard.getStubConfig = (hass, entities, entitiesFallback) => {
  let vacuumEntity = "";
  if (entities && entities.length > 0) {
    vacuumEntity = entities.find((e) => e.startsWith("vacuum.")) || "";
  }
  if (!vacuumEntity && hass && hass.states) {
    vacuumEntity =
      Object.keys(hass.states).find((e) => e.startsWith("vacuum.")) || "";
  }
  if (!vacuumEntity && entitiesFallback && entitiesFallback.length > 0) {
    vacuumEntity = entitiesFallback.find((e) => e.startsWith("vacuum.")) || "";
  }
  let mapCamera = "";
  if (hass && hass.states) {
    mapCamera =
      Object.keys(hass.states).find(
        (e) =>
          (e.startsWith("camera.") || e.startsWith("image.")) &&
          e.toLowerCase().includes("map")
      ) || "";
  }
  return {
    type: "custom:passable-vacuum-card",
    entity: vacuumEntity,
    map_camera: mapCamera,
  };
};

if (!customElements.get("passable-vacuum-card")) {
  customElements.define("passable-vacuum-card", PassableVacuumCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "custom:passable-vacuum-card")) {
  window.customCards.push({
    type: "custom:passable-vacuum-card",
    name: "Passable Vacuum Card",
    preview: true,
    description:
      "A highly interactive, native LitElement dashboard card for Home Assistant robot vacuums.",
  });
}