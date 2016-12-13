var mongoose = require('mongoose');

var ItemSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    defenderScore: { type: Number },
    attackerScore: { type: Number }
});

var Item = mongoose.model('Item', ItemSchema);

module.exports = Item;