import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import productReducer from '../store/slices/productSlice';
import checkoutReducer from '../store/slices/checkoutSlice';
import StatusStep from './StatusStep';
import * as checkoutActions from '../store/slices/checkoutSlice';
import * as productActions from '../store/slices/productSlice';

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

describe('StatusStep', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render success state correctly', () => {
        const store = createMockStore({
            checkout: {
                wompiStatus: 'APPROVED',
                transactionId: 'tx-12345'
            }
        });

        render(<Provider store={store}><StatusStep /></Provider>);

        expect(screen.getByText('Payment Success!')).toBeInTheDocument();
        expect(screen.getByText('tx-12345')).toBeInTheDocument();
        expect(screen.getByText('APPROVED')).toBeInTheDocument();
    });

    it('should render failure state correctly', () => {
        const store = createMockStore({
            checkout: {
                wompiStatus: 'DECLINED',
                transactionId: 'tx-54321'
            }
        });

        render(<Provider store={store}><StatusStep /></Provider>);

        expect(screen.getByText('Payment Failed')).toBeInTheDocument();
        expect(screen.getByText('tx-54321')).toBeInTheDocument();
        expect(screen.getByText('DECLINED')).toBeInTheDocument();
    });

    it('should dispatch resetCheckout and fetchProducts on finish', () => {
        const store = createMockStore({
            checkout: {
                wompiStatus: 'APPROVED',
                transactionId: 'tx-111'
            }
        });

        const dispatchSpy = vi.spyOn(store, 'dispatch');

        render(<Provider store={store}><StatusStep /></Provider>);

        fireEvent.click(screen.getByText(/Back to Products/i));

        expect(dispatchSpy).toHaveBeenCalledWith(checkoutActions.resetCheckout());

        // Check if fetchProducts was called (since we mocked it, it returns an action object)
        expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'mock/fetchProducts' }));
    });
});
