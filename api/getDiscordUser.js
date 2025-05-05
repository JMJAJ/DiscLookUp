const axios = require('axios');

module.exports = async (req, res) => {
    // Set CORS headers for better security
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            message: 'This endpoint only accepts POST requests'
        });
    }

    try {
        const { userId } = req.body;

        // Input validation
        if (!userId) {
            return res.status(400).json({ 
                error: 'Missing required parameter',
                message: 'User ID is required' 
            });
        }
        
        // Check if userId is valid format (numbers only)
        if (!/^\d+$/.test(userId)) {
            return res.status(400).json({ 
                error: 'Invalid User ID',
                message: 'Discord User ID should contain only numbers'
            });
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
                timeout: 8000 // Set a timeout to avoid hanging requests
            }
        );

        const data = response.data;

        // Check for empty results
        if (!data.data || data.data.length === 0) {
            return res.status(404).json({ 
                error: 'User not found',
                message: 'No information found for this Discord User ID' 
            });
        }

        const userData = data.data[0];

        // Process clan information
        const formattedClan = userData.clan
            ? `Tag: ${userData.clan.tag}<br>Badge: ${userData.clan.badge}`
            : 'No clan information';

        // Process avatar decoration data
        const avatarDecorationData = userData.avatar_decoration_data
            ? {
                asset: userData.avatar_decoration_data.asset || 'No asset available',
                skuId: userData.avatar_decoration_data.sku_id || 'No SKU ID available',
            }
            : {
                asset: 'No asset available',
                skuId: 'No SKU ID available',
            };

        // Format the response
        res.json({
            discordId: userData.id,
            username: userData.username || 'Unknown',
            globalName: userData.global_name || null,
            discriminator: userData.discriminator || '0000',
            publicFlags: userData.public_flags || 0,
            flags: userData.flags || 0,
            accentColor: userData.accent_color,
            bannerColor: userData.banner_color,
            clan: formattedClan,
            avatarDecorationData: avatarDecorationData,
            flagsListed: userData.flagsListed || 'None',
            avatarImage: extractImageUrl(userData.avatar_image),
            bannerImage: extractImageUrl(userData.banner_image)
        });
    } catch (error) {
        console.error('Error fetching Discord user information:', error);
        
        // Handle different types of errors
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            return res.status(502).json({
                error: 'External service error',
                message: 'The Discord lookup service returned an error',
                details: error.response.status
            });
        } else if (error.request) {
            // The request was made but no response was received
            return res.status(504).json({
                error: 'Timeout error',
                message: 'Discord lookup service is not responding',
                details: 'Request timed out'
            });
        } else {
            // Something happened in setting up the request that triggered an Error
            return res.status(500).json({
                error: 'Internal server error',
                message: 'An unexpected error occurred while processing your request',
                details: error.message
            });
        }
    }
};

/**
 * Extracts image URL from HTML img tag
 * @param {string} htmlString - HTML string containing img tag
 * @returns {string|null} - Extracted image URL or null if not found
 */
function extractImageUrl(htmlString) {
    if (!htmlString) return null;
    
    try {
        const match = /src="([^"]+)"/.exec(htmlString);
        return match ? match[1] : null;
    } catch (error) {
        console.error('Error extracting image URL:', error);
        return null;
    }
}
