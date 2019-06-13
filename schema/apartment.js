const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

let ApartmentSchema = new Schema({
	        _id: 		{
					type: Schema.Types.ObjectId,
					required: true
				},
		Apartment_name:{
		    	     		type: String,
		    			required: true
		    		},
		Apartment_address:{
					type: String,
					required: true
				},
		Apartment_region:{
					type: String,
					enum: ['Manchester', 'Brighton', 'Leeds'],
					required: true
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
					//		type: String,
							type: Date,
							required:true
						},
						occupancy_end:{
					//		type: String,
							type: Date,
							required:true
						}
					})
				})

});

module.exports = mongoose.model('Apartment', ApartmentSchema);

//module.exports.createOccupancy = function(apartment_id, room_name, trainee_id, occupancy_start, occupancy_end){
//:	Apartment.updateOnce(
//		{_id: apartment_id}, 
//		{room_name_number: room_name}, 
//		{$push: 
//			{room_occupancies: 
//				{ trainee_id: trainee_id}, 
//				{occupancy_start: occupancy_start}, 
//				{occupancy_end: occupancy_end}
//			}
//		}
//	)
//}

		
