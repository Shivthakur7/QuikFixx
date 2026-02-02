import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, MapPin, RefreshCw } from 'lucide-react-native';
import client from '../api/client';
import * as Location from 'expo-location';
import { useToast } from '../context/ToastContext';

const ProviderListScreen = ({ route, navigation }: any) => {
    const { serviceId, subServiceId, subServiceName, subServicePrice } = route.params;
    const { showToast } = useToast();
    const [providers, setProviders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        searchProviders();
    }, []);

    const searchProviders = async () => {
        setLoading(true);
        try {
            // Get Location
            let location;
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    setUserLocation({ lat: location.coords.latitude, lng: location.coords.longitude });
                }
            } catch (locErr) {
                console.log('Location error:', locErr);
            }

            // Search providers using POST /providers/search (matching web app)
            const searchPayload = {
                serviceType: serviceId,
                lat: location?.coords.latitude || 26.2183, // Default to Gwalior if no location
                lng: location?.coords.longitude || 78.1828
            };

            console.log('Searching providers with:', searchPayload);
            const res = await client.post('/providers/search', searchPayload);
            console.log('Search Result:', res.data);

            if (res.data && res.data.length > 0) {
                // Add serviceType to each provider for booking
                const providersWithService = res.data.map((p: any) => ({
                    ...p,
                    serviceType: serviceId
                }));
                setProviders(providersWithService);
                showToast(`Found ${res.data.length} providers nearby!`, 'success');
            } else {
                setProviders([]);
                showToast(`No providers found for ${serviceId}`, 'info');
            }
        } catch (err: any) {
            console.error('Provider search error:', err);
            showToast(err.response?.data?.message || 'Failed to search providers', 'error');
            setProviders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (provider: any) => {
        if (!userLocation) {
            Alert.alert(
                "Location Required",
                "Please enable location to book a service.",
                [{ text: "OK" }]
            );
            return;
        }

        setBooking(true);
        try {
            const serviceLabel = subServiceName ? `${serviceId}: ${subServiceName}` : serviceId;

            const payload = {
                serviceType: serviceLabel,
                providerId: provider.id,
                location: userLocation,
                price: subServicePrice || 500
            };

            console.log('Booking payload:', payload);
            await client.post('/bookings', payload);

            showToast(`Booking request sent to ${provider.user?.fullName || provider.fullName}!`, 'success');
            navigation.navigate('Home');
        } catch (err: any) {
            console.error("Booking Error", err);
            showToast(err.response?.data?.message || "Failed to book service", 'error');
        } finally {
            setBooking(false);
        }
    };

    const renderProvider = ({ item }: any) => {
        const providerName = item.user?.fullName || item.fullName || 'Provider';
        const rating = item.rating || 4.5;
        const reviewCount = item.reviewCount || 0;
        const distance = item.distance ? `${item.distance.toFixed(1)} km away` : 'Distance unknown';

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{providerName.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 15 }}>
                        <Text style={styles.providerName}>{providerName}</Text>
                        <View style={styles.ratingRow}>
                            <Star size={14} color="#f1c40f" fill="#f1c40f" />
                            <Text style={styles.ratingText}>{rating.toFixed(1)} ({reviewCount} reviews)</Text>
                        </View>
                        {item.bio && (
                            <Text style={styles.bioText} numberOfLines={2}>{item.bio}</Text>
                        )}
                    </View>
                    <Text style={styles.price}>₹{subServicePrice || 500}</Text>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.locationRow}>
                        <MapPin size={14} color="#a0a0b0" />
                        <Text style={styles.distanceText}>{distance}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.bookButton, booking && styles.bookButtonDisabled]}
                        onPress={() => handleBook(item)}
                        disabled={booking}
                    >
                        <Text style={styles.bookButtonText}>
                            {booking ? "Booking..." : "Book Now"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Available Providers</Text>
                    <Text style={styles.headerSubtitle}>{subServiceName || serviceId}</Text>
                </View>
                <TouchableOpacity onPress={searchProviders} style={styles.refreshButton}>
                    <RefreshCw size={20} color="white" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#6c5ce7" />
                    <Text style={styles.loadingText}>Searching for providers...</Text>
                </View>
            ) : (
                <FlatList
                    data={providers}
                    renderItem={renderProvider}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <MapPin size={48} color="#666" />
                            <Text style={styles.emptyText}>No providers found nearby</Text>
                            <Text style={styles.emptySubtext}>Try again later or expand your search area</Text>
                            <TouchableOpacity style={styles.retryButton} onPress={searchProviders}>
                                <RefreshCw size={16} color="white" />
                                <Text style={styles.retryButtonText}>Retry Search</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#13131f' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)'
    },
    backButton: { padding: 5 },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
    headerSubtitle: { fontSize: 12, color: '#a0a0b0', marginTop: 2 },
    refreshButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10 },

    list: { padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    loadingText: { color: '#a0a0b0', marginTop: 15 },
    emptyText: { color: 'white', fontSize: 18, marginTop: 20, fontWeight: 'bold' },
    emptySubtext: { color: '#a0a0b0', fontSize: 14, marginTop: 5, textAlign: 'center' },
    retryButton: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#6c5ce7',
        paddingVertical: 12, paddingHorizontal: 25, borderRadius: 12, marginTop: 20
    },
    retryButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },

    card: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
    avatarPlaceholder: {
        width: 50, height: 50, borderRadius: 25, backgroundColor: '#6c5ce7',
        justifyContent: 'center', alignItems: 'center'
    },
    avatarText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    providerName: { fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 4 },
    ratingRow: { flexDirection: 'row', alignItems: 'center' },
    ratingText: { color: '#a0a0b0', fontSize: 12, marginLeft: 5 },
    bioText: { color: '#888', fontSize: 12, marginTop: 4 },
    price: { fontSize: 18, fontWeight: 'bold', color: '#00cec9' },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    locationRow: { flexDirection: 'row', alignItems: 'center' },
    distanceText: { color: '#a0a0b0', marginLeft: 5, fontSize: 14 },
    bookButton: { backgroundColor: '#6c5ce7', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 12 },
    bookButtonDisabled: { opacity: 0.6 },
    bookButtonText: { color: 'white', fontWeight: 'bold' }
});

export default ProviderListScreen;
