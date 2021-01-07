const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongoosePaginate = require('mongoose-paginate')

const teacherSchema = Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: Object, default: 'wait' },
    field: { type: String, required: true },
    college: { type: String, required: true },
    resume: { type: Object, required: true },
    salesCount: { type: Number, default: 0 },
    wallet: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true } }
)

teacherSchema.plugin(mongoosePaginate)

module.exports = mongoose.model('Teacher', teacherSchema)
