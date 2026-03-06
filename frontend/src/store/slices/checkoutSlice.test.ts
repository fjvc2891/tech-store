import { describe, it, expect, beforeEach, vi } from 'vitest';
import reducer, { setStep, setCustomerData, resetCheckout, CheckoutStep } from './checkoutSlice';

describe('checkoutSlice', () => {
    beforeEach(() => {
        vi.stubGlobal('localStorage', {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
        });
    });

    const initialState = {
        currentStep: CheckoutStep.PRODUCT_CATALOG,
        customerData: null,
        transactionId: null,
        wompiStatus: null,
    };

    it('should handle setStep', () => {
        const actual = reducer(initialState, setStep(CheckoutStep.SUMMARY));
        expect(actual.currentStep).toBe(CheckoutStep.SUMMARY);
        expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should handle setCustomerData', () => {
        const data = {
            name: 'John',
            email: 'john@test.com',
            phone: '123',
            address: 'Addr',
            city: 'City',
            department: 'Dept'
        };
        const actual = reducer(initialState, setCustomerData(data));
        expect(actual.customerData).toEqual(data);
    });

    it('should handle resetCheckout', () => {
        const dirtyState = {
            currentStep: CheckoutStep.FINAL_STATUS,
            customerData: { name: 'John' } as any,
            transactionId: '123',
            wompiStatus: 'OK'
        };
        const actual = reducer(dirtyState, resetCheckout());
        expect(actual).toEqual(initialState);
        expect(localStorage.removeItem).toHaveBeenCalledWith('checkout_state');
    });
});
