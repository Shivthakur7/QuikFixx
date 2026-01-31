import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface SubService {
    id: string;
    name: string;
    price: number;
    time: string;
}

interface Props {
    serviceName: string;
    subServices: SubService[];
    onClose: () => void;
    onConfirm: (selectedItems: SubService[], totalPrice: number) => void;
}

const SubServiceSelectionModal: React.FC<Props> = ({ serviceName, subServices, onClose, onConfirm }) => {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const toggleService = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const selectedItems = subServices.filter(s => selectedIds.includes(s.id));
    const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 3000,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
        }}>
            <div className="glass-card" style={{
                width: '100%', maxWidth: '500px',
                borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
                borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
                padding: '20px', maxHeight: '80vh', overflowY: 'auto',
                background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: 'white' }}>{serviceName}</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#a0a0b0', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <p style={{ color: '#a0a0b0', marginBottom: '20px' }}>Select specific tasks for accurate pricing</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '80px' }}>
                    {subServices.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                            No specific items listed. You can proceed with general booking.
                        </div>
                    ) : (
                        subServices.map(s => {
                            const isSelected = selectedIds.includes(s.id);
                            return (
                                <div key={s.id} onClick={() => toggleService(s.id)} style={{
                                    padding: '15px', borderRadius: '12px',
                                    background: isSelected ? 'rgba(108, 92, 231, 0.2)' : 'rgba(255,255,255,0.05)',
                                    border: isSelected ? '1px solid #6c5ce7' : '1px solid transparent',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    cursor: 'pointer'
                                }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', color: 'white' }}>{s.name}</h4>
                                        <div style={{ fontSize: '12px', color: '#a0a0b0' }}>⏱️ {s.time}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>₹{s.price}</div>
                                        {isSelected && <div style={{ fontSize: '12px', color: '#00cec9', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}><Check size={12} /> Added</div>}
                                    </div>
                                </div>
                            );
                        }))}
                </div>

                {/* Bottom Bar */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)',
                    background: '#1e1e2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div>
                        <div style={{ fontSize: '12px', color: '#a0a0b0' }}>Total</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>₹{totalPrice > 0 ? totalPrice : (subServices.length > 0 ? 0 : 500)}</div>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => onConfirm(selectedItems, totalPrice > 0 ? totalPrice : 500)}
                        disabled={subServices.length > 0 && selectedIds.length === 0}
                        style={{ padding: '12px 30px', borderRadius: '12px', opacity: (subServices.length > 0 && selectedIds.length === 0) ? 0.5 : 1 }}
                    >
                        Find Provider
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubServiceSelectionModal;
