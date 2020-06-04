var mongoose = require('mongoose');
var siteTagSchema = new mongoose.Schema({
	name: String,
	description: String,
	default: Number,
	scale: Number,
	plus: Number,
	unit: String,
	is_active: Number,
	is_display: Number,
	priority: Number,
	note: String,
	site: {type: mongoose.Schema.Types.ObjectId, ref: 'Site'},
	tag: {type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}
	// parameters: [{type: mongoose.Schema.Types.ObjectId}],
	// gc_parameters: [{type: mongoose.Schema.Types.ObjectId}]
});

var SiteTag = mongoose.model('SiteTag', siteTagSchema, 'site_tag');

module.exports = SiteTag;