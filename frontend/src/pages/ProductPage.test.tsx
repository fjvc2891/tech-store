import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import productReducer from '../store/slices/productSlice';
import checkoutReducer from '../store/slices/checkoutSlice';
import ProductPage from './ProductPage';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../store/slices/productSlice', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../store/slices/productSlice')>();
    return {
        ...actual,
        fetchProducts: vi.fn(() => ({ type: 'mock/fetchProducts' }))
    };
});

const createMockStore = (initialState = {}) => {
    return configureStore({
        reducer: {
            products: productReducer,
            checkout: checkoutReducer,
        },
        preloadedState: initialState,
    });
};

describe('ProductPage', () => {
    it('should render loading state', () => {
        const store = createMockStore({
            products: { items: [], selectedProduct: null, loading: true, error: null }
        });

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ProductPage />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render products when loaded', async () => {
        const store = createMockStore({
            products: {
                items: [{ id: '1', name: 'Product A', priceCents: 1000, stock: 5, description: 'Test' }],
                selectedProduct: null,
                loading: false,
                error: null
            },
            checkout: { currentStep: 0, customerData: null, transactionId: null, wompiStatus: null }
        });

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <ProductPage />
                </MemoryRouter>
            </Provider>
        );

        expect(screen.getByText('Product A')).toBeInTheDocument();
        // Since priceCents is 1000, 1000 / 100 = 10, so the formatted price is "$10 COP"
        expect(screen.getByText(/\$10 COP/i)).toBeInTheDocument();
    });
});
