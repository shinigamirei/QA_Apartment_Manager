var expect = require('chai').expect,
    request = require('supertest'),
    should = require('chai').should(),
    //should = require('should'),
    server = require('../server.js');
var chai = require('chai');
var chaiHttp = require('chai-http');

var assert = require('assert'),
    http = require('http');

chai.use(chaiHttp);

describe('server', function () {
    before(function () {
        server.listen(4000);
    });
    after(function () {
        server.close();
    })
})

let user = {
    "apartment_name": "TestName",
    "apartment_address": "TestAddress",
    "apartment_region": "Manchester"
}

describe('add and delete apartment', () => {
    it('test', (done) => {
        chai.request('http://localhost:4000').post('/apartment/create').set('content-type', 'application/json').send(user).end((err, res) => {
            if (res.status == '200') {
                _id = res.body;
                chai.request('http://localhost:4000').delete('/apartment/delete/' + _id).end((err, res) => {
                    if (res.status == '200') {
                        done();
                    }
                    else {
                        console.log(`Expected 200 but got ${res}. error is ${err}`);
                    }
                });
            }
            else {
                console.log(`Expected 200 but got ${res}. error is ${err}`);
            }
        });
    });
});

describe('apartment route tests', () => {
    var _id;
    beforeEach((done) => {
        chai.request('http://localhost:4000').post('/apartment/create').set('content-type', 'application/json').send(user).end((err, res) => {
            if (res.status == '200') {
                _id = res.body;
                done();
            }
            else {
                console.log(`Expected 200 but got ${res}. error is ${err}`);
            }
        });
    });
    afterEach((done) => {
        chai.request('http://localhost:4000').delete('/apartment/delete/' + _id).end((err, res) => {
            if (res.status == '200') {
                done();
            }
            else {
                console.log(`Expected 200 but got ${res}. error is ${err}`);
            }
        });
    });
    it('add and delete room', (done) => {
        chai.request('http://localhost:4000').post('/apartment/addRoom').set('content-type', 'application/json').send({ "_id": _id, "room_name_number": "1" }).end((err, res) => {
            if (res.status == '200') {
                chai.request('http://localhost:4000').delete('/apartment/deleteRoom').set('content-type', 'application/json').send({ "_id": _id, "room_name_number": "1" }).end((err, res) => {
                    if (res.status == '200') {
                        done();
                    }
                    else {
                        console.log(`Expected 200 when deleting room but got ${res}. error is ${err}`);
                    }
                });
            }
            else {
                console.log(`Expected 200 when adding room but got ${res}. error is ${err}`);
            }
        });
    });
    it('add and delete occupancies', (done) => {
        chai.request('http://localhost:4000').post('/apartment/addRoom').set('content-type', 'application/json').send({ "_id": _id, "room_name_number": "1" }).end((err, res) => {
            if (res.status == '200') {
                chai.request('http://localhost:4000').post('/apartment/addOccupancy').set('content-type', 'application/json').send({
                    "_id": _id, "room_name_number": "1", "trainee_id": "1", "syear": "2019", "smonth": "06", "sday": "03", "eyear": "2019", "emonth": "08", "eday": "11"
                }).end((err, res) => {
                    if (res.status == '200') {
                        chai.request('http://localhost:4000').get('/apartment/getOccupancyInfo/1').end((err, res) => {
                            if (res.status == '200') {
                                var occ_id = res.body[0].apartment_rooms[0].room_occupancies[0]._id;
                                chai.request('http://localhost:4000').delete('/apartment/deleteOccupancy').set('content-type', 'application/json').send({ "_id": _id, "room_name_number": "1", "occ_id": occ_id }).end((err, res) => {
                                    if (res.status == '200') {
                                        chai.request('http://localhost:4000').delete('/apartment/deleteRoom').set('content-type', 'application/json').send({ "_id": _id, "room_name_number": "1" }).end((err, res) => {
                                            if (res.status == '200') {
                                                done();
                                            }
                                            else {
                                                console.log(`Expected 200 when deleting room but got ${res}. error is ${err}`);
                                            }
                                        });
                                    }
                                    else {
                                        console.log(`Expected 200 when deleting occupancy but got ${res}. error is ${err}`);
                                    }
                                });
                            }
                            else {
                                console.log(`Expected 200 when requesting occupancy info but got ${res}. error is ${err}`);
                            }
                        });
                    }
                    else {
                        console.log(`Expected 200 when adding occupancy but got ${res}. error is ${err}`);
                    }
                });
            }
            else {
                console.log(`Expected 200 when adding room but got ${res}. error is ${err}`);
            }
        });
    });
    it('get all', (done) => {
        chai.request('http://localhost:4000').get('/apartment/getAll').end((err, res) => {
            if (res.status == '200') {
                done();
            }
            else {
                console.log(`Expected 200 but got ${res}. error is ${err}`);
            }
        });
    });
    it('get by id', (done) => {
        chai.request('http://localhost:4000').get('/apartment/getById/' + _id).end((err, res) => {
            if (res.status == '200') {
                done();
            }
            else {
                console.log(`Expected 200 but got ${res}. error is ${err}`);
            }
        });
    });
    it('get by region', (done) => {
        chai.request('http://localhost:4000').get('/apartment/getByRegion/' + 'Manchester').end((err, res) => {
            if (res.status == '200') {
                done();
            }
            else {
                console.log(`Expected 200 but got ${res}. error is ${err}`);
            }
        });
    });
});