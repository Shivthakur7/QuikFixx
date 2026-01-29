import React, { useState } from 'react';
import { User, Star, MapPin, X } from 'lucide-react';
import ProviderPublicProfileModal from './ProviderPublicProfileModal';

interface ProviderListPanelProps {
    providers: any[];
    onClose: () => void;
    onBookProvider: (provider: any) => void;
}

const ProviderListPanel: React.FC<ProviderListPanelProps> = ({ providers, onClose, onBookProvider }) => {
    const [selectedProvider, setSelectedProvider] = useState<any>(null);

    return (
        <div className="glass-card" style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 2000,
            padding: '20px',
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            maxHeight: '60vh',
            overflowY: 'auto'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h3>Available Professionals ({providers.length})</h3>
                <X style={{ cursor: 'pointer' }} onClick={onClose} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {providers.map((p, i) => (
                    <div key={i} style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '15px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        <div style={{
                            width: '50px', height: '50px',
                            borderRadius: '50%',
                            background: '#a29bfe',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <User color="white" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h4 style={{ margin: 0 }}>{p.name || 'Service Professional'}</h4>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fdcb6e', fontSize: '12px' }}>
                                    <Star size={12} fill="#fdcb6e" /> 4.8
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#a0a0b0', marginTop: '5px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {p.distance.toFixed(1)}km away</span>
                            </div>
                        </div>
                        <button
                            className="btn-primary"
                            style={{ padding: '8px 15px', borderRadius: '8px', fontSize: '12px' }}
                            onClick={() => setSelectedProvider(p)}
                        >
                            View
                        </button>
                    </div>
                ))}
            </div>

            <ProviderPublicProfileModal
                provider={selectedProvider}
                onClose={() => setSelectedProvider(null)}
                onBook={() => {
                    onBookProvider(selectedProvider);
                    setSelectedProvider(null);
                }}
            />
        </div>
    );
};

export default ProviderListPanel;
