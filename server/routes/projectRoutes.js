const express = require('express');
const { createProject, getProjects, getProjectById, addImageToProject, deleteProject } = require('../controllers/projectController');
const { searchImages } = require('../services/unsplashService');

const router = express.Router();

// ניתוב ליצירת פרויקט
router.post('/projects', createProject);

// ניתוב לקבלת כל הפרויקטים
router.get('/projects', getProjects);

// ניתוב לקבלת פרויקט לפי מזהה
router.get('/projects/:id', getProjectById);

// ניתוב להוספת תמונה לפרויקט
router.post('/projects/:id/images', addImageToProject);

// ניתוב למחיקת פרויקט
router.delete('/projects/:id', deleteProject);

// ניתוב לחיפוש תמונות לפי מילת מפתח
router.get('/projects/images/:keyword', async (req, res) => {
    const { keyword } = req.params;

    try {
        const images = await searchImages(keyword);
        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
