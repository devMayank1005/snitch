import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useProduct } from '../hooks/useProduct';
import { useAuth } from '../../auth/hook/useAuth';
import { useCart } from '../../cart/hook/useCart';

const HeartIcon = ({ filled }) => (
    <svg className={`w-5 h-5 ${filled ? 'fill-[#C9A96E] text-[#C9A96E]' : 'fill-transparent text-[#1b1c1a] hover:fill-[#1b1c1a]'} transition-colors duration-300`} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
);

const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    
    const { auth } = useAuth();
    const { handleGetProductById } = useProduct();
    const { handleAddToCart, handleToggleWishlist } = useCart();
    
    // Extracted pieces from Redux store for wishlist/cart tracking is possible here if utilizing `useSelector`. 
    // We will just do functional triggers for simplicity.
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Variant Tracking
    const [activeImage, setActiveImage] = useState(0);
    const [selectedVariantId, setSelectedVariantId] = useState(null);
    const [activeVariant, setActiveVariant] = useState(null);

    // Dynamic Display State
    const [displayPrice, setDisplayPrice] = useState(null);
    const [displayImages, setDisplayImages] = useState([]);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const data = await handleGetProductById(productId);
                const prod = data?.product || data;
                setProduct(prod);
                
                // Initialize Base UI State
                setDisplayPrice(prod.price);
                setDisplayImages(prod.images || []);
                
                // Select first variant if exists
                if (prod.variants && prod.variants.length > 0) {
                    const defaultVariant = prod.variants[0];
                    setSelectedVariantId(defaultVariant._id);
                    setActiveVariant(defaultVariant);
                    
                    if (defaultVariant.price?.amount) setDisplayPrice(defaultVariant.price);
                    if (defaultVariant.images?.length > 0) setDisplayImages(defaultVariant.images);
                }

            } catch (error) {
                console.error("Failed to fetch product", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (displayImages.length <= 1) return;
            if (e.key === "ArrowRight") {
                setActiveImage((prev) => (prev + 1) % displayImages.length);
            } else if (e.key === "ArrowLeft") {
                setActiveImage((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [displayImages.length]);

    const handleSelectVariant = (variant) => {
        setSelectedVariantId(variant._id);
        setActiveVariant(variant);
        setActiveImage(0); // reset viewer

        if (variant.price?.amount) setDisplayPrice(variant.price);
        else setDisplayPrice(product.price);

        if (variant.images?.length > 0) setDisplayImages(variant.images);
        else setDisplayImages(product.images);
    };

    const addToCart = async () => {
        if (!auth?.isAuthenticated) {
            navigate('/login');
            return false;
        }

        try {
            await handleAddToCart({ 
                productId: selectedVariantId || product._id, 
                quantity: 1 
            });
            alert("Added to Cart successfully.");
            return true;
        } catch (error) {
            alert("Failed to add to cart.");
            return false;
        }
    };

    const buyNow = async () => {
        if (!auth?.isAuthenticated) {
            navigate('/login');
            return;
        }
        const success = await addToCart();
        if (success) {
            alert("Redirecting to checkout...");
            // navigate('/checkout');
        }
    };

    const toggleWishlist = async () => {
        if (!auth?.isAuthenticated) {
            navigate('/login');
            return;
        }
        await handleToggleWishlist({ productId: product._id });
        alert("Wishlist updated.");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-[10px] uppercase tracking-[0.2em] font-medium" style={{ backgroundColor: '#fbf9f6', color: '#C9A96E' }}>
                Loading...
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: '#fbf9f6' }}>
                <h2 className="text-2xl" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>Piece not found.</h2>
                <button onClick={() => navigate('/')} className="text-[#C9A96E] uppercase tracking-[0.2em] text-xs underline underline-offset-4">Return Home</button>
            </div>
        );
    }

    const mainImageUrl = displayImages.length > 0 ? displayImages[activeImage].url : '/snitch_editorial_warm.png';

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
                rel="stylesheet"
            />
            <div className="min-h-screen selection:bg-[#C9A96E]/30 pb-24" style={{ backgroundColor: '#fbf9f6', fontFamily: "'Inter', sans-serif" }}>
                
                {/* ── Top Bar ── */}
                <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24 pt-10 pb-12 flex items-center gap-5">
                    <button
                          onClick={() => navigate(-1)}
                        className="text-lg transition-colors duration-200 leading-none"
                        style={{ color: '#B5ADA3' }}
                        aria-label="Go back"
                        onMouseEnter={e => e.currentTarget.style.color = '#C9A96E'}
                        onMouseLeave={e => e.currentTarget.style.color = '#B5ADA3'}
                    >
                        ←
                    </button>
                    <span className="text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: '#7A6E63' }}>
                        {product.category || 'Archive'}
                    </span>
                </div>

                <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24">
                    <div className="flex flex-col lg:flex-row gap-16 xl:gap-24">
                        
                        {/* ── Image Gallery (Left) ── */}
                        <div className="w-full lg:w-1/2 flex flex-col gap-4 relative">
                            {/* Generic Wishlist Absolute Button */}
                            <button 
                                onClick={toggleWishlist}
                                className="absolute top-6 right-6 z-10 p-3 bg-white/40 backdrop-blur-[2px] rounded-full hover:bg-white transition-all duration-300"
                            >
                                <HeartIcon filled={false} />
                            </button>

                            <div className="aspect-[4/5] overflow-hidden bg-[#f5f3f0] relative group/gallery">
                                <img
                                    src={mainImageUrl}
                                    alt={product.title}
                                    className="w-full h-full object-cover transition-opacity duration-300"
                                />
                                
                                {/* Overlay Navigation */}
                                {displayImages.length > 1 && (
                                    <>
                                        <button 
                                            onClick={() => setActiveImage((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))}
                                            className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white backdrop-blur-sm p-3 rounded-full opacity-0 group-hover/gallery:opacity-100 transition-all duration-300 z-10"
                                            aria-label="Previous Image"
                                        >
                                            <svg className="w-5 h-5 text-[#1b1c1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button 
                                            onClick={() => setActiveImage((prev) => (prev + 1) % displayImages.length)}
                                            className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white backdrop-blur-sm p-3 rounded-full opacity-0 group-hover/gallery:opacity-100 transition-all duration-300 z-10"
                                            aria-label="Next Image"
                                        >
                                            <svg className="w-5 h-5 text-[#1b1c1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div>
                            
                            {/* Thumbnails */}
                            {displayImages.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    {displayImages.map((img, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`w-20 aspect-[4/5] overflow-hidden shrink-0 transition-all duration-300 ${activeImage === idx ? 'ring-1 ring-offset-4 ring-offset-[#fbf9f6]' : 'opacity-60 hover:opacity-100'}`}
                                            style={{ '--tw-ring-color': '#C9A96E' }}
                                        >
                                            <img src={img.url} className="w-full h-full object-cover" alt={`View ${idx + 1}`} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── Product Info (Right) ── */}
                        <div className="w-full lg:w-1/2 flex flex-col justify-center py-8">
                            
                            <h1 className="text-4xl lg:text-6xl font-light leading-tight mb-6 uppercase" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                                {product.title}
                            </h1>
                            
                            <div className="text-xl tracking-wide font-light mb-10" style={{ color: '#1b1c1a' }}>
                                {displayPrice?.amount ? `${displayPrice.currency} ${displayPrice.amount.toLocaleString()}` : 'Price not provided'}
                            </div>

                            <div className="w-12 h-px mb-10" style={{ backgroundColor: '#C9A96E' }} />

                            <div className="mb-12">
                                <span className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: '#B5ADA3' }}>Details</span>
                                <p className="mt-4 text-[13px] leading-relaxed max-w-md" style={{ color: '#7A6E63' }}>
                                    {product.description}
                                </p>
                            </div>

                            {/* Options / Variants Selector */}
                            {product.variants && product.variants.length > 0 && (
                                <div className="mb-10">
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium block mb-4" style={{ color: '#B5ADA3' }}>Select Variation</span>
                                    <div className="flex flex-wrap gap-3">
                                        {product.variants.map((v) => {
                                            const isSelected = selectedVariantId === v._id;
                                            
                                            // Make human readable tag from attributes
                                            let tag = "Variant";
                                            if (v.attributes && Object.keys(v.attributes).length > 0) {
                                                tag = Object.values(v.attributes).join(' | ');
                                            }

                                            const outOfStock = v.stock === 0;

                                            return (
                                                <button
                                                    key={v._id}
                                                    onClick={() => !outOfStock && handleSelectVariant(v)}
                                                    disabled={outOfStock}
                                                    className={`px-6 py-3 border transition-colors ${
                                                        outOfStock 
                                                         ? 'opacity-30 cursor-not-allowed border-[#d0c5b5] text-[#b0a79a]' 
                                                         : isSelected 
                                                            ? 'border-[#1b1c1a] bg-[#1b1c1a] text-[#fbf9f6]'
                                                            : 'border-[#d0c5b5] text-[#1b1c1a] hover:border-[#1b1c1a]'
                                                    }`}
                                                >
                                                    <span className="text-[10px] uppercase tracking-widest block">{tag}</span>
                                                    {outOfStock && <span className="text-[8px] block mt-1">Sold Out</span>}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="mt-auto flex flex-col gap-4">
                                <div className="flex gap-4">
                                    <button
                                        onClick={addToCart}
                                        className="flex-1 py-5 text-[11px] uppercase tracking-[0.3em] font-medium border transition-all duration-300"
                                        style={{
                                            borderColor: '#1b1c1a',
                                            color: '#1b1c1a',
                                            backgroundColor: 'transparent'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.backgroundColor = '#1b1c1a';
                                            e.currentTarget.style.color = '#fbf9f6';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#1b1c1a';
                                        }}
                                    >
                                        Add to Cart
                                    </button>

                                    <button
                                        onClick={buyNow}
                                        className="flex-1 py-5 text-[11px] uppercase tracking-[0.3em] font-medium transition-all duration-300"
                                        style={{
                                            backgroundColor: '#1b1c1a',
                                            color: '#fbf9f6',
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.backgroundColor = '#C9A96E';
                                            e.currentTarget.style.color = '#1b1c1a';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.backgroundColor = '#1b1c1a';
                                            e.currentTarget.style.color = '#fbf9f6';
                                        }}
                                    >
                                        Buy Now
                                    </button>
                                </div>
                                <p className="text-center mt-4 text-[10px] uppercase tracking-[0.1em]" style={{ color: '#B5ADA3' }}>
                                    Complimentary shipping & returns on all curated pieces
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductDetail;