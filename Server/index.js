require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const recruiterRoutes = require('./Routes/Recruiter');
const mongoose = require('mongoose');

// Connect to DB before starting server
;

const app = express();
const PORT = process.env.PORT || 5040;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Server!');
});

// Routes
app.use('/api/recruiter', recruiterRoutes);

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });