import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';

interface RateProviderModalProps {
    bookingId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const RateProviderModal: React.FC<RateProviderModalProps> = ({ bookingId, onClose, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async () => {
        if (rating === 0) {
            showToast('Please select a rating', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/reviews', {
                orderId: bookingId,
                rating,
                comment
            });
            showToast('Review submitted successfully!', 'success');
            onSuccess();
        } catch (error) {
            console.error('Failed to submit review:', error);
            showToast('Failed to submit review', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="glass-card" style={{
                background: '#2d3436', padding: '30px', borderRadius: '15px',
                width: '90%', maxWidth: '400px', position: 'relative',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '15px', right: '15px',
                        background: 'transparent', border: 'none', color: '#a0a0b0', cursor: 'pointer'
                    }}
                >
                    <X size={20} />
                </button>

                <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '10px' }}>Rate your Provider</h2>
                <p style={{ color: '#a0a0b0', textAlign: 'center', marginBottom: '20px', fontSize: '14px' }}>
                    How was your experience?
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            onClick={() => setRating(star)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px' }}
                        >
                            <Star
                                size={32}
                                fill={(hoveredRating || rating) >= star ? '#fdcb6e' : 'transparent'}
                                color={(hoveredRating || rating) >= star ? '#fdcb6e' : '#636e72'}
                            />
                        </button>
                    ))}
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your feedback (optional)..."
                        style={{
                            width: '100%', height: '80px', background: 'rgba(0,0,0,0.2)',
                            border: '1px solid #636e72', borderRadius: '8px',
                            padding: '10px', color: 'white', fontSize: '14px', resize: 'none'
                        }}
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="btn-primary"
                    style={{ width: '100%', padding: '12px', opacity: isSubmitting ? 0.7 : 1 }}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
            </div>
        </div>
    );
};

export default RateProviderModal;
