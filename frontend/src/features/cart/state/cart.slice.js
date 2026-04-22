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
        const id = item.product; // productId represents the strictly unique Variant string
        newById[id] = item;
        newAllIds.push(id);
      });
      
      state.cartItemsById = newById;
      state.allIds = newAllIds;
      state.isInitialized = true;
    },
    updateCartItemOptimistic(state, action) {
      // Invariant Protection check before committing mutation
      const { productId, quantity } = action.payload;
      if (state.cartItemsById[productId]) {
          state.cartItemsById[productId].quantity = quantity;
      }
    },
    removeCartItemOptimistic(state, action) {
      const { productId } = action.payload;
      if (state.cartItemsById[productId]) {
          delete state.cartItemsById[productId];
          state.allIds = state.allIds.filter(id => id !== productId);
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
  (items) => {
      const parentProductIdsWithVariants = new Set();

      items.forEach((item) => {
          if (item.parentProductId) {
              parentProductIdsWithVariants.add(item.parentProductId.toString());
          }
      });

      return items.filter((item) => {
          const productId = item.product?.toString?.() || String(item.product);
          return !parentProductIdsWithVariants.has(productId);
      });
  }
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
          // Absolute Grouping stability checking title fallback if un-parented
          const groupKey = item.parentProductId || item.titleSnapshot || "Miscellaneous";
          
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
