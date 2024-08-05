const axios = require('axios');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // First API request to Discord ID Lookup
        const discordIdLookupResponse = await axios.post(
            'https://discordid.nealvos.nl/lookup/index.php',
            `discord_id=${encodeURIComponent(userId)}`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            }
        );

        const discordIdLookupData = discordIdLookupResponse.data;
        if (!discordIdLookupData.data || discordIdLookupData.data.length === 0) {
            return res.status(404).json({ error: 'No user information found' });
        }

        const userDataFromFirstApi = discordIdLookupData.data[0];

        // Second API request to Discord Lookup
        const discordLookupResponse = await axios.post(
            'https://discordlookup.com/livewire/message/lookup.user',
            {
                effects: {
                    html: "",
                    path: `https://discordlookup.com/user/${userId}`,
                    dirty: []
                },
                serverMemo: {
                    data: {
                        snowflake: userId
                    }
                }
            }
        );

        const discordLookupData = discordLookupResponse.data.serverMemo.data;

        const formattedClan = userDataFromFirstApi.clan
            ? `Tag: ${userDataFromFirstApi.clan.tag}<br>Badge: ${userDataFromFirstApi.clan.badge}`
            : 'No clan information';

        const avatarDecorationData = userDataFromFirstApi.avatar_decoration_data || {};
        
        const avatarDecoration = {
            asset: avatarDecorationData.asset || 'No asset available',
            skuId: avatarDecorationData.sku_id || 'No SKU ID available',
        };

        res.json({
            discordId: userDataFromFirstApi.id,
            username: userDataFromFirstApi.username,
            globalName: userDataFromFirstApi.global_name,
            discriminator: userDataFromFirstApi.discriminator,
            publicFlags: userDataFromFirstApi.public_flags,
            flags: userDataFromFirstApi.flags,
            accentColor: userDataFromFirstApi.accent_color,
            bannerColor: userDataFromFirstApi.banner_color,
            clan: formattedClan,
            avatarDecorationData: avatarDecoration,
            flagsListed: userDataFromFirstApi.flagsListed,
            avatarImage: extractImageUrl(userDataFromFirstApi.avatar_image),
            bannerImage: extractImageUrl(userDataFromFirstApi.banner_image),

            // Additional fields from the new API
            isBot: discordLookupData.userData.isBot || false,
            isSpammer: discordLookupData.userData.isSpammer || false,
            premiumType: discordLookupData.userData.premiumType || null,
            flagsList: discordLookupData.userData.flagsList || [],
            clanDetails: {
                clanName: discordLookupData.userClanData.name || 'Unknown',
                clanDescription: discordLookupData.userClanData.description || '',
                clanMemberCount: discordLookupData.userClanData.memberCount || 0,
                clanPlaystyle: discordLookupData.userClanData.playstyleName || 'Unknown',
            }
        });
    } catch (error) {
        console.error('Error fetching Discord user information:', error.message, error.stack);

        if (error.response) {
            // Axios error handling for failed requests
            console.error('Response error data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
            res.status(500).json({ error: 'Error contacting external API' });
        } else if (error.request) {
            // Axios error handling for no response
            console.error('No response received:', error.request);
            res.status(500).json({ error: 'No response from external API' });
        } else {
            // General error handling
            console.error('Error message:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

// Utility function to extract image URL from HTML
function extractImageUrl(htmlString) {
    if (!htmlString) return null;
    const match = /src="([^"]+)"/.exec(htmlString);
    return match ? match[1] : null;
}
