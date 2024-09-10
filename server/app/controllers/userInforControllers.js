const UserModel = require('../models/UserModel')
const UserData = require('../models/UserDatas')
const VoteComics = require('../models/VoteComic')

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
                            let historyComic = result.historyComic
                            .filter(comic => comic.isDelete == false)
                            .sort((a, b) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime())
                            .slice(0, 20).map(item => item.toObject())
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
                    let historyComicIndex = data.historyComic.findIndex(item => item.slug === obj.slug)
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
                { accout_ID: id, "historyComic.slug": slug },
                { $set: { "historyComic.$.isDelete": true } }
            ).then(() => res.end())
            .catch(next)
        }
    }

    addLikeComic(req,res,next) {
        if(req.isAuthenticated()) {
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
        if(req.isAuthenticated()) {
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

    addFollow(req,res,next) {
        if(req.isAuthenticated()) {
            let slug = req.query.slug
            let id = req.user._id
                UserData.findOne({accout_ID : id})
                .then(async data => {
                    if(!data) {
                        res.end()
                    }else {
                        let obj = await fetch(`https://otruyenapi.com/v1/api/truyen-tranh/${slug}`)
                        .then(response => {
                            return response.json()
                        }).then(data => {
                            let name = data.data.seoOnPage.seoSchema.name
                            let img = data.data.seoOnPage.seoSchema.image
                            let linkInfor = `/infor?slug=${slug}`
                            let lastChap = data.data.item.chapters[0].server_data.pop().chapter_name
                            return {
                                slug,name,img,linkInfor,lastChap
                            }
                        }).catch(err => console.log(err))
                            data.followComic.push({
                                slug : slug,
                                comicName : obj.name,
                                img : obj.img,
                                linkInfor : obj.linkInfor,
                                lastChap : obj.lastChap
                            })
                        data.save()
                        res.redirect(`/infor?slug=${slug}`)
                    }
                }).catch(err => {
                    next(err)
                })
            }
    }

    deleteFollow(req,res,next) {
        if(req.isAuthenticated()) {
            let slug = req.query.slug
            let id = req.user._id
            UserData.updateOne(
                {accout_ID : id},
                {
                    $pull : {followComic : {'slug' : slug}}
                }
            ).then(() => {
                res.redirect(`/infor?slug=${slug}`)
            })
            .catch(err => next(err))
        }
    }
}

module.exports = new userInforControllers