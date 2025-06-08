// ------------------ Dependencies ------------------
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const SECRET_KEY = "zomato_clone_secret_key"; // Store in .env in production

// ------------------ Middleware ------------------
app.use(cors());
app.use(bodyParser.json());

// ------------------ MySQL Connection ------------------
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12ka4@raj',
  database: 'jtgeatslogin',
  port: 3307
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL database.");
});

// ------------------ API Routes ------------------

// 📝 Signup Route
app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;

  console.log("📩 Signup request received:", { name, email });

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error("❌ DB error during email check:", err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length > 0) {
      console.log("⛔ Email already registered");
      return res.status(409).json({ message: 'Email already registered' });
    }

    db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, password],
      (err) => {
        if (err) {
          console.error("❌ Error inserting user:", err);
          return res.status(500).json({ message: 'Registration failed' });
        }

        console.log("✅ User inserted successfully.");
        res.status(201).json({ message: 'Signup successful' });
      }
    );
  });
});

// 🔐 Login Route
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    if (results.length === 0) {
      return res.status(401).json({ message: 'Email not found' });
    }

    const user = results[0];

    if (user.password !== password) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name
      },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  });
});

// 🛒 Order Route
app.post('/api/orders', (req, res) => {
  console.log("🛒 Incoming Order:", req.body);
  const { userId, items, totalPrice, address } = req.body;

  if (
    typeof userId !== 'number' ||
    !Array.isArray(items) || items.length === 0 ||
    typeof totalPrice !== 'number' || totalPrice <= 0 ||
    typeof address !== 'string' || address.trim() === ''
  ) {
    console.warn("❌ Missing or invalid fields:", { userId, items, totalPrice, address });
    return res.status(400).json({ message: "Missing fields in request" });
  }

  const query = 'INSERT INTO orders (user_id, items, total_price, address) VALUES (?, ?, ?, ?)';
  db.query(query, [userId, JSON.stringify(items), totalPrice, address], (err, result) => {
    if (err) {
      console.error("❌ Error saving order:", err);
      return res.status(500).json({ message: "Error saving order" });
    }
    res.status(201).json({ message: "Order placed successfully", orderId: result.insertId });
  });
});


// ------------------ Start Server ------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
