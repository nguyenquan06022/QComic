const mainControllers = require('../../app/controllers/mainControllers')

function router(app) {
    app.get('/',mainControllers.renderHome)
}
module.exports = router