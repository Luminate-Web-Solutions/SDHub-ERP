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
// Use express.json() instead of body-parser
app.use(express.json({ limit: '10mb' }));

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
  const [result] = await pool.query('INSERT INTO signin SET ?', req.body);
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
    const [rows] = await pool.query('SELECT * FROM signin WHERE email = ? AND password = ? AND role = ?', [email, password, role]);

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
    const validRoles = ['stakeholder', 'director', 'admin', 'trainer'];
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
    
    const query = 'UPDATE signin SET name = ?, course = ?, contactNumber = ?, email = ?, status = ? WHERE id = ?';
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
    
    const [result] = await pool.query('DELETE FROM signin WHERE id = ?', [id]);
    
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
  const [rows] = await pool.query('SELECT * FROM signin');
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

// app.get('/tStatus', async (req, res) => {
//   const [rows] = await pool.query('SELECT status, COUNT(*) as count FROM trainers GROUP BY status');
//   if (rows.length > 0) {
//     res.status(201).json(rows);
//   } else {
//     res.status(401).json({ message: 'No Data' });
//   }
// });

app.get('/students', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM students');
  res.status(200).json(rows);
});

// app.get('/trainers', async (req, res) => {
//   const [rows] = await pool.query('SELECT * FROM trainers');
//   res.status(200).json(rows);
// });

// New endpoints for trainer CRUD operations
// app.post('/trainers', async (req, res) => {
//   try {
//     const [result] = await pool.query('INSERT INTO trainers SET ?', req.body);
//     res.status(201).json({ id: result.insertId, ...req.body });
//   } catch (error) {
//     console.error('Error adding trainer:', error);
//     res.status(500).json({ error: 'Failed to add trainer' });
//   }
// });

// app.put('/trainers/:id', async (req, res) => {
//   try {
//     const id = req.params.id;
//     const [result] = await pool.query('UPDATE trainers SET ? WHERE id = ?', [req.body, id]);
    
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: 'Trainer not found' });
//     }
    
//     res.status(200).json({ id, ...req.body });
//   } catch (error) {
//     console.error('Error updating trainer:', error);
//     res.status(500).json({ error: 'Failed to update trainer' });
//   }
// });

// app.delete('/trainers/:id', async (req, res) => {
//   try {
//     const id = req.params.id;
//     const [result] = await pool.query('DELETE FROM trainers WHERE id = ?', [id]);
    
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: 'Trainer not found' });
//     }
    
//     res.status(200).json({ message: 'Trainer deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting trainer:', error);
//     res.status(500).json({ error: 'Failed to delete trainer' });
//   }
// });

app.get('/deans', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM deans');
  res.status(200).json(rows);
});

// Get all courses
app.get('/courses', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM courses');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Add new course
app.post('/courses', async (req, res) => {
  try {
    const courseData = {
      ...req.body,
      features: JSON.stringify(req.body.features) // Convert features array to JSON string
    };

    const [result] = await pool.query('INSERT INTO courses SET ?', [courseData]);
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ error: 'Failed to add course' });
  }
});

// Update course
app.put('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const courseData = {
      ...req.body,
      features: JSON.stringify(req.body.features)
    };

    const [result] = await pool.query('UPDATE courses SET ? WHERE id = ?', [courseData, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.status(200).json({ id, ...req.body });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Delete course
app.delete('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM courses WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

app.get('/aptitude', async (req, res) => {
  // Add ORDER BY to ensure consistent question order
  const [rows] = await pool.query('SELECT * FROM questions ORDER BY section, id');
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
    const { personalInfo, selected_answers, states, marksScored } = req.body;

    // Insert into test_results
    const [result] = await pool.query(
      'INSERT INTO test_results (email, fullName, gender, courseApplied, marksScored) VALUES (?, ?, ?, ?, ?)',
      [personalInfo.email, personalInfo.fullName, personalInfo.gender, personalInfo.courseApplied, marksScored]
    );

    const testResultId = result.insertId;

    // Insert into stored_results
    await pool.query(
      'INSERT INTO stored_results (test_result_id, selected_answers, states) VALUES (?, ?, ?)',
      [testResultId, selected_answers, states]
    );

    res.status(201).json({ message: 'Test submitted successfully' });
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ error: 'Failed to submit test' });
  }
});

app.get('/test-results', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, fullName, gender, courseApplied, marksScored FROM test_results');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({ error: 'Failed to fetch test results' });
  }
});

app.get('/evaluated-result/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT tr.*, sr.selected_answers, sr.states
      FROM test_results tr
      JOIN stored_results sr ON tr.id = sr.test_result_id
      WHERE tr.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Result not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching evaluated result:', error);
    res.status(500).json({ error: 'Failed to fetch evaluated result' });
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


// Attendance API endpoints
app.post('/attendance/check-in', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if it's Sunday
    const today = new Date();
    if (today.getDay() === 0) {
      return res.status(400).json({ message: 'Cannot check in on Sundays' });
    }

   

    // Create new attendance record
    const [result] = await pool.query(
      'INSERT INTO attendance (trainer_email, date, check_in_time, status) VALUES (?, CURDATE(), NOW(), "Present")',
      [email]
    );

    res.status(201).json({ message: 'Check-in successful' });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Failed to check in' });
  }
});

app.post('/attendance/check-out', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Get today's attendance record
    const [existing] = await pool.query(
      'SELECT * FROM attendance WHERE trainer_email = ? AND DATE(date) = CURDATE()',
      [email]
    );

    if (existing.length === 0) {
      return res.status(400).json({ message: 'No check-in record found for today' });
    }

    if (existing[0].check_out_time) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    // Update check-out time and calculate hours worked
    const [result] = await pool.query(
      `UPDATE attendance 
       SET check_out_time = NOW(),
           hours_worked = TIMESTAMPDIFF(HOUR, check_in_time, NOW()),
           status = CASE 
             WHEN TIMESTAMPDIFF(HOUR, check_in_time, NOW()) >= 2 THEN 'Present'
             WHEN TIMESTAMPDIFF(HOUR, check_in_time, NOW()) >= 1 THEN 'Half Day'
             ELSE 'Absent'
           END
       WHERE trainer_email = ? AND DATE(date) = CURDATE()`,
      [email]
    );

    res.status(200).json({ message: 'Check-out successful' });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Failed to check out' });
  }
});

app.post('/attendance/leave', async (req, res) => {
  try {
    const { email, reason } = req.body;
    
    // Check if already marked attendance today
    const [existing] = await pool.query(
      'SELECT * FROM attendance WHERE trainer_email = ? AND DATE(date) = CURDATE()',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already marked attendance today' });
    }

    // Create attendance record with leave status
    const [result] = await pool.query(
      `INSERT INTO attendance 
       (trainer_email, date, status, leave_reason) 
       VALUES (?, CURDATE(), 'Leave', ?)`,
      [email, reason]
    );

    res.status(201).json({ message: 'Leave recorded successfully' });
  } catch (error) {
    console.error('Leave request error:', error);
    res.status(500).json({ message: 'Failed to record leave' });
  }
});

app.get('/attendance/today/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const [records] = await pool.query(
      'SELECT * FROM attendance WHERE trainer_email = ? AND DATE(date) = CURDATE()',
      [email]
    );

    res.status(200).json(records[0] || null);
  } catch (error) {
    console.error('Error fetching today\'s attendance:', error);
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
});

app.get('/attendance/history', async (req, res) => {
  try {
    const { email, startDate, endDate } = req.query;
    
    let query = `
      SELECT 
        a.*,
        CASE 
          WHEN DAYOFWEEK(a.date) = 1 THEN 'Holiday'
          ELSE a.status 
        END as status
      FROM attendance a
      WHERE trainer_email = ?
    `;
    
    const params = [email];

    if (startDate && endDate) {
      query += ' AND date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY date DESC';

    const [records] = await pool.query(query, params);
    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching attendance history:', error);
    res.status(500).json({ message: 'Failed to fetch attendance history' });
  }
});

// Syllabus API endpoints
app.post('/syllabus', async (req, res) => {
  try {
    const { trainer_email, date, content, completion_status } = req.body;
    
    if (!trainer_email || !date || !content) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO syllabus (trainer_email, date, content, completion_status) VALUES (?, ?, ?, ?)',
      [trainer_email, date, content, completion_status]
    );
    
    res.status(201).json({ 
      id: result.insertId,
      trainer_email,
      date,
      content,
      completion_status
    });
  } catch (error) {
    console.error('Error adding syllabus entry:', error);
    res.status(500).json({ error: 'Failed to add syllabus entry' });
  }
});

app.get('/syllabus', async (req, res) => {
  try {
    const { email, startDate, endDate } = req.query;
    
    let query = 'SELECT * FROM syllabus WHERE trainer_email = ?';
    const params = [email];

    if (startDate && endDate) {
      query += ' AND date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY date DESC';

    const [rows] = await pool.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching syllabus entries:', error);
    res.status(500).json({ error: 'Failed to fetch syllabus entries' });
  }
});

app.put('/syllabus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, completion_status } = req.body;
    
    const [result] = await pool.query(
      'UPDATE syllabus SET content = ?, completion_status = ? WHERE id = ?',
      [content, completion_status, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Syllabus entry not found' });
    }
    
    res.status(200).json({ id, ...req.body });
  } catch (error) {
    console.error('Error updating syllabus entry:', error);
    res.status(500).json({ error: 'Failed to update syllabus entry' });
  }
});

app.delete('/syllabus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query('DELETE FROM syllabus WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Syllabus entry not found' });
    }
    
    res.status(200).json({ message: 'Syllabus entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting syllabus entry:', error);
    res.status(500).json({ error: 'Failed to delete syllabus entry' });
  }
});

app.get('/syllabus/completion', async (req, res) => {
  try {
    const { email, weekStart } = req.query;
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 5); // Monday to Friday

    const [rows] = await pool.query(
      'SELECT COUNT(*) as total FROM syllabus WHERE trainer_email = ? AND date BETWEEN ? AND ? AND completion_status = true',
      [email, weekStart, weekEnd]
    );

    const completionPercentage = (rows[0].total / 5) * 100;
    res.status(200).json(completionPercentage);
  } catch (error) {
    console.error('Error calculating weekly completion:', error);
    res.status(500).json({ error: 'Failed to calculate weekly completion' });
  }
});


// Trainer Stats Endpoint
app.get('/trainers/stats', async (req, res) => {
  try {
    // Get total trainers from user table
    const [total] = await pool.query(
      `SELECT COUNT(*) as total FROM user WHERE role = 'trainer'`
    );

    // Get today's attendance stats
    const [attendance] = await pool.query(`
      SELECT 
        u.email,
        SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) as absent
      FROM user u
      LEFT JOIN attendance a ON u.email = a.trainer_email 
        AND DATE(a.date) = CURDATE()
      WHERE u.role = 'trainer'
      GROUP BY u.email
    `);

    // Calculate totals
    const stats = {
      total: total[0].total,
      present: attendance.reduce((sum, item) => sum + item.present, 0),
      absent: attendance.reduce((sum, item) => sum + item.absent, 0)
    };

    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});


// Trainer Syllabus Progress
app.get('/syllabus/progress', async (req, res) => {
  try {
    const { trainerId, range } = req.query;
    let dateCondition = '';

    if (range === 'week') {
      dateCondition = 'AND date BETWEEN CURDATE() - INTERVAL 7 DAY AND CURDATE()';
    } else if (range === 'month') {
      dateCondition = 'AND date BETWEEN CURDATE() - INTERVAL 30 DAY AND CURDATE()';
    }

    const [progress] = await pool.query(`
      SELECT 
        t.name as trainer_name,
        (COUNT(CASE WHEN s.completion_status = 1 THEN 1 END) / COUNT(*)) * 100 as percentage
      FROM syllabus s
      JOIN trainers t ON s.trainer_email = t.email
      WHERE t.id = ? ${dateCondition}
      GROUP BY t.id
    `, [trainerId]);

    res.json(progress);
  } catch (error) {
    console.error('Progress error:', error);
    res.status(500).json({ error: 'Failed to load progress' });
  }
});


app.get('/user/trainers', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, course, contactNumber, currentBatch FROM user WHERE role = 'trainer'`
    );
    res.json(rows);
  } catch (error) {
    console.error('Trainers error:', error);
    res.status(500).json({ error: 'Failed to load trainers' });
  }
});

// New endpoints for trainer CRUD operations
app.post('/trainers', async (req, res) => {
  try {
    const { name, email, course, contactNumber, password, currentBatch, role, status } = req.body;

    if (!name || !email || !course || !contactNumber || !password || !currentBatch) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO user (name, email, course, contactNumber, password, currentBatch, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, course, contactNumber, password, currentBatch, role || 'trainer', status || 'active']
    );

    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error adding trainer:', error);
    res.status(500).json({ error: 'Failed to add trainer' });
  }
});

app.put('/trainers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, course, contactNumber, password, currentBatch, role, status } = req.body;

    if (!name || !email || !course || !contactNumber || !password || !currentBatch) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const [result] = await pool.query(
      'UPDATE user SET name = ?, email = ?, course = ?, contactNumber = ?, password = ?, currentBatch = ?, role = ?, status = ? WHERE id = ?',
      [name, email, course, contactNumber, password, currentBatch, role || 'trainer', status || 'active', id]
    );

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
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM user WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    res.status(200).json({ message: 'Trainer deleted successfully' });
  } catch (error) {
    console.error('Error deleting trainer:', error);
    res.status(500).json({ error: 'Failed to delete trainer' });
  }
});


// Expenditure Routes
app.get('/expenditures', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM expenditures');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching expenditures:', error);
    res.status(500).json({ error: 'Failed to fetch expenditures' });
  }
});

app.post('/expenditures', async (req, res) => {
  try {
    const { date, category, description, amount, paymentMode, status } = req.body;
    const [result] = await pool.query(
      'INSERT INTO expenditures (date, category, description, amount, paymentMode, status) VALUES (?, ?, ?, ?, ?, ?)',
      [date, category, description, amount, paymentMode, status]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error adding expenditure:', error);
    res.status(500).json({ error: 'Failed to add expenditure' });
  }
});

app.put('/expenditures/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, category, description, amount, paymentMode, status } = req.body;
    const [result] = await pool.query(
      'UPDATE expenditures SET date = ?, category = ?, description = ?, amount = ?, paymentMode = ?, status = ? WHERE id = ?',
      [date, category, description, amount, paymentMode, status, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Expenditure not found' });
    }
    res.status(200).json({ id, ...req.body });
  } catch (error) {
    console.error('Error updating expenditure:', error);
    res.status(500).json({ error: 'Failed to update expenditure' });
  }
});

app.delete('/expenditures/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM expenditures WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Expenditure not found' });
    }
    res.status(200).json({ message: 'Expenditure deleted successfully' });
  } catch (error) {
    console.error('Error deleting expenditure:', error);
    res.status(500).json({ error: 'Failed to delete expenditure' });
  }
});



// Staff Payroll Routes
app.get('/payroll', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM payroll');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching payroll data:', error);
    res.status(500).json({ error: 'Failed to fetch payroll data' });
  }
});

app.post('/payroll', async (req, res) => {
  try {
    const { employeeName, designation, basicSalary, allowances, deductions, netSalary, paymentStatus, paymentDate } = req.body;
    const [result] = await pool.query(
      'INSERT INTO payroll (employeeName, designation, basicSalary, allowances, deductions, netSalary, paymentStatus, paymentDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [employeeName, designation, basicSalary, allowances, deductions, netSalary, paymentStatus, paymentDate]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error adding payroll entry:', error);
    res.status(500).json({ error: 'Failed to add payroll entry' });
  }
});

app.put('/payroll/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeName, designation, basicSalary, allowances, deductions, netSalary, paymentStatus, paymentDate } = req.body;
    const [result] = await pool.query(
      'UPDATE payroll SET employeeName = ?, designation = ?, basicSalary = ?, allowances = ?, deductions = ?, netSalary = ?, paymentStatus = ?, paymentDate = ? WHERE id = ?',
      [employeeName, designation, basicSalary, allowances, deductions, netSalary, paymentStatus, paymentDate, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Payroll entry not found' });
    }
    res.status(200).json({ id, ...req.body });
  } catch (error) {
    console.error('Error updating payroll entry:', error);
    res.status(500).json({ error: 'Failed to update payroll entry' });
  }
});

app.delete('/payroll/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM payroll WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Payroll entry not found' });
    }
    res.status(200).json({ message: 'Payroll entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting payroll entry:', error);
    res.status(500).json({ error: 'Failed to delete payroll entry' });
  }
});


app.get('/jobs', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM jobs ORDER BY date_added DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.post('/jobs', async (req, res) => {
  try {
    const { student_name, courses_enrolled, job_type, designation, salary } = req.body;
    const [result] = await pool.query(
      'INSERT INTO jobs (student_name, courses_enrolled, job_type, designation, salary, date_added) VALUES (?, ?, ?, ?, ?, NOW())',
      [student_name, courses_enrolled, job_type, designation, salary]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error adding job:', error);
    res.status(500).json({ error: 'Failed to add job' });
  }
});

app.put('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { student_name, courses_enrolled, job_type, designation, salary } = req.body;
    const [result] = await pool.query(
      'UPDATE jobs SET student_name = ?, courses_enrolled = ?, job_type = ?, designation = ?, salary = ? WHERE id = ?',
      [student_name, courses_enrolled, job_type, designation, salary, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.status(200).json({ id, ...req.body });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

app.delete('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM jobs WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// Profile endpoints
// Get all profiles
app.get('/profiles', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM profiles');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// Get profile by ID
app.get('/profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM profiles WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Create a new profile
app.post('/profiles', async (req, res) => {
  try {
    const { name, role, email, login_id, registered_date, date_of_birth, phone_number } = req.body;
    const [result] = await pool.query('INSERT INTO profiles SET ?', {
      name,
      role,
      email,
      login_id,
      registered_date,
      date_of_birth,
      phone_number
    });
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// Update a profile
app.put('/profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, email, login_id, registered_date, date_of_birth, phone_number } = req.body;
    const [result] = await pool.query('UPDATE profiles SET ? WHERE id = ?', [
      { name, role, email, login_id, registered_date, date_of_birth, phone_number },
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json({ id, ...req.body });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Delete a profile
app.delete('/profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM profiles WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});