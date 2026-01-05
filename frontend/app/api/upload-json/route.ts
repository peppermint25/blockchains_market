import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const metadata = await request.json();

    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PINATA_JWT}`
      },
      body: JSON.stringify(metadata)
    });

    if (!response.ok) {
      throw new Error("Failed to upload to Pinata");
    }

    const data = await response.json();
    return NextResponse.json({ ipfsHash: data.IpfsHash });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
