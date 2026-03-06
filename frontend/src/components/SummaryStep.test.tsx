import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import productReducer from '../store/slices/productSlice';
import checkoutReducer, { CheckoutStep } from '../store/slices/checkoutSlice';
import SummaryStep from './SummaryStep';
import * as checkoutActions from '../store/slices/checkoutSlice';
import axios from 'axios';

vi.mock('axios');

const createMockStore = (initialState = {}) => {
    return configureStore({
        reducer: {
            products: productReducer,
            checkout: checkoutReducer,
        },
        preloadedState: initialState,
    });
};

describe('SummaryStep', () => {
    const mockCustomerSession = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        address: '123 Main St',
        city: 'Bogota',
        department: 'Cundinamarca'
    };

    const mockProductState = {
        items: [],
        selectedProduct: { id: '1', name: 'Product A', priceCents: 100000, stock: 5 }, // 1000 COP
        loading: false,
        error: null,
    };

    const mockCheckoutState = {
        currentStep: CheckoutStep.SUMMARY,
        customerData: mockCustomerSession,
        transactionId: null,
        wompiStatus: null
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should not render if selectedProduct or customerData is missing', () => {
        const store = createMockStore({
            products: { ...mockProductState, selectedProduct: null },
            checkout: mockCheckoutState
        });
        const { container } = render(<Provider store={store}><SummaryStep /></Provider>);
        expect(container.firstChild).toBeNull();
    });

    it('should render correct totals and customer data', () => {
        const store = createMockStore({ products: mockProductState, checkout: mockCheckoutState });
        render(<Provider store={store}><SummaryStep /></Provider>);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('123 Main St, Bogota')).toBeInTheDocument();

        // 1000 + 3000 + 5000 = 9000
        expect(screen.getByText(/\$9[.,]000 COP/i)).toBeInTheDocument();
    });

    it('should navigate back to card details', () => {
        const store = createMockStore({ products: mockProductState, checkout: mockCheckoutState });
        const dispatchSpy = vi.spyOn(store, 'dispatch');

        render(<Provider store={store}><SummaryStep /></Provider>);
        fireEvent.click(screen.getByText(/Back to details/i));

        expect(dispatchSpy).toHaveBeenCalledWith(checkoutActions.setStep(CheckoutStep.CREDIT_CARD_INFO));
    });

    it('should successfully process payment', async () => {
        const store = createMockStore({ products: mockProductState, checkout: mockCheckoutState });
        const dispatchSpy = vi.spyOn(store, 'dispatch');

        // Mock transactions API
        (axios.post as any).mockResolvedValueOnce({
            data: { data: { id: 'tx-123' }, status: 'APPROVED' }
        });
        // Mock deliveries API
        (axios.post as any).mockResolvedValueOnce({});

        render(<Provider store={store}><SummaryStep /></Provider>);

        fireEvent.click(screen.getByText('Confirm and Pay Now'));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledTimes(2);
            expect(dispatchSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: checkoutActions.setTransactionInfo.type,
                    payload: { id: 'tx-123', status: 'APPROVED' }
                })
            );
            expect(dispatchSpy).toHaveBeenCalledWith(checkoutActions.setStep(CheckoutStep.FINAL_STATUS));
        });
    });

    it('should handle payment failure', async () => {
        const store = createMockStore({ products: mockProductState, checkout: mockCheckoutState });

        // Mock transactions API failure
        (axios.post as any).mockRejectedValueOnce({
            response: { data: { message: 'Card declined' } }
        });

        render(<Provider store={store}><SummaryStep /></Provider>);
        fireEvent.click(screen.getByText('Confirm and Pay Now'));

        await waitFor(() => {
            expect(screen.getByText('Card declined')).toBeInTheDocument();
        });
    });
});
