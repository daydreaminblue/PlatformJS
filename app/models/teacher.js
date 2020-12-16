const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const teacherSchema = Schema({
    user : { type : Schema.Types.ObjectId , ref : 'User' },
} , { timestamps : true , toJSON : { virtuals : true } });

teacherSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Teacher' , teacherSchema);