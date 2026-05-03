import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * Legacy auth callbacks now redirect into the wallet-first flow.
 */
export default function OAuthCallbackHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    console.warn('OAuthCallbackHandler hit, redirecting to root wallet flow.');

    const wallets = JSON.parse(localStorage.getItem('nexa_wallets') || '[]');
    if (wallets.length === 0) {
      navigate('/welcome', { replace: true });
      return;
    }

    navigate(localStorage.getItem('nexa_pin') ? '/vaults' : '/set-pin', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center text-white p-6">
      <div className="w-full max-w-md bg-[#1e2329] border border-[#2b3139] rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center gap-6 text-center">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
        <h2 className="text-2xl font-bold">Securing Session...</h2>
      </div>
    </div>
  );
}
