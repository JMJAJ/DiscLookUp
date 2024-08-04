document.getElementById('userForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission

    const userId = document.getElementById('userId').value;

    // Make a POST request to the serverless function to fetch Discord user information
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

            if (data.error) {
                userInfoContainer.innerHTML = `<p>Error: ${data.error}</p>`;
                return;
            }

            const userInfoHtml = `
                <h2>${data.username}#${data.discriminator}</h2>
                <p>Discord ID: ${data.discordId}</p>
                <p>Global Name: ${data.globalName}</p>
                <p>Discriminator: ${data.discriminator}</p>
                <p>Public Flags: ${data.publicFlags}</p>
                <p>Flags: ${data.flags}</p>
                <p>Accent Color: ${data.accentColor}</p>
                <p>Clan: ${data.clan}</p>
                <p>Flags Listed: ${data.flagsListed}</p>
                <p>Avatar Decoration Asset: ${data.avatarDecorationAsset}</p>
                <p>SKU ID: ${data.skuId}</p>
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
