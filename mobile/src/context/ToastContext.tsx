import React, { createContext, useContext, useRef } from 'react';
import Toast, { ToastShowParams } from 'react-native-toast-message';

interface ToastContextType {
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        Toast.show({
            type: type,
            text1: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info',
            text2: message,
            position: 'top',
            visibilityTime: 3000,
            autoHide: true,
            topOffset: 50
        });
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Toast />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};
