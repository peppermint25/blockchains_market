// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SecondhandMarket {
    
    // === ROLES ===
    address public admin;
    
    // === ENUMS ===
    enum ListingStatus { Active, Sold, Cancelled }
    enum OrderStatus { AwaitingShipment, Shipped, Delivered, Completed, Disputed, Refunded }
    enum Category { Clothing, HouseGoods, Electronics, SportsGoods, Hobbies }
    enum GoalStatus { Active, Completed, Cancelled }
    enum ItemRequestStatus { Active, Fulfilled, Cancelled }
    
    // === STRUCTS ===
    struct Listing {
        uint256 id;
        address payable seller;
        string metadataURI;
        uint256 price;
        Category category;
        ListingStatus status;
        address charity;
    }
    
    struct Order {
        uint256 id;
        uint256 listingId;
        address payable buyer;
        address payable seller;
        address charity;
        uint256 amount;
        OrderStatus status;
        uint256 shippedAt;
        uint256 deliveredAt;
        string disputeReason;
    }
    
    struct Charity {
        address charityAddress;
        string metadataURI;
        bool isVerified;
        uint256 totalReceived;
    }
    
    struct Goal {
        uint256 id;
        address charity;
        string metadataURI;      // IPFS: title, description, images
        uint256 targetAmount;
        uint256 currentAmount;
        GoalStatus status;
        uint256 deadline;
    }
    
    struct ItemRequest {
        uint256 id;
        address charity;
        string metadataURI;      // IPFS: what items needed, quantity, description
        Category category;
        ItemRequestStatus status;
        uint256 fulfilledCount;
    }
    
    // === STORAGE ===
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Order) public orders;
    mapping(address => uint256) public charityIndex;
    mapping(address => bool) public verifiedCharities;
    mapping(address => uint256[]) public sellerListings;
    mapping(address => uint256[]) public buyerOrders;
    mapping(address => uint256[]) public charityGoals;
    mapping(address => uint256[]) public charityItemRequests;
    
    Charity[] public charities;
    Goal[] public goals;
    ItemRequest[] public itemRequests;
    
    uint256 public listingCount;
    uint256 public orderCount;
    
    uint256 public constant DISPUTE_WINDOW = 14 days;
    
    // === EVENTS ===
    event CharityAdded(uint256 indexed charityId, address indexed charityAddress, string metadataURI);
    event CharityUpdated(uint256 indexed charityId, address indexed charityAddress, bool isVerified);
    event ListingCreated(uint256 indexed listingId, address indexed seller, uint256 price, Category category);
    event ListingCancelled(uint256 indexed listingId);
    event ItemPurchased(uint256 indexed orderId, uint256 indexed listingId, address indexed buyer);
    event ItemShipped(uint256 indexed orderId, address indexed seller);
    event DeliveryConfirmed(uint256 indexed orderId, address indexed buyer);
    event FundsReleasedToCharity(uint256 indexed orderId, address indexed charity, uint256 amount);
    event DisputeOpened(uint256 indexed orderId, address indexed buyer, string reason);
    event DisputeResolved(uint256 indexed orderId, bool refunded);
    event RefundIssued(uint256 indexed orderId, address indexed buyer, uint256 amount);
    event ItemDonatedToCharity(uint256 indexed listingId, address indexed seller, address indexed charity);
    event GoalCreated(uint256 indexed goalId, address indexed charity, uint256 targetAmount);
    event GoalUpdated(uint256 indexed goalId, uint256 currentAmount, GoalStatus status);
    event ItemRequestCreated(uint256 indexed requestId, address indexed charity, Category category);
    event ItemRequestFulfilled(uint256 indexed requestId, address indexed donor, uint256 listingId);
    event ItemRequestStatusChanged(uint256 indexed requestId, ItemRequestStatus status);
    
    // === MODIFIERS ===
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can do this");
        _;
    }
    
    modifier onlyVerifiedCharity() {
        require(verifiedCharities[msg.sender], "Only verified charity can do this");
        _;
    }
    
    modifier onlyBuyer(uint256 _orderId) {
        require(msg.sender == orders[_orderId].buyer, "Only buyer can do this");
        _;
    }
    
    modifier onlySeller(uint256 _orderId) {
        require(msg.sender == orders[_orderId].seller, "Only seller can do this");
        _;
    }
    
    // === CONSTRUCTOR ===
    constructor() {
        admin = msg.sender;
    }
    
    // === ADMIN FUNCTIONS ===
    
    function addCharity(
        address _charityAddress,
        string calldata _metadataURI
    ) external onlyAdmin returns (uint256) {
        require(_charityAddress != address(0), "Invalid address");
        require(!verifiedCharities[_charityAddress], "Charity already exists");
        
        uint256 charityId = charities.length;
        
        charities.push(Charity({
            charityAddress: _charityAddress,
            metadataURI: _metadataURI,
            isVerified: true,
            totalReceived: 0
        }));
        
        charityIndex[_charityAddress] = charityId;
        verifiedCharities[_charityAddress] = true;
        
        emit CharityAdded(charityId, _charityAddress, _metadataURI);
        return charityId;
    }
    
    function updateCharity(
        address _charityAddress,
        string calldata _metadataURI,
        bool _isVerified
    ) external onlyAdmin {
        require(charityIndex[_charityAddress] > 0 || charities[0].charityAddress == _charityAddress, "Charity not found");
        
        uint256 idx = charityIndex[_charityAddress];
        charities[idx].metadataURI = _metadataURI;
        charities[idx].isVerified = _isVerified;
        verifiedCharities[_charityAddress] = _isVerified;
        
        emit CharityUpdated(idx, _charityAddress, _isVerified);
    }
    
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid address");
        admin = _newAdmin;
    }
    
    // === CHARITY FUNCTIONS ===
    
    function createGoal(
        string calldata _metadataURI,
        uint256 _targetAmount,
        uint256 _deadline
    ) external onlyVerifiedCharity returns (uint256) {
        require(_targetAmount > 0, "Target must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in future");
        
        uint256 goalId = goals.length;
        
        goals.push(Goal({
            id: goalId,
            charity: msg.sender,
            metadataURI: _metadataURI,
            targetAmount: _targetAmount,
            currentAmount: 0,
            status: GoalStatus.Active,
            deadline: _deadline
        }));
        
        charityGoals[msg.sender].push(goalId);
        
        emit GoalCreated(goalId, msg.sender, _targetAmount);
        return goalId;
    }
    
    function cancelGoal(uint256 _goalId) external onlyVerifiedCharity {
        Goal storage goal = goals[_goalId];
        require(goal.charity == msg.sender, "Not your goal");
        require(goal.status == GoalStatus.Active, "Goal not active");
        
        goal.status = GoalStatus.Cancelled;
        emit GoalUpdated(_goalId, goal.currentAmount, GoalStatus.Cancelled);
    }
    
    function createItemRequest(
        string calldata _metadataURI,
        Category _category
    ) external onlyVerifiedCharity returns (uint256) {
        uint256 requestId = itemRequests.length;
        
        itemRequests.push(ItemRequest({
            id: requestId,
            charity: msg.sender,
            metadataURI: _metadataURI,
            category: _category,
            status: ItemRequestStatus.Active,
            fulfilledCount: 0
        }));
        
        charityItemRequests[msg.sender].push(requestId);
        
        emit ItemRequestCreated(requestId, msg.sender, _category);
        return requestId;
    }
    
    function cancelItemRequest(uint256 _requestId) external onlyVerifiedCharity {
        ItemRequest storage request = itemRequests[_requestId];
        require(request.charity == msg.sender, "Not your request");
        require(request.status == ItemRequestStatus.Active, "Request not active");
        
        request.status = ItemRequestStatus.Cancelled;
        emit ItemRequestStatusChanged(_requestId, ItemRequestStatus.Cancelled);
    }
    
    function markItemRequestFulfilled(uint256 _requestId) external onlyVerifiedCharity {
        ItemRequest storage request = itemRequests[_requestId];
        require(request.charity == msg.sender, "Not your request");
        require(request.status == ItemRequestStatus.Active, "Request not active");
        
        request.status = ItemRequestStatus.Fulfilled;
        emit ItemRequestStatusChanged(_requestId, ItemRequestStatus.Fulfilled);
    }
    
    // === SELLER FUNCTIONS ===
    
    function createListing(
        string calldata _metadataURI,
        uint256 _price,
        Category _category,
        address _charity
    ) external returns (uint256) {
        require(_price > 0, "Price must be greater than 0");
        require(verifiedCharities[_charity], "Charity not verified");
        
        uint256 listingId = listingCount++;
        
        listings[listingId] = Listing({
            id: listingId,
            seller: payable(msg.sender),
            metadataURI: _metadataURI,
            price: _price,
            category: _category,
            status: ListingStatus.Active,
            charity: _charity
        });
        
        sellerListings[msg.sender].push(listingId);
        
        emit ListingCreated(listingId, msg.sender, _price, _category);
        return listingId;
    }
    
    function cancelListing(uint256 _listingId) external {
        Listing storage listing = listings[_listingId];
        require(msg.sender == listing.seller, "Only seller can cancel");
        require(listing.status == ListingStatus.Active, "Listing not active");
        
        listing.status = ListingStatus.Cancelled;
        emit ListingCancelled(_listingId);
    }
    
    function confirmShipment(uint256 _orderId) external onlySeller(_orderId) {
        Order storage order = orders[_orderId];
        require(order.status == OrderStatus.AwaitingShipment, "Invalid order status");
        
        order.status = OrderStatus.Shipped;
        order.shippedAt = block.timestamp;
        
        emit ItemShipped(_orderId, msg.sender);
    }
    
    function donateItemToCharity(
        string calldata _metadataURI,
        Category _category,
        address _charity
    ) external returns (uint256) {
        require(verifiedCharities[_charity], "Charity not verified");
        
        uint256 listingId = listingCount++;
        
        listings[listingId] = Listing({
            id: listingId,
            seller: payable(msg.sender),
            metadataURI: _metadataURI,
            price: 0,
            category: _category,
            status: ListingStatus.Sold,
            charity: _charity
        });
        
        sellerListings[msg.sender].push(listingId);
        
        emit ItemDonatedToCharity(listingId, msg.sender, _charity);
        return listingId;
    }
    
    function donateItemForRequest(
        string calldata _metadataURI,
        uint256 _requestId
    ) external returns (uint256) {
        ItemRequest storage request = itemRequests[_requestId];
        require(request.status == ItemRequestStatus.Active, "Request not active");
        
        uint256 listingId = listingCount++;
        
        listings[listingId] = Listing({
            id: listingId,
            seller: payable(msg.sender),
            metadataURI: _metadataURI,
            price: 0,
            category: request.category,
            status: ListingStatus.Sold,
            charity: request.charity
        });
        
        sellerListings[msg.sender].push(listingId);
        request.fulfilledCount++;
        
        emit ItemDonatedToCharity(listingId, msg.sender, request.charity);
        emit ItemRequestFulfilled(_requestId, msg.sender, listingId);
        return listingId;
    }
    
    // === BUYER FUNCTIONS ===
    
    function purchaseItem(uint256 _listingId) external payable returns (uint256) {
        Listing storage listing = listings[_listingId];
        require(listing.status == ListingStatus.Active, "Listing not available");
        require(msg.value == listing.price, "Incorrect payment amount");
        require(msg.sender != listing.seller, "Seller cannot buy own item");
        
        listing.status = ListingStatus.Sold;
        
        uint256 orderId = orderCount++;
        
        orders[orderId] = Order({
            id: orderId,
            listingId: _listingId,
            buyer: payable(msg.sender),
            seller: listing.seller,
            charity: listing.charity,
            amount: msg.value,
            status: OrderStatus.AwaitingShipment,
            shippedAt: 0,
            deliveredAt: 0,
            disputeReason: ""
        });
        
        buyerOrders[msg.sender].push(orderId);
        
        emit ItemPurchased(orderId, _listingId, msg.sender);
        return orderId;
    }
    
    function confirmDelivery(uint256 _orderId) external onlyBuyer(_orderId) {
        Order storage order = orders[_orderId];
        require(order.status == OrderStatus.Shipped, "Item not shipped yet");
        
        order.status = OrderStatus.Delivered;
        order.deliveredAt = block.timestamp;
        
        emit DeliveryConfirmed(_orderId, msg.sender);
    }
    
    function openDispute(uint256 _orderId, string calldata _reason) external onlyBuyer(_orderId) {
        Order storage order = orders[_orderId];
        require(
            order.status == OrderStatus.Shipped || order.status == OrderStatus.Delivered,
            "Cannot dispute at this stage"
        );
        
        if (order.status == OrderStatus.Delivered) {
            require(
                block.timestamp <= order.deliveredAt + DISPUTE_WINDOW,
                "Dispute window has passed"
            );
        }
        
        order.status = OrderStatus.Disputed;
        order.disputeReason = _reason;
        
        emit DisputeOpened(_orderId, msg.sender, _reason);
    }
    
    // === FUNDS RELEASE ===
    
    function releaseFundsToCharity(uint256 _orderId) external {
        Order storage order = orders[_orderId];
        require(order.status == OrderStatus.Delivered, "Delivery not confirmed");
        require(
            block.timestamp > order.deliveredAt + DISPUTE_WINDOW,
            "Still within dispute window"
        );
        
        order.status = OrderStatus.Completed;
        
        // Update charity's total received
        uint256 idx = charityIndex[order.charity];
        charities[idx].totalReceived += order.amount;
        
        // Update any active goals for this charity
        _updateCharityGoals(order.charity, order.amount);
        
        (bool success, ) = order.charity.call{value: order.amount}("");
        require(success, "Transfer to charity failed");
        
        emit FundsReleasedToCharity(_orderId, order.charity, order.amount);
    }
    
    function _updateCharityGoals(address _charity, uint256 _amount) internal {
        uint256[] storage goalIds = charityGoals[_charity];
        for (uint256 i = 0; i < goalIds.length; i++) {
            Goal storage goal = goals[goalIds[i]];
            if (goal.status == GoalStatus.Active && block.timestamp <= goal.deadline) {
                goal.currentAmount += _amount;
                if (goal.currentAmount >= goal.targetAmount) {
                    goal.status = GoalStatus.Completed;
                }
                emit GoalUpdated(goalIds[i], goal.currentAmount, goal.status);
                break; // Only contribute to one active goal at a time
            }
        }
    }
    
    // === DISPUTE RESOLUTION (ADMIN) ===
    
    function resolveDispute(uint256 _orderId, bool _refundBuyer) external onlyAdmin {
        Order storage order = orders[_orderId];
        require(order.status == OrderStatus.Disputed, "Order not disputed");
        
        if (_refundBuyer) {
            order.status = OrderStatus.Refunded;
            
            (bool success, ) = order.buyer.call{value: order.amount}("");
            require(success, "Refund failed");
            
            emit RefundIssued(_orderId, order.buyer, order.amount);
        } else {
            order.status = OrderStatus.Completed;
            
            uint256 idx = charityIndex[order.charity];
            charities[idx].totalReceived += order.amount;
            
            _updateCharityGoals(order.charity, order.amount);
            
            (bool success, ) = order.charity.call{value: order.amount}("");
            require(success, "Transfer to charity failed");
            
            emit FundsReleasedToCharity(_orderId, order.charity, order.amount);
        }
        
        emit DisputeResolved(_orderId, _refundBuyer);
    }
    
    // === VIEW FUNCTIONS ===
    
    function getListing(uint256 _listingId) external view returns (
        address seller,
        string memory metadataURI,
        uint256 price,
        Category category,
        ListingStatus status,
        address charity
    ) {
        Listing storage l = listings[_listingId];
        return (l.seller, l.metadataURI, l.price, l.category, l.status, l.charity);
    }
    
    function getOrder(uint256 _orderId) external view returns (
        uint256 listingId,
        address buyer,
        address seller,
        address charity,
        uint256 amount,
        OrderStatus status,
        uint256 shippedAt,
        uint256 deliveredAt
    ) {
        Order storage o = orders[_orderId];
        return (o.listingId, o.buyer, o.seller, o.charity, o.amount, o.status, o.shippedAt, o.deliveredAt);
    }
    
    function getDisputeReason(uint256 _orderId) external view returns (string memory) {
        return orders[_orderId].disputeReason;
    }
    
    function getSellerListings(address _seller) external view returns (uint256[] memory) {
        return sellerListings[_seller];
    }
    
    function getBuyerOrders(address _buyer) external view returns (uint256[] memory) {
        return buyerOrders[_buyer];
    }
    
    function getCategoryName(Category _category) external pure returns (string memory) {
        if (_category == Category.Clothing) return "Clothing";
        if (_category == Category.HouseGoods) return "House Goods";
        if (_category == Category.Electronics) return "Electronics";
        if (_category == Category.SportsGoods) return "Sports Goods";
        if (_category == Category.Hobbies) return "Hobbies";
        return "Unknown";
    }
    
    // === CHARITY VIEW FUNCTIONS ===
    
    function getCharityCount() external view returns (uint256) {
        return charities.length;
    }
    
    function getCharity(uint256 _charityId) external view returns (
        address charityAddress,
        string memory metadataURI,
        bool isVerified,
        uint256 totalReceived
    ) {
        Charity storage c = charities[_charityId];
        return (c.charityAddress, c.metadataURI, c.isVerified, c.totalReceived);
    }
    
    function getAllCharities() external view returns (Charity[] memory) {
        return charities;
    }
    
    // === GOAL VIEW FUNCTIONS ===
    
    function getGoalCount() external view returns (uint256) {
        return goals.length;
    }
    
    function getGoal(uint256 _goalId) external view returns (
        address charity,
        string memory metadataURI,
        uint256 targetAmount,
        uint256 currentAmount,
        GoalStatus status,
        uint256 deadline
    ) {
        Goal storage g = goals[_goalId];
        return (g.charity, g.metadataURI, g.targetAmount, g.currentAmount, g.status, g.deadline);
    }
    
    function getAllGoals() external view returns (Goal[] memory) {
        return goals;
    }
    
    function getCharityGoals(address _charity) external view returns (uint256[] memory) {
        return charityGoals[_charity];
    }
    
    // === ITEM REQUEST VIEW FUNCTIONS ===
    
    function getItemRequestCount() external view returns (uint256) {
        return itemRequests.length;
    }
    
    function getItemRequest(uint256 _requestId) external view returns (
        address charity,
        string memory metadataURI,
        Category category,
        ItemRequestStatus status,
        uint256 fulfilledCount
    ) {
        ItemRequest storage r = itemRequests[_requestId];
        return (r.charity, r.metadataURI, r.category, r.status, r.fulfilledCount);
    }
    
    function getAllItemRequests() external view returns (ItemRequest[] memory) {
        return itemRequests;
    }
    
    function getCharityItemRequests(address _charity) external view returns (uint256[] memory) {
        return charityItemRequests[_charity];
    }
}