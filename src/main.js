// - stores patient JSON in sessionStorage as 'patient' (via tile manager)
// - supports two logical routes: '/' and '/tile' (detects location.pathname)

import { getPatient, onPatientChanged } from "@arrowhealth/bridge-sdk";
import { initializeTileState, reactToPatientChange } from "./tile.js";

const out = document.getElementById("out");
const title = document.getElementById("title");

//make rednered patient object look nice - demo purposes only
function pretty(obj) {
  return JSON.stringify(obj, null, 2);
}

/**
 *  - Root path ("/"):
 *      - no patient -> Title: "Default Page", out: no-patient explanatory line
 *      - patient -> Title: "Patient Page", out: explanatory line + JSON
 *  - Tile path is controlled by tile.js, main still hydrates out content but tile will be visible on /tile
 */

function renderPatient(patient) {
  try {
    // let tile manager handle sessionStorage + tile state/background
    reactToPatientChange(patient);
  } catch (e) {
    console.warn("reactToPatientChange failed:", e);
  }

  const path = (window.location.pathname || "/").replace(/\/+$/, "") || "/";

  if (path === "/") {
    if (!patient) {
      if (title) title.textContent = "Default Page";
      out.textContent =
        "This Panel will display when there is no patient detected. (getPatient returned null).";
      return;
    } else {
      if (title) title.textContent = "Patient Page";
      out.textContent =
        "The patient object will be fully available for patient evaluation or data transmission.\n\n\n\n" +
        pretty(patient);
      return;
    }
  }

  // Non-root paths (except /tile) - fallback to default
  if (title) title.textContent = "Default Panel";
  out.textContent = patient
    ? pretty(patient)
    : "This Panel will display when there is no patient detected. (getPatient returned null).";
}

async function initializeTile() {
  // initialize tile manager (hydrates tile background/letter if /tile)
  initializeTileState({
    hydrateFromSession: true,
  });

  try {
    const patient = await getPatient();
    renderPatient(patient);
  } catch (err) {
    console.error("getPatient() error:", err);
    out.textContent =
      "getPatient() error: " + (err && err.message ? err.message : String(err));
  }

  onPatientChanged((patient) => {
    renderPatient(patient);
  });
}

window.addEventListener("DOMContentLoaded", () => initializeTile());
