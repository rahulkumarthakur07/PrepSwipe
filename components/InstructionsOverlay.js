import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing, BorderRadius, Border, Shadows } from '../constants/theme';
import {
    SwipeLeft,
    SwipeRight,
    ChevronUp,
    Bookmark,
    Trash2,
    FastForward,
    Settings,
    Menu,
    RefreshCw,
    X,
    LayoutList
} from 'lucide-react-native';
import { useGame } from '../context/GameContext';

const { width } = Dimensions.get('window');

const InstructionRow = ({ icon: Icon, title, description, color, colors }) => (
    <View style={[styles.row, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <View style={[styles.iconBox, { backgroundColor: color + '20', borderColor: color }]}>
            <Icon color={color} size={28} />
        </View>
        <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>{description}</Text>
        </View>
    </View>
);

const InstructionsOverlay = ({ visible, onClose }) => {
    const { colors, setHasSeenInstructions, triggerHaptic } = useGame();

    const handleDismiss = () => {
        triggerHaptic('success');
        setHasSeenInstructions(true);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={[styles.content, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <View style={styles.header}>
                            <Text style={[styles.title, { color: colors.primary }]}>How to PrepSwipe</Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Quick guide to master your study session</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Gestures</Text>
                            <InstructionRow
                                icon={Trash2}
                                title="Swipe Left"
                                description="Discard card (won't show again in current session)"
                                color="#EF4444"
                                colors={colors}
                            />
                            <InstructionRow
                                icon={Bookmark}
                                title="Swipe Right"
                                description="Bookmark card (saves for later review)"
                                color="#10B981"
                                colors={colors}
                            />
                            <InstructionRow
                                icon={FastForward}
                                title="Swipe Up"
                                description="Skip card (see it again later)"
                                color={colors.primary}
                                colors={colors}
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Buttons</Text>
                            <View style={styles.buttonGrid}>
                                <View style={styles.buttonInfo}>
                                    <Menu size={16} color={colors.text} />
                                    <Text style={[styles.buttonLabel, { color: colors.text }]}>Categories</Text>
                                </View>
                                <View style={styles.buttonInfo}>
                                    <LayoutList size={16} color={colors.text} />
                                    <Text style={[styles.buttonLabel, { color: colors.text }]}>List</Text>
                                </View>
                                <View style={styles.buttonInfo}>
                                    <RefreshCw size={16} color={colors.text} />
                                    <Text style={[styles.buttonLabel, { color: colors.text }]}>Reset Discarded</Text>
                                </View>
                                <View style={styles.buttonInfo}>
                                    <Settings size={16} color={colors.text} />
                                    <Text style={[styles.buttonLabel, { color: colors.text }]}>Settings</Text>
                                </View>
                            </View>
                        </View>

                        <Pressable
                            onPress={handleDismiss}
                            style={({ pressed }) => [
                                styles.dismissButton,
                                {
                                    backgroundColor: colors.primary,
                                    borderColor: colors.border,
                                    transform: [{ scale: pressed ? 0.98 : 1 }]
                                }
                            ]}
                        >
                            <Text style={styles.dismissText}>Mastered It!</Text>
                        </Pressable>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.m,
    },
    safeArea: {
        width: '100%',
        maxWidth: 400,
    },
    content: {
        borderRadius: BorderRadius.l,
        borderWidth: Border.width,
        padding: Spacing.l,
        ...Shadows.pop,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    section: {
        marginBottom: Spacing.l,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: Spacing.s,
        marginLeft: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.m,
        borderRadius: BorderRadius.m,
        borderWidth: Border.width,
        marginBottom: Spacing.s,
        ...Shadows.pop,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.s,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.m,
    },
    rowText: {
        flex: 1,
    },
    rowTitle: {
        fontSize: 16,
        fontWeight: '800',
    },
    rowDesc: {
        fontSize: 12,
        fontWeight: '500',
    },
    buttonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        padding: 4,
    },
    buttonInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 4,
    },
    buttonLabel: {
        fontSize: 10,
        fontWeight: '700',
    },
    dismissButton: {
        height: 60,
        borderRadius: BorderRadius.m,
        borderWidth: Border.width,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.m,
        ...Shadows.pop,
    },
    dismissText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '900',
    }
});

export default InstructionsOverlay;
