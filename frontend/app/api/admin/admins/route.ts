import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/app/config/contract";

export async function GET() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    const adminList = await contract.getAllAdmins();
    const primaryAdmin = await contract.getPrimaryAdmin();

    const admins = adminList.map((address: string) => ({
      address,
      isPrimary: address.toLowerCase() === primaryAdmin.toLowerCase()
    }));

    return NextResponse.json({ admins, primaryAdmin });
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json({ error: "Failed to fetch admins", admins: [] }, { status: 500 });
  }
}