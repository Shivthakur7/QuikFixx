import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { Star, X } from 'lucide-react-native';
import client from '../api/client';
import { useToast } from '../context/ToastContext';

interface RateProviderModalProps {
    visible: boolean;
    booking: any;
    onClose: () => void;
    onSuccess: () => void;
}

const RateProviderModal: React.FC<RateProviderModalProps> = ({ visible, booking, onClose, onSuccess }) => {
    const { showToast } = useToast();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!booking?.provider?.id) {
            showToast('Provider information missing', 'error');
            return;
        }

        setLoading(true);
        try {
            await client.post('/reviews', {
                providerId: booking.provider.id,
                rating,
                comment: comment.trim() || undefined
            });
            showToast('Thank you for your review!', 'success');
            onSuccess();
            onClose();
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to submit review', 'error');
        } finally {
            setLoading(false);
        }
    };

    const renderStars = () => {
        return [1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Star
                    size={36}
                    color={star <= rating ? '#f1c40f' : '#444'}
                    fill={star <= rating ? '#f1c40f' : 'transparent'}
                />
            </TouchableOpacity>
        ));
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <X size={24} color="white" />
                    </TouchableOpacity>

                    <Text style={styles.title}>Rate Your Provider</Text>

                    {booking?.provider?.user && (
                        <Text style={styles.providerName}>
                            {booking.provider.user.fullName}
                        </Text>
                    )}

                    <View style={styles.starsRow}>
                        {renderStars()}
                    </View>

                    <TextInput
                        style={styles.commentInput}
                        placeholder="Leave a comment (optional)"
                        placeholderTextColor="#666"
                        value={comment}
                        onChangeText={setComment}
                        multiline
                        numberOfLines={3}
                    />

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text style={styles.submitButtonText}>
                            {loading ? 'Submitting...' : 'Submit Review'}
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
    title: { fontSize: 22, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 10 },
    providerName: { fontSize: 16, color: '#a0a0b0', textAlign: 'center', marginBottom: 20 },
    starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 25 },
    commentInput: {
        backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 15,
        color: 'white', fontSize: 14, minHeight: 80, textAlignVertical: 'top'
    },
    submitButton: {
        backgroundColor: '#6c5ce7', padding: 15, borderRadius: 12, marginTop: 20, alignItems: 'center'
    },
    disabledButton: { opacity: 0.6 },
    submitButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default RateProviderModal;
