const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Task = require("./task")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    age: {
        type: Number,
        required: true,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error("Age must be positive number")
            }
        }
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Error")
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (value.length <= 6) {
                throw new Error("The length of the password must be greater than 6!")
            }
            else if (value.toLowerCase() === "password") {
                throw new Error("Password should not be password")
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer,
    }
}, {
    timestamps: true
})

userSchema.virtual("tasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "owner"
})

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, "thisisnodejs")
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.tokens
    delete userObject.password
    delete userObject.avatar

    return userObject
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error("unable to login")
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error("unable to login")
    }

    return user
}

//password encryption
userSchema.pre("save", async function (next) {
    const user = this
    // console.log(user)
    if (user.isModified("password")) {
        // console.log("inside")
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// detele task when deleting the user
userSchema.pre("remove", async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

const User = mongoose.model("User", userSchema)

module.exports = User