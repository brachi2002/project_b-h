const express = require('express');
const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    deleteImageFromProject,
    deleteTeamMember
} = require('../controllers/projectController'); // ייבוא כל הפונקציות
const { searchImages } = require('../services/unsplashService');

const router = express.Router();

// ניתוב יצירת פרויקט חדש
router.post('/projects', createProject);

// ניתוב קבלת כל הפרויקטים
router.get('/projects', getProjects);

// ניתוב קבלת פרויקט לפי מזהה
router.get('/projects/:id', getProjectById);

// ניתוב לעדכון פרויקט
router.put('/projects/:id', updateProject);

// ניתוב למחיקת פרויקט
router.delete('/projects/:id', deleteProject);

// ניתוב למחיקת תמונה מפרויקט
router.delete('/projects/:id/images/:imageId', deleteImageFromProject);

// ניתוב למחיקת חבר צוות מפרויקט
router.delete('/projects/:id/team/:email', deleteTeamMember);

// ניתוב לחיפוש תמונות לפי מילת מפתח
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
