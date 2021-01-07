const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongoosePaginate = require('mongoose-paginate')

const commentSchema = Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    course: { type: Schema.Types.ObjectId, ref: 'Course', default: undefined },
    episode: {
      type: Schema.Types.ObjectId,
      ref: 'Episode',
      default: undefined,
    },
    approved: { type: Boolean, default: false },
    comment: { type: String, required: true },
  },
  { timestamps: true, toJSON: { virtuals: true } }
)

commentSchema.plugin(mongoosePaginate)

commentSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parent',
})

const commentBelong = (doc) => {
  if (doc.course) return 'Course'
  else if (doc.episode) return 'Episode'
}

commentSchema.virtual('belongTo', {
  ref: commentBelong,
  localField: (doc) => commentBelong(doc).toLowerCase(),
  foreignField: '_id',
  justOne: true,
})

module.exports = mongoose.model('Comment', commentSchema)
