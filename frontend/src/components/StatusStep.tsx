import React from 'react';
import { CheckCircle, XCircle, Package, ArrowRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { resetCheckout } from '../store/slices/checkoutSlice';
import type { CheckoutState } from '../store/slices/checkoutSlice';
import { fetchProducts } from '../store/slices/productSlice';

const StatusStep: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const checkout = useSelector((state: RootState) => state.checkout as CheckoutState);
    const { wompiStatus, transactionId } = checkout;

    const handleFinish = () => {
        dispatch(resetCheckout());
        dispatch(fetchProducts()); // To get updated stock
    };

    const isSuccess = wompiStatus === 'APPROVED';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950">
            <div className="w-full max-w-sm text-center">
                <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-8 ${isSuccess ? 'bg-accent/10 text-accent' : 'bg-error/10 text-error'}`}>
                    {isSuccess ? <CheckCircle size={48} /> : <XCircle size={48} />}
                </div>

                <h2 className="text-3xl font-bold mb-2 text-white">
                    {isSuccess ? 'Payment Success!' : 'Payment Failed'}
                </h2>
                <p className="text-dim mb-8">
                    {isSuccess
                        ? 'Your transaction has been processed and your order is on its way.'
                        : 'There was an issue processing your payment. Please try again or use another card.'}
                </p>

                <div className="glass-morphism p-6 mb-10 text-left">
                    <div className="flex items-center gap-3 mb-4">
                        <Package className="text-primary" size={20} />
                        <span className="font-semibold text-white">Transaction Details</span>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-dim">ID:</span>
                            <span className="font-mono text-xs text-white">{transactionId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-dim">Status:</span>
                            <span className={`font-bold ${isSuccess ? 'text-accent' : 'text-error'}`}>{wompiStatus}</span>
                        </div>
                    </div>
                </div>

                <button className="btn-primary flex items-center justify-center gap-2" onClick={handleFinish}>
                    Back to Products <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default StatusStep;
