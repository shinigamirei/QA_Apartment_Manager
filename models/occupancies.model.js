const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

let OccupancySchema = new Schema({
    trainee_id: {
        type: String,
        required: true
    },
    occupancy_start: {
        //		type: String,
        type: Date,
        required: true
    },
    occupancy_end: {
        //		type: String,
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Occupancy', OccupancySchema);
