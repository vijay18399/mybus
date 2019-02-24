var express = require('express');
var router = express.Router();
var monk=require('monk');
var multer=require('multer');
var db=monk('localhost:27017/mybus');
var data=db.get('data');
var notify=db.get('notify');
var pool=db.get('pool');
var students=db.get('students');
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
         students.find({},function(err,students){
        res.locals.data = data;
        res.locals.notify = notify;
      res.locals.messages = messages;
       res.locals.complaints = complaints;
        res.locals.pool = pool;
         res.locals.students = students;
 res.render('admin');
     });  }); });  });  });   }); 
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
router.post('/uploadxlsx2', upload.single('file'), function(req, res, next) {
   

var location ='public/uploads/'+req.file.originalname;
xlsx2json(location,
    {
        
        mapping: {
            'NAME': 'A',
            'ROLL_NUMBER': 'B',
            'HOME_TOWN': 'C',
            'PASSING_YEAR': 'D',
            'COLLEGE': 'E',
            'GROUP':'F',
            'PASSWORD':'G'
        }
    }).then(jsonArray => {
var i;
for (i = 0; i < jsonArray.length; i++) {
  console.log(jsonArray[i]);
    students.insert(jsonArray[i], function(err,data){
console.log(data);
res.redirect('/admin');
    
});
} 

});
  
});

router.post('/allocate', function(req, res) {

ok ={
    ID : req.body.ID
  }
 

    students.update({"ROLL_NUMBER" : req.body.ROLL_NUMBER},{$set:ok}, function(err,docs){
       data.update(ok,{ $inc: { COUNT: +1 } } , function(err,docs2){ 
    console.log(docs);
      console.log(docs2);
    res.redirect('/admin');
    });
  });
  });
router.post('/add_data', function(req, res) {
   
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
  data.insert(some, function(err,docs){
    console.log(docs);
    res.redirect('/admin');
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
router.post('/get_students', function(req, res) {
      console.log(req.body.sno);
    var id = req.body.sno;
       students.find({"ID" : id },function(err,docs){
            console.log(docs);
         res.send(docs);
     }); 

      });
router.post('/options', function(req, res) {
      console.log(req.body.sno);
    var id = req.body.sno;
       students.find({"ROLL_NUMBER" : id },function(err,docs){
      var area = docs[0].HOME_TOWN;
      console.log(area);
         data.find({ STOPS: { $regex: area , $options: "x" }} ,function(err,docs2){
          var x={
              "docs":docs,
              "docs2":docs2
                 }
          console.log(x);
         res.send(x);
        
     }); 

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
router.post('/delete', function(req, res) {
    console.log(req.body.PASSING_YEAR);
    var PASSING_YEAR = req.body.PASSING_YEAR;

    
        students.find({"PASSING_YEAR":PASSING_YEAR}, function(err,batch){
           console.log(batch);
              console.log(batch.length);
              var myarray = new Array();
              for (var i = 0; i < batch.length; i++) {
                myarray[i] =batch[i].ID;
               } 
         console.log(myarray);
        
         
     data.update({ID:{$in:myarray}},{ $inc: { COUNT: -1 } } , function(err,docs2){ 
        students.remove({"PASSING_YEAR":PASSING_YEAR}, function(err,docs){
        console.log(docs);
     res.redirect('/admin');
        });
    }); 
    });
});

module.exports = router;
