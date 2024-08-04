let touchStartX = 0;
let touchEndX = 0;
let userInfoHistory = []; // Store historical profiles

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

            // Store the profile in history
            userInfoHistory.push(data);

            // Display the current profile
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

            // Create a new card for the profile
            const newCard = document.createElement('div');
            newCard.className = 'card';
            newCard.innerHTML = userInfoHtml;
            document.getElementById('cardsContainer').appendChild(newCard);
        })
        .catch((error) => {
            console.error('Fetch error:', error);
            document.getElementById('userInfo').innerHTML = '<p>An error occurred. Please try again later.</p>';
        });
});

document.getElementById('cardsContainer').addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.getElementById('cardsContainer').addEventListener('touchend', function (e) {
    touchEndX = e.changedTouches[0].screenX;

    if (touchEndX < touchStartX) {
        // Swipe left: Show next profile
        showNextProfile();
    } else if (touchEndX > touchStartX) {
        // Swipe right: Show previous profile
        showPreviousProfile();
    }
});

function showNextProfile() {
    // Implement showing the next profile in history
    // For simplicity, here we're just removing the first card
    const cards = document.querySelectorAll('#cardsContainer .card');
    if (cards.length > 1) {
        const firstCard = cards[0];
        firstCard.style.transform = 'translateX(-100%)';
        setTimeout(() => {
            firstCard.remove();
        }, 300); // Match the transition duration
    }
}

function showPreviousProfile() {
    // Implement showing the previous profile from history
    // For simplicity, here we're just adding the last profile from history
    if (userInfoHistory.length > 0) {
        const data = userInfoHistory.pop();
        const newCard = document.createElement('div');
        newCard.className = 'card';
        newCard.innerHTML = `
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
        document.getElementById('cardsContainer').prepend(newCard);
    }
}
