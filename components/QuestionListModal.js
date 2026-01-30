import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing, BorderRadius, Shadows, Border } from '../constants/theme';
import { X, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useGame } from '../context/GameContext';

const QuestionListItem = ({ item, displayIndex, colors }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <Pressable
            style={[
                styles.itemContainer,
                {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    transform: [{ rotate: `${(Math.random() * 1.5 - 0.75).toFixed(1)}deg` }]
                }
            ]}
            onPress={() => setExpanded(!expanded)}
        >
            <View style={styles.headerRow}>
                <View style={[styles.categoryBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Text style={[styles.categoryText, { color: colors.textSecondary }]}>{item.category}</Text>
                </View>
                {expanded ? <ChevronUp size={20} color={colors.textSecondary} /> : <ChevronDown size={20} color={colors.textSecondary} />}
            </View>

            <Text style={[styles.questionText, { color: colors.text }]}>
                <Text style={{ fontWeight: '900', color: colors.primary }}>{displayIndex}. </Text>
                {item.question}
            </Text>

            {expanded && (
                <View style={styles.answerContainer}>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <Text style={[styles.answerLabel, { color: colors.success }]}>Answer:</Text>
                    <Text style={[styles.answerText, { color: colors.text }]}>{item.answer}</Text>
                    {item.explanation && (
                        <View style={[styles.explanationPill, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            <Text style={[styles.explanationText, { color: colors.textSecondary }]}>{item.explanation}</Text>
                        </View>
                    )}
                </View>
            )}
        </Pressable>
    );
};

const QuestionListModal = ({ visible, onClose }) => {
    const { colors, questions, currentCategory, triggerHaptic } = useGame();

    const handleClose = () => {
        triggerHaptic('light');
        onClose();
    };

    const title = currentCategory === 'All' ? 'All Questions' : `${currentCategory} Cards`;

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <View style={[styles.titleBadge, { backgroundColor: colors.primary, borderColor: colors.border, transform: [{ rotate: '-2deg' }] }]}>
                        <Text style={styles.titleText}>{title.toUpperCase()}</Text>
                    </View>
                    <Pressable
                        onPress={handleClose}
                        style={[styles.closeButton, { backgroundColor: colors.card, borderColor: colors.border, transform: [{ rotate: '3deg' }] }]}
                    >
                        <X color={colors.text} size={28} strokeWidth={3} />
                    </Pressable>
                </View>

                <FlatList
                    data={questions}
                    keyExtractor={(item, index) => item.index?.toString() || index.toString()}
                    renderItem={({ item, index }) => (
                        <QuestionListItem item={item} displayIndex={index + 1} colors={colors} />
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No questions found.</Text>
                        </View>
                    }
                />
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
        flex: 1,
        marginRight: 12,
    },
    titleText: {
        fontSize: 18,
        fontWeight: '1000',
        color: '#FFF',
        letterSpacing: 0.5,
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
        fontSize: 16,
        fontWeight: '900',
        lineHeight: 22,
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
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    answerText: {
        fontSize: 18,
        fontWeight: '900',
        marginBottom: Spacing.m,
    },
    explanationPill: {
        padding: Spacing.m,
        borderRadius: 12,
        borderWidth: 2,
    },
    explanationText: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 64,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '900',
    }
});

export default QuestionListModal;
