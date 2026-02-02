import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { View, ActivityIndicator } from 'react-native';

// Customer Screens
import HomeScreen from '../screens/HomeScreen';
import SubServiceSelectionScreen from '../screens/SubServiceSelectionScreen';
import ProviderListScreen from '../screens/ProviderListScreen';
import AccountScreen from '../screens/AccountScreen';

// Provider Screens
import ProviderDashboardScreen from '../screens/ProviderDashboardScreen';
import ProviderAccountScreen from '../screens/ProviderAccountScreen';

// Auth Screens
import LandingScreen from '../screens/LandingScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { token, user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#13131f' }}>
                <ActivityIndicator size="large" color="#6c5ce7" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {token ? (
                    user?.role === 'provider' ? (
                        // Provider Stack
                        <>
                            <Stack.Screen name="ProviderDashboard" component={ProviderDashboardScreen} />
                            <Stack.Screen name="ProviderAccount" component={ProviderAccountScreen} />
                        </>
                    ) : (
                        // Customer Stack
                        <>
                            <Stack.Screen name="Home" component={HomeScreen} />
                            <Stack.Screen name="SubServiceSelection" component={SubServiceSelectionScreen} />
                            <Stack.Screen name="ProviderList" component={ProviderListScreen} />
                            <Stack.Screen name="Account" component={AccountScreen} />
                        </>
                    )
                ) : (
                    // Auth Stack
                    <>
                        <Stack.Screen name="Landing" component={LandingScreen} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
