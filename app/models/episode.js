const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongoosePaginate = require('mongoose-paginate')
const bcrypt = require('bcrypt')

const episodeSchema = Schema(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course' },
    title: { type: String, required: true },
    body: { type: String, required: true },
    isFree: { type: Boolean, default: false },
    videoUrl: { type: String, required: true },
  },
  { timestamps: true }
)

episodeSchema.plugin(mongoosePaginate)

episodeSchema.methods.download = function (req) {
  if (!req.isAuthenticated()) return '#'

  let status = false
  if (this.type == 'free') {
    status = true
  } else if (this.type == 'vip') {
    status = req.user.isVip()
  } else if (this.type == 'cash') {
    status = req.user.checkLearning(this.course)
  }

  let timestamps = new Date().getTime() + 3600 * 1000 * 12

  let text = `aQTR@!#Fa#%!@%SDQGGASDF${this.id}${timestamps}`

  let salt = bcrypt.genSaltSync(15)
  let hash = bcrypt.hashSync(text, salt)

  return status ? `/download/${this.id}?mac=${hash}&t=${timestamps}` : '#'
}

episodeSchema.methods.path = function () {
  return `${this.course.path()}/${this.number}`
}
module.exports = mongoose.model('Episode', episodeSchema)
