import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, DollarSign, Award, Settings, Upload, CheckCircle, AlertTriangle, LogOut, Edit2 } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import client from '../api/client';
import EditProfileModal from '../components/EditProfileModal';
import * as DocumentPicker from 'expo-document-picker';

const ProviderAccountScreen = ({ navigation }: any) => {
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [providerData, setProviderData] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);

    useEffect(() => {
        loadProviderData();
    }, []);

    const loadProviderData = async () => {
        try {
            const [profileRes, reviewsRes] = await Promise.all([
                client.get('/auth/profile'),
                user?.provider?.id ? client.get(`/reviews/provider/${user.provider.id}`) : Promise.resolve({ data: [] })
            ]);

            setProviderData(profileRes.data);
            setReviews(reviewsRes.data || []);
        } catch (err) {
            console.error('Failed to load provider data', err);
            showToast('Failed to load profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDocumentUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true
            });

            if (result.canceled) return;

            const file = result.assets[0];
            const formData = new FormData();
            formData.append('file', {
                uri: file.uri,
                type: file.mimeType || 'application/octet-stream',
                name: file.name
            } as any);

            setUploading(true);
            await client.post('/providers/upload-verification', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showToast('Document uploaded! Verification pending.', 'success');
            loadProviderData();
        } catch (err) {
            console.error('Upload failed', err);
            showToast('Failed to upload document', 'error');
        } finally {
            setUploading(false);
        }
    };

    const getVerificationStatus = () => {
        const status = providerData?.provider?.verificationStatus || 'NOT_VERIFIED';
        switch (status) {
            case 'VERIFIED':
                return { color: '#27ae60', icon: CheckCircle, text: 'Verified' };
            case 'PENDING':
                return { color: '#f39c12', icon: AlertTriangle, text: 'Pending Review' };
            default:
                return { color: '#e74c3c', icon: AlertTriangle, text: 'Not Verified' };
        }
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0';

    const balance = providerData?.provider?.balance || 0;
    const verificationStatus = getVerificationStatus();
    const VerificationIcon = verificationStatus.icon;

    const renderReview = ({ item }: any) => (
        <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>{item.user?.fullName?.charAt(0) || 'C'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.reviewerName}>{item.user?.fullName || 'Customer'}</Text>
                    <View style={styles.starRow}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star
                                key={star}
                                size={14}
                                color="#f1c40f"
                                fill={star <= item.rating ? '#f1c40f' : 'transparent'}
                            />
                        ))}
                    </View>
                </View>
                <Text style={styles.reviewDate}>
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>
            </View>
            {item.comment && <Text style={styles.reviewComment}>{item.comment}</Text>}
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#6c5ce7" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Profile</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(true)}>
                    <Edit2 size={20} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {providerData?.fullName?.charAt(0) || 'P'}
                        </Text>
                    </View>
                    <Text style={styles.profileName}>{providerData?.fullName}</Text>
                    <Text style={styles.profileEmail}>{providerData?.email}</Text>
                    {providerData?.phone && (
                        <Text style={styles.profilePhone}>{providerData.phone}</Text>
                    )}

                    {/* Verification Badge */}
                    <View style={[styles.verificationBadge, { backgroundColor: verificationStatus.color + '20' }]}>
                        <VerificationIcon size={16} color={verificationStatus.color} />
                        <Text style={[styles.verificationText, { color: verificationStatus.color }]}>
                            {verificationStatus.text}
                        </Text>
                    </View>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <DollarSign size={24} color="#00cec9" />
                        <Text style={styles.statValue}>₹{Number(balance).toFixed(2)}</Text>
                        <Text style={styles.statLabel}>Wallet Balance</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Star size={24} color="#f1c40f" fill="#f1c40f" />
                        <Text style={styles.statValue}>{averageRating}</Text>
                        <Text style={styles.statLabel}>{reviews.length} Reviews</Text>
                    </View>
                </View>

                {/* Verification Section */}
                {verificationStatus.text !== 'Verified' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Verification</Text>
                        <View style={styles.verificationCard}>
                            <Award size={32} color="#6c5ce7" />
                            <Text style={styles.verificationDesc}>
                                Upload your ID and documents to get verified and receive more bookings.
                            </Text>
                            <TouchableOpacity
                                style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                                onPress={handleDocumentUpload}
                                disabled={uploading}
                            >
                                <Upload size={18} color="white" />
                                <Text style={styles.uploadButtonText}>
                                    {uploading ? 'Uploading...' : 'Upload Document'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Reviews Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reviews</Text>
                    {reviews.length === 0 ? (
                        <Text style={styles.emptyText}>No reviews yet</Text>
                    ) : (
                        <FlatList
                            data={reviews.slice(0, 5)}
                            renderItem={renderReview}
                            keyExtractor={item => item.id}
                            scrollEnabled={false}
                        />
                    )}
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <LogOut size={20} color="#e74c3c" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Edit Profile Modal */}
            <EditProfileModal
                visible={editModalVisible}
                user={providerData}
                onClose={() => setEditModalVisible(false)}
                onSuccess={loadProviderData}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#13131f' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)'
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },

    profileCard: {
        alignItems: 'center', padding: 30, margin: 20,
        backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20
    },
    avatar: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: '#6c5ce7', justifyContent: 'center', alignItems: 'center',
        marginBottom: 15
    },
    avatarText: { color: 'white', fontSize: 32, fontWeight: 'bold' },
    profileName: { color: 'white', fontSize: 22, fontWeight: 'bold' },
    profileEmail: { color: '#a0a0b0', fontSize: 14, marginTop: 5 },
    profilePhone: { color: '#a0a0b0', fontSize: 14, marginTop: 3 },

    verificationBadge: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginTop: 15
    },
    verificationText: { fontWeight: 'bold', marginLeft: 8 },

    statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 15 },
    statCard: {
        flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16,
        padding: 20, alignItems: 'center'
    },
    statValue: { color: 'white', fontSize: 24, fontWeight: 'bold', marginTop: 10 },
    statLabel: { color: '#a0a0b0', fontSize: 12, marginTop: 5 },

    section: { padding: 20 },
    sectionTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },

    verificationCard: {
        backgroundColor: 'rgba(108, 92, 231, 0.15)', borderRadius: 16,
        padding: 25, alignItems: 'center'
    },
    verificationDesc: { color: '#a0a0b0', textAlign: 'center', marginVertical: 15 },
    uploadButton: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#6c5ce7', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 12
    },
    uploadButtonDisabled: { opacity: 0.6 },
    uploadButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },

    reviewCard: {
        backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12,
        padding: 15, marginBottom: 10
    },
    reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    reviewAvatar: {
        width: 35, height: 35, borderRadius: 18, backgroundColor: '#3498db',
        justifyContent: 'center', alignItems: 'center', marginRight: 10
    },
    reviewAvatarText: { color: 'white', fontWeight: 'bold' },
    reviewerName: { color: 'white', fontWeight: 'bold', marginBottom: 3 },
    starRow: { flexDirection: 'row', gap: 2 },
    reviewDate: { color: '#666', fontSize: 12 },
    reviewComment: { color: '#a0a0b0', fontSize: 14 },

    emptyText: { color: '#666', textAlign: 'center' },

    logoutButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        margin: 20, padding: 15, backgroundColor: 'rgba(231, 76, 60, 0.15)',
        borderRadius: 12
    },
    logoutText: { color: '#e74c3c', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});

export default ProviderAccountScreen;
