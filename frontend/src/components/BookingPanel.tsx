import React from 'react';
import { X, Zap, Wrench, Hammer, Paintbrush, Shovel, Settings } from 'lucide-react';

interface BookingPanelProps {
    onClose: () => void;
    onSubmit: (serviceType: string) => void;
    initialService?: string;
}

const BookingPanel: React.FC<BookingPanelProps> = ({ onClose, onSubmit, initialService }) => {
    // We can use this state to highlight the selected service if we want a "Confirm" step.
    // For now, clicking the icon triggers the book immediately as per original design.

    const services = [
        { id: 'electrician', name: 'Electrician', icon: <Zap size={24} color="#facc15" /> },
        { id: 'plumber', name: 'Plumber', icon: <Wrench size={24} color="#3b82f6" /> },
        { id: 'carpenter', name: 'Carpenter', icon: <Hammer size={24} color="#a855f7" /> },
        { id: 'painter', name: 'Painter', icon: <Paintbrush size={24} color="#ec4899" /> },
        { id: 'gardener', name: 'Gardener', icon: <Shovel size={24} color="#22c55e" /> },
        { id: 'mechanic', name: 'Mechanic', icon: <Settings size={24} color="#64748b" /> },
    ];

    // If initialService exists, we could auto-trigger or highlight.
    // For this MVP, let's just show the grid, but if initialService matches one, maybe we could highlight it?
    // Or simpler: The user clicked "Plumber" on landing page -> Map opens -> Panel opens -> They confirm "Plumber" by clicking it again or we add a "Confirm Booking" button.

    // Let's stick to: Click on icon -> Book. 

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
                        onClick={() => onSubmit(s.id)}
                        style={{
                            background: initialService === s.id ? 'rgba(108, 92, 231, 0.3)' : 'rgba(255,255,255,0.05)',
                            borderColor: initialService === s.id ? '#6c5ce7' : 'transparent',
                            padding: '20px',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer',
                            borderWidth: '1px',
                            borderStyle: 'solid',
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
