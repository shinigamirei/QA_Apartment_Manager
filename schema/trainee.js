const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

let Trainee = new Schema({
    trainee_fname: {
        type: String,
        required: true
    },
    trainee_lname: {
        type: String,
        required: true
    },
    trainee_email: {
        type: String,
        required: true,
        unique: true
    },
    trainee_password: {
        type: String,
        required: true
    },
    trainee_password_token:{
        type: String
    },
    trainee_password_expires:{
        type: String,
        format: Date
    },
})

