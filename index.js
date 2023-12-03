const mysql = require('mysql2');
const multer = require('multer');
const express = require('express');
const cors = require('cors'); // Import the cors middleware


const app = express();
// app.use(cors()); // Enable CORS for all routes
app.use(cors({ origin: '*' }));


// middleware to parse JSON
app.use(express.json());



// Configure multer for file uploads
const storage = multer.memoryStorage(); // Use memory storage for storing file buffers
const upload = multer({ storage: storage });

// MySQL config
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

//get all pictures
app.get('/api/pictures', (req, res) => {
  console.log('in get')
  pool.query('SELECT * FROM pictures', (error, results, fields) => {
    if (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

//get pictures by patient id
app.get('/api/get-pictures/:patientId', (req, res) => {
  const patientId = req.params.patientId;
  console.log('in get by id id: '+patientId)

  pool.query('SELECT * FROM pictures WHERE patientEmail = ?', [patientId], (error, results, fields) => {
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch pictures from the database' });
    }

    res.json(results);
  });
});

// POST route for uploading a picture
const { format } = require('date-fns');
app.post('/api/upload-picture', upload.single('picture'), (req, res) => {
  // Ensure that req.file is defined before accessing its properties
  // console.log('Request Body:', req.body);
  // if (!req.file) {
  //   return res.status(400).json({ error: 'No file uploaded' });
  // }

  // const picture_data_base64 = req.file.buffer.toString('base64');
  const picture_data_base64 = req.body.picture_data_base64;
  const patientEmail = req.body.patientEmail;
  const doctorEmail = req.body.doctorEmail;
  const date = format(new Date(req.body.date), 'yyyy-MM-dd HH:mm:ss');
  console.log(req)
  console.log(req.body)

  // Perform the database insertion
  pool.query('INSERT INTO pictures (picture_data_base64, patientEmail, doctorEmail, date) VALUES (?, ?, ?, ?)', [picture_data_base64, patientEmail, doctorEmail, date], (error, results, fields) => {
    if (error) {
      console.log(error)
      return res.status(500).json({ error: 'Failed to insert picture into the database' });
    }

    res.json({ success: true });
  });
});


  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  
  
  app.get('/test-db-connection', (req, res) => {
    console.log('in test connection')
    pool.query('SELECT 1 + 1 AS result', (error, results, fields) => {
      if (error) {
        return res.status(500).json({ error: 'Database Error' });
      }
      
      
      res.json({ result: results[0].result });
    });
  });
  
  //cors config

  
  
  