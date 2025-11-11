require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Роуты авторизации
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello World!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Visit http://localhost:${port} to see your app`);
});