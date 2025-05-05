document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    updatePastLookups();
    
    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Form submission
    document.getElementById('userForm').addEventListener('submit', handleFormSubmit);
    
    // Clear history button
    document.getElementById('clearHistoryButton').addEventListener('click', clearHistory);
    
    // New lookup button
    document.getElementById('addLookupButton').addEventListener('click', resetForm);
    
    // Listen for clicks on past lookups
    document.getElementById('lookupScroll').addEventListener('click', handlePastLookupClick);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const userId = document.getElementById('userId').value.trim();
    
    if (!userId) {
        showToast('Error', 'Please enter a Discord User ID', 'error');
        return;
    }
    
    // Show loading indicator
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'flex';
    
    // Clear previous results
    document.getElementById('userInfo').innerHTML = '';
    
    try {
        const data = await fetchDiscordUser(userId);
        renderUserInfo(data);
        saveLookup(data);
        updatePastLookups();
        showToast('Success', 'User information retrieved successfully', 'success');
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('userInfo').innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ED4245" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>${error.message || 'An error occurred while fetching user information. Please try again.'}</p>
            </div>
        `;
        showToast('Error', error.message || 'Failed to retrieve user information', 'error');
    } finally {
        // Hide loading indicator
        loadingIndicator.style.display = 'none';
    }
}

async function fetchDiscordUser(userId) {
    const response = await fetch('/api/getDiscordUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user information');
    }
    
    return await response.json();
}

function renderUserInfo(data) {
    const userInfoContainer = document.getElementById('userInfo');
    
    // Create banner section
    const bannerSection = createBannerSection(data);
    
    // Create user header section
    const userHeader = createUserHeader(data);
    
    // Create information grid
    const infoGrid = createInformationGrid(data);
    
    // Assemble all sections
    userInfoContainer.innerHTML = '';
    userInfoContainer.appendChild(bannerSection);
    userInfoContainer.appendChild(userHeader);
    userInfoContainer.appendChild(infoGrid);
    
    // Add decoration section if available
    if (data.avatarDecorationData && data.avatarDecorationData.asset !== 'No asset available') {
        const decorationSection = createDecorationSection(data);
        userInfoContainer.appendChild(decorationSection);
    }
    
    // Add animation class
    userInfoContainer.classList.add('fade-in');
}

function createBannerSection(data) {
    const bannerSection = document.createElement('div');
    bannerSection.className = 'banner-container';
    
    if (data.bannerImage) {
        const img = document.createElement('img');
        img.src = data.bannerImage;
        img.alt = 'User Banner';
        bannerSection.appendChild(img);
    } else {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'banner-color';
        colorDiv.style.backgroundColor = data.bannerColor || '#5865F2';
        bannerSection.appendChild(colorDiv);
    }
    
    return bannerSection;
}

function createUserHeader(data) {
    const header = document.createElement('div');
    header.className = 'user-header';
    
    // Avatar
    const avatarWrap = document.createElement('div');
    
    if (data.avatarImage) {
        const avatar = document.createElement('img');
        avatar.src = data.avatarImage;
        avatar.alt = 'User Avatar';
        avatar.className = 'user-avatar';
        avatarWrap.appendChild(avatar);
    } else {
        // Create default avatar with initials
        const defaultAvatar = document.createElement('div');
        defaultAvatar.className = 'user-avatar';
        defaultAvatar.style.backgroundColor = '#5865F2';
        defaultAvatar.style.display = 'flex';
        defaultAvatar.style.alignItems = 'center';
        defaultAvatar.style.justifyContent = 'center';
        defaultAvatar.style.color = '#FFFFFF';
        defaultAvatar.style.fontWeight = 'bold';
        
        const initials = (data.globalName || data.username || 'U').charAt(0).toUpperCase();
        defaultAvatar.textContent = initials;
        
        avatarWrap.appendChild(defaultAvatar);
    }
    
    // User info
    const userInfo = document.createElement('div');
    userInfo.className = 'user-name-container';
    
    const name = document.createElement('h2');
    name.className = 'user-name';
    name.textContent = data.globalName || data.username;
    
    const tag = document.createElement('div');
    tag.className = 'user-tag';
    tag.textContent = `${data.username}#${data.discriminator}`;
    
    userInfo.appendChild(name);
    userInfo.appendChild(tag);
    
    header.appendChild(avatarWrap);
    header.appendChild(userInfo);
    
    return header;
}

function createInformationGrid(data) {
    const grid = document.createElement('div');
    grid.className = 'info-grid';
    
    // Define the information items to display
    const infoItems = [
        { label: 'Discord ID', value: data.discordId },
        { label: 'Discriminator', value: data.discriminator },
        { label: 'Global Name', value: data.globalName || 'N/A' },
        { label: 'Public Flags', value: data.publicFlags || '0' },
        { label: 'Flags', value: data.flags || '0' },
        { label: 'Accent Color', value: formatColor(data.accentColor) },
        { label: 'Banner Color', value: formatColor(data.bannerColor) },
        { label: 'Flags Listed', value: formatFlagsList(data.flagsListed) }
    ];
    
    // Create an info item for each piece of information
    infoItems.forEach(item => {
        const infoItem = document.createElement('div');
        infoItem.className = 'info-item';
        
        const label = document.createElement('div');
        label.className = 'info-label';
        label.textContent = item.label;
        
        const value = document.createElement('div');
        value.className = 'info-value';
        value.textContent = item.value;
        
        infoItem.appendChild(label);
        infoItem.appendChild(value);
        
        grid.appendChild(infoItem);
    });
    
    // Clan information if available
    if (data.clan && data.clan !== 'No clan information') {
        const clanItem = document.createElement('div');
        clanItem.className = 'info-item';
        
        const label = document.createElement('div');
        label.className = 'info-label';
        label.textContent = 'Clan';
        
        const value = document.createElement('div');
        value.className = 'info-value';
        value.innerHTML = data.clan.replace('<br>', '<br>');
        
        clanItem.appendChild(label);
        clanItem.appendChild(value);
        
        grid.appendChild(clanItem);
    }
    
    return grid;
}

function createDecorationSection(data) {
    const section = document.createElement('div');
    section.className = 'decoration-container';
    
    const title = document.createElement('h3');
    title.textContent = 'Avatar Decoration';
    
    const infoGrid = document.createElement('div');
    infoGrid.className = 'info-grid';
    
    // Asset info
    const assetItem = document.createElement('div');
    assetItem.className = 'info-item';
    
    const assetLabel = document.createElement('div');
    assetLabel.className = 'info-label';
    assetLabel.textContent = 'Asset';
    
    const assetValue = document.createElement('div');
    assetValue.className = 'info-value';
    assetValue.textContent = data.avatarDecorationData.asset;
    
    assetItem.appendChild(assetLabel);
    assetItem.appendChild(assetValue);
    
    // SKU ID info
    const skuItem = document.createElement('div');
    skuItem.className = 'info-item';
    
    const skuLabel = document.createElement('div');
    skuLabel.className = 'info-label';
    skuLabel.textContent = 'SKU ID';
    
    const skuValue = document.createElement('div');
    skuValue.className = 'info-value';
    skuValue.textContent = data.avatarDecorationData.skuId;
    
    skuItem.appendChild(skuLabel);
    skuItem.appendChild(skuValue);
    
    // Add items to grid
    infoGrid.appendChild(assetItem);
    infoGrid.appendChild(skuItem);
    
    // Add to section
    section.appendChild(title);
    section.appendChild(infoGrid);
    
    return section;
}

function formatColor(colorValue) {
    if (!colorValue) return 'None';
    
    // If it's already a hex code
    if (typeof colorValue === 'string' && colorValue.startsWith('#')) {
        return `${colorValue} <span style="display:inline-block;width:12px;height:12px;background-color:${colorValue};border-radius:2px;margin-left:5px;"></span>`;
    }
    
    // Convert number to hex
    if (typeof colorValue === 'number') {
        const hex = '#' + colorValue.toString(16).padStart(6, '0');
        return `${hex} <span style="display:inline-block;width:12px;height:12px;background-color:${hex};border-radius:2px;margin-left:5px;"></span>`;
    }
    
    return colorValue;
}

function formatFlagsList(flagsList) {
    if (!flagsList || flagsList === 'undefined' || flagsList === 'null') {
        return 'None';
    }
    
    return flagsList;
}

function saveLookup(data) {
    let lookups = getLookups();
    
    // Check if this user is already in history
    const existingIndex = lookups.findIndex(lookup => lookup.discordId === data.discordId);
    
    // Remove the existing entry if found
    if (existingIndex !== -1) {
        lookups.splice(existingIndex, 1);
    }
    
    // Add the new lookup to the beginning of the array
    lookups.unshift(data);
    
    // Keep only the last 10 lookups
    if (lookups.length > 10) {
        lookups = lookups.slice(0, 10);
    }
    
    // Save to localStorage
    localStorage.setItem('discordLookups', JSON.stringify(lookups));
}

function getLookups() {
    try {
        return JSON.parse(localStorage.getItem('discordLookups') || '[]');
    } catch (error) {
        console.error('Error parsing lookups from localStorage:', error);
        return [];
    }
}

function updatePastLookups() {
    const lookups = getLookups();
    const prevLookupsContainer = document.getElementById('lookupScroll');
    
    if (lookups.length === 0) {
        prevLookupsContainer.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <p>No previous lookups found</p>
            </div>
        `;
        return;
    }
    
    prevLookupsContainer.innerHTML = '';
    
    lookups.forEach((lookup, index) => {
        const card = document.createElement('div');
        card.className = 'lookup-card';
        card.dataset.userId = lookup.discordId;
        
        // Create avatar container
        const avatar = document.createElement('div');
        if (lookup.avatarImage) {
            const img = document.createElement('img');
            img.src = lookup.avatarImage;
            img.alt = 'Avatar';
            avatar.appendChild(img);
        } else {
            // Create default avatar with initials
            const defaultAvatar = document.createElement('div');
            defaultAvatar.style.width = '48px';
            defaultAvatar.style.height = '48px';
            defaultAvatar.style.borderRadius = '50%';
            defaultAvatar.style.backgroundColor = '#5865F2';
            defaultAvatar.style.display = 'flex';
            defaultAvatar.style.alignItems = 'center';
            defaultAvatar.style.justifyContent = 'center';
            defaultAvatar.style.color = '#FFFFFF';
            defaultAvatar.style.fontWeight = 'bold';
            
            const initials = (lookup.globalName || lookup.username || 'U').charAt(0).toUpperCase();
            defaultAvatar.textContent = initials;
            
            avatar.appendChild(defaultAvatar);
        }
        
        // Create info container
        const info = document.createElement('div');
        info.className = 'lookup-user-info';
        
        const name = document.createElement('h3');
        name.textContent = lookup.globalName || lookup.username;
        
        const id = document.createElement('p');
        id.textContent = `ID: ${lookup.discordId}`;
        
        info.appendChild(name);
        info.appendChild(id);
        
        // Add to card
        card.appendChild(avatar);
        card.appendChild(info);
        
        // Add to container
        prevLookupsContainer.appendChild(card);
    });
}

function handlePastLookupClick(event) {
    // Find the closest lookup-card element
    const card = event.target.closest('.lookup-card');
    if (!card) return;
    
    const userId = card.dataset.userId;
    if (userId) {
        document.getElementById('userId').value = userId;
        
        // Trigger form submission
        const submitEvent = new Event('submit', { cancelable: true });
        document.getElementById('userForm').dispatchEvent(submitEvent);
    }
}

function clearHistory() {
    // Show confirmation toast
    showToast('Confirm', 'History cleared successfully', 'success');
    
    // Clear localStorage
    localStorage.removeItem('discordLookups');
    
    // Update UI
    updatePastLookups();
}

function resetForm() {
    // Clear the input field and results
    document.getElementById('userId').value = '';
    document.getElementById('userInfo').innerHTML = '';
    
    // Focus on the input field
    document.getElementById('userId').focus();
    
    // Show toast notification
    showToast('New Lookup', 'Ready for a new user lookup', 'success');
}

function showToast(title, message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Toast content
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">&times;</button>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Add event listener to close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    });
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
}
