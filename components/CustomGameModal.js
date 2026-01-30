import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Spacing, Border, Shadows } from '../constants/theme';
import { X, Play, Type, HelpCircle } from 'lucide-react-native';
import Animated, { ZoomIn, FadeIn, FadeOut } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const Decoration = ({ style, color = '#000' }) => (
    <View style={[styles.decoration, style, { backgroundColor: color + '30', borderColor: color }]}>
        <View style={{ position: 'absolute', top: '20%', left: '10%', width: '80%', height: 2, backgroundColor: color + '20' }} />
        <View style={{ position: 'absolute', bottom: '20%', left: '10%', width: '80%', height: 2, backgroundColor: color + '20' }} />
    </View>
);

export default function CustomGameModal({ visible, onClose, onStart, colors }) {
    const [word, setWord] = useState('');
    const [meaning, setMeaning] = useState('');

    const handleStart = () => {
        if (word.trim().length < 2) return;
        onStart(word.trim(), meaning.trim());
        setWord('');
        setMeaning('');
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <Animated.View
                    entering={ZoomIn.duration(400).springify()}
                    exiting={FadeOut}
                    style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                    <Decoration style={{ top: -15, left: '10%', width: 60, height: 15, transform: [{ rotate: '-10deg' }] }} color={colors.primary} />

                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>CUSTOM CHALLENGE</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X color={colors.text} size={24} strokeWidth={4} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputSection}>
                        <View style={[styles.inputLabelContainer, { backgroundColor: colors.primary, transform: [{ rotate: '-2deg' }] }]}>
                            <Type size={16} color="#FFF" strokeWidth={3} />
                            <Text style={styles.inputLabel}>YOUR SECRET WORD</Text>
                        </View>
                        <TextInput
                            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                            placeholder="Type a word..."
                            placeholderTextColor="#9CA3AF"
                            value={word}
                            onChangeText={(text) => setWord(text.replace(/[^a-zA-Z]/g, '').toUpperCase())}
                            maxLength={15}
                            autoFocus
                        />
                    </View>

                    <View style={styles.inputSection}>
                        <View style={[styles.inputLabelContainer, { backgroundColor: colors.success, transform: [{ rotate: '1.5deg' }] }]}>
                            <HelpCircle size={16} color="#FFF" strokeWidth={3} />
                            <Text style={styles.inputLabel}>HINT / MEANING</Text>
                        </View>
                        <TextInput
                            style={[styles.input, { borderColor: colors.border, color: colors.text, height: 80 }]}
                            placeholder="What does it mean?"
                            placeholderTextColor="#9CA3AF"
                            value={meaning}
                            onChangeText={setMeaning}
                            multiline
                            maxLength={100}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleStart}
                        disabled={word.trim().length < 2}
                        style={[
                            styles.startBtn,
                            {
                                backgroundColor: word.trim().length >= 2 ? colors.primary : '#E5E7EB',
                                borderColor: colors.border,
                                opacity: word.trim().length >= 2 ? 1 : 0.7
                            }
                        ]}
                    >
                        <Play size={24} color={word.trim().length >= 2 ? "#FFF" : "#9CA3AF"} fill={word.trim().length >= 2 ? "#FFF" : "#9CA3AF"} />
                        <Text style={[styles.startBtnText, { color: word.trim().length >= 2 ? "#FFF" : "#9CA3AF" }]}>START GAME!</Text>
                    </TouchableOpacity>

                    <Text style={styles.footerNote}>Challenge your friends or test yourself!</Text>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    modalContent: {
        width: '100%',
        padding: Spacing.xl,
        borderWidth: Border.heavy,
        borderRadius: 30,
        ...Shadows.popHeavy,
        position: 'relative',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
    },
    closeBtn: {
        padding: 5,
    },
    inputSection: {
        marginBottom: Spacing.xl,
    },
    inputLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        alignSelf: 'flex-start',
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#000',
        ...Shadows.pop,
    },
    inputLabel: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '900',
        marginLeft: 6,
    },
    input: {
        width: '100%',
        height: 55,
        borderWidth: 3,
        borderRadius: 15,
        paddingHorizontal: 15,
        fontSize: 18,
        fontWeight: '800',
        backgroundColor: '#F9FAFB',
    },
    startBtn: {
        width: '100%',
        height: 65,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: Border.heavy,
        ...Shadows.popHeavy,
        gap: 10,
    },
    startBtnText: {
        fontSize: 22,
        fontWeight: '900',
    },
    footerNote: {
        textAlign: 'center',
        marginTop: Spacing.m,
        fontSize: 12,
        fontWeight: '800',
        color: '#6B7280',
        fontStyle: 'italic',
    },
    decoration: {
        position: 'absolute',
        borderWidth: 1.5,
        borderRadius: 2,
        zIndex: 10,
    },
});
