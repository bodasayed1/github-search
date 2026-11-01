let form = document.getElementById("search-form");
let input = document.getElementById("search-input");
let button = form.querySelector("button");
let suggestions = document.getElementById("suggestions");
let statusText = document.getElementById("status");
let profile = document.getElementById("profile");
let reposSection = document.getElementById("repos-section");
let reposList = document.getElementById("repos");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (input.value.trim() !== "") {
    search(input.value.trim());
  } else {
    showError("Please type a username first");
  }
});

suggestions.addEventListener("click", (e) => {
  if (e.target.matches(".chip")) {
    input.value = e.target.dataset.user;
    search(e.target.dataset.user);
  }
});

function showError(message) {
  statusText.textContent = message;
  statusText.className = "min-h-6 text-center text-orange-400";
}

async function search(username) {
  statusText.textContent = "";
  button.disabled = true;
  profile.classList.add("hidden");
  reposSection.classList.add("hidden");

  try {
    let userRes = await fetch("https://api.github.com/users/" + username);

    if (userRes.status === 404) {
      showError("User not found");
      button.disabled = false;
      return;
    }
    if (userRes.status === 403) {
      showError("Too many requests. Wait a bit and try again");
      button.disabled = false;
      return;
    }

    let user = await userRes.json();

    let reposRes = await fetch(
      "https://api.github.com/users/" +
        username +
        "/repos?sort=updated&per_page=6",
    );
    let repos = await reposRes.json();

    showProfile(user);
    showRepos(repos);
  } catch (err) {
    showError("Network error. Check your connection");
  }

  button.disabled = false;
}

function showProfile(user) {
  let name = user.name || user.login;
  let bio = user.bio || "No bio yet.";

  profile.innerHTML = `
    <div class="flex flex-col items-center gap-6 rounded-3xl border border-neutral-700 bg-neutral-800 p-6 text-center shadow-lg shadow-black/30 sm:flex-row sm:text-left">
      <img src="${user.avatar_url}" alt="${user.login}'s avatar" class="size-28 shrink-0 rounded-full border-4 border-amber-400">
      <div class="flex min-w-0 flex-col gap-2">
        <h2 class="text-2xl font-bold">${name}</h2>
        <a href="${user.html_url}" target="_blank" class="text-amber-400 hover:underline">@${user.login}</a>
        <p class="text-neutral-400">${bio}</p>
        <div class="mt-2 flex flex-wrap justify-center gap-3 sm:justify-start">
          <span class="rounded-xl bg-neutral-900 px-3 py-1.5 text-sm"><b class="text-amber-400">${user.public_repos}</b> repos</span>
          <span class="rounded-xl bg-neutral-900 px-3 py-1.5 text-sm"><b class="text-amber-400">${user.followers}</b> followers</span>
          <span class="rounded-xl bg-neutral-900 px-3 py-1.5 text-sm"><b class="text-amber-400">${user.following}</b> following</span>
        </div>
      </div>
    </div>`;

  profile.classList.remove("hidden");
}

function showRepos(repos) {
  reposList.innerHTML = "";

  if (repos.length === 0) {
    reposList.innerHTML = `<li class="text-neutral-400">This user has no public repositories.</li>`;
  }

  repos.forEach((repo) => {
    let description = repo.description || "No description";
    let language = repo.language || "";

    reposList.innerHTML += `
      <li class="flex flex-col gap-2 rounded-2xl border border-neutral-700 bg-neutral-800 p-4 transition hover:-translate-y-1 hover:border-amber-400">
        <a href="${repo.html_url}" target="_blank" class="break-words font-bold text-amber-400 hover:underline">${repo.name}</a>
        <p class="flex-1 text-sm text-neutral-400">${description}</p>
        <div class="flex items-center gap-4 text-sm text-neutral-400">
          <span><i class="fa-solid fa-star mr-1 text-amber-400"></i>${repo.stargazers_count}</span>
          <span>${language}</span>
        </div>
      </li>`;
  });

  reposSection.classList.remove("hidden");
}
