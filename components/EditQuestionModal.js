import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing, BorderRadius, Shadows, Border } from '../constants/theme';
import { X, Save, Trash2, Pin } from 'lucide-react-native';
import { useGame } from '../context/GameContext';

const Decoration = ({ style, colors }) => (
    <View style={[styles.decoration, style, { backgroundColor: colors.text + '20', borderColor: colors.border }]} />
);

const EditQuestionModal = ({ visible, onClose, initialData }) => {
    const { colors, upsertUserQuestion, deleteUserQuestion, userQuestions, triggerHaptic } = useGame();

    const [qText, setQText] = useState('');
    const [aText, setAText] = useState('');
    const [eText, setEText] = useState('');
    const [catText, setCatText] = useState('');

    useEffect(() => {
        if (initialData && visible) {
            setQText(initialData.question || '');
            setAText(initialData.answer || '');
            setEText(initialData.explanation || '');
            setCatText(initialData.category || '');
        }
    }, [initialData, visible]);

    const handleDelete = () => {
        Alert.alert(
            "Delete Question",
            "Are you sure you want to delete this question?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteUserQuestion(initialData.index);
                        triggerHaptic('heavy');
                        onClose();
                    }
                }
            ]
        );
    };

    const handleSave = () => {
        const trimmedQ = qText.trim();
        const trimmedA = aText.trim();
        const trimmedCat = catText.trim();

        if (!trimmedQ || !trimmedA || !trimmedCat) {
            Alert.alert('Required Fields', 'Please provide a Category, Question, and Answer.');
            return;
        }

        const updatedQuestion = {
            ...initialData,
            question: trimmedQ,
            answer: trimmedA,
            explanation: eText.trim(),
            category: trimmedCat,
        };

        upsertUserQuestion(updatedQuestion);
        triggerHaptic('success');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                style={styles.overlay}
            >
                <SafeAreaView style={styles.safeContainer} edges={['bottom', 'top']}>
                    <View style={[styles.content, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <View style={styles.header}>
                            <View style={[styles.titleBadge, { backgroundColor: colors.primary, borderColor: colors.border, transform: [{ rotate: '-2deg' }] }]}>
                                <Text style={styles.titleText}>
                                    {initialData?.index ? 'EDIT CARD' : 'NEW CARD'}
                                </Text>
                            </View>
                            <Pressable onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.card, borderColor: colors.border, transform: [{ rotate: '3deg' }] }]}>
                                <X color={colors.text} size={28} strokeWidth={3} />
                            </Pressable>
                        </View>

                        <ScrollView
                            style={styles.form}
                            contentContainerStyle={styles.formContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={[styles.inputWrapper, { transform: [{ rotate: '-1deg' }] }]}>
                                <Text style={[styles.label, { color: colors.primary }]}>Category</Text>
                                <TextInput
                                    style={[styles.input, { borderColor: colors.primary, color: colors.text }]}
                                    value={catText}
                                    onChangeText={setCatText}
                                    placeholder="e.g. History"
                                    placeholderTextColor={colors.textSecondary}
                                />
                                <Decoration style={{ top: -5, left: -5, transform: [{ rotate: '45deg' }] }} colors={colors} />
                                <Decoration style={{ bottom: -5, right: -5, transform: [{ rotate: '45deg' }] }} colors={colors} />
                            </View>

                            <View style={[styles.inputWrapper, { transform: [{ rotate: '0.8deg' }] }]}>
                                <Text style={[styles.label, { color: colors.secondary || colors.primary }]}>Question</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea, { borderColor: colors.border, color: colors.text }]}
                                    value={qText}
                                    onChangeText={setQText}
                                    multiline
                                    placeholder="Enter question..."
                                    placeholderTextColor={colors.textSecondary}
                                />
                                <Decoration style={{ top: -5, right: -5, width: 20, height: 6 }} colors={colors} />
                                <Decoration style={{ bottom: -5, left: -5, width: 20, height: 6 }} colors={colors} />
                            </View>

                            <View style={[styles.inputWrapper, { transform: [{ rotate: '-0.5deg' }] }]}>
                                <Text style={[styles.label, { color: colors.success }]}>Answer</Text>
                                <TextInput
                                    style={[styles.input, { borderColor: colors.success, color: colors.text }]}
                                    value={aText}
                                    onChangeText={setAText}
                                    placeholder="Enter answer..."
                                    placeholderTextColor={colors.textSecondary}
                                />
                                <Decoration style={{ top: 10, right: -8, width: 6, height: 20 }} colors={colors} />
                                <Decoration style={{ bottom: 10, left: -8, width: 6, height: 20 }} colors={colors} />
                            </View>

                            <View style={[styles.inputWrapper, { transform: [{ rotate: '1.2deg' }] }]}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>Explanation (Optional)</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea, { borderColor: colors.border, color: colors.text, borderStyle: 'dashed' }]}
                                    value={eText}
                                    onChangeText={setEText}
                                    multiline
                                    placeholder="Add more details..."
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.footer}>
                            {initialData?.index && userQuestions.some(q => q.index === initialData.index) && (
                                <Pressable
                                    style={[styles.deleteButton, { borderColor: colors.danger }]}
                                    onPress={handleDelete}
                                >
                                    <Trash2 color={colors.danger} size={20} />
                                </Pressable>
                            )}
                            <Pressable
                                style={[styles.saveButton, { backgroundColor: colors.success, borderColor: colors.border, flex: 1 }]}
                                onPress={handleSave}
                            >
                                <Save color="#FFF" size={20} />
                                <Text style={styles.saveButtonText}>Save Card</Text>
                            </Pressable>
                        </View>
                    </View>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    safeContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: Spacing.m,
    },
    content: {
        borderRadius: 32,
        borderWidth: 4,
        maxHeight: '90%',
        width: '100%',
        padding: Spacing.l,
        ...Shadows.popHeavy,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    titleBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 3,
        ...Shadows.pop,
    },
    titleText: {
        fontSize: 18,
        fontWeight: '1000',
        color: '#FFF',
    },
    closeButton: {
        padding: 6,
        borderRadius: 14,
        borderWidth: 3,
        ...Shadows.pop,
    },
    form: {
        maxHeight: 450,
    },
    formContent: {
        paddingBottom: Spacing.m,
    },
    label: {
        fontSize: 11,
        fontWeight: '1000',
        textTransform: 'uppercase',
        marginBottom: 6,
        letterSpacing: 1.5,
    },
    inputWrapper: {
        marginBottom: Spacing.xl,
        position: 'relative',
    },
    decoration: {
        position: 'absolute',
        width: 15,
        height: 15,
        borderWidth: 2,
        borderRadius: 2,
        zIndex: 10,
    },
    input: {
        borderWidth: 4,
        borderRadius: 20,
        padding: Spacing.m,
        fontSize: 16,
        fontWeight: '900',
        backgroundColor: 'rgba(255,255,255,0.05)',
        ...Shadows.pop,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    footer: {
        flexDirection: 'row',
        gap: Spacing.m,
        alignItems: 'center',
        marginTop: Spacing.m,
    },
    saveButton: {
        height: 64,
        borderRadius: 24,
        borderWidth: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...Shadows.popHeavy,
    },
    deleteButton: {
        height: 64,
        width: 64,
        borderRadius: 24,
        borderWidth: 4,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.popHeavy,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '1000',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});

export default EditQuestionModal;
