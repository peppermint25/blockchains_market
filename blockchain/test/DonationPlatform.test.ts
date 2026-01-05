import { expect } from "chai";
import hre from "hardhat";

describe("SecondhandMarket", function () {
  const Category = {
    Clothing: 0,
    HouseGoods: 1,
    Electronics: 2,
    SportsGoods: 3,
    Hobbies: 4
  };

  async function deployFixture() {
    const networkConnection = await hre.network.connect();
    const ethers = networkConnection.ethers;

    const [admin, seller, buyer, charity, otherUser] = await ethers.getSigners();

    const SecondhandMarket = await ethers.getContractFactory("SecondhandMarket");
    const market = await SecondhandMarket.deploy();

    // Add and verify the charity using addCharity
    await market.addCharity(charity.address, "ipfs://charity-metadata");

    return { market, ethers, admin, seller, buyer, charity, otherUser };
  }

  describe("Charity Management", function () {
    it("Should allow admin to add charities", async function () {
      const { market, charity } = await deployFixture();
      expect(await market.verifiedCharities(charity.address)).to.equal(true);
    });

    it("Should not allow non-admin to add charities", async function () {
      const { market, seller, otherUser } = await deployFixture();
      await expect(
        market.connect(seller).addCharity(otherUser.address, "ipfs://test")
      ).to.be.revertedWith("Only admin can do this");
    });
  });

  describe("Listing Items", function () {
    it("Should create a listing", async function () {
      const { market, ethers, seller, charity } = await deployFixture();

      const price = ethers.parseEther("0.1");
      await market.connect(seller).createListing(
        "ipfs://item1",
        price,
        Category.Electronics,
        charity.address
      );

      const listing = await market.getListing(0);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(price);
      expect(listing.category).to.equal(BigInt(Category.Electronics));
      expect(listing.status).to.equal(0n); // Active
    });

    it("Should not allow listing with unverified charity", async function () {
      const { market, ethers, seller, otherUser } = await deployFixture();

      const price = ethers.parseEther("0.1");
      await expect(
        market.connect(seller).createListing(
          "ipfs://item1",
          price,
          Category.Clothing,
          otherUser.address
        )
      ).to.be.revertedWith("Charity not verified");
    });

    it("Should allow seller to cancel listing", async function () {
      const { market, ethers, seller, charity } = await deployFixture();

      const price = ethers.parseEther("0.1");
      await market.connect(seller).createListing(
        "ipfs://item1",
        price,
        Category.HouseGoods,
        charity.address
      );
      await market.connect(seller).cancelListing(0);

      const listing = await market.getListing(0);
      expect(listing.status).to.equal(2n); // Cancelled
    });
  });

  describe("Purchase Flow", function () {
    it("Should allow buyer to purchase item", async function () {
      const { market, ethers, seller, buyer, charity } = await deployFixture();

      const price = ethers.parseEther("0.1");
      await market.connect(seller).createListing(
        "ipfs://item1",
        price,
        Category.SportsGoods,
        charity.address
      );
      await market.connect(buyer).purchaseItem(0, { value: price });

      const order = await market.getOrder(0);
      expect(order.buyer).to.equal(buyer.address);
      expect(order.status).to.equal(0n); // AwaitingShipment
    });

    it("Should allow seller to confirm shipment", async function () {
      const { market, ethers, seller, buyer, charity } = await deployFixture();

      const price = ethers.parseEther("0.1");
      await market.connect(seller).createListing(
        "ipfs://item1",
        price,
        Category.Hobbies,
        charity.address
      );
      await market.connect(buyer).purchaseItem(0, { value: price });
      await market.connect(seller).confirmShipment(0);

      const order = await market.getOrder(0);
      expect(order.status).to.equal(1n); // Shipped
    });

    it("Should allow buyer to confirm delivery", async function () {
      const { market, ethers, seller, buyer, charity } = await deployFixture();

      const price = ethers.parseEther("0.1");
      await market.connect(seller).createListing(
        "ipfs://item1",
        price,
        Category.Electronics,
        charity.address
      );
      await market.connect(buyer).purchaseItem(0, { value: price });
      await market.connect(seller).confirmShipment(0);
      await market.connect(buyer).confirmDelivery(0);

      const order = await market.getOrder(0);
      expect(order.status).to.equal(2n); // Delivered
    });
  });

  describe("Disputes", function () {
    it("Should allow buyer to open dispute", async function () {
      const { market, ethers, seller, buyer, charity } = await deployFixture();

      const price = ethers.parseEther("0.1");
      await market.connect(seller).createListing(
        "ipfs://item1",
        price,
        Category.Clothing,
        charity.address
      );
      await market.connect(buyer).purchaseItem(0, { value: price });
      await market.connect(seller).confirmShipment(0);
      await market.connect(buyer).openDispute(0, "Item not as described");

      const order = await market.getOrder(0);
      expect(order.status).to.equal(4n); // Disputed

      const reason = await market.getDisputeReason(0);
      expect(reason).to.equal("Item not as described");
    });

    it("Should allow admin to resolve dispute with refund", async function () {
      const { market, ethers, admin, seller, buyer, charity } = await deployFixture();

      const price = ethers.parseEther("0.1");
      await market.connect(seller).createListing(
        "ipfs://item1",
        price,
        Category.HouseGoods,
        charity.address
      );
      await market.connect(buyer).purchaseItem(0, { value: price });
      await market.connect(seller).confirmShipment(0);
      await market.connect(buyer).openDispute(0, "Item not as described");

      const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);
      await market.connect(admin).resolveDispute(0, true);
      const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);

      expect(buyerBalanceAfter - buyerBalanceBefore).to.equal(price);

      const order = await market.getOrder(0);
      expect(order.status).to.equal(5n); // Refunded
    });
  });

  describe("Direct Donation", function () {
    it("Should allow seller to donate item directly to charity", async function () {
      const { market, seller, charity } = await deployFixture();

      await market.connect(seller).donateItemToCharity(
        "ipfs://donated-item",
        Category.Clothing,
        charity.address
      );

      const listing = await market.getListing(0);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(0n);
      expect(listing.status).to.equal(1n); // Sold
    });
  });

  describe("History Tracking", function () {
    it("Should track seller listings", async function () {
      const { market, ethers, seller, charity } = await deployFixture();

      const price = ethers.parseEther("0.1");
      await market.connect(seller).createListing("ipfs://item1", price, Category.Electronics, charity.address);
      await market.connect(seller).createListing("ipfs://item2", price, Category.Clothing, charity.address);

      const sellerListings = await market.getSellerListings(seller.address);
      expect(sellerListings.length).to.equal(2);
    });

    it("Should track buyer orders", async function () {
      const { market, ethers, seller, buyer, charity } = await deployFixture();

      const price = ethers.parseEther("0.1");
      await market.connect(seller).createListing("ipfs://item1", price, Category.Electronics, charity.address);
      await market.connect(buyer).purchaseItem(0, { value: price });

      const buyerOrders = await market.getBuyerOrders(buyer.address);
      expect(buyerOrders.length).to.equal(1);
    });
  });

  describe("Charity Goals", function () {
    it("Should allow charity to create a goal", async function () {
      const { market, ethers, charity } = await deployFixture();

      const target = ethers.parseEther("1");
      const deadline = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days

      await market.connect(charity).createGoal(
        "ipfs://goal-metadata",
        target,
        deadline
      );

      const goal = await market.getGoal(0);
      expect(goal.charity).to.equal(charity.address);
      expect(goal.targetAmount).to.equal(target);
      expect(goal.currentAmount).to.equal(0n);
      expect(goal.status).to.equal(0n); // Active
    });

    it("Should not allow non-charity to create goal", async function () {
      const { market, ethers, seller } = await deployFixture();

      const target = ethers.parseEther("1");
      const deadline = Math.floor(Date.now() / 1000) + 86400 * 30;

      await expect(
        market.connect(seller).createGoal("ipfs://goal", target, deadline)
      ).to.be.revertedWith("Only verified charity can do this");
    });

    it("Should allow charity to cancel goal", async function () {
      const { market, ethers, charity } = await deployFixture();

      const target = ethers.parseEther("1");
      const deadline = Math.floor(Date.now() / 1000) + 86400 * 30;

      await market.connect(charity).createGoal("ipfs://goal", target, deadline);
      await market.connect(charity).cancelGoal(0);

      const goal = await market.getGoal(0);
      expect(goal.status).to.equal(2n); // Cancelled
    });
  });

  describe("Item Requests", function () {
    it("Should allow charity to create item request", async function () {
      const { market, charity } = await deployFixture();

      await market.connect(charity).createItemRequest(
        "ipfs://request-metadata",
        Category.Clothing
      );

      const request = await market.getItemRequest(0);
      expect(request.charity).to.equal(charity.address);
      expect(request.category).to.equal(BigInt(Category.Clothing));
      expect(request.status).to.equal(0n); // Active
    });

    it("Should allow donor to fulfill item request", async function () {
      const { market, seller, charity } = await deployFixture();

      await market.connect(charity).createItemRequest(
        "ipfs://need-winter-coats",
        Category.Clothing
      );

      await market.connect(seller).donateItemForRequest(
        "ipfs://donated-coat",
        0
      );

      const request = await market.getItemRequest(0);
      expect(request.fulfilledCount).to.equal(1n);

      const listing = await market.getListing(0);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.charity).to.equal(charity.address);
    });

    it("Should allow charity to mark request as fulfilled", async function () {
      const { market, charity } = await deployFixture();

      await market.connect(charity).createItemRequest(
        "ipfs://request",
        Category.Electronics
      );

      await market.connect(charity).markItemRequestFulfilled(0);

      const request = await market.getItemRequest(0);
      expect(request.status).to.equal(1n); // Fulfilled
    });
  });
});