const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: { type: String, required: true},
    email: { type: String, requied: true, unique: true},
    password: { type: String, required: true},
    pic: { type: String,
               default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
            },
            isAdmin: {
              type: Boolean,
              required: true,
              default: false,
            },
},
{
    timestamps: true,
});

//Decrypt & match Password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//Encrypt Password
userSchema.pre("save", async function (next) {
    if (!this.isModified) {
      next();
    }
  
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  });

const User = mongoose.model('User', userSchema);

module.exports = User;