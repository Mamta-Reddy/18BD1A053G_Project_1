const express=require('express'); //use the express module
const app=express();  //create an object of the express module

//connecting server file 
let server=require('./server');
let middleware=require('./middleware');

//bodyParser
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


//for mongodb
const MongoClient=require('mongodb').MongoClient;//MongoClient got added into our prog

//database connection
const url='mongodb://127.0.0.1:27017';
const dbName='HospitalManagement';

let db
MongoClient.connect(url,{ useUnifiedTopology:true },(err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`Connected Database: ${url}`);
    console.log(`Database : ${dbName}`);
    
});

//fetching hospital details
app.get('/getHospitalDetails',middleware.checkToken,function(req,res){
    console.log('Fetching Data from hospital Collection');
    var data=db.collection('hospitals').find().toArray()
            .then(result => res.json(result));
});

//fetching ventilator details
app.get('/getVentilatorDetails',middleware.checkToken, function(req,res){
    console.log('Fetching Data from Ventilators Collection');
    var data=db.collection('Ventilators').find().toArray().then(result => res.json(result));
});

//search ventilator by status
app.post('/searchVentilatorbyStatus',middleware.checkToken,(req,res)=>{
    var status=req.body.status;
    console.log(status);
    var vdetails=db.collection('Ventilators').find({"status":status}).toArray().then(result=>res.json(result));
});

//search ventilator by hospital name
app.post('/searchVentilatorbyName',middleware.checkToken,function(req,res){
    var name=req.query.name;
    console.log(name);
    var ventDetails=db.collection('Ventilators').find({'name':new RegExp(name, 'i')}).toArray().then(result=>res.json(result));
});

//search hospital by name
app.post('/searchHospitalbyName',middleware.checkToken,(req,res)=>{
    var hname=req.query.name;
    console.log(hname);
    var hospDetails=db.collection('hospitals').find({"name":new RegExp(hname, 'i')}).toArray().then(result=>res.json(result));
})

//update ventilator details
app.put('/updateVentilator',middleware.checkToken,(req,res)=>{
    var vid={ ventilatorId: req.body.ventilatorId};
    console.log(vid);
    var updatedVal={ $set: { status: req.body.status } };
    db.collection('Ventilators').updateOne(vid,updatedVal,function(err,result){
        res.json('1 value updated');
        if(err) throw err;
    });
});

//add ventilator
app.post('/addVentilator',middleware.checkToken,(req,res)=>{
    var hId=req.body.hId;
    var ventilatorId=req.body.ventilatorId;
    var status=req.body.status;
    var name=req.body.name;
    var item={ hId:hId, ventilatorId:ventilatorId, status:status, name:name };
    db.collection('Ventilators').insertOne(item,function(err,result){
        res.json('Item inserted');
    });
});

//delete ventilator by vid
app.delete('/deleteVentilator',middleware.checkToken,(req,res)=>{
    var vid=req.query.ventilatorId;
    console.log(vid);
    var vid1={ventilatorId:vid};
    db.collection('Ventilators').deleteOne(vid1,function(err,obj){
        if(err) throw err;
        res.json('1 document deleted');
    });
});

app.listen(3000);
