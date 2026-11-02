const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const profile = document.getElementById("profile");
const suggestions = document.getElementById("suggestions");
const reposSection = document.getElementById("repos-section");
const reposList = document.getElementById("repos");
let button = searchForm.querySelector("button");

searchForm.addEventListener("submit", async function (e) {
  try {
    e.preventDefault();
    const trimed = searchInput.value.trim();
    if (trimed !== "") {
      const user = await getProfile(trimed);
      if (user) {
        const existingMessage = document.getElementById("invalid-user-message");
        if (existingMessage) {
          existingMessage.remove();
        }

        createProfileSection(user);
        await createReposSection(user);
        searchInput.value = "";
      } else {
        profile.classList.add("hidden");
        reposSection.classList.add("hidden");
        profile.innerHTML = "";
        reposList.innerHTML = "";
        showInvalidUserMessage();
        searchInput.value = "";
      }
    }
  } catch (error) {
    console.log(error);
  }
});

async function getProfile(userId) {
  const response = await fetch(`https://api.github.com/users/${userId}`);
//   if (response.status === 403) {
//     throw new Error(
//       "GitHub API rate limit exceeded. Please wait and try again.",
//     );
//   }
  if (!response.ok) {
    return null;
  }

  const user = await response.json();
  return user;
}

function showInvalidUserMessage() {
  const existingMessage = document.getElementById("invalid-user-message");
  if (existingMessage) return;
  const message = document.createElement("p");
  message.id = "invalid-user-message";
  message.className = "mt-2 text-center text-red-400";
  message.textContent = "Error: Rate limit or Not existing account";
  suggestions.insertAdjacentElement("afterend", message);
}

function createProfileSection(user) {
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

async function createReposSection(user) {
  const reposRes = await fetch(user.repos_url);
  const reposFull = await reposRes.json();
  const repos = [...reposFull].slice(0, 9);
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

suggestions.addEventListener("click", async function (e) {
  const selectedButton = e.target.closest(".chip");

  if (!selectedButton) return;

  const user = await getProfile(selectedButton.dataset.user);

  if (!user) {
    profile.classList.add("hidden");
    reposSection.classList.add("hidden");
    profile.innerHTML = "";
    reposList.innerHTML = "";
    showInvalidUserMessage();
    return;
  }

  const existingMessage = document.getElementById("invalid-user-message");
  if (existingMessage) {
    existingMessage.remove();
  }
  createProfileSection(user);
  await createReposSection(user);
});
