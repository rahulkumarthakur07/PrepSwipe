import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing, BorderRadius, Shadows, Border } from '../constants/theme';
import { X, Trash2 } from 'lucide-react-native';
import { useGame } from '../context/GameContext';

const BookmarkItem = ({ item, onRemove, colors }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <Pressable
            style={[
                styles.itemContainer,
                {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    transform: [{ rotate: `${(Math.random() * 2 - 1).toFixed(1)}deg` }]
                }
            ]}
            onPress={() => setExpanded(!expanded)}
        >
            <View style={styles.headerRow}>
                <View style={[styles.categoryBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Text style={[styles.categoryText, { color: colors.textSecondary }]}>{item.category}</Text>
                </View>
                <Pressable onPress={() => onRemove(item.index)} hitSlop={10}>
                    <Trash2 size={20} color={colors.textSecondary} />
                </Pressable>
            </View>

            <Text style={[styles.questionText, { color: colors.text }]}>{item.question}</Text>

            {expanded && (
                <View style={styles.answerContainer}>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <Text style={[styles.answerLabel, { color: colors.success }]}>Answer:</Text>
                    <Text style={[styles.answerText, { color: colors.text }]}>{item.answer}</Text>
                    {item.explanation && (
                        <Text style={[styles.explanationText, { color: colors.textSecondary }]}>{item.explanation}</Text>
                    )}
                </View>
            )}
        </Pressable>
    );
};

const BookmarkModal = ({ visible, onClose, bookmarks, onRemoveBookmark }) => {
    const { colors, playPopSound, triggerHaptic } = useGame();

    const handleClose = () => {
        triggerHaptic('light');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <View style={[styles.titleBadge, { backgroundColor: colors.primary, borderColor: colors.border, transform: [{ rotate: '-2deg' }] }]}>
                        <Text style={styles.titleText}>BOOKMARKS</Text>
                    </View>
                    <Pressable onPress={handleClose} style={[styles.closeButton, { backgroundColor: colors.card, borderColor: colors.border, transform: [{ rotate: '3deg' }] }]}>
                        <X color={colors.text} size={28} strokeWidth={3} />
                    </Pressable>
                </View>

                {bookmarks.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyText, { color: colors.text }]}>No saved questions yet.</Text>
                        <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>Swipe right on a card to save it here.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={bookmarks}
                        keyExtractor={(item) => item.index.toString()}
                        renderItem={({ item }) => (
                            <BookmarkItem item={item} onRemove={onRemoveBookmark} colors={colors} />
                        )}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: Spacing.l,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.m,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleBadge: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 4,
        ...Shadows.pop,
    },
    titleText: {
        fontSize: 22,
        fontWeight: '1000',
        color: '#FFF',
        letterSpacing: 1,
    },
    closeButton: {
        padding: 8,
        borderRadius: 16,
        borderWidth: 4,
        ...Shadows.pop,
    },
    listContent: {
        padding: Spacing.m,
        paddingBottom: 40,
    },
    itemContainer: {
        borderRadius: 24,
        padding: Spacing.m,
        marginBottom: Spacing.l,
        borderWidth: 4,
        ...Shadows.popHeavy,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
        borderWidth: 3,
        transform: [{ rotate: '-3deg' }],
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    questionText: {
        fontSize: 18,
        fontWeight: '900',
        marginBottom: Spacing.s,
        lineHeight: 24,
    },
    answerContainer: {
        marginTop: Spacing.m,
        padding: Spacing.m,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderWidth: 2,
        borderStyle: 'dashed',
    },
    answerLabel: {
        fontSize: 12,
        fontWeight: '1000',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    answerText: {
        fontSize: 20,
        fontWeight: '900',
        marginBottom: Spacing.m,
    },
    explanationText: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
        opacity: 0.8,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    emptyText: {
        fontSize: 22,
        fontWeight: '900',
        marginBottom: Spacing.s,
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        opacity: 0.6,
    },
});

export default BookmarkModal;
