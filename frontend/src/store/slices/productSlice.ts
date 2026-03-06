import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface Product {
    id: string;
    name: string;
    description: string;
    priceCents: number;
    stock: number;
    imageUrl?: string;
}

interface ProductState {
    items: Product[];
    selectedProduct: Product | null;
    loading: boolean;
    error: string | null;
}

const initialState: ProductState = {
    items: [],
    selectedProduct: null,
    loading: false,
    error: null,
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
    const response = await axios.get(`${API_URL}/products`);
    return response.data.data;
});

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        selectProduct: (state, action: PayloadAction<Product>) => {
            state.selectedProduct = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Error fetching products';
            });
    },
});

export const { selectProduct } = productSlice.actions;
export default productSlice.reducer;
