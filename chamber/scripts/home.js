'use strict';

document.querySelector('#year').textContent = new Date().getFullYear();
document.querySelector('#last-modified').textContent = `Last modified: ${document.lastModified}`;
const menu = document.querySelector('#menu-button');
menu.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(expanded));
    menu.setAttribute('aria-label', expanded ? 'Close navigation menu' : 'Open navigation menu');
    document.querySelector('#navigation').classList.toggle('open', expanded);
});

const make = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
};

async function loadWeather() {
    const status = document.querySelector('#weather-status');
    try {
        const url = 'https://api.openweathermap.org/data/2.5/forecast?lat=-32.9468&lon=-60.6393&units=metric&appid=870b92ccf5bf295150f40244809649e3';
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Weather request failed: ${response.status}`);
        const data = await response.json();
        const now = data.list[0];
        const icon = make('img');
        icon.src = `https://openweathermap.org/img/wn/${now.weather[0].icon}@2x.png`;
        icon.alt = now.weather[0].description;
        icon.width = 100;
        icon.height = 100;
        const details = make('div');
        details.append(make('strong', `${Math.round(now.main.temp)}°C`, 'temperature'), make('p', now.weather[0].description));
        document.querySelector('#current-weather').replaceChildren(icon, details);
        const days = data.list.filter(item => item.dt_txt.includes('12:00:00')).slice(0, 3);
        const formatter = new Intl.DateTimeFormat('en-US', {weekday: 'long', timeZone: 'America/Argentina/Buenos_Aires'});
        document.querySelector('#forecast').replaceChildren(...days.map(day => {
            const item = make('li');
            item.append(make('span', formatter.format(new Date(day.dt * 1000))), make('strong', `${Math.round(day.main.temp)}°C`));
            return item;
        }));
        status.textContent = 'Three-day forecast for Rosario';
    } catch (error) {
        status.textContent = 'Weather information is temporarily unavailable.';
        console.error(error);
    }
}

async function loadSpotlights() {
    const container = document.querySelector('#spotlights');
    try {
        const response = await fetch('data/members.json');
        if (!response.ok) throw new Error(`Member request failed: ${response.status}`);
        const members = await response.json();
        const selected = members.filter(member => member.membership > 1).sort(() => Math.random() - 0.5).slice(0, 3);
        container.replaceChildren(...selected.map(member => {
            const card = make('article', null, 'spotlight-card');
            const image = make('img');
            image.src = `images/${member.image}`;
            image.alt = `${member.name} logo`;
            image.width = 360;
            image.height = 180;
            const address = make('address');
            address.append(make('span', member.address), make('span', member.phone));
            const link = make('a', 'Visit website');
            link.href = member.website;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            card.append(image, make('p', member.membership === 3 ? 'Gold member' : 'Silver member', 'eyebrow'), make('h3', member.name), address, link);
            return card;
        }));
    } catch (error) {
        container.textContent = 'Member spotlights are temporarily unavailable.';
        console.error(error);
    }
}

loadWeather();
loadSpotlights();
