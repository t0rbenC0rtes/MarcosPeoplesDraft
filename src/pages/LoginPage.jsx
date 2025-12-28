import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle, signInAnonymously } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      // Redirect happens automatically via OAuth
    } catch (error) {
      console.error("Google login error:", error);
      alert("Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    try {
      setLoading(true);
      await signInAnonymously(name);
      navigate("/share");
    } catch (error) {
      console.error("Anonymous login error:", error);
      alert("Failed to sign in anonymously");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Share Your Memory</h2>
        <p>Sign in to contribute to Marcos&apos;s memorial</p>

        <div className="login-methods">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn-google"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
              />
            </svg>
            Sign in with Google
          </button>

          <div className="divider">
            <span>or</span>
          </div>

          <form onSubmit={handleAnonymousLogin}>
            <label htmlFor="name">Your Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={loading}
              required
            />
            <button type="submit" disabled={loading} className="btn-primary">
              Continue Anonymously
            </button>
          </form>
        </div>

        <p className="login-note">
          Anonymous contributions are stored for 30 days. Sign in with Google
          for permanent access.
        </p>
      </div>
    </div>
  );
}
