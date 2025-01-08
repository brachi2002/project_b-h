/**
 * @file index.js
 * @description קובץ אתחול לשרת Node.js, כולל הגדרות לניתוב, חיבורים, ותמיכה ב-API.
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // וודא שהוספת את מודול path

const projectRoutes = require('./routes/projectRoutes');

/**
 * @description אתחול האפליקציה עם אקספרס.
 */

const app = express();

/**
 * @description שימוש ב-Body Parser לניתוח בקשות JSON.
 */


app.use(bodyParser.json());

/**
 * @description הפעלת CORS לאפשר גישה לשרת ממקורות חיצוניים.
 */

app.use(cors());

/**
 * @description הגדרת תיקיית client כתיקייה סטטית.
 */

app.use(express.static(path.join(__dirname, '../client')));

/**
 * @description הגדרת ניתוב לנתיבי פרויקטים.
 */

app.use('/', projectRoutes);

/**
 * @route GET /
 * @description ניתוב ל-HTML הראשי בנתיב /.
 */

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'index.html'));
});

/**
 * @description הפעלת השרת על פורט 3001.
 */

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
