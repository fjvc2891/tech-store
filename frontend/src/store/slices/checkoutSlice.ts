import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export const CheckoutStep = {
    PRODUCT_CATALOG: 0,
    CREDIT_CARD_INFO: 1,
    SUMMARY: 2,
    FINAL_STATUS: 3,
} as const;

export type CheckoutStepType = typeof CheckoutStep[keyof typeof CheckoutStep];

export interface CustomerData {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    department: string;
}

export interface CheckoutState {
    currentStep: CheckoutStepType;
    customerData: CustomerData | null;
    transactionId: string | null;
    wompiStatus: string | null;
}

const loadState = (): CheckoutState => {
    try {
        const serializedState = localStorage.getItem('checkout_state');
        if (serializedState === null) {
            return {
                currentStep: CheckoutStep.PRODUCT_CATALOG,
                customerData: null,
                transactionId: null,
                wompiStatus: null,
            };
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return {
            currentStep: CheckoutStep.PRODUCT_CATALOG,
            customerData: null,
            transactionId: null,
            wompiStatus: null,
        };
    }
};

const initialState: CheckoutState = loadState();

const checkoutSlice = createSlice({
    name: 'checkout',
    initialState,
    reducers: {
        setStep: (state, action: PayloadAction<CheckoutStepType>) => {
            state.currentStep = action.payload;
            localStorage.setItem('checkout_state', JSON.stringify(state));
        },
        setCustomerData: (state, action: PayloadAction<CheckoutState['customerData']>) => {
            state.customerData = action.payload;
            localStorage.setItem('checkout_state', JSON.stringify(state));
        },
        setTransactionInfo: (state, action: PayloadAction<{ id: string; status: string }>) => {
            state.transactionId = action.payload.id;
            state.wompiStatus = action.payload.status;
            localStorage.setItem('checkout_state', JSON.stringify(state));
        },
        resetCheckout: (state) => {
            state.currentStep = CheckoutStep.PRODUCT_CATALOG;
            state.customerData = null;
            state.transactionId = null;
            state.wompiStatus = null;
            localStorage.removeItem('checkout_state');
        },
    },
});

export const { setStep, setCustomerData, setTransactionInfo, resetCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;
