"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { colors } from "@/app/styles/colors";
import { ItemForm } from "@/app/components/ItemForm";

function DonateFormWrapper() {
  const searchParams = useSearchParams();
  const preselectedCharity = searchParams.get("charity") || "";

  return (
    <ItemForm
      mode="donate"
      preselectedCharity={preselectedCharity}
      header={
        <div className="text-left mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text.primary }}>
            Donate an Item
          </h1>
          <p style={{ color: colors.text.secondary }}>
            Give your items directly to a charity - no sale needed!
          </p>
        </div>
      }
      submitButtonText="💝 Donate Item"
      submitButtonColor="#22c55e"
    />
  );
}

export default function DonatePage() {
  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: colors.background.secondary }}>
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <p style={{ color: colors.text.primary }}>Loading...</p>
        </div>
      }>
        <DonateFormWrapper />
      </Suspense>
    </div>
  );
}
