import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Modal, Dimensions, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Clock, Star, Edit2, X, Navigation, Phone } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import client from '../api/client';
import RateProviderModal from '../components/RateProviderModal';
import EditProfileModal from '../components/EditProfileModal';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const AccountScreen = ({ navigation }: any) => {
    const { user, logout } = useAuth();
    const { socket } = useSocket();
    const { showToast } = useToast();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [ratingModalVisible, setRatingModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);

    // Tracking state
    const [trackingModalVisible, setTrackingModalVisible] = useState(false);
    const [trackingBooking, setTrackingBooking] = useState<any>(null);
    const [providerLocation, setProviderLocation] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    // Real-time provider location tracking
    useEffect(() => {
        if (!socket || !trackingBooking) return;

        console.log(`Joining booking room: ${trackingBooking.id}`);
        socket.emit('joinBooking', { bookingId: trackingBooking.id });

        const handleLocation = (data: any) => {
            console.log('Provider Location Update:', data);
            setProviderLocation({ lat: data.lat, lng: data.lng });
        };

        socket.on('provider.location', handleLocation);

        return () => {
            socket.off('provider.location', handleLocation);
        };
    }, [socket, trackingBooking]);

    const fetchBookings = async () => {
        try {
            const res = await client.get('/bookings/my');
            setBookings(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch bookings", err);
            showToast("Failed to load bookings", "error");
        } finally {
            setLoading(false);
        }
    };

    const startTracking = (booking: any) => {
        setTrackingBooking(booking);
        setProviderLocation(null);
        setTrackingModalVisible(true);
        showToast("Connecting to provider location...", "info");
    };

    const openMapsNavigation = () => {
        if (!providerLocation) return;
        const url = Platform.select({
            ios: `maps:0,0?q=${providerLocation.lat},${providerLocation.lng}`,
            android: `geo:${providerLocation.lat},${providerLocation.lng}?q=${providerLocation.lat},${providerLocation.lng}`
        });
        if (url) Linking.openURL(url);
    };

    const callProvider = (phone: string) => {
        Linking.openURL(`tel:${phone}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return '#f39c12';
            case 'ACCEPTED': return '#3498db';
            case 'IN_PROGRESS': return '#9b59b6';
            case 'COMPLETED': return '#27ae60';
            case 'CANCELLED': return '#e74c3c';
            default: return '#a0a0b0';
        }
    };

    // Generate map HTML using OpenStreetMap (works in WebView without native modules)
    const getMapHtml = (lat: number, lng: number) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                body { margin: 0; padding: 0; }
                #map { width: 100%; height: 100vh; }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                var map = L.map('map').setView([${lat}, ${lng}], 16);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap'
                }).addTo(map);
                var marker = L.marker([${lat}, ${lng}]).addTo(map);
                marker.bindPopup('<b>Provider</b><br>Current Location').openPopup();
            </script>
        </body>
        </html>
    `;

    const renderBooking = ({ item }: any) => (
        <View style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
                <Text style={styles.serviceType}>{item.serviceType}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
            </View>

            {item.provider?.user && (
                <View style={styles.providerInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{item.provider.user.fullName?.charAt(0) || 'P'}</Text>
                    </View>
                    <Text style={styles.providerName}>{item.provider.user.fullName}</Text>
                </View>
            )}

            <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                    <Clock size={14} color="#a0a0b0" />
                    <Text style={styles.detailText}>
                        {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                </View>
                <Text style={styles.price}>₹{item.priceFinal || item.priceEstimated}</Text>
            </View>

            {/* OTP Display for Active Bookings */}
            {item.status === 'ACCEPTED' && item.startJobOtp && (
                <View style={styles.otpContainer}>
                    <Text style={styles.otpLabel}>Start OTP (Share with Provider):</Text>
                    <Text style={styles.otpCode}>{item.startJobOtp}</Text>
                </View>
            )}

            {item.status === 'IN_PROGRESS' && item.endJobOtp && (
                <View style={styles.otpContainer}>
                    <Text style={styles.otpLabel}>Completion OTP:</Text>
                    <Text style={styles.otpCode}>{item.endJobOtp}</Text>
                </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionRow}>
                {(item.status === 'ACCEPTED' || item.status === 'IN_PROGRESS') && (
                    <TouchableOpacity
                        style={styles.trackButton}
                        onPress={() => startTracking(item)}
                    >
                        <MapPin size={16} color="white" />
                        <Text style={styles.trackButtonText}>Track Provider</Text>
                    </TouchableOpacity>
                )}

                {item.status === 'COMPLETED' && !item.hasReview && (
                    <TouchableOpacity
                        style={styles.rateButton}
                        onPress={() => {
                            setSelectedBooking(item);
                            setRatingModalVisible(true);
                        }}
                    >
                        <Star size={16} color="white" />
                        <Text style={styles.rateButtonText}>Rate</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    if (!user) return null;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Account</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileAvatar}>
                        <Text style={styles.profileInitial}>
                            {user.fullName ? user.fullName[0] : user.email[0].toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{user.fullName || 'User'}</Text>
                        <Text style={styles.profileEmail}>{user.email}</Text>
                        {user.phone && <Text style={styles.profilePhone}>{user.phone}</Text>}
                    </View>
                    <TouchableOpacity style={styles.editButton} onPress={() => setEditModalVisible(true)}>
                        <Edit2 size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Bookings Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>My Bookings</Text>

                    {loading ? (
                        <ActivityIndicator size="large" color="#6c5ce7" style={{ marginTop: 30 }} />
                    ) : bookings.length === 0 ? (
                        <Text style={styles.emptyText}>No bookings yet</Text>
                    ) : (
                        <FlatList
                            data={bookings}
                            renderItem={renderBooking}
                            keyExtractor={item => item.id}
                            scrollEnabled={false}
                        />
                    )}
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Tracking Modal with WebView Map */}
            <Modal visible={trackingModalVisible} animationType="slide">
                <SafeAreaView style={styles.trackingModalContainer}>
                    <View style={styles.trackingHeader}>
                        <TouchableOpacity onPress={() => { setTrackingModalVisible(false); setTrackingBooking(null); }}>
                            <X size={24} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.trackingTitle}>Tracking Provider</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    {trackingBooking && (
                        <View style={styles.trackingInfo}>
                            <Text style={styles.trackingServiceType}>{trackingBooking.serviceType}</Text>
                            {trackingBooking.provider?.user && (
                                <View style={styles.trackingProviderRow}>
                                    <Text style={styles.trackingProviderName}>
                                        {trackingBooking.provider.user.fullName}
                                    </Text>
                                    {trackingBooking.provider.user.phone && (
                                        <TouchableOpacity
                                            style={styles.callButton}
                                            onPress={() => callProvider(trackingBooking.provider.user.phone)}
                                        >
                                            <Phone size={16} color="white" />
                                            <Text style={styles.callButtonText}>Call</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>
                    )}

                    {/* Map View using WebView with Leaflet */}
                    <View style={styles.mapContainer}>
                        {providerLocation ? (
                            <WebView
                                source={{ html: getMapHtml(providerLocation.lat, providerLocation.lng) }}
                                style={styles.map}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                            />
                        ) : (
                            <View style={styles.waitingLocation}>
                                <ActivityIndicator size="large" color="#6c5ce7" />
                                <Text style={styles.waitingText}>Waiting for provider location...</Text>
                                <Text style={styles.waitingSubtext}>
                                    Provider will share location once they start moving
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Navigation Button */}
                    {providerLocation && (
                        <TouchableOpacity style={styles.navigateButton} onPress={openMapsNavigation}>
                            <Navigation size={20} color="white" />
                            <Text style={styles.navigateButtonText}>Open in Maps</Text>
                        </TouchableOpacity>
                    )}
                </SafeAreaView>
            </Modal>

            {/* Rating Modal */}
            {selectedBooking && (
                <RateProviderModal
                    visible={ratingModalVisible}
                    booking={selectedBooking}
                    onClose={() => { setRatingModalVisible(false); setSelectedBooking(null); }}
                    onSuccess={fetchBookings}
                />
            )}

            {/* Edit Profile Modal */}
            <EditProfileModal
                visible={editModalVisible}
                user={user}
                onClose={() => setEditModalVisible(false)}
                onSuccess={() => { fetchBookings(); }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#13131f' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)'
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },

    profileCard: {
        flexDirection: 'row', alignItems: 'center', padding: 20, margin: 20,
        backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16
    },
    profileAvatar: {
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: '#6c5ce7', justifyContent: 'center', alignItems: 'center'
    },
    profileInitial: { color: 'white', fontSize: 24, fontWeight: 'bold' },
    profileInfo: { flex: 1, marginLeft: 15 },
    profileName: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    profileEmail: { color: '#a0a0b0', fontSize: 14, marginTop: 2 },
    profilePhone: { color: '#a0a0b0', fontSize: 14, marginTop: 2 },
    editButton: { padding: 10 },

    section: { padding: 20 },
    sectionTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },

    bookingCard: {
        backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 15, marginBottom: 15,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
    },
    bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    serviceType: { color: 'white', fontSize: 16, fontWeight: 'bold', flex: 1 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 12, fontWeight: 'bold' },

    providerInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#3498db', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: 'white', fontWeight: 'bold' },
    providerName: { color: '#a0a0b0', marginLeft: 10 },

    bookingDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    detailRow: { flexDirection: 'row', alignItems: 'center' },
    detailText: { color: '#a0a0b0', marginLeft: 5, fontSize: 12 },
    price: { color: '#00cec9', fontWeight: 'bold', fontSize: 16 },

    otpContainer: {
        backgroundColor: 'rgba(108, 92, 231, 0.2)', padding: 10, borderRadius: 8, marginTop: 10
    },
    otpLabel: { color: '#a0a0b0', fontSize: 12 },
    otpCode: { color: '#6c5ce7', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginTop: 5 },

    actionRow: { flexDirection: 'row', marginTop: 15, gap: 10 },
    trackButton: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#3498db',
        paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, flex: 1, justifyContent: 'center'
    },
    trackButtonText: { color: 'white', marginLeft: 8, fontWeight: 'bold' },
    rateButton: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1c40f',
        paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8
    },
    rateButtonText: { color: 'black', marginLeft: 5, fontWeight: 'bold' },

    emptyText: { color: '#a0a0b0', textAlign: 'center', marginTop: 30 },

    logoutButton: {
        margin: 20, padding: 15, backgroundColor: 'rgba(231, 76, 60, 0.2)',
        borderRadius: 12, alignItems: 'center'
    },
    logoutText: { color: '#e74c3c', fontWeight: 'bold', fontSize: 16 },

    // Tracking Modal Styles
    trackingModalContainer: { flex: 1, backgroundColor: '#13131f' },
    trackingHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)'
    },
    trackingTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    trackingInfo: { padding: 20 },
    trackingServiceType: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    trackingProviderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
    trackingProviderName: { color: '#a0a0b0', fontSize: 16 },
    callButton: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#27ae60',
        paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8
    },
    callButtonText: { color: 'white', marginLeft: 5, fontWeight: 'bold' },

    mapContainer: { flex: 1, margin: 20, borderRadius: 16, overflow: 'hidden' },
    map: { flex: 1 },
    waitingLocation: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16 },
    waitingText: { color: 'white', fontSize: 16, marginTop: 20 },
    waitingSubtext: { color: '#a0a0b0', fontSize: 13, marginTop: 5, textAlign: 'center', paddingHorizontal: 30 },

    navigateButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#6c5ce7', margin: 20, padding: 15, borderRadius: 12
    },
    navigateButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});

export default AccountScreen;
