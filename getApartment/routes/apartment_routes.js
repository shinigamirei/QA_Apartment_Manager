var express = require('express');
var apartmentRoutes = express.Router();
var async = require("async");
var request = require('request');
let Apartment = require('../models/apartment.model');
let Occupancies = require('../models/occupancies.model');
let Room = require('../models/room.model');
require('dotenv').config();
var moment = require('moment');

apartmentRoutes.route('/getAll/').get(function (req, res) {
    console.log('Looked up all apartments');
    Apartment.find(function (err, apartment) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(apartment);
            res.status(200).json(apartment);
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
            res.status(200).json(apartment);
            console.log('Returned an apartment');
        }
    });
});

apartmentRoutes.route('/getByRegion/:region').get(function (req, res) {
    let region = req.params.region;
    console.log('Looked up apartment by region ' + region);
    Apartment.find({ "apartment_region": region }).exec(function (err, apartment) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(apartment);
            res.status(200).json(apartment);
            console.log('Returned apartments');
        }
    });
});

apartmentRoutes.route('/getRegions/').get(function (req, res) {
	let regionJson=[]
    Apartment.aggregate(distinct( "apartment_region" ).sort().exec(function (err, regionlist) {
        if (err) {
            console.log(err);
        }
        else {
			res.status(200).json(regionlist);
			console.log('Returned list');
			//regionlist.map(function(Region,i){
            //console.log(Region);
			//	regionJson.push({value: Region});
			//})
        }
        //res.status(200).json(regionJson);
        //console.log('Returned list');
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
        else if (apartment === null) {
            res.status(205).send('No such apartment');
        }
        else {
            for (var i = 0; i < apartment.apartment_rooms.length; i++) {
                if (apartment.apartment_rooms[i].room_name_number === req.body.room_name_number) {
                    res.status(205).send('Room already exists');
                    console.log('Room already exists');
                    return;
                }
            }
            apartment.apartment_rooms.push({ "room_name_number": req.body.room_name_number });
            apartment.save();
            res.status(200).send('Room added');
            console.log('Room added');
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
                    return;
                }
            }
            res.status(205).send('No such room');
            console.log('No such room');
        }
    });
});

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
                            res.status(205).send('There is a booking which contradicts your dates.\nPlease verify your input.');
                            return;
                        } else if (endDate >= occStart && endDate <= occEnd) {
                            // BOOKING ENDS IN MIDDLE OF OTHER APPOINTMENT
                            res.status(205).send('There is a booking which contradicts your dates.\nPlease verify your input.');
                            return;
                        } else if (startDate <= occStart && endDate >= occEnd) {
                            // BOOKING STARTS *AND* ENDS IN MIDDLE OF OTHER APPOINTMENT
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


apartmentRoutes.route('/getFromDate/:year/:month/:day').get(function (req, res) {
    const year = req.params.year;
    const month = req.params.month;
    const day = req.params.day;

    console.log(`getting occupancies that started before, and end after ${req.params.day}/${req.params.month}/${req.params.year}`);

    const checkdate = new Date(year, month, day);
    let objectToReturn = [];

    Apartment.find(function (err, aparts) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(`Found ${aparts.length} apartments`);
            aparts.map( (currentApartment) => {

                console.log(`Currently checking occupancies for apartment ${currentApartment.apartment_name}, 
                    ${currentApartment.apartment_address}, ${currentApartment.apartment_region}`);

                currentApartment.apartment_rooms.forEach( (apartmentRoom) => {
                    apartmentRoom.room_occupancies.forEach( (roomOccupancy) => {
                        if(moment(roomOccupancy.occupancy_start).isSameOrBefore(checkdate) &&
                            moment(roomOccupancy.occupancy_end).isSameOrAfter(checkdate)) {
                                objectToReturn.push({
                                    apartment_name: currentApartment.apartment_name, 
                                    apartment_address: currentApartment.apartment_address,
                                    apartment_region: currentApartment.apartment_region,
                                    room_name: apartmentRoom.room_name_number,
                                    trainee_id: roomOccupancy.trainee_id,
                                    occupancy_start: moment(roomOccupancy.occupancy_start).format('MMMM Do YYYY'),
                                    occupancy_end: moment(roomOccupancy.occupancy_end).format('MMMM Do YYYY')
                                });
                            }
                    });
                });
            });

            res.status(200).json(objectToReturn);
        }
    });

});


apartmentRoutes.route('/getOccupancyInfo/:trainee_id').get(function (req, res) {
    currentTime = moment();
    result = "";
    Apartment.find({ 'apartment_rooms.room_occupancies.trainee_id': req.params.trainee_id }, function (err, apartment) {
        if (apartment.length != 0) {
            apartment.map(function (currentApartment, i) {
                for (var j = 0; j < currentApartment.apartment_rooms.length; j++) {
                    for (var k = 0; k < currentApartment.apartment_rooms[j].room_occupancies.length; k++) {
                        if (currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start <= currentTime && currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end >= currentTime && currentApartment.apartment_rooms[j].room_occupancies[k].trainee_id == req.params.trainee_id) {
                           // console.log("1")
                            result = "h"
                            res.status(200).json({ apartment_name: currentApartment.apartment_name, apartment_address: currentApartment.apartment_address, apartment_region: currentApartment.apartment_region, apartment_rooms: [{ room_name_number: currentApartment.apartment_rooms[j].room_name_number, room_occupancies: [{ _id: currentApartment.apartment_rooms[j].room_occupancies[k]._id, trainee_id: currentApartment.apartment_rooms[j].room_occupancies[k].trainee_id, occupancy_start: currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start, occupancy_end: currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end }] }] });
                            return;
                        }
                    }
                }

            });
            if (result == "") {
                res.status(205).send('Trainee not found');
                return;
            }
        }
        else {
            res.status(205).send('Trainee not found');
        }
    });
});

apartmentRoutes.route('/cleaningAvailability/').get(function (req, res) {
    let checkdate = moment();

    let objectToReturn = [];
    Apartment.find(function (err, aparts) {
        if (err) {
            console.log(err);
        }
        else {
            aparts.map(function (currentApartment, i) {
                console.log(currentApartment.apartment_name + ", " + currentApartment.apartment_address + ", " + currentApartment.apartment_region);
				currentApartment.apartment_rooms.forEach( (apartmentRoom) => {
                    nextdate = new Date(1970, 0, 1);
                    voiddate = nextdate;
                    currocc = 0;
                    console.log("Room " + apartmentRoom.room_name_number)
                    apartmentRoom.room_occupancies.forEach( (roomOccupancy) => {
                        if (roomOccupancy.occupancy_start <= checkdate && roomOccupancy.occupancy_end >= checkdate) {
                            console.log("Apartment occupied");
                            occend = roomOccupancy.occupancy_end;
                            currocc = 1;
                        } else if (roomOccupancy.occupancy_end < checkdate) {
                        } else if (nextdate == voiddate) {
                            nextdate = roomOccupancy.occupancy_start;
                        } else {
                            if (roomOccupancy.occupancy_start < nextdate) {
                                //                              console.log("turn2");
                                nextdate = roomOccupancy.occupancy_start;
                            }
                        }
                    });
                    if (currocc == 1) {
                        var a = moment(occend);
                        var b = checkdate;
                        var diffDays = a.diff(b, 'days');
                        if (nextdate > checkdate) {
                            var a = moment(nextdate);
                            var b = moment(occend);
                            var diffDays = a.diff(b, 'days');
							objectToReturn.push({
                                apartment_name: currentApartment.apartment_name, 
                                apartment_address: currentApartment.apartment_address,
                                apartment_region: currentApartment.apartment_region,
                                room_name: apartmentRoom.room_name_number,
                                room_current_occupancy_end: moment(occend).format('MMMM Do YYYY'),
                                room_next_occupancy_start: moment(nextdate).format('MMMM Do YYYY'),
                                available_days: diffDays
                            });
                        } else {
                            //	res.write("No further occupancies scheduled.\n");
							objectToReturn.push({
                                apartment_name: currentApartment.apartment_name, 
                                apartment_address: currentApartment.apartment_address,
                                apartment_region: currentApartment.apartment_region,
                                room_name: apartmentRoom.room_name_number,
                                room_current_occupancy_end: moment(occend).format('MMMM Do YYYY'),
                                room_next_occupancy_start: "NONE",
                                available_days: "INF."
                            });
                        }
                    }
                    else if (nextdate > checkdate) {

                        var a = moment(nextdate);
                        var b = moment(checkdate);
                        var diffDays = a.diff(b, 'days');
                        console.log("Room available");
						objectToReturn.push({
                            apartment_name: currentApartment.apartment_name, 
                            apartment_address: currentApartment.apartment_address,
                            apartment_region: currentApartment.apartment_region,
                            room_name: apartmentRoom.room_name_number,
                            room_current_occupancy_end: "NOT BOOKED",
                            room_next_occupancy_start: moment(nextdate).format('MMMM Do YYYY'),
                            available_days: diffDays
                        });
                    } else {
                        console.log("Room available");
						objectToReturn.push({
                            apartment_name: currentApartment.apartment_name, 
                            apartment_address: currentApartment.apartment_address,
                            apartment_region: currentApartment.apartment_region,
                            room_name: apartmentRoom.room_name_number,
                            room_current_occupancy_end: "NOT BOOKED",
                            room_next_occupancy_start: "NONE",
                            available_days: "INF."
                        });
                    }
                });
            });
            res.status(200).json(objectToReturn);
        }
    });
});


module.exports = apartmentRoutes;
