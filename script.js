const eventsList = document.querySelector("#events");

function formatDate(date) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium"
  }).format(new Date(`${date}T00:00:00`));
}

function renderRepositories(repositories) {
  eventsList.replaceChildren();

  if (repositories.length === 0) {
    eventsList.innerHTML = '<p class="status">No starred repositories yet.</p>';
    return;
  }

  repositories.forEach((repository) => {
    const article = document.createElement("article");
    article.className = "repository";

    const heading = document.createElement("h2");
    const link = document.createElement("a");
    link.href = repository.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = repository.repository;
    heading.append(link);

    const description = document.createElement("p");
    description.textContent = repository.description;

    const details = document.createElement("footer");
    details.innerHTML = `
      <span>★ Starred ${formatDate(repository.starredAt)}</span>
      <span>${repository.language}</span>
    `;

    article.append(heading, description, details);
    eventsList.append(article);
  });
}

async function loadRepositories() {
  try {
    const response = await fetch("events.json");

    if (!response.ok) {
      throw new Error(`Unable to load events: ${response.status}`);
    }

    const repositories = await response.json();
    renderRepositories(repositories);
  } catch (error) {
    eventsList.innerHTML = '<p class="status error">The starred repositories could not be loaded.</p>';
    console.error(error);
  }
}

loadRepositories();
