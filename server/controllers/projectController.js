/**
 * @file projectController.js
 * @description לוגיקה לניהול פרויקטים, כולל יצירה, קריאה, עדכון, מחיקה, והוספת תמונות.
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../projects.json');
const validator = require('validator'); // ייבוא ספריית Validator


/**
 * קריאת נתוני הפרויקטים מהקובץ.
 * @function readData
 * @returns {Object} אובייקט המכיל את הפרויקטים.
 * @throws {Error} אם קריאת הקובץ נכשלה.
 */

const readData = () => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading data:", error.message);
        throw new Error("Could not read data.");
    }
};


/**
 * כתיבת נתוני הפרויקטים לקובץ.
 * @function writeData
 * @param {Object} data - אובייקט המכיל את הנתונים לכתיבה.
 */


const writeData = (data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing data to JSON file:", error.message);
    }
};


/**
 * יצירת פרויקט חדש.
 * @function createProject
 * @param {Object} req - אובייקט הבקשה, כולל גוף הבקשה עם נתוני הפרויקט.
 * @param {Object} res - אובייקט התגובה להחזרת תוצאה ללקוח.
 */

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

        const generateProjectId = () => {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let projectId = '';
            for (let i = 0; i < 13; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                projectId += characters[randomIndex];
            }
            return projectId;
        };
        
        
        const projectId = generateProjectId(); // Generate the 13-character unique ID 
   
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


/**
 * קבלת כל הפרויקטים.
 * @function getProjects
 * @param {Object} req - אובייקט הבקשה.
 * @param {Object} res - אובייקט התגובה להחזרת התוצאה.
 */

const getProjects = (req, res) => {
    try {
        const data = readData(); // Read all projects from the JSON file
        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching projects:", error.message);
        res.status(500).json({ error: "Failed to fetch projects." });
    }
};

/**
 * הוספת תמונה לפרויקט קיים.
 * @function addImageToProject
 * @param {Object} req - אובייקט הבקשה עם מזהה הפרויקט בפרמטרים ופרטי התמונה בגוף הבקשה.
 * @param {Object} res - אובייקט התגובה להחזרת סטטוס ההוספה.
 */
const addImageToProject = (req, res) => {
    try {
        const { id } = req.params; // קבלת מזהה הפרויקט מהפרמטרים של ה-URL
        const { id: imageId, thumb, description, keyword } = req.body; // קבלת פרטי התמונה מגוף הבקשה

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


/**
 * קבלת פרויקט לפי מזהה.
 * @function getProjectById
 * @param {Object} req - אובייקט הבקשה עם מזהה הפרויקט בפרמטרים.
 * @param {Object} res - אובייקט התגובה להחזרת הפרויקט המבוקש.
 */

const getProjectById = (req, res) => {
    const { id } = req.params;
    const data = readData();

    if (!data[id]) {
        return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json(data[id]);
};

/**
 * עדכון פרויקט קיים.
 * @function updateProject
 * @param {Object} req - אובייקט הבקשה עם נתוני העדכון בפרמטרים ובגוף הבקשה.
 * @param {Object} res - אובייקט התגובה להחזרת סטטוס העדכון.
 */

const updateProject = (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const data = readData();
    if (!data[id]) {
        return res.status(404).json({ error: "Project not found" });
    }

    const project = data[id];

    // Only process 'team' field if provided
    if (updates.team) {
        const existingTeam = project.team.map(member => JSON.stringify(member));
        const newMembers = updates.team.filter(member => !existingTeam.includes(JSON.stringify(member)));
        if (newMembers.length > 0) {
            project.team = [...project.team, ...newMembers];
        }
    }

    // Update other updatable fields
    Object.keys(updates).forEach(key => {
        if (key !== 'team') project[key] = updates[key];
    });

    writeData(data);

    res.status(200).json({ message: "Project updated successfully", project });
};
/**
 * מחיקת פרויקט לפי מזהה.
 * @function deleteProject
 * @param {Object} req - אובייקט הבקשה עם מזהה הפרויקט בפרמטרים.
 * @param {Object} res - אובייקט התגובה להחזרת סטטוס המחיקה.
 */

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

/**
 * מחיקת תמונה מתוך פרויקט.
 * @function deleteImageFromProject
 * @param {Object} req - אובייקט הבקשה עם מזהה הפרויקט והתמונה בפרמטרים.
 * @param {Object} res - אובייקט התגובה להחזרת סטטוס המחיקה.
 */

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
