const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // וודא שהוספת את מודול path

const projectRoutes = require('./routes/projectRoutes');

const app = express();

// שימוש ב-Body Parser לניתוח בקשות JSON
app.use(bodyParser.json());

// הפעלת CORS לאפשר גישה לשרת ממקורות חיצוניים
app.use(cors());

// הגדרת תיקיית client כסטטית (שמה public לפי ההגדרות שלך)
app.use(express.static(path.join(__dirname, '../client')));

// ניתוב לנתיבים של פרויקטים
app.use('/', projectRoutes);

// ניתוב ל-HTML הראשי בנתיב /
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

// הפעלת השרת
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
