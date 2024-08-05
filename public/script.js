document.getElementById('userForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission

    const userId = document.getElementById('userId').value;

    fetch('/api/getDiscordUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId }), // Send user ID in the request body
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            if (data.error) {
                displayError(data.error);
                return;
            }

            const userInfoHtml = generateUserInfoHtml(data);

            const userInfoContainer = document.getElementById('userInfo');
            userInfoContainer.innerHTML = userInfoHtml;

            const bannerContainer = document.getElementById('bannerContainer');
            bannerContainer.style.backgroundColor = data.bannerColor || '#121212'; // Fallback color

            saveLookup(data);
            updatePastLookups();
        })
        .catch((error) => {
            console.error('Fetch error:', error);
            document.getElementById('userInfo').innerHTML = '<p>An error occurred. Please try again later.</p>';
        });
});

document.getElementById('addLookupButton').addEventListener('click', function () {
    document.getElementById('userId').value = ''; // Clear the input field
    document.getElementById('userInfo').innerHTML = ''; // Clear the current info
    document.getElementById('bannerContainer').style.backgroundColor = '#121212'; // Reset banner
});

function generateUserInfoHtml(data) {
    return `
        <h2>${data.username}#${data.discriminator}</h2>
        <p>Discord ID: ${data.discordId}</p>
        <p>Global Name: ${data.globalName}</p>
        <p>Discriminator: ${data.discriminator}</p>
        <p>Public Flags: ${data.publicFlags}</p>
        <p>Flags: ${data.flags}</p>
        <p>Flags Listed: ${data.flagsListed}</p>
        <p>Accent Color: ${data.accentColor}</p>
        <p>Banner Color: ${data.bannerColor}</p>
        <p>Clan: ${data.clan}</p>
        <p>Flags Listed: ${data.flagsListed}</p>
        <p>Avatar Decoration Asset: ${data.avatarDecorationData.asset}</p>
        <p>SKU ID: ${data.avatarDecorationData.skuId}</p>
        ${data.avatarImage ? `<img src="${data.avatarImage}" alt="Avatar" />` : ''}
        ${data.bannerImage ? `<img src="${data.bannerImage}" alt="Banner" />` : ''}
    `;
}

function displayError(error) {
    const userInfoContainer = document.getElementById('userInfo');
    userInfoContainer.innerHTML = `<p>Error: ${error}</p>`;
}

function saveLookup(data) {
    const lookups = JSON.parse(localStorage.getItem('discordLookups')) || [];
    lookups.unshift(data);
    localStorage.setItem('discordLookups', JSON.stringify(lookups));
}

function updatePastLookups() {
    const lookups = JSON.parse(localStorage.getItem('discordLookups')) || [];
    const prevLookupsContainer = document.getElementById('lookupScroll');

    if (lookups.length === 0) {
        prevLookupsContainer.innerHTML = '<p>No previous lookups</p>';
        return;
    }

    prevLookupsContainer.innerHTML = lookups.map(lookup => `
        <div class="lookup-card">
            <h3>${lookup.username}#${lookup.discriminator}</h3>
            <p>Discord ID: ${lookup.discordId}</p>
            ${lookup.avatarImage ? `<img src="${lookup.avatarImage}" alt="Avatar" style="width: 50px;" />` : ''}
        </div>
    `).join('');
}

// Initialize past lookups on page load
updatePastLookups();
