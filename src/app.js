const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()

// express middleware
// app.use((req, res, next) => {
//     if (req.method === 'GET') {
//         res.send('Get request are disabled')
//     } else {
//         next()
//     }
// })

// app.use((req, res, next) => {
//     res.status(503).send('Sorry! This is site is under maintenance.')
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

module.exports = app