const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongoosePaginate = require('mongoose-paginate')

const courseSchema = Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    teacher: { type: Schema.Types.ObjectId, ref: 'Teacher' },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    summary: { type: String, required: true },
    body: { type: String, required: true },
    price: { type: String, required: true },
    lastPrice: { type: String, required: false },
    offPercentage: { type: Number, default: 0 },
    images: { type: Object, required: true },
    thumb: { type: String, required: true },
    video: { type: Object, required: false },
    time: { type: String, default: '00:00:00' },
    viewCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true } }
)

courseSchema.plugin(mongoosePaginate)

courseSchema.methods.path = function () {
  return `/courses/${this.slug}`
}
courseSchema.methods.off = async function (percentage) {
  this.lastPrice = this.price
  this.price -= (percentage * this.price) / 100
  await this.save()
}

courseSchema.methods.inc = async function (field, num = 1) {
  this[field] += num
  await this.save()
}

courseSchema.virtual('episodes', {
  ref: 'Episode',
  localField: '_id',
  foreignField: 'course',
})

courseSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'course',
})

module.exports = mongoose.model('Course', courseSchema)
