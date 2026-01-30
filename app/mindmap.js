import { useRouter } from 'expo-router';
import { ChevronLeft, Network, Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AddMindmapModal from '../components/AddMindmapModal';
import { Border, Shadows, Spacing } from '../constants/theme';
import { useGame } from '../context/GameContext';

const { width } = Dimensions.get('window');

const DotBackground = ({ colors }) => (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background, overflow: 'hidden' }]}>
        {[...Array(40)].map((_, i) => (
            <View
                key={i}
                style={{
                    position: 'absolute',
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: colors.border + '15',
                    top: Math.random() * 1000,
                    left: Math.random() * 1000,
                }}
            />
        ))}
    </View>
);

const MindmapCard = ({ item, colors, onPress, onDelete }) => (
    <TouchableOpacity
        onPress={onPress}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
        <View style={styles.cardHeader}>
            <View style={[styles.iconBadge, { backgroundColor: colors.secondary + '20' }]}>
                <Network size={24} color={colors.secondary} strokeWidth={2.5} />
            </View>
            <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                <Trash2 size={20} color={colors.textSecondary} />
            </TouchableOpacity>
        </View>

        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
            {item.title}
        </Text>

        {item.description ? (
            <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={3}>
                {item.description}
            </Text>
        ) : null}

        <View style={styles.cardFooter}>
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {(() => {
                    try {
                        const date = new Date(item.createdAt);
                        return isNaN(date.getTime()) ? 'Unknown Date' : date.toLocaleDateString();
                    } catch (e) {
                        console.error("Date parsing error:", e);
                        return 'Unknown Date';
                    }
                })()}
            </Text>
        </View>
    </TouchableOpacity>
);

export default function MindmapScreen() {
    const router = useRouter();
    const { colors, mindmaps, saveMindmap, deleteMindmap, triggerHaptic } = useGame();
    const [modalVisible, setModalVisible] = useState(false);

    const handleOpenMap = (id) => {
        triggerHaptic('light');
        router.push(`/mindmap/${id}`);
    };

    const handleDelete = (id) => {
        triggerHaptic('medium');
        deleteMindmap(id);
    };

    return (
        <View style={styles.container}>
            <DotBackground colors={colors} />

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => { triggerHaptic('light'); router.back(); }}
                    style={[styles.backButton, { borderColor: colors.border, backgroundColor: colors.card }]}
                >
                    <ChevronLeft color={colors.text} size={28} strokeWidth={4} />
                </TouchableOpacity>

                <View style={[styles.titleContainer, { transform: [{ rotate: '-2deg' }], borderWidth: Border.heavy }]}>
                    <Network color={colors.primary} size={24} strokeWidth={3} style={{ marginRight: 8 }} />
                    <Text style={[styles.headerTitle, { color: colors.primary }]}>MINDMAPS</Text>
                </View>

                <TouchableOpacity
                    onPress={() => {
                        triggerHaptic('medium');
                        setModalVisible(true);
                    }}
                    style={[styles.headerButton, { backgroundColor: '#FACC15', borderColor: colors.border, transform: [{ rotate: '5deg' }], borderWidth: Border.heavy }]}
                >
                    <Plus color="#000" size={24} strokeWidth={4} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={Array.isArray(mindmaps) ? mindmaps : []}
                keyExtractor={(item) => (item && item.id) ? item.id.toString() : Math.random().toString()}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                    if (!item || !item.id) return null;
                    return (
                        <MindmapCard
                            item={item}
                            colors={colors}
                            onPress={() => handleOpenMap(item.id)}
                            onDelete={() => handleDelete(item.id)}
                        />
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            No mindmaps yet. Tap + to create one!
                        </Text>
                    </View>
                }
            />



            <AddMindmapModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={saveMindmap}
                colors={colors}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.l,
        paddingTop: 60,
        paddingBottom: Spacing.m,
        zIndex: 10,
    },
    backButton: {
        width: 50,
        height: 50,
        borderRadius: 15,
        borderWidth: Border.heavy,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.pop,
    },
    headerButton: {
        width: 50,
        height: 50,
        borderRadius: 15,
        borderWidth: Border.heavy,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.pop,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        ...Shadows.pop,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    listContent: {
        padding: Spacing.l,
        gap: Spacing.m,
        paddingBottom: 100,
    },
    card: {
        padding: Spacing.m,
        borderRadius: 24,
        borderWidth: 3,
        ...Shadows.pop,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.s,
    },
    iconBadge: {
        padding: 8,
        borderRadius: 12,
    },
    deleteButton: {
        padding: 8,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 4,
    },
    cardDesc: {
        fontSize: 14,
        marginBottom: Spacing.m,
        lineHeight: 20,
    },
    cardFooter: {
        alignItems: 'flex-end',
    },
    dateText: {
        fontSize: 12,
        fontWeight: '700',
        opacity: 0.6,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        opacity: 0.7,
    },

});
