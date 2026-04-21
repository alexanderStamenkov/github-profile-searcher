const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const messageEl = document.getElementById("message");
const profileSection = document.getElementById("profile");
const reposContainer = document.getElementById("reposContainer");
const sortSelect = document.getElementById("sortSelect");

let currentRepos = [];

const searchUsers = async function () {
  const username = searchInput.value.trim();

  if (!username) {
    messageEl.textContent = "Моля, въведи GitHub username!";
    profileSection.style.display = "none";
    return;
  }
  messageEl.textContent = "Зареждане...";
  messageEl.classList.add("loading");
  profileSection.style.display = "none";
  reposContainer.innerHTML = "";

  try {
    const resUsers = await fetch(`https://api.github.com/users/${username}`);
    const data = await resUsers.json();
    console.log(data);

    if (data.message === "Not Found") {
      messageEl.textContent = "Потребителят не е намерен 😔";
      messageEl.classList.remove("loading");
      return;
    }

    displayUserData(data);
    await loadRepositories(username);
    messageEl.classList.remove("loading");
  } catch (err) {
    console.error(err);
    messageEl.textContent = "Грешка при зареждане!";
    messageEl.classList.remove("loading");
  }
};

const displayUserData = function (data) {
  profileSection.style.display = "block";
  messageEl.textContent = "";

  document.getElementById("avatar").src = data.avatar_url;
  document.getElementById("name").textContent = data.name || data.login;
  document.getElementById("login").textContent = `@${data.login}`;
  document.getElementById("bio").textContent = data.bio || "Няма биография";

  document.getElementById("repos").textContent = data.public_repos;
  document.getElementById("followers").textContent = data.followers;
  document.getElementById("following").textContent = data.following;

  document.getElementById("profileLink").href = data.html_url;

  document.getElementById("location").textContent = data.location
    ? data.location
    : "Няма локация";
  document.getElementById("company").textContent = data.company
    ? data.company
    : "Няма компания";

  const blogEl = document.getElementById("blog");
  if (data.blog) {
    blogEl.innerHTML = `<a href="${data.blog}" target="_blank" rel="noopener">${data.blog}</a>`;
  } else {
    blogEl.textContent = "";
  }
};

const loadRepositories = async function (username) {
  try {
    const resRepos = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
    );
    const dataRepos = await resRepos.json();

    if (!Array.isArray(dataRepos)) {
      reposContainer.innerHTML =
        "<p>Грешка при зареждане на репозиториите.</p>";
      return;
    }

    currentRepos = dataRepos;
    displayRepositories(currentRepos);
  } catch (err) {
    console.error(err);
    reposContainer.innerHTML = "<p>Не можахме да заредим репозиториите.</p>";
  }
};

const getLanguageColor = function (language) {
  const colors = {
    JavaScript: "#f1e05a",
    TypeScript: "#2b7489",
    Python: "#3572A5",
    Java: "#b07219",
    HTML: "#e34c26",
    CSS: "#563d7c",
    PHP: "#4F5D95",
    Ruby: "#701516",
    Go: "#00ADD8",
    Rust: "#dea584",
    C: "#555555",
    "C++": "#f34b7d",
    "C#": "#178600",
    Vue: "#41b883",
    React: "#61dafb",
  };
  return colors[language] || "#8b949e"; // сив цвят по подразбиране
};

const displayRepositories = function (dataRepos) {
  reposContainer.innerHTML = "";
  document.getElementById("reposCount").textContent = dataRepos.length;

  if (dataRepos.length === 0) {
    reposContainer.innerHTML = "<p>Няма публични репозитории.</p>";
    return;
  }

  dataRepos.forEach((repo) => {
    const card = document.createElement("div");
    card.classList.add("repo-card");

    const langColor = repo.language
      ? getLanguageColor(repo.language)
      : "#8b949e";

    card.innerHTML = `
        <h4><a href="${repo.html_url}" target="_blank"> ${repo.name}</a></h4>
            <p class="repo-description">${repo.description || "Няма описание"}</p>
            <div class="repo-stats">
                ${
                  repo.language
                    ? `
                <span class="language">
                    <span class="language-color" style="background-color: ${langColor};"></span>
                    ${repo.language}
                </span>`
                    : ""
                }
                <span>⭐ ${repo.stargazers_count}</span>
                <span>🍴 ${repo.forks_count}</span>
            </div>
        `;
    reposContainer.appendChild(card);
  });
};

searchBtn.addEventListener("click", searchUsers);

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchUsers();
  }
});

sortSelect.addEventListener("change", function () {
  const value = sortSelect.value;

  const sorted = [...currentRepos].sort(function (a, b) {
    if (value === "stars") return b.stargazers_count - a.stargazers_count;
    if (value === "forks") return b.forks_count - a.forks_count;
    if (value === "name") return a.name.localeCompare(b.name);
    if (value === "updated")
      return new Date(b.updated_at) - new Date(a.updated_at);
  });

  displayRepositories(sorted);
});
