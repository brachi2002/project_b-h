const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../projects.json');

// יצירת פרויקט חדש
const createProject = (req, res) => {
    const { name, summary, manager, team, startDate } = req.body;

    if (!name || !summary || !manager || !team || !startDate) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    if (summary.length < 20 || summary.length > 80) {
        return res.status(400).json({ error: 'Summary must be between 20 and 80 characters.' });
    }

    const data = JSON.parse(fs.readFileSync(filePath));

    const projectId = Math.random().toString(36).substring(2, 15).toUpperCase();

    const newProject = {
        id: projectId,
        name,
        summary,
        manager,
        team,
        startDate,
        images: [],
        goals: [],
    };

    data.projects.push(newProject);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    res.status(201).json({ message: 'Project created successfully', id: projectId });
};

// קבלת כל הפרויקטים
const getProjects = (req, res) => {
    const data = JSON.parse(fs.readFileSync(filePath));
    res.status(200).json(data.projects);
};

// קבלת פרויקט לפי מזהה
const getProjectById = (req, res) => {
    const { id } = req.params;
    const data = JSON.parse(fs.readFileSync(filePath));

    const project = data.projects.find((p) => p.id === id);

    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json(project);
};

// הוספת תמונה לפרויקט
const addImageToProject = (req, res) => {
    const { id } = req.params;
    const { imageId, path, description, keyword } = req.body;

    if (!imageId || !path || !description || !keyword) {
        return res.status(400).json({ error: 'All fields are required for the image.' });
    }

    const data = JSON.parse(fs.readFileSync(filePath));
    const project = data.projects.find((p) => p.id === id);

    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }

    const imageExists = project.images.some((img) => img.imageId === imageId);
    if (imageExists) {
        return res.status(400).json({ error: 'Image already exists in the project.' });
    }

    const newImage = { imageId, path, description, keyword };
    project.images.push(newImage);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    res.status(201).json({ message: 'Image added successfully', image: newImage });
};

// מחיקת פרויקט לפי מזהה
const deleteProject = (req, res) => {
    const { id } = req.params;

    const data = JSON.parse(fs.readFileSync(filePath));
    const projectIndex = data.projects.findIndex((p) => p.id === id);

    if (projectIndex === -1) {
        return res.status(404).json({ error: 'Project not found' });
    }

    data.projects.splice(projectIndex, 1);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    res.status(200).json({ message: 'Project deleted successfully' });
};

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    addImageToProject,
    deleteProject,
};
