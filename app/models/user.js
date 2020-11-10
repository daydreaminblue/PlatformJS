const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')
const uniqueString = require('unique-string')
const mongoosePaginate = require('mongoose-paginate')

const userSchema = Schema(
  {
    name: { type: String, required: true },
    admin: { type: Boolean, default: 0 },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
)

userSchema.plugin(mongoosePaginate)

userSchema.pre('save', function (next) {
  let salt = bcrypt.genSaltSync(15)
  let hash = bcrypt.hashSync(this.password, salt)

  this.password = hash
  next()
})

userSchema.pre('findOneAndUpdate', function (next) {
  let salt = bcrypt.genSaltSync(15)
  let hash = bcrypt.hashSync(this.getUpdate().$set.password, salt)

  this.getUpdate().$set.password = hash
  next()
})

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password)
}

module.exports = mongoose.model('User', userSchema)
