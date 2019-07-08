var express = require('express');
var apartmentRoutes = express.Router();
var async = require("async");
var request = require('request');
let Apartment = require('../models/apartment.model');
let Occupancies = require('../models/occupancies.model');
let Room = require('../models/room.model');
require('dotenv').config();
var moment = require('moment');

apartmentRoutes.route('/addOccupancy/').post(function (req, res) {
    console.log('Adding occupancy to room ' + req.body.room_name_number + ' in apartment ' + req.body._id);
    let startDate = new Date(req.body.syear, req.body.smonth, req.body.sday)
    let endDate = new Date(req.body.eyear, req.body.emonth, req.body.eday)
    console.log('Start date: ' + startDate);
    console.log('End date: ' + endDate);
    if (startDate >= endDate) {
        //Start date must be before end date
        res.status(205).send('The occupancy start date must be before the end date\nPlease validate your dates.');
        return;
    }

    Apartment.findById(req.body._id, function (err, apartment) {
        if (err) {
            console.log(err);
        }
        else {
            for (var i = 0; i < apartment.apartment_rooms.length; i++) {
                if (apartment.apartment_rooms[i].room_name_number === req.body.room_name_number) {
                    for (var j = 0; j < apartment.apartment_rooms[i].room_occupancies.length; j++) {
                        occStart = apartment.apartment_rooms[i].room_occupancies[j].occupancy_start;
                        occEnd = apartment.apartment_rooms[i].room_occupancies[j].occupancy_end;
                        // console.log("Test start: " + occStart);
                        // console.log("Test start: " + occEnd);
                        if (startDate >= occStart && startDate <= occEnd) {
                            // BOOKING STARTS IN MIDDLE OF OTHER APPOINTMENT
			    console.log('There is a booking which contradicts your dates.\nPlease verify your input.');
			    res.status(205).send('There is a booking which contradicts your dates.\nPlease verify your input.');
                            return;
                        } else if (endDate >= occStart && endDate <= occEnd) {
                            // BOOKING ENDS IN MIDDLE OF OTHER APPOINTMENT
		 	    console.log('There is a booking which contradicts your dates.\nPlease verify your input.');
                            res.status(205).send('There is a booking which contradicts your dates.\nPlease verify your input.');
                            return;
                        } else if (startDate <= occStart && endDate >= occEnd) {
                            // BOOKING STARTS *AND* ENDS IN MIDDLE OF OTHER APPOINTMENT
			    console.log('There is a booking which contradicts your dates.\nPlease verify your input.');
                            res.status(205).send('There is a booking which contradicts your dates.\nPlease verify your input.');
                            return;
                        } else { }

                    }
                    apartment.apartment_rooms[i].room_occupancies.push({ "trainee_id": req.body.trainee_id, "occupancy_start": startDate, "occupancy_end": endDate });
                    apartment.save();
					console.log("trainee_id: " + req.body.trainee_id + ", occupancy_start: " + startDate + ", occupancy_end:" + endDate)
                    res.status(200).send('Occupancy added');
                    console.log('Occupancy added');
                    return;
                }
            }
            res.status(205).send('Room not found');
            console.log('No such room');
        }
    });
});


apartmentRoutes.route('/deleteOccupancy/').delete(function (req, res) {
    console.log('Removing occupancy ' + req.body.occ_id + ' from room ' + req.body.room_name_number + ' in apartment ' + req.body._id);
    occ_id = req.body.occ_id;
    Apartment.findById(req.body._id, function (err, apartment) {
        if (err) {
            console.log(err);
        }
        else {
            for (var i = 0; i < apartment.apartment_rooms.length; i++) {
                if (apartment.apartment_rooms[i].room_name_number === req.body.room_name_number) {
                    for (var j = 0; j < apartment.apartment_rooms[i].room_occupancies.length; j++) {
                        if (apartment.apartment_rooms[i].room_occupancies[j]._id.equals(occ_id)) {
                            apartment.apartment_rooms[i].room_occupancies.splice(j, 1);
                            apartment.save();
                            res.status(200).send('Occupancy removed');
                            console.log('Occupancy removed');
                            return;
                        }
                    }
                    res.status(205).send('Trainee not in that room');
                    console.log('Could not remove occupancy');
                    return;
                }
            }
            res.status(205).send('Room not found');
            console.log('No such room');
        }
    });
});

apartmentRoutes.route('/changeEndOccupancy/').post(function (req, res) {
    console.log('Changing end date of occupancy ' + req.body.occ_id + ' in room ' + req.body.room_name_number + ' in apartment ' + req.body._id + " to " + req.body.eday+"/"+req.body.emonth+"/"+req.body.eyear);
    occ_id = req.body.occ_id;
	let newEndDate = new Date(req.body.eyear, req.body.emonth, req.body.eday)
    nextdate = new Date(1970, 0, 1);
    voiddate = nextdate;
    Apartment.findById(req.body._id, function (err, apartment) {
        if (err) {
            console.log(err);
        }
        else {
            for (var i = 0; i < apartment.apartment_rooms.length; i++) {
                if (apartment.apartment_rooms[i].room_name_number === req.body.room_name_number) {
                    for (var j = 0; j < apartment.apartment_rooms[i].room_occupancies.length; j++) {
                        //  console.log(apartment.apartment_rooms[i].room_occupancies[j]._id + "  ===   "+ occ_id);
                        if (apartment.apartment_rooms[i].room_occupancies[j]._id.equals(occ_id)) {
								if (apartment.apartment_rooms[i].room_occupancies[j].occupancy_start > newEndDate) {
									res.status(205).send('Cannot set end date to before start date');
									console.log('Could not amend occupancy');
									return;
								}//Occupancy cannot end before it begins.
								for (var k = 0; k < apartment.apartment_rooms[i].room_occupancies.length; k++) {
									if (apartment.apartment_rooms[i].room_occupancies[j]._id.equals(apartment.apartment_rooms[i].room_occupancies[k]._id)){
									} else if (apartment.apartment_rooms[i].room_occupancies[k].occupancy_end < apartment.apartment_rooms[i].room_occupancies[j].occupancy_start) {
									} else if (nextdate == voiddate) {
										nextdate = apartment.apartment_rooms[i].room_occupancies[k].occupancy_start;
									} else {
										if (apartment.apartment_rooms[i].room_occupancies[k].occupancy_start < nextdate) {
											nextdate = apartment.apartment_rooms[i].room_occupancies[k].occupancy_start;
										}
									}
								}
								if (newEndDate > nextdate && nextdate != voiddate){
									res.status(205).send("Cannot update occupancy. Another occupancy is scheduled to begin before the end of the new occupancy. The room is booked from " + nextdate);
									console.log('Could not amend occupancy');
									return;
								}//If the new end date is greater than the start of the next occupancy, cannot book room.
								let change={}
								change["apartment_rooms." + i + ".room_occupancies." + j + ".occupancy_end"] = newEndDate
								Apartment.updateOne({"apartment_rooms.room_occupancies._id" : occ_id }, {"$set": change},function (err, apartment) {
									
									if (err) {
										console.log(err);
										res.status(205).send(err);
										return;
									}
								});
								
								res.status(200).send('Occupancy amended');
								return;
							}
								
                        }
                    }
                }
                    res.status(205).send('Occupancy not found');
                    console.log('No such occupancy');
                    return;
            }
            res.status(205).send('Room not found');
            console.log('No such room');
        }
    );
});


module.exports = apartmentRoutes;
