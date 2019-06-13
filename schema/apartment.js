const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

let Apartment = new Schema({
		Apartment_name:{
		    	     		type: String,
		    			required: true
		    		},
		Apartment_address:{
					type: String,
					requred: true
				},
		Apartment_region:{
					type: String,
					enum: ['Manchester', 'Brighton', 'Leeds']
					requred: true
				},
		Apartment_rooms: new Schema({
					room_name_number: {
						type: String,
						required: true
					},
					room_occupancies: new Schema({
						trainee_id:{
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
						}
					})
				})

});

