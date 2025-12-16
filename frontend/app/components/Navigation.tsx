"use client";

import Link from "next/link";
import Image from "next/image";
import { colors } from "@/app/styles/colors";

export default function Navigation() {
  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        backgroundColor: colors.background.primary + 'dd',
        borderColor: colors.border.primary
      }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group hover:scale-105">
              <Image
                className="transition-transform"
                src="/images/bcsm-dark-mode.png"
                alt="BCSM logo"
                width={80}
                height={80}
                priority
              />
              <span
                className="text-4xl font-light tracking-tight"
                style={{ color: colors.text.primary }}
              >
                BCSM
              </span>
            </Link>
          </div>
          <nav className="flex items-center gap-10">
            <Link
              href="/categories/clothing"
              className="text-lg font-regular uppercase transition-all hover:scale-105"
              style={{ color: colors.text.secondary }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.text.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.text.secondary}
            >
              Clothing
            </Link>
            <Link
              href="/categories/sports"
              className="text-lg  font-regular uppercase transition-all hover:scale-105"
              style={{ color: colors.text.secondary }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.text.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.text.secondary}
            >
              Sports
            </Link>
            <Link
              href="/categories/household"
              className="text-lg  font-regular uppercase transition-all hover:scale-105"
              style={{ color: colors.text.secondary }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.text.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.text.secondary}
            >
              Household
            </Link>
              <Link
                  href="/categories/electronics"
                  className="text-lg  font-regular uppercase transition-all hover:scale-105"
                  style={{ color: colors.text.secondary }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.text.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.text.secondary}
              >
                  Electronics
              </Link>
            <button
              className="flex items-center justify-center w-14 h-14 rounded-full transition-all hover:scale-110 text-2xl"
              style={{ backgroundColor: colors.button.secondary }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.button.secondaryHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.button.secondary}
            >
              🛒
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
