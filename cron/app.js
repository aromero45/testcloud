var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
const path = require('path');
var AWS = require('aws-sdk');
const dotenv = require('dotenv');
var logger = require('morgan');
var fs = require('fs'); 
const exec = require('child_process').exec;
var namefiles = [];
var extfiles = [];
const cron = require("node-cron");
var fileUpload = require('express-fileupload')

//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

dotenv.config( {path: "../environments/aws.env"});

const database={
  host:process.env.HOST,
  port:process.env.PORT_DB,
  user:process.env.USER_DB,
  password:process.env.PASSWORD_DB,
  database:process.env.DATABASE
};

var app = express();
app.set('port', process.env.PORT || 3000);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(fileUpload());


/*  EJEMPLO DE SUBIR IMAGENES
app.post('/cargar', function(req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('./imagenes/coste.png', function(err) {
    if (err)
      return res.status(500).send(err);

    res.send('File uploaded!');
  });
});
*/

app.post('/convertmp4', (rep, res) => {
    
    //var child = exec('ffmpeg -i  ./videos/otro.avi ./converts/otro.mp4'
   
})

cron.schedule("0,10 * * * *", function() { //se ejecuta cada 10 minutos
  console.log("running a task every 10 minutes");

  fs.readdir( '/home/alex/Desktop/Grupo06-BashVideo/test1/mywebsite/videos', (error, files) => { //directorio de los videos
    let totalFilesV = files.length; // return the number of files
    console.log(totalFilesV); // print the total number of files
    for(var i=0; i<totalFilesV; i++)
    {
        var ext = path.extname(files[i]);
        var file = path.basename(files[i],ext);
        console.log(files[i]); //print the file
        console.log(file);
        console.log(ext);
        namefiles.push(file); //store the file name into the array files1
        extfiles.push(ext);

        var child = exec('ffmpeg -i ' + './videos/' + namefiles[i] + extfiles[i] + ' ./converts/' + namefiles[i] + '.mp4',
        function (error, stdout, stderr) {
        console.log(stdout);
        if (error !== null) {
          console.log('exec error: ' + error);
        }
      });
    }

  });
});



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', indexRouter);
//app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), () => {
  console.log('Server en puerto', app.get('port'));
});

module.exports = app;