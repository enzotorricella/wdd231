const menuButton = document.querySelector('#menu-button');
const navigation = document.querySelector('#navigation');

function setMenu(open) {
    navigation.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    menuButton.querySelector('span').textContent = open ? '×' : '☰';
}

menuButton.addEventListener('click', () => {
    setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuButton.focus();
    }
});

window.matchMedia('(min-width: 700px)').addEventListener('change', () => setMenu(false));
