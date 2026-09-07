const sectionEl = document.getElementById('events');
const listEl = document.getElementById('events-list');

function safeUrl(href) {
  try {
    const url = new URL(href, location.href);
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.href;
  } catch (e) {
    // invalid URL
  }
  return null;
}

function formatDateSafe(date) {
  try {
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(`${date}T00:00:00`));
  } catch (e) {
    return date || '';
  }
}

function clearContainer(container) {
  while (container.firstChild) container.removeChild(container.firstChild);
}

function setStatusMessage(message, isError = false) {
  // Update the existing .status element if present, otherwise create one.
  let status = sectionEl.querySelector('.status');
  if (!status) {
    status = document.createElement('p');
    status.className = 'status';
    status.setAttribute('role', 'status');
    sectionEl.insertBefore(status, sectionEl.firstChild);
  }

  status.textContent = message;
  status.classList.toggle('error', !!isError);

  // Hide the list while there's a status message
  if (listEl) {
    listEl.hidden = !!message;
    listEl.setAttribute('aria-hidden', !!message);
  }
}

function renderRepositories(repositories) {
  if (!listEl) return;

  clearContainer(listEl);

  if (!Array.isArray(repositories) || repositories.length === 0) {
    setStatusMessage('No starred repositories yet.');
    return;
  }

  repositories.forEach((repo) => {
    const li = document.createElement('li');
    li.className = 'repository';

    const h2 = document.createElement('h2');
    const a = document.createElement('a');
    const safe = safeUrl(repo.url);
    a.href = safe || '#';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = repo.repository || 'Unnamed repository';
    h2.appendChild(a);

    li.appendChild(h2);

    if (repo.description) {
      const p = document.createElement('p');
      p.textContent = repo.description;
      li.appendChild(p);
    }

    const footer = document.createElement('footer');
    const starred = document.createElement('span');
    starred.textContent = `★ Starred ${formatDateSafe(repo.starredAt)}`;

    const lang = document.createElement('span');
    lang.textContent = repo.language || '';

    footer.appendChild(starred);
    footer.appendChild(lang);

    li.appendChild(footer);
    listEl.appendChild(li);
  });

  // Reveal the list and clear status
  setStatusMessage('');
  listEl.hidden = false;
  listEl.removeAttribute('aria-hidden');
}

async function loadRepositories() {
  setStatusMessage('Loading starred repositories...');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch('events.json', { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Unable to load events: ${res.status}`);

    const data = await res.json();
    renderRepositories(data);
  } catch (err) {
    console.error(err);
    setStatusMessage('The starred repositories could not be loaded. Please try again.', true);
  }
}

// Defer loading to allow the DOM to finish parsing if this script is moved to head.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadRepositories);
} else {
  loadRepositories();
}
