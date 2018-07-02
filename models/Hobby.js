const mongoose = require('mongoose');
require('./User');

Schema = mongoose.Schema;

const HobbySchema = new Schema({
    name:{
        type: String,
        required: true,
        max: 100,
        unique: true
    },
    owner: {type: Schema.ObjectId, ref: 'User', required:true}
});

module.exports = mongoose.model('Hobby', HobbySchema);