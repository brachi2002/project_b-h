const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../projects.json');

// קריאת וכתיבת נתונים
const readData = () => JSON.parse(fs.readFileSync(filePath));
const writeData = (data) => fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

// יצירת פרויקט חדש
const createProject = (req, res) => {
    const { name, summary, manager, team, images, start_date } = req.body;

    if (!name || !summary || !manager || !manager.name || !manager.email || !start_date) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    if (summary.length < 20 || summary.length > 80) {
        return res.status(400).json({ error: 'Summary must be between 20 and 80 characters.' });
    }

    const data = readData();
    const projectId = Math.random().toString(36).substring(2, 15).toUpperCase();

    data[projectId] = {
        id: projectId,
        name,
        summary,
        manager,
        team: team || [],
        images: images || [],
        start_date,
    };

    writeData(data);
    res.status(201).json({ message: 'Project created successfully', id: projectId });
};

// קבלת כל הפרויקטים
const getProjects = (req, res) => {
    const data = readData();
    res.status(200).json(data);
};

// קבלת פרויקט לפי מזהה
const getProjectById = (req, res) => {
    const { id } = req.params;
    const data = readData();

    if (!data[id]) {
        return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json(data[id]);
};

const updateProject = (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const data = readData();
    if (!data[id]) {
        return res.status(404).json({ error: 'Project not found' });
    }

    const project = data[id];
    Object.assign(project, updates); // מעדכן את השדות שנשלחו
    writeData(data);

    res.status(200).json({ message: 'Project updated successfully', project });
};

const deleteProject = (req, res) => {
    const { id } = req.params;

    const data = readData();
    if (!data[id]) {
        return res.status(404).json({ error: 'Project not found' });
    }

    delete data[id];
    writeData(data);

    res.status(200).json({ message: 'Project deleted successfully' });
};

const deleteImageFromProject = (req, res) => {
    const { id, imageId } = req.params;

    const data = readData();
    if (!data[id]) {
        return res.status(404).json({ error: 'Project not found' });
    }

    const project = data[id];
    project.images = project.images.filter(image => image.id !== imageId);
    writeData(data);

    res.status(200).json({ message: 'Image removed successfully', images: project.images });
};

const deleteTeamMember = (req, res) => {
    const { id, email } = req.params;

    const data = readData();
    if (!data[id]) {
        return res.status(404).json({ error: 'Project not found' });
    }

    const project = data[id];
    project.team = project.team.filter(member => member.email !== email);
    writeData(data);

    res.status(200).json({ message: 'Team member removed successfully', team: project.team });
};


module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    deleteImageFromProject,
    deleteTeamMember
};
