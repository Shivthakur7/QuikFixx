import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { MapPin, Clock, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import RateProviderModal from '../components/RateProviderModal';
import EditProfileModal from '../components/EditProfileModal';

import { useSocket } from '../context/SocketContext';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + Vite/Webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const AccountPage: React.FC = () => {
    const { user, logout, login } = useAuth();
    const { socket } = useSocket();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [bookings, setBookings] = useState<any[]>([]);
    // Reusing isEditingAddress as the "Edit Profile" modal toggle for simplicity
    const [isEditingAddress, setIsEditingAddress] = useState(false);

    // Tracking State
    const [trackingBookingId, setTrackingBookingId] = useState<string | null>(null);
    const [providerLocation, setProviderLocation] = useState<{ lat: number, lng: number } | null>(null);

    // Rating State
    const [ratingBookingId, setRatingBookingId] = useState<string | null>(null);

    useEffect(() => {
        if (!socket || !trackingBookingId) return;

        console.log(`Joining booking room: ${trackingBookingId}`);
        socket.emit('joinBooking', { bookingId: trackingBookingId });

        const handleLocation = (data: any) => {
            console.log('Provider Location Update:', data);
            setProviderLocation({ lat: data.lat, lng: data.lng });
        };

        socket.on('provider.location', handleLocation);

        return () => {
            socket.off('provider.location', handleLocation);
        };
    }, [socket, trackingBookingId]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await api.get('/bookings/my');
                console.log('Bookings API Response:', res.data);
                setBookings(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Failed to fetch bookings", err);
                showToast("Failed to load your bookings", "error");
                setBookings([]);
            }
        };
        fetchBookings();
    }, []);

    if (!user) return <div style={{ padding: '20px' }}>Please login</div>;

    return (
        <div className="account-container" style={{
            minHeight: '100vh',
            background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url('https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Gwalior_Fort_View.jpg/1200px-Gwalior_Fort_View.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            padding: '20px',
            color: 'white'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', marginRight: '10px' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1>My Account</h1>
                </div>

                {/* Profile Card */}
                <div className="glass-card" style={{ padding: '30px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
                        {user.fullName ? user.fullName[0] : user.email[0].toUpperCase()}
                    </div>
                    <h2 style={{ margin: 0 }}>{user.fullName || 'User'}</h2>
                    <p style={{ color: '#a0a0b0', margin: '5px 0' }}>{user.email}</p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                        <MapPin size={16} color="#a0a0b0" />
                        <span style={{ color: '#dfe6e9', fontSize: '14px' }}>
                            {user.address || 'Location not set'}
                        </span>
                    </div>

                    <button
                        onClick={() => setIsEditingAddress(true)}
                        className="btn-primary"
                        style={{ marginTop: '15px', fontSize: '12px', padding: '6px 12px' }}
                    >
                        Edit Profile
                    </button>

                    <div style={{ marginTop: '10px' }}>
                        <button onClick={() => { logout(); navigate('/'); }} style={{ background: 'transparent', border: '1px solid #ff7675', color: '#ff7675', padding: '5px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
                            Logout
                        </button>
                    </div>

                </div>
            </div>

            {/* Bookings List */}
            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '20px' }}>My Bookings</h3>

            {bookings.length === 0 ? (
                <p style={{ color: '#a0a0b0', textAlign: 'center' }}>No bookings yet.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {bookings.map((booking: any) => (
                        <div key={booking.id}>
                            <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', textTransform: 'capitalize' }}>{booking.serviceType}</h4>
                                    <div style={{ display: 'flex', gap: '15px', color: '#a0a0b0', fontSize: '12px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {new Date(booking.createdAt).toLocaleDateString()}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {new Date(booking.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
                                        <MapPin size={12} color="#00cec9" /> {Number(booking.locationLat || 0).toFixed(4)}, {Number(booking.locationLng || 0).toFixed(4)}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#00cec9' }}>₹{booking.priceEstimated}</div>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '10px',
                                        background: booking.status === 'COMPLETED' ? 'rgba(0,206,201,0.2)' : 'rgba(253,203,110,0.2)',
                                        color: booking.status === 'COMPLETED' ? '#00cec9' : '#fdcb6e'
                                    }}>
                                        {booking.status}
                                    </span>
                                </div>
                            </div>
                            {/* Provider Details Section */}
                            {booking.status === 'ACCEPTED' && booking.provider && (
                                <div className="glass-card" style={{ marginTop: '10px', padding: '15px', background: 'rgba(108, 92, 231, 0.1)', border: '1px solid rgba(108, 92, 231, 0.3)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #a29bfe, #6c5ce7)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 'bold', color: 'white'
                                        }}>
                                            {booking.provider.user?.fullName?.[0] || 'P'}
                                        </div>
                                        <div>
                                            <h5 style={{ margin: 0, fontSize: '14px', color: 'white' }}>{booking.provider.user?.fullName || 'Provider Assigned'}</h5>
                                            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#a0a0b0' }}>
                                                Has accepted your request. They will arrive shortly.
                                            </p>
                                        </div>
                                        <div style={{ marginLeft: 'auto', textAlign: 'right', display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => setTrackingBookingId(booking.id)}
                                                className="btn-primary"
                                                style={{ fontSize: '12px', padding: '6px 12px', background: '#0984e3' }}
                                            >
                                                Track Live
                                            </button>
                                            <a href={`tel:${booking.provider.user?.phoneNumber || ''}`} style={{ textDecoration: 'none' }}>
                                                <button className="btn-primary" style={{ fontSize: '12px', padding: '6px 12px' }}>Call</button>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Rate Provider Button */}
                            {booking.status === 'COMPLETED' && (
                                <div style={{ marginTop: '10px', textAlign: 'right' }}>
                                    <button
                                        onClick={() => setRatingBookingId(booking.id)}
                                        className="btn-primary"
                                        style={{ fontSize: '12px', padding: '6px 12px', background: '#fdcb6e', color: '#2d3436', fontWeight: 'bold' }}
                                    >
                                        Rate Provider
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Rating Modal */}
            {ratingBookingId && (
                <RateProviderModal
                    bookingId={ratingBookingId}
                    onClose={() => setRatingBookingId(null)}
                    onSuccess={() => {
                        setRatingBookingId(null);
                        // Optionally refresh bookings or mark as reviewed locally
                    }}
                />
            )}
            {/* Live Tracking Map Modal (Simplified Inline for MVP) */}
            {/* Live Tracking Map Modal */}
            {/* Live Tracking Map Modal */}
            {trackingBookingId && (() => {
                const activeBooking = bookings.find(b => b.id === trackingBookingId);
                const customerLocation = activeBooking ? { lat: Number(activeBooking.locationLat), lng: Number(activeBooking.locationLng) } : null;

                // Component to fit bounds
                const FitBounds = ({ markers }: { markers: { lat: number, lng: number }[] }) => {
                    const map = useMap();
                    useEffect(() => {
                        if (markers.length > 0) {
                            const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
                            map.fitBounds(bounds, { padding: [50, 50] });
                        }
                    }, [markers, map]);
                    return null;
                };

                // Route Fetching Component
                const RoutePath = ({ start, end }: { start: { lat: number, lng: number }, end: { lat: number, lng: number } }) => {
                    const [positions, setPositions] = useState<[number, number][]>([]);

                    useEffect(() => {
                        const fetchRoute = async () => {
                            try {
                                // Using OSRM Public Demo API (Respect usage limits)
                                const response = await fetch(
                                    `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
                                );
                                const data = await response.json();
                                if (data.routes && data.routes.length > 0) {
                                    // OSRM returns [lon, lat], Leaflet needs [lat, lon]
                                    const coordinates = data.routes[0].geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
                                    setPositions(coordinates);
                                }
                            } catch (error) {
                                console.error("Failed to fetch route:", error);
                                // Fallback to straight line
                                setPositions([[start.lat, start.lng], [end.lat, end.lng]]);
                            }
                        };
                        fetchRoute();
                    }, [start.lat, start.lng, end.lat, end.lng]);

                    if (positions.length === 0) return null;
                    return <Polyline positions={positions} color="#00cec9" weight={5} opacity={0.7} />;
                };

                return (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.9)', zIndex: 3000,
                        display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e1e2e' }}>
                            <h3 style={{ margin: 0 }}>Live Tracking</h3>
                            <button onClick={() => setTrackingBookingId(null)} style={{ background: 'transparent', border: 'none', color: 'white' }}>Close</button>
                        </div>
                        <div style={{ flex: 1, position: 'relative' }}>
                            {providerLocation && customerLocation ? (
                                <MapContainer
                                    bounds={[
                                        [providerLocation.lat, providerLocation.lng],
                                        [customerLocation.lat, customerLocation.lng]
                                    ]}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />

                                    <RoutePath start={providerLocation} end={customerLocation} />

                                    {/* Provider Marker */}
                                    <Marker position={[providerLocation.lat, providerLocation.lng]}>
                                        <Popup>
                                            <strong>Provider</strong> <br /> On the way!
                                        </Popup>
                                    </Marker>

                                    {/* Customer Marker (Destination) */}
                                    <Marker position={[customerLocation.lat, customerLocation.lng]}>
                                        <Popup>
                                            <strong>You</strong> <br /> Destination
                                        </Popup>
                                    </Marker>

                                    <FitBounds markers={[providerLocation, customerLocation]} />
                                </MapContainer>
                            ) : (
                                <div style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%',
                                    background: '#2d3436'
                                }}>
                                    <h2 style={{ color: 'white' }}>
                                        {!providerLocation ? 'Waiting for provider location...' : 'Locating destination...'}
                                    </h2>
                                </div>
                            )}

                            {providerLocation && customerLocation && (() => {
                                // Haversine Formula for Distance
                                const R = 6371; // km
                                const dLat = (customerLocation.lat - providerLocation.lat) * Math.PI / 180;
                                const dLon = (customerLocation.lng - providerLocation.lng) * Math.PI / 180;
                                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                                    Math.cos(providerLocation.lat * Math.PI / 180) * Math.cos(customerLocation.lat * Math.PI / 180) *
                                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
                                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                                const distance = R * c; // in km

                                // Estimate Time (assuming 30 km/h average city speed)
                                const speed = 30;
                                const timeHours = distance / speed;
                                const timeMins = Math.ceil(timeHours * 60);

                                return (
                                    <div className="glass-card" style={{
                                        position: 'absolute', bottom: '30px', left: '20px', right: '20px',
                                        padding: '20px', background: 'rgba(30,30,46,0.95)', zIndex: 1000,
                                        borderTop: '4px solid #00cec9',
                                        boxShadow: '0 -10px 30px rgba(0,0,0,0.5)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                                    <div style={{ padding: '8px', background: 'rgba(0, 206, 201, 0.2)', borderRadius: '50%' }}>
                                                        <Clock size={20} color="#00cec9" />
                                                    </div>
                                                    <div>
                                                        <p style={{ margin: 0, fontSize: '12px', color: '#a0a0b0' }}>ESTIMATED ARRIVAL</p>
                                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
                                                            {timeMins < 1 ? 'Arriving now' : `${timeMins} min`}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#a0a0b0' }}>DISTANCE</p>
                                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
                                                    {distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(1)} km`}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar Visual */}
                                        <div style={{ marginTop: '15px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                background: 'linear-gradient(90deg, #00cec9, #81ecec)',
                                                animation: 'progress 2s infinite linear',
                                                transformOrigin: 'left'
                                            }} />
                                        </div>
                                        <style>{`
                                            @keyframes progress {
                                                0% { transform: scaleX(0); opacity: 0.5; }
                                                50% { transform: scaleX(0.5); opacity: 1; }
                                                100% { transform: scaleX(1); opacity: 0; }
                                            }
                                        `}</style>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                );
            })()}

            {isEditingAddress && (
                <EditProfileModal
                    currentUser={user}
                    onClose={() => setIsEditingAddress(false)}
                    onSuccess={() => setIsEditingAddress(false)}
                />
            )}
        </div>
    );
};

export default AccountPage; 
