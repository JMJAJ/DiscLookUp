document.getElementById('userForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const userId = document.getElementById('userId').value.trim();
    const userInfoContainer = document.getElementById('userInfo');
    const submitButton = document.querySelector('button[type="submit"]');

    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<div class="loading"></div>';
    userInfoContainer.innerHTML = '';
    userInfoContainer.classList.remove('show');

    // Make a POST request to the local Node.js server
    fetch('http://localhost:3000/getDiscordUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId
            }),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            if (data.error) {
                userInfoContainer.innerHTML = `<div class="error">❌ ${data.error}</div>`;
            } else {
                const userInfoHtml = `
                    <h2>${data.username}${data.discriminator !== '0' ? `#${data.discriminator}` : ''}</h2>
                    ${data.avatarImage ? `<img src="${data.avatarImage}" alt="User Avatar" />` : ''}
                    ${data.bannerImage ? `<img src="${data.bannerImage}" alt="User Banner" />` : ''}
                    <div class="user-details">
                        <p><strong>Discord ID:</strong> ${data.discordId}</p>
                        ${data.globalName ? `<p><strong>Display Name:</strong> ${data.globalName}</p>` : ''}
                        ${data.accentColor ? `<p><strong>Accent Color:</strong> #${data.accentColor.toString(16).padStart(6, '0')}</p>` : ''}
                        ${data.publicFlags ? `<p><strong>Public Flags:</strong> ${data.publicFlags}</p>` : ''}
                        ${data.flags ? `<p><strong>Flags:</strong> ${data.flags}</p>` : ''}
                        ${data.clan ? `<p><strong>Clan:</strong> ${data.clan}</p>` : ''}
                        ${data.flagsListed ? `<p><strong>Flags Listed:</strong> ${data.flagsListed}</p>` : ''}
                        ${data.avatarDecorationAsset ? `<p><strong>Avatar Decoration:</strong> ${data.avatarDecorationAsset}</p>` : ''}
                        ${data.skuId ? `<p><strong>SKU ID:</strong> ${data.skuId}</p>` : ''}
                    </div>
                `;
                userInfoContainer.innerHTML = userInfoHtml;
            }

            // Show results with animation
            setTimeout(() => {
                userInfoContainer.classList.add('show');
            }, 100);
        })
        .catch((error) => {
            console.error('Fetch error:', error);
            userInfoContainer.innerHTML = `<div class="error">❌ Failed to fetch user information. Please check if the server is running and try again.</div>`;
            userInfoContainer.classList.add('show');
        })
        .finally(() => {
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = '<span>Lookup User</span>';
        });
});

// Utility function to extract image URLs from HTML (in case needed elsewhere)
function extractImageUrl(htmlString) {
    const match = htmlString.match(/src="([^"]+)"/);
    return match ? match[1] : null;
}