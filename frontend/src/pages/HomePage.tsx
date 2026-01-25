import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search } from 'lucide-react';
import api from '../utils/api';
import { Icon } from 'leaflet';
import BookingPanel from '../components/BookingPanel';
import { useSocket } from '../context/SocketContext';

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

const HomePage: React.FC = () => {
    const [position] = useState<[number, number]>([26.2183, 78.1828]); // Gwalior Default
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) {
            console.log('Socket not connected yet');
            return;
        }

        console.log('Setting up booking.new listener on socket:', socket.id);
        socket.on('booking.new', (data: any) => {
            console.log('EVENT RECEIVED: booking.new', data);
            alert(`New Booking Request! Service: ${data.serviceType}, Price: ${data.price}`);
        });

        return () => {
            console.log('Cleaning up listener');
            socket.off('booking.new');
        };
    }, [socket]);

    useEffect(() => {
        // navigator.geolocation.getCurrentPosition((pos) => {
        //    setPosition([pos.coords.latitude, pos.coords.longitude]);
        // });

        // Fetch Nearby Providers (Mock call or real if backend ready)
    }, []);

    const handleBookingRequest = async (serviceType: string) => {
        try {
            const res = await api.post('/bookings', {
                serviceType,
                location: { lat: position[0], lng: position[1] }
            });
            console.log('Dispatch Result:', res.data);
            // Show dispatch success UI
            alert(`Found ${res.data.dispatch.candidates.length} providers!`);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="app-container">
            <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', zIndex: 1000, display: 'flex', gap: '10px' }}>
                <div className="glass-card" style={{ flex: 1, padding: '10px 20px', display: 'flex', alignItems: 'center' }}>
                    <Search size={20} style={{ marginRight: '10px', color: 'var(--color-text-secondary)' }} />
                    <input type="text" placeholder="Where in Gwalior?" style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%' }} />
                </div>
                <button
                    className="btn-primary"
                    onClick={async () => {
                        try {
                            await api.post('/providers/onboard', { skills: ['electrician', 'plumber'] });
                            // Also set online and update location immediately for testing
                            await api.post('/providers/status', { isOnline: true });
                            await api.patch('/providers/location', { lat: 26.2183, lng: 78.1828 });
                            alert('You are now a Driver (Online)!');
                        } catch (e) {
                            alert('Incomplete or already registered.');
                            console.error(e);
                        }
                    }}
                    style={{ borderRadius: '12px', padding: '0 15px', height: '50px', fontSize: '12px', whiteSpace: 'nowrap' }}
                >
                    Become Driver
                </button>
                <button className="btn-primary" onClick={() => setIsBookingOpen(true)} style={{ borderRadius: '50%', width: '50px', height: '50px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <MapPin />
                </button>
            </div>

            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                <Marker position={position} icon={DefaultIcon}>
                    <Popup>You are here</Popup>
                </Marker>
            </MapContainer>

            {isBookingOpen && (
                <BookingPanel onClose={() => setIsBookingOpen(false)} onBook={handleBookingRequest} />
            )}
        </div>
    );
};

export default HomePage;
