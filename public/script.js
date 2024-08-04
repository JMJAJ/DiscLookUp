const profiles = []; // Array to store profile data
let currentIndex = -1; // Index of the currently displayed profile

document.getElementById('userForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission

    const userId = document.getElementById('userId').value;

    // Fetch the profile data
    fetchProfile(userId);
});

function fetchProfile(userId) {
    fetch('/api/getDiscordUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error:', data.error);
                return;
            }
            profiles.push(data);
            currentIndex = profiles.length - 1;
            showProfile(currentIndex);
        })
        .catch(error => console.error('Fetch error:', error));
}

function showProfile(index) {
    const currentProfile = document.getElementById('currentProfile');
    if (profiles[index]) {
        const data = profiles[index];
        currentProfile.innerHTML = `
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
}

function showNextProfile() {
    if (currentIndex < profiles.length - 1) {
        currentIndex++;
        showProfile(currentIndex);
    }
}

function showPrevProfile() {
    if (currentIndex > 0) {
        currentIndex--;
        showProfile(currentIndex);
    }
}

document.getElementById('nextProfile').addEventListener('click', showNextProfile);
document.getElementById('prevProfile').addEventListener('click', showPrevProfile);
