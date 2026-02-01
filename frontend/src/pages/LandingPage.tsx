import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Zap, Wrench, Hammer, Paintbrush,
    Shovel, ChefHat, User, BookOpen,
    Settings, ArrowRight, Sparkles
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

    return (
        <div className="landing-container" style={{ background: 'var(--color-bg-primary)' }}>
            {/* Navbar */}
            <nav style={{
                position: 'absolute', top: 0, left: 0, right: 0, padding: '20px 40px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10
            }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '30px', height: '30px', background: 'var(--color-accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚡</div>
                    <span>QuikFixx</span>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <button className="btn-secondary" onClick={() => navigate('/login')} style={{ border: 'none' }}>Login</button>
                    <button className="btn-primary" onClick={() => navigate('/register')} style={{ padding: '8px 20px' }}>Get Started</button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section" style={{ minHeight: '85vh', alignItems: 'center' }}>
                <div className="hero-visual blobs" style={{ opacity: 0.6 }}>
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2" style={{ animationDelay: '-5s' }}></div>
                </div>

                <div className="hero-content" style={{ maxWidth: '900px', padding: '0 20px', zIndex: 2 }}>
                    <div style={{
                        display: 'inline-block', padding: '8px 16px', borderRadius: '30px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        marginBottom: '20px', fontSize: '14px', color: '#a0a0b0'
                    }}>
                        🚀 #1 On-Demand Service Platform in Gwalior
                    </div>
                    <h1 className="hero-title" style={{ fontSize: '3.5rem', marginBottom: '15px' }}>
                        Your Home Needs, <br />
                        <span className="text-gradient">Fixed in Minutes.</span>
                    </h1>
                    <p className="hero-subtitle" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 40px auto' }}>
                        Connect with top-rated electricians, plumbers, and more instantly.
                        Track your pro in real-time.
                    </p>
                    <div className="hero-buttons" style={{ gap: '20px' }}>
                        <button
                            className="btn-primary"
                            onClick={() => navigate('/register')}
                            style={{ padding: '16px 40px', fontSize: '1.1rem', boxShadow: '0 10px 30px rgba(108, 92, 231, 0.4)' }}
                        >
                            Book a Service
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() => navigate('/register/provider')}
                            style={{ padding: '16px 40px', fontSize: '1.1rem' }}
                        >
                            Become a Partner
                        </button>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', marginTop: '60px', opacity: 0.8 }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>500+</div>
                            <div style={{ fontSize: '14px', color: '#a0a0b0' }}>Verified Pros</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>10k+</div>
                            <div style={{ fontSize: '14px', color: '#a0a0b0' }}>Happy Customers</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>4.8</div>
                            <div style={{ fontSize: '14px', color: '#a0a0b0' }}>Average Rating</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="services-section">
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h2 className="section-title" style={{ marginBottom: '10px' }}>Popular Services</h2>
                    <p style={{ color: '#a0a0b0' }}>Everything you need for your home</p>
                </div>

                <div className="services-grid" style={{ gap: '25px' }}>
                    {services.map((service) => (
                        <div key={service.id} className="service-card" onClick={() => navigate('/register', { state: { service: service.id } })} style={{ textAlign: 'left', padding: '25px', position: 'relative', overflow: 'hidden' }}>
                            <div className="icon-wrapper" style={{
                                width: '50px', height: '50px',
                                backgroundColor: `${service.color}15`,
                                borderRadius: '12px',
                                margin: '0 0 15px 0'
                            }}>
                                <service.icon size={24} color={service.color} />
                            </div>
                            <h3 style={{ fontSize: '18px', marginBottom: '5px' }}>{service.name}</h3>
                            <p style={{ margin: 0, fontSize: '13px', color: '#a0a0b0', lineHeight: 1.5 }}>
                                Expert {service.name.toLowerCase()} services at your doorstep.
                            </p>

                            {/* Hover Effect Light */}
                            <div style={{
                                position: 'absolute', top: -50, right: -50, width: 100, height: 100,
                                background: service.color, opacity: 0.1, borderRadius: '50%',
                                filter: 'blur(30px)'
                            }}></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto', padding: '60px', background: 'linear-gradient(135deg, rgba(30,30,50,0.8), rgba(20,20,30,0.9))' }}>
                    <Sparkles size={40} color="#fdcb6e" style={{ marginBottom: '20px' }} />
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Are you a Professional?</h2>
                    <p style={{ maxWidth: '600px', margin: '0 auto 30px auto', color: '#a0a0b0', fontSize: '1.1rem' }}>
                        Join the QuikFixx network to get instant job alerts, manage your schedule, and grow your earnings.
                        Zero upfront fees.
                    </p>
                    <button
                        className="btn-primary"
                        onClick={() => navigate('/register/provider')}
                        style={{ padding: '15px 30px', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '10px' }}
                    >
                        Register as Partner <ArrowRight size={18} />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '40px 20px', textAlign: 'center', color: '#a0a0b0', fontSize: '14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <p>&copy; 2026 QuikFixx Inc. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
