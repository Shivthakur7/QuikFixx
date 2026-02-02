import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// For USB Debugging: Ensure you run 'adb reverse tcp:3000 tcp:3000'
const DEV_URL = 'http://localhost:3000';

const client = axios.create({
    baseURL: DEV_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add Token
client.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default client;
