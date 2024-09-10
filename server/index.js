const express = require('express')
const {engine} = require('express-handlebars')
const morgan = require('morgan')
const router = require('./resources/routers/index')
const moment = require('moment');
require('moment/locale/vi');
require('moment-duration-format'); 
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const port = process.env.PORT || 3000
const auth = require('./resources/passports/passports')
const db = require('./config/db/connectDB')
require('dotenv').config()
const app = express()

app.use(methodOverride('_method'))
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
        },
        toastStatus : function(string) {
            console.log(string)
            if(string == 'true') return 'success'
            else return 'fail'
        },
        toastMessage : function(string) {
            if(string == 'true') return 'Đăng kí thành công.'
            else return 'Tài khoản hoặc mật khẩu không hợp lệ.'
        },
        timeAgo: function(dateString) {
            moment.locale('vi');
            let date = new Date(dateString)
            return moment(date).fromNow(); 
        }
    }
}))
app.set('view engine','hbs')
app.set('views','./resources/views')

db.connect()
auth(app)
router(app)

app.listen(port, () => {
    console.log('Server running!...')
})

