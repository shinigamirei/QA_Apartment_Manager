const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
let OccupancySchema = require('./occupancies.model');
let IssueSchema = require('./issues.model')

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
//        enum: ['Manchester', 'Brighton', 'Leeds', 'London'],
        required: true
    }
    apartment_rooms: {
		type: String,
		required:true
	},
    room_occupancies: [OccupancySchema.schema],
	apartment_image:{
		type:String
    },
    apartment_info: {
		type: String,
		required:false
    },
    apartment_issues: [IssueSchema.schema],
    room_occupancies_archive: [OccupancySchema.schema],
    apartment_issues_archive: [IssueSchema.schema],
    status:{
        type: String,
        required: true,
        default: "Active"
    },
    apartment_rent:{
        type: Number
    },
    apartment_bills:{
        type: Number 
    },
    landlord_contact:{
        type: String
    },
	apartment_availability:{
		type: Date
	}
});

module.exports = mongoose.model('Apartment', ApartmentSchema);
