/**
 * Passable Vacuum Card
 * Version: 2.0.0
 * GitHub: https://github.com/GBear09/passable-vacuum-card
 *
 * Passable design-system robot vacuum card featuring model-accurate Roborock Q Revo &
 * Multifunctional Dock visuals, interactive multi-floor map with room/zone/pin/routine modes,
 * compact "summary" overview mode, and a responsive 4-tab Command Center (Map, Controls & Dock,
 * Schedule, Health).
 */

const CARD_VERSION = "2.0.0";

const VACUUM_TABS = [
  { id: "map", label: "Map", icon: "mdi:map-outline" },
  { id: "controls", label: "Controls & Dock", icon: "mdi:tune-variant" },
  { id: "scheduling", label: "Schedule", icon: "mdi:calendar-clock" },
  { id: "diagnostics", label: "Health", icon: "mdi:heart-pulse" },
];

const LitElement = Object.getPrototypeOf(
  customElements.get("ha-panel-lovelace") ||
    customElements.get("hui-entities-card") ||
    customElements.get("hui-masonry-view") ||
    customElements.get("hc-main")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;
const svg =
  LitElement.prototype.svg ||
  ((strings, ...values) => {
    const result = html(strings, ...values);
    if (result && typeof result === "object") {
      return Object.assign({}, result, { _$litType$: 2, type: "svg" });
    }
    return result;
  });

console.info(
  `%c PASSABLE-VACUUM-CARD %c v${CARD_VERSION} IS LOADED `,
  "color: white; background: #0284c7; font-weight: bold; padding: 2px 6px; border-radius: 4px 0 0 4px;",
  "color: #0284c7; background: #e0f2fe; font-weight: bold; padding: 2px 6px; border-radius: 0 4px 4px 0;"
);

function formatSettingName(val) {
  if (typeof val !== "string") return val;
  return val
    .replace(/_/g, " ")
    .replace(/\bplus\b/gi, "+")
    .replace(/\bvac and mop\b/gi, "Vac & Mop")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatDryingTime(timeInSeconds) {
  const num = parseInt(timeInSeconds, 10);
  if (isNaN(num) || num <= 0) return "";
  const h = Math.floor(num / 3600);
  const m = Math.floor((num % 3600) / 60);
  return `${h > 0 ? `${h}h ` : ""}${m}m`;
}

function formatDurationMins(rawMins) {
  const num = parseFloat(rawMins);
  if (isNaN(num) || num <= 0) return "--";
  const mins = Math.round(num);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatRelativeTime(timestamp) {
  if (!timestamp || timestamp === "unavailable" || timestamp === "unknown") return "--";
  const then = new Date(timestamp);
  if (isNaN(then.getTime())) return String(timestamp);
  const diffSec = Math.max(0, Math.floor((Date.now() - then.getTime()) / 1000));
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

class PassableVacuumCard extends LitElement {
  static getConfigElement() {
    return document.createElement("passable-vacuum-card-editor");
  }

  static getStubConfig(hass, entities, entitiesFallback) {
    let vacuumEntity = "";
    if (entities && entities.length > 0) {
      vacuumEntity = entities.find((e) => e.startsWith("vacuum.")) || "";
    }
    if (!vacuumEntity && hass && hass.states) {
      vacuumEntity = Object.keys(hass.states).find((e) => e.startsWith("vacuum.")) || "";
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
            (e.toLowerCase().includes("custom") || e.toLowerCase().includes("map"))
        ) || "";
    }
    return {
      entity: vacuumEntity,
      map_camera: mapCamera,
      display_mode: "full",
      layout: "hero",
      show_summary_strip: true,
      show_footer_strip: true,
    };
  }

  static properties = {
    hass: { attribute: false },
    config: { state: true },
    _activeTab: { state: true },
    _animDirection: { state: true },
    _modalOpen: { state: true },
    _trayExpanded: { state: true },
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
    _toastMsg: { state: true },
  };

  constructor() {
    super();
    this._activeTab = "map";
    this._animDirection = "none";
    this._modalOpen = false;
    this._trayExpanded = false;
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
    this._toastMsg = null;
    this._entityMap = null;
    this._cachedBaseName = null;
    this._boundMapEl = null;
    this._toastTimer = null;
    this._closeModalTimer = null;
    this._swipeResetTimer = null;
    this._popupTouchStartY = undefined;
    this._popupTouchStartX = undefined;
    this._popupTouchCurrentY = undefined;
    this._popupTouchTarget = null;
    this._popupTouchDragging = false;
    this._popupTouchLockedHorizontal = false;
    this._scrollLockedElements = null;
    this._scrollGuardOverlay = null;
    this._guardTouchY = 0;
    this._guardTouchX = 0;
    this._wheelHandler = this._handleWheel.bind(this);
    this._touchStartHandler = this._handleTouchStart.bind(this);
    this._touchMoveHandler = this._handleTouchMove.bind(this);
    this._touchEndHandler = this._handleTouchEnd.bind(this);
    this._onOverlayWheel = this._onOverlayWheel.bind(this);
    this._onOverlayTouchStart = this._onOverlayTouchStart.bind(this);
    this._onOverlayTouchMove = this._onOverlayTouchMove.bind(this);
    this._onKeyDown = (ev) => {
      if (ev.key === "Escape") {
        if (this._activePopup || this._showRoutinePopup) {
          this._activePopup = null;
          this._showRoutinePopup = false;
        } else if (this._modalOpen) {
          this._closeModal();
        }
      }
    };
  }

  setConfig(config) {
    if (!config) {
      throw new Error("Invalid configuration.");
    }
    const displayMode = config.display_mode === "summary" ? "summary" : "full";
    const defaultShowHeader = displayMode === "full";
    this.config = {
      display_mode: displayMode,
      layout: config.layout === "rings" ? "rings" : "hero",
      show_header:
        config.show_header !== undefined
          ? config.show_header !== false
          : defaultShowHeader,
      show_summary_strip: config.show_summary_strip !== false,
      show_footer_strip: config.show_footer_strip !== false,
      map_height: config.map_height || 380,
      ...config,
    };
    this._entityMap = null;
    if (this.hass) {
      this._discoverEntities();
    }
  }

  getCardSize() {
    if (this.config?.display_mode === "summary") return 4;
    return 9;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("keydown", this._onKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._onKeyDown);
    this._detachMapListeners();
    this._detachOverlayScrollGuard();
    this._unlockBackgroundScroll();
    clearTimeout(this._toastTimer);
    clearTimeout(this._closeModalTimer);
    clearTimeout(this._swipeResetTimer);
  }

  updated(changedProps) {
    if (
      (changedProps.has("config") ||
        !this._entityMap ||
        Object.keys(this._entityMap).length === 0) &&
      this.hass &&
      this.config
    ) {
      this._discoverEntities();
    }
    this._bindMapContainer();
    if (this._modalOpen && this.config?.display_mode === "summary") {
      this._attachOverlayScrollGuard();
    } else {
      this._detachOverlayScrollGuard();
    }
  }

  shouldUpdate(changedProps) {
    if (!changedProps.has("hass")) return true;
    for (const key of changedProps.keys()) {
      if (key !== "hass") return true;
    }
    const oldHass = changedProps.get("hass");
    const newHass = this.hass;
    if (!oldHass || !newHass || !oldHass.states || !newHass.states || !this.config) {
      return true;
    }
    const watched = new Set();
    if (this.config.entity) watched.add(this.config.entity);
    if (this.config.map_camera) watched.add(this.config.map_camera);
    if (this._entityMap) {
      Object.values(this._entityMap).forEach((val) => {
        if (typeof val === "string") watched.add(val);
        else if (Array.isArray(val)) val.forEach((v) => watched.add(v));
      });
    }
    [
      "input_boolean.cleaning_enable_schedule",
      "input_boolean.cleaning_enable_post_dinner",
      "input_boolean.cleaning_post_dinner_clean_canceled",
      "input_select.cleaning_routine_sunday",
      "input_select.cleaning_routine_monday",
      "input_select.cleaning_routine_tuesday",
      "input_select.cleaning_routine_wednesday",
      "input_select.cleaning_routine_thursday",
      "input_select.cleaning_routine_friday",
      "input_select.cleaning_routine_saturday",
    ].forEach((id) => watched.add(id));

    for (const id of watched) {
      if (oldHass.states[id] !== newHass.states[id]) {
        return true;
      }
    }
    return false;
  }

  _bindMapContainer() {
    const mapEl = this.shadowRoot?.querySelector("#map-container") || null;
    if (mapEl === this._boundMapEl) return;
    this._detachMapListeners();
    if (mapEl) {
      mapEl.addEventListener("wheel", this._wheelHandler, { passive: false });
      mapEl.addEventListener("touchstart", this._touchStartHandler, { passive: false });
      mapEl.addEventListener("touchmove", this._touchMoveHandler, { passive: false });
      mapEl.addEventListener("touchend", this._touchEndHandler);
      this._boundMapEl = mapEl;
    }
  }

  _detachMapListeners() {
    if (!this._boundMapEl) return;
    this._boundMapEl.removeEventListener("wheel", this._wheelHandler);
    this._boundMapEl.removeEventListener("touchstart", this._touchStartHandler);
    this._boundMapEl.removeEventListener("touchmove", this._touchMoveHandler);
    this._boundMapEl.removeEventListener("touchend", this._touchEndHandler);
    this._boundMapEl = null;
  }

  // =========================================================================
  // FEEDBACK & MODAL SCROLL LOCK
  // =========================================================================

  _fireHaptic(type = "light") {
    const event = new Event("haptic", { bubbles: true, composed: true });
    event.detail = type;
    this.dispatchEvent(event);
  }

  _showToast(msg) {
    this._toastMsg = msg;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this._toastMsg = null;
    }, 2400);
  }

  _openModal(tab = "map", ev = null) {
    if (ev) ev.stopPropagation();
    this._fireHaptic("light");
    clearTimeout(this._closeModalTimer);
    clearTimeout(this._swipeResetTimer);
    this._activeTab = tab || "map";
    this._animDirection = "none";
    if (this.config?.display_mode !== "summary") {
      this.requestUpdate();
      return;
    }
    this._modalOpen = true;
    this._lockBackgroundScroll();
  }

  _closeModal() {
    this._fireHaptic("light");
    clearTimeout(this._swipeResetTimer);
    const overlay = this.shadowRoot?.querySelector(".popup-overlay.modal-shell");
    const content = this.shadowRoot?.querySelector(".popup-content.modal-shell-card");
    if (overlay) overlay.classList.add("closing");
    if (content) content.classList.add("closing");
    clearTimeout(this._closeModalTimer);
    this._closeModalTimer = setTimeout(() => {
      this._modalOpen = false;
      this._detachOverlayScrollGuard();
      this._unlockBackgroundScroll();
      this.requestUpdate();
    }, 180);
  }

  _switchTab(tabId) {
    if (this._activeTab === tabId) return;
    const order = VACUUM_TABS.map((t) => t.id);
    const curIdx = order.indexOf(this._activeTab);
    const nextIdx = order.indexOf(tabId);
    this._animDirection = nextIdx > curIdx ? "slide-left" : "slide-right";
    this._activeTab = tabId;
    this._fireHaptic("light");
  }

  _lockBackgroundScroll() {
    if (this._scrollLockedElements) return;
    const lockMap = (window.__passableScrollLocks = window.__passableScrollLocks || new Map());
    const targets = new Set();
    if (document.documentElement) targets.add(document.documentElement);
    if (document.body) targets.add(document.body);
    if (document.scrollingElement) targets.add(document.scrollingElement);
    let node = this.parentNode;
    while (node) {
      if (node.nodeType === 1) {
        const oy = window.getComputedStyle(node).overflowY;
        if (oy === "auto" || oy === "scroll" || oy === "overlay" || node.id === "view") {
          targets.add(node);
        }
      }
      node = node.parentNode || node.host || null;
    }
    const locked = [];
    targets.forEach((el) => {
      let entry = lockMap.get(el);
      if (!entry) {
        entry = {
          count: 0,
          overflow: el.style.overflow,
          overflowY: el.style.overflowY,
          overscrollBehavior: el.style.overscrollBehavior,
        };
        lockMap.set(el, entry);
      }
      if (entry.count === 0) {
        el.style.overflowY = "hidden";
        el.style.overscrollBehavior = "none";
      }
      entry.count += 1;
      locked.push(el);
    });
    this._scrollLockedElements = locked;
  }

  _unlockBackgroundScroll() {
    if (!this._scrollLockedElements) return;
    const lockMap = window.__passableScrollLocks;
    this._scrollLockedElements.forEach((el) => {
      const entry = lockMap && lockMap.get(el);
      if (!entry) return;
      entry.count -= 1;
      if (entry.count <= 0) {
        el.style.overflow = entry.overflow;
        el.style.overflowY = entry.overflowY;
        el.style.overscrollBehavior = entry.overscrollBehavior;
        lockMap.delete(el);
      }
    });
    this._scrollLockedElements = null;
  }

  _attachOverlayScrollGuard() {
    const overlay = this.shadowRoot?.querySelector(".popup-overlay.modal-shell");
    if (overlay === this._scrollGuardOverlay) return;
    this._detachOverlayScrollGuard();
    if (!overlay) return;
    overlay.addEventListener("wheel", this._onOverlayWheel, { passive: false });
    overlay.addEventListener("touchstart", this._onOverlayTouchStart, { passive: true });
    overlay.addEventListener("touchmove", this._onOverlayTouchMove, { passive: false });
    this._scrollGuardOverlay = overlay;
  }

  _detachOverlayScrollGuard() {
    if (!this._scrollGuardOverlay) return;
    this._scrollGuardOverlay.removeEventListener("wheel", this._onOverlayWheel);
    this._scrollGuardOverlay.removeEventListener("touchstart", this._onOverlayTouchStart);
    this._scrollGuardOverlay.removeEventListener("touchmove", this._onOverlayTouchMove);
    this._scrollGuardOverlay = null;
  }

  _findModalScrollContainer(ev, overlay) {
    const path = typeof ev.composedPath === "function" ? ev.composedPath() : [];
    const contentEl = overlay ? overlay.querySelector(".popup-content.modal-shell-card") : null;
    if (!contentEl || !path.includes(contentEl)) return null;
    for (const el of path) {
      if (el === overlay) break;
      if (!el || el.nodeType !== 1 || !contentEl.contains(el)) continue;
      const oy = window.getComputedStyle(el).overflowY;
      if ((oy === "auto" || oy === "scroll" || oy === "overlay") && el.scrollHeight > el.clientHeight + 1) {
        return el;
      }
    }
    return null;
  }

  _onOverlayWheel(ev) {
    const path = typeof ev.composedPath === "function" ? ev.composedPath() : [];
    if (path.some((el) => el?.id === "map-container")) return;
    const scroller = this._findModalScrollContainer(ev, this._scrollGuardOverlay);
    if (!scroller) {
      if (ev.cancelable) ev.preventDefault();
      return;
    }
    const atTop = scroller.scrollTop <= 0;
    const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
    if ((ev.deltaY < 0 && atTop) || (ev.deltaY > 0 && atBottom)) {
      if (ev.cancelable) ev.preventDefault();
    }
  }

  _onOverlayTouchStart(ev) {
    if (ev.touches && ev.touches.length === 1) {
      this._guardTouchY = ev.touches[0].clientY;
      this._guardTouchX = ev.touches[0].clientX;
    }
  }

  _onOverlayTouchMove(ev) {
    if (!ev.touches || ev.touches.length !== 1) return;
    const path = typeof ev.composedPath === "function" ? ev.composedPath() : [];
    if (path.some((el) => el?.id === "map-container" || (el?.tagName === "INPUT" && el.type === "range"))) return;
    const curY = ev.touches[0].clientY;
    const curX = ev.touches[0].clientX;
    const dy = curY - this._guardTouchY;
    const dx = curX - this._guardTouchX;
    this._guardTouchY = curY;
    this._guardTouchX = curX;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 4) return;
    const scroller = this._findModalScrollContainer(ev, this._scrollGuardOverlay);
    if (!scroller) {
      if (ev.cancelable) ev.preventDefault();
      return;
    }
    const atTop = scroller.scrollTop <= 0;
    const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
    if ((dy > 0 && atTop) || (dy < 0 && atBottom)) {
      if (ev.cancelable) ev.preventDefault();
    }
  }

  _handlePopupTouchStart(e) {
    if (!e.touches || e.touches.length !== 1) return;
    const path = typeof e.composedPath === "function" ? e.composedPath() : [];
    if (path.some((el) => el?.id === "map-container" || el?.tagName === "INPUT")) return;
    const popupContent = e.currentTarget;
    const scrollArea = popupContent.querySelector(".modal-scroll-area");
    if (scrollArea && e.target && scrollArea.contains(e.target) && scrollArea.scrollTop > 0) return;
    clearTimeout(this._swipeResetTimer);
    this._popupTouchStartY = e.touches[0].clientY;
    this._popupTouchStartX = e.touches[0].clientX;
    this._popupTouchCurrentY = this._popupTouchStartY;
    this._popupTouchTarget = popupContent;
    this._popupTouchDragging = false;
    this._popupTouchLockedHorizontal = false;
  }

  _handlePopupTouchMove(e) {
    if (this._popupTouchStartY === undefined || !this._popupTouchTarget || this._popupTouchLockedHorizontal) return;
    if (!e.touches || e.touches.length !== 1) return;
    const popupContent = this._popupTouchTarget;
    const curY = e.touches[0].clientY;
    const curX = e.touches[0].clientX;
    const dy = curY - this._popupTouchStartY;
    const dx = curX - (this._popupTouchStartX ?? curX);
    if (!this._popupTouchDragging) {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
        this._popupTouchLockedHorizontal = true;
        return;
      }
      if (dy > 6) {
        this._popupTouchDragging = true;
        popupContent.style.animation = "none";
        popupContent.style.transition = "none";
      } else {
        return;
      }
    }
    if (dy > 0) {
      if (e.cancelable) e.preventDefault();
      this._popupTouchCurrentY = curY;
      popupContent.style.transform = `translateY(${dy}px)`;
    }
  }

  _handlePopupTouchEnd() {
    if (this._popupTouchStartY === undefined || !this._popupTouchTarget) return;
    const popupContent = this._popupTouchTarget;
    const deltaY = this._popupTouchDragging && this._popupTouchCurrentY !== undefined
      ? this._popupTouchCurrentY - this._popupTouchStartY
      : 0;
    const wasDragging = this._popupTouchDragging;
    this._popupTouchStartY = undefined;
    this._popupTouchStartX = undefined;
    this._popupTouchCurrentY = undefined;
    this._popupTouchTarget = null;
    this._popupTouchDragging = false;
    this._popupTouchLockedHorizontal = false;
    if (deltaY > 80) {
      this._closeModal();
    } else if (wasDragging) {
      popupContent.style.transition = "transform 250ms cubic-bezier(0.2, 0, 0, 1)";
      popupContent.style.transform = "translateY(0px)";
      this._swipeResetTimer = setTimeout(() => {
        popupContent.style.transition = "";
        popupContent.style.transform = "";
      }, 250);
    }
  }

  // =========================================================================
  // ENTITY DISCOVERY & TELEMETRY
  // =========================================================================

  _discoverEntities() {
    if (!this.hass || !this.config) return;
    const vacuumId = this.config.entity || "";
    if (!vacuumId) {
      this._entityMap = {};
      this._cachedBaseName = "";
      return;
    }
    const baseName = vacuumId.split(".")[1] || "";
    const cleanBase = baseName.replace(/_vacuum|_robot/g, "");
    this._cachedBaseName = baseName;

    const findEnt = (configVal, domains, keywords) => {
      if (configVal && String(configVal).trim() !== "") return String(configVal).trim();
      const domainArr = Array.isArray(domains) ? domains : [domains];
      const allIds = Object.keys(this.hass.states);

      for (const d of domainArr) {
        const domainEntities = allIds.filter((e) => e.startsWith(`${d}.`));
        for (const entity of domainEntities) {
          const objId = entity.split(".")[1] || "";
          if (objId.startsWith(baseName) && keywords.some((kw) => objId.toLowerCase().includes(kw))) {
            return entity;
          }
        }
        for (const entity of domainEntities) {
          const objId = entity.split(".")[1] || "";
          if (objId.includes(cleanBase) && keywords.some((kw) => objId.toLowerCase().includes(kw))) {
            return entity;
          }
        }
        for (const entity of domainEntities) {
          const objId = entity.split(".")[1] || "";
          if (keywords.some((kw) => objId.toLowerCase().includes(kw))) {
            return entity;
          }
        }
      }
      return null;
    };

    const c = this.config;
    const mapImages = Object.keys(this.hass.states).filter(
      (e) => (e.startsWith("image.") || e.startsWith("camera.")) && e.toLowerCase().includes(cleanBase)
    );

    this._entityMap = {
      cleaningMode: findEnt(c.options?.cleaning_mode, "select", ["cleaning_mode"]),
      mopIntensity: findEnt(c.options?.mop_intensity, "select", ["mop_intensity", "water_level"]),
      mopMode: findEnt(c.options?.mop_mode, "select", ["mop_route", "mop_mode", "route"]),
      filter: findEnt(c.sensors?.filter, "sensor", ["filter_time_left", "filter"]),
      mainBrush: findEnt(c.sensors?.main_brush, "sensor", ["main_brush_time_left", "main_brush"]),
      sideBrush: findEnt(c.sensors?.side_brush, "sensor", ["side_brush_time_left", "side_brush"]),
      sensorDirty: findEnt(c.sensors?.sensors, "sensor", ["sensor_time_left", "sensor_dirty"]),
      strainer: findEnt(c.sensors?.strainer, "sensor", ["strainer_time_left", "strainer"]),
      battery: findEnt(c.sensors?.battery, "sensor", ["battery"]),
      charging: findEnt(c.sensors?.charging, ["binary_sensor", "sensor"], ["_charging", "battery_state"]),
      cleaningBinary: findEnt(c.sensors?.cleaning, "binary_sensor", ["_cleaning"]),
      status: findEnt(c.sensors?.status, "sensor", ["_status"]),
      currentRoom: findEnt(c.sensors?.current_room, "sensor", ["current_room"]),
      cleaningProgress: findEnt(c.sensors?.cleaning_progress, "sensor", ["cleaning_progress"]),
      cleaningArea: findEnt(c.sensors?.cleaning_area, "sensor", ["_cleaning_area"]),
      cleaningTime: findEnt(c.sensors?.cleaning_time, "sensor", ["_cleaning_time"]),
      lastCleanBegin: findEnt(c.sensors?.last_clean_begin, "sensor", ["last_clean_begin"]),
      lastCleanEnd: findEnt(c.sensors?.last_clean_end, "sensor", ["last_clean_end"]),
      totalArea: findEnt(c.sensors?.total_cleaning_area, "sensor", ["total_cleaning_area"]),
      totalCount: findEnt(c.sensors?.total_cleaning_count, "sensor", ["total_cleaning_count"]),
      totalTime: findEnt(c.sensors?.total_cleaning_time, "sensor", ["total_cleaning_time"]),
      vacuumError: findEnt(c.sensors?.vacuum_error, "sensor", ["vacuum_error"]),
      mopAttached: findEnt(null, "binary_sensor", ["mop_attached"]),
      waterBoxAttached: findEnt(null, "binary_sensor", ["water_box_attached"]),
      waterShortage: findEnt(null, "binary_sensor", ["water_shortage"]),
      childLock: findEnt(c.options?.child_lock, ["switch", "input_boolean"], ["child_lock"]),
      emptyMode: findEnt(c.options?.empty_mode, ["select", "input_select"], ["empty_mode", "dust_collection"]),
      cleanWater: findEnt(c.sensors?.clean_water, ["binary_sensor", "sensor"], ["clean_water"]),
      dirtyWater: findEnt(c.sensors?.dirty_water, ["binary_sensor", "sensor"], ["dirty_water"]),
      dockError: findEnt(c.sensors?.dock_error, ["sensor", "binary_sensor"], ["dock_error"]),
      mopDryingSensor: findEnt(c.sensors?.mop_drying, "binary_sensor", ["mop_drying"]),
      dockMopDryingSwitch: findEnt(c.options?.dock_mop_drying, "switch", ["dock_mop_drying"]),
      dockMopWashingSwitch: findEnt(c.options?.dock_mop_washing, "switch", ["dock_mop_washing"]),
      dockDustEmptyingSwitch: findEnt(c.options?.dock_dust_emptying, "switch", ["dock_dust_emptying"]),
      resolveDockErrorBtn: findEnt(c.buttons?.resolve_dock_error, "button", ["resolve_dock_error"]),
      mopDryingTime: findEnt(c.sensors?.mop_drying_time, "sensor", ["mop_drying_remaining", "drying_time"]),
      dndSwitch: findEnt(c.options?.dnd_switch, "switch", ["do_not_disturb"]),
      dndBegin: findEnt(c.options?.dnd_begin, "time", ["do_not_disturb_begin"]),
      dndEnd: findEnt(c.options?.dnd_end, "time", ["do_not_disturb_end"]),
      volume: findEnt(c.options?.volume, ["number", "input_number"], ["volume"]),
      selectedMap: findEnt(c.options?.selected_map, ["select", "input_select"], ["selected_map"]),
      postDinnerEnable: this.hass.states["input_boolean.cleaning_enable_post_dinner"]
        ? "input_boolean.cleaning_enable_post_dinner"
        : null,
      postDinnerCanceled: this.hass.states["input_boolean.cleaning_post_dinner_clean_canceled"]
        ? "input_boolean.cleaning_post_dinner_clean_canceled"
        : null,
      resetFilter: findEnt(c.buttons?.reset_filter, "button", ["reset_air_filter", "reset_filter"]),
      resetMainBrush: findEnt(c.buttons?.reset_main_brush, "button", ["reset_main_brush"]),
      resetSideBrush: findEnt(c.buttons?.reset_side_brush, "button", ["reset_side_brush"]),
      resetSensor: findEnt(c.buttons?.reset_sensor, "button", ["reset_sensor"]),
      resetStrainer: findEnt(c.buttons?.reset_strainer, "button", ["reset_strainer"]),
      mapImages,
    };
  }

  _resolveActiveMapEntityId(selectedMapState) {
    const configured = this.config.map_camera || null;
    const candidates = this._entityMap?.mapImages || [];
    if (selectedMapState && candidates.length > 0) {
      const slug = selectedMapState.toLowerCase().replace(/\s+/g, "_");
      const customMatch = candidates.find(
        (id) => id.toLowerCase().includes(slug) && id.toLowerCase().includes("_custom")
      );
      if (customMatch) return customMatch;
      const anyFloorMatch = candidates.find((id) => id.toLowerCase().includes(slug));
      if (anyFloorMatch) return anyFloorMatch;
    }
    return configured || candidates[0] || null;
  }

  get data() {
    if (!this.hass || !this.config || !this._entityMap) return null;
    const vacuumId = this.config.entity;
    const vacuumStateObj = this.hass.states[vacuumId];
    if (!vacuumStateObj) return null;

    const getE = (id) => (id ? this.hass.states[id] || null : null);
    const attributes = vacuumStateObj.attributes || {};
    const vacuumName = this.config.title || attributes.friendly_name || "Roborock Q Revo";
    const selectedMapObj = getE(this._entityMap.selectedMap);
    const mapId = this._resolveActiveMapEntityId(selectedMapObj?.state);
    const mapStateObj = mapId ? this.hass.states[mapId] : null;

    let batteryLevel = attributes.battery_level ?? attributes.battery ?? 0;
    const batEnt = getE(this._entityMap.battery);
    if (batEnt && !isNaN(parseInt(batEnt.state, 10))) {
      batteryLevel = parseInt(batEnt.state, 10);
    }

    const statusEnt = getE(this._entityMap.status);
    const statusVal = String(statusEnt?.state || vacuumStateObj.state || "").toLowerCase();
    const chargingEnt = getE(this._entityMap.charging);
    const isCharging = chargingEnt
      ? chargingEnt.state === "on" || chargingEnt.state === "charging"
      : statusVal === "charging";
    const isActivelyCharging =
      isCharging && batteryLevel < 100 && statusVal !== "charging_complete";

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
          !e.includes("reset") &&
          !e.includes("resolve")
      )
      .map((e) => {
        let cleanName = this.hass.states[e]?.attributes?.friendly_name || e.split(".").pop();
        cleanName = cleanName
          .replace(new RegExp(String(attributes.friendly_name || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig"), "")
          .replace(/roborock\s*q\s*revo/gi, "")
          .replace(/roborock/gi, "")
          .replace(/^[\s-]+/, "")
          .trim();
        return { id: e, name: cleanName || "Routine" };
      });

    const scheduleEnableId =
      this.config.schedule_enable || "input_boolean.cleaning_enable_schedule";

    const consumables = [
      { key: "filter", label: "HEPA Filter", entity: getE(this._entityMap.filter), max: 150, reset: this._entityMap.resetFilter },
      { key: "mainBrush", label: "Main Brush", entity: getE(this._entityMap.mainBrush), max: 300, reset: this._entityMap.resetMainBrush },
      { key: "sideBrush", label: "Side Brush", entity: getE(this._entityMap.sideBrush), max: 200, reset: this._entityMap.resetSideBrush },
      { key: "sensorDirty", label: "Sensors Clean", entity: getE(this._entityMap.sensorDirty), max: 30, reset: this._entityMap.resetSensor },
      { key: "strainer", label: "Dock Strainer", entity: getE(this._entityMap.strainer), max: 150, reset: this._entityMap.resetStrainer },
    ]
      .filter((c) => c.entity || c.reset)
      .map((c) => {
        const hours = c.entity && !isNaN(parseFloat(c.entity.state)) ? parseFloat(c.entity.state) : null;
        const pct = hours !== null ? Math.max(0, Math.min(100, (hours / c.max) * 100)) : null;
        return { ...c, hours, pct, overdue: hours !== null && hours <= 0 };
      });

    return {
      vacuumId,
      vacuumName,
      state: vacuumStateObj.state,
      statusVal,
      attributes,
      batteryLevel,
      isCharging,
      isActivelyCharging,
      mapId,
      mapUrl: mapStateObj?.attributes?.entity_picture || null,
      mapData,
      manualRoutines,
      scheduleEnableId,
      scheduleEnableObj: getE(scheduleEnableId),
      consumables,
      entities: {
        cleaningMode: getE(this._entityMap.cleaningMode),
        mopIntensity: getE(this._entityMap.mopIntensity),
        mopMode: getE(this._entityMap.mopMode),
        currentRoom: getE(this._entityMap.currentRoom),
        cleaningProgress: getE(this._entityMap.cleaningProgress),
        cleaningArea: getE(this._entityMap.cleaningArea),
        cleaningTime: getE(this._entityMap.cleaningTime),
        lastCleanBegin: getE(this._entityMap.lastCleanBegin),
        lastCleanEnd: getE(this._entityMap.lastCleanEnd),
        totalArea: getE(this._entityMap.totalArea),
        totalCount: getE(this._entityMap.totalCount),
        totalTime: getE(this._entityMap.totalTime),
        vacuumError: getE(this._entityMap.vacuumError),
        mopAttached: getE(this._entityMap.mopAttached),
        waterBoxAttached: getE(this._entityMap.waterBoxAttached),
        waterShortage: getE(this._entityMap.waterShortage),
      },
      dock: {
        childLock: getE(this._entityMap.childLock),
        emptyMode: getE(this._entityMap.emptyMode),
        cleanWater: getE(this._entityMap.cleanWater),
        dirtyWater: getE(this._entityMap.dirtyWater),
        dockError: getE(this._entityMap.dockError),
        mopDryingSensor: getE(this._entityMap.mopDryingSensor),
        mopDryingSwitch: getE(this._entityMap.dockMopDryingSwitch),
        mopWashingSwitch: getE(this._entityMap.dockMopWashingSwitch),
        dustEmptyingSwitch: getE(this._entityMap.dockDustEmptyingSwitch),
        resolveErrorBtn: this._entityMap.resolveDockErrorBtn,
        mopDryingTime: getE(this._entityMap.mopDryingTime),
      },
      settings: {
        volume: getE(this._entityMap.volume),
        selectedMap: selectedMapObj,
        dndSwitch: getE(this._entityMap.dndSwitch),
        dndBegin: getE(this._entityMap.dndBegin),
        dndEnd: getE(this._entityMap.dndEnd),
        postDinnerEnable: getE(this._entityMap.postDinnerEnable),
        postDinnerCanceled: getE(this._entityMap.postDinnerCanceled),
      },
    };
  }

  // =========================================================================
  // MODEL-ACCURATE ROBOROCK Q REVO + MULTIFUNCTIONAL DOCK SVGs
  // =========================================================================

  _renderQRevoRobotSvg(isCleaning, isCharging, isDrying, size = 42) {
    const ring = isCleaning
      ? "#0284c7"
      : isDrying
      ? "#06b6d4"
      : isCharging
      ? "#16a34a"
      : "var(--divider-color, #94a3b8)";
    return svg`
      <svg width="${size}" height="${size}" viewBox="0 0 48 48" style="display:block;flex-shrink:0;">
        <circle cx="24" cy="24" r="20.5" fill="var(--card-background-color, #f8fafc)" stroke="${ring}" stroke-width="2.4" />
        <path d="M9 17 A17 17 0 0 1 39 17" fill="none" stroke="currentColor" stroke-opacity="0.22" stroke-width="1.5" />
        <circle cx="24" cy="18" r="7" fill="var(--secondary-background-color, #e2e8f0)" stroke="currentColor" stroke-opacity="0.35" stroke-width="1.4" />
        <circle cx="24" cy="18" r="2.6" fill="${ring}" />
        <circle cx="17" cy="34" r="5" fill="var(--secondary-background-color, #cbd5e1)" stroke="currentColor" stroke-opacity="0.3" stroke-width="1" />
        <circle cx="31" cy="34" r="5" fill="var(--secondary-background-color, #cbd5e1)" stroke="currentColor" stroke-opacity="0.3" stroke-width="1" />
      </svg>
    `;
  }

  _renderQRevoDockSvg(isWashing, isDrying, isEmptying, hasError, size = 46) {
    const accent = hasError
      ? "#ef4444"
      : isWashing
      ? "#0284c7"
      : isDrying
      ? "#f97316"
      : isEmptying
      ? "#8b5cf6"
      : "#16a34a";
    return svg`
      <svg width="${size}" height="${size}" viewBox="0 0 48 48" style="display:block;flex-shrink:0;">
        <rect x="11" y="5" width="26" height="33" rx="5" fill="var(--card-background-color, #f8fafc)" stroke="var(--divider-color, #cbd5e1)" stroke-width="2" />
        <line x1="15" y1="12" x2="33" y2="12" stroke="currentColor" stroke-opacity="0.2" stroke-width="1.8" />
        <line x1="15" y1="18" x2="33" y2="18" stroke="currentColor" stroke-opacity="0.2" stroke-width="1.8" />
        <rect x="15" y="22" width="18" height="4" rx="2" fill="${accent}" opacity="0.85" />
        <path d="M8 38 L40 38 L42 43 L6 43 Z" fill="var(--secondary-background-color, #cbd5e1)" stroke="var(--divider-color, #94a3b8)" stroke-width="1.4" />
      </svg>
    `;
  }

  _renderRingMiniGauge(pct, valueText, subText, color) {
    const r = 17;
    const c = 2 * Math.PI * r;
    const clamped = Math.max(0, Math.min(100, pct));
    const dash = (clamped / 100) * c;
    return html`
      <div class="summary-ring-item">
        <div class="summary-ring-wrap">
          ${svg`
            <svg class="summary-ring-svg" viewBox="0 0 42 42">
              <circle cx="21" cy="21" r="${r}" fill="none" stroke="rgba(148, 163, 184, 0.22)" stroke-width="3.4"></circle>
              <circle cx="21" cy="21" r="${r}" fill="none" stroke="${color}" stroke-width="3.4" stroke-linecap="round" stroke-opacity="${clamped > 0 ? 1 : 0}" stroke-dasharray="${dash.toFixed(1)} ${c.toFixed(1)}"></circle>
            </svg>
          `}
          <span class="summary-ring-val">${valueText}</span>
        </div>
        <span class="summary-ring-label">${subText}</span>
      </div>
    `;
  }

  // =========================================================================
  // SERVICE ACTIONS
  // =========================================================================

  _call(domain, service, data, toastMsg = null) {
    if (!this.hass) return;
    this._fireHaptic("light");
    this.hass.callService(domain, service, data);
    if (toastMsg) this._showToast(toastMsg);
  }

  _doAction(action) {
    this._call("vacuum", action, { entity_id: this.config.entity }, formatSettingName(action));
  }

  _locateRobot(ev = null) {
    if (ev) ev.stopPropagation();
    this._call("vacuum", "locate", { entity_id: this.config.entity }, "Pinging Roborock Q Revo");
  }

  _setFanSpeed(speed) {
    this._call("vacuum", "set_fan_speed", { entity_id: this.config.entity, fan_speed: speed });
  }

  _setSelect(entity_id, option) {
    this._call("select", "select_option", { entity_id, option });
  }

  _setInpSelect(entity_id, option) {
    this._call("input_select", "select_option", { entity_id, option });
  }

  _trigger(entity_id, label = "Command sent") {
    this._call("button", "press", { entity_id }, label);
  }

  _toggleSwitch(entity_id, state) {
    const domain = entity_id.split(".")[0];
    this._call(domain, state === "on" ? "turn_off" : "turn_on", { entity_id });
  }

  _setNum(entity_id, value) {
    this._call(entity_id.split(".")[0], "set_value", { entity_id, value: Number(value) });
  }

  _setTime(entity_id, timeVal) {
    this._call("time", "set_value", { entity_id, time: timeVal });
  }

  _sendCmd(command, params) {
    this._call("vacuum", "send_command", { entity_id: this.config.entity, command, params });
  }

  _moreInfo(entityId, ev = null) {
    if (ev) ev.stopPropagation();
    if (!entityId) return;
    this._fireHaptic("light");
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId },
        bubbles: true,
        composed: true,
      })
    );
  }

  // =========================================================================
  // MAP INTERACTIONS
  // =========================================================================

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
    const mapWrapper = this.shadowRoot?.querySelector("#map-wrapper");
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
    if (!mapData.calibration || mapData.calibration.length < 3 || !this._imgInfo.loaded) return null;
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
      x: scales.cp0.vacuum.x + (pctX * this._imgInfo.w - scales.cp0.map.x) * scales.vacScaleX,
      y: scales.cp0.vacuum.y + (pctY * this._imgInfo.h - scales.cp0.map.y) * scales.vacScaleY,
    };
  }

  _vacToPct(vacX, vacY, mapData) {
    const scales = this._getScales(mapData);
    if (!scales || !scales.vacScaleX) return { x: 0, y: 0 };
    return {
      x: (scales.cp0.map.x + (vacX - scales.cp0.vacuum.x) / scales.vacScaleX) / this._imgInfo.w,
      y: (scales.cp0.map.y + (vacY - scales.cp0.vacuum.y) / scales.vacScaleY) / this._imgInfo.h,
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
      if (newZone.w < 0.05) newZone.w = 0.05;
      if (newZone.h < 0.05) newZone.h = 0.05;
      this._customZone = newZone;
    }
  }

  _handleMapClick(e, mapData) {
    if (this._isPanning || this._zoneDrag) return;
    if (this._mapMode === "rooms") {
      const vacCoords = this._pctToVac(this._getEventPct(e).x, this._getEventPct(e).y, mapData);
      const clickedRoom = mapData.rooms.find(
        (r) =>
          vacCoords.x >= Math.min(r.x0, r.x1) &&
          vacCoords.x <= Math.max(r.x0, r.x1) &&
          vacCoords.y >= Math.min(r.y0, r.y1) &&
          vacCoords.y <= Math.max(r.y0, r.y1)
      );
      if (clickedRoom) {
        this._fireHaptic("light");
        if (this._selectedRoomIds.includes(clickedRoom.id)) {
          this._selectedRoomIds = this._selectedRoomIds.filter((id) => id !== clickedRoom.id);
        } else {
          this._selectedRoomIds = [...this._selectedRoomIds, clickedRoom.id];
        }
      }
    } else if (this._mapMode === "pin") {
      this._fireHaptic("light");
      this._targetPin = this._getEventPct(e);
    }
  }

  _cleanSelected(mapData) {
    if (this._mapMode === "zones" && this._customZone) {
      const p1 = this._pctToVac(this._customZone.x, this._customZone.y, mapData);
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
      this._showToast("Starting zone clean");
    } else if (this._mapMode === "rooms" && this._selectedRoomIds.length > 0) {
      const roomIds = this._selectedRoomIds.map((id) => parseInt(id, 10));
      if (this._repeats > 1) {
        this._sendCmd("app_segment_clean", [{ segments: roomIds, repeat: this._repeats }]);
      } else {
        this._sendCmd("app_segment_clean", roomIds);
      }
      this._showToast(`Cleaning ${roomIds.length} room${roomIds.length === 1 ? "" : "s"}`);
    } else if (this._mapMode === "pin" && this._targetPin) {
      const p = this._pctToVac(this._targetPin.x, this._targetPin.y, mapData);
      this._sendCmd("app_goto_target", [Math.round(p.x), Math.round(p.y)]);
      this._showToast("Sending robot to pin");
    } else if (this._mapMode === "routines" && this._selectedRoutineId) {
      this._trigger(this._selectedRoutineId, "Starting routine");
    }
    this._customZone = null;
    this._selectedRoomIds = [];
    this._targetPin = null;
    this._selectedRoutineId = null;
    this._mapMode = "rooms";
  }

  _setMapMode(mode) {
    this._fireHaptic("light");
    this._mapMode = mode;
    this._customZone = mode === "zones" ? { x: 0.35, y: 0.35, w: 0.3, h: 0.3 } : null;
    this._selectedRoomIds = [];
    this._targetPin = null;
    this._selectedRoutineId = null;
  }

  // =========================================================================
  // SUMMARY MODE VIEW
  // =========================================================================

  _renderSummaryMode(data) {
    const c = this.config;
    const isCleaning = ["cleaning", "returning", "moving"].includes(data.state);
    const isDrying =
      data.dock.mopDryingSensor?.state === "on" ||
      data.dock.mopDryingSwitch?.state === "on" ||
      parseFloat(data.dock.mopDryingTime?.state) > 0;
    const isWashing = data.dock.mopWashingSwitch?.state === "on";
    const isEmptying = data.dock.dustEmptyingSwitch?.state === "on";
    const hasVacError =
      data.entities.vacuumError &&
      !["none", "ok", "unavailable", "unknown"].includes(
        data.entities.vacuumError.state.toLowerCase()
      );
    const hasDockError =
      data.dock.dockError &&
      !["ok", "none", "off", "unavailable", "unknown"].includes(
        data.dock.dockError.state.toLowerCase()
      );
    const overdueCount = data.consumables.filter((i) => i.overdue).length;
    const hasWaterWarn = data.entities.waterShortage?.state === "on";
    const progressPct = parseFloat(data.entities.cleaningProgress?.state) || 0;
    const roomName = data.entities.currentRoom?.state;
    const cleanModeLabel = data.entities.cleaningMode
      ? formatSettingName(data.entities.cleaningMode.state)
      : "Vac & Mop";

    let tone = "idle";
    let statusHeadline = isCleaning
      ? `Cleaning${roomName && roomName !== "unavailable" ? ` ${roomName}` : ""}`
      : isWashing
      ? "Dock Washing Mops"
      : isEmptying
      ? "Emptying Dustbin"
      : isDrying
      ? `Drying Mops (${formatDryingTime(data.dock.mopDryingTime?.state) || "Active"})`
      : data.isActivelyCharging
      ? "Docked · Charging"
      : "Docked · Ready";

    if (hasVacError || hasDockError) tone = "danger";
    else if (isCleaning) tone = "active";
    else if (isDrying || isWashing || isEmptying) tone = "dock";
    else if (overdueCount > 0 || hasWaterWarn) tone = "warning";

    const layout = c.layout === "rings" ? "rings" : "hero";
    const areaTxt = data.entities.cleaningArea?.state
      ? `${parseFloat(data.entities.cleaningArea.state).toFixed(0)} m²`
      : null;
    const timeTxt = formatDurationMins(data.entities.cleaningTime?.state);
    const minConsumablePct = data.consumables.reduce(
      (min, item) => (item.pct !== null ? Math.min(min, item.pct) : min),
      100
    );

    const tileTone =
      tone === "danger"
        ? "state-danger"
        : tone === "active"
        ? "state-active"
        : tone === "dock"
        ? "state-dock"
        : tone === "warning"
        ? "state-warning"
        : "";

    const hairlinePct = isCleaning && progressPct > 0 ? progressPct : data.batteryLevel;
    const hairlineColor = isCleaning
      ? "#0284c7"
      : data.batteryLevel < 25
      ? "#ef4444"
      : "#16a34a";

    return html`
      <div class="card-content ${c.show_header === false ? "no-header" : ""}">
        ${c.show_summary_strip !== false
          ? html`
              <div
                class="vac-summary-strip ${tone}"
                @click=${() => this._openModal("map")}
                title="Tap to open Vacuum Command Center"
              >
                <div class="summary-strip-left">
                  <span class="summary-status-dot ${tone}"></span>
                  <span class="summary-status-label">${statusHeadline}</span>
                  <span class="summary-sep">•</span>
                  <span class="summary-meta-pill">${cleanModeLabel}</span>
                </div>
                <div class="summary-strip-right">
                  <button
                    type="button"
                    class="strip-circle-btn ${isCleaning ? "active" : ""}"
                    @click=${(e) => {
                      e.stopPropagation();
                      this._doAction(isCleaning ? "pause" : "start");
                    }}
                    title="${isCleaning ? "Pause" : "Start Clean"}"
                  >
                    <ha-icon icon="${isCleaning ? "mdi:pause" : "mdi:play"}" style="--mdc-icon-size:15px;"></ha-icon>
                  </button>
                  <button
                    type="button"
                    class="strip-circle-btn"
                    @click=${(e) => {
                      e.stopPropagation();
                      this._doAction("return_to_base");
                    }}
                    title="Return to Dock"
                  >
                    <ha-icon icon="mdi:home-import-outline" style="--mdc-icon-size:15px;"></ha-icon>
                  </button>
                  <button
                    type="button"
                    class="strip-circle-btn"
                    @click=${(e) => this._openModal("map", e)}
                    title="Open Vacuum Command Center"
                  >
                    <ha-icon icon="mdi:tune-variant" style="--mdc-icon-size:15px;"></ha-icon>
                  </button>
                </div>
              </div>
            `
          : ""}

        <div
          class="unit-tile-card ${tileTone}"
          @click=${() => this._openModal("map")}
          title="Tap to open Interactive Map & Controls"
        >
          <div class="unit-tile-header">
            <div class="unit-tile-identity">
              <div class="model-thumb-box">
                ${this._renderQRevoRobotSvg(isCleaning, data.isCharging, isDrying, 36)}
              </div>
              <div class="unit-title-stack">
                <div class="unit-title-row">
                  <h3 class="unit-title">${data.vacuumName}</h3>
                  ${data.settings.selectedMap
                    ? html`<span class="zone-inline-chip neutral">${data.settings.selectedMap.state}</span>`
                    : ""}
                  ${isDrying ? html`<span class="zone-inline-chip info">Drying</span>` : ""}
                  ${hasWaterWarn ? html`<span class="zone-inline-chip danger">Low Water</span>` : ""}
                  ${overdueCount > 0
                    ? html`<span class="zone-inline-chip warning">${overdueCount} Overdue</span>`
                    : ""}
                  ${data.settings.dndSwitch?.state === "on"
                    ? html`<span class="zone-inline-chip neutral">DND</span>`
                    : ""}
                </div>
                <div class="unit-subtitle-row">
                  <span class="sub-truncate">
                    ${isCleaning && progressPct > 0
                      ? `${progressPct}% done • ${roomName || "Cleaning"}`
                      : data.entities.lastCleanEnd
                      ? `Last: ${formatRelativeTime(data.entities.lastCleanEnd.state)}${areaTxt ? ` · ${areaTxt}` : ""}`
                      : cleanModeLabel}
                  </span>
                  <span class="summary-sep">•</span>
                  <button
                    type="button"
                    class="inline-tray-btn ${this._trayExpanded ? "open" : ""}"
                    @click=${(e) => {
                      e.stopPropagation();
                      this._fireHaptic("light");
                      this._trayExpanded = !this._trayExpanded;
                    }}
                  >
                    <span>Details</span>
                    <ha-icon icon="${this._trayExpanded ? "mdi:chevron-up" : "mdi:chevron-down"}"></ha-icon>
                  </button>
                </div>
              </div>
            </div>

            ${layout === "rings"
              ? html`
                  <div class="summary-rings-pair">
                    ${this._renderRingMiniGauge(
                      data.batteryLevel,
                      `${data.batteryLevel}%`,
                      "Battery",
                      data.batteryLevel <= 20 ? "#ef4444" : "#16a34a"
                    )}
                    ${this._renderRingMiniGauge(
                      isCleaning && progressPct > 0 ? progressPct : minConsumablePct,
                      `${Math.round(isCleaning && progressPct > 0 ? progressPct : minConsumablePct)}%`,
                      isCleaning ? "Done" : "Care",
                      isCleaning ? "#0284c7" : minConsumablePct < 20 ? "#f59e0b" : "#16a34a"
                    )}
                  </div>
                `
              : html`
                  <div class="unit-primary-right">
                    <div class="unit-primary-val">
                      ${isCleaning && progressPct > 0 ? `${progressPct}%` : `${data.batteryLevel}%`}
                    </div>
                    <div class="unit-primary-sub">
                      ${areaTxt ? `${areaTxt} · ${timeTxt}` : formatSettingName(data.attributes.fan_speed || "max")}
                    </div>
                  </div>
                `}
          </div>

          ${this._trayExpanded
            ? html`
                <div class="unit-telemetry-tray" @click=${(e) => e.stopPropagation()}>
                  <div class="telemetry-mini-card">
                    <span class="t-mini-label">Suction</span>
                    <span class="t-mini-val">${formatSettingName(data.attributes.fan_speed || "max")}</span>
                  </div>
                  <div class="telemetry-mini-card">
                    <span class="t-mini-label">Water Flow</span>
                    <span class="t-mini-val">${formatSettingName(data.entities.mopIntensity?.state || "high")}</span>
                  </div>
                  <div class="telemetry-mini-card">
                    <span class="t-mini-label">Room</span>
                    <span class="t-mini-val">${roomName || "--"}</span>
                  </div>
                  ${data.dock.mopWashingSwitch
                    ? html`
                        <button
                          type="button"
                          class="tray-action-btn ${isWashing ? "active" : ""}"
                          @click=${() =>
                            this._toggleSwitch(
                              data.dock.mopWashingSwitch.entity_id,
                              data.dock.mopWashingSwitch.state
                            )}
                        >
                          ${isWashing ? "Stop Wash" : "Wash Mops"}
                        </button>
                      `
                    : ""}
                  ${data.dock.dustEmptyingSwitch
                    ? html`
                        <button
                          type="button"
                          class="tray-action-btn ${isEmptying ? "active" : ""}"
                          @click=${() =>
                            this._toggleSwitch(
                              data.dock.dustEmptyingSwitch.entity_id,
                              data.dock.dustEmptyingSwitch.state
                            )}
                        >
                          ${isEmptying ? "Stop Empty" : "Empty Bin"}
                        </button>
                      `
                    : ""}
                  <button type="button" class="tray-action-btn" @click=${(e) => this._locateRobot(e)}>
                    Locate
                  </button>
                </div>
              `
            : ""}

          <div class="tile-hairline">
            <div
              class="tile-hairline-fill ${data.isActivelyCharging || isCleaning ? "shimmer" : ""}"
              style="width:${Math.max(4, Math.min(100, hairlinePct))}%; background:${hairlineColor};"
            ></div>
          </div>
        </div>

        ${c.show_footer_strip !== false
          ? html`
              <div class="vac-footer-strip">
                <div class="footer-chips">
                  ${data.manualRoutines.slice(0, 2).map(
                    (r) => html`
                      <button
                        type="button"
                        class="footer-chip"
                        @click=${(e) => {
                          e.stopPropagation();
                          this._trigger(r.id, `Running ${r.name}`);
                        }}
                      >
                        <ha-icon icon="mdi:play-circle-outline" style="--mdc-icon-size:13px;"></ha-icon>
                        <span>${r.name}</span>
                      </button>
                    `
                  )}
                  <button
                    type="button"
                    class="footer-chip"
                    @click=${(e) => this._openModal("controls", e)}
                  >
                    <ha-icon icon="mdi:home-battery-outline" style="--mdc-icon-size:13px;"></ha-icon>
                    <span>Dock</span>
                  </button>
                </div>
                <button
                  type="button"
                  class="footer-command-link"
                  @click=${(e) => this._openModal("map", e)}
                >
                  Command Center →
                </button>
              </div>
            `
          : ""}
      </div>
    `;
  }

  // =========================================================================
  // COMMAND CENTER TABS (MAP, CONTROLS & DOCK, SCHEDULE, HEALTH)
  // =========================================================================

  _renderCommandCenterTabs() {
    return html`
      <div class="popup-tabs">
        ${VACUUM_TABS.map(
          (t) => html`
            <button
              type="button"
              class="popup-tab ${this._activeTab === t.id ? "active-tab" : ""}"
              @click=${() => this._switchTab(t.id)}
            >
              <ha-icon icon="${t.icon}"></ha-icon>
              <span>${t.label}</span>
            </button>
          `
        )}
      </div>
    `;
  }

  _renderActiveTabBody(data, isCleaning) {
    return html`
      <div class="view-container ${this._animDirection}">
        ${this._activeTab === "map"
          ? this._renderMapTab(data, isCleaning)
          : this._activeTab === "controls"
          ? this._renderControlsAndDockTab(data)
          : this._activeTab === "scheduling"
          ? this._renderSchedulingTab(data)
          : this._renderDiagnosticsTab(data)}
      </div>
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
      data.dock.mopDryingSensor?.state === "on" ||
      data.dock.mopDryingSwitch?.state === "on" ||
      parseFloat(dryingTimeRaw) > 0;
    const mapHeight = this._modalOpen ? 340 : Number(this.config.map_height) || 380;

    return html`
      <div
        id="map-container"
        class="map-box ${this._mapLocked ? "locked" : ""}"
        style="height: ${mapHeight}px;"
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
              <ha-icon icon="mdi:view-grid-outline"></ha-icon>
            </button>
            <button
              class="map-mode-btn ${this._mapMode === "zones" ? "active" : ""}"
              @click=${(e) => {
                e.stopPropagation();
                this._setMapMode("zones");
              }}
              title="Zone Draw"
            >
              <ha-icon icon="mdi:selection"></ha-icon>
            </button>
            <button
              class="map-mode-btn ${this._mapMode === "pin" ? "active" : ""}"
              @click=${(e) => {
                e.stopPropagation();
                this._setMapMode("pin");
              }}
              title="Pin & Go"
            >
              <ha-icon icon="mdi:map-marker-radius"></ha-icon>
            </button>
            <button
              class="map-mode-btn ${this._mapMode === "routines" ? "active" : ""}"
              @click=${(e) => {
                e.stopPropagation();
                this._setMapMode("routines");
                this._showRoutinePopup = true;
              }}
              title="Routines"
            >
              <ha-icon icon="mdi:playlist-check"></ha-icon>
            </button>
          </div>
          ${this._mapMode === "rooms" || this._mapMode === "zones"
            ? html`
                <button
                  class="map-btn repeat-btn"
                  @click=${(e) => {
                    e.stopPropagation();
                    this._repeats = this._repeats >= 3 ? 1 : this._repeats + 1;
                  }}
                >
                  <ha-icon icon="mdi:repeat"></ha-icon>
                  <span>x${this._repeats}</span>
                </button>
              `
            : ""}
        </div>

        ${data.settings.selectedMap
          ? html`
              <div class="floor-switcher-pill" @click=${(e) => e.stopPropagation()}>
                ${(data.settings.selectedMap.attributes?.options || ["Downstairs", "Upstairs"]).map(
                  (floor) => html`
                    <button
                      type="button"
                      class="floor-btn ${data.settings.selectedMap.state === floor ? "active" : ""}"
                      @click=${() => this._setSelect(data.settings.selectedMap.entity_id, floor)}
                    >
                      ${floor}
                    </button>
                  `
                )}
              </div>
            `
          : ""}

        <div class="map-controls">
          <button
            class="map-btn ${this._mapLocked ? "active" : ""}"
            @click=${(e) => {
              e.stopPropagation();
              this._mapLocked = !this._mapLocked;
            }}
            title="${this._mapLocked ? "Unlock Zoom/Pan" : "Lock Map"}"
          >
            <ha-icon icon="${this._mapLocked ? "mdi:lock-outline" : "mdi:lock-open-outline"}"></ha-icon>
          </button>
          <button
            class="map-btn"
            @click=${(e) => {
              e.stopPropagation();
              if (!this._mapLocked) this._mapZoom = Math.min(this._mapZoom + 0.5, 4);
            }}
            title="Zoom In"
          >
            <ha-icon icon="mdi:plus"></ha-icon>
          </button>
          <button
            class="map-btn"
            @click=${(e) => {
              e.stopPropagation();
              if (!this._mapLocked) this._mapZoom = Math.max(this._mapZoom - 0.5, 1);
            }}
            title="Zoom Out"
          >
            <ha-icon icon="mdi:minus"></ha-icon>
          </button>
          <button
            class="map-btn"
            @click=${(e) => {
              e.stopPropagation();
              this._mapZoom = 1;
              this._mapPan = { x: 0, y: 0 };
            }}
            title="Reset View"
          >
            <ha-icon icon="mdi:crosshairs-gps"></ha-icon>
          </button>
        </div>

        <div
          class="map-transform"
          style="transform: translate(${this._mapPan.x}px, ${this._mapPan.y}px) scale(${this._mapZoom});"
        >
          ${data.mapUrl
            ? html`
                <div
                  id="map-wrapper"
                  style="aspect-ratio: ${this._imgInfo.loaded ? `${this._imgInfo.w} / ${this._imgInfo.h}` : "auto"}"
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
                            style="left:${Math.min(p1.x, p2.x) * 100}%; top:${Math.min(p1.y, p2.y) * 100}%; width:${Math.abs(p2.x - p1.x) * 100}%; height:${Math.abs(p2.y - p1.y) * 100}%;"
                            @click=${(e) => {
                              if (this._mapMode !== "rooms") return;
                              e.stopPropagation();
                              this._selectedRoomIds = isSelected
                                ? this._selectedRoomIds.filter((id) => id !== r.id)
                                : [...this._selectedRoomIds, r.id];
                            }}
                          >
                            ${isSelected ? html`<ha-icon icon="mdi:check-circle" class="room-check"></ha-icon>` : ""}
                          </div>
                        `;
                      })
                    : ""}

                  ${this._mapMode === "pin" && this._targetPin
                    ? html`
                        <div
                          class="target-pin"
                          style="left:${this._targetPin.x * 100}%; top:${this._targetPin.y * 100}%;"
                        >
                          <ha-icon icon="mdi:map-marker"></ha-icon>
                        </div>
                      `
                    : ""}

                  ${this._mapMode === "zones" && this._customZone
                    ? html`
                        <div
                          class="custom-zone"
                          style="left:${this._customZone.x * 100}%; top:${this._customZone.y * 100}%; width:${this._customZone.w * 100}%; height:${this._customZone.h * 100}%;"
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
            : html`<div style="color:var(--secondary-text-color)">No Map Available</div>`}
        </div>

        <div class="battery-badge">
          <ha-icon
            icon="${data.isCharging ? "mdi:battery-charging" : "mdi:battery"}"
            style="color:${data.isCharging ? "#16a34a" : data.batteryLevel <= 20 ? "#ef4444" : "var(--primary-color)"}; --mdc-icon-size:16px;"
          ></ha-icon>
          <span>${data.batteryLevel}%</span>
        </div>

        ${isDryingActive
          ? html`
              <div
                class="drying-badge ${data.dock.mopDryingSwitch ? "clickable" : ""}"
                @click=${(e) => {
                  if (data.dock.mopDryingSwitch) {
                    e.stopPropagation();
                    this._toggleSwitch(
                      data.dock.mopDryingSwitch.entity_id,
                      data.dock.mopDryingSwitch.state
                    );
                  }
                }}
                title="Click to toggle Mop Drying"
              >
                <ha-icon icon="mdi:fan" class="spin-icon" style="--mdc-icon-size:15px;"></ha-icon>
                <span>Drying ${formatDryingTime(dryingTimeRaw)}</span>
              </div>
            `
          : ""}

        ${hasSelection
          ? html`
              <div class="selection-pill">
                <span>
                  ${this._mapMode === "zones"
                    ? "Zone Ready"
                    : this._mapMode === "pin"
                    ? "Target Set"
                    : this._mapMode === "routines"
                    ? "Routine Ready"
                    : `${this._selectedRoomIds.length} Room(s)`}
                </span>
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
                  <ha-icon icon="mdi:close" style="--mdc-icon-size:15px;"></ha-icon>
                </button>
              </div>
            `
          : ""}
      </div>

      ${this._renderMapQuickControls(data, hasSelection, isCleaning)}
      ${this._showRoutinePopup ? this._renderRoutinePopup(data.manualRoutines) : ""}
      ${this._renderQuickPopups(data)}
    `;
  }

  _renderMapQuickControls(data, hasSelection, isCleaning) {
    const cleanMode = data.entities.cleaningMode;
    return html`
      <div class="controls-bar-stack">
        ${cleanMode
          ? html`
              <div class="mode-seg-row">
                ${(cleanMode.attributes?.options || []).map(
                  (opt) => html`
                    <button
                      type="button"
                      class="mode-seg-btn ${cleanMode.state === opt ? "active" : ""}"
                      @click=${() => this._setSelect(cleanMode.entity_id, opt)}
                    >
                      ${formatSettingName(opt)}
                    </button>
                  `
                )}
              </div>
            `
          : ""}

        <div class="control-pill-row">
          <button
            class="control-btn ${this._activePopup === "fan_speed" ? "active" : ""}"
            @click=${() => (this._activePopup = "fan_speed")}
            title="Suction: ${formatSettingName(data.attributes.fan_speed || "max")}"
          >
            <ha-icon icon="mdi:fan"></ha-icon>
            <span class="mini-tag">${formatSettingName(data.attributes.fan_speed || "max")}</span>
          </button>

          ${data.entities.mopIntensity
            ? html`
                <button
                  class="control-btn ${this._activePopup === "mop_intensity" ? "active" : ""} ${cleanMode?.state === "vacuum" ? "dimmed" : ""}"
                  @click=${() => (this._activePopup = "mop_intensity")}
                  title="Water Flow"
                >
                  <ha-icon icon="mdi:water-outline"></ha-icon>
                  <span class="mini-tag">${formatSettingName(data.entities.mopIntensity.state)}</span>
                </button>
              `
            : ""}

          <button
            class="main-play-btn ${hasSelection ? "selection" : isCleaning ? "cleaning" : ""}"
            @click=${() =>
              hasSelection
                ? this._cleanSelected(data.mapData)
                : this._doAction(isCleaning ? "pause" : "start")}
            title="${hasSelection ? "Clean Selected" : isCleaning ? "Pause" : "Start Clean"}"
          >
            <ha-icon icon="${isCleaning && !hasSelection ? "mdi:pause" : "mdi:play"}" style="--mdc-icon-size:26px;"></ha-icon>
          </button>

          <button class="control-btn" @click=${() => this._doAction("stop")} title="Stop">
            <ha-icon icon="mdi:stop"></ha-icon>
          </button>
          <button class="control-btn" @click=${() => this._doAction("return_to_base")} title="Dock">
            <ha-icon icon="mdi:home-import-outline"></ha-icon>
          </button>
          <button class="control-btn" @click=${(e) => this._locateRobot(e)} title="Locate Robot">
            <ha-icon icon="mdi:crosshairs-gps"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  _renderQuickPopups(data) {
    const renderOptOverlay = (id, title, opts, current, onSelect) => {
      if (this._activePopup !== id) return "";
      return html`
        <div class="local-overlay" @click=${() => (this._activePopup = null)}>
          <div class="local-sheet" @click=${(e) => e.stopPropagation()}>
            <div class="local-sheet-header">
              <h3>${title}</h3>
              <button @click=${() => (this._activePopup = null)}>
                <ha-icon icon="mdi:close"></ha-icon>
              </button>
            </div>
            <div class="local-sheet-body">
              ${opts.map(
                (opt) => html`
                  <button
                    class="modal-opt-btn ${current === opt ? "active" : ""}"
                    @click=${() => {
                      onSelect(opt);
                      this._activePopup = null;
                    }}
                  >
                    <span>${formatSettingName(opt)}</span>
                    ${current === opt ? html`<ha-icon icon="mdi:check"></ha-icon>` : ""}
                  </button>
                `
              )}
            </div>
          </div>
        </div>
      `;
    };
    return html`
      ${renderOptOverlay(
        "fan_speed",
        "Suction Power",
        data.attributes.fan_speed_list || ["quiet", "balanced", "turbo", "max"],
        data.attributes.fan_speed,
        (v) => this._setFanSpeed(v)
      )}
      ${data.entities.mopIntensity
        ? renderOptOverlay(
            "mop_intensity",
            "Mop Water Flow",
            data.entities.mopIntensity.attributes.options || [],
            data.entities.mopIntensity.state,
            (v) => this._setSelect(data.entities.mopIntensity.entity_id, v)
          )
        : ""}
    `;
  }

  _renderRoutinePopup(manualRoutines) {
    return html`
      <div class="local-overlay" @click=${() => (this._showRoutinePopup = false)}>
        <div class="local-sheet" @click=${(e) => e.stopPropagation()}>
          <div class="local-sheet-header">
            <h3>Select Cleaning Routine</h3>
            <button @click=${() => (this._showRoutinePopup = false)}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
          <div class="local-sheet-body">
            ${manualRoutines.length === 0
              ? html`<p style="color:var(--secondary-text-color)">No routines discovered.</p>`
              : manualRoutines.map(
                  (r) => html`
                    <button
                      class="modal-opt-btn ${this._selectedRoutineId === r.id ? "active" : ""}"
                      @click=${() => {
                        this._selectedRoutineId = r.id;
                        this._showRoutinePopup = false;
                      }}
                    >
                      <span>${r.name}</span>
                      ${this._selectedRoutineId === r.id ? html`<ha-icon icon="mdi:check"></ha-icon>` : ""}
                    </button>
                  `
                )}
          </div>
        </div>
      </div>
    `;
  }

  _renderControlsAndDockTab(data) {
    const isWashing = data.dock.mopWashingSwitch?.state === "on";
    const isDrying =
      data.dock.mopDryingSwitch?.state === "on" || data.dock.mopDryingSensor?.state === "on";
    const isEmptying = data.dock.dustEmptyingSwitch?.state === "on";
    const hasDockErr =
      data.dock.dockError &&
      !["ok", "none", "off", "unavailable"].includes(data.dock.dockError.state.toLowerCase());

    return html`
      <!-- Q Revo Multifunctional Dock Card -->
      <div class="passable-section-card">
        <div class="passable-section-header">
          <span class="passable-section-title">Q Revo Multifunctional Dock</span>
          <span class="zone-inline-chip ${hasDockErr ? "danger" : "good"}">
            ${hasDockErr ? formatSettingName(data.dock.dockError.state) : "Dock Ready"}
          </span>
        </div>

        <div class="dock-hero-row">
          ${this._renderQRevoDockSvg(isWashing, isDrying, isEmptying, hasDockErr, 48)}
          <div class="dock-action-grid">
            ${data.dock.mopWashingSwitch
              ? html`
                  <button
                    class="dock-action-btn ${isWashing ? "active" : ""}"
                    @click=${() =>
                      this._toggleSwitch(
                        data.dock.mopWashingSwitch.entity_id,
                        data.dock.mopWashingSwitch.state
                      )}
                  >
                    <ha-icon icon="mdi:washing-machine"></ha-icon>
                    <span>${isWashing ? "Washing Mops..." : "Wash Mops"}</span>
                  </button>
                `
              : ""}
            ${data.dock.dustEmptyingSwitch
              ? html`
                  <button
                    class="dock-action-btn ${isEmptying ? "active" : ""}"
                    @click=${() =>
                      this._toggleSwitch(
                        data.dock.dustEmptyingSwitch.entity_id,
                        data.dock.dustEmptyingSwitch.state
                      )}
                  >
                    <ha-icon icon="mdi:delete-empty-outline"></ha-icon>
                    <span>${isEmptying ? "Emptying..." : "Empty Dustbin"}</span>
                  </button>
                `
              : ""}
            ${data.dock.mopDryingSwitch
              ? html`
                  <button
                    class="dock-action-btn ${isDrying ? "active" : ""}"
                    @click=${() =>
                      this._toggleSwitch(
                        data.dock.mopDryingSwitch.entity_id,
                        data.dock.mopDryingSwitch.state
                      )}
                  >
                    <ha-icon icon="mdi:fan"></ha-icon>
                    <span>
                      ${isDrying
                        ? `Drying (${formatDryingTime(data.dock.mopDryingTime?.state) || "On"})`
                        : "Dry Mops"}
                    </span>
                  </button>
                `
              : ""}
            ${data.dock.resolveErrorBtn
              ? html`
                  <button
                    class="dock-action-btn ${hasDockErr ? "warn" : ""}"
                    @click=${() => this._trigger(data.dock.resolveErrorBtn, "Resolve dock error sent")}
                  >
                    <ha-icon icon="mdi:wrench-check-outline"></ha-icon>
                    <span>Resolve Error</span>
                  </button>
                `
              : ""}
          </div>
        </div>

        ${data.dock.emptyMode
          ? html`
              <div class="chip-select-block">
                <span class="chip-select-label">Auto-Empty Mode</span>
                <div class="chip-select-row">
                  ${(data.dock.emptyMode.attributes?.options || []).map(
                    (opt) => html`
                      <button
                        class="opt-chip ${data.dock.emptyMode.state === opt ? "active" : ""}"
                        @click=${() => this._setSelect(data.dock.emptyMode.entity_id, opt)}
                      >
                        ${formatSettingName(opt)}
                      </button>
                    `
                  )}
                </div>
              </div>
            `
          : ""}

        ${data.dock.childLock
          ? html`
              <div class="drawer-row">
                <span>Dock Child Lock</span>
                <button
                  class="switch-pill ${data.dock.childLock.state === "on" ? "active" : ""}"
                  @click=${() =>
                    this._toggleSwitch(data.dock.childLock.entity_id, data.dock.childLock.state)}
                >
                  ${data.dock.childLock.state === "on" ? "ON" : "OFF"}
                </button>
              </div>
            `
          : ""}
      </div>

      <!-- Cleaning Settings -->
      <div class="passable-section-card">
        <div class="passable-section-header">
          <span class="passable-section-title">Robot Cleaning Preferences</span>
        </div>

        ${data.entities.cleaningMode
          ? html`
              <div class="chip-select-block">
                <span class="chip-select-label">Cleaning Mode</span>
                <div class="chip-select-row">
                  ${(data.entities.cleaningMode.attributes?.options || []).map(
                    (opt) => html`
                      <button
                        class="opt-chip ${data.entities.cleaningMode.state === opt ? "active" : ""}"
                        @click=${() => this._setSelect(data.entities.cleaningMode.entity_id, opt)}
                      >
                        ${formatSettingName(opt)}
                      </button>
                    `
                  )}
                </div>
              </div>
            `
          : ""}

        <div class="chip-select-block">
          <span class="chip-select-label">Suction Power</span>
          <div class="chip-select-row">
            ${(data.attributes.fan_speed_list || []).map(
              (opt) => html`
                <button
                  class="opt-chip ${data.attributes.fan_speed === opt ? "active" : ""}"
                  @click=${() => this._setFanSpeed(opt)}
                >
                  ${formatSettingName(opt)}
                </button>
              `
            )}
          </div>
        </div>

        ${data.entities.mopIntensity
          ? html`
              <div class="chip-select-block">
                <span class="chip-select-label">Mop Water Flow</span>
                <div class="chip-select-row">
                  ${(data.entities.mopIntensity.attributes?.options || []).map(
                    (opt) => html`
                      <button
                        class="opt-chip ${data.entities.mopIntensity.state === opt ? "active" : ""}"
                        @click=${() => this._setSelect(data.entities.mopIntensity.entity_id, opt)}
                      >
                        ${formatSettingName(opt)}
                      </button>
                    `
                  )}
                </div>
              </div>
            `
          : ""}

        ${data.entities.mopMode
          ? html`
              <div class="chip-select-block">
                <span class="chip-select-label">Mop Route Pattern</span>
                <div class="chip-select-row">
                  ${(data.entities.mopMode.attributes?.options || []).map(
                    (opt) => html`
                      <button
                        class="opt-chip ${data.entities.mopMode.state === opt ? "active" : ""}"
                        @click=${() => this._setSelect(data.entities.mopMode.entity_id, opt)}
                      >
                        ${formatSettingName(opt)}
                      </button>
                    `
                  )}
                </div>
              </div>
            `
          : ""}

        ${data.settings.volume
          ? html`
              <div class="slider-control">
                <div class="slider-header">
                  <span>Voice Volume</span>
                  <span class="slider-val">${Math.round(parseFloat(data.settings.volume.state) || 0)}%</span>
                </div>
                <input
                  type="range"
                  class="p-range-input"
                  min="${data.settings.volume.attributes?.min ?? 0}"
                  max="${data.settings.volume.attributes?.max ?? 100}"
                  step="5"
                  .value=${String(Math.round(parseFloat(data.settings.volume.state) || 0))}
                  @change=${(e) => this._setNum(data.settings.volume.entity_id, e.target.value)}
                />
              </div>
            `
          : ""}
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
      <div class="passable-section-card">
        <div class="drawer-row">
          <div class="row-text-stack">
            <strong>Morning Cleaning Schedule</strong>
            <span>Runs configured daily routine automatically</span>
          </div>
          <button
            class="switch-pill ${isEnabled ? "active" : ""}"
            @click=${() =>
              data.scheduleEnableObj &&
              this._toggleSwitch(data.scheduleEnableId, data.scheduleEnableObj.state)}
          >
            ${isEnabled ? "ON" : "OFF"}
          </button>
        </div>

        ${data.settings.postDinnerEnable
          ? html`
              <div class="drawer-row">
                <div class="row-text-stack">
                  <strong>Post-Dinner Kitchen & Dining</strong>
                  <span>
                    ${data.settings.postDinnerCanceled?.state === "on"
                      ? "Tonight's run canceled"
                      : "Evening crumb cleanup automation"}
                  </span>
                </div>
                <button
                  class="switch-pill ${data.settings.postDinnerEnable.state === "on" ? "active" : ""}"
                  @click=${() =>
                    this._toggleSwitch(
                      data.settings.postDinnerEnable.entity_id,
                      data.settings.postDinnerEnable.state
                    )}
                >
                  ${data.settings.postDinnerEnable.state === "on" ? "ON" : "OFF"}
                </button>
              </div>
            `
          : ""}

        ${data.manualRoutines.map(
          (routine) => html`
            <div class="schedule-routine-block">
              <div class="schedule-routine-header">
                <span>${routine.name}</span>
                <button
                  class="tray-action-btn"
                  @click=${() => this._trigger(routine.id, `Running ${routine.name}`)}
                >
                  Run Now
                </button>
              </div>
              <div class="days-row">
                ${days.map((day) => {
                  const entId = `input_select.cleaning_routine_${day.id}`;
                  const selectObj = this.hass.states[entId];
                  const isSelected = selectObj?.state === routine.name;
                  const options = selectObj?.attributes?.options || [];
                  const offOption =
                    options.find((opt) =>
                      ["no cleaning", "none", "off", "disabled", "no clean"].includes(
                        opt.toLowerCase().trim()
                      )
                    ) || "No Cleaning";
                  return html`
                    <button
                      class="day-btn ${isSelected ? "active" : ""}"
                      @click=${() =>
                        selectObj &&
                        this._setInpSelect(entId, isSelected ? offOption : routine.name)}
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

      ${data.settings.dndSwitch
        ? html`
            <div class="passable-section-card">
              <div class="drawer-row">
                <div class="row-text-stack">
                  <strong>Do Not Disturb</strong>
                  <span>Silences voice prompts & dock auto-empty during quiet hours</span>
                </div>
                <button
                  class="switch-pill ${data.settings.dndSwitch.state === "on" ? "active" : ""}"
                  @click=${() =>
                    this._toggleSwitch(
                      data.settings.dndSwitch.entity_id,
                      data.settings.dndSwitch.state
                    )}
                >
                  ${data.settings.dndSwitch.state === "on" ? "ON" : "OFF"}
                </button>
              </div>
              ${data.settings.dndBegin && data.settings.dndEnd
                ? html`
                    <div class="dnd-times-row">
                      <label class="time-field">
                        <span>Begin</span>
                        <input
                          type="time"
                          .value=${String(data.settings.dndBegin.state).slice(0, 5)}
                          @change=${(e) =>
                            this._setTime(data.settings.dndBegin.entity_id, `${e.target.value}:00`)}
                        />
                      </label>
                      <label class="time-field">
                        <span>End</span>
                        <input
                          type="time"
                          .value=${String(data.settings.dndEnd.state).slice(0, 5)}
                          @change=${(e) =>
                            this._setTime(data.settings.dndEnd.entity_id, `${e.target.value}:00`)}
                        />
                      </label>
                    </div>
                  `
                : ""}
            </div>
          `
        : ""}
    `;
  }

  _renderDiagnosticsTab(data) {
    const diagRow = (label, ent, okStates = ["ok", "none", "off"]) => {
      if (!ent || ent.state === "unavailable" || ent.state === "unknown") return "";
      const valLow = String(ent.state).toLowerCase();
      const isOk = okStates.includes(valLow);
      let text = formatSettingName(ent.state);
      if (valLow === "off") text = okStates.includes("off") ? "OK" : "Missing";
      if (valLow === "on") text = okStates.includes("on") ? "Attached" : "Alert";
      return html`
        <div class="diag-row" @click=${() => this._moreInfo(ent.entity_id)}>
          <span>${label}</span>
          <strong class="${isOk ? "tone-good" : "tone-danger"}">${text}</strong>
        </div>
      `;
    };

    return html`
      ${data.entities.totalArea || data.entities.totalCount
        ? html`
            <div class="kpi-grid-3">
              ${data.entities.totalCount
                ? html`<div class="kpi-card">
                    <span class="kpi-lbl">Total Runs</span>
                    <span class="kpi-num">${Number(data.entities.totalCount.state).toLocaleString()}</span>
                  </div>`
                : ""}
              ${data.entities.totalArea
                ? html`<div class="kpi-card">
                    <span class="kpi-lbl">Total Area</span>
                    <span class="kpi-num">${Math.round(parseFloat(data.entities.totalArea.state)).toLocaleString()} m²</span>
                  </div>`
                : ""}
              ${data.entities.totalTime
                ? html`<div class="kpi-card">
                    <span class="kpi-lbl">Run Hours</span>
                    <span class="kpi-num">${Math.round(parseFloat(data.entities.totalTime.state)).toLocaleString()} h</span>
                  </div>`
                : ""}
            </div>
          `
        : ""}

      <div class="passable-section-card">
        <div class="passable-section-header">
          <span class="passable-section-title">Consumables & Maintenance</span>
        </div>
        ${data.consumables.map((item) => {
          const hasVal = item.hours !== null;
          const color = !hasVal
            ? "var(--secondary-text-color)"
            : item.overdue
            ? "#ef4444"
            : item.pct < 20
            ? "#ef4444"
            : item.pct < 50
            ? "#f59e0b"
            : "#16a34a";
          return html`
            <div class="consumable-item">
              <div class="consumable-top">
                <span class="consumable-lbl">${item.label}</span>
                <div class="consumable-right">
                  ${hasVal
                    ? item.overdue
                      ? html`<span class="zone-inline-chip danger">
                          Overdue (${Math.abs(Math.round(item.hours))}h)
                        </span>`
                      : html`<span class="consumable-hrs">${Math.round(item.hours)} h left</span>`
                    : ""}
                  ${item.reset
                    ? html`<button
                        class="reset-btn"
                        @click=${() => this._trigger(item.reset, `${item.label} reset`)}
                      >
                        Reset
                      </button>`
                    : ""}
                </div>
              </div>
              ${hasVal
                ? html`
                    <div class="progress-bg">
                      <div class="progress-fill" style="width:${item.pct}%; background:${color};"></div>
                    </div>
                  `
                : ""}
            </div>
          `;
        })}
      </div>

      <div class="passable-section-card">
        <div class="passable-section-header">
          <span class="passable-section-title">Dock & Sensor Hardware</span>
        </div>
        <div class="diag-list">
          ${diagRow("Vacuum Error", data.entities.vacuumError, ["none", "ok"])}
          ${diagRow("Dock Error", data.dock.dockError, ["ok", "none"])}
          ${diagRow("Clean Water Tank", data.dock.cleanWater, ["off", "ok"])}
          ${diagRow("Dirty Water Tank", data.dock.dirtyWater, ["off", "ok"])}
          ${diagRow("Water Shortage", data.entities.waterShortage, ["off"])}
          ${diagRow("Mop Pads Attached", data.entities.mopAttached, ["on"])}
          ${diagRow("Water Box Attached", data.entities.waterBoxAttached, ["on"])}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // MAIN RENDER
  // =========================================================================

  render() {
    if (!this.config?.entity) {
      return html`
        <ha-card>
          <div class="header">
            <h1 class="title">
              <ha-icon icon="mdi:robot-vacuum" style="margin-right:8px; color:var(--primary-color);"></ha-icon>
              Passable Vacuum Card
            </h1>
            <p class="subtitle">Select a vacuum entity in the editor</p>
          </div>
        </ha-card>
      `;
    }

    const data = this.data;
    if (!data) {
      return html`
        <ha-card>
          <div class="header">
            <h1 class="title">
              <ha-icon icon="mdi:robot-vacuum" style="margin-right:8px; color:var(--primary-color);"></ha-icon>
              Passable Vacuum Card
            </h1>
            <p class="subtitle">Waiting for ${this.config.entity}...</p>
          </div>
        </ha-card>
      `;
    }

    const isCleaning = ["cleaning", "returning", "moving"].includes(data.state);
    const isSummaryMode = this.config.display_mode === "summary";

    return html`
      <ha-card class="container">
        <div class="toast ${this._toastMsg && !this._modalOpen ? "show" : ""}">
          <ha-icon icon="mdi:check-circle" style="--mdc-icon-size:16px;"></ha-icon>
          <span>${this._toastMsg}</span>
        </div>

        ${this.config.show_header !== false
          ? html`
              <div class="header">
                <div class="header-left">
                  <h1 class="title">
                    <ha-icon icon="mdi:robot-vacuum" style="margin-right:8px; color:var(--primary-color);"></ha-icon>
                    ${data.vacuumName}
                  </h1>
                  <p class="subtitle">
                    ${data.entities.currentRoom?.state || "Floor Care"} • ${data.batteryLevel}% Battery
                  </p>
                </div>
                <div class="header-right">
                  <button
                    type="button"
                    class="strip-circle-btn"
                    @click=${(e) => this._locateRobot(e)}
                    title="Locate Robot"
                  >
                    <ha-icon icon="mdi:crosshairs-gps" style="--mdc-icon-size:15px;"></ha-icon>
                  </button>
                  <span class="status-chip ${isCleaning ? "active" : ""}">${data.state}</span>
                </div>
              </div>
            `
          : ""}

        ${isSummaryMode
          ? this._renderSummaryMode(data)
          : html`
              <div class="card-content ${this.config.show_header === false ? "no-header" : ""}">
                ${this._renderCommandCenterTabs()}
                ${this._renderActiveTabBody(data, isCleaning)}
              </div>
            `}

        ${this._modalOpen && isSummaryMode
          ? html`
              <div
                class="popup-overlay modal-shell"
                @click=${(ev) => {
                  if (ev.target === ev.currentTarget) this._closeModal();
                }}
              >
                <div
                  class="popup-content modal-shell-card"
                  @click=${(ev) => ev.stopPropagation()}
                  @touchstart=${this._handlePopupTouchStart}
                  @touchmove=${this._handlePopupTouchMove}
                  @touchend=${this._handlePopupTouchEnd}
                >
                  <div class="drag-handle"></div>
                  <div class="toast ${this._toastMsg ? "show" : ""}">
                    <ha-icon icon="mdi:check-circle" style="--mdc-icon-size:16px;"></ha-icon>
                    <span>${this._toastMsg}</span>
                  </div>
                  <div class="popup-header">
                    <div class="popup-header-left">
                      <div class="model-thumb-box compact">
                        ${this._renderQRevoRobotSvg(isCleaning, data.isCharging, false, 30)}
                      </div>
                      <div class="popup-title-stack">
                        <h3>${data.vacuumName}</h3>
                        <div class="popup-header-sub">
                          ${formatSettingName(data.state)} • ${data.batteryLevel}%
                          ${data.entities.currentRoom?.state ? ` • ${data.entities.currentRoom.state}` : ""}
                        </div>
                      </div>
                    </div>
                    <button type="button" class="close-button" @click=${() => this._closeModal()}>
                      <ha-icon icon="mdi:close"></ha-icon>
                    </button>
                  </div>

                  ${this._renderCommandCenterTabs()}

                  <div class="modal-scroll-area thin-scroll">
                    ${this._renderActiveTabBody(data, isCleaning)}
                  </div>
                </div>
              </div>
            `
          : ""}
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
        box-sizing: border-box;
      }

      ha-card.container,
      ha-card {
        border-radius: var(--ha-card-border-radius, 12px);
        background: var(--ha-card-background, var(--card-background-color, #fff));
        box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
        color: var(--primary-text-color);
        position: relative;
        overflow: hidden;
        box-sizing: border-box;
      }

      .toast {
        position: fixed;
        top: 18px;
        left: 50%;
        transform: translateX(-50%) translateY(-14px);
        background: var(--primary-text-color);
        color: var(--card-background-color, #fff);
        padding: 8px 16px;
        border-radius: 999px;
        font-size: 12.5px;
        font-weight: 700;
        pointer-events: none;
        opacity: 0;
        transition: all 0.25s ease;
        z-index: 10005;
        display: flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
      }
      .toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      .header {
        padding: 16px 16px 14px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 10px;
        border-bottom: 1px solid var(--divider-color, #e0e0e0);
        margin-bottom: 12px;
      }
      .header-left {
        display: flex;
        flex-direction: column;
        min-width: 0;
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
        margin: 4px 0 0;
      }
      .header-right {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }
      .status-chip {
        font-size: 11px;
        font-weight: 700;
        padding: 3px 9px;
        border-radius: 999px;
        text-transform: uppercase;
        background: var(--secondary-background-color, rgba(128, 128, 128, 0.14));
        color: var(--secondary-text-color);
      }
      .status-chip.active {
        background: rgba(14, 165, 233, 0.16);
        color: #0284c7;
      }

      .card-content {
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .card-content.no-header {
        padding: 10px;
      }
      .header + .card-content {
        padding-top: 0;
      }

      /* SUMMARY STRIP */
      .vac-summary-strip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 7px 12px;
        min-height: 36px;
        border-radius: 12px;
        background: var(--secondary-background-color, rgba(128, 128, 128, 0.1));
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.16));
        cursor: pointer;
        box-sizing: border-box;
      }
      .vac-summary-strip.active {
        background: rgba(14, 165, 233, 0.1);
        border-color: rgba(14, 165, 233, 0.36);
      }
      .vac-summary-strip.dock {
        background: rgba(6, 182, 212, 0.1);
        border-color: rgba(6, 182, 212, 0.35);
      }
      .vac-summary-strip.warning {
        background: rgba(245, 158, 11, 0.1);
        border-color: rgba(245, 158, 11, 0.36);
      }
      .vac-summary-strip.danger {
        background: rgba(239, 68, 68, 0.12);
        border-color: rgba(239, 68, 68, 0.45);
      }
      .summary-strip-left {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
        overflow: hidden;
        white-space: nowrap;
      }
      .summary-strip-right {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }
      .summary-status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
        background: #22c55e;
      }
      .summary-status-dot.active {
        background: #0284c7;
        box-shadow: 0 0 7px rgba(2, 132, 199, 0.7);
      }
      .summary-status-dot.dock {
        background: #06b6d4;
      }
      .summary-status-dot.warning {
        background: #f59e0b;
      }
      .summary-status-dot.danger {
        background: #ef4444;
      }
      .summary-status-label {
        font-size: 13.5px;
        font-weight: 700;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .summary-sep {
        opacity: 0.4;
        font-size: 12px;
      }
      .summary-meta-pill {
        font-size: 12px;
        font-weight: 600;
        color: var(--secondary-text-color);
      }
      .strip-circle-btn {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--card-background-color, rgba(128, 128, 128, 0.1));
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.2));
        color: var(--primary-text-color);
        cursor: pointer;
        padding: 0;
      }
      .strip-circle-btn.active {
        background: var(--primary-color, #0284c7);
        border-color: var(--primary-color, #0284c7);
        color: var(--text-primary-color, #fff);
      }

      /* SUMMARY TILE */
      .unit-tile-card {
        position: relative;
        overflow: hidden;
        background: var(--secondary-background-color, rgba(128, 128, 128, 0.08));
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.16));
        border-radius: 14px;
        padding: 11px 13px 13px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        cursor: pointer;
      }
      .unit-tile-card.state-active {
        background: rgba(14, 165, 233, 0.09);
        border-color: rgba(14, 165, 233, 0.42);
      }
      .unit-tile-card.state-dock {
        background: rgba(6, 182, 212, 0.08);
        border-color: rgba(6, 182, 212, 0.36);
      }
      .unit-tile-card.state-warning {
        border-color: rgba(245, 158, 11, 0.42);
      }
      .unit-tile-card.state-danger {
        border-color: rgba(239, 68, 68, 0.5);
      }
      .unit-tile-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      .unit-tile-identity {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
        flex: 1;
      }
      .model-thumb-box {
        width: 44px;
        height: 44px;
        border-radius: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.18));
        flex-shrink: 0;
      }
      .model-thumb-box.compact {
        width: 38px;
        height: 38px;
        border-radius: 10px;
      }
      .unit-title-stack {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
        flex: 1;
      }
      .unit-title-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 5px;
      }
      .unit-title {
        font-size: 16px;
        font-weight: 700;
        margin: 0;
      }
      .unit-subtitle-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12.5px;
        font-weight: 600;
        color: var(--secondary-text-color);
        min-width: 0;
      }
      .sub-truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .inline-tray-btn {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 2px 7px;
        border-radius: 999px;
        background: var(--card-background-color, rgba(128, 128, 128, 0.12));
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.22));
        color: var(--primary-text-color);
        font-family: inherit;
        font-size: 11.5px;
        font-weight: 700;
        cursor: pointer;
        flex-shrink: 0;
      }
      .inline-tray-btn ha-icon { --mdc-icon-size: 14px; }
      .unit-primary-right {
        text-align: right;
        flex-shrink: 0;
      }
      .unit-primary-val {
        font-size: 24px;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        line-height: 1.05;
      }
      .unit-primary-sub {
        font-size: 12px;
        font-weight: 600;
        color: var(--secondary-text-color);
      }

      .summary-rings-pair {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
      }
      .summary-ring-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      }
      .summary-ring-wrap {
        position: relative;
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .summary-ring-svg {
        width: 42px;
        height: 42px;
        transform: rotate(-90deg);
      }
      .summary-ring-val {
        position: absolute;
        font-size: 10.5px;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
      }
      .summary-ring-label {
        font-size: 10px;
        font-weight: 700;
        color: var(--secondary-text-color);
      }

      .unit-telemetry-tray {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 6px;
        padding-top: 8px;
        border-top: 1px dashed var(--divider-color, rgba(128, 128, 128, 0.25));
      }
      .telemetry-mini-card {
        display: flex;
        flex-direction: column;
        gap: 1px;
        padding: 6px 8px;
        border-radius: 10px;
        background: var(--card-background-color, rgba(128, 128, 128, 0.08));
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.16));
      }
      .t-mini-label {
        font-size: 10.5px;
        font-weight: 700;
        color: var(--secondary-text-color);
        text-transform: uppercase;
      }
      .t-mini-val {
        font-size: 12.5px;
        font-weight: 700;
      }
      .tray-action-btn {
        padding: 6px 10px;
        border-radius: 10px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        font-family: inherit;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
      }
      .tray-action-btn.active {
        background: var(--primary-color, #3b82f6);
        border-color: var(--primary-color, #3b82f6);
        color: var(--text-primary-color, #ffffff);
      }

      .tile-hairline {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 2.5px;
        background: rgba(148, 163, 184, 0.18);
      }
      .tile-hairline-fill {
        height: 100%;
        border-radius: 0 2px 0 0;
        transition: width 0.4s ease;
      }

      .vac-footer-strip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
        padding-top: 2px;
      }
      .footer-chips {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
      }
      .footer-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 999px;
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.22));
        background: var(--secondary-background-color, rgba(128, 128, 128, 0.08));
        color: var(--primary-text-color);
        font-family: inherit;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
      }
      .footer-command-link {
        background: none;
        border: none;
        color: var(--primary-color, #03a9f4);
        font-family: inherit;
        font-size: 12.5px;
        font-weight: 700;
        cursor: pointer;
      }

      .zone-inline-chip {
        display: inline-flex;
        align-items: center;
        padding: 2px 7px;
        border-radius: 999px;
        font-size: 10.5px;
        font-weight: 700;
      }
      .zone-inline-chip.good { background: rgba(34, 197, 94, 0.16); color: #16a34a; }
      .zone-inline-chip.info { background: rgba(14, 165, 233, 0.16); color: #0284c7; }
      .zone-inline-chip.warning { background: rgba(245, 158, 11, 0.18); color: #d97706; }
      .zone-inline-chip.danger { background: rgba(239, 68, 68, 0.18); color: #ef4444; }
      .zone-inline-chip.neutral { background: rgba(128, 128, 128, 0.15); color: var(--secondary-text-color); }

      /* TABS */
      .popup-tabs {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        background: var(--secondary-background-color, rgba(128, 128, 128, 0.12));
        padding: 4px;
        border-radius: 14px;
        gap: 4px;
      }
      .popup-tab {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        padding: 7px 4px;
        border-radius: 10px;
        background: transparent;
        border: none;
        font-family: inherit;
        color: var(--secondary-text-color);
        font-size: 11.5px;
        font-weight: 600;
        cursor: pointer;
      }
      .popup-tab ha-icon { --mdc-icon-size: 16px; }
      .popup-tab.active-tab {
        background: var(--primary-color, #3b82f6);
        color: var(--text-primary-color, #ffffff);
        font-weight: 700;
      }

      .view-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        animation-duration: 0.22s;
        animation-fill-mode: both;
      }
      .slide-left { animation-name: slideLeft; }
      .slide-right { animation-name: slideRight; }
      @keyframes slideLeft {
        from { opacity: 0; transform: translateX(14px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes slideRight {
        from { opacity: 0; transform: translateX(-14px); }
        to { opacity: 1; transform: translateX(0); }
      }

      /* MAP */
      .map-box {
        background: var(--secondary-background-color, #0f172a);
        border-radius: 18px;
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.2));
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        touch-action: none;
      }
      .map-box.locked { touch-action: auto; }
      .map-tools-left {
        position: absolute;
        left: 10px;
        top: 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        z-index: 2;
      }
      .map-controls {
        position: absolute;
        right: 10px;
        top: 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        z-index: 2;
      }
      .map-modes-group {
        display: flex;
        flex-direction: column;
        background: var(--ha-card-background, var(--card-background-color, #fff));
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.2));
        border-radius: 20px;
        padding: 3px;
        gap: 3px;
      }
      .map-mode-btn {
        background: transparent;
        border: none;
        border-radius: 50%;
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--primary-text-color);
      }
      .map-mode-btn ha-icon { --mdc-icon-size: 18px; }
      .map-mode-btn.active {
        background: var(--primary-color, #3b82f6);
        color: var(--text-primary-color, #ffffff);
      }
      .map-btn {
        background: var(--ha-card-background, var(--card-background-color, #fff));
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.2));
        border-radius: 10px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--primary-text-color);
      }
      .map-btn ha-icon { --mdc-icon-size: 18px; }
      .map-btn.active {
        background: var(--primary-color, #3b82f6);
        color: var(--text-primary-color, #ffffff);
      }
      .repeat-btn {
        width: auto;
        padding: 0 10px;
        gap: 4px;
        font-size: 12px;
        font-weight: 700;
      }

      .floor-switcher-pill {
        position: absolute;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 3;
        display: flex;
        background: var(--ha-card-background, var(--card-background-color, #fff));
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.22));
        border-radius: 999px;
        padding: 3px;
        gap: 2px;
      }
      .floor-btn {
        border: none;
        background: transparent;
        color: var(--secondary-text-color);
        font-family: inherit;
        font-size: 11.5px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 999px;
        cursor: pointer;
      }
      .floor-btn.active {
        background: var(--primary-color, #3b82f6);
        color: var(--text-primary-color, #ffffff);
      }

      .map-transform {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
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
        z-index: 1;
        border-radius: 4px;
        cursor: pointer;
      }
      .room-overlay.selected {
        background: rgba(37, 99, 235, 0.38);
        border: 1px solid rgba(37, 99, 235, 0.85);
      }
      .room-check {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #fff;
        --mdc-icon-size: 20px;
      }
      .target-pin {
        position: absolute;
        transform: translate(-50%, -100%);
        color: #ef4444;
        z-index: 2;
      }
      .target-pin ha-icon { --mdc-icon-size: 28px; }
      .custom-zone {
        position: absolute;
        background: rgba(37, 99, 235, 0.2);
        border: 2px dashed #2563eb;
        z-index: 1;
      }
      .zone-handle { position: absolute; touch-action: none; }
      .zone-handle.fill { inset: 0; cursor: move; }
      .zone-handle.corner {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .zone-handle.corner.tl { top: -14px; left: -14px; }
      .zone-handle.corner.tr { top: -14px; right: -14px; }
      .zone-handle.corner.bl { bottom: -14px; left: -14px; }
      .zone-handle.corner.br { bottom: -14px; right: -14px; }
      .corner-dot {
        width: 8px;
        height: 8px;
        background: #fff;
        border-radius: 50%;
        border: 2px solid #2563eb;
      }

      .battery-badge,
      .drying-badge {
        position: absolute;
        bottom: 10px;
        display: flex;
        align-items: center;
        gap: 5px;
        background: var(--ha-card-background, var(--card-background-color, #fff));
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.2));
        padding: 5px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
        z-index: 2;
      }
      .battery-badge { left: 10px; }
      .drying-badge {
        right: 10px;
        color: #0284c7;
        cursor: pointer;
      }
      .selection-pill {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--ha-card-background, var(--card-background-color, #fff));
        border: 1px solid var(--primary-color, #3b82f6);
        border-radius: 999px;
        padding: 5px 12px;
        z-index: 3;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 700;
      }
      .selection-pill button {
        background: none;
        border: none;
        padding: 0;
        display: flex;
        cursor: pointer;
        color: var(--secondary-text-color);
      }

      /* MAP CONTROLS */
      .controls-bar-stack {
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: center;
      }
      .mode-seg-row {
        display: flex;
        width: 100%;
        background: var(--secondary-background-color, rgba(128, 128, 128, 0.1));
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.16));
        padding: 3px;
        border-radius: 12px;
        gap: 3px;
      }
      .mode-seg-btn {
        flex: 1;
        border: none;
        background: transparent;
        color: var(--secondary-text-color);
        font-family: inherit;
        font-size: 12px;
        font-weight: 600;
        padding: 6px 4px;
        border-radius: 9px;
        cursor: pointer;
      }
      .mode-seg-btn.active {
        background: var(--primary-color, #3b82f6);
        color: var(--text-primary-color, #ffffff);
        font-weight: 700;
      }
      .control-pill-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        flex-wrap: wrap;
        background: var(--secondary-background-color, rgba(128, 128, 128, 0.08));
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.16));
        padding: 6px 10px;
        border-radius: 999px;
      }
      .control-btn {
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.18));
        border-radius: 999px;
        min-width: 42px;
        height: 42px;
        padding: 0 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        cursor: pointer;
        color: var(--primary-text-color);
        font-family: inherit;
      }
      .control-btn.dimmed { opacity: 0.45; }
      .control-btn ha-icon { --mdc-icon-size: 18px; }
      .mini-tag { font-size: 11px; font-weight: 700; }
      .main-play-btn {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: var(--primary-color, #3b82f6);
        color: var(--text-primary-color, #ffffff);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .main-play-btn.cleaning { background: #f59e0b; }
      .main-play-btn.selection { background: #16a34a; }

      /* SECTION CARDS (CONTROLS & DOCK, SCHEDULE, HEALTH) */
      .passable-section-card {
        background: var(--secondary-background-color, rgba(128, 128, 128, 0.08));
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.16));
        border-radius: 16px;
        padding: 12px 13px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .passable-section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .passable-section-title {
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .dock-hero-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .dock-action-grid {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 6px;
      }
      .dock-action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        padding: 8px 6px;
        border-radius: 10px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        font-family: inherit;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
      }
      .dock-action-btn ha-icon { --mdc-icon-size: 16px; }
      .dock-action-btn.active {
        background: var(--primary-color, #3b82f6);
        border-color: var(--primary-color, #3b82f6);
        color: var(--text-primary-color, #ffffff);
      }
      .dock-action-btn.warn {
        border-color: rgba(239, 68, 68, 0.5);
        color: #ef4444;
      }

      .chip-select-block { display: flex; flex-direction: column; gap: 5px; }
      .chip-select-label { font-size: 12px; font-weight: 600; color: var(--secondary-text-color); }
      .chip-select-row { display: flex; flex-wrap: wrap; gap: 6px; }
      .opt-chip {
        flex: 1;
        min-width: 65px;
        padding: 6px 8px;
        border-radius: 10px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        font-family: inherit;
        font-size: 11.5px;
        font-weight: 600;
        cursor: pointer;
      }
      .opt-chip.active {
        background: var(--primary-color, #3b82f6);
        border-color: var(--primary-color, #3b82f6);
        color: var(--text-primary-color, #ffffff);
      }

      .slider-control { display: flex; flex-direction: column; gap: 4px; }
      .slider-header { display: flex; justify-content: space-between; font-size: 12.5px; font-weight: 600; }
      .slider-val { color: var(--primary-color, #3b82f6); font-weight: 700; }
      .p-range-input { width: 100%; accent-color: var(--primary-color, #3b82f6); }

      .drawer-row, .diag-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 7px 9px;
        border-radius: 10px;
        background: var(--card-background-color, rgba(128, 128, 128, 0.06));
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.14));
        font-size: 12.5px;
      }
      .diag-row { cursor: pointer; }
      .diag-list { display: flex; flex-direction: column; gap: 6px; }
      .row-text-stack { display: flex; flex-direction: column; gap: 2px; }
      .row-text-stack span { font-size: 11px; color: var(--secondary-text-color); }
      .switch-pill {
        border: 1px solid var(--divider-color);
        padding: 4px 12px;
        border-radius: 999px;
        font-family: inherit;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        background: var(--secondary-background-color);
        color: var(--secondary-text-color);
      }
      .switch-pill.active {
        background: var(--primary-color, #3b82f6);
        border-color: var(--primary-color, #3b82f6);
        color: var(--text-primary-color, #ffffff);
      }

      .schedule-routine-block {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--divider-color, rgba(128, 128, 128, 0.14));
      }
      .schedule-routine-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        font-weight: 700;
      }
      .days-row { display: flex; justify-content: space-between; gap: 4px; }
      .day-btn {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
      }
      .day-btn.active {
        background: var(--primary-color, #3b82f6);
        border-color: var(--primary-color, #3b82f6);
        color: var(--text-primary-color, #ffffff);
      }
      .dnd-times-row {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }
      .time-field {
        display: flex;
        flex-direction: column;
        gap: 3px;
        font-size: 11.5px;
        font-weight: 600;
        color: var(--secondary-text-color);
      }
      .time-field input {
        padding: 6px 8px;
        border-radius: 8px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        font-family: inherit;
      }

      .kpi-grid-3 {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 7px;
      }
      .kpi-card {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: 8px 10px;
        border-radius: 12px;
        background: var(--secondary-background-color, rgba(128, 128, 128, 0.08));
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.16));
      }
      .kpi-lbl { font-size: 10.5px; font-weight: 700; color: var(--secondary-text-color); text-transform: uppercase; }
      .kpi-num { font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; }

      .consumable-item { display: flex; flex-direction: column; gap: 5px; }
      .consumable-top { display: flex; justify-content: space-between; align-items: center; }
      .consumable-lbl { font-size: 13px; font-weight: 600; }
      .consumable-right { display: flex; align-items: center; gap: 8px; }
      .consumable-hrs { font-size: 12.5px; font-weight: 700; }
      .progress-bg {
        width: 100%;
        height: 7px;
        border-radius: 999px;
        background: var(--divider-color, rgba(128, 128, 128, 0.2));
        overflow: hidden;
      }
      .progress-fill { height: 100%; border-radius: 999px; transition: width 0.4s ease; }
      .reset-btn {
        background: var(--card-background-color, #fff);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        color: var(--primary-text-color);
      }
      .tone-good { color: #16a34a; }
      .tone-danger { color: #ef4444; }

      /* LOCAL POPUPS & MODAL SHELL */
      .local-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(2px);
        z-index: 6;
        display: flex;
        align-items: flex-end;
        justify-content: center;
      }
      .local-sheet {
        background: var(--ha-card-background, var(--card-background-color, #fff));
        width: 100%;
        padding: 18px;
        border-radius: 20px 20px 0 0;
        max-height: 80%;
        overflow-y: auto;
      }
      .local-sheet-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .local-sheet-header h3 { margin: 0; font-size: 16px; font-weight: 700; }
      .local-sheet-header button {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--secondary-text-color);
      }
      .local-sheet-body { display: flex; flex-direction: column; gap: 6px; }
      .modal-opt-btn {
        width: 100%;
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid var(--divider-color);
        background: var(--secondary-background-color, rgba(128, 128, 128, 0.08));
        color: var(--primary-text-color);
        font-family: inherit;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .modal-opt-btn.active {
        background: var(--primary-color, #3b82f6);
        border-color: var(--primary-color, #3b82f6);
        color: var(--text-primary-color, #ffffff);
      }

      .popup-overlay.modal-shell {
        position: fixed;
        inset: 0;
        background: var(--mdc-dialog-scrim-color, rgba(0, 0, 0, 0.45));
        backdrop-filter: blur(3px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        z-index: 9999;
      }
      .popup-content.modal-shell-card {
        background: var(--ha-card-background, var(--card-background-color, #fff));
        color: var(--primary-text-color);
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.2));
        border-radius: 24px;
        width: min(94vw, 540px);
        max-height: 88vh;
        padding: 14px 16px 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        box-shadow: 0 20px 48px rgba(0, 0, 0, 0.35);
        box-sizing: border-box;
      }
      .drag-handle { display: none; }
      .popup-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
      .popup-header-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
      .popup-title-stack h3 { margin: 0; font-size: 16px; font-weight: 700; }
      .popup-header-sub { font-size: 12px; color: var(--secondary-text-color); }
      .close-button {
        background: none;
        border: none;
        padding: 6px;
        border-radius: 50%;
        color: var(--primary-text-color);
        cursor: pointer;
        display: flex;
      }
      .modal-scroll-area {
        overflow-y: auto;
        max-height: 66vh;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding-right: 3px;
      }
      .thin-scroll::-webkit-scrollbar { width: 5px; }
      .thin-scroll::-webkit-scrollbar-thumb {
        background: rgba(148, 163, 184, 0.35);
        border-radius: 999px;
      }
      .spin-icon { animation: spin-slow 2s linear infinite; }
      @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

      @media (max-width: 768px) {
        .popup-overlay.modal-shell { align-items: flex-end; padding: 0; }
        .popup-content.modal-shell-card {
          width: 100%;
          max-width: 100%;
          border-radius: 24px 24px 0 0;
          padding-bottom: max(24px, env(safe-area-inset-bottom, 24px));
        }
        .drag-handle {
          display: block;
          width: 36px;
          height: 5px;
          background: var(--secondary-text-color, #888);
          border-radius: 3px;
          margin: -2px auto 4px;
          opacity: 0.6;
        }
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
    this._config = config || {};
  }

  _updateField(key, value) {
    if (!this._config) return;
    const next = { ...this._config };
    if (value === "" || value === undefined || value === null) delete next[key];
    else next[key] = value;
    this._config = next;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    if (!this.hass || !this._config) return html``;
    const c = this._config;
    const displayMode = c.display_mode === "summary" ? "summary" : "full";
    const showHeaderChecked =
      c.show_header !== undefined ? c.show_header !== false : displayMode === "full";

    return html`
      <div class="editor-container">
        <details class="section-card" open>
          <summary class="section-header">Display & Core Entities</summary>
          <div class="section-content">
            <div class="grid-2">
              <div class="field-col">
                <label class="field-label">Display Mode</label>
                <select
                  class="input-select"
                  .value=${displayMode}
                  @change=${(e) => this._updateField("display_mode", e.target.value)}
                >
                  <option value="full">Full Map View (Default)</option>
                  <option value="summary">Compact Summary + Popup</option>
                </select>
              </div>
              <div class="field-col">
                <label class="field-label">Summary Tile Style</label>
                <select
                  class="input-select"
                  .value=${c.layout === "rings" ? "rings" : "hero"}
                  @change=${(e) => this._updateField("layout", e.target.value)}
                >
                  <option value="hero">Hero + Hairline</option>
                  <option value="rings">Dual Rings</option>
                </select>
              </div>
            </div>

            <ha-entity-picker
              .hass=${this.hass}
              .value=${c.entity || ""}
              .label=${"Vacuum Entity *"}
              .includeDomains=${["vacuum"]}
              @value-changed=${(e) => this._updateField("entity", e.detail?.value)}
              allow-custom-entity
            ></ha-entity-picker>

            <ha-entity-picker
              .hass=${this.hass}
              .value=${c.map_camera || ""}
              .label=${"Default Map Camera / Image (Auto-switches floors when set up)"}
              .includeDomains=${["camera", "image"]}
              @value-changed=${(e) => this._updateField("map_camera", e.detail?.value)}
              allow-custom-entity
            ></ha-entity-picker>

            <div class="toggle-row">
              <span>Show Card Header</span>
              <ha-switch
                .checked=${showHeaderChecked}
                @change=${(e) => this._updateField("show_header", e.target.checked)}
              ></ha-switch>
            </div>
            <div class="toggle-row">
              <span>Show Summary Strip (Summary Mode)</span>
              <ha-switch
                .checked=${c.show_summary_strip !== false}
                @change=${(e) => this._updateField("show_summary_strip", e.target.checked)}
              ></ha-switch>
            </div>
            <div class="toggle-row">
              <span>Show Footer Strip (Summary Mode)</span>
              <ha-switch
                .checked=${c.show_footer_strip !== false}
                @change=${(e) => this._updateField("show_footer_strip", e.target.checked)}
              ></ha-switch>
            </div>
          </div>
        </details>

        <details class="section-card">
          <summary class="section-header">Schedule & Optional Overrides</summary>
          <div class="section-content">
            <ha-entity-picker
              .hass=${this.hass}
              .value=${c.schedule_enable || ""}
              .label=${"Enable Schedule Entity (Optional)"}
              .includeDomains=${["input_boolean"]}
              @value-changed=${(e) => this._updateField("schedule_enable", e.detail?.value)}
              allow-custom-entity
            ></ha-entity-picker>
            <p class="help-text">
              Leave overrides blank to auto-discover Roborock Q Revo sensors, cleaning mode, dock controls, multi-floor maps, DND schedule, and consumable reset buttons.
            </p>
          </div>
        </details>
      </div>
    `;
  }

  static get styles() {
    return css`
      .editor-container { display: flex; flex-direction: column; gap: 10px; padding: 8px 0; }
      .section-card {
        border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.2));
        border-radius: 10px;
        background: var(--secondary-background-color, rgba(128, 128, 128, 0.06));
      }
      .section-header { padding: 11px 14px; font-weight: 700; font-size: 13px; cursor: pointer; }
      .section-content {
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        border-top: 1px solid var(--divider-color, rgba(128, 128, 128, 0.14));
      }
      .grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
      .field-col { display: flex; flex-direction: column; gap: 4px; }
      .field-label { font-size: 12px; font-weight: 600; color: var(--secondary-text-color); }
      .input-select {
        padding: 8px 10px;
        border-radius: 8px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color, #fff);
        color: var(--primary-text-color);
        font-family: inherit;
      }
      .toggle-row { display: flex; align-items: center; justify-content: space-between; font-size: 13px; font-weight: 500; }
      .help-text { font-size: 12px; color: var(--secondary-text-color); margin: 0; }
      ha-entity-picker { display: block; width: 100%; }
    `;
  }
}

if (!customElements.get("passable-vacuum-card-editor")) {
  customElements.define("passable-vacuum-card-editor", PassableVacuumCardEditor);
}
if (!customElements.get("vacuum-dashboard-card-editor")) {
  class LegacyVacuumCardEditor extends PassableVacuumCardEditor {}
  customElements.define("vacuum-dashboard-card-editor", LegacyVacuumCardEditor);
}

PassableVacuumCard.getConfigElement = () =>
  document.createElement("passable-vacuum-card-editor");

if (!customElements.get("passable-vacuum-card")) {
  customElements.define("passable-vacuum-card", PassableVacuumCard);
}
if (!customElements.get("vacuum-dashboard-card")) {
  class LegacyVacuumCard extends PassableVacuumCard {}
  customElements.define("vacuum-dashboard-card", LegacyVacuumCard);
}

window.customCards = window.customCards || [];
window.customCards.push({
  type: "passable-vacuum-card",
  name: "Passable Vacuum Card",
  preview: true,
  documentationURL: "https://github.com/GBear09/passable-vacuum-card",
  description:
    "Passable design-system robot vacuum card with interactive multi-floor map, compact summary mode, Q Revo dock controls, scheduling, and consumable diagnostics.",
});
