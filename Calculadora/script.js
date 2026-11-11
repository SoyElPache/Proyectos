// ---------- Estado ----------
const state = {
  current: "0",      // número que se está escribiendo (texto)
  previous: null,    // primer operando
  operator: null,    // "+", "-", "*", "/"
  overwrite: false,  // true = el siguiente dígito reemplaza la pantalla
  expression: ""     // texto pequeño de arriba
};

const SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷" };
const MAX_DIGITS = 12;

const displayEl = document.getElementById("display");
const historyEl = document.getElementById("history");

// ---------- Lógica pura ----------
function calculate(a, b, operator) {
  const x = parseFloat(a);
  const y = parseFloat(b);

  switch (operator) {
    case "+": return x + y;
    case "-": return x - y;
    case "*": return x * y;
    case "/": return y === 0 ? null : x / y; // null = error
    default: return y;
  }
}

// Evita cosas como 0.1 + 0.2 = 0.30000000000000004
function formatResult(n) {
  return String(parseFloat(n.toPrecision(12)));
}

// ---------- Acciones ----------
function resetIfError() {
  if (state.current === "Error") clearAll();
}

function inputDigit(digit) {
  resetIfError();
  if (state.overwrite) {
    state.current = digit;
    state.overwrite = false;
    if (!state.operator) state.expression = "";
  } else if (state.current === "0") {
    state.current = digit;
  } else if (state.current.replace(/[-.]/g, "").length < MAX_DIGITS) {
    state.current += digit;
  }
}

function inputDecimal() {
  resetIfError();
  if (state.overwrite) {
    state.current = "0.";
    state.overwrite = false;
    return;
  }
  if (!state.current.includes(".")) state.current += ".";
}

function chooseOperator(op) {
  resetIfError();
  // Si ya había una operación pendiente, la resolvemos primero (2 + 3 + ...)
  if (state.operator && !state.overwrite) {
    evaluate(true);
    if (state.current === "Error") return;
  }
  state.previous = state.current;
  state.operator = op;
  state.overwrite = true;
  state.expression = `${state.previous} ${SYMBOLS[op]}`;
}

function evaluate(chained = false) {
  if (!state.operator || state.previous === null) return;

  const result = calculate(state.previous, state.current, state.operator);

  if (result === null) {
    state.current = "Error";
    state.expression = "No se puede dividir entre 0";
    state.previous = null;
    state.operator = null;
    state.overwrite = true;
    return;
  }

  if (!chained) {
    state.expression = `${state.previous} ${SYMBOLS[state.operator]} ${state.current} =`;
  }

  state.current = formatResult(result);
  state.previous = null;
  state.operator = null;
  state.overwrite = true;
}

function clearAll() {
  state.current = "0";
  state.previous = null;
  state.operator = null;
  state.overwrite = false;
  state.expression = "";
}

function backspace() {
  resetIfError();
  if (state.overwrite) return;
  state.current = state.current.length > 1 && state.current !== "-0"
    ? state.current.slice(0, -1)
    : "0";
  if (state.current === "-") state.current = "0";
}

function toggleSign() {
  resetIfError();
  if (state.current === "0") return;
  state.current = state.current.startsWith("-")
    ? state.current.slice(1)
    : "-" + state.current;
}

function percent() {
  resetIfError();
  state.current = formatResult(parseFloat(state.current) / 100);
  state.overwrite = true;
}

// ---------- Pantalla ----------
function render() {
  displayEl.textContent = state.current;
  historyEl.textContent = state.expression;
}

// ---------- Eventos: clics ----------
document.querySelector(".keys").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const { action, value } = button.dataset;

  switch (action) {
    case "digit": inputDigit(value); break;
    case "decimal": inputDecimal(); break;
    case "operator": chooseOperator(value); break;
    case "equals": evaluate(); break;
    case "clear": clearAll(); break;
    case "backspace": backspace(); break;
    case "sign": toggleSign(); break;
    case "percent": percent(); break;
  }
  render();
});

// ---------- Eventos: teclado ----------
document.addEventListener("keydown", (event) => {
  const { key } = event;

  if (/^[0-9]$/.test(key)) inputDigit(key);
  else if (key === "." || key === ",") inputDecimal();
  else if (["+", "-", "*", "/"].includes(key)) chooseOperator(key);
  else if (key === "Enter" || key === "=") { event.preventDefault(); evaluate(); }
  else if (key === "Backspace") backspace();
  else if (key === "Escape" || key === "Delete") clearAll();
  else if (key === "%") percent();
  else return;

  render();
});

render();
