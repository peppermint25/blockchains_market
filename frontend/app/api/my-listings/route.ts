import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, PINATA_GATEWAY } from "@/app/config/contract";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address required", listings: [], orders: [] }, { status: 400 });
  }

  try {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    // Get seller's listing IDs
    const listingIds = await contract.getSellerListings(address);
    const listings = [];
    const pendingOrders = [];

    for (const listingId of listingIds) {
      const listing = await contract.getListing(listingId);

      // Fetch metadata from IPFS
      let metadata = { name: "Unknown Item", description: "", image: "" };
      try {
        if (listing.metadataURI && listing.metadataURI.startsWith("ipfs://")) {
          const metadataURL = listing.metadataURI.replace("ipfs://", PINATA_GATEWAY);
          const response = await fetch(metadataURL);
          if (response.ok) {
            metadata = await response.json();
          }
        }
      } catch (e) {
        console.error("Failed to fetch listing metadata:", e);
      }

      // Handle image URL
      let imageUrl = "";
      if (metadata.image) {
        if (metadata.image.startsWith("ipfs://")) {
          imageUrl = metadata.image.replace("ipfs://", PINATA_GATEWAY);
        } else {
          imageUrl = metadata.image;
        }
      }

      listings.push({
        id: Number(listingId),
        seller: listing.seller,
        name: metadata.name,
        description: metadata.description,
        image: imageUrl,
        price: ethers.formatEther(listing.price),
        category: Number(listing.category),
        status: Number(listing.status),
        charity: listing.charity
      });
    }

    // Find orders where this seller needs to act (AwaitingShipment)
    const orderCount = await contract.orderCount();
    for (let i = 0; i < orderCount; i++) {
      const order = await contract.getOrder(i);
      
      if (order.seller.toLowerCase() === address.toLowerCase()) {
        const listing = await contract.getListing(order.listingId);
        
        // Fetch metadata
        let metadata = { name: "Unknown Item", description: "", image: "" };
        try {
          if (listing.metadataURI && listing.metadataURI.startsWith("ipfs://")) {
            const metadataURL = listing.metadataURI.replace("ipfs://", PINATA_GATEWAY);
            const response = await fetch(metadataURL);
            if (response.ok) {
              metadata = await response.json();
            }
          }
        } catch (e) {
          console.error("Failed to fetch metadata:", e);
        }

        let imageUrl = "";
        if (metadata.image) {
          imageUrl = metadata.image.startsWith("ipfs://") 
            ? metadata.image.replace("ipfs://", PINATA_GATEWAY)
            : metadata.image;
        }

        pendingOrders.push({
          id: i,
          listingId: Number(order.listingId),
          buyer: order.buyer,
          amount: ethers.formatEther(order.amount),
          status: Number(order.status),
          shippedAt: Number(order.shippedAt),
          deliveredAt: Number(order.deliveredAt),
          item: {
            name: metadata.name,
            image: imageUrl
          }
        });
      }
    }

    return NextResponse.json({ 
      listings: listings.reverse(),
      orders: pendingOrders.reverse()
    });
  } catch (error) {
    console.error("Error fetching seller data:", error);
    return NextResponse.json({ error: "Failed to fetch data", listings: [], orders: [] }, { status: 500 });
  }
}