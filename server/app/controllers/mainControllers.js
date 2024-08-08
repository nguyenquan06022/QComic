class mainControllers {
    renderHome(req,res,next) {
        res.render('home')
    }
}

module.exports = new mainControllers