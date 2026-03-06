import React, { useState } from 'react';
import { CreditCard, Truck, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { CheckoutStep, setStep, setCustomerData } from '../store/slices/checkoutSlice';

const CheckoutModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState<'card' | 'delivery'>('card');
    const selectedProduct = useSelector((state: RootState) => state.products.selectedProduct);

    const [form, setForm] = useState({
        cardNumber: '',
        cardCvc: '',
        expMonth: '',
        expYear: '',
        cardHolder: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        department: '',
    });

    if (!isOpen || !selectedProduct) return null;

    const handleNext = () => {
        if (activeTab === 'card') {
            setActiveTab('delivery');
        } else {
            dispatch(setCustomerData({
                name: form.name,
                email: form.email,
                phone: form.phone,
                address: form.address,
                city: form.city,
                department: form.department,
            }));
            dispatch(setStep(CheckoutStep.SUMMARY));
        }
    };

    const getCardBrand = (number: string) => {
        if (number.startsWith('4')) return 'VISA';
        if (number.startsWith('5')) return 'MASTERCARD';
        return null;
    };

    const brand = getCardBrand(form.cardNumber);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-morphism w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative animate-scale-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-dim hover:text-white">
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    {activeTab === 'card' ? <CreditCard className="text-primary" /> : <Truck className="text-primary" />}
                    {activeTab === 'card' ? 'Payment Details' : 'Delivery Information'}
                </h2>

                <div className="flex gap-4 mb-6">
                    <div className={`h-1 flex-1 rounded-full ${activeTab === 'card' ? 'bg-primary' : 'bg-white/10'}`} />
                    <div className={`h-1 flex-1 rounded-full ${activeTab === 'delivery' ? 'bg-primary' : 'bg-white/10'}`} />
                </div>

                {activeTab === 'card' ? (
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                placeholder="Card Number"
                                value={form.cardNumber}
                                onChange={e => setForm({ ...form, cardNumber: e.target.value })}
                                maxLength={16}
                            />
                            {brand && (
                                <span className="absolute right-3 top-3 text-[10px] font-bold bg-white/10 px-2 py-1 rounded">
                                    {brand}
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                placeholder="MM"
                                value={form.expMonth}
                                onChange={e => setForm({ ...form, expMonth: e.target.value })}
                                maxLength={2}
                            />
                            <input
                                placeholder="YY"
                                value={form.expYear}
                                onChange={e => setForm({ ...form, expYear: e.target.value })}
                                maxLength={2}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                placeholder="CVC"
                                value={form.cardCvc}
                                onChange={e => setForm({ ...form, cardCvc: e.target.value })}
                                maxLength={4}
                            />
                            <input
                                placeholder="Holder Name"
                                value={form.cardHolder}
                                onChange={e => setForm({ ...form, cardHolder: e.target.value })}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <input
                            placeholder="Full Name"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                        <input
                            placeholder="Email"
                            type="email"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                        />
                        <input
                            placeholder="Phone"
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })}
                        />
                        <input
                            placeholder="Address"
                            value={form.address}
                            onChange={e => setForm({ ...form, address: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                placeholder="City"
                                value={form.city}
                                onChange={e => setForm({ ...form, city: e.target.value })}
                            />
                            <input
                                placeholder="Department"
                                value={form.department}
                                onChange={e => setForm({ ...form, department: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                <button className="btn-primary mt-6" onClick={handleNext}>
                    {activeTab === 'card' ? 'Next: Delivery' : 'Continue to Summary'}
                </button>
            </div>
        </div>
    );
};

export default CheckoutModal;
