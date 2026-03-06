import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { ShoppingCart, ArrowLeft, Loader2 } from 'lucide-react';
import { CheckoutStep, setStep, setTransactionInfo } from '../store/slices/checkoutSlice';
import type { CheckoutState } from '../store/slices/checkoutSlice';
import axios from 'axios';

const SummaryStep: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { selectedProduct } = useSelector((state: RootState) => state.products);
    const checkout = useSelector((state: RootState) => state.checkout as CheckoutState);
    const { customerData } = checkout;
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    if (!selectedProduct || !customerData) return null;

    const baseFee = 3000;
    const deliveryFee = 5000;
    const productPrice = selectedProduct.priceCents / 100;
    const total = productPrice + baseFee + deliveryFee;

    const handleProcessPayment = async () => {
        setLoading(true);
        setError(null);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

            // 1. Create Transaction + Process Wompi
            const txResponse = await axios.post(`${API_URL}/transactions`, {
                productId: selectedProduct.id,
                customerId: "0b1e1d3e-8c3b-4b1a-9c1a-1a2b3c4d5e6f", // Mock customer for demo
                cardNumber: "4111111111111111", // Default sandbox card
                cardCvc: "123",
                expMonth: "12",
                expYear: "27",
                cardHolder: customerData.name,
                quantity: 1
            });

            const { data: tx, status: wompiStatus } = txResponse.data;

            // 2. Create Delivery
            await axios.post(`${API_URL}/deliveries`, {
                transactionId: tx.id,
                address: customerData.address,
                city: customerData.city,
                department: customerData.department
            });

            dispatch(setTransactionInfo({ id: tx.id, status: wompiStatus || 'APPROVED' }));
            dispatch(setStep(CheckoutStep.FINAL_STATUS));
        } catch (err: any) {
            console.error('Payment error', err);
            setError(err.response?.data?.message || 'Transaction could not be processed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0f172a] w-full max-w-md p-8 rounded-t-[32px] border-t border-white/10 animate-slide-up shadow-2xl overflow-y-auto max-h-[90vh]">
                <button
                    onClick={() => dispatch(setStep(CheckoutStep.CREDIT_CARD_INFO))}
                    className="flex items-center gap-1 text-dim hover:text-white mb-6 text-sm"
                >
                    <ArrowLeft size={16} /> Back to details
                </button>

                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <ShoppingCart className="text-primary" />
                    Payment Summary
                </h2>

                {error && <div className="bg-error/10 text-error p-3 rounded-lg text-sm mb-6">{error}</div>}

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-dim">
                        <span>{selectedProduct.name}</span>
                        <span className="text-white">${productPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-dim">
                        <span>Base Fee</span>
                        <span className="text-white">${baseFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-dim">
                        <span>Delivery Fee</span>
                        <span className="text-white">${deliveryFee.toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-white/10 my-4" />
                    <div className="flex justify-between text-xl font-bold">
                        <span>Total to pay</span>
                        <span className="text-accent">${total.toLocaleString()} COP</span>
                    </div>
                </div>

                <div className="glass-morphism p-4 mb-8 text-xs text-dim">
                    <p className="mb-2 uppercase tracking-widest font-bold">Shipping to:</p>
                    <p className="text-white font-semibold">{customerData.name}</p>
                    <p>{customerData.address}, {customerData.city}</p>
                </div>

                <button
                    className="btn-primary flex items-center justify-center gap-2 py-4 h-14"
                    onClick={handleProcessPayment}
                    disabled={loading}
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'Confirm and Pay Now'}
                </button>
            </div>
        </div>
    );
};

export default SummaryStep;
