import { startGoogleAuth } from "../service/auth.api.js";

export default function GoogleOAuthButton() {
  return (
    <button
      type="button"
      onClick={startGoogleAuth}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 font-semibold text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8A6.6 6.6 0 1 1 12 5.4c1.9 0 3.2.8 4 1.5l2.7-2.6A10 10 0 1 0 12 22c5.9 0 9.8-4.1 9.8-9.9 0-.7-.1-1.2-.2-1.8H12z"/>
      </svg>
      Continue with Google
    </button>
  );
}