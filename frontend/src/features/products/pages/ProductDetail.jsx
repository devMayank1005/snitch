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

const toPlainAttributes = (attributes = {}) => Object.fromEntries(
    Object.entries(attributes).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
);

const normalizeAttributeKey = (key) => String(key || '').trim().toLowerCase();
const SIZE_VALUES = new Set(['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl']);

const labelAttributeKey = (key) => {
    const normalized = String(key || '').trim();
    if (!normalized) return '';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
};

const sanitizeVariantAttributes = (attributes = {}, variationStructure = []) => {
    const plain = toPlainAttributes(attributes);
    const normalized = {};

    Object.entries(plain).forEach(([key, value]) => {
        const normalizedKey = normalizeAttributeKey(key);
        if (!normalizedKey) return;
        normalized[normalizedKey] = String(value).trim();
    });

    const entries = Object.entries(normalized);
    if (entries.length === 1) {
        const [singleKey, singleValue] = entries[0];
        const keyIsSizeValue = SIZE_VALUES.has(singleKey);
        const valueNormalized = normalizeAttributeKey(singleValue);
        const valueIsSizeValue = SIZE_VALUES.has(valueNormalized);

        // Legacy malformed shape: { L: "Blue" } or { Blue: "L" }
        if (keyIsSizeValue && !valueIsSizeValue) {
            return { size: singleKey.toUpperCase(), color: singleValue };
        }
        if (!keyIsSizeValue && valueIsSizeValue) {
            return { color: labelAttributeKey(singleKey), size: valueNormalized.toUpperCase() };
        }
    }

    if (Array.isArray(variationStructure) && variationStructure.length > 0) {
        const structureKeys = variationStructure.map((key) => normalizeAttributeKey(key)).filter(Boolean);
        const ordered = {};

        structureKeys.forEach((key) => {
            if (normalized[key] !== undefined) {
                ordered[key] = normalized[key];
            }
        });

        Object.entries(normalized).forEach(([key, value]) => {
            if (ordered[key] === undefined) {
                ordered[key] = value;
            }
        });

        return ordered;
    }

    return normalized;
};

const normalizeProductVariants = (variants = [], variationStructure = []) => (
    variants.map((variant) => ({
        ...variant,
        attributes: sanitizeVariantAttributes(variant?.attributes || {}, variationStructure),
    }))
);

const getVariantAttributeAxes = (variants = [], variationStructure = []) => {
    const axisOrder = Array.isArray(variationStructure) ? variationStructure.filter(Boolean) : [];
    const axisMap = new Map();

    variants.forEach((variant) => {
        Object.entries(variant?.attributes || {}).forEach(([key, value]) => {
            const normalizedKey = normalizeAttributeKey(key);
            if (!normalizedKey) return;

            if (!axisMap.has(normalizedKey)) {
                axisMap.set(normalizedKey, { label: labelAttributeKey(key), values: [] });
            }

            const currentAxis = axisMap.get(normalizedKey);
            const normalizedValue = String(value);
            if (!currentAxis.values.includes(normalizedValue)) {
                currentAxis.values.push(normalizedValue);
            }
        });
    });

    const orderedKeys = axisOrder.length > 0
        ? axisOrder.map((key) => normalizeAttributeKey(key))
        : Array.from(axisMap.keys());

    return orderedKeys
        .filter((key, index, array) => key && array.indexOf(key) === index)
        .map((key) => ({
            key,
            label: axisMap.get(key)?.label || labelAttributeKey(key),
            values: axisMap.get(key)?.values || [],
        }));
};

const isExactVariantMatch = (variant, selectedAttributes = {}) => {
    const variantAttributes = toPlainAttributes(variant?.attributes || {});
    const selectedNormalized = Object.fromEntries(
        Object.entries(selectedAttributes).map(([key, value]) => [normalizeAttributeKey(key), value])
    );
    const selectedKeys = Object.keys(selectedNormalized).filter((key) => selectedNormalized[key]);

    if (selectedKeys.length === 0) return false;

    const normalizedVariantAttributes = Object.fromEntries(
        Object.entries(variantAttributes).map(([key, value]) => [normalizeAttributeKey(key), value])
    );

    if (Object.keys(normalizedVariantAttributes).length !== selectedKeys.length) return false;

    return selectedKeys.every((key) => String(normalizedVariantAttributes[key]) === String(selectedNormalized[key]));
};

/**
 * Get available attribute values for an axis based on currently selected attributes
 * Only returns values that exist in variants matching the current selection
 * Considers stock availability (must have stock > 0)
 */
const getAvailableAttributeValues = (variants = [], axisKey, selectedAttributes = {}) => {
    const availableValues = new Set();

    variants.forEach((variant) => {
        // Skip variants with no stock
        if (!variant.stock || variant.stock <= 0) return;
        
        const variantAttributes = toPlainAttributes(variant?.attributes || {});
        const normalizedVariantAttrs = Object.fromEntries(
            Object.entries(variantAttributes).map(([key, value]) => [normalizeAttributeKey(key), value])
        );

        // Check if this variant matches all currently selected attributes
        const matchesSelection = Object.entries(selectedAttributes)
            .filter(([, value]) => value) // Only check attributes that have been selected
            .every(([key, selectedValue]) => {
                const normalizedKey = normalizeAttributeKey(key);
                return String(normalizedVariantAttrs[normalizedKey]) === String(selectedValue);
            });

        if (matchesSelection) {
            const normalizedAxisKey = normalizeAttributeKey(axisKey);
            const value = normalizedVariantAttrs[normalizedAxisKey];
            if (value) {
                availableValues.add(value);
            }
        }
    });

    return availableValues;
};

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
    const [errorMessage, setErrorMessage] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    
    // Variant Tracking
    const [activeImage, setActiveImage] = useState(0);
    const [selectedVariantId, setSelectedVariantId] = useState(null);
    const [activeVariant, setActiveVariant] = useState(null);
    const [selectedAttributes, setSelectedAttributes] = useState({});

    // Dynamic Display State
    const [displayPrice, setDisplayPrice] = useState(null);
    const [displayImages, setDisplayImages] = useState([]);

    const normalizedVariants = normalizeProductVariants(product?.variants || [], product?.variationStructure || []);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setErrorMessage('');
            try {
                const data = await handleGetProductById(productId);
                const prod = data?.product || data;
                setProduct(prod);
                
                // Initialize Base UI State
                setDisplayPrice(prod.price);
                setDisplayImages(prod.images || []);
                setSelectedVariantId(null);
                setActiveVariant(null);
                setSelectedAttributes({});
                setActiveImage(0);

            } catch (error) {
                console.error("Failed to fetch product", error);
                setProduct(null);

                if (error?.response?.status === 502) {
                    setErrorMessage('Product service is temporarily unavailable. Please try again in a moment.');
                } else if (error?.response?.status === 404) {
                    setErrorMessage('This product was not found.');
                } else {
                    setErrorMessage(error?.response?.data?.message || 'Failed to fetch product. Please retry.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId, reloadKey]);

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
        setSelectedAttributes(
            Object.fromEntries(
                Object.entries(variant?.attributes || {}).map(([key, value]) => [normalizeAttributeKey(key), String(value)])
            )
        );
        setActiveImage(0); // reset viewer

        if (variant.price?.amount) setDisplayPrice(variant.price);
        else setDisplayPrice(product.price);

        if (variant.images?.length > 0) setDisplayImages(variant.images);
        else setDisplayImages(product.images);
    };

    const handleSelectAttributeValue = (axisKey, value) => {
        const normalizedAxisKey = normalizeAttributeKey(axisKey);
        const nextAttributes = { ...selectedAttributes, [normalizedAxisKey]: value };
        setSelectedAttributes(nextAttributes);

        const matchedVariant = normalizedVariants.find((variant) => isExactVariantMatch(variant, nextAttributes));

        if (matchedVariant) {
            handleSelectVariant(matchedVariant);
            return;
        }

        setSelectedVariantId(null);
        setActiveVariant(null);
        setActiveImage(0);
        setDisplayPrice(product.price);
        setDisplayImages(product.images || []);
    };

    const handleSelectBaseProduct = () => {
        setSelectedVariantId(null);
        setActiveVariant(null);
        setSelectedAttributes({});
        setActiveImage(0);
        setDisplayPrice(product.price);
        setDisplayImages(product.images || []);
    };

    const addToCart = async ({ redirectToCart = true } = {}) => {
        if (!auth?.isAuthenticated) {
            navigate('/login');
            return false;
        }

        try {
            await handleAddToCart({ 
                productId: product._id,
                variantId: selectedVariantId || null,
                quantity: 1,
            });
            if (redirectToCart) {
                navigate('/cart');
            }
            return true;
        } catch (error) {
            console.error('❌ Add to cart error:', error);
            alert("Failed to add to cart.");
            return false;
        }
    };

    const buyNow = async () => {
        if (!auth?.isAuthenticated) {
            navigate('/login');
            return;
        }
        const success = await addToCart({ redirectToCart: false });
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
                <h2 className="text-2xl" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                    {errorMessage || 'Piece not found.'}
                </h2>
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => setReloadKey((prev) => prev + 1)}
                        className="text-[#1b1c1a] uppercase tracking-[0.2em] text-xs underline underline-offset-4"
                    >
                        Retry
                    </button>
                    <button onClick={() => navigate('/')} className="text-[#C9A96E] uppercase tracking-[0.2em] text-xs underline underline-offset-4">Return Home</button>
                </div>
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
                            {normalizedVariants.length > 0 && (
                                <div className="mb-10">
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium block mb-4" style={{ color: '#B5ADA3' }}>Select Variation</span>
                                    <div className="flex flex-wrap gap-3 mb-5">
                                        <button
                                            onClick={handleSelectBaseProduct}
                                            className={`px-6 py-3 border transition-colors ${
                                                selectedVariantId === null
                                                    ? 'border-[#1b1c1a] bg-[#1b1c1a] text-[#fbf9f6]'
                                                    : 'border-[#d0c5b5] text-[#1b1c1a] hover:border-[#1b1c1a]'
                                            }`}
                                        >
                                            <span className="text-[10px] uppercase tracking-widest block">Original</span>
                                        </button>
                                    </div>

                                    {getVariantAttributeAxes(normalizedVariants, product.variationStructure || []).map((axis) => {
                                        const availableValues = getAvailableAttributeValues(normalizedVariants, axis.key, selectedAttributes);
                                        return (
                                            <div key={axis.key} className="mb-5">
                                                <span className="text-[10px] uppercase tracking-[0.2em] font-medium block mb-3" style={{ color: '#B5ADA3' }}>
                                                    {axis.label}
                                                </span>
                                                <div className="flex flex-wrap gap-3">
                                                    {axis.values.map((value) => {
                                                        const isSelected = String(selectedAttributes[axis.key] || '') === String(value);
                                                        const isAvailable = availableValues.has(value);
                                                        const isDisabled = !isAvailable;

                                                        return (
                                                            <button
                                                                key={`${axis.key}:${value}`}
                                                                onClick={() => !isDisabled && handleSelectAttributeValue(axis.key, value)}
                                                                disabled={isDisabled}
                                                                className={`px-6 py-3 border transition-colors ${
                                                                    isDisabled
                                                                        ? 'opacity-40 cursor-not-allowed border-[#d0c5b5] text-[#b5b5b5]'
                                                                        : isSelected
                                                                        ? 'border-[#1b1c1a] bg-[#1b1c1a] text-[#fbf9f6]'
                                                                        : 'border-[#d0c5b5] text-[#1b1c1a] hover:border-[#1b1c1a]'
                                                                }`}
                                                            >
                                                                <span className="text-[10px] uppercase tracking-widest block">{value}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
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