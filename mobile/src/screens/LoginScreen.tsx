import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowLeft, Smartphone } from 'lucide-react-native';

const LoginScreen = ({ navigation, route }: any) => {
    const { login } = useAuth();
    const { role } = route.params || { role: 'user' };

    // Toggle between Email/Password and OTP login
    const [isOtpLogin, setIsOtpLogin] = useState(false);

    // Email/Password state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // OTP login state
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    const [loading, setLoading] = useState(false);

    // Email/Password Login
    const handleEmailLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter email and password");
            return;
        }

        setLoading(true);
        try {
            const res = await client.post('/auth/login', { email, password });
            const { access_token, user } = res.data;
            await login(access_token, user);
        } catch (err: any) {
            Alert.alert("Login Failed", err.response?.data?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    // Send OTP
    const handleSendOtp = async () => {
        if (!phoneNumber) {
            Alert.alert("Error", "Please enter mobile number");
            return;
        }

        setLoading(true);
        try {
            await client.post('/auth/send-otp', { phoneNumber });
            setOtpSent(true);
            Alert.alert("OTP Sent", "Please check your phone for the OTP");
        } catch (err: any) {
            Alert.alert("Error", err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP and Login
    const handleOtpLogin = async () => {
        if (!otp) {
            Alert.alert("Error", "Please enter OTP");
            return;
        }

        setLoading(true);
        try {
            const res = await client.post('/auth/login-otp', { phoneNumber, code: otp });
            const { access_token, user } = res.data;
            await login(access_token, user);
        } catch (err: any) {
            Alert.alert("Login Failed", err.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={24} color="white" />
                </TouchableOpacity>

                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>
                            {role === 'provider' ? 'Provider Login' : 'Customer Login'}
                        </Text>
                    </View>

                    {/* Login Method Toggle */}
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[styles.toggleButton, !isOtpLogin && styles.toggleButtonActive]}
                            onPress={() => { setIsOtpLogin(false); setOtpSent(false); }}
                        >
                            <Mail size={16} color={!isOtpLogin ? 'white' : '#666'} />
                            <Text style={[styles.toggleText, !isOtpLogin && styles.toggleTextActive]}>
                                Email
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleButton, isOtpLogin && styles.toggleButtonActive]}
                            onPress={() => setIsOtpLogin(true)}
                        >
                            <Smartphone size={16} color={isOtpLogin ? 'white' : '#666'} />
                            <Text style={[styles.toggleText, isOtpLogin && styles.toggleTextActive]}>
                                Mobile OTP
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {!isOtpLogin ? (
                            // Email/Password Form
                            <>
                                <View style={styles.inputContainer}>
                                    <Mail size={20} color="#6c5ce7" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email Address"
                                        placeholderTextColor="#666"
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Lock size={20} color="#6c5ce7" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Password"
                                        placeholderTextColor="#666"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                                    onPress={handleEmailLogin}
                                    disabled={loading}
                                >
                                    <Text style={styles.loginButtonText}>
                                        {loading ? "Signing in..." : "Sign In"}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            // OTP Login Form
                            <>
                                <View style={styles.inputContainer}>
                                    <Smartphone size={20} color="#00cec9" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Mobile Number (+91XXXXXXXXXX)"
                                        placeholderTextColor="#666"
                                        value={phoneNumber}
                                        onChangeText={setPhoneNumber}
                                        keyboardType="phone-pad"
                                        editable={!otpSent}
                                    />
                                </View>

                                {otpSent && (
                                    <View style={styles.inputContainer}>
                                        <Lock size={20} color="#00cec9" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter 6-digit OTP"
                                            placeholderTextColor="#666"
                                            value={otp}
                                            onChangeText={setOtp}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                        />
                                    </View>
                                )}

                                {!otpSent ? (
                                    <TouchableOpacity
                                        style={[styles.otpButton, loading && styles.loginButtonDisabled]}
                                        onPress={handleSendOtp}
                                        disabled={loading}
                                    >
                                        <Text style={styles.loginButtonText}>
                                            {loading ? "Sending..." : "Send OTP"}
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <>
                                        <TouchableOpacity
                                            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                                            onPress={handleOtpLogin}
                                            disabled={loading}
                                        >
                                            <Text style={styles.loginButtonText}>
                                                {loading ? "Verifying..." : "Verify & Login"}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.resendButton}
                                            onPress={() => { setOtpSent(false); setOtp(''); }}
                                        >
                                            <Text style={styles.resendText}>Change number or resend OTP</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </>
                        )}
                    </View>

                    {/* Sign Up Link */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register', { role })}>
                            <Text style={styles.signUpLink}>
                                {role === 'provider' ? 'Join as Pro' : 'Sign Up'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#13131f' },
    keyboardView: { flex: 1 },
    backButton: {
        position: 'absolute', top: 60, left: 20, zIndex: 10,
        padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12
    },
    content: { flex: 1, justifyContent: 'center', padding: 30 },

    header: { marginBottom: 30, alignItems: 'center' },
    title: { fontSize: 32, fontWeight: 'bold', color: 'white', marginBottom: 10 },
    subtitle: { fontSize: 16, color: '#a0a0b0' },

    // Toggle between Email and OTP
    toggleContainer: {
        flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 14, padding: 5, marginBottom: 25
    },
    toggleButton: {
        flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        padding: 12, borderRadius: 10, gap: 8
    },
    toggleButtonActive: { backgroundColor: '#6c5ce7' },
    toggleText: { color: '#666', fontSize: 14 },
    toggleTextActive: { color: 'white', fontWeight: 'bold' },

    form: { gap: 15 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    inputIcon: { marginLeft: 15 },
    input: {
        flex: 1, padding: 18, paddingLeft: 12,
        color: 'white', fontSize: 16
    },

    loginButton: {
        backgroundColor: '#6c5ce7', padding: 18, borderRadius: 14,
        alignItems: 'center', marginTop: 10,
        shadowColor: '#6c5ce7', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4, shadowRadius: 15, elevation: 8
    },
    otpButton: {
        backgroundColor: '#00cec9', padding: 18, borderRadius: 14,
        alignItems: 'center', marginTop: 10,
        shadowColor: '#00cec9', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4, shadowRadius: 15, elevation: 8
    },
    loginButtonDisabled: { opacity: 0.6 },
    loginButtonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },

    resendButton: { alignItems: 'center', marginTop: 15 },
    resendText: { color: '#00cec9', fontSize: 14 },

    footer: {
        flexDirection: 'row', justifyContent: 'center',
        marginTop: 30, alignItems: 'center'
    },
    footerText: { color: '#a0a0b0', fontSize: 15 },
    signUpLink: {
        color: '#00cec9', fontSize: 15, fontWeight: 'bold',
        textDecorationLine: 'underline'
    }
});

export default LoginScreen;
