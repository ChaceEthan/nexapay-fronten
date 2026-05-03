import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useResolvedPath } from "react-router-dom";
import { Keypair } from "@stellar/stellar-sdk";
import { Download, AlertCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import * as bip39 from "bip39";
import * as stellar from "@/services/stellar";
import { setActiveWallet, findWalletByAddress } from "../walletSlice";
import BackButton from "../components/BackButton";

const readSetupData = () => {
  try {
    const rawData = sessionStorage.getItem("wallet_setup");
    if (!rawData) return null;
    const data = JSON.parse(rawData);
    return data && typeof data === "object" ? data : null;
  } catch {
    sessionStorage.removeItem("wallet_setup");
    return null;
  }
};

export default function ImportWallet() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const resolvedPath = useResolvedPath(window.location.pathname);

  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const data = readSetupData();
    if (data?.confirmed && data?.mnemonic) {
      setInput(data.mnemonic);
    }
  }, []);

  const handleImport = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const cleanedInput = input.trim().replace(/\s+/g, " ");
      if (!cleanedInput) {
        setError("Enter a recovery phrase or secret key.");
        return;
      }

      const words = cleanedInput.split(" ");
      const isMnemonic = words.length >= 12;
      let publicKey = "";
      let secretKey = "";

      if (isMnemonic) {
        if (words.length !== 12 && words.length !== 24) {
          setError("Recovery phrase must be 12 or 24 words.");
          return;
        }

        if (!bip39.validateMnemonic(cleanedInput)) {
          setError("Invalid recovery phrase. Check spelling and word order.");
          return;
        }

        const setupData = readSetupData();
        if (setupData?.mnemonic === cleanedInput && !setupData.confirmed) {
          setError("Finish confirming this recovery phrase before importing it.");
          return;
        }

        const wallet = stellar.deriveKeypairFromMnemonic(cleanedInput);
        publicKey = wallet.publicKey;
        secretKey = wallet.secretKey;

        const existingWallet = findWalletByAddress(publicKey);
        if (existingWallet) {
          setError("This wallet already exists. Select it from Vaults.");
          return;
        }

        sessionStorage.setItem(
          "wallet_setup",
          JSON.stringify({
            id: uuidv4(),
            address: publicKey,
            mnemonic: cleanedInput,
            secretKey,
            walletType: "INTERNAL",
            isImported: true,
            confirmed: false,
          })
        );
        navigate("/confirm-phrase", { replace: true });
        return;
      }

      if (!cleanedInput.startsWith("S") || cleanedInput.length < 56) {
        setError("Invalid secret key. Should start with 'S' and be 56+ characters.");
        return;
      }

      try {
        const pair = Keypair.fromSecret(cleanedInput);
        publicKey = pair.publicKey();
        secretKey = cleanedInput;
      } catch {
        setError("Invalid Stellar secret key format.");
        return;
      }

      const existingWallet = findWalletByAddress(publicKey);
      if (existingWallet) {
        dispatch(setActiveWallet(existingWallet.id));
        navigate("/unlock-wallet", { replace: true });
        return;
      }

      sessionStorage.setItem(
        "wallet_setup",
        JSON.stringify({
          id: uuidv4(),
          address: publicKey,
          mnemonic: null,
          secretKey,
          walletType: "INTERNAL",
          isImported: true,
          confirmed: true,
        })
      );
      navigate("/set-pin", { replace: true });
    } catch (err) {
      setError(err?.message || "Import failed. Check your input.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0e11] text-white p-6">
      <div className="absolute top-6 left-6">
        <BackButton />
      </div>

      <div className="w-full max-w-lg bg-[#1e2329] border border-[#2b3139] rounded-[3rem] p-10 shadow-2xl">
        <div className="space-y-8">
          <div className="text-center">
            <div className="bg-purple-500/10 p-6 rounded-[2rem] mb-6 inline-block">
              <Download className="text-purple-400" size={42} />
            </div>

            <h2 className="text-3xl font-black mb-3">Import Wallet</h2>

            <p className="text-gray-400">
              Paste your 12/24-word recovery phrase or Stellar secret key
            </p>
          </div>

          <textarea
            placeholder="word1 word2 word3 ... or S..."
            className="w-full p-5 bg-black border border-gray-800 rounded-2xl text-sm font-mono outline-none focus:border-cyan-500/50 transition-all resize-none"
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && resolvedPath.pathname === "/import-wallet") {
                e.preventDefault();
                handleImport();
              }
            }}
          />

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={loading || !input.trim()}
            className="w-full bg-white text-black p-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-all"
          >
            {loading ? "Processing..." : "Import Wallet"}
          </button>
        </div>
      </div>
    </div>
  );
}
