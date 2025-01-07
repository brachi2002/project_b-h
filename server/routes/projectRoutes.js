const express = require('express');
const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addImageToProject,
    deleteImageFromProject
} = require('../controllers/projectController');
const { searchImages } = require('../services/unsplashService');

const router = express.Router();

// יצירת פרויקט חדש
router.post('/projects', createProject);

// קבלת כל הפרויקטים
router.get('/projects', getProjects);

// קבלת פרויקט לפי מזהה
router.get('/projects/:id', getProjectById);

// עדכון פרויקט
router.put('/projects/:id', updateProject);

// מחיקת פרויקט
router.delete('/projects/:id', deleteProject);

// הוספת תמונה לפרויקט
router.post('/projects/:id/images', addImageToProject);

// חיפוש תמונות
router.get('/projects/images/:keyword', async (req, res) => {
    try {
        const images = await searchImages(req.params.keyword);
        res.status(200).json(images);
    } catch (error) {
        console.error("Error fetching images from Unsplash:", error.message);
        res.status(500).json({ error: "Failed to fetch images." });
    }
});

router.delete('/projects/:id/images/:imageId', deleteImageFromProject);

module.exports = router;
