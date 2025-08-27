require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: /^https?:\/\/(.+\.)?solopyme\.cl$/
}));
app.use(express.json());

// Endpoint to check if the app is running
app.get('/', (req, res) => {
  res.status(200).send('App is running! 🚀');
});

// Endpoint to store data in the waitlist table
app.post('/waitlist', async (req, res) => {
  const { name, email } = req.body;

  // Regular expression for basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Basic validation for name, and email format
  if (!name || !email) {
    return res.status(400).send('Name and email are required.');
  }
  
  if (!emailRegex.test(email)) {
    return res.status(400).send('Please enter a valid email address.');
  }

  // Database connection and insertion logic
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });

    const query = 'INSERT INTO waitlist (name, email) VALUES (?, ?)';
    const [rows] = await connection.execute(query, [name, email]);
    await connection.end();

    res.status(201).send('Successfully added to the waitlist! 🎉');

  } catch (error) {
    console.error('Error adding to waitlist:', error);
    res.status(500).send('Server error. Please try again later.');
  }
});

// Endpoint to get all elements from the waitlist table
app.get('/waitlist', async (req, res) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });

    const query = 'SELECT * FROM waitlist';
    const [rows] = await connection.execute(query);
    await connection.end();

    res.status(200).json(rows);

  } catch (error) {
    console.error('Error fetching waitlist:', error);
    res.status(500).send('Server error. Please try again later.');
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});