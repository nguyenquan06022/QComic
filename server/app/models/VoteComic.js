const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ListUsersReact = new Schema({
    userId : {
        type: String,
    }
})

const VoteComic = new Schema({
    slug : {
        type: String,
        required: true
    },
    heart : {
        type: Number,
        default: 0
    },
    ListUsersReact : [ListUsersReact]
},{
    collection: 'VoteComics'
})

module.exports = mongoose.model('VoteComics',VoteComic)
