const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

let Occupancy = new Schema({
    trainee_id: {
        type: String,
        required: true
    },
    apartment_id: {
        type: String,
        required: true
    },
	occupancy_start:{
        type: String,
        format: Date
    },
	occupancy_end:{
        type: String,
        format: Date
    },
})


