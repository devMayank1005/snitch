import {
    createProduct,
    getSellerProduct,
    getAllProducts,
    getProductById,
    addProductVariant,
    updateProductVariant,
    deleteProductVariant,
    deleteProduct,
} from "../services/product.api.js"
import { useDispatch } from "react-redux"
import { setSellerProducts, setProducts } from "../state/product.slice"



export const useProduct = () => {

    const dispatch = useDispatch()

    async function handleCreateProduct(formData) {
        const data = await createProduct(formData)
        return data.data || data.product
    }

    async function handleGetSellerProduct() {
        const data = await getSellerProduct()
        dispatch(setSellerProducts(data.products))
        return data.products
    }

    async function handleGetAllProducts(query = {}) {
        const data = await getAllProducts(query)
        dispatch(setProducts(data.products))
    }

    async function handleGetProductById(productId) {
        const data = await getProductById(productId)
        return data.product
    }

    async function handleAddProductVariant(productId, newProductVariant) {
        const data = await addProductVariant(productId, newProductVariant)

        return data.product || data.data || data
    }

    async function handleUpdateProductVariant(productId, variantId, payload) {
        const data = await updateProductVariant(productId, variantId, payload)
        return data.product || data.data || data
    }

    async function handleDeleteProductVariant(productId, variantId) {
        return deleteProductVariant(productId, variantId)
    }

    async function handleDeleteProduct(productId) {
        return deleteProduct(productId)
    }

    return {
        handleCreateProduct,
        handleGetSellerProduct,
        handleGetAllProducts,
        handleGetProductById,
        handleAddProductVariant,
        handleUpdateProductVariant,
        handleDeleteProductVariant,
        handleDeleteProduct,
    }

}