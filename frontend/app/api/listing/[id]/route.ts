import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, PINATA_GATEWAY } from "@/app/config/contract";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const listingId = parseInt(id);

  if (isNaN(listingId)) {
    return NextResponse.json({ error: "Invalid listing ID" }, { status: 400 });
  }

  try {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const listing = await contract.getListing(listingId);

    // Fetch metadata from IPFS
    let metadata: {
      name: string;
      description: string;
      image: string;
      condition?: string;
      size?: string;
      color?: string;
      brand?: string;
    } = { name: "Unknown Item", description: "", image: "" };

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

    // Get charity name
    let charityName = "";
    try {
      const charityCount = await contract.getCharityCount();
      for (let i = 0; i < charityCount; i++) {
        const charity = await contract.getCharity(i);
        if (charity.charityAddress.toLowerCase() === listing.charity.toLowerCase()) {
          if (charity.metadataURI && charity.metadataURI.startsWith("ipfs://")) {
            const charityMetaURL = charity.metadataURI.replace("ipfs://", PINATA_GATEWAY);
            const charityResponse = await fetch(charityMetaURL);
            if (charityResponse.ok) {
              const charityMeta = await charityResponse.json();
              charityName = charityMeta.name || "";
            }
          } else if (charity.metadataURI) {
            charityName = charity.metadataURI;
          }
          break;
        }
      }
    } catch (e) {
      console.error("Failed to fetch charity metadata:", e);
    }

    let imageUrl = "";
    if (metadata.image) {
      imageUrl = metadata.image.startsWith("ipfs://")
        ? metadata.image.replace("ipfs://", PINATA_GATEWAY)
        : metadata.image;
    }

    const formattedListing = {
      id: listingId,
      name: metadata.name,
      description: metadata.description,
      price: ethers.formatEther(listing.price),
      priceWei: listing.price.toString(),
      image: imageUrl,
      category: Number(listing.category),
      seller: listing.seller,
      charity: listing.charity,
      charityName,
      status: Number(listing.status),
      details: {
        condition: metadata.condition || "",
        size: metadata.size || "",
        color: metadata.color || "",
        brand: metadata.brand || ""
      }
    };

    return NextResponse.json({ listing: formattedListing });
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json({ error: "Failed to fetch listing" }, { status: 500 });
  }
}