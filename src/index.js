const app = require('./app')

const port = process.env.PORT

// listen to the port
app.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})
