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

module.exports = {
    createProject,
    getProjects,
    getProjectById
};
