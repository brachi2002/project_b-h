const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../projects.json');
const validator = require('validator'); // ייבוא ספריית Validator


// קריאת וכתיבת נתונים
const readData = () => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading data:", error.message);
        throw new Error("Could not read data.");
    }
};

const writeData = (data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log("Data written successfully to JSON file");
    } catch (error) {
        console.error("Error writing data to JSON file:", error.message);
    }
};


// יצירת פרויקט חדש

const createProject = (req, res) => {
    const { name, summary, manager, team, images, start_date } = req.body;

    // Validation for required fields
    if (!name || !summary || !manager || !manager.name || !manager.email || !start_date) {
        return res.status(400).json({ error: 'All fields are required: name, summary, manager (name and email), and start_date.' });
    }

    // Validation for summary length
    if (summary.length < 20 || summary.length > 80) {
        return res.status(400).json({ error: 'Summary must be between 20 and 80 characters.' });
    }

    // Validation for manager's email
    if (!validator.isEmail(manager.email)) {
        return res.status(400).json({ error: 'Invalid email format for manager email.' });
    }

    // Validation for team members
    if (!team || team.length === 0) {
        return res.status(400).json({ error: 'At least one team member is required.' });
    }

    // Validation for team members' emails
    if (team && team.some(member => !validator.isEmail(member.email))) {
        return res.status(400).json({ error: 'One or more team member emails are invalid.' });
    }

    try {
        const data = readData(); // Read existing projects
        const projectId = Math.random().toString(36).substring(2, 15).toUpperCase(); // Generate unique ID

        // Create the new project
        data[projectId] = {
            id: projectId,
            name,
            summary,
            manager,
            team: team || [], // Default to empty array if not provided
            images: images || [], // Default to empty array if not provided
            start_date,
        };

        writeData(data); // Save the updated data
        return res.status(201).json({ message: 'Project created successfully', id: projectId });
    } catch (error) {
        console.error("Error creating project:", error.message);
        return res.status(500).json({ error: "Internal server error." });
    }
};


// Get all projects
const getProjects = (req, res) => {
    try {
        const data = readData(); // Read all projects from the JSON file
        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching projects:", error.message);
        res.status(500).json({ error: "Failed to fetch projects." });
    }
};

// הוספת תמונה לפרויקט קיים
const addImageToProject = (req, res) => {
    try {
        const { id } = req.params; // קבלת מזהה הפרויקט מהפרמטרים של ה-URL
        const { id: imageId, thumb, description, keyword } = req.body; // קבלת פרטי התמונה מגוף הבקשה

        // הדפסת מזהה הפרויקט
        console.log("Project ID (req.params.id):", id);

        // הדפסת פרטי התמונה
        console.log("Image ID:", imageId);
        console.log("Image Thumbnail (thumb):", thumb);
        console.log("Image Description:", description);
        console.log("Image Keyword:", keyword);

        // בדיקות קלט
        if (!id || !imageId || !thumb || !description || !keyword) {
            return res.status(400).json({ error: "Missing required fields: project ID, image ID, thumb, description, or keyword." });
        }

        const data = readData(); // קריאת המידע מקובץ JSON

        if (!data[id]) {
            return res.status(404).json({ error: `Project not found. ID: ${id}` });
        }

        const project = data[id];

        // בדיקה אם התמונה כבר קיימת בפרויקט
        if (project.images.some(image => image.id === imageId)) {
            return res.status(400).json({ error: "Image already exists in the project." });
        }

        // הוספת התמונה לרשימת התמונות של הפרויקט
        project.images.push({ id: imageId, thumb, description, keyword });

        writeData(data); // כתיבה חזרה לקובץ JSON

        return res.status(201).json({
            message: "Image added successfully.",
            id: imageId,
            thumb,
            description,
            keyword
        });
        
    } catch (error) {
        console.error("Error in addImageToProject:", error.message);
        return res.status(500).json({ error: "Internal server error." });
    }
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

    console.log("Received update request for project:", id, updates);

    const data = readData();
    if (!data[id]) {
        return res.status(404).json({ error: "Project not found" });
    }

    const project = data[id];

    // Only process 'team' field if provided
    if (updates.team) {
        console.log("Updating team:", updates.team);
        const existingTeam = project.team.map(member => JSON.stringify(member));
        const newMembers = updates.team.filter(member => !existingTeam.includes(JSON.stringify(member)));
        if (newMembers.length > 0) {
            project.team = [...project.team, ...newMembers];
            console.log("Updated team members:", project.team);
        }
    }

    // Update other updatable fields
    Object.keys(updates).forEach(key => {
        if (key !== 'team') project[key] = updates[key];
    });

    writeData(data);
    console.log("Updated project saved:", project);

    res.status(200).json({ message: "Project updated successfully", project });
};





// מחיקת פרויקט
const deleteProject = (req, res) => {
    const { id } = req.params;

    const data = readData();
    if (!data[id]) {
        return res.status(404).json({ error: "Project not found" });
    }

    delete data[id];
    writeData(data);

    res.status(200).json({ message: "Project deleted successfully" });
};

const deleteImageFromProject = (req, res) => {
    const { id, imageId } = req.params;

    // בדיקת קלט חסר או לא תקין
    if (!id || !imageId || imageId === 'null') {
        return res.status(400).json({
            error: "Invalid Project ID or Image ID.",
            details: { projectId: id, imageId }
        });
    }

    const data = readData();
    if (!data[id]) {
        return res.status(400).json({ error: `@@Project not found. ID: ${data}` });
        // return res.status(200).json({ error: "you didnt delete anything" });
    }

    const project = data[id];
    const imageIndex = project.images.findIndex((image) => image.id === imageId);

    if (imageIndex === -1) {
        return res.status(404).json({ error: "Image not found in the project." });
    }

    // מחיקת התמונה מהרשימה
    project.images.splice(imageIndex, 1);
    writeData(data);

    res.status(200).json({ message: "Image removed successfully.", images: project.images });
};


module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addImageToProject,
    deleteImageFromProject
};
