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
            const userInfoContainer = document.getElementById('userInfo');
            const bannerContainer = document.getElementById('bannerContainer');

            if (data.error) {
                userInfoContainer.innerHTML = `<p>Error: ${data.error}</p>`;
                return;
            }

            bannerContainer.style.backgroundColor = data.bannerColor || '#121212'; // Fallback color

            const userInfoHtml = `
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

            userInfoContainer.innerHTML = userInfoHtml;
        })
        .catch((error) => {
            console.error('Fetch error:', error);
            document.getElementById('userInfo').innerHTML = '<p>An error occurred. Please try again later.</p>';
        });
});
