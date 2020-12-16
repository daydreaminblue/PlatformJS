const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

const categorySchema = Schema({
    name : { type : String , required : true},
    slug : { type : String , required : true},
    parent : { type : Schema.Types.ObjectId , ref : 'Category' , default : null },
    coursess : [{ type : Schema.Types.ObjectId , ref : 'Course' , default : null }],
} , { timestamps : true , toJSON : { virtuals : true } });

categorySchema.plugin(mongoosePaginate);

categorySchema.virtual('childs' , {
    ref : 'Category',
    localField : '_id',
    foreignField : 'parent'
});

categorySchema.virtual('courses' , {
    ref : 'Course',
    localField : '_id',
    foreignField : 'course'
});

categorySchema.methods.path = function() {
    return `/categories/${this.slug}`;
}


module.exports = mongoose.model('Category' , categorySchema);