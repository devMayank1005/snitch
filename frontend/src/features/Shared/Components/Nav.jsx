import React from 'react';
import { Link, useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../auth/state/auth.slice';
import { logoutUser } from '../../auth/service/auth.api';

const Nav = () => {
    const { isAuthenticated, user } = useSelector((state) => state.auth) || {};
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logoutUser();
            dispatch(logout());
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <nav style={{ backgroundColor: '#fbf9f6', borderBottom: '1px solid #d0c5b5', padding: '1rem 2rem', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C9A96E', fontSize: '1.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>
                        Snitch.
                    </span>
                </Link>

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <Link to="/" style={{ textDecoration: 'none', color: '#1b1c1a', fontSize: '0.9rem' }}>Home</Link>
                    
                    {isAuthenticated ? (
                        <>
                            {user?.role === 'seller' && (
                                <Link to="/seller/dashboard" style={{ textDecoration: 'none', color: '#1b1c1a', fontSize: '0.9rem' }}>Dashboard</Link>
                            )}
                            <button 
                                onClick={handleLogout}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A6E63', fontSize: '0.9rem' }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{ textDecoration: 'none', color: '#1b1c1a', fontSize: '0.9rem' }}>Login</Link>
                            <Link to="/register" style={{ textDecoration: 'none', color: '#C9A96E', fontSize: '0.9rem', fontWeight: 500 }}>Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Nav;
