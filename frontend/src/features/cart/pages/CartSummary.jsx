import React from 'react';
import { useSelector } from 'react-redux';
import { selectCartSubtotal, selectCartAlerts, selectCartCurrency } from '../state/cart.slice';

const CartSummary = React.memo(() => {
    // 1. Hook directly into stable selectors
    const subtotal = useSelector(selectCartSubtotal);
    const currency = useSelector(selectCartCurrency);
    const { hasUnavailable, canCheckout } = useSelector(selectCartAlerts);

    const handleCheckout = () => {
        if (!canCheckout) return;
        // Proceed to Checkout System natively...
        alert("Redirecting to secured Checkout Environment.");
    };

    return (
        <div className="bg-[#FBF9F6] p-8 border border-[#E8E1DA] sticky top-24">
           <h3 className="text-2xl font-medium mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1B1C1A' }}>
               Summary
           </h3>

           <div className="space-y-4 mb-8">
               <div className="flex justify-between text-sm tracking-wide" style={{ color: '#7A6E63' }}>
                   <span>Subtotal</span>
                   <span style={{ color: '#1B1C1A' }}>{currency} {subtotal.toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-sm tracking-wide" style={{ color: '#7A6E63' }}>
                   <span>Shipping</span>
                   <span>Calculated at checkout</span>
               </div>
               <div className="flex justify-between text-sm tracking-wide" style={{ color: '#7A6E63' }}>
                   <span>Taxes</span>
                   <span>Calculated at checkout</span>
               </div>
           </div>

           <div className="pt-6 border-t border-[#E8E1DA] mb-8">
               <div className="flex justify-between items-center">
                   <span className="text-sm uppercase tracking-widest font-bold" style={{ color: '#1B1C1A' }}>Total</span>
                   <span className="text-xl font-medium" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1B1C1A' }}>
                       {currency} {subtotal.toLocaleString()}
                   </span>
               </div>
           </div>

           <button
               onClick={handleCheckout}
               disabled={!canCheckout}
               className="w-full py-4 text-[11px] uppercase tracking-[0.3em] font-bold transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
               style={{
                   backgroundColor: canCheckout ? '#1B1C1A' : '#7A6E63',
                   color: '#FBF9F6',
               }}
               onMouseEnter={e => {
                   if(canCheckout) {
                       e.currentTarget.style.backgroundColor = '#C9A96E';
                       e.currentTarget.style.color = '#1B1C1A';
                   }
               }}
               onMouseLeave={e => {
                   if(canCheckout) {
                       e.currentTarget.style.backgroundColor = '#1B1C1A';
                       e.currentTarget.style.color = '#FBF9F6';
                   }
               }}
           >
               {hasUnavailable ? 'Resolve Cart Errors' : 'Secure Checkout'}
           </button>

           <p className="mt-4 text-center text-[10px] uppercase tracking-wider" style={{ color: '#B5ADA3' }}>
               Taxes and shipping calculated definitively during checkout progression.
           </p>
        </div>
    );
});

export default CartSummary;
