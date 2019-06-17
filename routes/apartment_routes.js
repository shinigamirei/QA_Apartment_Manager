var express = require('express');
var apartmentRoutes = express.Router();
var async = require("async");
var request = require('request');
let Apartment = require('../models/apartment.model');
require('dotenv').config()
var moment = require('moment');

apartmentRoutes.route('/getAll/').get(function (req, res) {
    console.log('Looked up all apartments');
    Apartment.find(function (err, apartment) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(apartment);
            res.json(apartment);
            console.log('Returned all apartments');
        }
    });
});

apartmentRoutes.route('/getById/:id').get(function (req, res) {
    let id = req.params.id;
    console.log('Looked up apartment by id ' + id);
    Apartment.findById(id, function (err, apartment) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(apartment);
            res.json(apartment);
            console.log('Returned an apartment');
        }
    });
});

apartmentRoutes.route('/create/').post(function (req, res) {
    console.log('Attempting to create an apartment');
    console.log(req.body);
    let apartment = new Apartment(req.body);
    apartment.save().then(apartment => {
        res.status(200).send(apartment._id);
        console.log('Added an apartment ' + apartment._id);
    }).catch(err => {
        res.status(205).send('Adding an apartment did not work');
        console.log(err);
    });
});

apartmentRoutes.route('/delete/:id').delete(function (req, res) {
    let id = req.params.id;
    console.log('Attempting to delete an apartment by id ' + id);
    Apartment.deleteOne(Apartment.findById(id), function (err, apartment) {
        if (err) {
            console.log(err);
        }
        else {
            res.status(200).send('Apartment ' + id + ' deleted');
            console.log('Apartment deleted');
        }
    });
});

apartmentRoutes.route('/addRoom/').post(function (req, res) {
    console.log('Adding room ' + req.body.room_name_number + ' to apartment ' + req.body._id);
    Apartment.findById(req.body._id, function (err, apartment) {
        if (err) {
            console.log(err);
        }
        else {
            apartment.apartment_rooms.push({ "room_name_number": req.body.room_name_number });
            apartment.save();
            res.status(200).send('Room added');
        }
    });
});

apartmentRoutes.route('/deleteRoom/').delete(function (req, res) {
    console.log('Removing room ' + req.body.room_name_number + ' from apartment ' + req.body._id);
    Apartment.findById(req.body._id, function (err, apartment) {
        if (err) {
            console.log(err);
        }
        else {
            for (var i = 0; i < apartment.apartment_rooms.length; i++) {
                if (apartment.apartment_rooms[i].room_name_number === req.body.room_name_number) {
                    apartment.apartment_rooms.splice(i, 1);
                    apartment.save();
                    res.status(200).send('Room removed');
                }
            }
            //res.status(205).send('No such room');
        }
    });
});

apartmentRoutes.route('/addOccupancy/').post(function (req, res) {
    console.log('Adding accupancy to room ' + req.body.room_name_number + ' in apartment ' + req.body._id);
    Apartment.findById(req.body._id, function (err, apartment) {
        if (err) {
            console.log(err);
        }
        else {
            for (var i = 0; i < apartment.apartment_rooms.length; i++) {
                if (apartment.apartment_rooms[i].room_name_number === req.body.room_name_number) {
                    apartment.apartment_rooms[i].room_occupancies = { "trainee_id": req.body.trainee_id, "occupancy_start": moment(), "occupancy_end": moment() }
                    apartment.save();
                    res.status(200).send('Occupancy added');
                }
            }
        }
    });
});

apartmentRoutes.route('/deleteOccupancy/').delete(function (req, res) {
    console.log('Removing accupancy ' + req.body.trainee_id + ' from room ' + req.body.room_name_number + ' in apartment ' + req.body._id);
    Apartment.findById(req.body._id, function (err, apartment) {
        if (err) {
            console.log(err);
        }
        else {
            for (var i = 0; i < apartment.apartment_rooms.length; i++) {
                if (apartment.apartment_rooms[i].room_name_number === req.body.room_name_number) {
                    for (var j = 0; j < apartment.apartment_rooms[i].room_occupancies.length; j++) {
                        if (apartment.apartment_rooms[i].room_occupancies[j].trainee_id === req.body.trainee_id) {
                            apartment.apartment_rooms[i].room_occupancies.splice(j, 1);
                            apartment.save();
                            res.status(200).send('Occupancy removed');
                        }
                    }
                }
            }
        }
    });
});

apartmentRoutes.route('/getFromDate/:year/:month/:day').get(function (req, res) {
   let year=req.params.year;
   let month=req.params.month;
   let day=req.params.day;
//	let response="";
   let checkdate=new Date(year, month, day);
	var apartList= function(callback){
		Apartment.find().exec(function(err, aparts){
//			aparts.reverse();
			callback (err,aparts);
		})
	}
	res.write(checkdate+"\n");
   console.log(checkdate);
//	apartList(function (err, aparts) {
Apartment.find(function(err, aparts){
	if (err) {
      console.log(err);
     }
      else 
 {
	 console.log(aparts.length);
	 aparts.map(function(currentApartment, i){
	//	console.log(currentApartment);
	        console.log(currentApartment.apartment_address+", "+currentApartment.apartment_region);
		res.write(currentApartment.apartment_address+", "+currentApartment.apartment_region+"\n");
		 for (var j=0; j<currentApartment.apartment_rooms.length;j++) {
		 	for (var k=0; k<currentApartment.apartment_rooms[j].room_occupancies.length; k++){
				console.log(currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start);
				console.log(currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end);
				if (currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start <= checkdate && currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end >= checkdate){
					console.log(currentApartment.apartment_rooms[j].room_occupancies[k]);
			                res.write(currentApartment.apartment_rooms[j].room_occupancies[k].toString()+"\n");
				}
			}
		 }
	 });
   }  
	});
});

module.exports = apartmentRoutes;
