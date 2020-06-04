var mongoose = require('mongoose');
var calcDataSchema = new mongoose.Schema({
	site_id: String,
	site_name: String,
	avr_flow: Number,
	tier1: Number,
	tier2: Number,
	created_at: Date,
	is_active: Number,
	is_display: Number,
	priority: Number,
	note: String,
	// parameters: [{type: mongoose.Schema.Types.ObjectId}],
	// gc_parameters: [{type: mongoose.Schema.Types.ObjectId}]
});

var CalcData = mongoose.model('CalcData', calcDataSchema, 'calc_data');

module.exports = CalcData;