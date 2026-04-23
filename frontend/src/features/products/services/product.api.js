import axios from "axios";

const productApiInstance = axios.create({
    baseURL: "/api/products",
    withCredentials: true,
})

export async function createProduct(formData) {
    const response = await productApiInstance.post("/create", formData)

    return response.data
}

export async function getSellerProduct() {
    const response = await productApiInstance.get("/seller")
    return response.data
}

export async function getAllProducts(query = {}) {
    const params = new URLSearchParams(query).toString();
    const response = await productApiInstance.get("/" + (params ? `?${params}` : ""))
    return response.data
}

export async function getProductById(productId) {
    const response = await productApiInstance.get(`/detail/${productId}`)
    return response.data
}

export async function addProductVariant(productId, newProductVariant) {
    const formData = new FormData()

    newProductVariant.images.forEach((image) => {
        formData.append(`images`, image.file)
    })

    formData.append("stock", newProductVariant.stock)
    formData.append("priceAmount", newProductVariant.price)
    formData.append("attributes", JSON.stringify(newProductVariant.attributes))

    const response = await productApiInstance.post(`/${productId}/variants`, formData)

    return response.data

}

export async function updateProductVariant(productId, variantId, payload) {
    const formData = new FormData();

    if (payload.stock !== undefined) formData.append("stock", payload.stock);
    if (payload.priceAmount !== undefined) formData.append("priceAmount", payload.priceAmount);
    if (payload.priceCurrency) formData.append("priceCurrency", payload.priceCurrency);
    if (payload.attributes) formData.append("attributes", JSON.stringify(payload.attributes));
    if (payload.isActive !== undefined) formData.append("isActive", payload.isActive);

    if (Array.isArray(payload.images)) {
        payload.images.forEach((image) => {
            if (image.file) formData.append("images", image.file);
        });
    }

    const response = await productApiInstance.patch(`/${productId}/variants/${variantId}`, formData);
    return response.data;
}

export async function deleteProductVariant(productId, variantId) {
    const response = await productApiInstance.delete(`/${productId}/variants/${variantId}`);
    return response.data;
}