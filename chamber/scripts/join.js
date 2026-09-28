'use strict';
document.querySelector('#timestamp').value = new Date().toISOString();
document.querySelectorAll('.benefit-link').forEach(button => button.addEventListener('click', () => document.querySelector(`#${button.dataset.dialog}`).showModal()));
document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
});
