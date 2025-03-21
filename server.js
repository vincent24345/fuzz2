const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('public')); // Serve static files

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve your HTML page
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
