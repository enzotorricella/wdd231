import { fetchPokemonByIds, formatName } from "./api.js";
import { getStoredTeam, HISTORY_KEY } from "./shared.js";
const app = document.querySelector("#battle-app");
const modal = document.querySelector("#result-modal");
const resultContent = document.querySelector("#result-content");
const stats = ["hp", "attack", "defense", "special-attack", "special-defense", "speed"];
const labels = { hp: "HP", attack: "Attack", defense: "Defense", "special-attack": "Sp. Atk", "special-defense": "Sp. Def", speed: "Speed" };
let playerTeam = getStoredTeam();
let rivalTeam = [];
let history = getHistory();

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || { wins: 0, losses: 0, draws: 0 }; }
  catch { return { wins: 0, losses: 0, draws: 0 }; }
}

function sample(items, count) {
  return [...items].sort(() => Math.random() - .5).slice(0, count);
}

function teamMarkup(team) {
  return `<div class="battle-team">${team.map(pokemon => `<div class="fighter"><img src="${pokemon.sprite || pokemon.image}" alt="${formatName(pokemon.name)}" width="120" height="120"><strong>${formatName(pokemon.name)}</strong></div>`).join("")}</div>`;
}

function showSetup() {
  app.innerHTML = `<div class="battle-setup"><div class="scoreboard"><span>YOU<br><strong id="player-score">0</strong></span><span>BEST OF THREE</span><span><strong id="rival-score">0</strong><br>RIVAL</span></div><div class="versus-teams">${teamMarkup(playerTeam)}<div class="versus-label">VS</div>${teamMarkup(rivalTeam)}</div><div class="battle-controls"><button id="start-battle" class="button primary" type="button">Run the challenge</button></div><div id="rounds" class="rounds"></div><aside class="history"><p class="eyebrow">BATTLE HISTORY</p><dl><div><dt>Wins</dt><dd>${history.wins}</dd></div><div><dt>Losses</dt><dd>${history.losses}</dd></div><div><dt>Draws</dt><dd>${history.draws}</dd></div></dl></aside></div>`;
  document.querySelector("#start-battle").addEventListener("click", runBattle);
}

function judgeRound(player, rival, chosenStats) {
  let playerPoints = 0;
  let rivalPoints = 0;
  const comparisons = chosenStats.map(stat => {
    const playerValue = player.stats[stat];
    const rivalValue = rival.stats[stat];
    if (playerValue > rivalValue) playerPoints += 1;
    if (rivalValue > playerValue) rivalPoints += 1;
    return { stat, playerValue, rivalValue };
  });
  return { comparisons, winner: playerPoints > rivalPoints ? "player" : rivalPoints > playerPoints ? "rival" : "draw" };
}

function runBattle() {
  const button = document.querySelector("#start-battle");
  button.disabled = true;
  button.textContent = "Challenge complete";
  let playerScore = 0;
  let rivalScore = 0;
  const rounds = playerTeam.map((player, index) => {
    const rival = rivalTeam[index];
    const outcome = judgeRound(player, rival, sample(stats, 3));
    if (outcome.winner === "player") playerScore += 1;
    if (outcome.winner === "rival") rivalScore += 1;
    return { player, rival, ...outcome };
  });
  document.querySelector("#player-score").textContent = playerScore;
  document.querySelector("#rival-score").textContent = rivalScore;
  document.querySelector("#rounds").innerHTML = rounds.map((round, index) => `<article class="round-card"><div class="round-head"><h3>Round ${index + 1}: ${formatName(round.player.name)} vs ${formatName(round.rival.name)}</h3><span class="round-winner">${round.winner === "draw" ? "Round draw" : `${round.winner === "player" ? formatName(round.player.name) : formatName(round.rival.name)} wins`}</span></div>${round.comparisons.map(item => `<div class="comparison"><span class="${item.playerValue > item.rivalValue ? "higher" : ""}">${formatName(round.player.name)} · ${item.playerValue}</span><span class="stat-name">${labels[item.stat]}</span><span class="${item.rivalValue > item.playerValue ? "higher" : ""}">${item.rivalValue} · ${formatName(round.rival.name)}</span></div>`).join("")}</article>`).join("");
  const result = playerScore > rivalScore ? "win" : rivalScore > playerScore ? "loss" : "draw";
  history[`${result}s`] += 1;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  resultContent.innerHTML = `<div class="result-icon" aria-hidden="true">${result === "win" ? "🏆" : result === "loss" ? "⚡" : "🤝"}</div><p class="eyebrow">FINAL SCORE ${playerScore}–${rivalScore}</p><h2 id="result-title">${result === "win" ? "Challenge won!" : result === "loss" ? "Rival wins." : "It's a draw."}</h2><p>${result === "win" ? "Your team had the numbers when it mattered." : result === "loss" ? "Adjust your lineup and challenge the arena again." : "The teams were perfectly matched this time."}</p>`;
  modal.showModal();
}

document.querySelector("#close-result").addEventListener("click", () => { modal.close(); location.reload(); });

async function prepareBattle() {
  if (playerTeam.length !== 3) return;
  try {
    playerTeam = await fetchPokemonByIds(playerTeam.map(pokemon => pokemon.id));
    const pool = Array.from({ length: 30 }, (_, index) => index + 1).filter(id => !playerTeam.some(pokemon => pokemon.id === id));
    rivalTeam = await fetchPokemonByIds(sample(pool, 3));
    showSetup();
  } catch (error) {
    app.innerHTML = `<div class="arena-empty"><h2>Arena unavailable.</h2><p>${error.message}</p><button class="button primary" type="button" onclick="location.reload()">Try again</button></div>`;
  }
}

prepareBattle();
