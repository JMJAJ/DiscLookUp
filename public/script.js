document.getElementById('userForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const userId = document.getElementById('userId').value.trim();
    const userInfoContainer = document.getElementById('userInfo');
    userInfoContainer.classList.remove('show');
    userInfoContainer.innerHTML = "<p>Loading...</p>";
    userInfoContainer.style.display = "block";

    fetch('http://localhost:3000/getDiscordUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
    })
    .then((response) => {
        if (!response.ok) throw new Error('Network error');
        return response.json();
    })
    .then((data) => {
        if (data.error) {
            userInfoContainer.innerHTML = `<p style="color:#ff4d4f;">Error: ${data.error}</p>`;
            return;
        }

        userInfoContainer.innerHTML = `
            <h2>${data.username}#${data.discriminator}</h2>
            <p><strong>Discord ID:</strong> ${data.discordId}</p>
            <p><strong>Global Name:</strong> ${data.globalName}</p>
            <p><strong>Public Flags:</strong> ${data.publicFlags}</p>
            <p><strong>Accent Color:</strong> ${data.accentColor}</p>
            ${data.avatarImage ? `<img src="${data.avatarImage}" alt="Avatar">` : ''}
            ${data.bannerImage ? `<img src="${data.bannerImage}" alt="Banner">` : ''}
        `;
    })
    .catch((err) => {
        console.error(err);
        userInfoContainer.innerHTML = `<p style="color:#ff4d4f;">An error occurred. Please try again later.</p>`;
    })
    .finally(() => {
        userInfoContainer.classList.add('show');
    });
});