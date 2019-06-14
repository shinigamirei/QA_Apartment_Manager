var express = require('express');
var apartmentRoutes = express.Router();
var async = require("async");
var request = require('request');
let Apartment = require('../models/apartment.model');
require('dotenv').config()

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

module.exports = apartmentRoutes;