var express = require('express');
var router = express.Router();
var passport = require('passport');
require('../config/passport')(passport);
var jwt = require('jsonwebtoken');


var UserController = require('../controllers/UserController');
var HobbyController = require('../controllers/HobbiesController');

// Routes
router.post('/signup',  UserController.signUp);
router.post('/signin', UserController.signIn);

router.get('/hobbies', passport.authenticate('jwt', {session: false}), HobbyController.findAll);
router.post('/hobbies', passport.authenticate('jwt', {session: false}), HobbyController.create);
router.put('/hobbies/:hobbyId', passport.authenticate('jwt', {session: false}), HobbyController.update);
router.delete('/hobbies/:hobbyId', passport.authenticate('jwt', {session: false}), HobbyController.delete);

module.exports = router;