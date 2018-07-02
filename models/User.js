const mongoose = require('mongoose');
const Hobby = require('./Hobby');
const bcrypt = require('bcryptjs');

delete mongoose.connection.models['User'];

Schema = mongoose.Schema;
const UserSchema = new Schema({
    userName:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email:{
        type: String,
        unique: true,
        trim: true
    },
    password:{
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    hobbies: [{type: Schema.Types.ObjectId, ref: 'Hobby'}]
});

//authenticate input against database
// UserSchema.statics.authenticate = function (email, password, callback) {
//     User.findOne({ email: email })
//     .exec(function (err, user) {
//     if (err) {
//         return callback(err)
//     } else if (!user) {
//         var err = new Error('User not found.');
//         err.status = 401;
//         return callback(err);
//     }

//     bcrypt.compare(password, user.password, function (err, result) {
//         if (result === true) {
//         return callback(null, user);
//         } else {
//         return callback();
//         }
//     })
//     });
// }

UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});
  
  
var User = mongoose.model('User', UserSchema);
module.exports = User;
