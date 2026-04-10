import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../../types/product';

interface ProductState {
  products: Product[];
  featured: Product[];
  trending: Product[];
  currentProduct: Product | null;
  loading: boolean;
  totalPages: number;
}

const initialState: ProductState = {
  products: [],
  featured: [],
  trending: [],
  currentProduct: null,
  loading: false,
  totalPages: 0,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts(state, action: PayloadAction<{ products: Product[]; totalPages: number }>) {
      state.products = action.payload.products;
      state.totalPages = action.payload.totalPages;
    },
    setFeatured(state, action: PayloadAction<Product[]>) {
      state.featured = action.payload;
    },
    setTrending(state, action: PayloadAction<Product[]>) {
      state.trending = action.payload;
    },
    setCurrentProduct(state, action: PayloadAction<Product | null>) {
      state.currentProduct = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setProducts, setFeatured, setTrending, setCurrentProduct, setLoading } = productSlice.actions;
export default productSlice.reducer;
