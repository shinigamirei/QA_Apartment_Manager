const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let RoomSchema = require('../models/room.model');

let ApartmentSchema = new Schema({
    apartment_name: {
        type: String,
        required: true
    },
    apartment_address: {
        type: String,
        required: true
    },
    apartment_region: {
        type: String,
        enum: ['Manchester', 'Brighton', 'Leeds'],
        required: true
    },
    apartment_rooms: [RoomSchema.schema]
});

module.exports = mongoose.model('Apartment', ApartmentSchema);
