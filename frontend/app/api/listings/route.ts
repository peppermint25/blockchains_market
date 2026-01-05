import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, PINATA_GATEWAY } from "@/app/config/contract";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  
  if (!rpcUrl) {
    return NextResponse.json({ error: "RPC URL not configured", listings: [] }, { status: 500 });
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const count = await contract.listingCount();
    const listings = [];

    for (let i = 0; i < count; i++) {
      const listing = await contract.getListing(i);

      // Skip non-active listings (status !== 0)
      if (Number(listing.status) !== 0) continue;

      // Skip if category filter doesn't match
      if (category !== null && Number(listing.category) !== parseInt(category)) continue;

      // Fetch metadata from IPFS
      let metadata = { name: "Unknown", description: "", image: "" };
      try {
        const metadataURI = listing.metadataURI.replace("ipfs://", PINATA_GATEWAY);
        const response = await fetch(metadataURI);
        metadata = await response.json();
      } catch (e) {
        console.error("Failed to fetch metadata for listing", i);
      }

      let imageUrl = "/placeholder.png";
      if (metadata.image) {
        if (metadata.image.startsWith("ipfs://")) {
          imageUrl = metadata.image.replace("ipfs://", PINATA_GATEWAY);
        } else if (metadata.image.startsWith("http")) {
          imageUrl = metadata.image;
        }
      }

      listings.push({
        id: i,
        name: metadata.name,
        description: metadata.description,
        price: ethers.formatEther(listing.price),
        priceWei: listing.price.toString(),
        image: metadata.image?.replace("ipfs://", PINATA_GATEWAY) || "/placeholder.png",
        category: Number(listing.category),
        seller: listing.seller,
        charity: listing.charity,
        status: Number(listing.status)
      });
    }

    return NextResponse.json({ listings });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json({ error: "Failed to fetch listings", listings: [] }, { status: 500 });
  }
}