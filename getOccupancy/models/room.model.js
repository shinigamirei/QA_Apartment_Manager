const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let OccupancySchema = require('../models/occupancies.model');

let RoomSchema = new Schema({
    room_name_number: {
        type: String,
        required: true
    },
    room_occupancies: [OccupancySchema.schema]
})

module.exports = mongoose.model('Room', RoomSchema);
