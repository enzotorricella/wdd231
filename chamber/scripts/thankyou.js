'use strict';
const params = new URLSearchParams(window.location.search);
function value(name) { return params.get(name)?.trim() || 'Not provided'; }
document.querySelector('#submitted-name').textContent = `${value('first')} ${value('last')}`;
document.querySelector('#submitted-email').textContent = value('email');
document.querySelector('#submitted-phone').textContent = value('phone');
document.querySelector('#submitted-organization').textContent = value('organization');
const timestamp = params.get('timestamp');
const parsedDate = timestamp ? new Date(timestamp) : null;
document.querySelector('#submitted-timestamp').textContent = parsedDate && !Number.isNaN(parsedDate.valueOf()) ? parsedDate.toLocaleString() : 'Not provided';
