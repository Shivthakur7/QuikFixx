import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import client from '../api/client';
import { User, DollarSign, Check, X, MapPin, Briefcase, Calendar } from 'lucide-react-native';
import * as Location from 'expo-location';

const ProviderDashboardScreen = ({ navigation }: any) => {
    const { user, logout } = useAuth();
    const { socket } = useSocket();
    const { showToast } = useToast();
    const [balance, setBalance] = useState(0);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [otpInputs, setOtpInputs] = useState<{ [key: string]: string }>({});
    const [locationPermission, setLocationPermission] = useState(false);

    useEffect(() => {
        requestLocationPermission();
        loadData();

        if (socket) {
            socket.on('booking.new', (data: any) => {
                showToast(`New Job: ${data.serviceType}`, 'success');
                setBookings(prev => [data, ...prev]);
            });

            return () => { socket.off('booking.new'); };
        }
    }, [socket]);

    const requestLocationPermission = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                setLocationPermission(true);
                showToast('Location access granted', 'success');
            } else {
                Alert.alert(
                    'Location Required',
                    'Location permission is needed to track your position for customers.',
                    [{ text: 'OK' }]
                );
            }
        } catch (err) {
            console.error('Location permission error:', err);
        }
    };

    // Location broadcasting for active jobs
    useEffect(() => {
        if (!socket || !locationPermission) return;
        let subscription: Location.LocationSubscription | null = null;

        const activeBookings = bookings.filter(b => b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS');

        if (activeBookings.length > 0) {
            (async () => {
                subscription = await Location.watchPositionAsync(
                    { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
                    (location) => {
                        activeBookings.forEach(booking => {
                            socket.emit('updateLocation', {
                                bookingId: booking.id,
                                lat: location.coords.latitude,
                                lng: location.coords.longitude
                            });
                        });
                    }
                );
            })();
        }

        return () => {
            if (subscription) subscription.remove();
        };
    }, [socket, bookings, locationPermission]);

    const loadData = async () => {
        try {
            const [bookingsRes, profileRes] = await Promise.all([
                client.get('/bookings/provider/requests'),
                client.get('/auth/profile')
            ]);
            setBookings(bookingsRes.data);
            if (profileRes.data?.provider) {
                setBalance(Number(profileRes.data.provider.balance || 0));
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to load data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (bookingId: string, status: 'ACCEPTED' | 'CANCELLED') => {
        try {
            await client.post(`/bookings/${bookingId}/status`, { status });
            showToast(`Booking ${status.toLowerCase()}`, 'success');
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
        } catch (err) {
            showToast('Failed to update status', 'error');
        }
    };

    const handleOtpChange = (bookingId: string, value: string) => {
        setOtpInputs(prev => ({ ...prev, [bookingId]: value }));
    };

    const verifyOtp = async (bookingId: string, type: 'start' | 'end') => {
        const otp = otpInputs[bookingId];
        if (!otp) return showToast('Please enter OTP', 'error');

        try {
            await client.post(`/bookings/${bookingId}/verify-${type}-otp`, { otp });
            showToast(`${type === 'start' ? 'Job Started' : 'Job Completed'} Successfully`, 'success');
            loadData();
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Invalid OTP', 'error');
        }
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

    const renderBooking = ({ item }: any) => (
        <View style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
                <Text style={styles.serviceType}>{item.serviceType}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
            </View>

            {/* Customer Info */}
            <View style={styles.infoRow}>
                <User size={14} color="#a0a0b0" />
                <Text style={styles.infoText}>{item.user?.fullName || item.customer?.fullName || 'Customer'}</Text>
            </View>

            {item.user?.phone && (
                <View style={styles.infoRow}>
                    <Text style={styles.phoneText}>📞 {item.user.phone}</Text>
                </View>
            )}

            <View style={styles.infoRow}>
                <Calendar size={14} color="#a0a0b0" />
                <Text style={styles.infoText}>
                    {new Date(item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </Text>
            </View>

            <View style={styles.priceRow}>
                <DollarSign size={16} color="#00cec9" />
                <Text style={styles.price}>₹{item.priceFinal || item.priceEstimated}</Text>
            </View>

            {/* Action Buttons for PENDING */}
            {item.status === 'PENDING' && (
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={() => handleStatusUpdate(item.id, 'ACCEPTED')}
                    >
                        <Check size={18} color="white" />
                        <Text style={styles.actionButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleStatusUpdate(item.id, 'CANCELLED')}
                    >
                        <X size={18} color="white" />
                        <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* OTP Input for ACCEPTED */}
            {item.status === 'ACCEPTED' && (
                <View style={styles.otpSection}>
                    <Text style={styles.otpLabel}>Enter Customer's Start OTP:</Text>
                    <View style={styles.otpRow}>
                        <TextInput
                            style={styles.otpInput}
                            placeholder="OTP"
                            placeholderTextColor="#666"
                            value={otpInputs[item.id] || ''}
                            onChangeText={(v) => handleOtpChange(item.id, v)}
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                        <TouchableOpacity
                            style={styles.verifyButton}
                            onPress={() => verifyOtp(item.id, 'start')}
                        >
                            <Text style={styles.verifyButtonText}>Start</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* OTP Input for IN_PROGRESS */}
            {item.status === 'IN_PROGRESS' && (
                <View style={styles.otpSection}>
                    <Text style={styles.otpLabel}>Enter Completion OTP:</Text>
                    <View style={styles.otpRow}>
                        <TextInput
                            style={styles.otpInput}
                            placeholder="OTP"
                            placeholderTextColor="#666"
                            value={otpInputs[item.id] || ''}
                            onChangeText={(v) => handleOtpChange(item.id, v)}
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                        <TouchableOpacity
                            style={[styles.verifyButton, { backgroundColor: '#27ae60' }]}
                            onPress={() => verifyOtp(item.id, 'end')}
                        >
                            <Text style={styles.verifyButtonText}>Complete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Gradient Header - Matching Web */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.headerTitle}>Dashboard</Text>
                        <Text style={styles.headerSubtitle}>
                            Welcome back, {user?.fullName?.split(' ')[0] || 'Partner'}!
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => navigation.navigate('ProviderAccount')}
                    >
                        <User size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Quick Stats - Matching Web */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Earnings</Text>
                        <Text style={styles.statValue}>₹{balance.toFixed(2)}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Jobs</Text>
                        <Text style={styles.statValue}>{bookings.length}</Text>
                    </View>
                </View>
            </View>

            {/* Bookings List */}
            <Text style={styles.sectionTitle}>Active Jobs</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#6c5ce7" style={{ marginTop: 30 }} />
            ) : (
                <FlatList
                    data={bookings}
                    renderItem={renderBooking}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Briefcase size={48} color="#666" />
                            <Text style={styles.emptyText}>No active jobs right now</Text>
                            <Text style={styles.emptySubtext}>Wait for customers to request your services</Text>
                        </View>
                    }
                />
            )}

            {/* Logout FAB */}
            <TouchableOpacity style={styles.logoutFab} onPress={logout}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#13131f' },

    // Header - Gradient style matching web
    header: {
        padding: 20, paddingTop: 10, paddingBottom: 25,
        backgroundColor: '#6c5ce7',
        borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
        marginBottom: 20
    },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 26, fontWeight: 'bold', color: 'white' },
    headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    profileButton: {
        width: 44, height: 44, borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center'
    },

    // Stats Cards
    statsRow: { flexDirection: 'row', gap: 15, marginTop: 20 },
    statCard: {
        flex: 1, backgroundColor: 'rgba(255,255,255,0.15)',
        padding: 15, borderRadius: 16
    },
    statLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
    statValue: { color: 'white', fontSize: 22, fontWeight: 'bold', marginTop: 5 },

    sectionTitle: {
        color: 'white', fontSize: 18, fontWeight: 'bold',
        paddingHorizontal: 20, marginBottom: 15
    },

    // Booking Card
    bookingCard: {
        backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 15, marginBottom: 15,
        borderLeftWidth: 4, borderLeftColor: '#6c5ce7'
    },
    bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    serviceType: { color: 'white', fontSize: 16, fontWeight: 'bold', flex: 1 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: 'bold' },

    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    infoText: { color: '#a0a0b0', marginLeft: 8, fontSize: 13 },
    phoneText: { color: 'white', fontSize: 13 },

    priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    price: { color: '#00cec9', fontWeight: 'bold', fontSize: 18, marginLeft: 5 },

    actionRow: { flexDirection: 'row', gap: 10, marginTop: 15 },
    actionButton: {
        flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        padding: 12, borderRadius: 12
    },
    acceptButton: { backgroundColor: '#27ae60' },
    rejectButton: { backgroundColor: '#e74c3c' },
    actionButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 5 },

    otpSection: { marginTop: 15, padding: 12, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 12 },
    otpLabel: { color: '#a0a0b0', fontSize: 12, marginBottom: 8 },
    otpRow: { flexDirection: 'row', gap: 10 },
    otpInput: {
        flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10,
        padding: 12, color: 'white', fontSize: 18, textAlign: 'center', letterSpacing: 5
    },
    verifyButton: { backgroundColor: '#6c5ce7', paddingHorizontal: 20, borderRadius: 10, justifyContent: 'center' },
    verifyButtonText: { color: 'white', fontWeight: 'bold' },

    emptyContainer: { alignItems: 'center', padding: 40 },
    emptyText: { color: '#666', fontSize: 16, marginTop: 15 },
    emptySubtext: { color: '#555', fontSize: 13, marginTop: 5, textAlign: 'center' },

    logoutFab: {
        position: 'absolute', bottom: 30, right: 20,
        backgroundColor: 'rgba(231, 76, 60, 0.9)', paddingVertical: 12, paddingHorizontal: 25,
        borderRadius: 25
    },
    logoutText: { color: 'white', fontWeight: 'bold' }
});

export default ProviderDashboardScreen;
