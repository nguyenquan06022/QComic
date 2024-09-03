const mainControllers = require('../../app/controllers/mainControllers')
const userInforControllers = require('../../app/controllers/userInforControllers')

function router(app) {
    app.get('/blog-nha-phat-trien',mainControllers.renderBlog)
    app.get('/dangky',mainControllers.showSignUp)
    app.get('/dangnhap',mainControllers.showSignIn)
    app.get('/tim-kiem',mainControllers.search)
    app.get('/the-loai/:slug',mainControllers.showTheLoai)
    app.get('/updateAvt',userInforControllers.updateAvt)
    app.get('/infor',mainControllers.showInfor)
    app.get('/comic',mainControllers.showChap)
    app.get('/getHistoryComic',userInforControllers.getHistoryComic)
    app.get('/user-infor',userInforControllers.showUserInfor)
    app.get('/logout',mainControllers.logOut)
    app.get('/addLikeComic',userInforControllers.addLikeComic)
    app.get('/removeLikeComic',userInforControllers.removeLikeComic)
    app.get('/:type',mainControllers.showList)
    app.get('/',mainControllers.renderHome)
    app.put('/updateHistoryComic',userInforControllers.updateComicHistory)
    app.post('/sign-up',userInforControllers.signUp)
    app.post('/updatePass',userInforControllers.updatePass)
    app.delete('/deleteHistoryComic',userInforControllers.deleteHistoryComic)
}
module.exports = router