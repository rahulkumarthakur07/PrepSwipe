
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GameProvider } from '../context/GameContext';
import { LightColors } from '../constants/theme';
import { View, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function Layout() {
    useEffect(() => {
        // Hide splash screen after component mounts
        // Added delay to verify splash screen visibility
        const timeout = setTimeout(async () => {
            await SplashScreen.hideAsync();
        }, 2000);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <GestureHandlerRootView style={styles.container}>
            <StatusBar style="dark" backgroundColor={LightColors.background} />
            <GameProvider>
                <Slot />
            </GameProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: LightColors.background,
    }
});
