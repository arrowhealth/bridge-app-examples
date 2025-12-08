// simple tile state manager for only two states: "default" and "patient"

const DEFAULT_BG = "#000";
const PATIENT_BG = "#008000";

const _internal = {
  tileState: "default",
  tileColor: DEFAULT_BG,
};

/**
 * Helper: returns true if current path is /tile
 */
function isTilePath() {
  const path = (window.location.pathname || "/").replace(/\/+$/, "") || "/";
  return path === "/tile";
}

/**
 * Helper: update the DOM tile letter element when on /tile
 *   letter: 'P' for patient, 'D' for default/no-patient
 */
function updateTileLetter(letter) {
  if (isTilePath()) {
    document.body.style.background = _internal.tileColor;
  } else {
    document.body.style.background = DEFAULT_BG;
  }

  const tileEl = document.getElementById("tile");
  const letterEl = document.getElementById("tile-letter");

  if (!tileEl || !letterEl) return;

  if (isTilePath()) {
    document.body.classList.add("tile-mode");
    tileEl.style.display = "flex";
    letterEl.textContent = letter;
  } else {
    document.body.classList.remove("tile-mode");
    tileEl.style.display = "none";
  }
}

/**
 * Apply a tile state by name ('default' or 'patient').
 * This updates:
 *  - internal state (tileColor, tileState)
 *  - sessionStorage.tileState
 *  - document.body.style.background
 *  - tile letter (P/D) when on /tile
 */
export function applyTileState(stateName = "default") {
  if (stateName !== "patient" && stateName !== "default") {
    stateName = "default";
  }

  _internal.tileState = stateName;
  if (stateName === "patient") {
    _internal.tileColor = PATIENT_BG;
  } else {
    _internal.tileColor = DEFAULT_BG;
  }

  // persist minimal info so other windows / code can react
  sessionStorage.setItem("tileState", _internal.tileState);
  updateTileLetter(stateName === "patient" ? "P" : "D");

  return _internal.tileState;
}

/**
 * Called when you detect a patient update.
 * - stores/removes sessionStorage.patient
 * - applies tile state 'patient' or 'default'
 */
export function reactToPatientChange(patient) {
  try {
    if (patient) {
      sessionStorage.setItem("patient", JSON.stringify(patient));
      applyTileState("patient");
    } else {
      sessionStorage.removeItem("patient");
      applyTileState("default");
    }
  } catch (e) {
    console.warn("reactToPatientChange error", e);
    applyTileState(patient ? "patient" : "default");
  }
}

/**
 * Initialize manager.
 *
 * Options:
 *  - hydrateFromSession: if true will read sessionStorage.patient and set initial state from that
 *
 * Returns the current tile state ('default'|'patient')
 */
export function initializeTileState({ hydrateFromSession = true } = {}) {
  // If hydrateFromSession and a patient is in sessionStorage, set patient state
  if (hydrateFromSession) {
    try {
      const sessPatient = sessionStorage.getItem("patient");
      if (sessPatient) {
        _internal.tileState = "patient";
        _internal.tileColor = PATIENT_BG;
      } else {
        _internal.tileState = "default";
        _internal.tileColor = DEFAULT_BG;
      }
    } catch (e) {
      // fall back to default if there is an error
      _internal.tileState = "default";
      _internal.tileColor = DEFAULT_BG;
    }
  }
  updateTileLetter(_internal.tileState === "patient" ? "P" : "D");
  try {
    sessionStorage.setItem("tileState", _internal.tileState);
  } catch (e) {}

  return _internal.tileState;
}

export const state = {
  get tileState() {
    return _internal.tileState;
  },
  get tileColor() {
    return _internal.tileColor;
  },
};
