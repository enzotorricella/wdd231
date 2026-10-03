const API_ROOT = "https://pokeapi.co/api/v2/pokemon";

export async function fetchPokemonList(limit = 30) {
  try {
    const response = await fetch(`${API_ROOT}?limit=${limit}&offset=0`);
    if (!response.ok) throw new Error(`PokéAPI returned ${response.status}`);
    const { results } = await response.json();
    const details = await Promise.all(results.map(async ({ url }) => {
      const itemResponse = await fetch(url);
      if (!itemResponse.ok) throw new Error(`Could not load ${url}`);
      return itemResponse.json();
    }));
    return details.map(normalizePokemon);
  } catch (error) {
    console.error("Pokémon data request failed:", error);
    throw new Error("The Pokédex could not be loaded. Check your connection and try again.");
  }
}

export async function fetchPokemonByIds(ids) {
  try {
    const responses = await Promise.all(ids.map(id => fetch(`${API_ROOT}/${id}`)));
    if (responses.some(response => !response.ok)) throw new Error("One or more Pokémon could not be loaded.");
    return Promise.all(responses.map(async response => normalizePokemon(await response.json())));
  } catch (error) {
    console.error("Pokémon request failed:", error);
    throw new Error("The fighters could not be loaded. Please try again.");
  }
}

function normalizePokemon(data) {
  const stats = Object.fromEntries(data.stats.map(item => [item.stat.name, item.base_stat]));
  return {
    id: data.id,
    name: data.name,
    image: data.sprites.other["official-artwork"].front_default || data.sprites.front_default,
    sprite: data.sprites.front_default,
    types: data.types.map(item => item.type.name),
    height: data.height / 10,
    weight: data.weight / 10,
    abilities: data.abilities.map(item => item.ability.name),
    stats,
    total: Object.values(stats).reduce((sum, value) => sum + value, 0)
  };
}

export function formatName(value) {
  return value.split("-").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
