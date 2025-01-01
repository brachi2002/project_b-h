const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const projectRoutes = require('./routes/projectRoutes');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../client'))); // אם הקבצים הועברו לתיקיית client

app.use('/api', projectRoutes);

const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
