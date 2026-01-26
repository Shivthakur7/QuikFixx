import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 3000); // Auto remove after 3s
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                {toasts.map(toast => (
                    <div key={toast.id} className="glass-card" style={{
                        padding: '12px 20px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        minWidth: '250px',
                        borderLeft: `4px solid ${toast.type === 'success' ? '#00cec9' :
                                toast.type === 'error' ? '#ff7675' : '#74b9ff'
                            }`,
                        animation: 'slideIn 0.3s ease-out',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                    }}>
                        {toast.type === 'success' && <CheckCircle size={20} color="#00cec9" />}
                        {toast.type === 'error' && <AlertCircle size={20} color="#ff7675" />}
                        {toast.type === 'info' && <Info size={20} color="#74b9ff" />}

                        <span style={{ fontSize: '14px', color: 'white', flex: 1 }}>{toast.message}</span>

                        <X
                            size={16}
                            color="#a0a0b0"
                            style={{ cursor: 'pointer' }}
                            onClick={() => removeToast(toast.id)}
                        />
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
