import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, DollarSign, Wallet, Calendar, TrendingUp } from 'lucide-react-native';
import client from '../api/client';
import { useToast } from '../context/ToastContext';

const ProviderEarningsScreen = ({ navigation }: any) => {
    const { showToast } = useToast();
    const [earningsData, setEarningsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        try {
            const res = await client.get('/providers/earnings');
            setEarningsData(res.data);
        } catch (err) {
            console.error('Failed to fetch earnings', err);
            showToast('Failed to load earnings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const renderHistoryItem = ({ item }: any) => (
        <View style={styles.historyCard}>
            <View style={styles.historyLeft}>
                <View style={styles.historyIcon}>
                    <DollarSign size={20} color="#2ecc71" />
                </View>
                <View style={{ marginLeft: 15 }}>
                    <Text style={styles.historyTitle}>{item.serviceType}</Text>
                    <Text style={styles.historyDate}>
                        {new Date(item.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </Text>
                </View>
            </View>
            <Text style={styles.historyPrice}>+₹{item.price}</Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#6c5ce7" />
                <Text style={{ color: '#a0a0b0', marginTop: 15 }}>Loading earnings...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Earnings & Payouts</Text>
                <View style={{ width: 34 }} /> {/* Empty view for alignment */}
            </View>

            <View style={styles.balanceSection}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceAmount}>₹{earningsData?.balance?.toFixed(2) || '0.00'}</Text>
                
                <TouchableOpacity style={styles.withdrawButton}>
                    <Wallet size={16} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.withdrawText}>Withdraw Funds</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(46, 204, 113, 0.2)' }]}>
                        <TrendingUp size={20} color="#2ecc71" />
                    </View>
                    <Text style={styles.statBoxLabel}>Total Earnings</Text>
                    <Text style={styles.statBoxValue}>₹{earningsData?.totalEarnings || 0}</Text>
                </View>
                <View style={styles.statBox}>
                    <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(108, 92, 231, 0.2)' }]}>
                        <Calendar size={20} color="#6c5ce7" />
                    </View>
                    <Text style={styles.statBoxLabel}>This Week</Text>
                    <Text style={styles.statBoxValue}>₹{earningsData?.thisWeekEarnings || 0}</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Recent Transactions ({earningsData?.completedJobs || 0})</Text>

            <FlatList
                data={earningsData?.history || []}
                renderItem={renderHistoryItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>No transactions yet.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#13131f' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)'
    },
    backButton: { padding: 5, marginLeft: -5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
    
    balanceSection: {
        alignItems: 'center', paddingVertical: 40, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)'
    },
    balanceLabel: { color: '#a0a0b0', fontSize: 14, marginBottom: 10 },
    balanceAmount: { color: 'white', fontSize: 42, fontWeight: 'bold', marginBottom: 20 },
    withdrawButton: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#6c5ce7',
        paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25
    },
    withdrawText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    statsContainer: {
        flexDirection: 'row', gap: 15, padding: 20, marginTop: 10
    },
    statBox: {
        flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20,
        alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.02)'
    },
    statIconWrapper: {
        width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 10
    },
    statBoxLabel: { color: '#a0a0b0', fontSize: 12, marginBottom: 5 },
    statBoxValue: { color: 'white', fontSize: 20, fontWeight: 'bold' },

    sectionTitle: {
        color: 'white', fontSize: 18, fontWeight: 'bold', paddingHorizontal: 20, marginTop: 10, marginBottom: 15
    },
    listContainer: { paddingHorizontal: 20, paddingBottom: 30 },
    
    historyCard: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)'
    },
    historyLeft: { flexDirection: 'row', alignItems: 'center' },
    historyIcon: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(46, 204, 113, 0.1)',
        alignItems: 'center', justifyContent: 'center'
    },
    historyTitle: { color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 4 },
    historyDate: { color: '#a0a0b0', fontSize: 12 },
    historyPrice: { color: '#2ecc71', fontSize: 16, fontWeight: 'bold' },

    emptyState: { padding: 30, alignItems: 'center' },
    emptyStateText: { color: '#a0a0b0', fontSize: 14 }
});

export default ProviderEarningsScreen;
