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
            const cardContainer = document.getElementById('cardContainer');

            if (data.error) {
                cardContainer.innerHTML = `<p>Error: ${data.error}</p>`;
                return;
            }

            const userInfoHtml = `
                <div class="card">
                    <h2>${data.username}#${data.discriminator}</h2>
                    <p>Discord ID: ${data.discordId}</p>
                    <p>Global Name: ${data.globalName}</p>
                    <p>Discriminator: ${data.discriminator}</p>
                    <p>Public Flags: ${data.publicFlags}</p>
                    <p>Flags: ${data.flags}</p>
                    <p>Accent Color: ${data.accentColor}</p>
                    <p>Banner Color: ${data.bannerColor}</p>
                    <p>Clan: ${data.clan}</p>
                    <p>Flags Listed: ${data.flagsListed}</p>
                    <p>Avatar Decoration Asset: ${data.avatarDecorationAsset}</p>
                    <p>SKU ID: ${data.skuId}</p>
                    ${data.avatarImage ? `<img src="${data.avatarImage}" alt="Avatar" />` : ''}
                    ${data.bannerImage ? `<img src="${data.bannerImage}" alt="Banner" />` : ''}
                </div>
            `;

            cardContainer.innerHTML = userInfoHtml;

            // Initialize swipe functionality
            initializeSwipe();
        })
        .catch((error) => {
            console.error('Fetch error:', error);
            document.getElementById('cardContainer').innerHTML = '<p>An error occurred. Please try again later.</p>';
        });
});

// Swipe functionality
function initializeSwipe() {
    const cardContainer = document.getElementById('cardContainer');
    let startX, currentX, moveX;

    cardContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });

    cardContainer.addEventListener('touchmove', (e) => {
        currentX = e.touches[0].clientX;
        moveX = startX - currentX;
        const card = document.querySelector('.card');
        card.style.transform = `translateX(${moveX}px)`;
    });

    cardContainer.addEventListener('touchend', (e) => {
        const card = document.querySelector('.card');
        if (Math.abs(moveX) > 100) {
            // Swipe detected
            card.style.transform = `translateX(${moveX > 0 ? '-100%' : '100%'})`;
        } else {
            // Not enough swipe distance
            card.style.transform = 'translateX(0)';
        }
    });
}
