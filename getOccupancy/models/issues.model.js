const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

let IssueSchema = new Schema({
    issue: {
        type: String,
        required: true
    },
    date_created: {
        //		type: String,
        type: Date,
        required: true
    },
    date_resolved: {
        //		type: String,
        type: Date,
    }
});

module.exports = mongoose.model('Issue', IssueSchema);