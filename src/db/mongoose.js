const mongoose = require("mongoose")

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})


// const myData = new User({
//     name: "raja",
//     email: "raja@gmail.com",
//     password: "raja@123"

// })

// myData.save().then((result) => {
//     console.log(result)
// }).catch((err) => {
//     console.log(err)
// })

// const tasks = mongoose.model("tasks", {
//     descriptions: {
//         type: String
//     },
//     completed: {
//         type: Boolean
//     }
// })

// const myTask = new tasks({
//     descriptions: "Read Books",
//     completed: false
// })

// myTask.save().then((res) => {
//     console.log(res)
// }).catch((err) => {
//     console.log(err)
// })