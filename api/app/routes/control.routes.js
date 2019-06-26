module.exports = (app) => {
    const bounty = require('../controller/controller.js')
    app.post('/bounty/registerPublisher',bounty.registerPublisher)
    app.post('/bounty/registerApplier',bounty.registerApplier)
    app.post('/bounty/addBounty',bounty.addBounty)
    app.post('/bounty/addAnswerForBounty',bounty.addAnswerForBounty)
    app.post('/bounty/addBountyToApplier',bounty.addBountyToApplier)
    app.post('/bounty/getBalance',bounty.getBalance)
    app.post('/bounty/deposit',bounty.deposit)
    app.post('/bounty/getPublisherDetails',bounty.getPublisherDetails)
    app.post('/bounty/getApplierDetails',bounty.getApplierDetails)
    app.post('/bounty/getAllBountys',bounty.getAllBountys)
    app.post('/bounty/getBountysDetails',bounty.getBountysDetails)
    app.post('/bounty/getBountyAnswerDetails',bounty.getBountyAnswerDetails)
}

