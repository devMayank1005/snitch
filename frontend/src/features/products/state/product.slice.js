import {createSlice} from "@reduxjs/toolkit";

const productSlice = createSlice({
    name: "product",
    initialState: {
        products: [],
        sellerProducts:[]
    },
    reducers: {
        setProducts: (state, action) => {
            state.products = action.payload;
        },
        setSellerProducts: (state, action) => {
            state.sellerProducts = action.payload;
        },
    },
});

export const {setProducts, setSellerProducts} = productSlice.actions;
export default productSlice.reducer;