import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/app/config/contract";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ isAdmin: false });
  }

  try {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const isAdmin = await contract.isAdminAddress(address);

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error("Error checking admin:", error);
    return NextResponse.json({ isAdmin: false });
  }
}