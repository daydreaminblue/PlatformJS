const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const orderSchema = Schema({
    user : { type : Schema.Types.ObjectId , ref : 'User' },
    course : { type : Schema.Types.ObjectId , ref : 'Course' }
} , { timestamps : true , toJSON : { virtuals : true } });

orderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Order' , orderSchema);