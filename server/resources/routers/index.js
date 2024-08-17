const mainControllers = require('../../app/controllers/mainControllers')

function router(app) {
    app.get('/blog-nha-phat-trien',mainControllers.renderBlog)
    app.get('/dangky-dangnhap',mainControllers.showLoginRegister)
    app.get('/tim-kiem',mainControllers.search)
    app.get('/the-loai/:slug',mainControllers.showTheLoai)
    app.get('/infor',mainControllers.showInfor)
    app.get('/comic',mainControllers.showChap)
    app.get('/:type',mainControllers.showList)
    app.get('/',mainControllers.renderHome)
}
module.exports = router