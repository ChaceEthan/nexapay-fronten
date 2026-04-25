import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Send as SendIcon, Loader2, AlertTriangle, Camera } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  sendStellarTransaction,
  accountExists,
  validateAddress,
  buildAndSignWithFreighter,
} from "@/services/stellar";
import { showToast } from "@/toastSlice";
import { fetchWalletData, sendPayment } from "@/walletSlice";
import { addNotification } from "@/notificationSlice";
import { triggerPush } from "@/utils/pushNotifications";
import QRScanner from "@/components/QRScanner";




const SUPPORTED_ASSETS = [
  { code: "XLM", issuer: null, name: "Stellar Lumens" },
  {
    code: "USDC",
    issuer: "GBBD67IF6QV6K6WJSZ7TYH66PWHXWNSXNCTW35ZJRYTHXNQKQ535N2F2",
    name: "USD Coin",
  },
];

// ✅ Portal wrapper — renders children directly into document.body
// bypasses ALL parent stacking contexts, transform, overflow: hidden, etc.
function BodyPortal({ children }) {
  return createPortal(children, document.body);
}

export default function TransactionForm({
  recipient: initialRecipient,
  onClose,
  onSuccess,
}) {
  const dispatch = useDispatch();

  const {
    address: senderAddress,
    balances,
    decryptedSecretKey,
    walletType,
    activeWalletId, // Get activeWalletId
    minReserve,
    networkFee, // Select networkFee from Redux state
    retryData,
  } = useSelector((state) => state?.wallet || {});

  const { isWalletUnlocked } = useSelector((state) => state?.auth || {});

  const [recipient, setRecipient] = useState(initialRecipient || "");
  const [isRecipientFunded, setIsRecipientFunded] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(SUPPORTED_ASSETS[0]);
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Keep local error state for form validation
  const [showQRScanner, setShowQRScanner] = useState(false);

  // ✅ Hard submit guard — blocks before any state update
  const submittingRef = useRef(false);

  // Sync recipient from prop (QR scan via Redux)
  useEffect(() => {
    if (initialRecipient) setRecipient(initialRecipient);
  }, [initialRecipient]);

  // Sync from retry metadata
  useEffect(() => {
    if (retryData) {
      setRecipient(retryData.destination || "");
      setAmount(retryData.amount || "");
      setMemo(retryData.memo || "");
      if (retryData.assetCode) {
        const asset = SUPPORTED_ASSETS.find((a) => a.code === retryData.assetCode);
        if (asset) setSelectedAsset(asset);
      }
    }
  }, [retryData]);

  // 🔍 Debounced recipient existence check
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const trimmed = recipient.trim();
      if (trimmed && validateAddress(trimmed)) {
        try {
          const exists = await accountExists(trimmed);
          if (!cancelled) setIsRecipientFunded(exists);
        } catch {
          if (!cancelled) setIsRecipientFunded(null);
        }
      } else {
        if (!cancelled) setIsRecipientFunded(null);
      }
    };
    const t = setTimeout(check, 600);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [recipient]);

  // Auto-focus amount if recipient pre-filled
  useEffect(() => {
    if (initialRecipient) {
      const el = document.getElementById("tx-amount");
      if (el) setTimeout(() => el.focus(), 150);
    }
  }, [initialRecipient]);

  // 🔥 MAX button
  const handleMaxClick = () => {
    if (!senderAddress || !balances.length) return;
    try {
      if (selectedAsset.code === "XLM") {
        const nativeBal =
          balances.find((b) => b.asset_type === "native")?.balance || "0";
        const fee = networkFee || "0.00001"; // Use networkFee from Redux
        const max =
          parseFloat(nativeBal) -
          parseFloat(fee) -
          parseFloat(minReserve);
        setAmount(max > 0 ? max.toFixed(7) : "0");
      } else {
        const assetBal =
          balances.find((b) => b.asset_code === selectedAsset.code)?.balance ||
          "0";
        setAmount(assetBal);
      }
    } catch {
      dispatch(
        showToast({ message: "Failed to calculate max amount", type: "error" })
      );
    }
  };

  // ✅ Validate all fields before submit
  const validate = () => {
    const trimmedRecipient = recipient.trim();
    const trimmedAmount = amount.trim();

    if (!senderAddress) return "Wallet not connected.";
    if (!trimmedRecipient || !validateAddress(trimmedRecipient))
      return "Enter a valid Stellar recipient address.";
    if (trimmedRecipient === senderAddress)
      return "Cannot send to your own address.";
    const parsed = parseFloat(trimmedAmount);
    if (!trimmedAmount || isNaN(parsed) || parsed <= 0)
      return "Enter a valid amount greater than zero.";
    return null;
  };

  // ✅ Reset loading ref + state together
  const resetLoading = () => {
    submittingRef.current = false;
    setLoading(false);
  };

  // 🚀 Main submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ HARD GUARD: block before ANY state change
    if (submittingRef.current) return;

    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Lock immediately
    submittingRef.current = true;
    setLoading(true);

    try {
      if (walletType === "FREIGHTER") {
        await runFreighterTx();
      } else {
        if (!isWalletUnlocked) {
          setError("Wallet is locked. Please unlock first.");
          resetLoading();
          return;
        }
        if (!decryptedSecretKey || !decryptedSecretKey.startsWith("S")) {
          setError("Wallet key unavailable. Please re-unlock.");
          resetLoading();
          return;
        }
        await runInternalTx(decryptedSecretKey);
      }
    } catch (err) {
      setError(err?.message || err || "Transaction failed. Please try again.");
      resetLoading();
    }
  };

  // 🔗 Freighter path
  const runFreighterTx = async () => {
    try {
      // Manually trigger "Pending" for Freighter since it bypasses the internal sendPayment thunk
      dispatch(addNotification({
        type: "info",
        category: "transaction",
        title: "Transaction Pending",
        message: `Broadcasting ${amount.trim()} ${selectedAsset.code} via Freighter...`,
        amount: amount.trim(),
        asset: selectedAsset.code,
        walletId: activeWalletId, // Pass walletId
      }));

      const txResult = await buildAndSignWithFreighter(
        senderAddress,
        recipient.trim(),
        amount.trim(),
        memo
      );

      // Manually trigger for Freighter since it bypasses the internal sendPayment thunk
      dispatch(addNotification({
        type: "success",
        category: "transaction",
        title: "Transfer Successful",
        message: `Sent ${amount.trim()} ${selectedAsset.code} via Freighter`,
        amount: amount.trim(),
        asset: selectedAsset.code,
        hash: txResult?.hash,
        walletId: activeWalletId, // Pass walletId
      }));

      notifySuccess(txResult, "Freighter");
      onSuccess && onSuccess(txResult);
    } catch (err) {
      dispatch(addNotification({
        type: "warning",
        category: "transaction",
        title: "Transaction Failed",
        message: err.message || "Freighter transaction failed",
        amount: amount.trim(),
        asset: selectedAsset.code,
        metadata: {
          destination: recipient.trim(),
          amount: amount.trim(),
          memo,
          assetCode: selectedAsset.code,
          assetIssuer: selectedAsset.issuer
        },
        walletId: activeWalletId, // Pass walletId
      }));
      throw err;
    } finally {
      resetLoading();
    }
  };

  // 🔓 Internal wallet path
  const runInternalTx = async (secretKey) => {
    try {
      const txResult = await dispatch(sendPayment({
        senderAddress,
        secretKey,
        destination: recipient.trim(),
        amount: amount.trim(),
        memo,
        assetCode: selectedAsset.code,
        assetIssuer: selectedAsset.issuer,
        activeWalletId // Pass walletId
      })).unwrap();
      
      notifySuccess(txResult, "");
      onSuccess && onSuccess(txResult);
    } catch (err) {
      setError(err || "Transaction failed. Please try again.");
    } finally {
      resetLoading();
    }
  };


  const notifySuccess = (txResult, via) => {
    const label = via ? ` via ${via}` : "";
    dispatch(showToast({ message: `Sent${label}!`, type: "success" }));
    triggerPush("NexaPay", `Sent ${amount.trim()} ${selectedAsset.code}`);
  };

  return (
    <>
      <div className="relative w-full max-w-md bg-[#1e2329] border border-[#2b3139] rounded-2xl shadow-xl">
        {/* CLOSE */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-lg font-black text-white">Send</h2>

          {/* ASSET */}
          <select
            value={selectedAsset.code}
            onChange={(e) =>
              setSelectedAsset(
                SUPPORTED_ASSETS.find((a) => a.code === e.target.value)
              )
            }
            className="w-full p-3 bg-black border border-gray-800 rounded-xl text-white outline-none focus:border-cyan-500/50 transition-all"
          >
            {SUPPORTED_ASSETS.map((a) => (
              <option key={a.code} value={a.code}>
                {a.name} ({a.code})
              </option>
            ))}
          </select>

          {/* RECIPIENT */}
          <div>
            <div className="flex gap-2">
              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Recipient (G...)"
                className="flex-1 p-3 bg-black border border-gray-800 rounded-xl text-white text-sm font-mono outline-none focus:border-cyan-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowQRScanner(true)}
                className="p-3 bg-black border border-gray-800 rounded-xl text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
                title="Scan QR Code"
              >
                <Camera size={18} />
              </button>
            </div>
            {isRecipientFunded === false &&
              recipient.trim() &&
              validateAddress(recipient.trim()) && (
                <div className="mt-2 flex items-center gap-2 text-yellow-400 text-xs">
                  <AlertTriangle size={13} />
                  Unfunded account — needs ≥1 XLM to activate
                </div>
              )}
            {isRecipientFunded === true && (
              <p className="mt-2 text-green-400 text-xs">✓ Account exists</p>
            )}
          </div>

          {/* AMOUNT */}
          <div className="flex gap-2">
            <input
              id="tx-amount"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value.replace(/[^0-9.]/g, ""))
              }
              placeholder="Amount"
              inputMode="decimal"
              className="flex-1 p-3 bg-black border border-gray-800 rounded-xl text-white outline-none focus:border-cyan-500/50 transition-all"
            />
            <button
              type="button"
              onClick={handleMaxClick}
              className="px-4 bg-black border border-gray-800 rounded-xl text-cyan-400 text-xs font-black uppercase tracking-widest hover:border-cyan-500/50 transition-all"
            >
              Max
            </button>
          </div>

          {/* MEMO */}
          <input
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Memo (optional)"
            className="w-full p-3 bg-black border border-gray-800 rounded-xl text-white outline-none focus:border-cyan-500/50 transition-all"
          />

          {/* FEE */}
          <p className="text-xs text-gray-500">
            Network fee:{" "}
            {networkFee ? `${networkFee} XLM` : "Fetching..."}
          </p>

          {/* ERROR */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertTriangle
                size={14}
                className="text-red-400 shrink-0 mt-0.5"
              />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* SEND */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-black p-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <SendIcon size={18} />
                Send {selectedAsset.code}
              </>
            )}
          </button>
        </form>
      </div>

      {/* ✅ QR SCANNER — rendered via React Portal directly into document.body
          This completely bypasses ALL parent stacking contexts, transforms,
          overflow:hidden, and z-index containment blocks. */}
      {showQRScanner &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 2147483647, // max safe integer z-index
              backgroundColor: "rgba(0,0,0,0.92)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
            }}
          >
            <QRScanner
              onClose={() => setShowQRScanner(false)}
              onScan={(addr) => {
                if (validateAddress(addr)) {
                  setRecipient(addr);
                  setShowQRScanner(false);
                }
              }}
            />
          </div>,
          document.body
        )}
    </>
  );
}