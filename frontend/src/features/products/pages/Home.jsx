import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useProduct } from '../hooks/useProduct';
import { useNavigate } from 'react-router';
import { useAuth } from '../../auth/hook/useAuth';
import { useCart } from '../../cart/hook/useCart';

const HeartIcon = ({ filled }) => (
    <svg className={`w-5 h-5 ${filled ? 'fill-[#C9A96E] text-[#C9A96E]' : 'fill-transparent text-[#7A6E63] group-hover/btn:text-[#C9A96E]'} transition-colors duration-300`} stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
);

const Home = () => {
    const products = useSelector(state => state.product.products);
    const wishlist = useSelector(state => state.cart?.wishlist || []);
    const { auth } = useAuth();
    const { handleGetAllProducts } = useProduct();
    const { handleToggleWishlist } = useCart();
    
    const [activeCategory, setActiveCategory] = useState('All');
    const categories = ['All', 'Archive', 'Tops', 'Bottoms', 'Outerwear', 'Accessories'];

    const navigate = useNavigate();

    // Fetch initial cart/wishlist state if authenticated
    useEffect(() => {
        handleGetAllProducts(activeCategory !== 'All' ? { category: activeCategory } : {});
    }, [activeCategory]);

    const onWishlistToggle = async (e, productId) => {
        e.stopPropagation(); // prevent card click
        if (!auth?.isAuthenticated) {
            navigate('/login');
            return;
        }
        await handleToggleWishlist({ productId });
    };

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
                rel="stylesheet"
            />

            <div
                className="min-h-screen selection:bg-[#C9A96E]/30"
                style={{ backgroundColor: '#fbf9f6', fontFamily: "'Inter', sans-serif" }}
            >
                <div className="max-w-7xl mx-auto px-8 lg:px-16 xl:px-24">
                    
                    {/* ── Hero / Header ── */}
                    <div className="pt-20 pb-16 text-center flex flex-col items-center">
                        <span className="text-[10px] uppercase tracking-[0.24em] font-medium mb-6" style={{ color: '#C9A96E' }}>
                            The Collection
                        </span>
                        <h1
                            className="text-5xl lg:text-7xl font-light leading-tight mb-6"
                            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}
                        >
                            Curated Archive
                        </h1>
                        <p className="max-w-xl mx-auto text-sm leading-relaxed" style={{ color: '#7A6E63' }}>
                            Discover our latest curation of premium minimalist pieces, meticulously designed for effortless elegance and enduring quality.
                        </p>
                    </div>

                    {/* ── Filters ── */}
                    <div className="flex justify-center gap-6 mb-16 flex-wrap">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className="text-[10px] uppercase tracking-widest font-medium transition-all duration-300 pb-1 border-b"
                                style={{ 
                                    color: activeCategory === cat ? '#1b1c1a' : '#7A6E63',
                                    borderColor: activeCategory === cat ? '#1b1c1a' : 'transparent' 
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* ── Product Grid ── */}
                    {products && products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16 pb-32">
                            {products.map(product => {
                                const imageUrl = product.images && product.images.length > 0
                                    ? product.images[ 0 ].url
                                    : '/snitch_editorial_warm.png';

                                const isWishlisted = wishlist.includes(product._id) || wishlist.some(w => w._id === product._id);

                                return (
                                    <div
                                        onClick={() => navigate(`/product/${product._id}`)}
                                        key={product._id} className="group cursor-pointer flex flex-col relative">
                                        
                                        {/* Wishlist Button Overlay */}
                                        <button 
                                            onClick={(e) => onWishlistToggle(e, product._id)}
                                            className="absolute top-3 right-3 z-10 p-2 bg-white/40 backdrop-blur-sm rounded-full group/btn hover:bg-white transition-colors"
                                            aria-label="Toggle Wishlist"
                                        >
                                            <HeartIcon filled={isWishlisted} />
                                        </button>

                                        {/* Image Container */}
                                        <div className="aspect-[4/5] overflow-hidden mb-6" style={{ backgroundColor: '#f5f3f0' }}>
                                            <img
                                                src={imageUrl}
                                                alt={product.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex flex-col gap-2">
                                            <h3
                                                className="text-xl leading-snug transition-colors duration-300 group-hover:text-[#C9A96E]"
                                                style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}
                                            >
                                                {product.title}
                                            </h3>

                                            <div className="flex justify-between items-center mt-2">
                                                <span
                                                    className="text-[10px] uppercase tracking-[0.2em] font-medium"
                                                    style={{ color: '#1b1c1a' }}
                                                >
                                                    {product.price?.currency} {product.price?.amount?.toLocaleString()}
                                                </span>
                                                {product.category && (
                                                    <span className="text-[9px] uppercase tracking-wider text-[#B5ADA3]">{product.category}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-24 text-center flex flex-col items-center">
                            <h2 className="text-2xl mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}>
                                No pieces available.
                            </h2>
                            <p className="max-w-md mx-auto text-sm leading-relaxed" style={{ color: '#7A6E63' }}>
                                We could not find any {activeCategory !== 'All' ? activeCategory : ''} pieces in the current curation.
                            </p>
                        </div>
                    )}
                </div>

                <footer className="border-t py-12 text-center" style={{ borderColor: '#e4e2df' }}>
                    <span
                        className="text-[10px] uppercase tracking-[0.35em]"
                        style={{ fontFamily: "'Cormorant Garamond', serif", color: '#C9A96E' }}
                    >
                        Snitch. © {new Date().getFullYear()}
                    </span>
                </footer>
            </div>
        </>
    );
};

export default Home;