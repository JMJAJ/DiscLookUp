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
                <p><strong>Discord ID:</strong> ${data.discordId}</p>
                <p><strong>Global Name:</strong> ${data.globalName}</p>
                <p><strong>Discriminator:</strong> ${data.discriminator}</p>
                <p><strong>Public Flags:</strong> ${data.publicFlags}</p>
                <p><strong>Flags:</strong> ${data.flags}</p>
                <p><strong>Flags Listed:</strong> ${data.flagsListed}</p>
                <p><strong>Accent Color:</strong> ${data.accentColor}</p>
                <p><strong>Banner Color:</strong> ${data.bannerColor}</p>
                <p><strong>Clan:</strong> ${data.clan}</p>
                <p><strong>Bio:</strong> ${data.bio}</p>
                <p><strong>Created At:</strong> ${data.createdAt}</p>
                <p><strong>Locale:</strong> ${data.locale}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Verified:</strong> ${data.verified ? 'Yes' : 'No'}</p>
                <p><strong>Phone:</strong> ${data.phone}</p>
                <p><strong>Avatar Decoration Asset:</strong> ${data.avatarDecorationData.asset}</p>
                <p><strong>SKU ID:</strong> ${data.avatarDecorationData.skuId}</p>
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
