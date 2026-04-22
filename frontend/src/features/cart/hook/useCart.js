import { useDispatch } from "react-redux";
import { setCart, setWishlist, setCartLoading, updateCartItemOptimistic, removeCartItemOptimistic } from "../state/cart.slice";
import { fetchCart, fetchWishlist, addToCartAPI, removeFromCartAPI, toggleWishlistAPI } from "../service/cart.api";

export const useCart = () => {
    const dispatch = useDispatch();

    async function handleGetCart() {
        dispatch(setCartLoading(true));
        try {
            const data = await fetchCart();
            console.log('📥 Cart fetched from API:', data.cart.map(item => ({ 
                product: item.product, 
                quantity: item.quantity,
                title: item.titleSnapshot,
                stock: item.stockSnapshot
            })));
            dispatch(setCart(data.cart));
            return data.cart;
        } catch (error) {
            console.error("Cart fetch error:", error);
        } finally {
            dispatch(setCartLoading(false));
        }
    }

    async function handleGetWishlist() {
        dispatch(setCartLoading(true));
        try {
            const data = await fetchWishlist();
            dispatch(setWishlist(data.wishlist));
            return data.wishlist;
        } catch (error) {
            console.error("Wishlist fetch error:", error);
        } finally {
            dispatch(setCartLoading(false));
        }
    }

    async function handleAddToCart({ productId, quantity = 1 }) {
        // Defensive: ensure quantity is always a number and never undefined/null
        const safeQuantity = Number(quantity) || 1;
        console.log('📦 handleAddToCart called:', { productId, quantity, safeQuantity });
        try {
            const data = await addToCartAPI(productId, safeQuantity);
            console.log('✅ Cart API response:', data);
            dispatch(setCart(data.cart)); // Sync normalized map completely
            return data;
        } catch (error) {
            console.error("Add to cart error:", error);
            throw error;
        }
    }

    async function handleUpdateQuantity({ productId, newQuantity, previousQuantity }) {
        try {
            // 1. Optimistic Execution locally to eliminate latency bounds
            dispatch(updateCartItemOptimistic({ productId, quantity: newQuantity }));
            
            // 2. Dispatch sync to Backend (offset mutation)
            const offset = newQuantity - previousQuantity;
            await addToCartAPI(productId, offset);
        } catch (error) {
            console.error("Failed optimistic update, triggering exact local Rollback", error);
            // 3. Precise Rollback without nuking the entire map
            dispatch(updateCartItemOptimistic({ productId, quantity: previousQuantity }));
            throw error;
        }
    }

    async function handleRemoveFromCart({ productId, previousCartItemObject }) {
        try {
            // 1. Optimistic Nuke
            dispatch(removeCartItemOptimistic({ productId }));
            
            // 2. Sync Sync Database
            await removeFromCartAPI(productId);
        } catch (error) {
            console.error("Remove failed, pulling backup", error);
            // Re-hydrate the map if database sync rejects
            await handleGetCart();
            throw error;
        }
    }

    async function handleToggleWishlist({ productId }) {
        try {
            const data = await toggleWishlistAPI(productId);
            dispatch(setWishlist(data.wishlist));
            return data;
        } catch (error) {
            console.error("Toggle wishlist error:", error);
            throw error;
        }
    }

    return {
        handleGetCart,
        handleGetWishlist,
        handleAddToCart,
        handleUpdateQuantity,
        handleRemoveFromCart,
        handleToggleWishlist
    };
};
