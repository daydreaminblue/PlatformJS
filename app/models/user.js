const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')
const uniqueString = require('unique-string')
const mongoosePaginate = require('mongoose-paginate')

const userSchema = Schema(
  {
    name: { type: String, required: false },
    admin: { type: Boolean, default: 0 },
    isTeacher: { type: Boolean, default: false },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    rememberToken: { type: String, default: null },
    orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'Course', default: null }],
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Course', default: null }],
  },
  { timestamps: true, toJSON: { virtuals: true } }
)

userSchema.plugin(mongoosePaginate)

userSchema.methods.hashPassword = function (password) {
  let salt = bcrypt.genSaltSync(15)
  let hash = bcrypt.hashSync(password, salt)

  return hash
}

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password)
}

userSchema.methods.hasRole = function (roles) {
  let result = roles.filter((role) => {
    return this.roles.indexOf(role) > -1
  })

  return !!result.length
}

userSchema.methods.setRememberToken = function (res) {
  const token = uniqueString()
  res.cookie('remember_token', token, {
    maxAge: 1000 * 60 * 60 * 24 * 90,
    httpOnly: true,
    signed: true,
  })
  this.update({ rememberToken: token }, (err) => {
    if (err) console.log(err)
  })
}

userSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'user',
})

module.exports = mongoose.model('User', userSchema)