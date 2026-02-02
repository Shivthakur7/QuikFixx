import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Zap, ArrowRight, Briefcase } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const LandingScreen = ({ navigation }: any) => {
    return (
        <SafeAreaView style={styles.container}>
            {/* Background Elements (Blobs equivalent) */}
            <View style={[styles.blob, styles.blob1]} />
            <View style={[styles.blob, styles.blob2]} />

            <View style={styles.content}>

                {/* Brand */}
                <View style={styles.brand}>
                    <View style={styles.logoBox}>
                        <Zap size={24} color="white" fill="white" />
                    </View>
                    <Text style={styles.brandName}>QuikFixx</Text>
                </View>

                {/* Hero Section */}
                <View style={styles.hero}>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>🚀 #1 Service App</Text>
                    </View>
                    <Text style={styles.title}>
                        Your Home Needs,{'\n'}
                        <Text style={styles.highlight}>Fixed in Minutes.</Text>
                    </Text>
                    <Text style={styles.subtitle}>
                        Connect with top-rated electricians, plumbers, and more instantly.
                    </Text>
                </View>

                {/* Actions */}
                <View style={styles.actionGroup}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate('Login', { role: 'user' })}
                    >
                        <Text style={styles.primaryBtnText}>Book a Service</Text>
                        <ArrowRight size={20} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => navigation.navigate('Login', { role: 'provider' })}
                    >
                        <Briefcase size={20} color="white" style={{ marginRight: 10 }} />
                        <Text style={styles.secondaryBtnText}>Become a Partner</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#13131f' },
    content: { flex: 1, padding: 30, justifyContent: 'space-between' },

    blob: {
        position: 'absolute', width: 300, height: 300, borderRadius: 150,
        opacity: 0.2, transform: [{ scale: 1.5 }]
    },
    blob1: { backgroundColor: '#6c5ce7', top: -100, left: -100 },
    blob2: { backgroundColor: '#00cec9', bottom: -100, right: -100 },

    brand: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
    logoBox: {
        width: 40, height: 40, borderRadius: 10, backgroundColor: '#6c5ce7',
        justifyContent: 'center', alignItems: 'center', marginRight: 10
    },
    brandName: { fontSize: 24, fontWeight: 'bold', color: 'white' },

    hero: { flex: 1, justifyContent: 'center' },
    tag: {
        backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'flex-start',
        paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginBottom: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    tagText: { color: '#a0a0b0', fontSize: 12, fontWeight: '600' },
    title: { fontSize: 42, fontWeight: 'bold', color: 'white', lineHeight: 50, marginBottom: 15 },
    highlight: { color: '#00cec9' },
    subtitle: { fontSize: 16, color: '#a0a0b0', lineHeight: 24, maxWidth: '80%' },

    actionGroup: { gap: 15, marginBottom: 20 },
    primaryButton: {
        backgroundColor: '#6c5ce7', padding: 20, borderRadius: 16,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        shadowColor: '#6c5ce7', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20,
        elevation: 10
    },
    primaryBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginRight: 10 },

    secondaryButton: {
        backgroundColor: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 16,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    secondaryBtnText: { color: 'white', fontSize: 16, fontWeight: '600' }
});

export default LandingScreen;
