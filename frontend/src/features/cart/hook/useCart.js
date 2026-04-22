import { useDispatch } from "react-redux";
import { setCart, setWishlist, setCartLoading } from "../state/cart.slice";
import { fetchCart, fetchWishlist, addToCartAPI, removeFromCartAPI, toggleWishlistAPI } from "../service/cart.api";

export const useCart = () => {
    const dispatch = useDispatch();

    async function handleGetCart() {
        dispatch(setCartLoading(true));
        try {
            const data = await fetchCart();
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

    async function handleAddToCart({ productId, variantId, quantity = 1 }) {
        try {
            const data = await addToCartAPI(productId, variantId, quantity);
            dispatch(setCart(data.cart));
            return data;
        } catch (error) {
            console.error("Add to cart error:", error);
            throw error;
        }
    }

    async function handleRemoveFromCart({ productId, variantId }) {
        try {
            const data = await removeFromCartAPI(productId, variantId);
            dispatch(setCart(data.cart));
            return data;
        } catch (error) {
            console.error("Remove from cart error:", error);
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
        handleRemoveFromCart,
        handleToggleWishlist
    };
};
