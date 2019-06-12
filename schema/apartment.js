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
});

