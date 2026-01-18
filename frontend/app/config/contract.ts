export const CONTRACT_ADDRESS = "0xB838edd587EecA51725EB669Af0bd205A033AcC4";

export const CONTRACT_ABI = [
  // View functions
  "function listingCount() view returns (uint256)",
  "function orderCount() view returns (uint256)",
  "function admin() view returns (address)",
  "function admins(address) view returns (bool)",
  "function isAdminAddress(address _addr) view returns (bool)",
  "function getAllAdmins() view returns (address[])",
  "function getAdminCount() view returns (uint256)",
  "function getPrimaryAdmin() view returns (address)",
  "function getListing(uint256 _listingId) view returns (address seller, string metadataURI, uint256 price, uint8 category, uint8 status, address charity)",
  "function getOrder(uint256 _orderId) view returns (uint256 listingId, address buyer, address seller, address charity, uint256 amount, uint8 status, uint256 shippedAt, uint256 deliveredAt)",
  "function getDisputeReason(uint256 _orderId) view returns (string)",
  "function getCharityCount() view returns (uint256)",
  "function getCharity(uint256 _charityId) view returns (address charityAddress, string metadataURI, bool isVerified, uint256 totalReceived)",
  "function getAllCharities() view returns (tuple(address charityAddress, string metadataURI, bool isVerified, uint256 totalReceived)[])",
  "function getSellerListings(address _seller) view returns (uint256[])",
  "function getBuyerOrders(address _buyer) view returns (uint256[])",
  "function verifiedCharities(address) view returns (bool)",
  "function getAllGoals() view returns (tuple(uint256 id, address charity, string metadataURI, uint256 targetAmount, uint256 currentAmount, uint8 status, uint256 deadline)[])",
  "function getCharityGoals(address _charity) view returns (uint256[])",
  "function getAllItemRequests() view returns (tuple(uint256 id, address charity, string metadataURI, uint8 category, uint8 status, uint256 fulfilledCount)[])",
  "function getCharityItemRequests(address _charity) view returns (uint256[])",
  
  // Write functions
  "function createListing(string _metadataURI, uint256 _price, uint8 _category, address _charity) returns (uint256)",
  "function cancelListing(uint256 _listingId)",
  "function purchaseItem(uint256 _listingId) payable returns (uint256)",
  "function confirmShipment(uint256 _orderId)",
  "function confirmDelivery(uint256 _orderId)",
  "function openDispute(uint256 _orderId, string _reason)",
  "function releaseFundsToCharity(uint256 _orderId)",
  "function donateItemToCharity(string _metadataURI, uint8 _category, address _charity) returns (uint256)",
  "function donateItemForRequest(string _metadataURI, uint256 _requestId) returns (uint256)",
  
  // Admin functions
  "function addCharity(address _charityAddress, string _metadataURI) returns (uint256)",
  "function updateCharity(address _charityAddress, string _metadataURI, bool _isVerified)",
  "function resolveDispute(uint256 _orderId, bool _refundBuyer)",
  "function adminCancelListing(uint256 _listingId)",
  "function addAdmin(address _newAdmin)",
  "function removeAdmin(address _adminToRemove)",
  "function transferPrimaryAdmin(address _newAdmin)",
  
  // Charity functions
  "function createGoal(string _metadataURI, uint256 _targetAmount, uint256 _deadline) returns (uint256)",
  "function cancelGoal(uint256 _goalId)",
  "function createItemRequest(string _metadataURI, uint8 _category) returns (uint256)",
  "function cancelItemRequest(uint256 _requestId)",
  "function markItemRequestFulfilled(uint256 _requestId)"
];

export const PINATA_GATEWAY = "https://aquamarine-central-urial-125.mypinata.cloud/ipfs/";