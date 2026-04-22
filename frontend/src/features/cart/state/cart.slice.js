import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: [],
  wishlist: [],
  loading: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart(state, action) {
      state.cart = action.payload;
    },
    setWishlist(state, action) {
      state.wishlist = action.payload;
    },
    setCartLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { setCart, setWishlist, setCartLoading } = cartSlice.actions;
export default cartSlice.reducer;
