import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import productReducer from '../store/slices/productSlice';
import checkoutReducer from '../store/slices/checkoutSlice';
import CheckoutModal from './CheckoutModal';
import * as checkoutActions from '../store/slices/checkoutSlice';

const createMockStore = (initialState = {}) => {
    return configureStore({
        reducer: {
            products: productReducer,
            checkout: checkoutReducer,
        },
        preloadedState: initialState,
    });
};

describe('CheckoutModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
    };

    const mockProductState = {
        items: [],
        selectedProduct: { id: '1', name: 'Product A', priceCents: 1000, stock: 5 },
        loading: false,
        error: null,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should not render if isOpen is false', () => {
        const store = createMockStore({ products: mockProductState });
        const { container } = render(
            <Provider store={store}>
                <CheckoutModal {...defaultProps} isOpen={false} />
            </Provider>
        );
        expect(container.firstChild).toBeNull();
    });

    it('should not render if selectedProduct is null', () => {
        const store = createMockStore({
            products: { ...mockProductState, selectedProduct: null }
        });
        const { container } = render(
            <Provider store={store}>
                <CheckoutModal {...defaultProps} />
            </Provider>
        );
        expect(container.firstChild).toBeNull();
    });

    it('should render card details tab by default and detect VISA', () => {
        const store = createMockStore({ products: mockProductState });
        render(
            <Provider store={store}>
                <CheckoutModal {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText('Payment Details')).toBeInTheDocument();

        const cardNumberInput = screen.getByPlaceholderText('Card Number');
        fireEvent.change(cardNumberInput, { target: { value: '4111222233334444' } });

        expect(screen.getByText('VISA')).toBeInTheDocument();
        expect(screen.getByText('Next: Delivery')).toBeInTheDocument();
    });

    it('should switch to delivery tab and dispatch actions on submit', () => {
        const store = createMockStore({ products: mockProductState });

        // Spy on dispatch
        const dispatchSpy = vi.spyOn(store, 'dispatch');

        render(
            <Provider store={store}>
                <CheckoutModal {...defaultProps} />
            </Provider>
        );

        // Click next
        fireEvent.click(screen.getByText('Next: Delivery'));

        // Now we should be on Delivery tab
        expect(screen.getByText('Delivery Information')).toBeInTheDocument();

        // Fill some data
        fireEvent.change(screen.getByPlaceholderText('Full Name'), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });

        // Submit
        fireEvent.click(screen.getByText('Continue to Summary'));

        // Check dispatches
        expect(dispatchSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                type: checkoutActions.setCustomerData.type,
                payload: expect.objectContaining({
                    name: 'John Doe',
                    email: 'john@example.com'
                })
            })
        );

        expect(dispatchSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                type: checkoutActions.setStep.type,
                payload: checkoutActions.CheckoutStep.SUMMARY
            })
        );
    });
});
