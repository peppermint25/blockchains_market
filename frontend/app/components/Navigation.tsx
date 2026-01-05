"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { colors } from "@/app/styles/colors";
import WalletButton from "@/app/components/WalletButton";
import { useCart } from "@/app/context/CartContext";
import { useWallet } from "@/app/hooks/useWallet";

export default function Navigation() {
  const { totalItems, openCart } = useCart();
  const { address } = useWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCharity, setIsCharity] = useState(false);

  useEffect(() => {
    async function checkRoles() {
      if (!address) {
        setIsAdmin(false);
        setIsCharity(false);
        return;
      }

      try {
        // Check admin
        const adminResponse = await fetch(`/api/admin?address=${address}`);
        const adminData = await adminResponse.json();
        setIsAdmin(adminData.isAdmin);

        // Check charity
        const charityResponse = await fetch(`/api/charity/check?address=${address}`);
        const charityData = await charityResponse.json();
        setIsCharity(charityData.isCharity);
      } catch {
        setIsAdmin(false);
        setIsCharity(false);
      }
    }

    checkRoles();
  }, [address]);

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        backgroundColor: colors.background.primary + 'dd',
        borderColor: colors.border.primary
      }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group hover:scale-105">
              <Image
                className="transition-transform"
                src="/images/bcsm-dark-mode.png"
                alt="BCSM logo"
                width={60}
                height={60}
                priority
              />
              <span
                className="text-3xl font-light tracking-tight"
                style={{ color: colors.text.primary }}
              >
                BCSM
              </span>
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/shop"
              className="text-base font-medium uppercase transition-all hover:scale-105"
              style={{ color: colors.text.secondary }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.text.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.text.secondary}
            >
              Shop
            </Link>
            <Link
              href="/charities"
              className="text-base font-medium uppercase transition-all hover:scale-105"
              style={{ color: colors.text.secondary }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.text.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.text.secondary}
            >
              Charities
            </Link>
            <Link
              href="/sell"
              className="text-base font-medium uppercase transition-all hover:scale-105"
              style={{ color: colors.text.secondary }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.text.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.text.secondary}
            >
              Sell
            </Link>
            <Link
              href="/donate"
              className="text-base font-medium uppercase transition-all hover:scale-105"
              style={{ color: colors.text.secondary }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.text.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.text.secondary}
            >
              Donate
            </Link>
            <Link
              href="/orders"
              className="text-base font-medium uppercase transition-all hover:scale-105"
              style={{ color: colors.text.secondary }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.text.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.text.secondary}
            >
              Orders
            </Link>
            <Link
              href="/my-listings"
              className="text-base font-medium uppercase transition-all hover:scale-105"
              style={{ color: colors.text.secondary }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.text.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.text.secondary}
            >
              Listings
            </Link>

            {isCharity && (
              <Link
                href="/charity-dashboard"
                className="text-base font-medium uppercase transition-all hover:scale-105"
                style={{ color: "#22c55e" }}
              >
                Dashboard
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className="text-base font-medium uppercase transition-all hover:scale-105"
                style={{ color: "#f59e0b" }}
              >
                Admin
              </Link>
            )}
            
            <WalletButton />
            
            <button
              onClick={openCart}
              className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all hover:scale-110 text-xl"
              style={{ backgroundColor: colors.button.secondary }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.button.secondaryHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.button.secondary}
            >
              🛒
              {totalItems > 0 && (
                <span 
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ 
                    backgroundColor: colors.button.primary,
                    color: colors.background.primary
                  }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}