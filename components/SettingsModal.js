import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Alert, Switch, ScrollView, Pressable } from 'react-native';
import { Spacing, BorderRadius, Shadows, Border } from '../constants/theme';
import { X, RefreshCw, Trash2, Moon, Sun, Music, Volume2, LayoutList, BookOpen } from 'lucide-react-native';
import { useGame } from '../context/GameContext';

const SettingsModal = ({ visible, onClose }) => {
    const {
        colors, isDark, toggleTheme, resetProgress, clearBookmarks,
        musicEnabled, soundEnabled, toggleMusic, toggleSound,
        triggerHaptic, setHasSeenInstructions
    } = useGame();

    const handleResetPress = () => {
        Alert.alert(
            "Reset Progress",
            "Are you sure you want to start over from card 1?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Reset", style: "destructive", onPress: () => { resetProgress(); onClose(); } }
            ]
        );
    };

    const handleClearBookmarksPress = () => {
        Alert.alert(
            "Clear Bookmarks",
            "Delete all saved questions?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Clear", style: "destructive", onPress: clearBookmarks }
            ]
        );
    };

    const handleClose = () => {
        triggerHaptic('light');
        onClose();
    };

    const handleShowInstructions = () => {
        setHasSeenInstructions(false);
        onClose();
        triggerHaptic('medium');
    };

    const SettingCard = ({ title, icon: Icon, color, children, onPress }) => (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, { backgroundColor: color, borderColor: colors.border }]}>
                    <Icon color="#000" size={24} strokeWidth={2.5} />
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
            </View>
            <View style={styles.cardContent}>
                {children}
            </View>
        </View>
    );

    const ControlRow = ({ label, children, onPress, style }) => (
        <Pressable
            onPress={onPress}
            style={[styles.controlRow, style]}
            disabled={!onPress}
        >
            <Text style={[styles.controlLabel, { color: colors.text }]}>{label}</Text>
            {children}
        </Pressable>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <View style={styles.header}>
                        <View style={[styles.titleBadge, { backgroundColor: colors.primary, borderColor: colors.border }]}>
                            <Text style={styles.titleText}>SETTINGS</Text>
                        </View>
                        <TouchableOpacity onPress={handleClose} style={[styles.closeButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <X color={colors.text} size={28} strokeWidth={3} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <SettingCard title="Visuals" icon={Sun} color="#FDB813">
                            <ControlRow label="Dark Mode">
                                <Switch
                                    value={isDark}
                                    onValueChange={toggleTheme}
                                    trackColor={{ false: '#E2E8F0', true: colors.primary }}
                                    thumbColor={'#FFFFFF'}
                                />
                            </ControlRow>
                        </SettingCard>

                        <SettingCard title="Audio" icon={Music} color="#A78BFA">
                            <ControlRow label="Music">
                                <Switch
                                    value={musicEnabled}
                                    onValueChange={toggleMusic}
                                    trackColor={{ false: '#E2E8F0', true: colors.primary }}
                                    thumbColor={'#FFFFFF'}
                                />
                            </ControlRow>
                            <View style={[styles.divider, { backgroundColor: colors.border + '20' }]} />
                            <ControlRow label="Sound Effects">
                                <Switch
                                    value={soundEnabled}
                                    onValueChange={toggleSound}
                                    trackColor={{ false: '#E2E8F0', true: colors.primary }}
                                    thumbColor={'#FFFFFF'}
                                />
                            </ControlRow>
                        </SettingCard>

                        <SettingCard title="Support" icon={BookOpen} color="#60A5FA">
                            <TouchableOpacity onPress={handleShowInstructions} style={styles.actionRow}>
                                <Text style={[styles.actionText, { color: colors.text }]}>View Quick Guide</Text>
                                <LayoutList size={20} color={colors.primary} />
                            </TouchableOpacity>
                        </SettingCard>

                        <SettingCard title="Danger Zone" icon={Trash2} color="#F87171">
                            <TouchableOpacity onPress={handleResetPress} style={styles.actionRow}>
                                <Text style={[styles.actionText, { color: colors.text }]}>Reset Progress</Text>
                                <RefreshCw size={18} color={colors.textSecondary} />
                            </TouchableOpacity>
                            <View style={[styles.divider, { backgroundColor: colors.border + '20' }]} />
                            <TouchableOpacity onPress={handleClearBookmarksPress} style={styles.actionRow}>
                                <Text style={[styles.actionText, { color: colors.danger, fontWeight: '900' }]}>Clear All Bookmarks</Text>
                            </TouchableOpacity>
                        </SettingCard>

                        <View style={[styles.footer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Text style={[styles.appName, { color: colors.primary }]}>PrepSwipe</Text>
                            <Text style={[styles.version, { color: colors.textSecondary }]}>v1.0.0 • Made with ❤️</Text>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};


const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        padding: Spacing.l,
        maxHeight: '85%',
        borderWidth: 4,
        borderBottomWidth: 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    titleBadge: {
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 3,
        transform: [{ rotate: '-2deg' }],
        ...Shadows.pop,
    },
    titleText: {
        fontSize: 22,
        fontWeight: '900',
        color: '#000',
        letterSpacing: 1,
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
        borderWidth: 3,
        ...Shadows.pop,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    card: {
        borderRadius: 24,
        borderWidth: 3,
        padding: Spacing.m,
        marginBottom: Spacing.l,
        ...Shadows.pop,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.m,
        gap: 12,
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ rotate: '3deg' }],
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    cardContent: {
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 16,
        padding: 4,
    },
    controlRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
    },
    controlLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    actionText: {
        fontSize: 16,
        fontWeight: '800',
    },
    divider: {
        height: 2,
        marginHorizontal: 12,
    },
    footer: {
        marginTop: Spacing.m,
        alignItems: 'center',
        padding: Spacing.l,
        borderRadius: 24,
        borderWidth: 3,
        borderStyle: 'dashed',
    },
    appName: {
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 4,
    },
    version: {
        fontSize: 12,
        fontWeight: '700',
    }
});

export default SettingsModal;
