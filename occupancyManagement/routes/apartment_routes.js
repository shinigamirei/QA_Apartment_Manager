var express = require('express');
var apartmentRoutes = express.Router();
var async = require("async");
var request = require('request');
let Apartment = require('../models/apartment.model');
let Trainee = require('../models/trainee.model');
let Occupancies = require('../models/occupancies.model');
let Room = require('../models/room.model');
require('dotenv').config();
var moment = require('moment');
var CryptoJS = require("crypto-js");

apartmentRoutes.route('/addOccupancy/').post(function (req, res) {
    console.log('Adding occupancy to apartment ' + req.body._id);
    let startDate = new Date(req.body.syear, req.body.smonth, req.body.sday)
    let endDate = new Date(req.body.eyear, req.body.emonth, req.body.eday)
    console.log('Start date: ' + startDate);
    console.log('End date: ' + endDate);
    if (startDate >= endDate) {
        //Start date must be before end date
        res.status(205).send('The occupancy start date must be before the end date\nPlease validate your dates.');
        return;
    }
    var date_sort_asc = function (date1, date2) {
        if (date1 > date2) return 1;
        if (date1 < date2) return -1;
        return 0;
    }
    Apartment.findById(req.body._id, function (err, apartment) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(apartment);
            console.log(`Currently checking occupancies for apartment ${apartment.apartment_name}, 
				${apartment.apartment_address}, ${apartment.apartment_region}`);

            var currentCount = parseInt(apartment.apartment_rooms, 10)
            var prestart = 0;
            var postend = 0;
            let startingDates = [];
            let endingDates = [];
            apartment.room_occupancies.forEach((roomOccupancy) => {
                //console.log(currentCount);
                if (moment(roomOccupancy.occupancy_start).isSameOrBefore(startDate) &&
                    moment(roomOccupancy.occupancy_end).isSameOrAfter(endDate)) {
                    //Any bookings that start before and end after the search dates must be included
                    currentCount--;
                } else if (moment(roomOccupancy.occupancy_start).isSameOrAfter(startDate) && moment(roomOccupancy.occupancy_end).isSameOrBefore(endDate)) {
                    //Get dates from any bookings that are entirely within the search dates.
                    startingDates.push(roomOccupancy.occupancy_start);
                    endingDates.push(roomOccupancy.occupancy_end);
                } else if (moment(roomOccupancy.occupancy_start).isSameOrBefore(startDate) && moment(roomOccupancy.occupancy_end).isSameOrAfter(startDate)) {
                    //Get dates from any bookings that end within the search dates.
                    endingDates.push(roomOccupancy.occupancy_end);
                    prestart++;
                } else if (moment(roomOccupancy.occupancy_start).isSameOrBefore(endDate) && moment(roomOccupancy.occupancy_end).isSameOrAfter(endDate)) {
                    //Get dates from any bookings that start within the search dates.
                    startingDates.push(roomOccupancy.occupancy_start);

                }
            });
            startingDates = startingDates.sort(date_sort_asc)
            endingDates = endingDates.sort(date_sort_asc) //sort ascending


            //remove occupancies that start before the seach from availability
            currentCount = currentCount - prestart;

            for (var i = 0; i < startingDates.length; i++) {
                //remove starting occupancies from availability
                currentCount--;

                var max = false;
                //this block is to add occupancies that end before the current starting occupancy back to availability.
                while (max == false) {
                    if (endingDates.length == 0) { max = true }//no more ending occupancies
                    else if (moment(startingDates[i]).isSameOrAfter(endingDates[0])) { //
                        //console.log("loop")
                        currentCount++;
                        endingDates.shift()
                    } else {
                        max = true; //reached max point
                    }
                }
                if (currentCount <= 0) {
                    {
                        break;
                    }
                }//if availability is 0, apartment is full.
            }
            if (currentCount <= 0) {
                res.status(205).send('Apartment full')
            } else {
                apartment.room_occupancies.push({ "trainee_id": req.body.trainee_id, "occupancy_start": startDate, "occupancy_end": endDate });

                let change = {}
                change["apartment"] = CryptoJS.AES.encrypt(apartment.apartment_name, '3FJSei8zPx').toString();
                change["apartment_start_date"] = CryptoJS.AES.encrypt(startDate.toString(), '3FJSei8zPx').toString();
                change["apartment_end_date"] = CryptoJS.AES.encrypt(endDate.toString(), '3FJSei8zPx').toString();
                Trainee.updateOne({ "_id": req.body.trainee_id }, { "$set": change }, function (err, trainee) {
                    if (err) {
                        console.log(err);
                        res.status(205).send(err);
                        return;
                    }
                });
                apartment.save();
                console.log("trainee_id: " + req.body.trainee_id + ", occupancy_start: " + startDate + ", occupancy_end:" + endDate)
                res.status(200).send('Occupancy added');
                console.log('Occupancy added');
            }
            return;
        }
    });
});



apartmentRoutes.route('/addOccupancy_OLD/').post(function (req, res) {
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


apartmentRoutes.route('/deleteOccupant').delete(function (req, res) {
    console.log('Occupier ID' + req.body._id);
    console.log('Apartment ID' + req.body.id);
    console.log('Removing Occupier ' + req.body._id + ' from apartment ' + req.body.id);
    Apartment.findById(req.body.id, function (err, apartment) {
        if (err) {
            console.log(err);
            console.log("didnt go into else statement")
        } else {
            for (var i = 0; i < apartment.room_occupancies.length; i++) {
                console.log(apartment.room_occupancies[i]._id)
                if (apartment.room_occupancies[i]._id == req.body._id) {
                    Trainee.findById(apartment.room_occupancies[i].trainee_id, function (err, trainee){
                        if(!trainee){
                            console.log(err)
                            console.log("couldn't clear trainee apartment")
                        }
                        else{
                            console.log(trainee)
                            trainee.apartment = ''
                            trainee.apartment_start_date = null
                            trainee.apartment_end_date = null
                            trainee.save()
                            apartment.room_occupancies.splice(i, 1);
                            apartment.save();
                            res.status(200).send('Occupier removed');
                            console.log(apartment.room_occupancies)
                        }
                    })
                    return;
                } else {
                    res.status(404).send('Occupier does not exist');
                }
            }
            console.log('Occupier does not exist');
        }
    });
});

apartmentRoutes.route('/getOccupiers/:apartment_id').get(function (req, res) {
    Apartment.findById(req.params.apartment_id, async function (err, apartment) {
        if (apartment) {
            let occupiers = []
            let promises = apartment.room_occupancies.map(async function (occupier, i) {
                console.log("MAP")
                await Trainee.findById(occupier.trainee_id, function (err, trainee) {
                    if (trainee) {
                        let t = {}
                        t.f_name = CryptoJS.AES.decrypt(trainee.trainee_fname, '3FJSei8zPx').toString(CryptoJS.enc.Utf8);
                        t.l_name = CryptoJS.AES.decrypt(trainee.trainee_lname, '3FJSei8zPx').toString(CryptoJS.enc.Utf8);
                        t.phone_number = CryptoJS.AES.decrypt(trainee.trainee_phone, '3FJSei8zPx').toString(CryptoJS.enc.Utf8);
                        t.start_date = occupier.occupancy_start;
                        t.end_date = occupier.occupancy_end;
                        t._id = occupier._id;
                        occupiers.push(t)
                    }
                })
                return occupiers
            }
            )
            Promise.all(promises).then(function () {
                console.log(occupiers)
                res.status(200).json(occupiers)
            })
        }
        else {
            res.status(205).send('Trainee not found');
        }
    });
});

apartmentRoutes.route('/changeEndOccupancy/').post(function (req, res) {
    console.log('Changing end date of occupancy ' + req.body.occ_id + ' in room ' + req.body.room_name_number + ' in apartment ' + req.body._id + " to " + req.body.eday + "/" + req.body.emonth + "/" + req.body.eyear);
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
                                if (apartment.apartment_rooms[i].room_occupancies[j]._id.equals(apartment.apartment_rooms[i].room_occupancies[k]._id)) {
                                } else if (apartment.apartment_rooms[i].room_occupancies[k].occupancy_end < apartment.apartment_rooms[i].room_occupancies[j].occupancy_start) {
                                } else if (nextdate == voiddate) {
                                    nextdate = apartment.apartment_rooms[i].room_occupancies[k].occupancy_start;
                                } else {
                                    if (apartment.apartment_rooms[i].room_occupancies[k].occupancy_start < nextdate) {
                                        nextdate = apartment.apartment_rooms[i].room_occupancies[k].occupancy_start;
                                    }
                                }
                            }
                            if (newEndDate > nextdate && nextdate != voiddate) {
                                res.status(205).send("Cannot update occupancy. Another occupancy is scheduled to begin before the end of the new occupancy. The room is booked from " + nextdate);
                                console.log('Could not amend occupancy');
                                return;
                            }//If the new end date is greater than the start of the next occupancy, cannot book room.
                            let change = {}
                            change["apartment_rooms." + i + ".room_occupancies." + j + ".occupancy_end"] = newEndDate
                            Apartment.updateOne({ "apartment_rooms.room_occupancies._id": occ_id }, { "$set": change }, function (err, apartment) {

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
