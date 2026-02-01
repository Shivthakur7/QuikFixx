import React, { useState, useEffect } from 'react';
// Map Removed
import { User, Briefcase, MapPin, Crosshair, ArrowLeft, Star } from 'lucide-react';
import api from '../utils/api';
import ProviderPublicProfileModal from '../components/ProviderPublicProfileModal';
import SubServiceSelectionModal from '../components/SubServiceSelectionModal';
import { useSocket } from '../context/SocketContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

import { SERVICES_LIST } from '../constants/services';

const servicesList = SERVICES_LIST;

const HomePage: React.FC = () => {
    const { user } = useAuth();
    const [position, setPosition] = useState<[number, number]>([26.2183, 78.1828]); // Gwalior Default
    const [addressText, setAddressText] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);

    // View State: 'dashboard' | 'map'
    const [viewMode, setViewMode] = useState<'dashboard' | 'map'>('dashboard');

    const [providers, setProviders] = useState<any[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<any>(null);

    const { socket } = useSocket();
    const { showToast } = useToast();
    const location = useLocation();
    const navigate = useNavigate();

    // Auto-select from Landing Page or URL and Auto-Detect Location
    useEffect(() => {
        if (location.state && location.state.service) {
            handleServiceSelect(location.state.service); // This triggers map view
        } else {
            // If just landing on dashboard, try to detect location
            detectLocation();
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
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    setPosition([lat, lng]);

                    // Reverse Geocode
                    setAddressText("Fetching address...");
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                        .then(res => res.json())
                        .then(data => {
                            setAddressText(data.display_name);
                            showToast("Location detected successfully", "success");
                        })
                        .catch(err => {
                            console.error(err);
                            setAddressText(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                            showToast("Address fetch failed, using coordinates", "info");
                        });
                },
                (err) => {
                    console.error(err);
                    showToast("Location access denied. Using default.", "error");
                }
            );
        }
    };



    const [selectedServiceForModal, setSelectedServiceForModal] = useState<any>(null);
    const [bookingDetails, setBookingDetails] = useState<{ items: any[], price: number }>({ items: [], price: 0 });

    const handleServiceSelect = (serviceId: string) => {
        const service = servicesList.find(s => s.id === serviceId);
        if (service && service.subServices && service.subServices.length > 0) {
            setSelectedServiceForModal(service);
        } else {
            // Legacy/No-sub-service flow
            startProviderSearch(serviceId, [], 500);
        }
    };

    const handleSubServiceConfirm = (selectedItems: any[], totalPrice: number) => {
        if (!selectedServiceForModal) return;

        startProviderSearch(selectedServiceForModal.id, selectedItems, totalPrice);
        setSelectedServiceForModal(null);
    };

    const startProviderSearch = async (serviceId: string, items: any[], price: number) => {
        setBookingDetails({ items, price });
        setViewMode('map');

        // Trigger search immediately
        try {
            const res = await api.post('/providers/search', {
                serviceType: serviceId,
                lat: position[0],
                lng: position[1]
            });
            console.log('Search Result:', res.data);

            if (res.data.length > 0) {
                // Stamp the serviceType onto each provider result so we know what they were searched for
                const providersWithService = res.data.map((p: any) => ({
                    ...p,
                    serviceType: serviceId
                }));
                setProviders(providersWithService);
                showToast(`Found ${res.data.length} providers nearby!`, 'success');
            } else {
                setProviders([]);
                showToast('No providers found nearby for ' + serviceId, 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to search providers', 'error');
        }
    };

    const handleBookProvider = async (provider: any) => {
        try {
            console.log('Booking Provider Object:', provider);
            // provider.providerId is from the search result (which came from Redis/Dispatch logic)
            // Wait, search results from dispatch.service have { providerId: '...' }
            await api.post('/bookings', {
                serviceType: provider.serviceType || 'general', // You might need to track selectedServiceId better
                location: { lat: position[0], lng: position[1] },
                address: addressText, // Send selected address
                providerId: provider.providerEntityId, // Use the actual Provider ID
                items: bookingDetails.items,
                price: bookingDetails.price
            });
            showToast('Booking request sent to ' + (provider.name || 'provider'), 'success');
            navigate('/account');
            setProviders([]);
            setViewMode('dashboard');
            setBookingDetails({ items: [], price: 0 });
        } catch (err) {
            console.error(err);
            showToast('Failed to book provider', 'error');
        }
    };

    return (
        <div className="app-container">
            {/* Modal */}
            {selectedServiceForModal && (
                <SubServiceSelectionModal
                    serviceName={selectedServiceForModal.name}
                    subServices={selectedServiceForModal.subServices || []}
                    onClose={() => setSelectedServiceForModal(null)}
                    onConfirm={handleSubServiceConfirm}
                />
            )}

            {/* --- DASHBOARD VIEW --- */}
            {viewMode === 'dashboard' && (
                <div className="landing-container">
                    {/* Hero Section */}
                    <div className="hero-section">
                        <div className="hero-visual blobs">
                            <div className="blob blob-1"></div>
                            <div className="blob blob-2"></div>
                        </div>

                        <div className="hero-content">
                            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', width: '100%', position: 'absolute', top: '20px', left: 0, padding: '0 20px', boxSizing: 'border-box' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
                                        <span style={{ fontSize: '20px' }}>⚡</span>
                                    </div>
                                </div>
                                <div onClick={() => navigate('/account')} style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(5px)' }}>
                                    <User size={20} color="white" />
                                </div>
                            </div>

                            <h1 className="hero-title">
                                Fix it <span className="text-gradient">Fast.</span>
                            </h1>
                            <p className="hero-subtitle">
                                Hello, {user?.fullName?.split(' ')[0] || 'User'}! <br />
                                Expert services at your doorstep.
                            </p>

                            {/* Search Bar - Floating */}
                            <div style={{ position: 'relative', maxWidth: '500px', margin: '0 auto', width: '100%' }}>
                                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', padding: '15px 20px', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.2)' }}>
                                    <MapPin size={20} color="#00cec9" style={{ marginRight: '15px' }} />
                                    <input
                                        type="text"
                                        placeholder="Set your location..."
                                        value={addressText}
                                        onChange={(e) => {
                                            setAddressText(e.target.value);
                                            if (e.target.value.length > 2) {
                                                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${e.target.value}&limit=5&addressdetails=1&countrycodes=in`)
                                                    .then(res => res.json())
                                                    .then(data => {
                                                        console.log('Suggestions:', data);
                                                        setSuggestions(data);
                                                    })
                                                    .catch(err => console.error(err));
                                            } else {
                                                setSuggestions([]);
                                            }
                                        }}
                                        style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none', fontSize: '16px' }}
                                    />
                                    <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)', margin: '0 15px' }}></div>
                                    <Crosshair size={20} style={{ cursor: 'pointer', color: '#a0a0b0' }} onClick={detectLocation} />
                                </div>

                                {/* Suggestions Dropdown */}
                                {suggestions.length > 0 && (
                                    <div className="glass-card" style={{
                                        position: 'absolute', top: '120%', left: 0, right: 0,
                                        zIndex: 2000, borderRadius: '16px',
                                        maxHeight: '250px', overflowY: 'auto', background: '#13131f'
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
                                                    padding: '12px 20px',
                                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                    cursor: 'pointer', fontSize: '14px', color: '#dfe6e9'
                                                }}
                                            >
                                                {s.display_name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Services Section */}
                    <div className="services-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '20px' }}>
                            <h3 className="section-title" style={{ textAlign: 'left', margin: 0, fontSize: '1.5rem' }}>Categories</h3>
                            <span style={{ color: 'var(--color-accent)', fontSize: '14px', cursor: 'pointer' }}>See all</span>
                        </div>

                        <div className="services-grid">
                            {servicesList.map(s => (
                                <div
                                    key={s.id}
                                    className="service-card"
                                    onClick={() => handleServiceSelect(s.id)}
                                >
                                    <div className="icon-wrapper" style={{ background: 'rgba(108, 92, 231, 0.1)' }}>
                                        {/* Dynamic Icon Mapping could go here, for now using Briefcase generically/colored */}
                                        <Briefcase size={24} color="#6c5ce7" />
                                    </div>
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{s.name}</h4>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#a0a0b0', lineHeight: '1.4' }}>{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- PROVIDER LIST VIEW (formerly Map) --- */}
            {viewMode === 'map' && (
                <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', paddingBottom: '20px' }}>
                    {/* Header */}
                    <div style={{
                        padding: '20px',
                        display: 'flex', alignItems: 'center', gap: '15px',
                        background: 'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url("https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Gwalior_Fort_View.jpg/1200px-Gwalior_Fort_View.jpg")',
                        backgroundSize: 'cover',
                        borderBottomLeftRadius: '24px',
                        borderBottomRightRadius: '24px',
                        marginBottom: '20px'
                    }}>
                        <button onClick={() => setViewMode('dashboard')} style={{ background: 'rgba(255,255,255,0.2)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', color: 'white' }}>
                            <ArrowLeft size={20} />
                        </button>
                        <h2 style={{ margin: 0 }}>Available Providers</h2>
                    </div>

                    {/* Providers Grid */}
                    <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {providers.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#a0a0b0', padding: '40px 0' }}>
                                <p>No providers found nearby.</p>
                                <button onClick={() => setViewMode('dashboard')} className="btn-primary" style={{ marginTop: '10px' }}>Try another service</button>
                            </div>
                        ) : (
                            providers.map((p, i) => (
                                <div key={i} className="glass-card" style={{
                                    padding: '15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px'
                                }}>
                                    <div style={{
                                        width: '60px', height: '60px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #a29bfe, #6c5ce7)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '24px', fontWeight: 'bold'
                                    }}>
                                        {p.name ? p.name.charAt(0) : <User color="white" />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <h4 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{p.name || 'Service Professional'}</h4>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fdcb6e', fontSize: '14px', fontWeight: 'bold' }}>
                                                <Star size={14} fill="#fdcb6e" /> 4.8
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#a0a0b0' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {p.distance?.toFixed(1) || 0}km away</span>
                                        </div>
                                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#a0a0b0' }}>
                                            {p.skillTags?.slice(0, 3).join(', ') || 'General Service'}
                                        </p>
                                    </div>
                                    <button
                                        className="btn-primary"
                                        style={{ padding: '8px 20px', borderRadius: '12px', fontSize: '14px' }}
                                        onClick={() => setSelectedProvider(p)}
                                    >
                                        View
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Modal */}
            {selectedProvider && (
                <ProviderPublicProfileModal
                    provider={selectedProvider}
                    onClose={() => setSelectedProvider(null)}
                    onBook={() => handleBookProvider(selectedProvider)}
                />
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
