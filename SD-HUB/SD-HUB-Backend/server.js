import express from 'express';
import multer from 'multer';
import cors from 'cors';
import mysql from 'mysql2';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { createConnection } from 'mysql2';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import util from 'util';

// ✅ Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// New code added here
const app = express();
app.use(cors());
app.use(express.json());

// ✅ MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Change to your MySQL username
  password: '', // Change to your MySQL password
  database: 'attendance_system' // Change to your MySQL database name
});

db.connect(err => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL Database');
});

// ✅ Ensure 'uploads' folder exists
const uploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ✅ Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ✅ Upload Image API
app.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const category = req.body.category;
    const imageUrl = `/uploads/${req.file.filename}`;

    const sql = 'INSERT INTO gallery (category, image_url) VALUES (?, ?)';
    db.query(sql, [category, imageUrl], (err, result) => {
      if (err) {
        console.error('❌ MySQL Insert Error:', err);
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: '✅ Image uploaded successfully', imageUrl });
    });
  } catch (error) {
    console.error('❌ Upload Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Fetch Images API (Ordered by Category)
app.get('/images', (req, res) => {
  const sql = 'SELECT * FROM gallery ORDER BY category';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ✅ Fetch all images with category (Ordered by uploaded_at DESC)
app.get('/images', (req, res) => {
  const sql = 'SELECT * FROM gallery ORDER BY uploaded_at DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// ✅ Serve uploaded images
app.use('/uploads', express.static(uploadPath));

// ✅ Configure MySQL Database Connection
const dbConnection = createConnection({
  host: 'localhost',
  user: 'root', // Change this to your MySQL username
  password: '', // Change this to your MySQL password
  database: 'attendance_system' // Replace with your actual database name
});

dbConnection.connect(err => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1); // Stop server if DB connection fails
  }
  console.log('✅ Connected to MySQL Database');
});

const query = util.promisify(dbConnection.query).bind(dbConnection);

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, 'your_secret_key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user;
    next();
  });
};

// User Registration
app.post('/api/users', async (req, res) => {
  const { name, email, password, role, department, position, isActive } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required." });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert into users
    const result = await query(
      'INSERT INTO users (name, email, password, role, department, position, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, department, position, isActive]
    );
    const userId = result.insertId;

    // Add to trainers table if role is trainer
    if (role === 'trainer') {
      await query(
        'INSERT INTO trainers (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword]
      );
    }

    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: "Server error." });
  }
});

// Fetch single user
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  dbConnection.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error." });
    if (results.length === 0) return res.status(404).json({ message: "User not found." });
    res.json(results[0]);
  });
});

// Delete User
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  dbConnection.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User deleted successfully' });
  });
});

// Check-in
app.post('/api/attendance/check-in', (req, res) => {
  const { userId } = req.body;
  dbConnection.query('INSERT INTO attendance (userId, date, checkInTime, status) VALUES (?, CURDATE(), NOW(), "present")', [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Check-in successful' });
  });
});

// Check-out
app.post('/api/attendance/check-out', (req, res) => {
  const { userId } = req.body;
  dbConnection.query('UPDATE attendance SET checkOutTime = NOW() WHERE userId = ? AND date = CURDATE()', [userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Check-out successful' });
  });
});

// Fetch Attendance Records
app.get('/api/attendance', (req, res) => {
  dbConnection.query('SELECT * FROM attendance', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Generate Attendance Report
app.get('/api/attendance/report', (req, res) => {
  const { startDate, endDate } = req.query;
  dbConnection.query('SELECT * FROM attendance WHERE date BETWEEN ? AND ?', [startDate, endDate], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Dashboard Stats Route
app.get('/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    const [totalStaff] = await query('SELECT COUNT(*) AS count FROM users WHERE role = "staff"');
    const [totalTrainers] = await query('SELECT COUNT(*) AS count FROM users WHERE role = "trainer"');
    const [presentToday] = await query('SELECT COUNT(*) AS count FROM attendance WHERE date = CURDATE() AND status = "present"');
    const [absentToday] = await query('SELECT COUNT(*) AS count FROM attendance WHERE date = CURDATE() AND status = "absent"');

    res.json({
      totalStaff: totalStaff.count,
      totalTrainers: totalTrainers.count,
      presentToday: presentToday.count,
      absentToday: absentToday.count
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add Category
app.post('/add-category', (req, res) => {
  const { category } = req.body;

  if (!category) return res.status(400).json({ error: 'Category name is required' });

  const sql = 'INSERT INTO categories (name) VALUES (?)';
  db.query(sql, [category], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: 'Category added successfully!', category });
  });
});

// Fetch all categories
app.get('/categories', (req, res) => {
  const sql = 'SELECT * FROM categories';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json(results.map(row => row.name)); // Return only category names
  });
});

// Delete an image
app.delete('/delete-image/:id', (req, res) => {
  const imageId = req.params.id;
  const sql = 'DELETE FROM gallery WHERE id = ?';
  db.query(sql, [imageId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: 'Image deleted successfully!' });
  });
});

// Edit Image Category
app.put('/update-image/:id', (req, res) => {
  const imageId = req.params.id;
  const { category } = req.body;

  const sql = 'UPDATE gallery SET category = ? WHERE id = ?';
  db.query(sql, [category, imageId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: 'Image category updated successfully!' });
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
