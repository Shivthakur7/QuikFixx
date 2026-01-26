import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { User, Briefcase, MapPin, Crosshair, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import { Icon } from 'leaflet';
import ProviderListPanel from '../components/ProviderListPanel';
import { useSocket } from '../context/SocketContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Fix Leaflet Default Icon
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = new Icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const servicesList = [
    { id: 'electrician', name: 'Electrician', desc: 'Wiring, repairs, and installations.' },
    { id: 'plumber', name: 'Plumber', desc: 'Pipe fixes, leaks, and fittings.' },
    { id: 'carpenter', name: 'Carpenter', desc: 'Furniture repair and custom woodworks.' },
    { id: 'painter', name: 'Painter', desc: 'Wall painting, textures, and finishes.' },
    { id: 'mason', name: 'Mason', desc: 'Construction, tiling, and concrete work.' },
    { id: 'gardener', name: 'Gardener', desc: 'Lawn care, planting, and maintenance.' },
    { id: 'cook', name: 'Cook', desc: 'Home-cooked meals and culinary services.' },
    { id: 'maid', name: 'Maid', desc: 'House cleaning and organizing.' },
    { id: 'tutor', name: 'Home Tutor', desc: 'Private lessons for K-12 and more.' },
    { id: 'mechanic', name: 'Mechanic', desc: 'Car and bike repairs at your doorstep.' },
];

const HomePage: React.FC = () => {
    const { user } = useAuth();
    const [position, setPosition] = useState<[number, number]>([26.2183, 78.1828]); // Gwalior Default
    const [addressText, setAddressText] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);

    // View State: 'dashboard' | 'map'
    const [viewMode, setViewMode] = useState<'dashboard' | 'map'>('dashboard');

    const [providers, setProviders] = useState<any[]>([]);

    const { socket } = useSocket();
    const { showToast } = useToast();
    const location = useLocation();
    const navigate = useNavigate();

    // Auto-select from Landing Page
    useEffect(() => {
        if (location.state && location.state.service) {
            handleServiceSelect(location.state.service);
        }
    }, [location]);

    // Socket Listener
    useEffect(() => {
        if (!socket) return;
        socket.on('booking.new', (data: any) => {
            showToast(`New Booking Request! Service: ${data.serviceType}, Price: ${data.price}`, 'info');
        });
        return () => {
            socket.off('booking.new');
        };
    }, [socket]);

    const detectLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setPosition([pos.coords.latitude, pos.coords.longitude]);
                    setAddressText("Current Location Detected");
                    showToast("Location detected successfully", "success");
                },
                (err) => {
                    console.error(err);
                    showToast("Location access denied. Using default.", "error");
                }
            );
        }
    };

    const handleServiceSelect = async (serviceId: string) => {
        setViewMode('map');

        // Trigger search immediately
        try {
            const res = await api.post('/bookings', {
                serviceType: serviceId,
                location: { lat: position[0], lng: position[1] }
            });
            console.log('Dispatch Result:', res.data);

            if (res.data.dispatch.candidates.length > 0) {
                setProviders(res.data.dispatch.candidates);
                showToast(`Found ${res.data.dispatch.candidates.length} providers nearby!`, 'success');
            } else {
                setProviders([]);
                showToast('No providers found nearby for ' + serviceId, 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to search providers', 'error');
        }
    };

    return (
        <div className="app-container">
            {/* --- DASHBOARD VIEW --- */}
            {viewMode === 'dashboard' && (
                <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px', background: 'var(--color-bg-primary)' }}>
                    {/* Header & Location */}
                    <div style={{
                        padding: '20px',
                        background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url("https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Gwalior_Fort_View.jpg/1200px-Gwalior_Fort_View.jpg")',
                        backgroundSize: 'cover',
                        borderBottomLeftRadius: '24px',
                        borderBottomRightRadius: '24px',
                        marginBottom: '20px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h2 style={{ margin: 0 }}>Hello, {user?.fullName?.split(' ')[0] || 'User'} 👋</h2>
                                <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>What needs fixing today?</p>
                            </div>
                            <div onClick={() => navigate('/account')} style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <User size={20} />
                            </div>
                        </div>

                        {/* Location Search Bar */}
                        <div style={{ position: 'relative' }}>
                            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', padding: '10px 15px' }}>
                                <MapPin size={18} color="var(--color-accent)" style={{ marginRight: '10px' }} />
                                <input
                                    type="text"
                                    placeholder="Your Location (Gwalior)"
                                    value={addressText}
                                    onChange={(e) => {
                                        setAddressText(e.target.value);
                                        if (e.target.value.length > 2) {
                                            // Bias search to Gwalior
                                            const query = e.target.value.toLowerCase().includes('gwalior')
                                                ? e.target.value
                                                : `${e.target.value}, Gwalior`;

                                            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`)
                                                .then(res => res.json())
                                                .then(data => setSuggestions(data))
                                                .catch(err => console.error(err));
                                        } else {
                                            setSuggestions([]);
                                        }
                                    }}
                                    style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none' }}
                                />
                                <Crosshair size={18} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={detectLocation} />
                            </div>

                            {/* Suggestions Dropdown */}
                            {suggestions.length > 0 && (
                                <div className="glass-card" style={{
                                    position: 'absolute', top: '100%', left: 0, right: 0,
                                    zIndex: 2000, marginTop: '5px', borderRadius: '12px',
                                    maxHeight: '200px', overflowY: 'auto', background: 'var(--color-bg-secondary)'
                                }}>
                                    {suggestions.map((s: any, i) => (
                                        <div
                                            key={i}
                                            onClick={() => {
                                                setAddressText(s.display_name);
                                                setPosition([parseFloat(s.lat), parseFloat(s.lon)]);
                                                setSuggestions([]);
                                            }}
                                            style={{
                                                padding: '10px 15px',
                                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                cursor: 'pointer', fontSize: '12px'
                                            }}
                                        >
                                            {s.display_name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Services Grid */}
                    <div style={{ padding: '0 20px' }}>
                        <h3 style={{ marginBottom: '15px' }}>Our Services</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            {servicesList.map(s => (
                                <div
                                    key={s.id}
                                    className="glass-card"
                                    onClick={() => handleServiceSelect(s.id)}
                                    style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px', cursor: 'pointer' }}
                                >
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(108, 92, 231, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a29bfe' }}>
                                        <Briefcase size={20} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{s.name}</h4>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#a0a0b0', lineHeight: '1.4' }}>{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- MAP VIEW --- */}
            {viewMode === 'map' && (
                <div style={{ height: '100vh', position: 'relative' }}>
                    {/* Back Button */}
                    <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1000 }}>
                        <button onClick={() => setViewMode('dashboard')} className="glass-card" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', color: 'white' }}>
                            <ArrowLeft size={20} />
                        </button>
                    </div>

                    <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        <Marker position={position} icon={DefaultIcon}>
                            <Popup>Your Location</Popup>
                        </Marker>
                    </MapContainer>

                    {/* Provider List */}
                    {providers.length > 0 && (
                        <ProviderListPanel
                            providers={providers}
                            onClose={() => setViewMode('dashboard')}
                        />
                    )}
                </div>
            )}

            {/* Bottom Nav (Visible only on Dashboard) */}
            {viewMode === 'dashboard' && (
                <div style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    background: '#13131f', borderTop: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', justifyContent: 'space-around', padding: '15px'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-accent)', cursor: 'pointer' }}>
                        <Briefcase size={20} />
                        <span style={{ fontSize: '10px', marginTop: '4px' }}>Services</span>
                    </div>
                    <div
                        onClick={() => navigate('/account')}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#a0a0b0', cursor: 'pointer' }}
                    >
                        <User size={20} />
                        <span style={{ fontSize: '10px', marginTop: '4px' }}>Account</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;
