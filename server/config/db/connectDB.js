const mongoose = require('mongoose')
require("dotenv").config()

function connect() {
    try {
        mongoose.connect(process.env.MONGODB_URL)
        console.log('connect succesfully')
    } catch (error) {
        console.log(error)
    }
}

module.exports = {connect}