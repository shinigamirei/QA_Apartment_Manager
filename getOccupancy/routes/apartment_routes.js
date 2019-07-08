var express = require('express');
var apartmentRoutes = express.Router();
var async = require("async");
var request = require('request');
let Apartment = require('../models/apartment.model');
let Occupancies = require('../models/occupancies.model');
let Room = require('../models/room.model');
require('dotenv').config();
var moment = require('moment');



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
            aparts.map((currentApartment) => {

                console.log(`Currently checking occupancies for apartment ${currentApartment.apartment_name}, 
                    ${currentApartment.apartment_address}, ${currentApartment.apartment_region}`);

                currentApartment.apartment_rooms.forEach((apartmentRoom) => {
                    apartmentRoom.room_occupancies.forEach((roomOccupancy) => {
                        if (moment(roomOccupancy.occupancy_start).isSameOrBefore(checkdate) &&
                            moment(roomOccupancy.occupancy_end).isSameOrAfter(checkdate)) {
                            objectToReturn.push({
				_id: currentApartment._id,
                                apartment_name: currentApartment.apartment_name,
                                apartment_address: currentApartment.apartment_address,
                                apartment_region: currentApartment.apartment_region,
                                room_name: apartmentRoom.room_name_number,
                                trainee_id: roomOccupancy.trainee_id,
				occ_id: roomOccupancy._id,
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
    let result;
    Apartment.find({ 'apartment_rooms.room_occupancies.trainee_id': req.params.trainee_id }, function (err, apartment) {
        if (apartment.length != 0) {
            apartment.map(function (currentApartment, i) {
                for (var j = 0; j < currentApartment.apartment_rooms.length; j++) {
                    for (var k = 0; k < currentApartment.apartment_rooms[j].room_occupancies.length; k++) {
                        if (currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start <= currentTime &&
                            currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end >= currentTime &&
                            currentApartment.apartment_rooms[j].room_occupancies[k].trainee_id == req.params.trainee_id) {
                                result = {
                                    apartment_name: currentApartment.apartment_name,
                                    apartment_address: currentApartment.apartment_address,
                                    apartment_region: currentApartment.apartment_region,
                                    apartment_rooms: [
                                        {
                                            room_name_number: currentApartment.apartment_rooms[j].room_name_number,
                                            room_occupancies: [
                                                {
                                                    _id: currentApartment.apartment_rooms[j].room_occupancies[k]._id,
                                                    trainee_id: currentApartment.apartment_rooms[j].room_occupancies[k].trainee_id,
                                                    occupancy_start: currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start,
                                                    occupancy_end: currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end
                                                }
                                            ]
                                        }
                                    ]
                                };
                                return;
                        }
                    }
                }

            });
            res.status(200).json(result);
            if (!result) {
                //console.log("2");
                res.status(205).send('Trainee not found');
                return;
            }
        }
        else {
            //console.log("3");
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
                currentApartment.apartment_rooms.forEach((apartmentRoom) => {
                    nextdate = new Date(1970, 0, 1);
                    voiddate = nextdate;
                    currocc = 0;
                    console.log("Room " + apartmentRoom.room_name_number)
                    apartmentRoom.room_occupancies.forEach((roomOccupancy) => {
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
