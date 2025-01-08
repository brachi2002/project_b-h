/**
 * @file projectRoutes.js
 * @description מספק ניתובים לניהול פרויקטים, כולל יצירה, עדכון, מחיקה, הוספת תמונות, חיפוש תמונות ועוד.
 */

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

/**
 * @route POST /projects
 * @description יצירת פרויקט חדש.
 */
router.post('/projects', createProject);

/**
 * @route GET /projects
 * @description קבלת כל הפרויקטים.
 */
router.get('/projects', getProjects);

/**
 * @route GET /projects/:id
 * @description קבלת פרויקט לפי מזהה.
 */
router.get('/projects/:id', getProjectById);

/**
 * @route PUT /projects/:id
 * @description עדכון פרויקט קיים.
 */
router.put('/projects/:id', updateProject);

/**
 * @route DELETE /projects/:id
 * @description מחיקת פרויקט לפי מזהה.
 */
router.delete('/projects/:id', deleteProject);

/**
 * @route POST /projects/:id/images
 * @description הוספת תמונה לפרויקט.
 */
router.post('/projects/:id/images', addImageToProject);

/**
 * @route GET /projects/images/:keyword
 * @description חיפוש תמונות לפי מילת מפתח.
 */
router.get('/projects/images/:keyword', async (req, res) => {
    try {
        const images = await searchImages(req.params.keyword);
        res.status(200).json(images);
    } catch (error) {
        console.error("Error fetching images from Unsplash:", error.message);
        res.status(500).json({ error: "Failed to fetch images." });
    }
});

/**
 * @route DELETE /projects/:id/images/:imageId
 * @description מחיקת תמונה מפרויקט לפי מזהה תמונה.
 */
router.delete('/projects/:id/images/:imageId', deleteImageFromProject);

module.exports = router;
