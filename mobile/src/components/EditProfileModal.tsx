import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { X } from 'lucide-react-native';
import client from '../api/client';
import { useToast } from '../context/ToastContext';

interface EditProfileModalProps {
    visible: boolean;
    user: any;
    onClose: () => void;
    onSuccess: (updatedUser: any) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, user, onClose, onSuccess }) => {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        phone: user?.phone || '',
        address: user?.address || ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!formData.fullName.trim()) {
            showToast('Name is required', 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await client.put('/users/profile', {
                fullName: formData.fullName.trim(),
                phone: formData.phone.trim(),
                address: formData.address.trim()
            });
            showToast('Profile updated successfully', 'success');
            onSuccess(res.data);
            onClose();
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <X size={24} color="white" />
                    </TouchableOpacity>

                    <Text style={styles.title}>Edit Profile</Text>

                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.fullName}
                        onChangeText={(v) => setFormData(prev => ({ ...prev, fullName: v }))}
                        placeholder="Enter your name"
                        placeholderTextColor="#666"
                    />

                    <Text style={styles.label}>Phone</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.phone}
                        onChangeText={(v) => setFormData(prev => ({ ...prev, phone: v }))}
                        placeholder="Enter phone number"
                        placeholderTextColor="#666"
                        keyboardType="phone-pad"
                    />

                    <Text style={styles.label}>Address</Text>
                    <TextInput
                        style={[styles.input, { minHeight: 80 }]}
                        value={formData.address}
                        onChangeText={(v) => setFormData(prev => ({ ...prev, address: v }))}
                        placeholder="Enter your address"
                        placeholderTextColor="#666"
                        multiline
                    />

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.submitButtonText}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center', alignItems: 'center', padding: 20
    },
    modal: {
        backgroundColor: '#1e1e2e', borderRadius: 20, padding: 25, width: '100%', maxWidth: 400
    },
    closeButton: { position: 'absolute', top: 15, right: 15, zIndex: 1 },
    title: { fontSize: 22, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 25 },
    label: { color: '#a0a0b0', fontSize: 12, marginBottom: 5, marginTop: 10 },
    input: {
        backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 15,
        color: 'white', fontSize: 16
    },
    submitButton: {
        backgroundColor: '#6c5ce7', padding: 15, borderRadius: 12, marginTop: 25, alignItems: 'center'
    },
    disabledButton: { opacity: 0.6 },
    submitButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default EditProfileModal;
