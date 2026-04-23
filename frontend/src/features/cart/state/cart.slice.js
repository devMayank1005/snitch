import { createSlice, createSelector } from "@reduxjs/toolkit";

const initialState = {
  cartItemsById: {},
  allIds: [],
  wishlist: [],
  loading: false,
  isInitialized: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart(state, action) {
      // Normalize incoming array sequentially
      const items = action.payload || [];
      const newById = {};
      const newAllIds = [];
      
      items.forEach(item => {
        const id = item.itemKey || `${item.product}:${item.variantId || 'base'}`;
        newById[id] = item;
        newAllIds.push(id);
      });
      
      state.cartItemsById = newById;
      state.allIds = newAllIds;
      state.isInitialized = true;
    },
    updateCartItemOptimistic(state, action) {
      // Invariant Protection check before committing mutation
        const { itemKey, quantity } = action.payload;
        if (state.cartItemsById[itemKey]) {
          state.cartItemsById[itemKey].quantity = quantity;
      }
    },
    removeCartItemOptimistic(state, action) {
        const { itemKey } = action.payload;
        if (state.cartItemsById[itemKey]) {
          delete state.cartItemsById[itemKey];
          state.allIds = state.allIds.filter(id => id !== itemKey);
      }
    },
    setWishlist(state, action) {
      state.wishlist = action.payload;
    },
    setCartLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { setCart, updateCartItemOptimistic, removeCartItemOptimistic, setWishlist, setCartLoading } = cartSlice.actions;

// --- MEMOIZED SELECTORS ---
const selectCartState = state => state.cart;

export const selectAllCartItems = createSelector(
  [selectCartState],
  (cart) => cart.allIds.map(id => cart.cartItemsById[id])
);

export const selectCanonicalCartItems = createSelector(
  [selectAllCartItems],
  (items) => items
);

export const selectCartSubtotal = createSelector(
  [selectCanonicalCartItems],
  (items) => {
      // Calculate securely off locked priceSnapshots natively isolating calculations
      return items.reduce((total, item) => {
          if (!item.isUnavailable && item.priceSnapshot?.amount) {
              return total + (item.priceSnapshot.amount * item.quantity);
          }
          return total;
      }, 0);
  }
);

export const selectGroupedCartItems = createSelector(
  [selectCanonicalCartItems],
  (items) => {
      const groups = {};
      items.forEach(item => {
          const groupKey = item.product || item.titleSnapshot || "Miscellaneous";
          
          if (!groups[groupKey]) {
              groups[groupKey] = {
                  groupId: groupKey,
                  baseTitle: item.titleSnapshot || "Archived Product",
                  items: []
              };
          }
          groups[groupKey].items.push(item);
      });
      return Object.values(groups);
  }
);

export const selectCartAlerts = createSelector(
  [selectCanonicalCartItems],
  (items) => {
      const hasUnavailable = items.some(item => item.isUnavailable);
      const hasPriceDrift = items.some(item => item.priceDrift);
      
      return {
          hasUnavailable,
          hasPriceDrift,
          canCheckout: !hasUnavailable && items.length > 0
      };
  }
);

export const selectCartCurrency = createSelector(
  [selectCanonicalCartItems],
  (items) => {
      const firstCurrency = items.find(item => item.priceSnapshot?.currency)?.priceSnapshot?.currency;
      return firstCurrency || "INR";
  }
);

export default cartSlice.reducer;
