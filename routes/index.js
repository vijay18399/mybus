var express = require('express');
var router = express.Router();
var monk=require('monk');
var multer=require('multer');
var db=monk('localhost:27017/mybus');
var data=db.get('data');
var notify=db.get('notify');
var pool=db.get('pool');
var users=db.get('users');
var complaints=db.get('complaints');

var messages=db.get('messages');
var xlsx2json = require('xlsx2json');

var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, 'public/uploads/')
        },
        filename: function (req, file, cb) {
            //var datetimestamp = Date.now();
            cb(null, file.originalname)
        }
});
var upload = multer({ storage: storage })


router.get('/', function(req, res, next) {
  notify.find({},function(err,notify){
      res.locals.notify = notify;
  res.render('index');
}); });
router.get('/login', function(req, res, next) {

  res.render('login');
 });
router.get('/register', function(req, res, next) {

  res.render('register');
 });
router.post('/login', function(req, res, next) {
console.log(req.body.username);
  console.log(req.body.password);
  var data={
    username : req.body.username,
    password : req.body.password
  }
  users.findOne(data, function(err,docs){
    if(docs){
      delete docs.password;
        req.session.user=docs;
        console.log('success');
        res.redirect('/admin');
    }
    else{
      console.log('fail');
      res.render('login', {err:'Invalid login credentials', title: 'CSR'})
    }
  });
 });

router.post('/register', function(req, res, next) {

    console.log(req.body.username);
    
    console.log(req.body.password);

    var data={
         username : req.body.username,
          password : req.body.password
       
         
          } 
    users.insert(data,function(err,docs){
  
    if(err)
  {
    console.log(err);
  }
  else
  {
    console.log(docs);

  }
    res.redirect('/login');  
});

 });

router.get('/admin', function(req, res) {
 if(req.session && req.session.user){
    res.locals.user = req.session.user;
    console.log(req.session.user._id);
 data.find({},function(err,data){
   messages.find({},function(err,messages){
      notify.find({},function(err,notify){
     complaints.find({},function(err,complaints){
       pool.find({},function(err,pool){
        res.locals.data = data;
        res.locals.notify = notify;
      res.locals.messages = messages;
       res.locals.complaints = complaints;
        res.locals.pool = pool;
 res.render('admin');
     });  }); });  });  }); 
}


    else{
    req.session.reset();
    res.redirect('/login');
  }

      });
router.post('/uploadxlsx', upload.single('file'), function(req, res, next) {
   

var location ='public/uploads/'+req.file.originalname;
xlsx2json(location,
    {
        
        mapping: {
            'ID': 'A',
            'STOPS': 'B',
            'PARKLOC': 'C',
            'DESTINATION': 'D',
            'DRIVER_NAME': 'E',
            'CONTACT':'F',
            'MTIME':'G',
            'ETIME':'H'

        }
    }).then(jsonArray => {
var i;
for (i = 0; i < jsonArray.length; i++) {
  console.log(jsonArray[i]);
    data.insert(jsonArray[i], function(err,data){
console.log(data);
res.redirect('/admin');
    
});
} 

});
  
});
router.post('/edit_data', function(req, res) {
    console.log(req.body.sno);
    var id = req.body.sno;
    data.find({"_id":id}, function(err,docs){
        console.log(docs);
         res.send(docs);
    });
});
router.post('/remove_data', function(req, res) {
    console.log(req.body.sno);
    var id = req.body.sno;
    data.remove({"_id":id}, function(err,docs){
        console.log(docs);
      res.send(docs);
    });
});
router.post('/update_data', function(req, res) {
   
  var some = {

    ID : req.body.ID,
    STOPS : req.body.STOPS,
    PARKLOC : req.body.PARKLOC,
    DESTINATION : req.body.DESTINATION,
    DRIVER_NAME : req.body.DRIVER_NAME,
    CONTACT : req.body.CONTACT,
      MTIME : req.body.MTIME ,
       ETIME : req.body.ETIME
         }
         console.log(some);
  data.update({"_id" : req.body._id},{$set:some}, function(err,docs){
    console.log(docs);
    res.redirect('/admin');
  });
});
router.post('/add_notify', function(req, res) {
  
    var data = {
        ID : req.body.ID,
         message : req.body.message
    }
    console.log(data);
    notify.insert(data, function(err,data){
    res.redirect('/admin');
    });
});

router.post('/delete-notify', function(req, res) {
    console.log(req.body.sno);
    var id = req.body.sno;
    notify.remove({"_id":id}, function(err,docs){
        console.log(docs);
      res.send(docs);
    });
});
router.post('/search', function(req, res) {
    console.log(req.body.key);
 
if(isNaN(req.body.key)){
     
    var pattern = req.body.key
    console.log(pattern + " is not a number <br/>");
    data.find( { STOPS: { $regex: pattern , $options: "x" }} , function(err,docs){
     
   notify.find({},function(err,notify){
     console.log(docs);
        res.locals.mydata = docs;
      res.locals.notify = notify;
  res.render('index');
});
 });

 

 }else{
     var key=req.body.key;
  console.log(key + " is  a number <br/>");
    data.find({"ID":key}, function(err,docs){     
  notify.find({},function(err,notify){
    res.locals.mydata = docs;
      res.locals.notify = notify;
  res.render('index');
});
    });
 }
  
});
router.post('/message', function(req, res) {
  
    var data = {
        ID : req.body.ID,
        ROLL_NUMBER : req.body.ROLL_NUMBER,
        Regarding : req.body.Regarding,
         message : req.body.message
    }
    console.log(data);
    complaints.insert(data, function(err,data){
    res.redirect('/');
    });
});
router.post('/delete-complaint', function(req, res) {
    console.log(req.body.sno);
    var ROLL_NUMBER = req.body.sno;
    complaints.remove({"ROLL_NUMBER":ROLL_NUMBER}, function(err,docs){
        console.log(docs);
      res.send(docs);
    });
});

router.post('/pool', function(req, res) {
  
    var data = {
        STOP : req.body.STOP,
        ROLL_NUMBER : req.body.ROLL_NUMBER,
        Regarding : req.body.Regarding,
         message : req.body.message
    }
    console.log(data);
    pool.insert(data, function(err,data){
    res.redirect('/');
    });
});
router.post('/delete-pool', function(req, res) {
    console.log(req.body.sno);
    var ROLL_NUMBER = req.body.sno;
    pool.remove({"ROLL_NUMBER":ROLL_NUMBER}, function(err,docs){
        console.log(docs);
      res.send(docs);
    });
});
module.exports = router;
