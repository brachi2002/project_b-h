const express = require('express');
const { createProject, getProjects, getProjectById } = require('../controllers/projectController');

const router = express.Router();

router.post('/projects', createProject);
router.get('/projects', getProjects);
router.get('/projects/:id', getProjectById);

module.exports = router;
