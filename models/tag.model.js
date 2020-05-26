var mongoose = require('mongoose');
var tagSchema = new mongoose.Schema({
	name: String,
	description: String,
	value: Number,
	unit: Number,
	is_active: Number,
	is_display: Number,
	priority: Number,
	note: String,
	// parameters: [{type: mongoose.Schema.Types.ObjectId}],
	// gc_parameters: [{type: mongoose.Schema.Types.ObjectId}]
});

var Tag = mongoose.model('Tag', tagSchema, 'tag');

module.exports = Tag;