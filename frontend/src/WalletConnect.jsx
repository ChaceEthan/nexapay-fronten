import React from "react";
import { Wallet } from "lucide-react";
import { requestAccess, getPublicKey, isConnected } from "@stellar/freighter-api";

export default function WalletConnect({ connected, onConnect, setStatus }) {
  const handleConnect = async () => {
    try {
      const active = await isConnected();
      if (!active) {
        setStatus("Freighter extension not detected.");
        return;
      }
      setStatus("Connecting to Freighter...");
      await requestAccess();
      const address = await getPublicKey();
      if (address) {
        onConnect(address);
        setStatus("Wallet connected.");
      }
    } catch (e) {
      setStatus(`Connection failed: ${e.message || "User rejected"}`);
    }
  };

  return (
    <button onClick={handleConnect} className="glass-btn flex items-center gap-2 text-sm px-4 py-2">
      <Wallet size={16} /> {connected ? "Wallet Connected" : "Connect Wallet"}
    </button>
  );
}
