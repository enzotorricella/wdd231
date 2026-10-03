import { fetchPokemonList, fetchPokemonByIds, formatName } from "./api.js";
import { saveTeam, HISTORY_KEY } from "./shared.js";

const selectors = [...document.querySelectorAll(".pokemon-select")];
const typeFilter = document.querySelector("#type-filter");
const status = document.querySelector("#roster-status");
const readiness = document.querySelector("#team-readiness");
const startButton = document.querySelector("#start-battle");
const arena = document.querySelector("#battle-results");
const pokemonModal = document.querySelector("#pokemon-modal");
const modalContent = document.querySelector("#modal-content");
const resultModal = document.querySelector("#result-modal");
const resultContent = document.querySelector("#result-content");
const rosterGallery = document.querySelector("#roster-gallery");
const statNames = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];
const statLabels = { hp: "HP", attack: "Attack", defense: "Defense", "special-attack": "Sp. Atk", "special-defense": "Sp. Def", speed: "Speed" };
let roster = [];
let selectedTeam = [null, null, null];

function randomItems(items, count) {
  return [...items].sort(() => Math.random() - 0.5).slice(0, count);
}

function availableRoster(slotIndex) {
  const type = typeFilter.value;
  const selectedElsewhere = selectedTeam.filter((item, index) => item && index !== slotIndex).map(item => item.id);
  return roster.filter(item => (type === "all" || item.types.includes(type)) && !selectedElsewhere.includes(item.id));
}

function renderOptions() {
  selectors.forEach((select, index) => {
    const currentId = selectedTeam[index]?.id || "";
    const options = availableRoster(index).map(item => `<option value="${item.id}"${item.id === Number(currentId) ? " selected" : ""}>#${String(item.id).padStart(3, "0")} — ${formatName(item.name)} · ${item.types.map(formatName).join(" / ")}</option>`).join("");
    select.innerHTML = `<option value="">Choose Pokémon…</option>${options}`;
    if (currentId && !availableRoster(index).some(item => item.id === Number(currentId))) {
      selectedTeam[index] = null;
      select.value = "";
      updateSlot(index);
    }
  });
  updateReadiness();
}

function updateSlot(index) {
  const slot = document.querySelector(`[data-slot="${index}"]`);
  const preview = slot.querySelector(".slot-preview");
  const details = slot.querySelector(".slot-details");
  const pokemon = selectedTeam[index];
  slot.classList.toggle("ready", Boolean(pokemon));
  details.disabled = !pokemon;
  preview.innerHTML = pokemon
    ? `<img src="${pokemon.sprite}" alt="${formatName(pokemon.name)}" width="160" height="160"><div class="preview-data"><strong>${formatName(pokemon.name)}</strong><span>${pokemon.types.map(formatName).join(" / ")}</span><small>BST ${pokemon.total}</small></div>`
    : `<div class="slot-placeholder" aria-hidden="true">?</div>`;
}

function updateReadiness() {
  const count = selectedTeam.filter(Boolean).length;
  readiness.textContent = `${count} / 3 FIGHTERS READY`;
  startButton.disabled = count !== 3;
  startButton.classList.toggle("disabled", count !== 3);
  status.textContent = count === 3 ? "Team locked. Arena ready." : `${roster.length} fighters online · choose ${3 - count} more`;
  if (count === 3) saveTeam(selectedTeam);
}

function openDetails(pokemon) {
  modalContent.innerHTML = `<div class="modal-detail"><div class="modal-image"><img src="${pokemon.image}" alt="${formatName(pokemon.name)}" width="320" height="320"></div><div class="modal-info"><p class="eyebrow">POKÉDEX #${String(pokemon.id).padStart(4, "0")}</p><h2 id="modal-name">${formatName(pokemon.name)}</h2><div class="type-list">${pokemon.types.map(type => `<span class="type">${formatName(type)}</span>`).join("")}</div><p>${pokemon.height} m · ${pokemon.weight} kg<br>Abilities: ${pokemon.abilities.map(formatName).join(", ")}</p><div class="full-stats">${Object.entries(pokemon.stats).map(([name, value]) => `<div class="stat-row"><span>${statLabels[name]}</span><span class="stat-bar"><i style="width:${Math.min(value / 180 * 100, 100)}%"></i></span><strong>${value}</strong></div>`).join("")}</div></div></div>`;
  pokemonModal.showModal();
}

function renderRosterGallery() {
  rosterGallery.innerHTML = roster.map(item => `
    <article class="roster-card">
      <div class="roster-number">#${String(item.id).padStart(3, "0")}</div>
      <img src="${item.sprite}" alt="${formatName(item.name)}" width="120" height="120" loading="lazy">
      <h3>${formatName(item.name)}</h3>
      <p class="roster-types">${item.types.map(formatName).join(" / ")}</p>
      <dl>
        <div><dt>BST</dt><dd>${item.total}</dd></div>
        <div><dt>ATK</dt><dd>${item.stats.attack}</dd></div>
        <div><dt>DEF</dt><dd>${item.stats.defense}</dd></div>
        <div><dt>SPD</dt><dd>${item.stats.speed}</dd></div>
      </dl>
      <button type="button" data-roster-id="${item.id}">Inspect stats</button>
    </article>
  `).join("");
}

function judgeRound(player, rival) {
  let playerPoints = 0;
  let rivalPoints = 0;
  const comparisons = randomItems(statNames, 3).map(stat => {
    const playerValue = player.stats[stat];
    const rivalValue = rival.stats[stat];
    if (playerValue > rivalValue) playerPoints += 1;
    if (rivalValue > playerValue) rivalPoints += 1;
    return { stat, playerValue, rivalValue };
  });
  return { comparisons, winner: playerPoints > rivalPoints ? "player" : rivalPoints > playerPoints ? "rival" : "draw" };
}

function teamCards(team, label) {
  return `<div><p class="arena-team-label">${label}</p><div class="battle-team">${team.map(item => `<div class="fighter"><img src="${item.sprite}" alt="${formatName(item.name)}" width="120" height="120"><strong>${formatName(item.name)}</strong></div>`).join("")}</div></div>`;
}

async function simulateBattle() {
  startButton.disabled = true;
  startButton.textContent = "Generating rival…";
  arena.hidden = false;
  arena.innerHTML = `<div class="arena-loading"><span></span><p>Scanning rival roster…</p></div>`;
  arena.scrollIntoView({ behavior: "smooth", block: "start" });
  try {
    const selectedIds = selectedTeam.map(item => item.id);
    const rivalPool = roster.filter(item => !selectedIds.includes(item.id));
    const rivalTeam = await fetchPokemonByIds(randomItems(rivalPool, 3).map(item => item.id));
    let playerScore = 0;
    let rivalScore = 0;
    const rounds = selectedTeam.map((player, index) => {
      const outcome = judgeRound(player, rivalTeam[index]);
      if (outcome.winner === "player") playerScore += 1;
      if (outcome.winner === "rival") rivalScore += 1;
      return { player, rival: rivalTeam[index], ...outcome };
    });
    const result = playerScore > rivalScore ? "win" : rivalScore > playerScore ? "loss" : "draw";
    const history = getHistory();
    history[`${result}s`] += 1;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    arena.innerHTML = `<div class="inline-score"><span>PLAYER <strong>${playerScore}</strong></span><b>FINAL</b><span><strong>${rivalScore}</strong> RIVAL</span></div><div class="arena-matchup">${teamCards(selectedTeam, "YOUR SQUAD")}<div class="versus-label">VS</div>${teamCards(rivalTeam, "RIVAL SQUAD")}</div><div class="rounds">${rounds.map((round, index) => `<article class="round-card"><div class="round-head"><h3>Round ${index + 1}: ${formatName(round.player.name)} vs ${formatName(round.rival.name)}</h3><span class="round-winner">${round.winner === "draw" ? "Draw" : `${round.winner === "player" ? formatName(round.player.name) : formatName(round.rival.name)} wins`}</span></div>${round.comparisons.map(item => `<div class="comparison"><span class="${item.playerValue > item.rivalValue ? "higher" : ""}">${item.playerValue} · ${formatName(round.player.name)}</span><span class="stat-name">${statLabels[item.stat]}</span><span class="${item.rivalValue > item.playerValue ? "higher" : ""}">${formatName(round.rival.name)} · ${item.rivalValue}</span></div>`).join("")}</article>`).join("")}</div><div class="arena-actions"><button id="rematch" class="button" type="button">Battle again</button><button id="change-team" class="button" type="button">Change team</button></div>`;
    resultContent.innerHTML = `<div class="result-icon" aria-hidden="true">${result === "win" ? "🏆" : result === "loss" ? "⚡" : "🤝"}</div><p class="eyebrow">FINAL SCORE ${playerScore}–${rivalScore}</p><h2 id="result-title">${result === "win" ? "Victory!" : result === "loss" ? "Defeat." : "Draw."}</h2><p>${result === "win" ? "Your squad controlled the arena." : result === "loss" ? "Adjust your lineup or try the simulation again." : "The teams were evenly matched."}</p>`;
    resultModal.showModal();
    document.querySelector("#rematch").addEventListener("click", simulateBattle);
    document.querySelector("#change-team").addEventListener("click", () => document.querySelector(".game-console").scrollIntoView({ behavior: "smooth" }));
  } catch (error) {
    arena.innerHTML = `<div class="error-card"><strong>Arena connection failed.</strong><p>${error.message}</p></div>`;
  } finally {
    startButton.disabled = false;
    startButton.innerHTML = `Start battle <span aria-hidden="true">⚡</span>`;
  }
}

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || { wins: 0, losses: 0, draws: 0 }; }
  catch { return { wins: 0, losses: 0, draws: 0 }; }
}

selectors.forEach((select, index) => select.addEventListener("change", () => {
  selectedTeam[index] = roster.find(item => item.id === Number(select.value)) || null;
  updateSlot(index);
  renderOptions();
}));
typeFilter.addEventListener("change", renderOptions);
document.querySelectorAll(".slot-details").forEach(button => button.addEventListener("click", () => openDetails(selectedTeam[Number(button.dataset.details)])));
pokemonModal.querySelector(".modal-close").addEventListener("click", () => pokemonModal.close());
pokemonModal.addEventListener("click", event => { if (event.target === pokemonModal) pokemonModal.close(); });
document.querySelector("#close-result").addEventListener("click", () => resultModal.close());
startButton.addEventListener("click", simulateBattle);
rosterGallery.addEventListener("click", event => {
  const button = event.target.closest("[data-roster-id]");
  if (!button) return;
  openDetails(roster.find(item => item.id === Number(button.dataset.rosterId)));
});

async function initialize() {
  try {
    roster = await fetchPokemonList(30);
    [...new Set(roster.flatMap(item => item.types))].sort().forEach(type => typeFilter.insertAdjacentHTML("beforeend", `<option value="${type}">${formatName(type)}</option>`));
    typeFilter.disabled = false;
    selectors.forEach(select => { select.disabled = false; });
    renderOptions();
    renderRosterGallery();
    status.textContent = `${roster.length} fighters online · choose 3`;
  } catch (error) {
    status.textContent = error.message;
    document.querySelector(".selector-grid").innerHTML = `<div class="error-card"><strong>Roster unavailable.</strong><p>${error.message}</p></div>`;
  }
}

initialize();
