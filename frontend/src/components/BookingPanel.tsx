import React from 'react';
import { X, Zap, Wrench, Droplet } from 'lucide-react';

interface BookingPanelProps {
    onClose: () => void;
    onBook: (serviceType: string) => void;
}

const BookingPanel: React.FC<BookingPanelProps> = ({ onClose, onBook }) => {
    const services = [
        { id: 'electrician', name: 'Electrician', icon: <Zap size={24} color="#f6e58d" /> },
        { id: 'plumber', name: 'Plumber', icon: <Droplet size={24} color="#74b9ff" /> },
        { id: 'mechanic', name: 'Mechanic', icon: <Wrench size={24} color="#ff7675" /> },
    ];

    return (
        <div
            className="glass-card"
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                padding: '20px',
                zIndex: 2000,
                animation: 'slideUp 0.3s ease-out'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3>Select Service</h3>
                <X style={{ cursor: 'pointer' }} onClick={onClose} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                {services.map(s => (
                    <div
                        key={s.id}
                        onClick={() => onBook(s.id)}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            padding: '20px',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            border: '1px solid transparent',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{ marginBottom: '10px' }}>{s.icon}</div>
                        <span style={{ fontSize: '14px' }}>{s.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BookingPanel;
