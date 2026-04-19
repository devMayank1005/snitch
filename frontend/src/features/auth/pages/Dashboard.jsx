import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { getCurrentUser, logoutUser } from "../service/auth.api.js";
import { logout, setIsAuthenticated, setLoading, setUser } from "../state/auth.slice.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const [syncing, setSyncing] = useState(true);

  useEffect(() => {
    const syncAuth = async () => {
      try {
        dispatch(setLoading(true));
        const response = await getCurrentUser();
        dispatch(setUser(response.data));
        dispatch(setIsAuthenticated(true));
      } catch (error) {
        dispatch(logout());
        navigate("/login", { replace: true });
      } finally {
        setSyncing(false);
        dispatch(setLoading(false));
      }
    };

    syncAuth();
  }, [dispatch, navigate]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      // ignore logout API failures and clear state anyway
    } finally {
      dispatch(logout());
      navigate("/login", { replace: true });
    }
  };

  if (syncing) {
    return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300">Syncing session...</div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white p-8">
      <div className="max-w-3xl mx-auto rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 bg-zinc-50 dark:bg-zinc-900/60">
        <p className="text-sm uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Dashboard</p>
        <h1 className="mt-3 text-3xl font-bold">Welcome{auth.user?.fullName ? `, ${auth.user.fullName}` : ""}</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Your Google or password session is active.</p>

        <div className="mt-8 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-5 bg-white dark:bg-zinc-950/60">
          <pre className="text-sm overflow-auto">{JSON.stringify(auth.user, null, 2)}</pre>
        </div>

        <button
          onClick={handleLogout}
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}