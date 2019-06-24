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

apartmentRoutes.route('/getByRegion/:region').get(function (req, res) {
    let region = req.params.region;
    console.log('Looked up apartment by region ' + region);
    Apartment.find({ "apartment_region": region }).exec(function (err, apartment) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(apartment);
            res.json(apartment);
            console.log('Returned apartments');
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
                            // console.log("startDate >= occStart && startDate <= occEnd")
                            // BOOKING STARTS IN MIDDLE OF OTHER APPOINTMENT
                            res.status(205).send('There is a booking which contradicts your dates.\nPlease verify your input.');
                            return;
                        } else if (endDate >= occStart && endDate <= occEnd) {
                            // BOOKING ENDS IN MIDDLE OF OTHER APPOINTMENT
                            //   console.log("endDate >= occStart && endDate <= occEnd")
                            res.status(205).send('There is a booking which contradicts your dates.\nPlease verify your input.');
                            return;
                        } else if (startDate <= occStart && endDate >= occEnd) {
                            // BOOKING STARTS *AND* ENDS IN MIDDLE OF OTHER APPOINTMENT
                            //     console.log("startDate <= occStart && endDate >= occEnd")
                            res.status(205).send('There is a booking which contradicts your dates.\nPlease verify your input.');
                            return;
                        } else { }

                    }
                    apartment.apartment_rooms[i].room_occupancies.push({ "trainee_id": req.body.trainee_id, "occupancy_start": startDate, "occupancy_end": endDate });
                    apartment.save();
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

apartmentRoutes.route('/checkdates/').post(function (req, res) {
    console.log('Adding occupancy to room ' + req.body.room_name_number + ' in apartment ' + req.body._id);
    let startDate = new Date(req.body.syear, req.body.smonth, req.body.sday)
    let endDate = new Date(req.body.eyear, req.body.emonth, req.body.eday)
    console.log('Start date: ' + startDate);
    console.log('End date: ' + endDate);
    Apartment.findById(req.body._id, function (err, apartment) {
        if (err) {
            console.log(err);
        }
        else {
            for (var i = 0; i < apartment.apartment_rooms.length; i++) {
                console.log(apartment.apartment_rooms[i].room_name_number);
                console.log(req.body.room_name_number);
                console.log(apartment.apartment_rooms[i].room_name_number === req.body.room_name_number);
                if (apartment.apartment_rooms[i].room_name_number === req.body.room_name_number) {
                    for (var j = 0; j < apartment.apartment_rooms[i].room_occupancies.length; j++) {
                        //   if (apartment.apartment_rooms[i].room_occupancies[j].trainee_id === req.body.trainee_id) {
                        // res.status(205).send('This trainee is already there');
                        // console.log('Could not add occupancy');
                        // return;
                        //    }
                        //	if (apartment.apartment_rooms[i].room_occupancies.length === 0){
                        //			res.status(200).send('Dates valid');
                        //			console.log('Dates Vaild');
                        //			return;
                        //		}
                        occStart = apartment.apartment_rooms[i].room_occupancies[j].occupancy_start;
                        occEnd = apartment.apartment_rooms[i].room_occupancies[j].occupancy_end;
                        console.log("Test start" + occStart);
                        console.log("Test start" + occEnd);
                        if (startDate >= occStart && startDate <= occEnd) {
                            console.log("startDate >= occStart && startDate <= occEnd")
                            res.status(205).send('There is a booking which contradicts your dates.\nPlease verify your input.');
                            return;
                        } else if (endDate >= occStart && endDate <= occEnd) {
                            console.log("endDate >= occStart && endDate <= occEnd")
                            res.status(205).send('There is a booking which contradicts your dates.\nPlease verify your input.');
                            return;
                        } else if (startDate <= occStart && endDate >= occEnd) {
                            console.log("startDate <= occStart && endDate >= occEnd")
                            res.status(205).send('There is a booking which contradicts your dates.\nPlease verify your input.');
                            return;
                        } else { }
                        //     apartment.apartment_rooms[i].room_occupancies.push({ "trainee_id": req.body.trainee_id, "occupancy_start": startDate, "occupancy_end": endDate });
                        //     apartment.save();
                    }
                    res.status(200).send('Dates valid');
                    console.log('Dates Vaild');
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
                        //  console.log(apartment.apartment_rooms[i].room_occupancies[j]._id + "  ===   "+ occ_id);
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

apartmentRoutes.route('/getFromDate/:year/:month/:day').get(function (req, res) {
    let year = req.params.year;
    let month = req.params.month;
    let day = req.params.day;
    //	let response="";
    let checkdate = new Date(year, month, day);
    var apartList = function (callback) {
        Apartment.find().exec(function (err, aparts) {
            //			aparts.reverse();
            callback(err, aparts);
        })
    }
    //   res.write(checkdate + "\n");
    console.log(checkdate);
    //	apartList(function (err, aparts) {
    Apartment.find(function (err, aparts) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(aparts.length);
            aparts.map(function (currentApartment, i) {
                //	console.log(currentApartment);
                console.log(currentApartment.apartment_name + ", " + currentApartment.apartment_address + ", " + currentApartment.apartment_region);
                res.write(currentApartment.apartment_name + ", " + currentApartment.apartment_address + ", " + currentApartment.apartment_region + "\n");
                for (var j = 0; j < currentApartment.apartment_rooms.length; j++) {
                    console.log("Room " + currentApartment.apartment_rooms[j].room_name_number)
                    res.write("Room " + currentApartment.apartment_rooms[j].room_name_number + "\n");
                    for (var k = 0; k < currentApartment.apartment_rooms[j].room_occupancies.length; k++) {
                        //				console.log(currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start);
                        //				console.log(currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end);
                        if (currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start <= checkdate && currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end >= checkdate) {
                            console.log(currentApartment.apartment_rooms[j].room_occupancies[k]);
                            res.write(currentApartment.apartment_rooms[j].room_occupancies[k].toString() + "\n");
                        }
                    }
                }
            });
        }
    });
});

apartmentRoutes.route('/currentStatus/').get(function (req, res) {
    let checkdate = moment();

    res.write(checkdate + "\n");
    console.log(checkdate);

    Apartment.find(function (err, aparts) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(aparts.length);
            aparts.map(function (currentApartment, i) {
                //      console.log(currentApartment);
                console.log(currentApartment.apartment_name + ", " + currentApartment.apartment_address + ", " + currentApartment.apartment_region);
                res.write(currentApartment.apartment_name + ", " + currentApartment.apartment_address + ", " + currentApartment.apartment_region + "\n");
                for (var j = 0; j < currentApartment.apartment_rooms.length; j++) {
                    nextdate = new Date(1970, 0, 1);
                    voiddate = nextdate;
                    //    nextdate=0;
                    currocc = 0;
                    console.log("Room " + currentApartment.apartment_rooms[j].room_name_number)
                    res.write("Room " + currentApartment.apartment_rooms[j].room_name_number + "\n");
                    for (var k = 0; k < currentApartment.apartment_rooms[j].room_occupancies.length; k++) {
                        //			    console.log(nextdate);
                        //                              console.log(currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start);
                        //                              console.log(currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end);
                        if (currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start <= checkdate && currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end >= checkdate) {
                            console.log("Apartment occupied");
                            res.write("Room occupied\nOccupancy scheduled to end on " + moment(currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end).format('MMMM Do YYYY') + "\n");
                            currocc = 1;
                            break;
                        } else if (currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end < checkdate) {
                        } else if (nextdate == voiddate) {
                            //				console.log("turn1");
                            nextdate = currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start;
                        } else {
                            if (currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start < nextdate) {
                                //				console.log("turn2");
                                nextdate = currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start;
                            }
                        }

                    }
                    if (currocc == 1) { }
                    else if (nextdate > checkdate) {
                        console.log("Room available");
                        res.write("Room available\nNext occupancy scheduled to begin on " + moment(nextdate).format('MMMM Do YYYY') + "\n");
                    } else {
                        console.log("Room available");
                        res.write("Room available\nNo further occupancies scheduled\n");
                    }
                    res.write("===\n")
                }
                res.write("================================\n")
            });
        }
    });
});


apartmentRoutes.route('/getOccupancyInfo/:trainee_id').get(function (req, res) {
	currentTime=moment();
	result="";
	Apartment.find({ 'apartment_rooms.room_occupancies.trainee_id': req.params.trainee_id }, function (err, apartment){
	if (apartment.length != 0) {
	   apartment.map(function(currentApartment,i){
		   for (var j=0; j < currentApartment.apartment_rooms.length;j++){
			for (var k = 0; k < currentApartment.apartment_rooms[j].room_occupancies.length; k++) {
			      if (currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start <= currentTime && currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end >= currentTime && currentApartment.apartment_rooms[j].room_occupancies[k].trainee_id == req.params.trainee_id){
	//			      console.log("1")
				      //result="[{\"apartment_name\": \""+currentApartment.apartment_name+"\","
				      //result=result+"\"apartment_address\": \""+currentApartment.apartment_address+"\","
				      //result=result+"\"apartment_region\": \""+currentApartment.apartment_region+"\""
				      //result=result+"}]"
				      result="h"
				      //res.status(200).json(result);
				     // res.status(200).json(currentApartment);
				      res.status(200).json({apartment_name: currentApartment.apartment_name, apartment_address: currentApartment.apartment_address, apartment_region: currentApartment.apartment_region, apartment_rooms: [{room_name_number: currentApartment.apartment_rooms[j].room_name_number, room_occupancies:[{trainee_id:currentApartment.apartment_rooms[j].room_occupancies[k].trainee_id,occupancy_start:currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start,occupancy_end:currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end }]}]});
				      return;
			      }	
			}
		   }
	    
           });
            if(result == ""){
//                    console.log("2");
                res.status(205).send('Trainee not found');
                    return;
	    }
	}
        else {
//		console.log("3");
            res.status(205).send('Trainee not found');
        }
    });
});

apartmentRoutes.route('/cleaningAvailability/').get(function (req, res) {
    let checkdate = moment();

    res.write(checkdate + "\n");
    console.log(checkdate);

    Apartment.find(function (err, aparts) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(aparts.length);
            aparts.map(function (currentApartment, i) {
                //      console.log(currentApartment);
                console.log(currentApartment.apartment_name + ", " + currentApartment.apartment_address + ", " + currentApartment.apartment_region);
                res.write(currentApartment.apartment_name + ", " + currentApartment.apartment_address + ", " + currentApartment.apartment_region + "\n");
                for (var j = 0; j < currentApartment.apartment_rooms.length; j++) {
                   nextdate=new Date (1970, 0, 1);
                   voiddate=nextdate;
                //    nextdate=0;
                    currocc=0;
                    console.log("Room " + currentApartment.apartment_rooms[j].room_name_number)
                    res.write("Room " + currentApartment.apartment_rooms[j].room_name_number + "\n");
                    for (var k = 0; k < currentApartment.apartment_rooms[j].room_occupancies.length; k++) {
//                          console.log(nextdate);
                        //                              console.log(currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start);
                        //                              console.log(currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end);
                        if (currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start <= checkdate && currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end >= checkdate) {
                            console.log("Apartment occupied");
							occend=currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end;
							//var a = moment(currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end);
							//var b = checkdate;
							//console.log(a.format('MMMM Do YYYY')+"  "+b.format('MMMM Do YYYY'));
							//var diffDays = a.diff(b, 'days');
                          				//res.write("Room occupied\nOccupancy scheduled to end on " + moment(currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end).format('MMMM Do YYYY')+"\n"+"Available for cleaning in " + diffDays + " days.");
                            currocc=1;
 //                               break;
                        }else if (currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end < checkdate){
                        }else if(nextdate==voiddate){
//                              console.log("turn1");
                                nextdate = currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start;
                        }else{
                                if(currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start< nextdate){
//                              console.log("turn2");
                                nextdate = currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start;
                                }
                        }
					}
                    if (currocc == 1){
			    var a = moment(occend);
			    var b = checkdate;
			    //console.log(a.format('MMMM Do YYYY')+"  "+b.format('MMMM Do YYYY'));
			    var diffDays = a.diff(b, 'days');
			    res.write("Room occupied\nOccupancy scheduled to end on " + moment(occend).format('MMMM Do YYYY')+"\n"+"Available for cleaning in " + diffDays + " days.\n")
		    	if (nextdate > checkdate) {
				var a = moment(nextdate);
				var b = moment(occend);
				                            //console.log(a.format('MMMM Do YYYY')+"  "+b.format('MMMM Do YYYY'));
				var diffDays = a.diff(b, 'days');
				res.write("Next occupancy scheduled to begin on " + moment(nextdate).format('MMMM Do YYYY')+"\n"+"Room will be available for cleaning for " + diffDays + " days.\n")
			} else {
				res.write("No further occupancies scheduled.\n");
			}
		    }
                    else if (nextdate > checkdate){

			var a = moment(nextdate);
			var b = moment(checkdate);
                        var diffDays = a.diff(b, 'days');
			console.log("Room available");
                        res.write("Room available\nNext occupancy scheduled to begin on " + moment(nextdate).format('MMMM Do YYYY') +"\nRoom will be available for cleaning for " + diffDays + " days.\n");
                    }else {
                        console.log("Room available");
                        res.write("Room available\nNo further occupancies scheduled\n");
                    }
                res.write("===\n")
                }
            res.write("================================\n")
            });
        }
    });
});


module.exports = apartmentRoutes;
