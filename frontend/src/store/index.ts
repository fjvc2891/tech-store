import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/productSlice';
import checkoutReducer from './slices/checkoutSlice';

export const store = configureStore({
    reducer: {
        products: productReducer,
        checkout: checkoutReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
