import express from 'express';
import multer from 'multer';
import cors from 'cors';
import mysql from 'mysql2';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

// ✅ Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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