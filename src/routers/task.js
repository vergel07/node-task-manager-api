const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

// Creating new task
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

// Reading all tasks
// GET /tasks?completed=boolean
// GET /task?limit=10&skip=0
// GET /task?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    //const owner = req.user._id
    // const task = await Task.find({ owner }) -- alternative way
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send()
    }
}) 

// Reading task by ID
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    const owner = req.user._id

    try {
        const task = await Task.findOne({ _id, owner })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

// Updating task document by ID
router.patch('/tasks/:id', auth, async (req, res) => {    
    const updates = Object.keys(req.body)
    const allowedUpdate = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdate.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid Updates' })
    }

    try {
        const _id = req.params.id
        const owner = req.user._id
        const task = await Task.findOne({_id, owner})

        if (!task){
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

        res.send(task)
    } catch (error) {
        res.status(500).send()
    }
})

// Deleting task document by ID
router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    const owner = req.user._id
    try {
        const task = await Task.findOneAndDelete({ _id, owner })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (error) {
        res.status(500).send()
    }
})

module.exports = router