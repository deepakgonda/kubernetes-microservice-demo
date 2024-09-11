const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs-extra');

const userRoutes = require('./routes/user-routes');

const app = express();

app.use(bodyParser.json());


// Use the cors package
app.use(cors({
  origin: '*', // Allow requests from this origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow these methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
}));

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//   next();
// });

app.use(userRoutes);

app.use((err, req, res, next) => {
  let code = 500;
  let message = 'Something went wrong.';
  if (err.code) {
    code = err.code;
  }

  if (err.message) {
    message = err.message;
  }
  res.status(code).json({ message: message });
});


// Start the Express server even if MongoDB connection fails
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});


const mongoURI = process.env.MONGODB_CONNECTION_URI;
console.log('mongoURI:', mongoURI);

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });



