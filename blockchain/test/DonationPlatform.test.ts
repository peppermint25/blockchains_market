import { expect } from "chai";
import hre from "hardhat";

describe("SecondhandMarket", function () {
  async function deployFixture() {
    const networkConnection = await hre.network.connect();
    const ethers = networkConnection.ethers;

    const [admin, seller, buyer, charity, otherUser] = await ethers.getSigners();

    const SecondhandMarket = await ethers.getContractFactory("SecondhandMarket");
    const market = await SecondhandMarket.deploy();

    // Verify the charity
    await market.verifyCharity(charity.address, true);

    return { market, ethers, admin, seller, buyer, charity, otherUser };
  }

  describe("Charity Management", function () {
    it("Should allow admin to verify charities", async function () {
      const { market, charity } = await deployFixture();
      expect(await market.verifiedCharities(charity.address)).to.equal(true);
    });

    it("Should not allow non-admin to verify charities", async function () {
      const { market, seller, otherUser } = await deployFixture();
      await expect(
        market.connect(seller).verifyCharity(otherUser.address, true)
      ).to.be.revertedWith("Only admin can do this");
    });
  });

  describe("Listing Items", function () {
    it("Should create a listing", async function () {
      const { market, ethers, seller, charity } = await deployFixture();

      const price = ethers.parseEther("0.1");
      await market.connect(seller).createListing("ipfs://item1", price, charity.address);

      const listing = await market.getListing(0);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(price);
      expect(listing.status).to.equal(0n); // Active
    });

    it("Should not allow listing with unverified charity", async function () {
      const { market, ethers, seller, otherUser } = await deployFixture();

      const price = ethers.parseEther("0.1");
      await expect(
        market.connect(seller).createListing("ipfs://item1", price, otherUser.address)
      ).to.be.revertedWith("Charity not verified");
    });

    it("Should allow seller to cancel listing", async function () {
      const { market, ethers, seller, charity } = await deployFixture();

      const price = ethers.parseEther("0.1");
      await market.connect(seller).createListing("ipfs://item1", price, charity.address);
      await market.connect(seller).cancelListing(0);

      const listing = await market.getListing(0);
      expect(listing.status).to.equal(2n); // Cancelled
    });
  });

  describe("Purchase Flow", function () {
    it("Should allow buyer to purchase item", async function () {
      const { market, ethers, seller, buyer, charity } = await deployFixture();

      const price = ethers.parseEther("0.1");
      await market.connect(seller).createListing("ipfs://item1", price, charity.address);
      await market.connect(buyer).purchaseItem(0, { value: price });

      const order = await market.getOrder(0);
      expect(order.buyer).to.equal(buyer.address);
      expect(order.status).to.equal(0n); // AwaitingShipment
    });

    it("Should allow seller to confirm shipment", async function () {
      const { market, ethers, seller, buyer, charity } = await deployFixture();

      const price = ethers.parseEther("0.1");
      await market.connect(seller).createListing("ipfs://item1", price, charity.address);
      await market.connect(buyer).purchaseItem(0, { value: price });
      await market.connect(seller).confirmShipment(0);

      const order = await market.getOrder(0);
      expect(order.status).to.equal(1n); // Shipped
    });

    it("Should allow buyer to confirm delivery", async function () {
      const { market, ethers, seller, buyer, charity } = await deployFixture();

      const price = ethers.parseEther("0.1");
      await market.connect(seller).createListing("ipfs://item1", price, charity.address);
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
      await market.connect(seller).createListing("ipfs://item1", price, charity.address);
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
      await market.connect(seller).createListing("ipfs://item1", price, charity.address);
      await market.connect(buyer).purchaseItem(0, { value: price });
      await market.connect(seller).confirmShipment(0);
      await market.connect(buyer).openDispute(0, "Item not as described");

      const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);
      await market.connect(admin).resolveDispute(0, true); // Refund
      const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);

      expect(buyerBalanceAfter - buyerBalanceBefore).to.equal(price);

      const order = await market.getOrder(0);
      expect(order.status).to.equal(5n); // Refunded
    });
  });
});