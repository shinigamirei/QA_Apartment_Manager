const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let OccupancySchema = require('../models/occupancies.model');

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
    apartment_rooms: [new Schema({

        room_name_number: {
            type: String,
            required: true
        },
        room_occupancies: [OccupancySchema.schema]
    })]
});

module.exports = mongoose.model('Apartment', ApartmentSchema);

var Apartments = module.exports = mongoose.model('Apartment', ApartmentSchema);

module.exports.createOccupancy = function (apartment_id, room_name, trainee_id, occupancy_start, occupancy_end) {
    Apartments.update(
        {
            $and: [
                { '_id': apartment_id },
                { 'Apartment_rooms.room_name_number': room_name }
            ]
        },
        {
            "$push":
            {
                "Apartment_rooms.$.room_occupancies":
                {
                    "trainee_id": trainee_id,
                    "occupancy_start": occupancy_start,
                    "occupancy_end": occupancy_end
                }
            }
        }
    )
}