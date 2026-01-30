import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { Copy, Download, ExternalLink, X } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shadows, Spacing } from '../constants/theme';

const Decoration = ({ style, colors }) => (
    <View style={[styles.decoration, style, { backgroundColor: colors.text + '20', borderColor: colors.border }]} />
);

const AddMindmapModal = ({ visible, onClose, onSave, colors }) => {
    const [topic, setTopic] = useState('');
    const [description, setDescription] = useState('');
    const [jsonText, setJsonText] = useState('');
    const handleCopyPrompt = async () => {
        const selectedTopic = topic.trim() || '[YOUR_TOPIC]';
        const AI_PROMPT = `Create a detailed hierarchical mindmap about "${selectedTopic}". 
        
Description/Context: ${description || 'General overview'}

Return ONLY a valid JSON object representing the root node. The structure must be strict:
{
  "id": "root",
  "label": "${selectedTopic}",
  "note": "A concise core definition or overview of the topic.",
  "children": [
    {
      "id": "unique_string_id_1",
      "label": "Subtopic Label",
      "note": "A clear, 1-sentence definition or key fact about this subtopic.",
      "children": [ ... ] 
    },
    ...
  ]
}

- Ensure roughly 3-5 main branches.
- Each branch should have 2-4 sub-branches.
- Keep labels concise (1-5 words).
- Every node MUST include a "note" field with a helpful 1-sentence definition or explanation.
- Do not include any markdown formatting (like \`\`\`json), just the raw JSON.`;

        await Clipboard.setStringAsync(AI_PROMPT);
        Alert.alert("Copied!", "Prompt copied! Now open ChatGPT and paste it.");
    };

    const handleOpenChatGPT = async () => {
        const appUrl = 'chatgpt://';
        const webUrl = 'https://chat.openai.com';

        try {
            const canOpen = await Linking.canOpenURL(appUrl);
            if (canOpen) {
                await Linking.openURL(appUrl);
            } else {
                await Linking.openURL(webUrl);
            }
        } catch (e) {
            console.error("ChatGPT Deep Link failed, falling back to web:", e);
            await Linking.openURL(webUrl);
        }
    };

    const handleSave = () => {
        if (!topic.trim()) {
            Alert.alert("Missing Topic", "Please enter a topic name.");
            return;
        }

        if (!jsonText.trim()) {
            Alert.alert("Missing JSON", "Please paste the JSON content from ChatGPT.");
            return;
        }

        try {
            // Clean potentially markdown wrapped JSON
            const cleanJson = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(cleanJson);

            if (!data.id || !data.label || !Array.isArray(data.children)) {
                throw new Error("Invalid structure. Root must have id, label, and children array.");
            }

            // Assign a unique ID to the mindmap document itself
            const mindmap = {
                id: Date.now().toString(),
                title: topic,
                description: description,
                root: data,
                createdAt: new Date().toISOString()
            };

            onSave(mindmap);

            // Reset fields
            setTopic('');
            setDescription('');
            setJsonText('');
            onClose();
            Alert.alert("Success", "Mindmap created successfully!");

        } catch (e) {
            Alert.alert("Parsing Failed", `Invalid JSON: ${e.message}`);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
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
                                <Text style={styles.titleText}>NEW MINDMAP</Text>
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
                            {/* Topic & Description */}
                            <View style={[styles.section]}>
                                <Text style={[styles.label, { color: colors.text, marginBottom: 8 }]}>TOPIC & CONTEXT</Text>
                                <TextInput
                                    style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card, marginBottom: Spacing.s }]}
                                    value={topic}
                                    onChangeText={setTopic}
                                    placeholder="Enter Topic (e.g. Photosynthesis)..."
                                    placeholderTextColor={colors.textSecondary}
                                />
                                <TextInput
                                    style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card, height: 80, textAlignVertical: 'top' }]}
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    placeholder="Optional description/context..."
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>

                            {/* AI Prompt Section */}
                            <View style={[styles.card, { borderColor: colors.secondary, backgroundColor: colors.card + '80', marginTop: Spacing.m, transform: [{ rotate: '1deg' }] }]}>
                                <Text style={[styles.label, { color: colors.secondary, marginBottom: 8 }]}>GENERATE STRUCTURE</Text>
                                <Text style={[styles.cardText, { color: colors.text }]}>
                                    1. Copy the refined prompt.
                                    {'\n'}2. Paste it into ChatGPT.
                                </Text>

                                <View style={styles.buttonRow}>
                                    <Pressable
                                        style={[styles.actionButton, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                                        onPress={handleCopyPrompt}
                                    >
                                        <Copy color="#FFF" size={18} />
                                        <Text style={styles.buttonText}>Copy Prompt</Text>
                                    </Pressable>

                                    <Pressable
                                        style={[styles.actionButton, { backgroundColor: '#10A37F', borderColor: colors.border }]}
                                        onPress={handleOpenChatGPT}
                                    >
                                        <ExternalLink color="#FFF" size={18} />
                                        <Text style={styles.buttonText}>Open ChatGPT</Text>
                                    </Pressable>
                                </View>
                            </View>

                            {/* Paste Section */}
                            <View style={[styles.section, { marginTop: Spacing.l }]}>
                                <Text style={[styles.label, { color: colors.success, marginBottom: 8 }]}>PASTE RESULT</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea, { borderColor: colors.success, color: colors.text, backgroundColor: colors.card }]}
                                    value={jsonText}
                                    onChangeText={setJsonText}
                                    multiline
                                    placeholder="Paste the JSON here..."
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>
                        </ScrollView>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Pressable
                                style={[styles.saveButton, { backgroundColor: colors.primary, borderColor: colors.border }]}
                                onPress={handleSave}
                            >
                                <Download color="#FFF" size={24} />
                                <Text style={styles.saveButtonText}>Create Mindmap</Text>
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
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    safeContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: Spacing.m,
    },
    content: {
        borderRadius: 32,
        borderWidth: 4,
        flex: 1,
        width: '100%',
        padding: Spacing.l,
        ...Shadows.popHeavy,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.m,
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
        fontWeight: '900',
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
        flex: 1,
    },
    formContent: {
        paddingBottom: Spacing.m,
    },
    section: {
        marginBottom: Spacing.m,
    },
    label: {
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        borderWidth: 3,
        borderRadius: 16,
        padding: Spacing.m,
        fontSize: 14,
        fontWeight: '600',
        ...Shadows.pop,
    },
    textArea: {
        height: 150,
        textAlignVertical: 'top',
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    card: {
        padding: Spacing.m,
        borderRadius: 20,
        borderWidth: 3,
        gap: Spacing.m,
        ...Shadows.pop,
    },
    cardText: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: Spacing.s,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 3,
        gap: 6,
        ...Shadows.pop,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 12,
        textTransform: 'uppercase',
    },
    footer: {
        marginTop: Spacing.s,
    },
    saveButton: {
        height: 60,
        borderRadius: 20,
        borderWidth: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.s,
        ...Shadows.popHeavy,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    decoration: {
        position: 'absolute',
        width: 15,
        height: 15,
        borderWidth: 2,
        borderRadius: 2,
        zIndex: 10,
    },
});

export default AddMindmapModal;
