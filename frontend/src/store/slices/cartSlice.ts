import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '../../types/cart';

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      state.totalItems = action.payload.reduce((sum, item) => sum + item.quantity, 0);
      state.totalPrice = action.payload.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    clearCart(state) {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setCartItems, clearCart, setLoading } = cartSlice.actions;
export default cartSlice.reducer;
