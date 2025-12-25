const TIME_ZONE = "America/Toronto";

let ORNAMENTS = [];
let PASS_PHRASES = [];

const ORNAMENT_POSITIONS = [
  { top: "25.12%", left: "50.3%" },
  { top: "31.95%", left: "38.85%" },
  { top: "36.31%", left: "55.05%" },
  { top: "52.11%", left: "52.7%" },
  { top: "52.67%", left: "69.95%" },
  { top: "84.24%", left: "52.95%" },
  { top: "9.5%", left: "49.1%" },
];

const layer = document.getElementById("ornament-layer");
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modal-close");
const modalLocked = document.getElementById("modal-locked");
const modalGate = document.getElementById("modal-gate");
const modalContent = document.getElementById("modal-content");
const lockedDate = document.getElementById("locked-date");
const gateTitle = document.getElementById("gate-title");
const passphraseInput = document.getElementById("passphrase");
const unlockBtn = document.getElementById("unlock-btn");
const gateError = document.getElementById("gate-error");
const gateHint = document.getElementById("gate-hint");
const contentDate = document.getElementById("content-date");
const contentTitle = document.getElementById("content-title");
const contentBody = document.getElementById("content-body");
const mediaSlot = document.getElementById("media-slot");
const adminToggle = document.getElementById("admin-toggle");

let activeIndex = null;
let adminMode = false;

function readAdminMode() {
  return localStorage.getItem("adminMode") === "true";
}

function writeAdminMode(value) {
  localStorage.setItem("adminMode", value ? "true" : "false");
}

function setAdminMode(value) {
  adminMode = value;
  writeAdminMode(value);
  adminToggle.classList.toggle("active", value);
  adminToggle.textContent = value ? "Admin: all unlocked" : "Admin mode";
  renderOrnaments();
}

function getTodayInTimeZone(timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());
  const values = parts.reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  return `${values.year}-${values.month}-${values.day}`;
}

function getLatestUnlockedIndex(today) {
  let latest = -1;
  ORNAMENTS.forEach((ornament, index) => {
    if (ornament.date <= today) {
      latest = index;
    }
  });
  return latest;
}

function readOpened() {
  try {
    const raw = localStorage.getItem("openedOrnaments");
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function writeOpened(opened) {
  localStorage.setItem("openedOrnaments", JSON.stringify(opened));
}

function formatDisplayDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${month}/${day}/${year}`;
}

function setModalState(state) {
  modalLocked.hidden = state !== "locked";
  modalGate.hidden = state !== "gate";
  modalContent.hidden = state !== "content";
}

function openModal() {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  passphraseInput.value = "";
  gateError.textContent = "";
}

function renderOrnaments() {
  const today = getTodayInTimeZone(TIME_ZONE);
  const latestUnlockedIndex = adminMode ? ORNAMENTS.length - 1 : getLatestUnlockedIndex(today);
  const opened = readOpened();

  layer.innerHTML = "";

  ORNAMENTS.forEach((ornament, index) => {
    const button = document.createElement("button");
    button.className = "ornament";
    button.type = "button";
    button.textContent = `${index + 1}`;
    button.dataset.index = index;

    const position = ORNAMENT_POSITIONS[index];
    button.style.top = position.top;
    button.style.left = position.left;

    const isFuture = index > latestUnlockedIndex;
    const isOpened = opened.includes(index);

    if (isFuture) {
      button.classList.add("locked");
      button.setAttribute("aria-label", `Ornament ${index + 1}, locked`);
    } else if (isOpened) {
      button.classList.add("opened");
      button.setAttribute("aria-label", `Ornament ${index + 1}, opened`);
    } else {
      button.classList.add("available");
      button.setAttribute("aria-label", `Ornament ${index + 1}, available`);
    }

    button.addEventListener("click", () => handleOrnamentClick(index, today, latestUnlockedIndex));
    layer.appendChild(button);
  });
}

function handleOrnamentClick(index, today, latestUnlockedIndex) {
  activeIndex = index;
  const ornament = ORNAMENTS[index];
  const opened = readOpened();
  const isFuture = index > latestUnlockedIndex;

  if (isFuture) {
    lockedDate.textContent = formatDisplayDate(ornament.date);
    setModalState("locked");
    openModal();
    return;
  }

  if (opened.includes(index)) {
    populateContent(ornament);
    setModalState("content");
    openModal();
    return;
  }

  if (adminMode) {
    populateContent(ornament);
    setModalState("content");
    openModal();
    return;
  }

  gateTitle.textContent = `Ornament for ${ornament.year}`;
  gateHint.textContent = ornament.passphraseHint ? `Hint: ${ornament.passphraseHint}` : "";
  setModalState("gate");
  openModal();
  passphraseInput.focus();
}

function populateContent(ornament) {
  contentDate.textContent = `${formatDisplayDate(ornament.date)} · ${ornament.year}`;
  contentTitle.textContent = ornament.title || `A memory from ${ornament.year}`;
  contentBody.textContent =
    ornament.body ||
    "Placeholder: a short, tender paragraph about this year will live here. It should feel warm, honest, and intimate.";

  mediaSlot.innerHTML = "";
  if (ornament.media && ornament.media.type && ornament.media.src) {
    if (ornament.media.type === "video") {
      const video = document.createElement("video");
      video.controls = true;
      video.playsInline = true;
      video.src = ornament.media.src;
      video.setAttribute("aria-label", ornament.media.alt || "Ornament video");
      mediaSlot.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = ornament.media.src;
      img.alt = ornament.media.alt || "Ornament image";
      mediaSlot.appendChild(img);
    }
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "media-placeholder";
    placeholder.textContent = "Media placeholder";
    mediaSlot.appendChild(placeholder);
  }
}

function unlockActiveOrnament() {
  if (activeIndex === null) {
    return;
  }

  const attempt = passphraseInput.value.trim();
  const expected = PASS_PHRASES[activeIndex];
  if (!expected) {
    gateError.textContent = "Passphrases are not available yet.";
    return;
  }
  if (attempt.toLowerCase() !== expected.toLowerCase()) {
    gateError.textContent = "That passphrase does not match.";
    return;
  }

  const opened = readOpened();
  if (!opened.includes(activeIndex)) {
    opened.push(activeIndex);
    writeOpened(opened);
  }

  const ornament = ORNAMENTS[activeIndex];
  populateContent(ornament);
  setModalState("content");
  renderOrnaments();
}

async function loadContent() {
  try {
    const response = await fetch("content/days.json");
    if (!response.ok) {
      throw new Error(`Failed to load content: ${response.status}`);
    }
    ORNAMENTS = await response.json();
  } catch (err) {
    ORNAMENTS = [];
  }
}

async function loadPassphrases() {
  try {
    const response = await fetch("content/passphrases.json");
    if (!response.ok) {
      throw new Error(`Failed to load passphrases: ${response.status}`);
    }
    PASS_PHRASES = await response.json();
  } catch (err) {
    PASS_PHRASES = [];
  }
}

async function init() {
  await loadContent();
  await loadPassphrases();
  setAdminMode(readAdminMode());
  renderOrnaments();
}

modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});
unlockBtn.addEventListener("click", unlockActiveOrnament);
passphraseInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    unlockActiveOrnament();
  }
});

adminToggle.addEventListener("click", () => {
  if (adminMode) {
    setAdminMode(false);
    return;
  }
  const attempt = window.prompt("Enter admin password:");
  if (attempt === "admin123") {
    setAdminMode(true);
  } else if (attempt !== null) {
    window.alert("That password does not match.");
  }
});

init();
