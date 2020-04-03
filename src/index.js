const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MySQLStore = require('express-mysql-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const validator = require('express-validator');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');

/*if(process.env.NODE_ENV === 'local'){
  dotenv.config( {path: "./environments/local.env"});
}else{
  dotenv.config( {path: "./environments/aws.env"});
}*/

dotenv.config( {path: "../environments/local.env"});

const database={
  user:process.env.USER_DB,
  password:process.env.PASSWORD_DB,
  database:process.env.DATABASE
};

console.log("Usuario db",process.env.USER_DB);
console.log("password db",database.password);
//inicializar
const app = express();
require('./lib/passport');

//settings 
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs',
  helpers: require('./lib/handlebars')
}))
app.set('view engine', '.hbs');

//Middlewares

app.use(morgan('dev'));
app.use(express.urlencoded({extended: false})); 
app.use(express.json()); 
app.use(fileUpload());

app.use(session({
   secret: 'alex',
   resave: false,
   saveUninitialized: false,
   store: new MySQLStore(database)
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
//app.use(validator());

//Global variables
app.use ((req, res, next) =>{
  app.locals.success = req.flash('success');
  app.locals.message = req.flash('message');
  app.locals.user = req.user;  
  next();
});

//routes
app.use(require('./routes/index'));
app.use(require('./routes/authentication'));
app.use('/links',require('./routes/links'));
app.use('/videos',require('./routes/videos'));

//public

app.use(express.static(path.join(__dirname, 'public')));

//start de server


app.listen(app.get('port'), () => {
    console.log('Server en puerto', app.get('port'));
});