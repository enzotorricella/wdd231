export const TEAM_KEY = "battleLabTeam";
export const HISTORY_KEY = "battleLabHistory";
export const PROFILE_KEY = "battleLabProfile";

export function setupPage() {
  document.querySelectorAll("[data-year]").forEach(node => { node.textContent = new Date().getFullYear(); });
  const button = document.querySelector(".menu-button");
  const nav = document.querySelector(".main-nav");
  button?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
}

export function getStoredTeam() {
  try { return JSON.parse(localStorage.getItem(TEAM_KEY)) || []; }
  catch { return []; }
}

export function saveTeam(team) { localStorage.setItem(TEAM_KEY, JSON.stringify(team)); }

setupPage();
