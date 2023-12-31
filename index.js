const mysql = require('mysql2');
const multer = require('multer');
const express = require('express');
const cors = require('cors');
const { format } = require('date-fns');


const app = express();
app.use(cors({ origin: '*' }));


app.use(express.json());


const storage = multer.memoryStorage();

const upload = multer({ storage: storage });
const replace = multer({ storage: storage });

// MySQL config
const pool = mysql.createPool({
  // host: 'localhost', //fungerar när node inte va i container
  host: 'vm.cloud.cbh.kth.se',// namn på db service
  port: 2528,
  user: 'admin',
  password: 'admin',
  database: 'db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});




//get all pictures only for testing
app.get('/api/pictures', (req, res) => {
  console.log('in get')
  pool.query('SELECT * FROM pictures', (error, results, fields) => {
    if (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

//Get pictures by patient email
app.get('/api/get-pictures/:patientEmail', (req, res) => {
  const patientEmail = req.params.patientEmail;
  pool.query('SELECT * FROM pictures WHERE patientEmail = ?', [patientEmail], (error, results, fields) => {
    if (error) {
      console.trace(error);
      return res.status(500).json({ error: 'Failed to fetch pictures from the database' });
    }

    res.json(results);
  });
});

// POST 
app.post('/api/upload-picture', upload.single('picture'), (req, res) => {
  console.log("in upload")
  const picture_data_base64 = req.body.picture_data_base64;
  const patientEmail = req.body.patientEmail;
  const doctorEmail = req.body.doctorEmail;
  const date = format(new Date(req.body.date), 'yyyy-MM-dd HH:mm:ss');
  console.log({ picture_data_base64: req.body.picture_data_base64 ? " image exist" : "not image" })



  pool.query('INSERT INTO pictures (picture_data_base64, patientEmail, doctorEmail, date) VALUES (?, ?, ?, ?)', [picture_data_base64, patientEmail, doctorEmail, date], (error, results, fields) => {
    if (error) {
      return res.status(500).json({ error: 'Failed to insert picture into the database' });
    }

    res.json({ success: true });
  });
});

//POST REPLACE
app.post('/api/replace-picture', replace.single('picture'), (req, res) => {
  const id = req.body.id;
  const picture_data_base64 = req.body.picture_data_base64;
  const patientEmail = req.body.patientEmail;
  const doctorEmail = req.body.doctorEmail;
  const date = format(new Date(req.body.date), 'yyyy-MM-dd HH:mm:ss');

  pool.query('UPDATE db.pictures SET picture_data_base64 = ?, patientEmail = ?, doctorEmail = ?, date = ? WHERE id = ?',
    [picture_data_base64, patientEmail, doctorEmail, date, id],
    (error, results, fields) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: 'Failed to update picture in the database' });
      }

      res.json({ success: true });
    }
  );
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


app.get('/test-db-connection', (req, res) => {
  console.log('in test connection')
  pool.query('SELECT 1 + 1 AS result', (error, results, fields) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Database Error' });
    }


    res.json({ result: results[0].result });
  });
});




