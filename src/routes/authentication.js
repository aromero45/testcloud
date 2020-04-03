const express = require('express');
const router = express.Router();
const passport = require('passport');

const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

router.get('/signup', isNotLoggedIn, (req, res) => {

     res.render('auth/signup');
});


router.post('/signup', isNotLoggedIn, passport.authenticate('local.signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true   
})); 

router.get('/signin', isNotLoggedIn, (req, res) => {
    
  res.render('auth/signin');
}); 

router.post('/signin', isNotLoggedIn, (req, res, next) => {
    /*
    req.check('username', 'Username es Requerido').notEmpty();
    req.check('password', 'Pass es Requerido').notEmpty();
    const errors = req.validationErrors();
    if (errors.length > 0) {
      req.flash('message', errors[0].msg);
      res.redirect('/signin');
    } */
    passport.authenticate('local.signin', {
      successRedirect: '/profile',
      failureRedirect: '/signin',
      failureFlash: true
    })(req, res, next);
}); 

router.get('/profile', isLoggedIn, (req, res) => {  
   res.render('profile');
});

router.get('/logout', isLoggedIn, (req, res) => {
      req.logOut();
      res.redirect('/signin');
});
module.exports = router; 