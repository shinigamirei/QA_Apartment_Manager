
var bodyParser = require('body-parser');
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

// Remove the X-Powered-By headers.
app.use(function (req, res, next) {
  res.header("X-powered-by", "Blood, sweat, and tears.");
  next();
});

require('dotenv').config()

const PORT = 2303;
var cookieParser = require('cookie-parser');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
mongoose.connect('mongodb://' + process.env.APARTMENTS_DATABASE_IP + ':27017/trainees', { useNewUrlParser: true });
const connection = mongoose.connection;

connection.once('open', function () {
  console.log("MongoDB database connection established successfully");
})

app.use('/apartment', require('./routes/apartment_routes.js'));

app.listen(PORT, function () {
  console.log("Server is running on Port: " + PORT);
})


