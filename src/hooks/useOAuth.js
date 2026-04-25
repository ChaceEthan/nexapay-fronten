import { useState, useEffect } from 'react';

// import { useDispatch } from 'react-redux'; // Re-add if needed for other parts of the app
const API_URL = import.meta.env.VITE_API_URL;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID; // If needed for frontend

export default function useOAuth() {
  const dispatch = useDispatch();
  // const navigate = useNavigate(); // No longer needed
  // const [loading, setLoading] = useState(false); // No longer needed
  // const [error, setError] = useState(null); // No longer needed
/*
  // Google Identity Services (GIS) setup
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn("VITE_GOOGLE_CLIENT_ID is not set. Google login will not be available.");
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false, // Don't auto-select an account
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []); // Empty dependency array means this runs once on mount

  const handleGoogleCredentialResponse = async (response) => {
    if (!response.credential) {
      setError("Google login failed: No credential received.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Send the Google ID token to your backend for verification and user creation/login
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Google login failed.');
      }

      // dispatch(setToken({ user: data.user, token: data.token, authMethod: 'google' })); // setToken removed

      // 🔥 FIX NAVIGATION: Determine next step based on wallet existence
      const wallets = JSON.parse(localStorage.getItem("nexa_wallets") || "[]");
      if (wallets.length === 0) {
        navigate("/create-wallet", { replace: true });
      } else if (wallets.length === 1) {
        dispatch(setWalletId(wallets[0].id));
        navigate("/unlock", { replace: true }); // No longer needed, authSlice handles initial routing
      } else {
        navigate("/select-wallet", { replace: true });
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    } // End try-catch-finally
  };

  const loginWithGoogle = () => {
    if (window.google && window.google.accounts.id) {
      window.google.accounts.id.prompt(); // Or render a button if preferred
    } else {
      setError("Google Identity Services not loaded.");
    }
  };

  const loginWithApple = () => {
    setLoading(true);
    setError(null);
    try {
      // For Apple, a simple redirect to your backend's Apple OAuth initiation endpoint
      // Your backend will handle the redirect to Apple, and then Apple will redirect back
      // to your backend, which then redirects to your frontend with a token/session.
      window.location.href = `${API_URL}/auth/apple`;
    } catch (err) {
      console.error('Apple login error:', err);
      setError(err.message || 'Failed to initiate Apple login.');
      setLoading(false);
    }
  }; // End loginWithApple

  return {
    loginWithGoogle,
    loginWithApple,
    loading,
    error,
  };
*/
  // OAuth system removed. Return no-op functions.
  return {
    loginWithGoogle: () => console.warn("OAuth login is disabled."),
    loginWithApple: () => console.warn("OAuth login is disabled."),
    loading: false, error: null,
  };
}