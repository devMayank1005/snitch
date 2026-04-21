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

  // Synchronize session on mount
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
      // safely bypass error and clear client state
    } finally {
      dispatch(logout());
      navigate("/login", { replace: true });
    }
  };

  if (syncing) {
    return (
        <div className="min-h-screen flex items-center justify-center text-[10px] uppercase tracking-[0.2em] font-medium" style={{ backgroundColor: '#fbf9f6', color: '#C9A96E' }}>
            Synchronizing...
        </div>
    );
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <div className="min-h-screen pb-24" style={{ backgroundColor: '#fbf9f6', fontFamily: "'Inter', sans-serif" }}>
        
        {/* ── Top Nav ── */}
        <div className="max-w-6xl mx-auto px-8 lg:px-16 pt-10 pb-6 flex items-center justify-between">
            <button
                onClick={() => navigate('/')}
                className="text-lg transition-colors duration-200 leading-none"
                style={{ color: '#B5ADA3' }}
                aria-label="Go home"
                onMouseEnter={e => e.currentTarget.style.color = '#1b1c1a'}
                onMouseLeave={e => e.currentTarget.style.color = '#B5ADA3'}
            >
                ←
            </button>
            <span
                className="text-[10px] tracking-[0.32em] uppercase font-medium"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C9A96E' }}
            >
                Snitch.
            </span>
        </div>

        <div className="max-w-5xl mx-auto px-8 lg:px-16 mt-8">
            <div className="mb-16">
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 block" style={{ color: '#C9A96E' }}>Client Portal</span>
              <h1 className="text-4xl lg:text-5xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                Account Dossier
              </h1>
              <div className="mt-6 w-12 h-px" style={{ backgroundColor: '#C9A96E' }}></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                
                {/* ── Personal Info Column ── */}
                <div className="col-span-1">
                    <h2 className="text-[11px] uppercase tracking-[0.2em] font-medium mb-8" style={{ color: '#1b1c1a' }}>Identity</h2>
                    
                    <div className="flex flex-col gap-6">
                        <div>
                            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: '#B5ADA3' }}>Full Name</span>
                            <p className="mt-1 text-[14px]" style={{ color: '#1b1c1a' }}>{auth.user?.fullName || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: '#B5ADA3' }}>Contact Email</span>
                            <p className="mt-1 text-[14px]" style={{ color: '#1b1c1a' }}>{auth.user?.email || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: '#B5ADA3' }}>Account Type</span>
                            <p className="mt-1 flex items-center gap-2 text-[14px]" style={{ color: '#1b1c1a' }}>
                                {auth.user?.role === 'seller' ? 'Partner / Seller' : 'Standard Client'}
                                {auth.user?.role === 'seller' && (
                                    <button 
                                        onClick={() => navigate('/seller/dashboard')}
                                        className="text-[10px] px-2 py-1 uppercase tracking-widest bg-[#1b1c1a] text-[#fbf9f6] transition-colors hover:text-[#C9A96E]"
                                    >
                                        Seller Portal
                                    </button>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-[#d0c5b5]">
                        <button
                            onClick={handleLogout}
                            className="text-[11px] uppercase tracking-[0.2em] font-medium transition-colors"
                            style={{ color: '#1b1c1a' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#ba1a1a'}
                            onMouseLeave={e => e.currentTarget.style.color = '#1b1c1a'}
                        >
                            Sign Out [x]
                        </button>
                    </div>
                </div>

                {/* ── Archive / Orders Column ── */}
                <div className="col-span-2 lg:pl-16 lg:border-l border-[#d0c5b5]">
                    <div className="flex justify-between items-end mb-8 border-b border-[#d0c5b5] pb-4">
                        <h2 className="text-[11px] uppercase tracking-[0.2em] font-medium" style={{ color: '#1b1c1a' }}>Order Archive</h2>
                        <span className="text-[10px] text-[#7A6E63] italic font-serif">Past Curations</span>
                    </div>

                    <div className="py-24 flex flex-col items-center justify-center text-center bg-[#f5f3f0]">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3" style={{ color: '#7A6E63' }}>No History</span>
                        <p className="text-[14px] max-w-sm" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                            You have not added any pieces to your archive yet. Discover the collection to begin.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-8 border-b transition-colors pb-1 text-[10px] uppercase tracking-widest font-medium text-[#1b1c1a] hover:text-[#C9A96E] hover:border-[#C9A96E] border-[#1b1c1a]"
                        >
                            Explore Collection
                        </button>
                    </div>

                </div>

            </div>

        </div>
      </div>
    </>
  );
}