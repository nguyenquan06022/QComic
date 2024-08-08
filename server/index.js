const express = require('express')
const {engine} = require('express-handlebars')
const morgan = require('morgan')
const router = require('./resources/routers/index')
const path = require('path')
const port = 3000
const app = express()

app.use(morgan('combined'))
app.use(express.static(path.join(__dirname,'public')))
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())
app.engine('hbs',engine({
    extname : '.hbs'
}))
app.set('view engine','hbs')
app.set('views','./resources/views')

router(app)

app.listen(port, () => {
    console.log('oke')
})

