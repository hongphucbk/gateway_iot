var mongoose = require('mongoose');
var rawDataSchema = new mongoose.Schema({
	site_id: String,
	site_name: String,
	information: Object,
	created_at: Date,
	tier1: Number,
	tier2: Number,
	is_active: Number,
	is_display: Number,
	priority: Number,
	note: String,
	// parameters: [{type: mongoose.Schema.Types.ObjectId}],
	// gc_parameters: [{type: mongoose.Schema.Types.ObjectId}]
});

var RawData = mongoose.model('RawData', rawDataSchema, 'raw_data');

module.exports = RawData;