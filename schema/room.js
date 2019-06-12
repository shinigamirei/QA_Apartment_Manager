const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

let Room = new Schema({
    room_name_number: {
        type: String,
        required: true
    },
    apartment_id: {
        type: String,
        required: true
    }
})

