var express = require('express');
var apartmentRoutes = express.Router();
var async = require("async");
var request = require('request');
let Apartment = require('../models/apartment.model');
let Occupancies = require('../models/occupancies.model');
let Room = require('../models/room.model');
require('dotenv').config();
var moment = require('moment');



apartmentRoutes.route('/cleaningAvailability_builtJSON/').get(function (req, res) {
    let checkdate = moment();

    // res.write(checkdate + "\n");
    console.log(checkdate);
    json_res_CA = "";
    let objectToReturn = [];
    Apartment.find(function (err, aparts) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(aparts.length);
            aparts.map(function (currentApartment, i) {
                //      console.log(currentApartment);
                //	if (json_res==""){
                //		json_res="{";
                //	}else{
                //	        json_res=json_res + "},{"
                //	}
                console.log(currentApartment.apartment_name + ", " + currentApartment.apartment_address + ", " + currentApartment.apartment_region);
                //            res.write(currentApartment.apartment_name + ", " + currentApartment.apartment_address + ", " + currentApartment.apartment_region + "\n");
                for (var j = 0; j < currentApartment.apartment_rooms.length; j++) {
                    nextdate = new Date(1970, 0, 1);
                    voiddate = nextdate;
                    if (json_res_CA == "") {
                        json_res_CA = "[{";
                    } else {
                        json_res_CA = json_res_CA + "},{"
                    }
                    //    nextdate=0;
                    currocc = 0;
                    console.log("Room " + currentApartment.apartment_rooms[j].room_name_number)
                    //     res.write("Room " + currentApartment.apartment_rooms[j].room_name_number + "\n");
                    for (var k = 0; k < currentApartment.apartment_rooms[j].room_occupancies.length; k++) {
                        //      console.log(nextdate);
                        //	  console.log(currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start);
                        //                              console.log(currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start);
                        //                              console.log(currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end);
                        if (currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start <= checkdate && currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end >= checkdate) {
                            console.log("Apartment occupied");
                            occend = currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end;
                            //var a = moment(currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end);
                            //var b = checkdate;
                            //console.log(a.format('MMMM Do YYYY')+"  "+b.format('MMMM Do YYYY'));
                            //var diffDays = a.diff(b, 'days');
                            //res.write("Room occupied\nOccupancy scheduled to end on " + moment(currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end).format('MMMM Do YYYY')+"\n"+"Available for cleaning in " + diffDays + " days.");
                            currocc = 1;
                            //              break;
                        } else if (currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end < checkdate) {
                        } else if (nextdate == voiddate) {
                            console.log("turn1");
                            nextdate = currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start;
                        } else {
                            if (currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start < nextdate) {
                                //                              console.log("turn2");
                                nextdate = currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start;
                            }
                        }
                    }
                    if (currocc == 1) {
                        var a = moment(occend);
                        var b = checkdate;
                        //console.log(a.format('MMMM Do YYYY')+"  "+b.format('MMMM Do YYYY'));
                        var diffDays = a.diff(b, 'days');
                        // res.write("Room occupied\nOccupancy scheduled to end on " + moment(currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end).format('MMMM Do YYYY')+"\n"+"Available for cleaning in " + diffDays + " days.\n")
                        if (nextdate > checkdate) {
                            var a = moment(nextdate);
                            var b = moment(occend);
                            //console.log(a.format('MMMM Do YYYY')+"  "+b.format('MMMM Do YYYY'));
                            var diffDays = a.diff(b, 'days');
                            //	res.write("Next occupancy scheduled to begin on " + moment(nextdate).format('MMMM Do YYYY')+"\n"+"Room will be available for cleaning for " + diffDays + " days.\n")i
                            json_res_CA = json_res_CA + "\"apartment_name\": \"" + currentApartment.apartment_name + "\", \"apartment_address\": \"" + currentApartment.apartment_address + "\", \"apartment_region\": \"" + currentApartment.apartment_region + "\", \"room_name\": \"" + currentApartment.apartment_rooms[j].room_name_number + "\", \"room_current_occupancy_end\": \"" + moment(occend).format('MMMM Do YYYY') + "\", \"room_next_occupancy_start\": \"" + moment(nextdate).format('MMMM Do YYYY') + "\", \"available_days\": \"" + diffDays + "\"";
                        } else {
                            //	res.write("No further occupancies scheduled.\n");
                            json_res_CA = json_res_CA + "\"apartment_name\": \"" + currentApartment.apartment_name + "\", \"apartment_address\": \"" + currentApartment.apartment_address + "\", \"apartment_region\": \"" + currentApartment.apartment_region + "\", \"room_name\": \"" + currentApartment.apartment_rooms[j].room_name_number + "\", \"room_current_occupancy_end\": \"" + moment(occend).format('MMMM Do YYYY') + "\", \"room_next_occupancy_start\": \"NONE\", \"available_days\": \"INF.\""
                        }
                    }
                    else if (nextdate > checkdate) {

                        var a = moment(nextdate);
                        var b = moment(checkdate);
                        var diffDays = a.diff(b, 'days');
                        console.log("Room available");
                        // res.write("Room available\nNext occupancy scheduled to begin on " + moment(nextdate).format('MMMM Do YYYY') +"\nRoom will be available for cleaning for " + diffDays + " days.\n");
                        json_res_CA = json_res_CA + "\"apartment_name\": \"" + currentApartment.apartment_name + "\", \"apartment_address\": \"" + currentApartment.apartment_address + "\", \"apartment_region\": \"" + currentApartment.apartment_region + "\", \"room_name\": \"" + currentApartment.apartment_rooms[j].room_name_number + "\", \"room_current_occupancy_end\": \"NOT BOOKED\", \"room_next_occupancy_start\": \"" + moment(nextdate).format('MMMM Do YYYY') + "\", \"available_days\": \"" + diffDays + "\"";
                    } else {
                        console.log("Room available");
                        //res.write("Room available\nNo further occupancies scheduled\n");
                        json_res_CA = json_res_CA + "\"apartment_name\": \"" + currentApartment.apartment_name + "\", \"apartment_address\": \"" + currentApartment.apartment_address + "\", \"apartment_region\": \"" + currentApartment.apartment_region + "\", \"room_name\": \"" + currentApartment.apartment_rooms[j].room_name_number + "\", \"room_current_occupancy_end\": \"NOT BOOKED\", \"room_next_occupancy_start\": \"NONE\", \"available_days\": \"INF.\""
                    }
                    //res.write("===\n")
                }
                //res.write("================================\n")
            });
            json_res_CA = json_res_CA + "}]";
            console.log(json_res_CA);
            json_json_res_CA = JSON.parse(json_res_CA);
            res.status(200).json(json_json_res_CA);
        }
    });
});

apartmentRoutes.route('/cleaningAvailability_text/').get(function (req, res) {
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
                        if (currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start <= checkdate && currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end >= checkdate) {
                            console.log("Apartment occupied");
                            occend = currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end;
                            currocc = 1;
                        } else if (currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_end < checkdate) {
                        } else if (nextdate == voiddate) {
                            //                              console.log("turn1");
                            nextdate = currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start;
                        } else {
                            if (currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start < nextdate) {
                                //                              console.log("turn2");
                                nextdate = currentApartment.apartment_rooms[j].room_occupancies[k].occupancy_start;
                            }
                        }
                    }
                    if (currocc == 1) {
                        var a = moment(occend);
                        var b = checkdate;
                        //console.log(a.format('MMMM Do YYYY')+"  "+b.format('MMMM Do YYYY'));
                        var diffDays = a.diff(b, 'days');
                        res.write("Room occupied\nOccupancy scheduled to end on " + moment(occend).format('MMMM Do YYYY') + "\n" + "Available for cleaning in " + diffDays + " days.\n")
                        if (nextdate > checkdate) {
                            var a = moment(nextdate);
                            var b = moment(occend);
                            //console.log(a.format('MMMM Do YYYY')+"  "+b.format('MMMM Do YYYY'));
                            var diffDays = a.diff(b, 'days');
                            res.write("Next occupancy scheduled to begin on " + moment(nextdate).format('MMMM Do YYYY') + "\n" + "Room will be available for cleaning for " + diffDays + " days.\n")
                        } else {
                            res.write("No further occupancies scheduled.\n");
                        }
                    }
                    else if (nextdate > checkdate) {

                        var a = moment(nextdate);
                        var b = moment(checkdate);
                        var diffDays = a.diff(b, 'days');
                        console.log("Room available");
                        res.write("Room available\nNext occupancy scheduled to begin on " + moment(nextdate).format('MMMM Do YYYY') + "\nRoom will be available for cleaning for " + diffDays + " days.\n");
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
apartmentRoutes.route('/changeEndOccupancy_ForEach/').post(function (req, res) {
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
            apartment.apartment_rooms.forEach( (apartmentRoom) => {
                if (apartmentRoom.room_name_number === req.body.room_name_number) {
                    apartmentRoom.room_occupancies.forEach( (roomOccupancy) => {
                        if (roomOccupancy._id.equals(occ_id)) {
								if (roomOccupancy.occupancy_start > newEndDate) {
									res.status(205).send('Cannot set end date to before start date');
									console.log('Could not amend occupancy');
									return;
								}//Occupancy cannot end before it begins.
								apartmentRoom.room_occupancies.forEach( (checkRoomOccupancy) =>  {
									if (roomOccupancy._id.equals(checkRoomOccupancy._id)){
									} else if (checkRoomOccupancy.occupancy_end < roomOccupancy.occupancy_start) {
									} else if (nextdate == voiddate) {
										nextdate = checkRoomOccupancy.occupancy_start;
									} else {
										if (checkRoomOccupancy.occupancy_start < nextdate) {
											nextdate = checkRoomOccupancy.occupancy_start;
										}
									}
								});
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
								
						});
					}
				res.status(205).send('Occupancy not found');
				console.log('No such occupancy');
				return;
				});
			}
			res.status(205).send('Room not found');
			console.log('No such room');
        }
    );
});

apartmentRoutes.route('/changeEndOccupancy_OLD/').post(function (req, res) {
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
