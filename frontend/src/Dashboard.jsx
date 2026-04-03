import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicKey, isConnected, signTransaction, requestAccess } from "@stellar/freighter-api";
import { TransactionBuilder, Operation, Asset, Networks, Account } from "@stellar/stellar-sdk";
import { ArrowRight, Clock, Send, Download, Wallet, LogIn, Copy } from "lucide-react";
import logo from "./assets/logo.svg";
import { getAccountDetails, getTransactionHistory, fundAccount, submitTransaction } from "./services/api";

function shortenKey(key) {
  if (!key || key.length < 20) return key;
  return `${key.slice(0, 5)}...${key.slice(-5)}`;
}

function formatDate(value) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function SpotlightCard({ children, className = "", as: Tag = "div" }) {
  const divRef = React.useRef(null);
  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    divRef.current.style.setProperty("--mouse-x", `${x}px`);
    divRef.current.style.setProperty("--mouse-y", `${y}px`);
  };
  return (
    <Tag ref={divRef} onMouseMove={handleMouseMove} className={className}>{children}</Tag>
  );
}

function useWalletConnection() {
  const [publicKey, setPublicKey] = useState("");
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("Ready");

  const connectFreighter = async (callbacks = {}) => {
    setStatus("Connecting to Freighter...");
    try {
      const detected = await isConnected();
      if (!detected) {
        setStatus("Extension not found");
        return { success: false };
      }

      await requestAccess();
      const address = await getPublicKey();
      if (!address) {
        setStatus("Connection failed: No account selected.");
        return { success: false };
      }

      setPublicKey(address);
      setConnected(true);
      setStatus("Connected");

      if (callbacks.onConnect) {
        await callbacks.onConnect(address);
      }
      return { success: true, address };
    } catch (error) {
      setStatus(`Connection error: ${error.message || String(error)}`);
      return { success: false };
    }
  };

  return { publicKey, setPublicKey, connected, setConnected, status, setStatus, connectFreighter };
}

function useAccountInfo(publicKey, setStatus) {
  const [xlmBalance, setXlmBalance] = useState("0");
  const [txHistory, setTxHistory] = useState([]);

  const refreshAccount = async (address) => {
    const target = address || publicKey;
    if (!target) return;
    try {
      const data = await getAccountDetails(target);
      const nativeBalance = data.balances?.find((item) => item.asset_type === "native")?.balance || "0";
      setXlmBalance(nativeBalance);
      setStatus("Balance refreshed");
    } catch (e) {
      setStatus(`Failed to load account: ${e.message || "Unknown error"}`);
      setXlmBalance("0");
    }
  };

  const updateTransactionHistory = async (address) => {
    const target = address || publicKey;
    if (!target) return;
    try {
      const data = await getTransactionHistory(target);
      setTxHistory(data.records || data || []);
    } catch (e) {
      setStatus(`Failed tx history: ${e.message}`);
      setTxHistory([]);
    }
  };

  const fundViaFriendbot = async () => {
    if (!publicKey) return;
    setStatus("Funding with Friendbot...");
    try {
      await fundAccount(publicKey);
      setStatus("Friendbot funding successful!");
      await refreshAccount(publicKey);
    } catch (error) {
      setStatus(`Funding error: ${error.response?.data?.error || error.message}`);
    }
  };

  return { xlmBalance, txHistory, refreshAccount, updateTransactionHistory, fundViaFriendbot };
}

function usePaymentForm(publicKey, setStatus, onPaymentSuccess) {
  const [sendAmount, setSendAmount] = useState("");
  const [sendDestination, setSendDestination] = useState("");
  const [sendResult, setSendResult] = useState(null);

  const sendPayment = async (e) => {
    e.preventDefault();
    setSendResult(null);

    if (!sendDestination || !sendAmount || Number(sendAmount) <= 0) {
      setSendResult({ type: "error", message: "Destination and amount are required." });
      return;
    }

    if (!publicKey) {
      setSendResult({ type: "error", message: "Connect wallet first." });
      return;
    }

    setStatus("Preparing transaction...");

    try {
      const accountData = await getAccountDetails(publicKey);
      const account = new Account(publicKey, accountData.sequence);
      const baseFee = "100";

      const tx = new TransactionBuilder(account, {
        fee: baseFee,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: sendDestination.trim(),
            asset: Asset.native(),
            amount: sendAmount.toString(),
          }),
        )
        .setTimeout(180)
        .build();

      const result = await signTransaction(tx.toXDR(), { networkPassphrase: Networks.TESTNET });
      if (result.error) throw new Error(result.error.message || "Failed to sign transaction");

      const submitResult = await submitTransaction(result.signedTxXdr);
      setSendResult({ type: "success", message: `Success! Hash: ${submitResult.hash}` });
      setStatus("Payment sent successfully.");
      setSendDestination("");
      setSendAmount("");
      if (onPaymentSuccess) {
        await onPaymentSuccess();
      }
    } catch (error) {
      let errorMessage = "Send failed";
      if (error?.response?.data?.extras?.result_codes?.transaction) {
        errorMessage = `Transaction failed: ${error.response.data.extras.result_codes.transaction}`;
      } else if (error?.message) {
        errorMessage = `Signing failed or rejected: ${error.message}`;
      }
      setSendResult({ type: "error", message: errorMessage });
      setStatus(`Send error: ${error.message}`);
    }
  };

  return { sendAmount, setSendAmount, sendDestination, setSendDestination, sendResult, sendPayment };
}

export default function Dashboard() {
  const { publicKey, setPublicKey, connected, setConnected, status, setStatus, connectFreighter } = useWalletConnection();
  const [isFreighterDetected, setIsFreighterDetected] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const { xlmBalance, txHistory, refreshAccount, updateTransactionHistory, fundViaFriendbot } = useAccountInfo(publicKey, setStatus);
  const { sendAmount, setSendAmount, sendDestination, setSendDestination, sendResult, sendPayment } = usePaymentForm(publicKey, setStatus, async () => {
    await refreshAccount();
    await updateTransactionHistory();
  });

  const handleCopyAddress = async () => {
    if (publicKey) {
      try {
        await navigator.clipboard.writeText(publicKey);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      } catch (err) { console.error("Failed to copy address:", err); }
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsChecking(true);
      try {
        let detected = await isConnected();
        
        // If not detected immediately, poll for up to 1 second to account for extension injection time
        if (!detected) {
          for (let i = 0; i < 5; i++) {
            await new Promise((resolve) => setTimeout(resolve, 200));
            if (await isConnected()) {
              detected = true;
              break;
            }
          }
        }

        setIsFreighterDetected(!!detected);
        if (detected) {
          // Silent check: attempt to get address if already authorized
          const address = await getPublicKey();
          if (address) {
            setPublicKey(address);
            setConnected(true);
            setStatus("Wallet connected.");
            // Don't let background data fetching block the UI progression
            refreshAccount(address).catch(err => console.warn("Balance check failed", err));
            updateTransactionHistory(address).catch(err => console.warn("History check failed", err));
          }
        }
      } catch (error) {
        console.error("Wallet initialization error:", error);
      } finally {
        setIsChecking(false);
      }
    };
    init();
  }, []);

  if (isChecking) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
          <p className="text-lg font-medium animate-pulse">Checking for wallet extension...</p>
        </div>
      </main>
    );
  }

  if (!isFreighterDetected) {
    return (
      <main className="min-h-[80vh] max-w-6xl mx-auto p-4 md:p-6 text-center text-slate-100 flex items-center justify-center">
        <div className="rounded-xl border border-white/10 bg-black/40 p-8 backdrop-blur-md">
          <Wallet size={48} className="mx-auto mb-4 text-cyan-400 opacity-50" />
          <h1 className="text-2xl font-bold text-white">Freighter Wallet Not Found</h1>
          <p className="mt-2 text-slate-400">Please install the Freighter extension to access your dashboard.</p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <a href="https://freighter.app/" target="_blank" rel="noopener noreferrer" className="glass-btn inline-flex items-center gap-2 px-8 py-3">
              <Download size={18} /> Download Extension
            </a>
            <button onClick={() => window.location.reload()} className="text-sm text-cyan-300 hover:text-cyan-200 underline">Refresh Page</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-[80vh] max-w-6xl mx-auto p-4 md:p-6 text-slate-100">
      <header className="glass-card flex flex-wrap items-center justify-between gap-4 p-5 mb-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="NexaPay" className="h-10 w-10" />
          <h1 className="text-2xl font-bold text-cyan-200">NexaPay Dashboard</h1>
        </div>
        <div className="hidden md:block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono text-cyan-300">
          STATUS: <span className="text-white uppercase">{status}</span>
        </div>
        <button className="glass-btn flex items-center gap-2 text-sm px-4 py-2" onClick={connectFreighter}>
          <Wallet size={16} /> {connected ? shortenKey(publicKey) : "Connect Wallet"}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SpotlightCard as="article" className="glass-card p-5">
          <h2 className="text-xl font-semibold text-cyan-200">Balance</h2>
          <p className="text-3xl font-bold text-white mt-4">{xlmBalance} XLM</p>
          <button className="glass-btn mt-6 w-full flex justify-center py-2" onClick={fundViaFriendbot}><Download size={16} className="mr-2" /> Fund Account</button>
        </SpotlightCard>

        <SpotlightCard as="article" className="glass-card p-5 lg:col-span-2">
          <h2 className="text-xl font-semibold text-cyan-200">Send Payment</h2>
          <form onSubmit={sendPayment} className="mt-5 space-y-4">
            <input className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300" placeholder="Destination Address" value={sendDestination} onChange={(e) => setSendDestination(e.target.value)} />
            <div className="flex gap-4">
              <input type="number" step="0.000001" className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-cyan-300" placeholder="Amount" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} />
              <button type="submit" className="glass-btn px-8"><Send size={16} /></button>
            </div>
          </form>
          {sendResult && <p className={`mt-4 p-3 rounded-lg text-sm ${sendResult.type === "error" ? "bg-rose-500/10 text-rose-300" : "bg-emerald-500/10 text-emerald-300"}`}>{sendResult.message}</p>}
        </SpotlightCard>
      </div>

      <SpotlightCard as="section" className="glass-card p-5 mt-6">
        <h2 className="text-xl font-semibold text-cyan-200 mb-4">Transaction History</h2>
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
          {txHistory.length > 0 ? txHistory.map((tx, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5 text-sm">
              <div>
                <p className="text-cyan-100 font-medium capitalize">{tx.type}</p>
                <p className="text-xs opacity-50">{formatDate(tx.created_at)}</p>
              </div>
              <p className="font-mono text-cyan-300">{tx.amount || tx.starting_balance || "-"} XLM</p>
            </div>
          )) : <p className="opacity-50 text-center py-8">No transactions found.</p>}
        </div>
      </SpotlightCard>
    </div>
  );
}