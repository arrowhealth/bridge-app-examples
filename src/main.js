// src/main.js
// - stores patient JSON in sessionStorage as 'patient'
// - supports two logical routes: '/' and '/tile' (detects location.pathname)

import { getPatient, onPatientChanged } from "@arrowhealth/bridge-sdk";

const out = document.getElementById("out");
const title = document.getElementById("title");
const mode = document.getElementById("mode");

function pretty(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    return String(obj);
  }
}

function renderPatient(patient) {
  if (!patient) {
    out.textContent = "No patient is available (getPatient returned null).";
    return;
  }
  out.textContent = pretty(patient);
}

function setModeText() {
  const path = window.location.pathname || "/";
  if (path === "/" || path === "") {
    title.textContent = "Hello world";
    mode.textContent = "Mode: root ( / )";
  } else if (path === "/tile" || path === "/tile/") {
    title.textContent = "Tile Mode";
    mode.textContent = "Mode: tile ( /tile )";
  } else {
    title.textContent = "Hello world";
    mode.textContent = "Mode: " + path;
  }
}

async function initializeTileSimple() {
  setModeText();
  console.log("initializeTile (simple) — calling getPatient()");

  try {
    const patient = await getPatient();
    console.log("getPatient ->", patient);
    if (patient) {
      sessionStorage.setItem("patient", JSON.stringify(patient));
      renderPatient(patient);
    } else {
      sessionStorage.removeItem("patient");
      renderPatient(null);
    }
  } catch (err) {
    console.error("getPatient() error:", err);
    out.textContent =
      "getPatient() error: " + (err && err.message ? err.message : String(err));
  }

  // register listener for patient changes if available
  let off;
  try {
    off = onPatientChanged((patient) => {
      console.log("onPatientChanged ->", patient);
      if (patient) {
        sessionStorage.setItem("patient", JSON.stringify(patient));
        renderPatient(patient);
      } else {
        sessionStorage.removeItem("patient");
        renderPatient(null);
      }
    });
  } catch (e) {
    // onPatientChanged may not be available in local browser dev environment
    console.warn("onPatientChanged not available or failed to register:", e);
  }

  // cleanup on unload
  window.addEventListener("beforeunload", () => {
    if (typeof off === "function") {
      try {
        off();
      } catch (e) {
        /* ignore */
      }
    }
  });
}

window.addEventListener("DOMContentLoaded", () => initializeTileSimple());
