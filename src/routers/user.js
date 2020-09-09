const express = require("express")
const User = require("../models/user")
const { findById, update } = require("../models/user")
const auth = require("../middleware/auth")
const { sendWelcomeEmail, sendCancellationEmail } = require("../emails/account");
const multer = require('multer');
const router = new express.Router()

router.post("/users", async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send()
    }

})

router.post("/user/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post("/user/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((availableTokens) => {
            return availableTokens.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.post("/user/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.get("/users", async (req, res) => {
    try {
        const users = await User.find({})
        if (!users) {
            return res.status(404).send()
        }
        res.send(users)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get("/users/me", auth, async (req, res) => {
    res.send(req.user)
})

// router.get("/user/:id", async (req, res) => {
//     const id = req.params.id
//     try {
//         const user = await User.findById(id)
//         if (!user) {
//             return res.status(404)
//         }
//         res.send(user)
//     } catch (error) {
//         res.send(error)
//     }
// })

// router.patch("/user/:id", async (req, res) => {
//     const id = req.params.id
//     const updates = Object.keys(req.body)
//     console.log(updates)
//     const includedParams = ["name", "age", "email", "password"]
//     const isAvailable = updates.every((item) => {
//         return includedParams.includes(item)
//     })
//     console.log(isAvailable)
//     if (!isAvailable) {
//         return res.status(404).send("Please enter correct paramaters")
//     }
//     try {
//         const user = await User.findById(id)
//         updates.forEach((item) => user[item] = req.body[item])
//         await user.save()

//         // const user = await User.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
//         if (!user)
//             return res.status(404).send()
//         res.send(user)
//     } catch (error) {
//         res.status(500).send(error)
//     }
// }) 

router.patch("/user/me", auth, async (req, res) => {
    const updates = Object.keys(req.body)
    console.log(updates)
    const includedParams = ["name", "age", "email", "password"]
    const isAvailable = updates.every((item) => {
        return includedParams.includes(item)
    })
    console.log(isAvailable)
    if (!isAvailable) {
        return res.status(404).send("Please enter correct paramaters")
    }
    try {

        updates.forEach((item) => req.user[item] = req.body[item])
        await req.user.save()

        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})



// router.delete("/user/:id", async (req, res) => {
//     try {
//         const user = await User.findByIdAndDelete(req.params.id)
//         if (!user)
//             return res.status(404).send()
//         res.send(user)

//     } catch (error) {
//         res.status(500).send(error)
//     }
// })

router.delete("/user/me", auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

const upload = multer({
    limits: 1000000,
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("Please upload images in jpg,jpeg,png"))
        }
        cb(null, true)
    }
})

router.post("/user/me/avatar", auth, upload.single("data"), async (req, res) => {
    req.user.avatar = req.file.buffer
    await req.user.save()
    res.send(req.user)
}, (err, req, res, next) => {
    res.status(400).send({ error: err.message })
})

router.delete("/user/me/avatar", auth, async (req, res) => {
    req.user.avatar = undefined  // this removes the field from database
    await req.user.save()
    res.send(req.user)
})

router.get("/user/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set("Content-Type", "image/jpg").send(user.avatar)
    } catch (error) {
        res.status(500).send(error)
    }
})


module.exports = router