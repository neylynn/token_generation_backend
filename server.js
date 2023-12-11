const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

const pool = mysql.createPool({
  connectionLimit: 10,
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'token-generation',
});

app.post('/generate-token', (req, res) => {
  const { name, phoneNumber, companyName, designation } = req.body;

  if (!name || !phoneNumber || !companyName || !designation) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const token = generateToken();

  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting MySQL connection:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const insertQuery = 'INSERT INTO users (name, phone_number, company_name, designation, token) VALUES (?, ?, ?, ?, ?)';
    const values = [name, phoneNumber, companyName, designation, token];

    connection.query(insertQuery, values, (error, results) => {
      connection.release();

      if (error) {
        console.error('Error inserting data into the database:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.json({ token });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

function generateToken() {
  const digits = '0123456789';
  let token = '';
  for (let i = 0; i < 6; i++) {
    const randomDigit = digits[Math.floor(Math.random() * 10)];
    token += randomDigit;
  }
  return token;
}
