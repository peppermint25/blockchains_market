"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { colors } from "@/app/styles/colors";
import { ItemForm } from "@/app/components/ItemForm";

function SellFormWrapper() {
  const searchParams = useSearchParams();
  const preselectedCharity = searchParams.get("charity") || "";

  return (
    <ItemForm
      mode="sell"
      preselectedCharity={preselectedCharity}
      header={
          <div className="text-left mb-8">
              <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text.primary }}>
                  Sell an Item
              </h1>
              <p style={{ color: colors.text.secondary }}>
                  Sell your items and remember - all proceeds go directly to a charity of your choice!
              </p>
          </div>
      }
      submitButtonText="Create Listing"
      submitButtonColor={colors.button.primary}
    />
  );
}

export default function SellPage() {
  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: colors.background.secondary }}>
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <p style={{ color: colors.text.primary }}>Loading...</p>
        </div>
      }>
        <SellFormWrapper />
      </Suspense>
    </div>
  );
}
