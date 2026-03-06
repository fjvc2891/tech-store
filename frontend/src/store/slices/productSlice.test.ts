import { describe, it, expect, vi } from 'vitest';
import reducer, { selectProduct, fetchProducts } from './productSlice';
import axios from 'axios';

vi.mock('axios');

describe('productSlice', () => {
    const initialState = {
        items: [],
        selectedProduct: null,
        loading: false,
        error: null,
    };

    it('should return the initial state', () => {
        expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle selectProduct', () => {
        const product = {
            id: '1',
            name: 'Test Product',
            description: 'Desc',
            priceCents: 1000,
            stock: 5
        };
        const actual = reducer(initialState, selectProduct(product));
        expect(actual.selectedProduct).toEqual(product);
    });

    describe('fetchProducts extraReducers', () => {
        it('should handle pending state', () => {
            const actual = reducer(initialState, { type: fetchProducts.pending.type });
            expect(actual.loading).toBe(true);
            expect(actual.error).toBeNull();
        });

        it('should handle fulfilled state', () => {
            const products = [{ id: '1', name: 'Product A', priceCents: 1000, stock: 5, description: '' }];
            const actual = reducer(
                { ...initialState, loading: true },
                { type: fetchProducts.fulfilled.type, payload: products }
            );
            expect(actual.loading).toBe(false);
            expect(actual.items).toEqual(products);
        });

        it('should handle rejected state', () => {
            const actual = reducer(
                { ...initialState, loading: true },
                { type: fetchProducts.rejected.type, error: { message: 'Network error' } }
            );
            expect(actual.loading).toBe(false);
            expect(actual.error).toBe('Network error');
        });
    });

    describe('fetchProducts thunk', () => {
        it('should call api and return products', async () => {
            const mockProducts = [{ id: '1', name: 'A', priceCents: 100, stock: 10, description: '' }];
            (axios.get as any).mockResolvedValueOnce({ data: { data: mockProducts } });

            const dispatch = vi.fn();
            const getState = vi.fn();

            await fetchProducts()(dispatch, getState, undefined);

            expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/products'));
        });
    });
});
