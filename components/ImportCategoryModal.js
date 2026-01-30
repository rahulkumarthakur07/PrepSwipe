import * as Clipboard from 'expo-clipboard';
import { Copy, Download, X } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shadows, Spacing } from '../constants/theme';

const Decoration = ({ style, colors }) => (
    <View style={[styles.decoration, style, { backgroundColor: colors.text + '20', borderColor: colors.border }]} />
);

const ImportCategoryModal = ({ visible, onClose, onImport, colors }) => {
    const [jsonText, setJsonText] = useState('');
    const [topic, setTopic] = useState('');

    const handleCopyPrompt = async () => {
        const selectedTopic = topic.trim() || '[YOUR_TOPIC]';
        const AI_PROMPT = `Create a JSON array of 10 trivia questions about ${selectedTopic}. 
Each object must have these exact keys:
- "category": "${selectedTopic}" (string)
- "question": "The question text" (string)
- "answer": "The answer" (string)
- "explanation": "Brief explanation" (string)
- "level": "Easy", "Medium", or "Hard" (string)

Return ONLY the valid JSON array, no other text.`;

        await Clipboard.setStringAsync(AI_PROMPT);
        Alert.alert("Copied!", `Prompt for "${selectedTopic}" copied! Paste it into ChatGPT.`);
    };

    const handleImport = () => {
        if (!jsonText.trim()) {
            Alert.alert("Empty Input", "Please paste the JSON content first.");
            return;
        }

        try {
            const data = JSON.parse(jsonText);

            if (!Array.isArray(data)) {
                throw new Error("Input must be a JSON array.");
            }

            const isValid = data.every(item =>
                item.category && item.question && item.answer
            );

            if (!isValid) {
                throw new Error("Missing required fields (category, question, answer).");
            }

            onImport(data);
            setJsonText('');
            setTopic('');
            onClose();
            Alert.alert("Success", `Imported ${data.length} questions!`);

        } catch (e) {
            Alert.alert("Import Failed", `Invalid JSON: ${e.message}`);
        }
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

                        {/* Header */}
                        <View style={styles.header}>
                            <View style={[styles.titleBadge, { backgroundColor: colors.primary, borderColor: colors.border, transform: [{ rotate: '-2deg' }] }]}>
                                <Text style={styles.titleText}>IMPORT VIA AI</Text>
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
                            {/* Step 1 */}
                            <View style={[styles.section, { transform: [{ rotate: '1deg' }] }]}>
                                <View style={styles.labelRow}>
                                    <Text style={[styles.label, { color: colors.secondary }]}>Step 1: Get Content</Text>
                                    <View style={[styles.numberBadge, { backgroundColor: colors.secondary }]}><Text style={styles.numberText}>1</Text></View>
                                </View>

                                <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
                                    <Text style={[styles.cardText, { color: colors.text }]}>
                                        Enter a topic, copy the prompt, and paste it into ChatGPT.
                                    </Text>

                                    <TextInput
                                        style={[styles.input, { borderColor: colors.secondary, color: colors.text, marginBottom: Spacing.s, backgroundColor: colors.background }]}
                                        value={topic}
                                        onChangeText={setTopic}
                                        placeholder="Enter Topic (e.g. Zoology)..."
                                        placeholderTextColor={colors.textSecondary}
                                    />

                                    <Pressable
                                        style={[styles.copyButton, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                                        onPress={handleCopyPrompt}
                                    >
                                        <Copy color="#FFF" size={20} />
                                        <Text style={styles.buttonText}>Copy Template</Text>
                                    </Pressable>
                                </View>
                                <Decoration style={{ top: -5, right: -5, transform: [{ rotate: '45deg' }] }} colors={colors} />
                            </View>

                            {/* Step 2 */}
                            <View style={[styles.section, { marginTop: Spacing.l, transform: [{ rotate: '-1deg' }] }]}>
                                <View style={styles.labelRow}>
                                    <Text style={[styles.label, { color: colors.success }]}>Step 2: Paste JSON</Text>
                                    <View style={[styles.numberBadge, { backgroundColor: colors.success }]}><Text style={styles.numberText}>2</Text></View>
                                </View>

                                <TextInput
                                    style={[styles.input, styles.textArea, { borderColor: colors.success, color: colors.text, backgroundColor: colors.background }]}
                                    value={jsonText}
                                    onChangeText={setJsonText}
                                    multiline
                                    placeholder="Paste the JSON array here..."
                                    placeholderTextColor={colors.textSecondary}
                                />
                                <Decoration style={{ bottom: -5, left: -5, width: 20, height: 6 }} colors={colors} />
                            </View>
                        </ScrollView>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Pressable
                                style={[styles.importButton, { backgroundColor: colors.primary, borderColor: colors.border }]}
                                onPress={handleImport}
                            >
                                <Download color="#FFF" size={24} />
                                <Text style={styles.importButtonText}>Start Import</Text>
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
        textTransform: 'uppercase',
    },
    closeButton: {
        padding: 6,
        borderRadius: 14,
        borderWidth: 3,
        ...Shadows.pop,
    },
    form: {
        // flex: 1 removed to allow content to drive height
    },
    formContent: {
        paddingBottom: Spacing.m,
    },
    section: {
        position: 'relative',
        marginBottom: Spacing.m,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        fontSize: 12,
        fontWeight: '1000',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    numberBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#000',
    },
    numberText: {
        color: '#FFF',
        fontWeight: '900',
        fontSize: 12,
    },
    card: {
        padding: Spacing.m,
        borderRadius: 20,
        borderWidth: 3,
        gap: Spacing.m,
    },
    cardText: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
        marginBottom: 12,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.m,
        borderRadius: 16,
        borderWidth: 3,
        gap: 8,
        ...Shadows.pop,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: '900',
        textTransform: 'uppercase'
    },
    input: {
        borderWidth: 4,
        borderRadius: 20,
        padding: Spacing.m,
        fontSize: 14,
        fontWeight: '600',
        ...Shadows.pop,
    },
    textArea: {
        height: 150,
        textAlignVertical: 'top',
    },
    decoration: {
        position: 'absolute',
        width: 15,
        height: 15,
        borderWidth: 2,
        borderRadius: 2,
        zIndex: 10,
    },
    footer: {
        marginTop: Spacing.m,
    },
    importButton: {
        height: 64,
        borderRadius: 24,
        borderWidth: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.s,
        ...Shadows.popHeavy,
    },
    importButtonText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '1000',
        textTransform: 'uppercase',
    },
});

export default ImportCategoryModal;
