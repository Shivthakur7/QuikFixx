import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2, Calendar, Clock } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SERVICES_LIST } from '../constants/services';

const SubServiceSelectionScreen = ({ route, navigation }: any) => {
    const { serviceId, userCoords } = route.params;
    const service = SERVICES_LIST.find(s => s.id === serviceId);

    const [scheduledAt, setScheduledAt] = React.useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = React.useState(false);
    const [showTimePicker, setShowTimePicker] = React.useState(false);

    if (!service) return null;

    const renderSubService = ({ item }: any) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProviderList', { serviceId, subServiceId: item.id, subServiceName: item.name, subServicePrice: item.price, userCoords, scheduledAt: scheduledAt ? scheduledAt.toISOString() : null })}
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
                    ListFooterComponent={
                        <View style={styles.scheduleSection}>
                            <Text style={styles.scheduleTitle}>Want to schedule for later?</Text>
                            <View style={styles.scheduleButtons}>
                                <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
                                    <Calendar size={20} color={scheduledAt ? service.color : '#a0a0b0'} />
                                    <Text style={[styles.pickerText, scheduledAt && { color: service.color }]}>
                                        {scheduledAt ? scheduledAt.toLocaleDateString() : 'Pick Date'}
                                    </Text>
                                </TouchableOpacity>
                                
                                {scheduledAt && (
                                    <TouchableOpacity style={styles.pickerButton} onPress={() => setShowTimePicker(true)}>
                                        <Clock size={20} color={service.color} />
                                        <Text style={[styles.pickerText, { color: service.color }]}>
                                            {scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {scheduledAt && (
                                <TouchableOpacity style={styles.clearScheduleButton} onPress={() => setScheduledAt(null)}>
                                    <Text style={styles.clearScheduleText}>Clear Schedule (Book ASAP)</Text>
                                </TouchableOpacity>
                            )}

                            {showDatePicker && (
                                <DateTimePicker
                                    value={scheduledAt || new Date()}
                                    mode="date"
                                    minimumDate={new Date()}
                                    onChange={(event, date) => {
                                        setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS
                                        if (date) {
                                            const newDate = scheduledAt ? new Date(scheduledAt) : new Date();
                                            newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                                            setScheduledAt(newDate);
                                            // Auto show time picker if on Android after date is picked
                                            if (Platform.OS === 'android') setShowTimePicker(true);
                                        }
                                    }}
                                />
                            )}

                            {showTimePicker && (
                                <DateTimePicker
                                    value={scheduledAt || new Date()}
                                    mode="time"
                                    onChange={(event, date) => {
                                        setShowTimePicker(Platform.OS === 'ios');
                                        if (date && scheduledAt) {
                                            const newDate = new Date(scheduledAt);
                                            newDate.setHours(date.getHours(), date.getMinutes());
                                            setScheduledAt(newDate);
                                        }
                                    }}
                                />
                            )}
                        </View>
                    }
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
    cardPrice: { fontSize: 14, color: '#00cec9', fontWeight: 'bold' },

    scheduleSection: { marginTop: 20, padding: 15, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16 },
    scheduleTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
    scheduleButtons: { flexDirection: 'row', gap: 10 },
    pickerButton: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        padding: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, gap: 8
    },
    pickerText: { color: '#a0a0b0', fontWeight: 'bold' },
    clearScheduleButton: { marginTop: 15, alignItems: 'center', padding: 10 },
    clearScheduleText: { color: '#e74c3c', fontSize: 14 }
});

export default SubServiceSelectionScreen;
