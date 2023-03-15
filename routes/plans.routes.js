const express = require("express");
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
    console.log(req.body)

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
        .populate("author")
        .then(result => res.json(result))
        .catch(err => next(err))
})

router.post("/:plansId", isAuthenticated, (req, res, next) => {
    const { plansId } = req.params
    const { userId } = req.payload._id

    Plan.findById(plansId)
        .populate("author")
        .then(response => {
            User.findByIdAndUpdate(userId, { $push: { plansEnrolled: response } })
                .then((response) => {
                    res.json({ result: "ok" })
                })
        })
        .then(response => {
            Plan.findByIdAndUpdate(plansId, { $push: { participants: response } })
                .then((response) => {
                    res.json({ result: "ok" })
                })
        })
        .catch(err => next(err))
})

router.put("/:plansId/edit", (req, res, next) => {
    console.log("REQ. BODY EDIT:", req.body)
    const { title, description, images, toDate, fromDate, destination } = req.body

    const { plansId } = req.params

    Plan.findByIdAndUpdate(plansId, { title, description, images, toDate, fromDate, destination }, { new: true })
        .then(result => res.json(result))
        .catch(err => next(err))

})

router.delete("/:plansId/delete", (req, res, next) => {
    const { plansId } = req.params

    Plan.findByIdAndDelete(plansId)
        .then(response => {
            res.json({ result: "ok" })
        })
        .catch(err => next(err))
})






module.exports = router;
