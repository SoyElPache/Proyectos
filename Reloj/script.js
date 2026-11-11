// =====================================================
// RELOJ DIGITAL
// Conceptos que practicas: Date, Intl.DateTimeFormat,
// setInterval, eventos y localStorage.
// =====================================================

// ---------- 1. Elementos del HTML que vamos a usar ----------
const timeEl = document.getElementById("time");
const dateEl = document.getElementById("date");
const zoneSelect = document.getElementById("timezone");
const formatBtn = document.getElementById("format-btn");

// ---------- 2. Zonas horarias disponibles ----------
// "value" es el nombre oficial de la zona (formato IANA).
// La primera opción usa la zona de tu propia computadora.
const LOCAL_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

const ZONES = [
  { label: "Mi zona local", value: LOCAL_ZONE },
  { label: "Ciudad de México", value: "America/Mexico_City" },
  { label: "Nueva York", value: "America/New_York" },
  { label: "Los Ángeles", value: "America/Los_Angeles" },
  { label: "Bogotá", value: "America/Bogota" },
  { label: "Buenos Aires", value: "America/Argentina/Buenos_Aires" },
  { label: "Londres", value: "Europe/London" },
  { label: "Madrid", value: "Europe/Madrid" },
  { label: "Tokio", value: "Asia/Tokyo" },
  { label: "Sídney", value: "Australia/Sydney" }
];

// ---------- 3. Estado (lo que el usuario puede cambiar) ----------
let use24h = true;          // true = formato 24 h, false = formato 12 h
let timeZone = LOCAL_ZONE;  // zona horaria seleccionada

// ---------- 4. Guardar y cargar preferencias ----------
// localStorage guarda datos en el navegador aunque cierres la página.
// Usamos try/catch por si el navegador bloquea el almacenamiento.
function savePreferences() {
  try {
    localStorage.setItem("reloj-use24h", String(use24h));
    localStorage.setItem("reloj-timezone", timeZone);
  } catch (error) {
    // Si falla, simplemente no se guardan las preferencias
  }
}

function loadPreferences() {
  try {
    const savedFormat = localStorage.getItem("reloj-use24h");
    const savedZone = localStorage.getItem("reloj-timezone");

    // localStorage solo guarda texto, por eso comparamos con "false"
    if (savedFormat !== null) use24h = savedFormat === "true";

    // Solo aceptamos la zona guardada si sigue existiendo en nuestra lista
    if (savedZone && ZONES.some((zone) => zone.value === savedZone)) {
      timeZone = savedZone;
    }
  } catch (error) {
    // Si falla, usamos los valores por defecto
  }
}

// ---------- 5. Llenar el <select> con las zonas ----------
function fillZoneOptions() {
  ZONES.forEach((zone) => {
    const option = document.createElement("option");
    option.value = zone.value;
    option.textContent = zone.label;
    zoneSelect.appendChild(option);
  });
}

// ---------- 6. Actualizar el reloj ----------
function updateClock() {
  // Date() sin argumentos = momento actual
  const now = new Date();

  // Intl.DateTimeFormat da formato a la fecha según idioma y zona.
  // hour12: true muestra a. m. / p. m.; false usa 24 horas.
  const timeFormatter = new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: !use24h,
    timeZone: timeZone
  });

  // Formato largo de la fecha: "miércoles, 11 de noviembre de 2026"
  const dateFormatter = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: timeZone
  });

  timeEl.textContent = timeFormatter.format(now);
  dateEl.textContent = dateFormatter.format(now);
}

// ---------- 7. Actualizar el texto del botón ----------
// Muestra el formato al que cambiarás si lo pulsas
function updateButtonLabel() {
  formatBtn.textContent = use24h ? "24 h" : "12 h";
  formatBtn.setAttribute(
    "aria-label",
    use24h ? "Cambiar a formato de 12 horas" : "Cambiar a formato de 24 horas"
  );
}

// ---------- 8. Eventos ----------
// Al pulsar el botón alternamos entre 12 h y 24 h
formatBtn.addEventListener("click", () => {
  use24h = !use24h;     // "!" invierte el valor: true -> false, false -> true
  updateButtonLabel();
  updateClock();        // actualizamos de inmediato, sin esperar al siguiente segundo
  savePreferences();
});

// Al elegir otra zona en el <select>
zoneSelect.addEventListener("change", () => {
  timeZone = zoneSelect.value;
  updateClock();
  savePreferences();
});

// ---------- 9. Arranque ----------
loadPreferences();
fillZoneOptions();
zoneSelect.value = timeZone;  // muestra seleccionada la zona guardada
updateButtonLabel();
updateClock();                // primera actualización inmediata

// Repite updateClock cada 1000 ms (1 segundo)
setInterval(updateClock, 1000);
