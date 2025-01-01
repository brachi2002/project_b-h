const express = require('express');
const { createProject, getProjects, getProjectById } = require('../controllers/projectController');
const { searchImages } = require('../services/unsplashService');
const router = express.Router();

router.post('/projects', createProject);
router.get('/projects', getProjects);
router.get('/projects/:id', getProjectById);

router.get('/projects/images/:keyword', async (req, res) => {
    const { keyword } = req.params;

    try {
        const images = await searchImages(keyword);
        res.status(200).json(images);
    } catch (error) {
        console.error('Error fetching images:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
