const UserModel = require('../models/UserModel')
const UserData = require('../models/UserDatas')
const VoteComics = require('../models/VoteComic')
const { Error } = require('mongoose')
class userInforControllers {
    showUserInfor(req,res,next) {
        if(req.isAuthenticated()) {
            UserModel.findOne({_id:req.user._id})
            .then(data => {
                if(!data) res.redirect('/dangnhap')
                else {
                    UserData.findOne({accout_ID : data._id})
                    .then(result => {
                        if(!result) res.status(500).json('Lỗi Server')
                        else {
                            let historyComic = result.historyComic.map(item=>item.toObject())
                            let followComic = result.followComic.map(item=>item.toObject())
                            res.render('userinfor',{
                                layout : 'user',
                                username : data.username,
                                password : data.password,
                                _id : data._id,
                                avt : data.avt,
                                gg_id : data.gg_id == '' ? false : true,
                                historyComic,
                                followComic
                            })
                        }
                    }).catch(err => next(err))
                }
            })
            .catch(err => next(err))
        }else res.redirect('/dangnhap')
    }

    signUp(req,res,next) {
        let username = req.body.username
        let password = req.body.pwd
        UserModel.findOne({
            gg_id : '',
            username : username
        }).then(data => {
            if(!data) {
                let newUser = new UserModel({
                    username : username,
                    password : password,
                    gg_id : ''
                })
                newUser.save()
                .then(savedUser => {
                    let newUserData = new UserData({
                        accout_ID : savedUser._id,
                        historyComic: [],
                        loveComic: [],
                        followComic: []
                    })
                    newUserData.save()
                    res.render('signin',{
                        layout : 'signUpsignIn',
                        notify : 'true'
                    })
                }).catch(errv => next(err))
            }else {
                res.render('signup',{
                    layout : 'signUpsignIn',
                    notify : 'false'
                })
            }
        }).catch(err => {
            next(err)
        })
    }

    updateAvt(req,res,next) {
        let avt = req.query.avt
        let id = req.user._id
        UserModel.findOneAndUpdate({_id : id},{avt : avt})
        .then(data => {
            res.redirect('/user-infor')
        }).catch(err => next(err))
    }

    updatePass(req,res,next) {
        let id = req.user._id
        let newPass = req.body.newPassWord
        UserModel.findOneAndUpdate({_id:id},{password:newPass})
        .then(data => {
            res.redirect('/user-infor')
        }).catch(err => next(err))
    }

    updateComicHistory(req,res,next) {
        let obj = req.body
        if(req.isAuthenticated()) {
        let id = req.user._id
            UserData.findOne({accout_ID : id})
            .then(data => {
                if(!data) {
                    res.end()
                }else {
                    let historyComicIndex = data.historyComic.findIndex(item => item.comicName === obj.name)
                    if(historyComicIndex == -1) {
                        data.historyComic.unshift({
                            img : obj.img,
                            slug : obj.slug,
                            comicName: obj.name,
                            chapName: obj.chapName,
                            linkChap: `/comic?slug=${obj.slug}&id=${obj.id}`,
                            readAt: obj.readAt
                        })
                        data.save()
                    }else {
                        data.historyComic[historyComicIndex] = {
                            img : obj.img,
                            slug : obj.slug,
                            comicName: obj.name,
                            chapName: obj.chapName,
                            linkChap: `/comic?slug=${obj.slug}&id=${obj.id}`,
                            readAt: obj.readAt
                        }
                        data.save()
                    }
                    res.end()
                }
            }).catch(err => {
                next(err)
            })
        }
    }

    getHistoryComic(req,res,next) {
        if(req.isAuthenticated()) {
            let id = req.user._id
            UserData.findOne({accout_ID : id})
            .then(data => {
                res.json(data.historyComic)
            }).catch(err => next(err))
        }
        else {
            res.json([])
        }
    }

    deleteHistoryComic(req,res,next) {
        if(req.isAuthenticated()) {
            let id = req.user._id
            let slug = req.query.slug
            UserData.updateOne(
                { accout_ID: id },
                { $pull: { historyComic: { slug: slug } } } 
            ).then(() => res.end())
            .catch(next)
        }
    }

    addLikeComic(req,res,next) {
        if(req.isAuthenticated) {
            let slug = req.query.slug
            let id = req.user._id
            VoteComics.findOne({slug : slug})
            .then(data => {
                if(!data) {
                    let ListUsersReact = []
                    ListUsersReact.push({
                        userId : id
                    })
                    let newVoteComics = new VoteComics({
                        slug : slug,
                        heart : 1,
                        ListUsersReact : ListUsersReact
                    })
                    newVoteComics.save()
                }else {
                    data.heart += 1
                    data.ListUsersReact.push({
                        userId : id
                    })
                    data.save()
                }
                res.redirect(`/infor?slug=${slug}`)
            }).catch(err => {
                next(err)
            })
        }
    }

    removeLikeComic(req,res,next) {
        if(req.isAuthenticated) {
            let slug = req.query.slug
            let id = req.user._id
            VoteComics.updateOne(
                {slug : slug},
                {
                    $inc: { heart: -1 },
                    $pull : {ListUsersReact:{userId : id}}
                }
            )
            .then(() => {
                res.redirect(`/infor?slug=${slug}`)
            }).catch(err => {
                next(err)
            })
        }
    }
}

module.exports = new userInforControllers