var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/database');
require('../config/passport')(passport);
var jwt = require('jsonwebtoken');
var Hobby = require("../models/Hobby");
var mailgun = require('mailgun-js');


exports.create = function(req, res) {
    // Mailgun config
    const api_key = '5fb8abe4b5bfeb2eeb83b5d8cc9fc582-e44cc7c1-1455a6be';
    const DOMAIN = 'sandboxe9be62f6fe1b4fe0ba7094e6fde234e1.mailgun.org';
    const mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});
    
    // Twilio config
    var accountSid = 'AC5950c157606bcb45bad348527af8cc0d';
    var authToken = '3cc7fc1128faf691a5642d5d8e92ecd6';
    var twilio = require('twilio');
    var client = new twilio(accountSid, authToken);


    let token = getToken(req.headers);
    if (token) {
        // Validate request
        if (!req.body.name) {
            return res.status(400).send({
                message: "Hobby name cannot be empty"
            });
        }

        //Create a Hobby
        var hobby = new Hobby({
            name: req.body.name
        });

        // Save Hobby in the database
        hobby.save()
        .then(data=>{
            res.send(data);
            // Send user a mail
            var mail = {
                from: 'Mailgun Sandbox <postmaster@sandboxe9be62f6fe1b4fe0ba7094e6fde234e1.mailgun.org>',
                to : 'Esther <swiftestherduro@gmail.com>',
                subject: 'New Hobby Alert',
                text: `You just added ${JSON.stringify(hobby.name)} as your new hobby.`
            };
            mailgun.messages().send(mail, function(error, body) {
                console.log(error);
                console.log(body);
            });

            // Send user a text
            client.messages
            .create({
                body: `You just added ${hobby} as your new hobby.`,
                from: '+14156871686',
                to: '+23408160211811'
            })
            .then((error,message) => {
                // console.log(message.sid);
                console.log(error)})
            .done();

        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occured while creating the hobby."
            });
        });
    }
};

// Retrieve and return all Hobbies from the database
exports.findAll = (req,res)=>{
    let token = getToken(req.headers);
    if (token) {
        Hobby.find()
        .then(hobbies => {
            res.send(hobbies);
        }).catch(err => {
            message: err.message || "Some errors occured while retrieving hobbies."
        });
    }
};

// Update a hobby Identified by the hobbyId in the request
exports.update = (req,res) => {
    let token = getToken(req.headers);
    if (token) {
        // Validate request
        if (!req.body.name) {
            return res.status(400).send({
                message: "Hobby name cannot be empty"
            });
        }

        // Find hobby and update it with the request body
        Hobby.findByIdAndUpdate(req.params.hobbyId, {name: req.body.name}, {new:true})
        .then(hobby => {
            if (!hobby) {
                return res.status(404).send({
                    message: "Hobby not found with id " + req.params.hobbyId
                });
            }
            res.send(hobby);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Hobby not found with id " + req.params.hobbyId
                });
            }
            return res.status(500).send({
                message: "Error updating hobby with id " + req.params.hobbyId
            });
        });
    }
};

// Delete a hobby with the specified hobbyId in the request

exports.delete = (req,res) => {
    let token = getToken(req.headers);
    if (token) {
        Hobby.findByIdAndRemove(req.params.hobbyId)
        .then(hobby => {
            if (!hobby) {
                return res.status(404).send({
                    message: "Hobby not found with id " + req.params.hobbyId
                });
            }
            res.send({message: "Hobby deleted successfully!"});
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    message: "Hobby not found with id " + req.params.hobbyId
                });
            }
            return res.status(500).send({
                message: "Could not delete hobby with id " + req.params.hobbyId
            });
        });
        // Send the user a mail
        var api_key = '5fb8abe4b5bfeb2eeb83b5d8cc9fc582-e44cc7c1-1455a6be';
        var DOMAIN = 'sandboxe9be62f6fe1b4fe0ba7094e6fde234e1.mailgun.org';
        var mailgun = require('mailgun-js')({apiKey: api_key, domain: DOMAIN});

        var data = {
            from: 'Mailgun Sandbox <postmaster@sandboxe9be62f6fe1b4fe0ba7094e6fde234e1.mailgun.org>',
            to : 'Esther <swiftestherduro@gmail.com>',
            subject: 'New Hobby Alert',
            text: `You just removed ${JSON.stringify(hobby.name)} from your hobbies.`
        };
        mailgun.messages().send(data, function(error, body) {
            console.log(error);
            console.log(body);
        });

        // Send a message
        var accountSid = 'AC5950c157606bcb45bad348527af8cc0d';
        var authToken = '3cc7fc1128faf691a5642d5d8e92ecd6';
        var twilio = require('twilio');
        var client = new twilio(accountSid, authToken);

        client.messages
            .create({
                body: `You just removed ${JSON.stringify(hobby.name)} from your hobbies.`,
                from: '+14156871686',
                to: '+23408118476221'
            })
            .then((error,message) => {
                // console.log(message.sid);
                console.log(error)})
            .done();
    }
};

getToken = function (headers) {
    if (headers && headers.authorization) {
      var parted = headers.authorization.split(' ');
      if (parted.length === 2) {
        return parted[1];
      } else {
        return null;
      }
    } else {
      return null;
    }
};
