import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { useCart } from '../hook/useCart';
import { selectGroupedCartItems, selectCartAlerts } from '../state/cart.slice';
import CartItemRow from './CartItemRow';
import CartSummary from './CartSummary';

const CartPage = () => {
    const navigate = useNavigate();
    const { handleGetCart } = useCart();
    
    // Strict derived selectors
    const groupedItems = useSelector(selectGroupedCartItems);
    const { hasPriceDrift, hasUnavailable } = useSelector(selectCartAlerts);
    const isLoading = useSelector(state => state.cart.loading);
    const isInitialized = useSelector(state => state.cart.isInitialized);

    useEffect(() => {
        handleGetCart();
    }, []);

    // 1. LOADING PRIORITY
    if (isLoading && !isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FBF9F6]">
                <span className="text-[10px] uppercase tracking-widest font-medium" style={{ color: '#B5ADA3' }}>Syncing Vault...</span>
            </div>
        );
    }

    // 2. EMPTY PRIORITY
    if (groupedItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF9F6] px-6">
                <span className="text-[10px] uppercase tracking-[0.2em] font-medium mb-4" style={{ color: '#C9A96E' }}>Empty Cart</span>
                <h1 className="text-4xl font-light mb-8 text-center" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1B1C1A' }}>
                    Your Selection is Empty
                </h1>
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-3 text-[11px] uppercase tracking-[0.2em] font-medium transition-colors border border-[#1B1C1A]"
                    style={{ color: '#1B1C1A' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1B1C1A'; e.currentTarget.style.color = '#FBF9F6'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#FBF9F6'; e.currentTarget.style.color = '#1B1C1A'; }}
                >
                    Continue Exploring
                </button>
            </div>
        );
    }

    // 3. CONTENT RENDER
    return (
        <div className="min-h-screen bg-[#FBF9F6]">
            {/* Global Context Banners */}
            {hasUnavailable && (
                <div className="w-full bg-red-950 text-red-50 text-center py-3 text-[11px] tracking-wider font-bold shadow-md relative z-10">
                    <span className="uppercase">Notice: </span> One or more items in your cart is no longer available. Please remove them to proceed.
                </div>
            )}
            
            {hasPriceDrift && !hasUnavailable && (
                <div className="w-full bg-[#1B1C1A] text-[#C9A96E] text-center py-3 text-[11px] tracking-wider font-medium shadow-md relative z-10">
                    <span className="uppercase font-bold text-[#FBF9F6]">Update: </span> Prices naturally fluctuate. Please review the updated prices highlighted below.
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 lg:px-16 xl:px-24 py-16">
                <h1 className="text-4xl lg:text-5xl font-light mb-12" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1B1C1A' }}>
                    Your Selection
                </h1>

                <div className="flex flex-col lg:flex-row gap-16">
                    {/* LEFT COLUMN: Groups */}
                    <div className="flex-grow flex flex-col gap-12">
                        {groupedItems.map((group) => (
                            <div key={group.groupId} className="flex flex-col">
                                {/* Group Sticky Map */}
                                <div className="pb-4 border-b-2 border-[#1B1C1A] mb-4">
                                    <h2 className="text-xl font-medium tracking-wide uppercase" style={{ color: '#1B1C1A' }}>
                                        {group.baseTitle}
                                    </h2>
                                </div>
                                
                                {/* Natively Indexed Rows */}
                                <div className="flex flex-col">
                                    {group.items.map((item) => (
                                        <CartItemRow key={item.product} item={item} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* RIGHT COLUMN: Summary */}
                    <div className="w-full lg:w-[400px] flex-shrink-0">
                        <CartSummary />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
