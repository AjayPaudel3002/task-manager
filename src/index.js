const express = require("express")
const app = express()
require("./db/mongoose")
const userRouter = require("./routers/user")
const taskRouter = require("./routers/task")

const port = process.env.PORT


app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

// const Task = require("./models/task")
// const User = require("./models/user")

// const main = async () => {
//     // const task = await Task.findById("5f57931b9b1d101af3ec27a5")
//     // await task.populate("owner").execPopulate()  //to find the user who is associated with this task
//     // console.log(task)

//     const user = await User.findById("5f57923eb3773f1a5a265d20")
//     await user.populate("tasks").execPopulate()
//     console.log(user.tasks)
// }

// main() 
