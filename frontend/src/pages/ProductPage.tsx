import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchProducts, selectProduct } from '../store/slices/productSlice';
import { ShoppingBag } from 'lucide-react';
import CheckoutModal from '../components/CheckoutModal';
import SummaryStep from '../components/SummaryStep';
import StatusStep from '../components/StatusStep';
import { CheckoutStep } from '../store/slices/checkoutSlice';

const ProductPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items, loading, error } = useSelector((state: RootState) => state.products);
    const { currentStep } = useSelector((state: RootState) => state.checkout);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const handlePay = (product: any) => {
        dispatch(selectProduct(product));
        setIsModalOpen(true);
    };

    if (loading) return <div role="status" className="text-center p-10 text-dim">Loading products...</div>;
    if (error) return <div className="text-center p-10 text-error">Error: {error}</div>;

    return (
        <div className="pb-20">
            <header className="flex items-center justify-between mb-8 py-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <ShoppingBag className="text-primary" />
                    Tech Store
                </h1>
                <div className="text-dim text-xs uppercase tracking-widest">Wompi Checkout</div>
            </header>

            <div className="product-grid">
                {items.map((prod) => (
                    <div key={prod.id} className="glass-morphism product-card">
                        <img src={prod.imageUrl} alt={prod.name} className="product-image" />
                        <div className="product-info">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-lg font-semibold">{prod.name}</h2>
                                <span className="stock-tag">{prod.stock} available</span>
                            </div>
                            <p className="text-dim text-sm mb-6 line-clamp-2">{prod.description}</p>
                            <div className="flex items-center justify-between mt-auto">
                                <span className="price">${(prod.priceCents / 100).toLocaleString()} COP</span>
                                <button
                                    className="btn-primary"
                                    style={{ width: 'auto', padding: '10px 20px' }}
                                    onClick={() => handlePay(prod)}
                                >
                                    Pay with Card
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <CheckoutModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            {currentStep === CheckoutStep.SUMMARY && <SummaryStep />}
            {currentStep === CheckoutStep.FINAL_STATUS && <StatusStep />}
        </div>
    );
};

export default ProductPage;
