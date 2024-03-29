const express = require("express");
const canEdit = require("../middleware/edit.middleware.js");
const router = express.Router();
const { isAuthenticated } = require("../middleware/jwt.middleware.js");

const Plan = require("../models/Plan.model");
const User = require("../models/User.model");




router.get("/", (req, res, next) => {
    Plan.find()
        .then(results => res.json(results))
        .catch(err => next(err))
});



router.post("/create", isAuthenticated, (req, res, next) => {

    const userId = req.payload._id

    const { title, description, images, fromDate, toDate, destination } = req.body

    Plan.create({ title, description, images, fromDate, toDate, destination, author: userId })
        .then(response => {
            User.findByIdAndUpdate(userId, { $push: { plansMade: response } })
                .then((response) => {
                    res.json({ result: "ok" })
                })
                .catch(err => next(err))
        })
        .catch(err => next(err))

})


router.get("/:plansId", (req, res, next) => {

    const { plansId } = req.params

    Plan.findById(plansId)
        .populate("author participants")
        .then(result => res.json(result))
        .catch(err => next(err))
})

router.post("/:plansId/join", isAuthenticated, (req, res, next) => {
    const { plansId } = req.params
    const userId = req.payload._id

    const enrolled = req.payload.plansEnrolled
    console.log(enrolled)

    Plan.findById(plansId)
        .populate("participants")
        .then(response => {
            return (User.findByIdAndUpdate(userId, { $push: { plansEnrolled: response } }))
        })
        .then(response => {
            return (Plan.findByIdAndUpdate(plansId, { $push: { participants: response } }))

        })
        .catch(err => next(err))
})


router.put("/:plansId/edit", isAuthenticated, (req, res, next) => {
    console.log("REQ. BODY EDIT:", req.body)
    const { title, description, images, toDate, fromDate, destination } = req.body
    console.log("req.payload", req.payload)
    const { plansId } = req.params

    Plan.findByIdAndUpdate(plansId, { title, description, images, toDate, fromDate, destination }, { new: true })
        .populate("author")
        .then(result => res.json(result))
        .catch(err => next(err))

})

router.delete("/:plansId/delete", isAuthenticated, (req, res, next) => {
    const { plansId } = req.params

    Plan.findByIdAndDelete(plansId)
        .populate("author")
        .then(response => {
            res.json({ result: "ok" })
        })
        .catch(err => next(err))
})






module.exports = router;
