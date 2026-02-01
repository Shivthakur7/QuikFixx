import React, { useState } from 'react';
import { X, User, Phone, MapPin, Save } from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface EditProfileModalProps {
    currentUser: any;
    onClose: () => void;
    onSuccess: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ currentUser, onClose, onSuccess }) => {
    const { showToast } = useToast();
    const { login } = useAuth(); // We'll use this to update local user state if possible

    const [formData, setFormData] = useState({
        fullName: currentUser?.fullName || '',
        phoneNumber: currentUser?.phoneNumber || '',
        address: currentUser?.address || ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.patch('/users/profile', formData);
            showToast('Profile updated successfully', 'success');

            // Attempt to update local auth context if the response returns the updated user
            // If the API returns the updated user object (standard nestjs update usually returns result, verify service)
            // UsersService.update returns this.usersRepository.save(user), so it returns the user object.
            // We can hackily update the local storage user or call a context method if available.
            // For now, let's try to update the stored user manually to reflect changes immediately.
            const updatedUser = { ...currentUser, ...formData };
            if (localStorage.getItem('accessToken')) {
                // Re-trigger login to update context (hacky but works if login updates state)
                login(localStorage.getItem('accessToken') || '', updatedUser);
            }

            onSuccess();
        } catch (error) {
            console.error('Failed to update profile', error);
            showToast('Failed to update profile', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 2000,
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

                <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>Edit Profile</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                    {/* Full Name */}
                    <div>
                        <label style={{ display: 'block', color: '#a0a0b0', fontSize: '12px', marginBottom: '5px' }}>Full Name</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '10px' }}>
                            <User size={16} color="#636e72" style={{ marginRight: '10px' }} />
                            <input
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Enter full name"
                                style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none' }}
                            />
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label style={{ display: 'block', color: '#a0a0b0', fontSize: '12px', marginBottom: '5px' }}>Phone Number</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '10px' }}>
                            <Phone size={16} color="#636e72" style={{ marginRight: '10px' }} />
                            <input
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                                style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none' }}
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label style={{ display: 'block', color: '#a0a0b0', fontSize: '12px', marginBottom: '5px' }}>Address</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '10px' }}>
                            <MapPin size={16} color="#636e72" style={{ marginRight: '10px' }} />
                            <input
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter address"
                                style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none' }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary"
                        style={{
                            marginTop: '10px', padding: '12px',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                            opacity: isSubmitting ? 0.7 : 1
                        }}
                    >
                        <Save size={18} />
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
