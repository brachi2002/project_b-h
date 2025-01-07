
const axios = require('axios');

const UNSPLASH_ACCESS_KEY = 'Vrb7Rbid6EV6s4MpSkNk4Xv4KKaXUueCI3awAmGlTM0';

const searchImages = async (keyword) => {
    try {
        const response = await axios.get('https://api.unsplash.com/search/photos', {
            params: { query: keyword, per_page: 10 },
            headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
        });

        return response.data.results.map((image) => ({
            thumb: image.urls.thumb,
            id: image.id,
            description: image.alt_description || 'No description available',
            keyword,
        }));
    } catch (error) {
        console.error('Error fetching images from Unsplash:', error.message);
        throw new Error('Failed to fetch images');
    }
};

module.exports = { searchImages };
