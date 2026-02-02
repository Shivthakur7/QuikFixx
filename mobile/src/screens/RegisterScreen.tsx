import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { SafeAreaView } from 'react-native-safe-area-context';

const RegisterScreen = ({ navigation }: any) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        role: 'user' // Default to user, provider toggle can be added
    });
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!formData.fullName || !formData.email || !formData.password || !formData.phone) {
            Alert.alert("Error", "All fields are required");
            return;
        }

        setLoading(true);
        try {
            // Register
            await client.post('/auth/register', formData);
            // Auto Login
            const res = await client.post('/auth/login', {
                email: formData.email,
                password: formData.password
            });
            const { access_token, user } = res.data;
            await login(access_token, user);
        } catch (err: any) {
            Alert.alert("Registration Failed", err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Join QuikFixx</Text>
                <Text style={styles.subtitle}>Create an account to get started</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#aaa"
                    value={formData.fullName}
                    onChangeText={t => setFormData({ ...formData, fullName: t })}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#aaa"
                    value={formData.email}
                    onChangeText={t => setFormData({ ...formData, email: t })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    placeholderTextColor="#aaa"
                    value={formData.phone}
                    onChangeText={t => setFormData({ ...formData, phone: t })}
                    keyboardType="phone-pad"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#aaa"
                    value={formData.password}
                    onChangeText={t => setFormData({ ...formData, password: t })}
                    secureTextEntry
                />

                <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? "Creating Account..." : "Sign Up"}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.linkText}>Already have an account? Login</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#13131f' },
    content: { padding: 20 },
    title: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 10, textAlign: 'center', marginTop: 40 },
    subtitle: { fontSize: 16, color: '#a0a0b0', marginBottom: 40, textAlign: 'center' },
    input: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 15,
        color: 'white',
        marginBottom: 15,
        fontSize: 16
    },
    button: {
        backgroundColor: '#00cec9',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10
    },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    linkText: { color: '#a0a0b0', textAlign: 'center', marginTop: 20 }
});

export default RegisterScreen;
