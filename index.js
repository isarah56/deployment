const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const cors = require('cors');
app.use(cors());
app.use(express.json());


// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Optional: handle root URL to send index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


const fs = require('fs');
const DB_FILE = path.join(__dirname, 'students.json');

// Helper: read data from file
function readStudents() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Helper: write data to file
function writeStudents(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Create student
app.post('/students', (req, res) => {
  const student = req.body;
  if (!student.student_id || !student.full_name || !student.department || !student.email || !student.level || !student.status) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const students = readStudents();
  student.id = Date.now().toString(); // unique ID
  students.push(student);
  writeStudents(students);

  res.status(201).json({ message: 'Student registered' });
});

// Get all students (optionally filtered)
app.get('/students', (req, res) => {
  const { department } = req.query;
  let students = readStudents();
  if (department) {
    students = students.filter(s => s.department.toLowerCase().includes(department.toLowerCase()));
  }
  res.json(students);
});

// Get single student
app.get('/students/:id', (req, res) => {
  const students = readStudents();
  const student = students.find(s => s.id === req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

// Update student
app.put('/students/:id', (req, res) => {
  const students = readStudents();
  const index = students.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Student not found' });

  students[index] = { ...students[index], ...req.body };
  writeStudents(students);
  res.json({ message: 'Student updated' });
});

