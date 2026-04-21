import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useProduct } from '../hooks/useProduct';

const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { handleGetProductById } = useProduct();
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const data = await handleGetProductById(productId);
                setProduct(data?.product || data);
            } catch (error) {
                console.error("Failed to fetch product", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

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

    const images = product.images || [];
    const mainImageUrl = images.length > 0 ? images[activeImage].url : '/snitch_editorial_warm.png';

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
                        <div className="w-full lg:w-1/2 flex flex-col gap-4">
                            <div className="aspect-[4/5] overflow-hidden bg-[#f5f3f0]">
                                <img
                                    src={mainImageUrl}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            
                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    {images.map((img, idx) => (
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
                            
                            <h1 className="text-4xl lg:text-6xl font-light leading-tight mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                                {product.title}
                            </h1>
                            
                            <div className="text-xl tracking-wide font-light mb-10" style={{ color: '#1b1c1a' }}>
                                {product.price?.currency} {product.price?.amount?.toLocaleString()}
                            </div>

                            <div className="w-12 h-px mb-10" style={{ backgroundColor: '#C9A96E' }} />

                            <div className="mb-12">
                                <span className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: '#B5ADA3' }}>Details</span>
                                <p className="mt-4 text-[13px] leading-relaxed max-w-md" style={{ color: '#7A6E63' }}>
                                    {product.description}
                                </p>
                            </div>

                            {/* Options / Add To Cart */}
                            <div className="mt-auto">
                                <button
                                    className="w-full py-5 text-[11px] uppercase tracking-[0.3em] font-medium transition-all duration-300"
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
                                    Add to Cart
                                </button>
                                <p className="text-center mt-6 text-[10px] uppercase tracking-[0.1em]" style={{ color: '#B5ADA3' }}>
                                    Complimentary shipping & returns
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