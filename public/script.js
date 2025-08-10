document.getElementById('userForm').addEventListener('submit', async function(e) {
    e.preventDefault();
  
    const userId = document.getElementById('userId').value.trim();
    const userInfoContainer = document.getElementById('userInfo');
  
    if (!userId) {
      userInfoContainer.classList.add('show');
      userInfoContainer.innerHTML = '<p style="color:#ff4d4f;">Please enter a User ID.</p>';
      return;
    }
  
    userInfoContainer.classList.remove('show');
    userInfoContainer.innerHTML = '<p>Loading...</p>';
    userInfoContainer.style.display = 'block';
  
    try {
      const response = await fetch('/api/getDiscordUser', {  // This must be correct based on your frontend/backend setup
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
  
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Network response was not ok');
      }
  
      const data = await response.json();
  
      if (data.error) {
        userInfoContainer.innerHTML = `<p style="color:#ff4d4f;">Error: ${data.error}</p>`;
        return;
      }
  
      // Convert accentColor decimal to hex (if present)
      let accentColorHex = 'N/A';
      if (data.accentColor && typeof data.accentColor === 'number') {
        accentColorHex = '#' + data.accentColor.toString(16).padStart(6, '0');
      }
  
      userInfoContainer.innerHTML = `
        <h2>${data.username}#${data.discriminator}</h2>
        <p><strong>Discord ID:</strong> ${data.discordId}</p>
        <p><strong>Global Name:</strong> ${data.globalName || 'N/A'}</p>
        <p><strong>Public Flags:</strong> ${data.publicFlags}</p>
        <p><strong>Accent Color:</strong> <span style="color: ${accentColorHex}">${accentColorHex}</span></p>
        <p><strong>Clan Info:</strong> ${data.clan || 'None'}</p>
        ${data.avatarImage ? `<img src="${data.avatarImage}" alt="Avatar" />` : ''}
        ${data.bannerImage ? `<img src="${data.bannerImage}" alt="Banner" />` : ''}
      `;
  
      userInfoContainer.classList.add('show');
  
    } catch (error) {
      console.error('Fetch error:', error);
      userInfoContainer.innerHTML = `<p style="color:#ff4d4f;">An error occurred: ${error.message}</p>`;
      userInfoContainer.classList.add('show');
    }
  });
  