import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "../hook/useAuth.js";

const IconError = () => (
  <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { handleVerifyEmail, auth } = useAuth();
  const [verified, setVerified] = useState(false);
  const [localError, setLocalError] = useState("");
  const hasAttemptedRef = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const result = await handleVerifyEmail(token);
      if (result.success) {
        setVerified(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    };

    if (!token) {
      setLocalError("Verification token is missing or invalid.");
      return;
    }

    if (!hasAttemptedRef.current) {
      hasAttemptedRef.current = true;
      verifyEmail();
    }
  }, [token, navigate, handleVerifyEmail]);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div className="min-h-screen flex items-center justify-center font-[Inter,sans-serif] bg-white dark:bg-zinc-950 transition-colors duration-300 p-6">
        <div className="w-full max-w-[500px]">
          <div className="rounded-3xl p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
            
            {auth?.loading ? (
              // Loading state
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-600 shadow-xl shadow-indigo-600/20 animate-pulse">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 16.17L4.83 12m0 0L12 19.17M4.83 12H21" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Verifying Email</h2>
                <p className="text-zinc-500 dark:text-zinc-400">Please wait while we verify your email address...</p>
              </div>
            ) : verified ? (
              // Success state
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-green-600 to-emerald-600 shadow-xl shadow-green-600/20">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Email Verified!</h2>
                <p className="text-zinc-500 dark:text-zinc-400 mb-6">Your email has been verified successfully.</p>
                <button
                  onClick={() => navigate("/login")}
                  className="inline-block px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
                >
                  Continue to Login
                </button>
              </div>
            ) : (auth?.error || localError) ? (
              // Error state
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-gradient-to-br from-red-600 to-rose-600 shadow-xl shadow-red-600/20">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">Verification Failed</h2>
                <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-6 flex items-start gap-2 justify-center">
                  <IconError />
                  <span>{auth.error || localError}</span>
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/register")}
                    className="w-full inline-block px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
                  >
                    Back to Registration
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full inline-block px-6 py-3 rounded-xl border border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-500 font-semibold hover:bg-indigo-600/10 transition-colors"
                  >
                    Try Logging In
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
