let Bounty = artifacts.require('Bounty')
let catchRevert = require("./exceptionsHelpers.js").catchRevert

let deposit = 100
let given = 3

contract('Bounty', (accounts) => {
    const owner = accounts[0]
    const Mainak = accounts[1]
    const YoLO = accounts[2]
    const DJ = accounts[3]
    const emptyAddress = '0x0000000000000000000000000000000000000000'

    // Publisher Details
    const publisher_details = "Publisher Details Hash"

    // Applier Details
    const applier_details = "Applier Deatails Hash"

    // Bounty Details
    const bounty_ID = "0x12"
    const bounty_details = "Details Hash"

    // Bounty Answer Details
    const yoLOAnswerDetails = "Solution Hash for YoL0"
    // const 
    let instance
    beforeEach(async () => {
        instance = await Bounty.new()
    })


    it('Should register publisher', async () => {
        const tx = await instance.registerPublisher(publisher_details, { from: Mainak })
        const publisherAdded = await instance.getPublisherDetails(Mainak, { from: Mainak })

        assert.equal(publisherAdded, publisher_details, "Publisher Details Not Matched")
    })

    it("should register applier", async () => {
        const tx = await instance.registerApplier(applier_details, { from: YoLO })
        const applierAdded = await instance.getApplierDetails(YoLO, { from: YoLO })
        assert.equal(applierAdded, applier_details, "Applier Details Not Mathed")
    })

    it('Should add a bounty', async () => {
        const tx = await instance.registerPublisher(publisher_details, { from: Mainak })
        const tx1 = await instance.addBounty(bounty_ID, bounty_details, { from: Mainak })

        const bountyAdded = await instance.getBountysDetails(bounty_ID, { from: Mainak })
        assert.equal(bountyAdded[0], Mainak, "Publisher Address not matched")
        assert.equal(bountyAdded[1], bounty_details, "Bounty Details not matched")
        assert.equal(bountyAdded[2], emptyAddress, "Applier Address is not empty")
        assert.equal(bountyAdded[3].toString(10), 0, "Status must be Pending")
        assert.equal(bountyAdded[4][0], undefined, "Answer ID must be empty or undefined")
    })

    it("should give answer for particual bounty", async () => {
        const tx = await instance.registerPublisher(publisher_details, { from: Mainak })
        const tx1 = await instance.registerApplier(applier_details, { from: YoLO })
        const tx2 = await instance.addBounty(bounty_ID, bounty_details, { from: Mainak })
        const tx3 = await instance.addAnswerForBounty(bounty_ID, yoLOAnswerDetails, { from: YoLO })

        const bountyAdded = await instance.getBountysDetails(bounty_ID, { from: Mainak })
        assert.equal(bountyAdded[4][0], 1, "Answer ID should not be empty")
    })

    it("Should return Answer Details", async () => {
        const tx = await instance.registerPublisher(publisher_details, { from: Mainak })
        const tx2 = await instance.registerApplier(applier_details, { from: YoLO })
        const tx3 = await instance.addBounty(bounty_ID, bounty_details, { from: Mainak })
        const tx4 = await instance.addAnswerForBounty(bounty_ID, yoLOAnswerDetails, { from: YoLO })
        const tx5 = await instance.addBountyToApplier(bounty_ID, YoLO, { from: Mainak })

        const result = await instance.getBountyAnswerDetails(1, { from: Mainak })
        assert.equal(result[0], 1, "Answer ID not matched")
        assert.equal(result[1], YoLO, "Applier Address Not matched")
        assert.equal(result[2], yoLOAnswerDetails, "Answer Details Not matched")
        assert.equal(result[3], 0, "status must be Pending")
    })

    it("Should Accept the Bounty Answer and show details", async () => {
        const tx = await instance.registerPublisher(publisher_details, { from: Mainak })
        const tx2 = await instance.registerApplier(applier_details, { from: YoLO })
        const tx3 = await instance.addBounty(bounty_ID, bounty_details, { from: Mainak })
        const tx4 = await instance.addAnswerForBounty(bounty_ID, yoLOAnswerDetails, { from: YoLO })
        const tx5 = await instance.addBountyToApplier(bounty_ID, YoLO, { from: Mainak })
        const tx6 = await instance.acceptBountyAnswer(bounty_ID, YoLO, 1, { from: Mainak })

        const result = await instance.getBountyAnswerDetails(1, { from: Mainak })
        assert.equal(result[0], 1, "Answer ID not matched")
        assert.equal(result[1], YoLO, "Applier Address Not matched")
        assert.equal(result[2], yoLOAnswerDetails, "Answer Details Not matched")
        assert.equal(result[3], 1, "status must be Accepted")
    })

    it("Should Reject the Bounty Answer and show details", async () => {
        const tx = await instance.registerPublisher(publisher_details, { from: Mainak })
        const tx2 = await instance.registerApplier(applier_details, { from: YoLO })
        const tx3 = await instance.addBounty(bounty_ID, bounty_details, { from: Mainak })
        const tx4 = await instance.addAnswerForBounty(bounty_ID, yoLOAnswerDetails, { from: YoLO })
        const tx5 = await instance.addBountyToApplier(bounty_ID, YoLO, { from: Mainak })
        const tx6 = await instance.rejectBountyAnswer(bounty_ID, YoLO, 1, { from: Mainak })

        const result = await instance.getBountyAnswerDetails(1, { from: Mainak })
        assert.equal(result[0], 1, "Answer ID not matched")
        assert.equal(result[1], YoLO, "Applier Address Not matched")
        assert.equal(result[2], yoLOAnswerDetails, "Answer Details Not matched")
        assert.equal(result[3], 2, "status must be Rejected")
    })

    it("Should review and set applier Address for corresponding bounty", async () => {
        const tx = await instance.registerPublisher(publisher_details, { from: Mainak })
        const tx1 = await instance.registerApplier(applier_details, { from: YoLO })
        const tx2 = await instance.addBounty(bounty_ID, bounty_details, { from: Mainak })
        const tx3 = await instance.addAnswerForBounty(bounty_ID, yoLOAnswerDetails, { from: YoLO })
        const tx4 = await instance.addBountyToApplier(bounty_ID, YoLO, { from: Mainak })

        const bountyAdded = await instance.getBountysDetails(bounty_ID, { from: Mainak })
        assert.equal(bountyAdded[2], YoLO, "Applier Address is not empty")

    })

    it("Deposit certain Amount from sender to receiver", async () => {
        const tx = await instance.registerPublisher(publisher_details, { from: Mainak })
        // const tx1 = await instance.deposit(owner, Mainak, deposit, { from: owner })
        const tx2 = await instance.registerApplier(applier_details, { from: YoLO })
        const tx3 = await instance.addBounty(bounty_ID, bounty_details, { from: Mainak })
        const tx4 = await instance.addAnswerForBounty(bounty_ID, yoLOAnswerDetails, { from: YoLO })
        const tx5 = await instance.addBountyToApplier(bounty_ID, YoLO, { from: Mainak })
        const tx6 = await instance.deposit(Mainak, YoLO, given, { from: Mainak })

        const result = await instance.getBalance(YoLO, { from: YoLO })
        const result1 = await instance.getBalance(Mainak, { from: Mainak })
        const bountyAdded = await instance.getBountysDetails(bounty_ID, { from: Mainak })
        assert.equal(bountyAdded[2], YoLO, "Applier Address is not empty")
        assert.equal(given.toString(), result, "Not Matched")
        assert.equal(3, result, "Not Matched")
    })

})