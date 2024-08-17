const express = require('express')
const {engine} = require('express-handlebars')
const morgan = require('morgan')
const router = require('./resources/routers/index')
const bodyParser = require('body-parser')
const port = 3000
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(morgan('combined'))
app.use(express.static('public'))
app.use(express.urlencoded({
    extended: true,
}))
app.use(express.json())
app.engine('hbs',engine({
    extname : '.hbs',
    helpers: {
        splitT: function (str) {
            return str.split('T')[0];
        },
        plainText: function(string) {
            let result = string.replace(/<[^>]*>?/g, '')
            result = result.replace(/\s-\s$/, '')
            return result
        },
        getId: function(string) {
            const parts = string.split('/');
            return parts[parts.length - 1];
        },
        json: function(context) {
            return JSON.stringify(context);
        },
        status : function(string) {
            if(string == 'completed') return 'Hoàn thành'
            else if(string == 'ongoing') return 'Đang cập nhật'
            else return 'Sắp ra mắt'
        }
    }
}))
app.set('view engine','hbs')
app.set('views','./resources/views')

router(app)

app.listen(port, () => {
    console.log('oke')
})

