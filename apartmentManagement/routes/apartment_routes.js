var express = require('express');
var apartmentRoutes = express.Router();
var async = require("async");
var request = require('request');
let Apartment = require('../models/apartment.model');
let Occupancies = require('../models/occupancies.model');
let Room = require('../models/room.model');
require('dotenv').config();
var moment = require('moment');


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

apartmentRoutes.route('/update').put(function (req, res) {
    console.log('Attempting to update an apartment ' + req.body._id);
    Apartment.findById(req.body._id, function (err, apartment) {
        if (err) {
            console.log(err);
        }
        else if (apartment === null) {
            res.status(205).send('No such apartment');
        }
        else {
            if (req.body.apartment_name !== '') {
                apartment.apartment_name = req.body.apartment_name;
            }
            if (req.body.apartment_address !== '') {
                apartment.apartment_address = req.body.apartment_address;
            }
            if (req.body.apartment_region !== '') {
                apartment.apartment_region = req.body.apartment_region;
            }
            if (req.body.apartment_rooms !== '') {
                apartment.apartment_rooms = req.body.apartment_rooms;
            }
            apartment.save().then(apartment => {
                res.status(200).send('Apartment updated');
                console.log('Updated an apartment ' + apartment._id);
            }).catch(err => {
                res.status(205).send('Updating an apartment did not work');
                console.log(err);
            });
        }
    });
});

apartmentRoutes.route('/addIssue').put(function (req, res) {
    console.log('Attempting to add an issue to an apartment ' + req.body._id);
    Apartment.findById(req.body._id, function (err, apartment) {
        if (err) {
            console.log(err);
        }
        else if (apartment === null) {
            res.status(205).send('No such apartment');
        }
        else {
            apartment.apartment_issues.push({"issue":req.body.issue, "date_created":req.body.date_created})
            apartment.save().then(apartment => {
                res.status(200).send('Apartment updated');
                console.log('Updated an apartment ' + apartment._id);
            }).catch(err => {
                res.status(205).send('Updating an apartment did not work');
                console.log(err);
            });
        }
    });
});

apartmentRoutes.route('/deleteIssue').delete(function (req, res) {
    console.log('Removing issue ' + req.body._id + ' from apartment ' + req.body.id);
    Apartment.findById(req.body.id, function (err, apartment) {
        if (err) {
            console.log(err);
        } else {
            for (var i = 0; i < apartment.apartment_issues.length; i++) {
                if (apartment.apartment_issues[i]._id == req.body._id) {
					apartment.apartment_issues_archive.push({"issue":apartment.apartment_issues[i].issue, "date_created":apartment.apartment_issues[i].date_created});
                    apartment.apartment_issues.splice(i, 1);
                    apartment.save();
                    res.status(200).send('Issue removed');
                    return;
                } else {
                    res.status(205).send('Issue does not exist');
                }
            }
            console.log('Issue does not exist');
        }
    });
});


module.exports = apartmentRoutes;
