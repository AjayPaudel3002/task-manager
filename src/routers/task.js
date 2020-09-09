const express = require("express")
const router = new express.Router()
const Task = require("../models/task")
const auth = require("../middleware/auth")

// router.post("/tasks", async (req, res) => {
//     const task = new Task(req.body)
//     try {
//         await task.save()
//         res.status(201).send(task)
//     } catch (error) {
//         res.status(500).send(error)
//     }
// })

router.post("/tasks", auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})
// GET / tasks ? limit = 10
// GET / tasks ? limit = 10 & skip=20
// GET / tasks ? sortBy = createdAt : desc

router.get("/tasks", auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === "true" // if completed equals "true" then return true(Boolean) else return false(Boolean)
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":") //createdAt:desc
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1
    }

    console.log(sort)

    try {
        // const tasks = await Task.find({ owner: req.user._id })
        await req.user.populate({
            path: "tasks",
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            },

        }).execPopulate()
        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get("/task/:id", auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        console.log(task.description)
        if (!task)
            return res.status(404).send()
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.patch("/task/:id", auth, async (req, res) => {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const availableParams = ["description", "completed"]
    const isIncluded = updates.every((item) => availableParams.includes(item))

    if (!isIncluded)
        return res.status(404).send("Please check the params")
    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task)
            return res.status(400).send()

        updates.forEach((item) => task[item] = req.body[item])
        await task.save()
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }

})

router.delete("/task/:id", auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOneAndDelete({ _id, owner: req.user._id })
        if (!task)
            return res.status(404).send()
        res.send(task)

    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router