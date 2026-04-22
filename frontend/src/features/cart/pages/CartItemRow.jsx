import React from 'react';
import { useDispatch } from 'react-redux';
import { useCart } from '../hook/useCart';
import { Link } from 'react-router'; // Wait, standard is react-router-dom in v6 usually, we rely on existing

const CartItemRow = React.memo(({ item }) => {
    const { handleUpdateQuantity, handleRemoveFromCart } = useCart();
    
    // Strict isolation to Snapshots
    const title = item.titleSnapshot || 'archived product';
    const amount = item.priceSnapshot?.amount || 0;
    const currency = item.priceSnapshot?.currency || 'USD';
    const image = item.imageSnapshot || '/snitch_editorial_warm.png';
    const attributes = item.attributesSnapshot || {};
    
    const isUnavailable = item.isUnavailable;
    const priceDrift = item.priceDrift;

    const onIncrement = () => {
        if (isUnavailable || item.quantity >= (item.stockSnapshot || 10)) return; // Guard clause
        handleUpdateQuantity({ productId: item.product, newQuantity: item.quantity + 1, previousQuantity: item.quantity });
    };

    const onDecrement = () => {
        if (isUnavailable) return;
        if (item.quantity === 1) {
            handleRemoveFromCart({ productId: item.product });
        } else {
            handleUpdateQuantity({ productId: item.product, newQuantity: item.quantity - 1, previousQuantity: item.quantity });
        }
    };

    const onRemove = () => {
        handleRemoveFromCart({ productId: item.product });
    };

    return (
        <div className={`py-6 flex flex-col sm:flex-row gap-6 border-b border-[#E8E1DA] transition-opacity duration-300 ${isUnavailable ? 'opacity-40 grayscale pointer-events-none relative' : ''}`}>
           {/* IMAGE */}
           <div className="w-24 h-32 flex-shrink-0 bg-[#f5f3f0] overflow-hidden">
               <img src={image} alt={title} className="w-full h-full object-cover" />
           </div>

           {/* DETAILS */}
           <div className="flex-grow flex flex-col justify-between">
               <div>
                   <div className="flex items-start justify-between">
                       <h4 className="text-lg font-medium" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1B1C1A' }}>
                          {title}
                       </h4>
                       <span className="text-sm tracking-widest font-medium" style={{ color: '#1B1C1A' }}>
                          {currency} {amount.toLocaleString()}
                       </span>
                   </div>

                   {/* ATTRIBUTES MAP */}
                   <div className="mt-1 flex flex-wrap gap-2">
                       {Object.entries(attributes).map(([key, val]) => (
                           <span key={key} className="text-[10px] uppercase font-bold tracking-wider" style={{ color: '#7A6E63' }}>
                               {val} {key !== 'default' && `(${key})`}
                           </span>
                       ))}
                   </div>
                   
                   {/* DRIFT BANNERS */}
                   {priceDrift && !isUnavailable && (
                       <div className="mt-2 inline-block px-2 py-1 bg-amber-50 rounded shadow-sm text-amber-800 text-[10px] tracking-wide font-medium">
                           ⚠️ Price updated to {currency} {priceDrift.new}.
                       </div>
                   )}
                   {isUnavailable && (
                       <div className="mt-2 inline-block px-2 py-1 bg-red-50 text-red-700 text-[10px] tracking-wide font-bold">
                           ❌ Item no longer available.
                       </div>
                   )}
               </div>

               {/* CONTROLS */}
               <div className={`mt-4 flex items-center justify-between ${isUnavailable ? 'pointer-events-auto' : ''}`}>
                   <div className="flex items-center border border-[#B5ADA3]">
                       <button onClick={onDecrement} className="px-3 py-1 text-lg hover:bg-[#FBF9F6] transition-colors" style={{ color: '#1B1C1A' }} disabled={isUnavailable}>
                          {item.quantity === 1 ? '✕' : '−'}
                       </button>
                       <span className="px-4 py-1 text-sm font-medium" style={{ color: '#1B1C1A' }}>
                          {item.quantity}
                       </span>
                       <button onClick={onIncrement} className="px-3 py-1 text-lg hover:bg-[#FBF9F6] transition-colors disabled:opacity-30" style={{ color: '#1B1C1A' }} disabled={isUnavailable || item.quantity >= (item.stockSnapshot || 10)}>
                           +
                       </button>
                   </div>
                   
                   <button onClick={onRemove} className="text-[10px] uppercase tracking-widest underline decoration-[#B5ADA3] hover:text-[#C9A96E] transition-colors" style={{ color: '#7A6E63' }}>
                       Remove
                   </button>
               </div>
           </div>
        </div>
    );
});

export default CartItemRow;
