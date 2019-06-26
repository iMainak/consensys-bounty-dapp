pragma solidity >=0.4.21 <0.6.0;

contract Bounty {

    uint answer_id = 0;

    // Address of the contract's owner, who deploys it.
    address owner;
    // Constructor of the smart contract
    constructor() public {
        owner = msg.sender;
    }

    enum AllowedStatus {
        Pending,
        Accepted,
        Rejected,
        Done
    }
    // AllowedStatus allowedStatus;
    struct Bountys {
        bytes32 bounty_id;
        address publisher_address;
        string bounty_details_hash;
        address applier_address;
        AllowedStatus status;
        uint[] answer;
    }

    struct BountyAnswer {
        uint answer_id;
        address applier_address;
        string applier_solution_hash;
        AllowedStatus status;
    }
    mapping(bytes32 => Bountys) public bountys;

    mapping (uint => BountyAnswer) public bountyAnswer;

    mapping(address => string) publishers;

    mapping(address => string) appliers;

    mapping(address => bytes32[]) public publisher_bountys;

    mapping (address => uint) private balances;
// Events
    event PublisherRegistered(
        address indexed publisher_address,
        string publisher_details_hash
    );

    event ApplierRegistered(
        address indexed applier_address,
        string applier_details_hash
    );

    event BountyAdded(
        bytes32 bounty_id,
        address publisher_address,
        string bounty_details_hash
    );

    event BountyAddedToApplier(
        bytes32 bounty_id,
        address applier_address
    );

    event BountyAnswerAdded(
        bytes32 bounty_id,
        address applier_address,
        string  applier_solution_hash
    );

    event SuccessfullySendBalance(
        address publisher_address,
        string amount,
        address applier_address
    );
    event LogDepositMade(
        address publisherAddress,
        address applierAddress,
        uint amount
    );

//Some Modifier
    modifier onlyPublisher () {
        require(bytes(publishers[msg.sender]).length != 0, "Publisher not Registered");
        _;
    }
    modifier onlyApplier () {
        require(bytes(appliers[msg.sender]).length != 0, "Applier not Registered.");
        _;
    }

    modifier isApplier(address _applier_address) {
        require(bytes(appliers[_applier_address]).length != 0, "Applier not registered.");
        _;
    }

    modifier isPublisher(address _publisher_address) {
        require(bytes(publishers[_publisher_address]).length != 0, "Publisher Not registered");
        _;
    }

    modifier isBounty(bytes32 _bounty_id) {
        require(bountys[_bounty_id].publisher_address != address(0), "Bounty not Registered");
        _;
    }

    modifier onlyPublisherOfBounty(bytes32 _bounty_id) {
        require(bytes(publishers[msg.sender]).length != 0, "Publisher Not Registered");
        require(bountys[_bounty_id].publisher_address == msg.sender, "User is not the Publisher of the Bounty");
        _;
    }

//Function
    /**
    * [registerPublisher: registers any caller as a new Publisher]
    */
    function registerPublisher(string memory _publisher_details_hash) public {
        require(bytes(publishers[msg.sender]).length == 0, "Publisher Already Registered");
        publishers[msg.sender] = _publisher_details_hash;
        emit PublisherRegistered(msg.sender, _publisher_details_hash);
    }

    /**
    * [registerApplier: registers any caller as a new applier]
    * @param _applier_details_hash [IPFS hash of applier details]
    */
    function registerApplier(string memory _applier_details_hash) public {
        require(bytes(appliers[msg.sender]).length == 0, "Applier Already Registered");
        appliers[msg.sender] = _applier_details_hash;
        emit ApplierRegistered(msg.sender, _applier_details_hash);
    }

    /**
    * [addBounty: registers any caller as a new bounty]
    */
    function addBounty(
        bytes32 _bounty_id,
        string memory _bounty_details_hash
        )
      public onlyPublisher returns (bytes32 ){
        require(bountys[_bounty_id].publisher_address == address(0), "Bounty Already Registered");
        Bountys memory newBounty;

        newBounty.bounty_id = _bounty_id;
        newBounty.publisher_address = msg.sender;
        newBounty.bounty_details_hash = _bounty_details_hash;
        newBounty.status = AllowedStatus.Pending;

        bountys[_bounty_id] = newBounty;
        publisher_bountys[msg.sender].push(_bounty_id);
        emit BountyAdded(_bounty_id, msg.sender, _bounty_details_hash);
    }
    /**
    * [addAnswerForBounty: Answer the coresponding bounty]
    */
    function addAnswerForBounty(
        bytes32 _bounty_id,
        string memory _applier_solution_hash
    ) public onlyApplier isBounty(_bounty_id) returns(uint){
        answer_id++;
        require(bountys[_bounty_id].applier_address == address(0), "Bounty already done");
        BountyAnswer memory newBountyAnswer;
        newBountyAnswer.answer_id = answer_id;
        newBountyAnswer.applier_address = msg.sender;
        newBountyAnswer.applier_solution_hash = _applier_solution_hash;
        newBountyAnswer.status = AllowedStatus.Pending;

        bountyAnswer[answer_id] = newBountyAnswer;
        bountys[_bounty_id].answer.push(answer_id);
        emit BountyAnswerAdded(_bounty_id, msg.sender, _applier_solution_hash);
    }
    /**
    * [addBountyToApplier: Add Register Bounty to Applier]
    */
    function addBountyToApplier(
        bytes32 _bounty_id,
        address _new_applier
        )
        public onlyPublisher isApplier(_new_applier) onlyPublisherOfBounty(_bounty_id){
        require(bountys[_bounty_id].applier_address == address(0), "Applier already set.");
        bountys[_bounty_id].applier_address = _new_applier;
        bountys[_bounty_id].status = AllowedStatus.Done;
        emit BountyAddedToApplier(_bounty_id, _new_applier);
    }
    /**
    [deposit: give some amount to recevuer from sender]
    */
     function deposit(address sender, address receiver, uint amount) public payable returns (uint, uint) {
          balances[sender] -= amount;
          balances[receiver] += amount;
          emit LogDepositMade(sender, receiver, amount);
          return (balances[receiver], balances[sender]);
    }
    /**
    [getBalance:  get Balance for msg.sender]
    */
    function getBalance(address sender) public view returns (uint) {
         return balances[sender];
    }
    /**
    [acceptBountyAnswer: status update for bounty_id]
    */
    function acceptBountyAnswer(bytes32 _bounty_id, address _applier_address, uint _answer_id)
    public onlyPublisher isBounty(_bounty_id) returns(bytes32){
        require(bountys[_bounty_id].applier_address == _applier_address, "Applier Adress Not Matched");
        BountyAnswer memory newBountyAnswer = bountyAnswer[_answer_id];
        newBountyAnswer.status = AllowedStatus.Accepted;
        bountyAnswer[_answer_id] = newBountyAnswer;
        return _bounty_id;
    }
    /**
    [rejectBountyAnswer: status update for bounty_id]
    */
    function rejectBountyAnswer(bytes32 _bounty_id, address _applier_address, uint _answer_id)
    public onlyPublisher isBounty(_bounty_id) returns(bytes32){
        require(bountys[_bounty_id].applier_address == _applier_address, "Applier Adress Not Matched");
        BountyAnswer memory newBountyAnswer = bountyAnswer[_answer_id];
        newBountyAnswer.status = AllowedStatus.Rejected;
        bountyAnswer[_answer_id] = newBountyAnswer;
        return _bounty_id;
    }

// Get Function
    /**
    [getPublisherDetails: Get publisher details based on publisher address]
    */
    function getPublisherDetails(address _publisher_address) public view isPublisher(_publisher_address)
    returns(string memory) {
        return publishers[_publisher_address];
    }
    /**
    [getApplierDetails: Get applier details based on applier address]
    */
    function getApplierDetails(
        address _applier_address
    ) public view isApplier(_applier_address) returns (string memory) {
        return appliers[_applier_address];
    }
    /**
    [getAllBountys: Get all bountys based on publisher address]
    */
    function getAllBountys(
        address _publisher_address
    ) public view returns(bytes32[] memory) {
        return publisher_bountys[_publisher_address];
    }
    /**
    [getBountysDetails: Get all bountys answer based on bountys id]
    */
    function getBountysDetails(
        bytes32 _bounty_id
        ) public view returns(
            address,
            string memory,
            address,
            AllowedStatus,
            uint[] memory) {
        Bountys memory bounty = bountys[_bounty_id];
        return (
        bounty.publisher_address,
        bounty.bounty_details_hash,
        bounty.applier_address,
        bounty.status,
        bounty.answer);
    }
    /**
    [getBountyAnswerDetails: Get all answer proposed by applier]
    */
    function getBountyAnswerDetails(uint _answer_id) public view returns(uint, address, string memory, AllowedStatus) {
        BountyAnswer memory returnBountyAnswer = bountyAnswer[_answer_id];
        return(
        returnBountyAnswer.answer_id,
        returnBountyAnswer.applier_address,
        returnBountyAnswer.applier_solution_hash,
        returnBountyAnswer.status
        );
    }
}