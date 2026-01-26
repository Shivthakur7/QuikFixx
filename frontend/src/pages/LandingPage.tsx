import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Zap, Wrench, Hammer, Paintbrush,
    Shovel, ChefHat, User, BookOpen,
    Settings, ArrowRight
} from 'lucide-react';

const services = [
    { id: 'electrician', name: 'Electrician', icon: Zap, color: '#facc15' },
    { id: 'plumber', name: 'Plumber', icon: Wrench, color: '#3b82f6' },
    { id: 'carpenter', name: 'Carpenter', icon: Hammer, color: '#a855f7' },
    { id: 'painter', name: 'Painter', icon: Paintbrush, color: '#ec4899' },
    { id: 'mason', name: 'Mason', icon: Hammer, color: '#f97316' }, // Reusing hammer or similar
    { id: 'gardener', name: 'Gardener', icon: Shovel, color: '#22c55e' },
    { id: 'cook', name: 'Cook', icon: ChefHat, color: '#ef4444' },
    { id: 'maid', name: 'Maid', icon: User, color: '#06b6d4' },
    { id: 'tutor', name: 'Home Tutor', icon: BookOpen, color: '#8b5cf6' },
    { id: 'mechanic', name: 'Mechanic', icon: Settings, color: '#64748b' },
];

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    const handleServiceClick = (serviceId: string) => {
        // Navigate to map with service pre-selected
        navigate('/map', { state: { service: serviceId } });
    };

    return (
        <div className="landing-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Expert Help, <span className="text-gradient">Instantly.</span>
                    </h1>
                    <p className="hero-subtitle">
                        Get matched with top-rated professionals in Gwalior for all your home needs.
                        Real-time dispatch, trusted service.
                    </p>
                    <div className="hero-buttons">
                        <button className="btn-primary" onClick={() => navigate('/register')}>Get Started</button>
                        <button className="btn-secondary" onClick={() => navigate('/login/provider')}>Join as Pro</button>
                    </div>
                </div>

                {/* Abstract shapes or image could go here */}
                <div className="hero-visual">
                    <div className="blobs">
                        <div className="blob blob-1"></div>
                        <div className="blob blob-2"></div>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="services-section">
                <h2 className="section-title">Our Services</h2>
                <div className="services-grid">
                    {services.map((service) => (
                        <div key={service.id} className="service-card" onClick={() => handleServiceClick(service.id)}>
                            <div className="icon-wrapper" style={{ backgroundColor: `${service.color}20` }}>
                                <service.icon size={32} color={service.color} />
                            </div>
                            <h3>{service.name}</h3>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer / CTA */}
            <section className="cta-section">
                <h2>Are you a professional?</h2>
                <p>Join the QuikFixx network and get more jobs instantly.</p>
                <button className="btn-outline" onClick={() => navigate('/register/provider')}>Register as Partner <ArrowRight size={16} /></button>
            </section>
        </div>
    );
};

export default LandingPage;
