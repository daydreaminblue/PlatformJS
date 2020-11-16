const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongoosePaginate = require('mongoose-paginate')

const courseSchema = Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    body: { type: String, required: true },
    price: { type: String, required: true },
    images: { type: Object, required: true },
    thumb: { type: String, required: true },
    tags: { type: String, required: true },
    time: { type: String, default: '00:00:00' },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true } }
)

courseSchema.plugin(mongoosePaginate)

courseSchema.methods.path = function () {
  return `/courses/${this.slug}`
}

courseSchema.methods.inc = async function (field, num = 1) {
  this[field] += num
  await this.save()
}

module.exports = mongoose.model('Course', courseSchema)
