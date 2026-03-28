const searchInput = document.getElementById('search');
const autocompleteList = document.getElementById('autocomplete');
const repoList = document.getElementById('repo-list');

// 1. Debounce Logic
function debounce(fn, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
}

// 2. Fetch Logic
async function getGitHubRepos(userInput) {
    if (!userInput.trim()) {
        clearDropdown();
        return;
    }

    try {
        
        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(userInput)}&per_page=5`;
        
        const response = await fetch(url, {
            method: 'GET', 
            headers: {
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });
        
        if (!response.ok) throw new Error('API Error');
    
        const data = await response.json();
        renderDropdown(data.items);
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

// 3. Render Dropdown
function renderDropdown(repos) {
    clearDropdown();
    if (!repos) return;

    repos.forEach(repo => {
        const li = document.createElement('li');
        li.textContent = repo.name;
        li.addEventListener('click', () => {
            addRepoToList(repo);
            searchInput.value = ''; 
            clearDropdown();        
        });
        autocompleteList.appendChild(li);
    });
}

// 4. Add to List
function addRepoToList(repo) {
    const li = document.createElement('li');
    li.innerHTML = `
        <div>
            <p>Name: ${repo.name}</p>
            <p>Owner: ${repo.owner.login}</p>
            <p>Stars: ${repo.stargazers_count}</p>
        </div>
        <button class="remove-btn" type="button">X</button>
    `;
    li.querySelector('.remove-btn').onclick = () => li.remove();
    repoList.appendChild(li);
}

function clearDropdown() {
    autocompleteList.innerHTML = '';
}

// 5. Initialize
const debouncedSearch = debounce((e) => {
    getGitHubRepos(e.target.value);
}, 400);

searchInput.addEventListener('input', debouncedSearch);
