import { BookOpen, ChevronRight, Download, Edit2, Plus, Search, Trash2, X } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Border, Shadows, Spacing } from '../constants/theme';
import { useGame } from '../context/GameContext';
import EditQuestionModal from './EditQuestionModal';
import ImportCategoryModal from './ImportCategoryModal';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.m,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.m,
    },
    titleBadge: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 4,
        backgroundColor: '#FFF',
        ...Shadows.pop,
        flex: 1,
        marginRight: 12,
    },
    titleText: {
        fontSize: 20,
        fontWeight: '1000',
        textTransform: 'uppercase',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    closeButton: {
        padding: 8,
        borderRadius: 16,
        borderWidth: 4,
        ...Shadows.pop,
    },
    content: {
        flex: 1,
        padding: Spacing.m,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.m,
        borderRadius: 20,
        borderWidth: 4,
        height: 60,
        marginBottom: Spacing.xl,
        ...Shadows.pop,
    },
    searchInput: {
        flex: 1,
        marginLeft: Spacing.s,
        fontWeight: '900',
        fontSize: 16,
    },
    listContainer: {
        paddingBottom: 150,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.l,
        borderRadius: 24,
        borderWidth: 4,
        marginBottom: Spacing.l,
        ...Shadows.popHeavy,
    },
    itemInfo: {
        flex: 1,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 6,
    },
    itemTitle: {
        fontSize: 22,
        fontWeight: '900',
    },
    activeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#000',
    },
    activeBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '1000',
    },
    itemSub: {
        fontSize: 14,
        fontWeight: '700',
        opacity: 0.7,
    },
    createButton: {
        position: 'absolute',
        bottom: Spacing.xl,
        left: Spacing.m,
        right: Spacing.m,
        height: 64,
        borderRadius: 24,
        borderWidth: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.s,
        ...Shadows.popHeavy,
    },
    createButtonText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '1000',
        textTransform: 'uppercase',
    },
    categoryActions: {
        flexDirection: 'row',
        gap: Spacing.m,
        marginBottom: Spacing.xl,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.m,
        height: 60,
        borderRadius: 20,
        borderWidth: 4,
        gap: 8,
        ...Shadows.pop,
    },
    actionButtonText: {
        color: '#FFF',
        fontWeight: '1000',
        fontSize: 14,
    },
    footerContainer: {
        position: 'absolute',
        bottom: Spacing.xl,
        left: Spacing.m,
        right: Spacing.m,
        flexDirection: 'row',
        gap: Spacing.m,
    },
    footerButton: {
        flex: 1,
        height: 64,
        borderRadius: 24,
        borderWidth: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.s,
        ...Shadows.popHeavy,
    },
    questionItem: {
        padding: Spacing.m,
        borderRadius: 20,
        borderWidth: Border.heavy,
        marginBottom: Spacing.l,
        flexDirection: 'row',
        alignItems: 'center',
        ...Shadows.pop,
    },
    questionText: {
        fontSize: 16,
        fontWeight: '900',
        marginBottom: 6,
    },
    answerText: {
        fontSize: 14,
        fontWeight: '1000',
    },
    qActions: {
        flexDirection: 'row',
        marginLeft: Spacing.s,
    },
    qActionBtn: {
        padding: 10,
    },
    empty: {
        alignItems: 'center',
        marginTop: 60,
        padding: 40,
        borderRadius: 24,
        borderWidth: 4,
        borderStyle: 'dashed',
    }
});

const CategoryItem = ({ name, count, onPress, isActive, colors }) => (
    <Pressable
        style={[
            styles.itemContainer,
            {
                backgroundColor: colors.card,
                borderColor: isActive ? colors.primary : colors.border,
                transform: [{ rotate: `${(Math.random() * 2 - 1).toFixed(1)}deg` }]
            }
        ]}
        onPress={onPress}
    >
        <View style={styles.itemInfo}>
            <View style={styles.itemHeader}>
                <Text style={[styles.itemTitle, { color: colors.text }]}>{name}</Text>
                {isActive && (
                    <View style={[styles.activeBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.activeBadgeText}>ACTIVE</Text>
                    </View>
                )}
            </View>
            <Text style={[styles.itemSub, { color: colors.textSecondary }]}>{count} Questions</Text>
        </View>
        <ChevronRight size={20} color={isActive ? colors.primary : colors.textSecondary} />
    </Pressable>
);

const CategoriesModal = ({ visible, onClose }) => {
    const {
        colors, categories, questions, allQuestions, userQuestions, baseQuestions,
        changeCategory, currentCategory, deleteUserQuestion, deleteCategory, triggerHaptic, importQuestions
    } = useGame();

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);

    const handleClose = () => {
        triggerHaptic('light');
        if (selectedCategory) {
            setSelectedCategory(null);
        } else {
            onClose();
        }
    };

    const handleOpenCategory = () => {
        triggerHaptic('success');
        changeCategory(selectedCategory);
        setSelectedCategory(null);
        onClose();
    };

    const handleDeleteCategory = (cat) => {
        Alert.alert(
            "Delete Category",
            `Are you sure you want to delete "${cat}" and all its custom questions?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteCategory(cat);
                        setSelectedCategory(null);
                        triggerHaptic('heavy');
                    }
                }
            ]
        );
    };

    const handleDeleteQuestion = (q) => {
        Alert.alert(
            "Delete Question",
            "Are you sure you want to delete this question?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteUserQuestion(q.index);
                        triggerHaptic('heavy');
                    }
                }
            ]
        );
    };

    const handleCreateQuestion = () => {
        setEditingQuestion({ category: selectedCategory === 'New Category' ? '' : selectedCategory });
        setEditModalVisible(true);
    };

    const handleEditQuestion = (q) => {
        setEditingQuestion(q);
        setEditModalVisible(true);
    };

    const filteredCategories = categories.filter(c =>
        c.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const categoryQuestions = selectedCategory
        ? (selectedCategory === 'All' ? allQuestions : allQuestions.filter(q => q.category === selectedCategory))
        : [];

    const isUserCategory = selectedCategory && selectedCategory !== 'All' && !baseQuestions.some(q => q.category === selectedCategory);

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <View style={[styles.titleBadge, { backgroundColor: colors.card, borderColor: colors.border, transform: [{ rotate: '-2deg' }] }]}>
                        <Text style={[styles.titleText, { color: colors.text }]}>{selectedCategory || 'CATEGORIES'}</Text>
                    </View>
                    <View style={styles.headerActions}>
                        {isUserCategory && (
                            <Pressable
                                onPress={() => handleDeleteCategory(selectedCategory)}
                                style={[styles.closeButton, { backgroundColor: colors.danger + '20', borderColor: colors.danger, marginRight: 8 }]}
                            >
                                <Trash2 color={colors.danger} size={20} />
                            </Pressable>
                        )}
                        <Pressable onPress={handleClose} style={[styles.closeButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <X color={colors.text} size={24} />
                        </Pressable>
                    </View>
                </View>

                {!selectedCategory ? (
                    <View style={styles.content}>
                        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Search size={20} color={colors.textSecondary} />
                            <TextInput
                                style={[styles.searchInput, { color: colors.text }]}
                                placeholder="Search categories..."
                                placeholderTextColor={colors.textSecondary}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        <FlatList
                            data={filteredCategories}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => {
                                const count = item === 'All' ? allQuestions.length : allQuestions.filter(q => q.category === item).length;
                                return (
                                    <CategoryItem
                                        name={item}
                                        count={count}
                                        colors={colors}
                                        isActive={currentCategory === item}
                                        onPress={() => setSelectedCategory(item)}
                                    />
                                );
                            }}
                            contentContainerStyle={styles.listContainer}
                        />

                        <View style={styles.footerContainer}>
                            <Pressable
                                style={[styles.footerButton, { backgroundColor: colors.primary, borderColor: colors.border }]}
                                onPress={() => setSelectedCategory('New Category')}
                            >
                                <Plus color="#FFF" size={24} />
                                <Text style={styles.createButtonText}>Manual</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.footerButton, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                                onPress={() => setImportModalVisible(true)}
                            >
                                <Download color="#FFF" size={24} />
                                <Text style={styles.createButtonText}>AI Import</Text>
                            </Pressable>
                        </View>
                    </View>
                ) : (
                    <View style={styles.content}>
                        <View style={styles.categoryActions}>
                            <Pressable
                                style={[styles.actionButton, { backgroundColor: colors.success, borderColor: colors.border }]}
                                onPress={handleOpenCategory}
                            >
                                <BookOpen color="#FFF" size={20} />
                                <Text style={styles.actionButtonText}>Start Learning</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.actionButton, { backgroundColor: colors.primary, borderColor: colors.border }]}
                                onPress={handleCreateQuestion}
                            >
                                <Plus color="#FFF" size={20} />
                                <Text style={styles.actionButtonText}>Add Card</Text>
                            </Pressable>
                        </View>

                        <FlatList
                            data={categoryQuestions}
                            keyExtractor={(item, index) => item.index?.toString() || index.toString()}
                            renderItem={({ item }) => (
                                <View style={[styles.questionItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.questionText, { color: colors.text }]} numberOfLines={2}>
                                            {item.question}
                                        </Text>
                                        <Text style={[styles.answerText, { color: colors.success }]} numberOfLines={1}>
                                            A: {item.answer}
                                        </Text>
                                    </View>
                                    <View style={styles.qActions}>
                                        <Pressable onPress={() => handleEditQuestion(item)} style={styles.qActionBtn}>
                                            <Edit2 size={18} color={colors.textSecondary} />
                                        </Pressable>
                                        {userQuestions.some(uq => uq.index === item.index) && (
                                            <Pressable onPress={() => handleDeleteQuestion(item)} style={styles.qActionBtn}>
                                                <Trash2 size={18} color={colors.danger} />
                                            </Pressable>
                                        )}
                                    </View>
                                </View>
                            )}
                            contentContainerStyle={styles.listContainer}
                            ListEmptyComponent={
                                <View style={styles.empty}>
                                    <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>No questions in this category yet.</Text>
                                    <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>Add your first question to get started!</Text>
                                </View>
                            }
                        />
                    </View>
                )}

                <EditQuestionModal
                    visible={editModalVisible}
                    onClose={() => setEditModalVisible(false)}
                    initialData={editingQuestion}
                />
                <ImportCategoryModal
                    visible={importModalVisible}
                    onClose={() => setImportModalVisible(false)}
                    onImport={(data) => {
                        importQuestions(data);
                        triggerHaptic('success');
                    }}
                    colors={colors}
                />
            </SafeAreaView>
        </Modal>
    );
};

export default CategoriesModal;
