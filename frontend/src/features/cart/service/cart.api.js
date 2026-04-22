import axios from "axios";
import { store } from "../../../app/app.store";

const cartApiInstance = axios.create({
    baseURL: "/api/user",
    withCredentials: true,
});

cartApiInstance.interceptors.request.use(config => {
    const state = store.getState();
    const token = state.auth.token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export async function fetchCart() {
    const response = await cartApiInstance.get("/");
    return response.data;
}

export async function addToCartAPI(productId, variantId, quantity) {
    const response = await cartApiInstance.post("/add", { productId, variantId, quantity });
    return response.data;
}

export async function removeFromCartAPI(productId, variantId) {
    const response = await cartApiInstance.post("/remove", { productId, variantId });
    return response.data;
}

export async function fetchWishlist() {
    const response = await cartApiInstance.get("/wishlist");
    return response.data;
}

export async function toggleWishlistAPI(productId) {
    const response = await cartApiInstance.post("/wishlist/toggle", { productId });
    return response.data;
}
