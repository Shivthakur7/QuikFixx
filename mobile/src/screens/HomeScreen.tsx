import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { SERVICES_LIST } from '../constants/services';
import { User, MapPin, Navigation } from 'lucide-react-native';
import * as Location from 'expo-location';

const HomeScreen = ({ navigation }: any) => {
    const { user } = useAuth();
    const [locationText, setLocationText] = useState('Detecting location...');
    const [hasLocation, setHasLocation] = useState(false);

    useEffect(() => {
        requestLocationPermission();
    }, []);

    const requestLocationPermission = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Location Required',
                    'Please enable location to find nearby service providers.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Try Again', onPress: requestLocationPermission }
                    ]
                );
                setLocationText('Location access denied');
                return;
            }

            setLocationText('Getting location...');
            const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });

            // Reverse geocode to get address
            try {
                const geocode = await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });

                if (geocode && geocode.length > 0) {
                    const addr = geocode[0];
                    const displayAddr = [addr.street, addr.city, addr.region].filter(Boolean).join(', ');
                    setLocationText(displayAddr || `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`);
                } else {
                    setLocationText(`${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`);
                }
            } catch (geocodeErr) {
                setLocationText(`${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`);
            }

            setHasLocation(true);
        } catch (err) {
            console.error('Location error:', err);
            setLocationText('Unable to get location');
        }
    };

    const renderServiceItem = ({ item }: any) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('SubServiceSelection', { serviceId: item.id })}
        >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <item.icon size={28} color={item.color} />
            </View>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDesc} numberOfLines={2}>{item.desc}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello, {user?.fullName?.split(' ')[0] || 'User'}!</Text>
                    <Text style={styles.subGreeting}>What do you need help with?</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Account')} style={styles.profileButton}>
                    <User size={20} color="white" />
                </TouchableOpacity>
            </View>

            {/* Services Grid */}
            <FlatList
                data={SERVICES_LIST}
                renderItem={renderServiceItem}
                keyExtractor={item => item.id}
                numColumns={2}
                contentContainerStyle={styles.grid}
                columnWrapperStyle={styles.row}
                ListHeaderComponent={() => (
                    <TouchableOpacity
                        style={[styles.locationBar, hasLocation && styles.locationBarActive]}
                        onPress={requestLocationPermission}
                    >
                        <View style={styles.locationIcon}>
                            {hasLocation ? (
                                <Navigation size={18} color="#00cec9" />
                            ) : (
                                <MapPin size={18} color="#f39c12" />
                            )}
                        </View>
                        <Text style={[styles.locationText, hasLocation && styles.locationTextActive]}>
                            {locationText}
                        </Text>
                        {!hasLocation && (
                            <Text style={styles.tapHint}>Tap to enable</Text>
                        )}
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#13131f' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    greeting: { fontSize: 24, fontWeight: 'bold', color: 'white' },
    subGreeting: { fontSize: 14, color: '#a0a0b0' },
    profileButton: {
        padding: 12, backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 14, width: 44, height: 44, justifyContent: 'center', alignItems: 'center'
    },

    locationBar: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(243, 156, 18, 0.15)',
        padding: 15, borderRadius: 14, marginBottom: 20,
        borderWidth: 1, borderColor: 'rgba(243, 156, 18, 0.3)'
    },
    locationBarActive: {
        backgroundColor: 'rgba(0, 206, 201, 0.1)',
        borderColor: 'rgba(0, 206, 201, 0.3)'
    },
    locationIcon: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center', alignItems: 'center', marginRight: 12
    },
    locationText: { flex: 1, color: '#f39c12', fontSize: 14 },
    locationTextActive: { color: '#00cec9' },
    tapHint: { color: '#f39c12', fontSize: 12, opacity: 0.8 },

    grid: { padding: 20 },
    row: { justifyContent: 'space-between', marginBottom: 15 },
    card: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 15,
        width: '48%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    iconContainer: {
        width: 50, height: 50, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', marginBottom: 10
    },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: 'white', marginBottom: 5 },
    cardDesc: { fontSize: 12, color: '#a0a0b0' }
});

export default HomeScreen;
