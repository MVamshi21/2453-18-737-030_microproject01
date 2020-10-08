const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const MongoClient = require('mongodb').MongoClient;

let server = require('./server');
let config = require('./config');
let middleware = require('./middleware');
const response = require('express');

const url = 'mongodb://127.0.0.1:27017';
const dbname = "HospitalManagement";
let db

MongoClient.connect(url, (err, client) => {
    if (err) return console.log(err);
    db = client.db(dbname);
    console.log(`connected database: ${url}`);
    console.log(`Database:${dbname}`);
});

//fetching hospital details
app.get('/hospital', middleware.checkToken, (req, res) => {
    console.log("processing the data");
    const data = db.collection("hospital").find().toArray()
        .then(result => res.json(result));
});

// fetching Ventilator details
app.get('/ventilatorDetails', middleware.checkToken, (req, res) => {
    console.log("processing the data");
    const data = db.collection("ventilators").find().toArray()
        .then(result => (res.json(result)));
});

//finding ventilators by status
app.post('/searchventbystatus', middleware.checkToken, (req, res) => {
    const status = req.query.status;
    console.log(status);
    const ventillatordetails = db.collection('ventilators')
        .find({ "status": status }).toArray().then(result => res.json(result));
});

//finding ventilator by name of the hospital
app.post('/searchventbyhospitalname', middleware.checkToken, (req, res) => {
    const name = req.query.name;
    console.log(name);
    const ventilatordeatils = db.collection('ventilators')
        .find({ 'name': new RegExp(name, 'i') }).toArray().then(result => res.json(result));
});

//finding hospital by name
app.post('/searchhospitalbyname', middleware.checkToken, (req, res) => {
    const name = req.query.name;
    console.log(name);
    const ventilatordeatils = db.collection('hospital')
        .find({ 'name': new RegExp(name, 'i') }).toArray().then(result => res.json(result));
});

//updating ventilator details 
app.put('/updateventilator', middleware.checkToken, (req, res) => {
    const ventilatorid = { ventilatorid: req.query.ventilatorid };
    console.log(ventilatorid);
    const newvalues = { $set: { status: req.query.status } };
    console.log("updating ventilator details, please wait a moment");
    db.collection("ventilators").updateOne(ventilatorid,newvalues, function (err, result) {
        res.json('updated one document');
        if (err) throw err;
    });
});

//add ventilator
app.post('/addventilator', (req, res) => {
    const hid = req.query.hid;
    const ventid = req.query.ventilatorid;
    const status = req.query.status;
    const name = req.query.name;
    console.log("adding ventilator, please wait a moment");
    const item = { "hid": hid, "ventilatorid": ventid, "status": status, "name": name };
    db.collection("ventilators").insertOne(item, function (err, result) {
        res.json("inserted successfully");
    });
});

//delete ventilator by ventilatorid
app.delete('/deleteventilator', middleware.checkToken, (req, res) => {
    const ventilatorid = req.query.ventilatorid;
    console.log(ventilatorid);
    const temp = { "ventilatorid": ventilatorid };
    db.collection("ventilators").deleteOne(temp, function (err, obj) {
        if (err) throw err;
        res.json("deleted one element");
    });
});


app.listen(3000, (req, res) => {
    console.log("working well");
});
