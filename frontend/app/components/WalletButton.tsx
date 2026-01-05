"use client";
import { colors } from "@/app/styles/colors";
import { useWallet } from "@/app/hooks/useWallet";

export default function WalletButton() {
  const { address, isConnected, isConnecting, connect, disconnect, isWrongNetwork } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        {isWrongNetwork && (
          <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: "#ef4444", color: "white" }}>
            Wrong Network
          </span>
        )}
        <button
          onClick={disconnect}
          className="flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105"
          style={{ 
            backgroundColor: colors.button.secondary,
            color: colors.text.primary
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.button.secondaryHover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.button.secondary}
        >
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          {formatAddress(address)}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="px-4 py-2 rounded-full transition-all hover:scale-105 disabled:opacity-50"
      style={{ 
        backgroundColor: colors.button.primary,
        color: colors.background.primary
      }}
      onMouseEnter={(e) => {
        if (!isConnecting) e.currentTarget.style.backgroundColor = colors.button.primaryHover;
      }}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.button.primary}
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}