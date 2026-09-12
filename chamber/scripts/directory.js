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

const container = document.querySelector('#members');
if (container) {
    const status = document.querySelector('#status');
    const search = document.querySelector('#search');
    const category = document.querySelector('#category');
    const retry = document.querySelector('#retry');
    const gridButton = document.querySelector('#grid-view');
    const listButton = document.querySelector('#list-view');
    let members = [];

    function setView(view) {
        container.className = view;
        gridButton.setAttribute('aria-pressed', String(view === 'grid'));
        listButton.setAttribute('aria-pressed', String(view === 'list'));
    }
    gridButton.addEventListener('click', () => setView('grid'));
    listButton.addEventListener('click', () => setView('list'));

    function element(tag, text, className) {
        const node = document.createElement(tag);
        if (text) node.textContent = text;
        if (className) node.className = className;
        return node;
    }

    function render() {
        const query = search.value.trim().toLocaleLowerCase();
        const filtered = members.filter(member =>
            (category.value === 'all' || member.category === category.value) &&
            `${member.name} ${member.description} ${member.neighborhood} ${member.category}`.toLocaleLowerCase().includes(query));
        const fragment = document.createDocumentFragment();
        for (const member of filtered) {
            const card = element('article', null, 'member');
            const top = element('div', null, 'member-top');
            top.append(element('span', member.category), element('span', String(members.indexOf(member) + 1).padStart(2, '0')));
            const image = element('img');
            image.src = `images/${member.image}`;
            image.alt = `${member.name} logo`;
            image.width = 360;
            image.height = 180;
            image.loading = 'lazy';
            const contact = element('address', null, 'contact');
            contact.append(element('div', member.address), element('div', member.phone));
            const bottom = element('div', null, 'member-bottom');
            const levels = {1: 'Member', 2: 'Silver member', 3: 'Gold member'};
            const link = element('a', 'Website ↗');
            link.href = member.website;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.setAttribute('aria-label', `${member.name} example website (opens in a new tab)`);
            bottom.append(element('span', levels[member.membership], 'level'), link);
            card.append(top, image, element('h3', member.name), element('p', member.description, 'description'), contact, bottom);
            fragment.append(card);
        }
        container.replaceChildren(fragment);
        status.textContent = filtered.length ? `Showing ${filtered.length} of ${members.length} businesses` : 'No businesses match your search. Try another name or sector.';
    }

    async function loadMembers() {
        retry.hidden = true;
        status.textContent = 'Loading the directory…';
        try {
            const response = await fetch('data/members.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            members = await response.json();
            if (!Array.isArray(members)) throw new Error('Invalid member data');
            const sectors = [...new Set(members.map(member => member.category))].sort();
            category.replaceChildren(new Option('All sectors', 'all'), ...sectors.map(sector => new Option(sector, sector)));
            document.querySelector('.count').textContent = String(members.length).padStart(2, '0');
            render();
        } catch {
            status.textContent = 'The directory could not be loaded. Please try again.';
            retry.hidden = false;
        }
    }
    search.addEventListener('input', render);
    category.addEventListener('change', render);
    retry.addEventListener('click', loadMembers);
    loadMembers();
}
