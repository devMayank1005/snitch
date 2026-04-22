import authApiInstance from "../../auth/service/auth.api";

// We use authApiInstance and override baseURL: '' so it inherits 
// the robust token-refresh interceptors without defaulting to /api/auth

export async function fetchCart() {
    const response = await authApiInstance.get("/api/user/", { baseURL: '' });
    return response.data;
}

export async function addToCartAPI(productId, quantity) {
    const response = await authApiInstance.post("/api/user/add", { productId, quantity }, { baseURL: '' });
    return response.data;
}

export async function removeFromCartAPI(productId) {
    const response = await authApiInstance.post("/api/user/remove", { productId }, { baseURL: '' });
    return response.data;
}

export async function fetchWishlist() {
    const response = await authApiInstance.get("/api/user/wishlist", { baseURL: '' });
    return response.data;
}

export async function toggleWishlistAPI(productId) {
    const response = await authApiInstance.post("/api/user/wishlist/toggle", { productId }, { baseURL: '' });
    return response.data;
}
