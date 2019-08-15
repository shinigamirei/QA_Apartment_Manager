
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
var CryptoJS = require("crypto-js");

let Trainee = new Schema({
    trainee_fname: {
        type: String,
        required: true
    },
    trainee_lname: {
        type: String,
        required: true
    },
    trainee_email: {
        type: String,
        required: true, 
        unique: true 
    },
    trainee_password: {
        type: String,
        required: true
    },
	trainee_bank_name: {
		type: String
	},
    trainee_account_no: {
        type: String
    },    
    trainee_sort_code: {
        type: String
    },
    trainee_approved:{
        type: Boolean,
        default: false
    },
    trainee_password_token:{
        type: String
    },
    trainee_password_expires:{
        type: String,
        format: Date
    },
    trainee_start_date:{
        type: String,
        required:true
    },
    trainee_end_date:{
        type: String,
        required: true
    },
	trainee_bench_start_date:{
		type: String
	},
	trainee_bench_end_date:{
		type: String
	},
    added_By:{
        type: String,
        required: true
    },
    status:{
        type: String,
        // enum:['Incomplete', 'Active', 'Suspended'],
        // default: 'Incomplete',
        required: true
    },
    bursary:{
        type: String,
        required: true
    },
    bursary_amount:{
        type: String,
        format: Number,
        required: true
    },
	trainee_days_worked:{
		type: String
	},
	bank_holiday:{
        type: Boolean
    },
    monthly_expenses:{
        type: Array,
        default: []
    },
    apartment:{
        type: String
    },
    apartment_start_date:{
        type: String
    },
    apartment_end_date:{
      type: String
    },
    trainee_gender: {
        type: String,
    },
    trainee_uniName: {
        type: String,
    },
    trainee_phone: {
        type: String
    },
    trainee_degree: {
        type: String,
    },
    trainee_chosenTech: {
        type: String,
    },
    trainee_intake: {
        type: String
    },
    trainee_geo: {
        type: String,
    },
    trainee_clearance: {
        type: String,
    },
    trainee_businessEmail: {
        type: String
    },
    trainee_aptitude_score: {
        type: String
    },
    trainee_languages:{
        type: String
    },
    documents_signed:{
        type: String
    },
    sent_Agreement:{
        type: String
    },
    received_Agreement:{
        type: String
    },
    accomodation: {
        type: String
    },
    java_test_Score:{
        type: String
    },
    MTE : {
        type: String
    },
    date_Achieved:{
        type: String
    }
});
module.exports = mongoose.model('Trainee', Trainee);

var test = module.exports = mongoose.model('Trainee', Trainee);

module.exports.getTraineeByEmail = function(email, callback){
    var query = {trainee_email: email};
    test.findOne(query, callback);
  }

  
module.exports.comparePassword = function(traineePassword, hash, callback){
    bcrypt.compare(traineePassword, hash, function(err, isMatch) {
      if(err) throw err;
      callback(null, isMatch);
    });
  }

test.find({}, function(err, docs){
    if(!err){
        docs.map(doc => {
            if(doc.trainee_gender === undefined){
                doc.trainee_gender = CryptoJS.AES.encrypt("", '3FJSei8zPx').toString();
            }
            if(doc.trainee_uniName === undefined){
                doc.trainee_uniName = CryptoJS.AES.encrypt("", '3FJSei8zPx').toString();
            }
            if(doc.trainee_phone === undefined){
                doc.trainee_phone = CryptoJS.AES.encrypt("", '3FJSei8zPx').toString();
            }
            if(doc.trainee_degree === undefined){
                doc.trainee_degree = CryptoJS.AES.encrypt("", '3FJSei8zPx').toString();
            }
            if(doc.trainee_chosenTech === undefined){
                doc.trainee_chosenTech = CryptoJS.AES.encrypt("", '3FJSei8zPx').toString();
            }
            if(doc.trainee_intake === undefined){
                doc.trainee_intake = CryptoJS.AES.encrypt("", '3FJSei8zPx').toString();
            }
            if(doc.trainee_geo === undefined){
                doc.trainee_geo = CryptoJS.AES.encrypt("", '3FJSei8zPx').toString();
            }
            if(doc.trainee_clearance === undefined){
                doc.trainee_clearance = CryptoJS.AES.encrypt("", '3FJSei8zPx').toString();
            }
            if(doc.trainee_businessEmail === undefined){
                doc.trainee_businessEmail = CryptoJS.AES.encrypt("", '3FJSei8zPx').toString();
            }
            if(doc.trainee_aptitude_score === undefined){
                doc.trainee_aptitude_score = CryptoJS.AES.encrypt("", '3FJSei8zPx').toString();
            }
            if(doc.trainee_languages === undefined){
                doc.trainee_languages = CryptoJS.AES.encrypt("", '3FJSei8zPx').toString();
            }
            if(doc.documents_signed === undefined){
                doc.documents_signed = CryptoJS.AES.encrypt("", '3FJSei8zPx').toString();
            }
            if(doc.sent_Agreement === undefined){
                doc.sent_Agreement = CryptoJS.AES.encrypt("", '3FJSei8zPx').toString();
            }
            if(doc.received_Agreement === undefined){
                doc.received_Agreement = CryptoJS.AES.encrypt("", '3FJSei8zPx').toString();
            }
            if(doc.accomodation === undefined){
                doc.accomodation = CryptoJS.AES.encrypt("", '3FJSei8zPx').toString();
            }
            if(doc.java_test_Score === undefined){
                doc.java_test_Score = CryptoJS.AES.encrypt("", '3FJSei8zPx').toString();
            }
            if(doc.MTE === undefined){
                doc.MTE = CryptoJS.AES.encrypt("", '3FJSei8zPx').toString();
            }
            if(doc.date_Achieved === undefined){
                doc.date_Achieved = CryptoJS.AES.encrypt("", '3FJSei8zPx').toString();
            }
            if(doc.monthly_expenses.length > 0){
                doc.monthly_expenses.map(expense => {
                    if(expense.status === undefined){
                        expense.status = CryptoJS.AES.encrypt("Pending", '3FJSei8zPx').toString();
                    }
                });
            }
            doc.markModified('monthly_expenses');
            doc.save();
        })
    }
    else{
        throw err;
    }
})

