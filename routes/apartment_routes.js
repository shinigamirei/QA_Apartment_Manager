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
            loop:
            for (var i = 0; i < apartment.apartment_rooms.length; i++) {
                if (apartment.apartment_rooms[i].room_name_number === req.body.room_name_number) {
                    for (var j = 0; j < apartment.apartment_rooms[i].room_occupancies.length; j++) {
                        if (apartment.apartment_rooms[i].room_occupancies[j].trainee_id === req.body.trainee_id) {
                            res.status(205).send('This trainee is already there');
                            break loop;
                        }
                    }
                    apartment.apartment_rooms[i].room_occupancies.push({ "trainee_id": req.body.trainee_id, "occupancy_start": moment(), "occupancy_end": moment() });
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
            loop:
            for (var i = 0; i < apartment.apartment_rooms.length; i++) {
                if (apartment.apartment_rooms[i].room_name_number === req.body.room_name_number) {
                    for (var j = 0; j < apartment.apartment_rooms[i].room_occupancies.length; j++) {
                        if (apartment.apartment_rooms[i].room_occupancies[j].trainee_id === req.body.trainee_id) {
                            apartment.apartment_rooms[i].room_occupancies.splice(j, 1);
                            apartment.save();
                            res.status(200).send('Occupancy removed');
                            break loop;
                        }
                    }
                    res.status(205).send('Trainee not in that room');
                }
            }
        }
    });
});

module.exports = apartmentRoutes;