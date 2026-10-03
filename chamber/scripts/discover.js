import { places } from "../data/places.mjs";

document.querySelector("#year").textContent = new Date().getFullYear();
document.querySelector("#last-modified").textContent = `Last modified: ${document.lastModified}`;
const menu = document.querySelector("#menu-button");
menu.addEventListener("click", () => {
  const expanded = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(expanded));
  menu.setAttribute("aria-label", expanded ? "Close navigation menu" : "Open navigation menu");
  document.querySelector("#navigation").classList.toggle("open", expanded);
});

const visitMessage = document.querySelector("#visit-message");
const storageKey = "rosarioDiscoverLastVisit";
const now = Date.now();
try {
  const previousVisit = Number(localStorage.getItem(storageKey));
  if (!previousVisit) visitMessage.textContent = "Welcome! Let us know if you have any questions.";
  else {
    const days = Math.floor((now - previousVisit) / 86_400_000);
    visitMessage.textContent = days < 1 ? "Back so soon! Awesome!" : `You last visited ${days} ${days === 1 ? "day" : "days"} ago.`;
  }
  localStorage.setItem(storageKey, String(now));
} catch {
  visitMessage.textContent = "Welcome! Explore eight highlights from around Rosario.";
}

const fragment = document.createDocumentFragment();
places.forEach((place, index) => {
  const card = document.createElement("article");
  card.className = "place-card";
  const title = document.createElement("h2");
  title.textContent = place.name;
  const figure = document.createElement("figure");
  const image = document.createElement("img");
  image.src = `images/discover/${place.image}`;
  image.alt = `Illustration of ${place.name} in Rosario`;
  image.width = 300;
  image.height = 200;
  if (index > 1) image.loading = "lazy";
  figure.append(image);
  const address = document.createElement("address");
  address.textContent = place.address;
  const description = document.createElement("p");
  description.textContent = place.description;
  const action = document.createElement("button");
  action.type = "button";
  action.textContent = "View on Google Maps";
  action.setAttribute("aria-label", `View ${place.name} on Google Maps (opens in a new tab)`);
  action.addEventListener("click", () => window.open(place.map, "_blank", "noopener,noreferrer"));
  card.append(title, figure, address, description, action);
  fragment.append(card);
});
document.querySelector("#places").append(fragment);
