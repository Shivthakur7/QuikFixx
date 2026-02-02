import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { SERVICES_LIST } from '../constants/services';

const SubServiceSelectionScreen = ({ route, navigation }: any) => {
    const { serviceId } = route.params;
    const service = SERVICES_LIST.find(s => s.id === serviceId);

    if (!service) return null;

    const renderSubService = ({ item }: any) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProviderList', { serviceId, subServiceId: item.id })}
        >
            <View>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardPrice}>₹{item.price}</Text>
            </View>
            <CheckCircle2 size={24} color={service.color} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{service.name}</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.subtitle}>Select a service</Text>
                <FlatList
                    data={service.subServices}
                    renderItem={renderSubService}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            </View>
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
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
    content: { flex: 1, padding: 20 },
    subtitle: { fontSize: 16, color: '#a0a0b0', marginBottom: 20 },

    card: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        padding: 20, borderRadius: 16, marginBottom: 15,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
    },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 5 },
    cardPrice: { fontSize: 14, color: '#00cec9', fontWeight: 'bold' }
});

export default SubServiceSelectionScreen;
