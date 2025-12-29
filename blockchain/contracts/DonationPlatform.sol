// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SecondhandMarket {
    
    // === ROLES ===
    address public admin;
    
    // === ENUMS ===
    enum ListingStatus { Active, Sold, Cancelled }
    enum OrderStatus { AwaitingShipment, Shipped, Delivered, Completed, Disputed, Refunded }
    
    // === STRUCTS ===
    struct Listing {
        uint256 id;
        address payable seller;
        string metadataURI;      // IPFS link to item details (images, description, etc.)
        uint256 price;
        ListingStatus status;
        address charity;         // Which charity receives the funds
    }
    
    struct Order {
        uint256 id;
        uint256 listingId;
        address payable buyer;
        address payable seller;
        address charity;
        uint256 amount;
        OrderStatus status;
        uint256 shippedAt;       // Timestamp when seller confirmed shipment
        uint256 deliveredAt;     // Timestamp when buyer confirmed delivery
        string disputeReason;    // If dispute opened, reason is stored here
    }
    
    // === STORAGE ===
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Order) public orders;
    mapping(address => bool) public verifiedCharities;
    
    uint256 public listingCount;
    uint256 public orderCount;
    
    uint256 public constant DISPUTE_WINDOW = 14 days;
    
    // === EVENTS ===
    event CharityVerified(address indexed charity, bool status);
    event ListingCreated(uint256 indexed listingId, address indexed seller, uint256 price);
    event ListingCancelled(uint256 indexed listingId);
    event ItemPurchased(uint256 indexed orderId, uint256 indexed listingId, address indexed buyer);
    event ItemShipped(uint256 indexed orderId, address indexed seller);
    event DeliveryConfirmed(uint256 indexed orderId, address indexed buyer);
    event FundsReleasedToCharity(uint256 indexed orderId, address indexed charity, uint256 amount);
    event DisputeOpened(uint256 indexed orderId, address indexed buyer, string reason);
    event DisputeResolved(uint256 indexed orderId, bool refunded);
    event RefundIssued(uint256 indexed orderId, address indexed buyer, uint256 amount);
    
    // === MODIFIERS ===
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can do this");
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
    
    function verifyCharity(address _charity, bool _status) external onlyAdmin {
        verifiedCharities[_charity] = _status;
        emit CharityVerified(_charity, _status);
    }
    
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid address");
        admin = _newAdmin;
    }
    
    // === SELLER FUNCTIONS ===
    
    function createListing(
        string calldata _metadataURI,
        uint256 _price,
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
            status: ListingStatus.Active,
            charity: _charity
        });
        
        emit ListingCreated(listingId, msg.sender, _price);
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
    
    // === BUYER FUNCTIONS ===
    
    function purchaseItem(uint256 _listingId) external payable returns (uint256) {
        Listing storage listing = listings[_listingId];
        require(listing.status == ListingStatus.Active, "Listing not available");
        require(msg.value == listing.price, "Incorrect payment amount");
        require(msg.sender != listing.seller, "Seller cannot buy own item");
        
        // Update listing status
        listing.status = ListingStatus.Sold;
        
        // Create order
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
        
        // If delivered, must be within dispute window
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
        
        // Transfer funds to charity
        (bool success, ) = order.charity.call{value: order.amount}("");
        require(success, "Transfer to charity failed");
        
        emit FundsReleasedToCharity(_orderId, order.charity, order.amount);
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
        ListingStatus status,
        address charity
    ) {
        Listing storage l = listings[_listingId];
        return (l.seller, l.metadataURI, l.price, l.status, l.charity);
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
}