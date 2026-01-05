"use client";
import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  error: string | null;
}

const DISCONNECTED_KEY = "wallet_disconnected";

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    chainId: null,
    error: null
  });

  const SEPOLIA_CHAIN_ID = 11155111;

  // Check if already connected on mount
  useEffect(() => {
    async function checkConnection() {
      if (typeof window.ethereum === "undefined") return;

      // Check if user manually disconnected
      const wasDisconnected = localStorage.getItem(DISCONNECTED_KEY);
      if (wasDisconnected === "true") {
        return; // Don't auto-connect if user disconnected
      }

      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" }) as string[];
        if (accounts.length > 0) {
          const chainId = await window.ethereum.request({ method: "eth_chainId" }) as string;
          setWallet({
            address: accounts[0],
            isConnected: true,
            isConnecting: false,
            chainId: parseInt(chainId, 16),
            error: null
          });
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: unknown) => {
        const accts = accounts as string[];
        if (accts.length === 0) {
          setWallet(prev => ({ ...prev, address: null, isConnected: false }));
        } else {
          // Clear disconnect flag when user connects via MetaMask
          localStorage.removeItem(DISCONNECTED_KEY);
          setWallet(prev => ({ ...prev, address: accts[0], isConnected: true }));
        }
      };

      const handleChainChanged = (chainId: unknown) => {
        setWallet(prev => ({ ...prev, chainId: parseInt(chainId as string, 16) }));
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      // Cleanup listeners on unmount
      return () => {
        window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum?.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  const connect = useCallback(async () => {
    if (typeof window.ethereum === "undefined") {
      setWallet(prev => ({ ...prev, error: "Please install MetaMask" }));
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    setWallet(prev => ({ ...prev, isConnecting: true, error: null }));

    // Clear disconnect flag
    localStorage.removeItem(DISCONNECTED_KEY);

    try {
      const accounts = await window.ethereum.request({ 
        method: "eth_requestAccounts" 
      }) as string[];

      const chainId = await window.ethereum.request({ method: "eth_chainId" }) as string;
      const currentChainId = parseInt(chainId, 16);

      // Switch to Sepolia if not on it
      if (currentChainId !== SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }]
          });
        } catch (switchError: unknown) {
          const isMissingChain = switchError instanceof Error && 
            'code' in switchError && 
            (switchError as Error & { code: number }).code === 4902;
            
          if (isMissingChain) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: "0xaa36a7",
                chainName: "Sepolia Testnet",
                nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
                rpcUrls: ["https://rpc.sepolia.org"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"]
              }]
            });
          }
        }
      }

      setWallet({
        address: accounts[0],
        isConnected: true,
        isConnecting: false,
        chainId: SEPOLIA_CHAIN_ID,
        error: null
      });
    } catch (error: unknown) {
      setWallet(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : "Failed to connect"
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    // Set flag to prevent auto-reconnect
    localStorage.setItem(DISCONNECTED_KEY, "true");
    
    setWallet({
      address: null,
      isConnected: false,
      isConnecting: false,
      chainId: null,
      error: null
    });
  }, []);

  const getProvider = useCallback(() => {
    if (typeof window.ethereum === "undefined") return null;
    return new ethers.BrowserProvider(window.ethereum);
  }, []);

  const getSigner = useCallback(async () => {
    const provider = getProvider();
    if (!provider) return null;
    return await provider.getSigner();
  }, [getProvider]);

  return {
    ...wallet,
    connect,
    disconnect,
    getProvider,
    getSigner,
    isWrongNetwork: wallet.chainId !== null && wallet.chainId !== SEPOLIA_CHAIN_ID
  };
}