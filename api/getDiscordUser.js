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

        // Make the POST request to the Discord ID lookup service
        const response = await axios.post(
            'https://discordid.nealvos.nl/lookup/index.php',
            `discord_id=${userId}`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            }
        );

        const data = response.data;

        if (data.data.length === 0) {
            return res.status(404).json({ error: 'No user information found' });
        }

        const userData = data.data[0];

        const formattedClan = userData.clan
            ? `Tag: ${userData.clan.tag}<br>Badge: ${userData.clan.badge}`
            : 'No clan information';

        const avatarDecorationData = userData.avatar_decoration_data
            ? {
                asset: userData.avatar_decoration_data.asset,
                skuId: userData.avatar_decoration_data.sku_id,
            }
            : {
                asset: 'No asset available',
                skuId: 'No SKU ID available',
        };

        res.json({
            discordId: userData.id,
            username: userData.username,
            globalName: userData.global_name,
            discriminator: userData.discriminator,
            publicFlags: userData.public_flags,
            flags: userData.flags,
            accentColor: userData.accent_color,
            bannerColor: userData.banner_color,
            clan: formattedClan,
            avatarDecorationData: avatarDecorationData,
            avatarImage: extractImageUrl(userData.avatar_image),
            bannerImage: extractImageUrl(userData.banner_image),
        });
    } catch (error) {
        console.error('Error fetching Discord user information:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Utility function to extract image URL from HTML
function extractImageUrl(htmlString) {
    const match = /src="([^"]+)"/.exec(htmlString);
    return match ? match[1] : null;
}
