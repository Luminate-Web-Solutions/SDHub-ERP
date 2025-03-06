import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sd-hub'
};

const pool = mysql.createPool(dbConfig);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: 'mohdyousuf9059@gmail.com',
    pass: ''
  }
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('Received message:', message);

    const pythonPath = 'python'; // or 'python3' depending on your system
    const scriptPath = path.join(__dirname, 'app.py');

    console.log('Executing Python script:', scriptPath);

    const pythonProcess = spawn(pythonPath, [
      scriptPath,
      '--message',
      message
    ]);

    let responseData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      console.log('Python stdout:', data.toString());
      responseData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Python stderr:', data.toString());
      errorData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      console.log('Python process exited with code:', code);

      if (code !== 0) {
        console.error('Python error output:', errorData);
        return res.status(500).json({
          error: 'Chatbot process failed',
          details: errorData
        });
      }

      if (responseData.trim()) {
        res.json({ response: responseData.trim() });
      } else {
        res.status(500).json({
          error: 'No response from chatbot',
          details: errorData || 'No error details available'
        });
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});


function generateUniqueId() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

app.get('/generate-unique-id', async (req, res) => {
  let uniqueId;
  let isUnique = false;

  while (!isUnique) {
    uniqueId = generateUniqueId();
    const [rows] = await pool.query('SELECT * FROM students WHERE uniqueId = ?', [uniqueId]);
    if (rows.length === 0) {
      isUnique = true;
    }
  }

  res.json({ uniqueId });
});

app.post('/addstudents', async (req, res) => {
  console.log(req.body);
  // When a student submits registration form, set status to TBD
  req.body.status = 'TBD';
  const [result] = await pool.query('INSERT INTO students SET ?', req.body);
  
  // Also update the user status if the email exists
  if (req.body.email) {
    await pool.query('UPDATE user SET status = ? WHERE email = ? AND role = ?', ['TBD', req.body.email, 'student']);
  }
  
  console.log(result);
  res.status(201).json(result);
});

app.post('/signup', async (req, res) => {
  console.log(req.body);
  // Set default status to pending for new signups
  if (req.body.role === 'student' || !req.body.role) {
    req.body.role = 'student';
    req.body.status = 'pending';
  }
  const [result] = await pool.query('INSERT INTO user SET ?', req.body);
  console.log(result);
  res.status(200).json(result);
});

app.post('/approve', async (req, res) => {
  console.log(req.body);
  const [result] = await pool.query('UPDATE user SET status = ? WHERE email = ?', ['active', req.body.email]);
  console.log('Updated documents =>', result);
  res.status(200).json(result);
});

app.post('/signin', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM user WHERE email = ? AND password = ? AND role = ?', [email, password, role]);

    if (rows.length > 0) {
      const user = rows[0];
      
      // Check user status for students only
      if (role === 'student') {
        if (user.status === 'pending') {
          return res.status(403).json({ message: 'Your account is pending activation. Please contact the Admin.' });
        }
        
        if (user.status === 'TBD') {
          return res.status(403).json({ message: 'Your registration is under review. Please wait for approval.' });
        }
        
        if (user.status !== 'active') {
          return res.status(403).json({ message: 'Your account is not active. Please contact the Admin.' });
        }
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, status: user.status },
        SECRET_KEY,
        { expiresIn: '1h' }
      );

      res.status(200).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status
        },
        message: `${role.charAt(0).toUpperCase() + role.slice(1)} sign-in successful!`
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Sign-in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    // Validate role
    const validRoles = ['stakeholder', 'director', 'adminstaff', 'trainer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Corrected table name to 'user'
    const [rows] = await pool.query(
      'SELECT * FROM user WHERE email = ? AND password = ? AND role = ?',
      [email, password, role]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    
    // Check account status
    if (user.status !== 'active') {
      return res.status(403).json({ 
        message: 'Account is not active. Please contact administrator.' 
      });
    }

    // Map adminstaff to admin role for frontend
    const frontendRole = user.role === 'adminstaff' ? 'admin' : user.role;

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: frontendRole 
      },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: frontendRole,
        name: user.name
      },
      message: 'Sign-in successful'
    });

  } catch (error) {
    console.error('Sign-in error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/users', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM students');
  res.status(200).json(rows);
});

app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, course, contactNumber, email, status } = req.body;
    
    if (!name || !course || !contactNumber || !email || !status) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const query = 'UPDATE user SET name = ?, course = ?, contactNumber = ?, email = ?, status = ? WHERE id = ?';
    const [result] = await pool.query(query, [name, course, contactNumber, email, status, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ id, ...req.body });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM user WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.get('/signupusers', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM user');
  res.status(200).json(rows);
});

app.get('/gettech', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM trainers');
  res.status(200).json(rows);
});

app.get('/studentsStatus', async (req, res) => {
  const [rows] = await pool.query('SELECT status, COUNT(*) as count FROM students GROUP BY status');
  if (rows.length > 0) {
    res.status(201).json(rows);
  } else {
    res.status(401).json({ message: 'No Data' });
  }
});

app.get('/tStatus', async (req, res) => {
  const [rows] = await pool.query('SELECT status, COUNT(*) as count FROM trainers GROUP BY status');
  if (rows.length > 0) {
    res.status(201).json(rows);
  } else {
    res.status(401).json({ message: 'No Data' });
  }
});

app.get('/students', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM students');
  res.status(200).json(rows);
});

app.get('/trainers', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM trainers');
  res.status(200).json(rows);
});

// New endpoints for trainer CRUD operations
app.post('/trainers', async (req, res) => {
  try {
    const [result] = await pool.query('INSERT INTO trainers SET ?', req.body);
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error adding trainer:', error);
    res.status(500).json({ error: 'Failed to add trainer' });
  }
});

app.put('/trainers/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await pool.query('UPDATE trainers SET ? WHERE id = ?', [req.body, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Trainer not found' });
    }
    
    res.status(200).json({ id, ...req.body });
  } catch (error) {
    console.error('Error updating trainer:', error);
    res.status(500).json({ error: 'Failed to update trainer' });
  }
});

app.delete('/trainers/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [result] = await pool.query('DELETE FROM trainers WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Trainer not found' });
    }
    
    res.status(200).json({ message: 'Trainer deleted successfully' });
  } catch (error) {
    console.error('Error deleting trainer:', error);
    res.status(500).json({ error: 'Failed to delete trainer' });
  }
});

app.get('/deans', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM deans');
  res.status(200).json(rows);
});

app.get('/courses', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM courses');
  res.status(200).json(rows);
});

app.get('/aptitude', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM questions');
  res.status(200).json(rows);
});

// News API endpoints
app.get('/news', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM news ORDER BY created_at DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

app.post('/news', async (req, res) => {
  try {
    const { title, description, date, image } = req.body;
    
    if (!title || !description || !date) {
      return res.status(400).json({ error: 'Title, description, and date are required' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO news (title, description, date, image) VALUES (?, ?, ?, ?)',
      [title, description, date, image]
    );
    
    res.status(201).json({ 
      id: result.insertId,
      title,
      description,
      date,
      image
    });
  } catch (error) {
    console.error('Error adding news:', error);
    res.status(500).json({ error: 'Failed to add news' });
  }
});

app.put('/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, image } = req.body;
    
    if (!title || !description || !date) {
      return res.status(400).json({ error: 'Title, description, and date are required' });
    }
    
    const [result] = await pool.query(
      'UPDATE news SET title = ?, description = ?, date = ?, image = ? WHERE id = ?',
      [title, description, date, image, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'News not found' });
    }
    
    res.status(200).json({
      id: parseInt(id),
      title,
      description,
      date,
      image
    });
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ error: 'Failed to update news' });
  }
});

app.delete('/news/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM news WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'News not found' });
    }
    
    res.status(200).json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ error: 'Failed to delete news' });
  }
});

app.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const connection = await pool.getConnection();
    
    // Insert into database
    await connection.query(
      'INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)',
      [name, email, phone, message]
    );
    
    connection.release();

    // Send email
    const mailOptions = {
      from: 'mohdyousuf@gmail.com',
      to: 'mohdyousuf9059@gmail.com',
      subject: 'New Contact Form Submission',
      text: `
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Message: ${message}
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Contact form submitted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

app.post('/submit-test', async (req, res) => {
  try {
    const testData = req.body;
    const [result] = await pool.query(
      'INSERT INTO test_results (email, fullName, gender, courseApplied, marksScored) VALUES (?, ?, ?, ?, ?)',
      [testData.email, testData.fullName, testData.gender, testData.courseApplied, testData.marksScored]
    );

    const testResultId = result.insertId;
    const selectedAnswers = Object.values(testData.answers).join(',');
    const states = testData.states.join(',');

    await pool.query(
      'INSERT INTO stored_results (test_result_id, selected_answer, states) VALUES (?, ?, ?)',
      [testResultId, selectedAnswers, states]
    );

    res.status(201).json({ message: 'Test submitted successfully' });
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ error: 'Failed to submit test' });
  }
});

// Get test results
app.get('/test-results', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT email, fullName, gender, courseApplied, marksScored FROM test_results');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({ error: 'Failed to fetch test results' });
  }
});

app.put('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { uniqueId, firstName, lastName, applicationDate, course, email } = req.body;
    
    if (!uniqueId || !firstName || !lastName || !applicationDate || !course || !email) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const query = 'UPDATE students SET uniqueId = ?, firstName = ?, lastName = ?, applicationDate = ?, course = ?, email = ? WHERE id = ?';
    const [result] = await pool.query(query, [uniqueId, firstName, lastName, applicationDate, course, email, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({ id, ...req.body });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

app.delete('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM students WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

app.get('/test-results-with-answers', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT tr.*, sr.selected_answer, sr.states
      FROM test_results tr
      JOIN stored_results sr ON tr.id = sr.test_result_id
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching test results with answers:', error);
    res.status(500).json({ error: 'Failed to fetch test results with answers' });
  }
});


// Add this new endpoint for forgot password
app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email exists in database
    const [users] = await pool.query('SELECT * FROM user WHERE email = ? AND role = ?', [email, 'student']);

    if (users.length === 0) {
      return res.status(404).json({ message: 'No student account found with this email' });
    }

    const user = users[0];

    // Send password to email
    const mailOptions = {
      from: 'mohdyousuf9059@gmail.com',
      to: email,
      subject: 'Your Password Recovery - Skills Development Hub',
      html: `
        <h2>Password Recovery</h2>
        <p>Dear Student,</p>
        <p>As requested, here is your password for your Skills Development Hub account:</p>
        <p><strong>Password: ${user.password}</strong></p>
        <p>If you did not request this password recovery, please contact us immediately.</p>
        <br>
        <p>Best regards,</p>
        <p>Skills Development Hub Team</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password has been sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process password recovery request' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});