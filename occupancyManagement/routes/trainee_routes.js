var express = require('express');
var traineeRoutes = express.Router();
var async = require("async");
var request = require('request');
let Trainee = require('../models/trainee.model');
var CryptoJS = require("crypto-js");
require('dotenv').config();


traineeRoutes.route('/getTraineeNames/').get(function (req, res) {
    let objectToReturn = [];

    Trainee.find(function (err, trainee) {
		if (err) {
			console.log(err);
		}
		else {
			console.log(trainee.length);
			trainee.map(function(currentTrainee,i){
				//console.log(currentTrainee);
				bytes = CryptoJS.AES.decrypt(currentTrainee.trainee_fname, '3FJSei8zPx');
				currentTrainee.trainee_fname = bytes.toString(CryptoJS.enc.Utf8);
				bytes = CryptoJS.AES.decrypt(currentTrainee.trainee_lname, '3FJSei8zPx');
				currentTrainee.trainee_lname = bytes.toString(CryptoJS.enc.Utf8);
				bytes = CryptoJS.AES.decrypt(currentTrainee.bursary, '3FJSei8zPx');
				currentTrainee.bursary = bytes.toString(CryptoJS.enc.Utf8);
				bytes = CryptoJS.AES.decrypt(currentTrainee.status, '3FJSei8zPx');
				currentTrainee.status = bytes.toString(CryptoJS.enc.Utf8);
                bytes  = CryptoJS.AES.decrypt(currentTrainee.trainee_email, CryptoJS.enc.Hex.parse("253D3FB468A0E24677C28A624BE0F939"), {iv: CryptoJS.enc.Hex.parse("00000000000000000000000000000000")});
				currentTrainee.trainee_email = bytes.toString(CryptoJS.enc.Utf8);
				if (currentTrainee.apartment != null){
					bytes = CryptoJS.AES.decrypt(currentTrainee.apartment, '3FJSei8zPx');
					currentTrainee.apartment = bytes.toString(CryptoJS.enc.Utf8)
				}
				console.log(currentTrainee)
				console.log(currentTrainee.apartment)
				if (currentTrainee.bursary === "False" && currentTrainee.status != "Suspended" && (currentTrainee.apartment === "" || currentTrainee.apartment == null)){
					objectToReturn.push({
						trainee_id: currentTrainee._id,
						trainee_fname: currentTrainee.trainee_fname,
						trainee_lname: currentTrainee.trainee_lname,
						trainee_email: currentTrainee.trainee_email,
					});
				}
			});
			res.status(200).json(objectToReturn);
		}
	});
});

module.exports = traineeRoutes;
