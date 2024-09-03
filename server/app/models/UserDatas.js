const mongoose = require('mongoose')
const Schema = mongoose.Schema

const HistoryComic = new Schema({
    img : {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    comicName: {
        type: String,
        required: true
    },
    chapName: {
        type: String,
        required: true
    },
    linkChap: {
        type: String,
        required: true
    },
    readAt: {
        type: String,
        required: true
    }
});

const FollowComic = new Schema({
    slug: {
        type: String,
        required: true
    },
    img : {
        type: String,
        required: true
    },
    comicName: {
        type: String,
        required: true
    },
    linkInfor: {
        type: String,
        required: true
    },
    newChapAt: {
        type: String,
        required: true
    }
})

const UserData = new Schema({
    accout_ID: {
        type: String,
        required: true
    },
    historyComic: [HistoryComic],
    followComic: [FollowComic]
}, {
    collection : 'UserDatas'
});

UserData.pre('save',function(next) {
    if (this.historyComic.length > 20) {
        this.historyComic = this.historyComic.slice(0,this.historyComic.length - 1);
    }
    next();
});

module.exports = mongoose.model('UserDatas',UserData)
