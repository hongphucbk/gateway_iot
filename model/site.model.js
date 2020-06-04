var mongoose = require('mongoose');
var stationSchema = new mongoose.Schema({
	site_id: String,
	site_name: String,
	site_address: String,
	ip: String,
	port: Number,
	username : String,
	password : String,
	is_active: Number,
	is_display: Number,
	priority: Number,
	note: String,
	tags: [{ type: mongoose.Schema.Types.ObjectId }],
	//site_tags: [{ type: mongoose.Schema.Types.ObjectId }],
	// parameters: [{type: mongoose.Schema.Types.ObjectId}],
	// gc_parameters: [{type: mongoose.Schema.Types.ObjectId}]
});

var Site = mongoose.model('Site', stationSchema, 'site');

module.exports = Site;