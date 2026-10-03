import { fetchPokemonByIds, formatName } from "./api.js";
import "./shared.js";
const roster = document.querySelector("#featured-roster");

async function showFeatured() {
  try {
    const pokemon = await fetchPokemonByIds([25, 6, 94, 448]);
    roster.innerHTML = pokemon.map(item => `<article class="mini-card"><img src="${item.sprite}" alt="${formatName(item.name)}" width="96" height="96" loading="lazy"><h3>${formatName(item.name)}</h3><div class="type-list">${item.types.map(type => `<span class="type">${type}</span>`).join("")}</div><p>ATK ${item.stats.attack} · DEF ${item.stats.defense} · SPD ${item.stats.speed}</p></article>`).join("");
  } catch (error) {
    roster.innerHTML = `<p class="error-card">${error.message}</p>`;
  }
}

showFeatured();
