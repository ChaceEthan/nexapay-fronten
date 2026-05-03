import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchWalletData } from '../walletSlice.js';

/**
 * StellarCallbackHandler handles mobile deep link callbacks (SEP-7).
 */
export default function StellarCallbackHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeWalletId = useSelector((state) => state?.wallet?.activeWalletId);
  const activeWallet = useSelector((state) => {
    const wallets = state?.wallet?.wallets || [];
    return wallets.find((wallet) => wallet?.id === activeWalletId) || null;
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get('status');

    if (status === 'success' && activeWallet?.address) {
      dispatch(fetchWalletData(activeWallet.address));

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#ffffff', '#10b981'],
      });
    }

    const timer = setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 2500);

    return () => clearTimeout(timer);
  }, [location, navigate, dispatch, activeWallet?.address]);

  const queryParams = new URLSearchParams(location.search);
  const status = queryParams.get('status');
  const error = queryParams.get('error');

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-[#1e2329] p-8 rounded-2xl border border-[#2b3139] shadow-xl text-center">
        {status === 'success' ? (
          <>
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Transfer Successful</h1>
            <p className="text-[#848e9c] text-sm mb-4">Your transaction was processed successfully.</p>
          </>
        ) : status === 'error' || error ? (
          <>
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={32} className="text-rose-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Transaction Failed</h1>
            <p className="text-rose-400 text-sm mb-4">{error || 'The transaction was cancelled or failed.'}</p>
          </>
        ) : (
          <>
            <div className="mb-6">
              <Loader2 size={48} className="text-cyan-500 animate-spin mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Processing Response</h1>
            <p className="text-[#848e9c] text-sm mb-4">Confirming transaction status with the Stellar network...</p>
          </>
        )}
        <p className="text-[10px] text-[#848e9c] uppercase tracking-widest mt-4">Redirecting to Dashboard...</p>
      </div>
    </div>
  );
}
