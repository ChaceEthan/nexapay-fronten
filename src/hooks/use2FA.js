import { useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux'; // No longer needed
// import { set2FAVerified } from '../authSlice'; // No longer needed

const API_URL = import.meta.env.VITE_API_URL;

export default function use2FA() {
  // const dispatch = useDispatch(); // No longer needed
  // const { token, twoFAMethod } = useSelector((state) => state.auth); // No longer needed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
/*
  const sendOTP = async () => {
    if (twoFAMethod !== 'sms') return; // Authenticator app doesn't need a 'send' step
    
    setLoading(true);
    setError(null);
    try {
      // const res = await fetch(`${API_URL}/auth/2fa/send`, { // Auth API removed
      //   method: 'POST',
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // if (!res.ok) throw new Error('Failed to send SMS code');
      console.warn("2FA sendOTP is disabled as auth system is removed.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
*/
  // 2FA system removed. Return no-op functions.
  return {
    sendOTP: () => console.warn("2FA sendOTP is disabled."),
    verify2FA: async () => { console.warn("2FA verify is disabled."); return false; },
    loading: false, error: null,
  };
}