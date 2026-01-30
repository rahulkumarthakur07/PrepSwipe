import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '../context/GameContext';
import { Spacing, Border, Shadows } from '../constants/theme';
import { ChevronLeft, Lock, Trophy, Gamepad2, Star, Plus } from 'lucide-react-native';
import wordsData from '../assets/words.json';
import CustomGameModal from '../components/CustomGameModal';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_WIDTH = (width - Spacing.xl * 2 - Spacing.m * 2 - 30) / COLUMN_COUNT;

const FloatingParticle = ({ colors }) => {
    const tx = useSharedValue(Math.random() * width);
    const ty = useSharedValue(Math.random() * 800);
    const scale = useSharedValue(Math.random() * 0.5 + 0.5);

    useEffect(() => {
        tx.value = withRepeat(withTiming(Math.random() * width, { duration: 15000 + Math.random() * 5000 }), -1, true);
        ty.value = withRepeat(withTiming(Math.random() * 800, { duration: 15000 + Math.random() * 5000 }), -1, true);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: tx.value },
            { translateY: ty.value },
            { scale: scale.value }
        ],
        opacity: 0.3,
    }));

    return (
        <Animated.View
            style={[
                styles.floatingParticle,
                animatedStyle,
                { backgroundColor: Math.random() > 0.5 ? colors.primary : colors.success }
            ]}
        />
    );
};

const DotBackground = ({ colors }) => (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background, overflow: 'hidden' }]}>
        {[...Array(40)].map((_, i) => (
            <View
                key={i}
                style={{
                    position: 'absolute',
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: colors.border + '10',
                    top: Math.random() * 1000,
                    left: Math.random() * 1000,
                }}
            />
        ))}
        {[...Array(15)].map((_, i) => <FloatingParticle key={i} colors={colors} />)}
    </View>
);

const Decoration = ({ style, color = '#000' }) => (
    <View style={[styles.decoration, style, { backgroundColor: color + '30', borderColor: color }]}>
        <View style={{ position: 'absolute', top: '20%', left: '10%', width: '80%', height: 2, backgroundColor: color + '20' }} />
        <View style={{ position: 'absolute', bottom: '20%', left: '10%', width: '80%', height: 2, backgroundColor: color + '20' }} />
    </View>
);

const LevelCard = React.memo(({ level, index, isUnlocked, isCompleted, colors, onSelect }) => {
    // Stable pseudo-randomness based on index
    const rotation = ((index % 3) - 1) * 3;
    const offsetX = ((index % 2) - 0.5) * 6;

    return (
        <Animated.View
            entering={ZoomIn.delay(Math.min(index * 40, 600)).springify().mass(0.6).damping(12)}
            style={{ transform: [{ translateX: offsetX }] }}
        >
            <TouchableOpacity
                onPress={isUnlocked ? onSelect : null}
                activeOpacity={0.8}
                style={[
                    styles.levelCard,
                    {
                        backgroundColor: isUnlocked ? (isCompleted ? colors.success : colors.card) : '#374151',
                        opacity: isUnlocked ? 1 : 0.7,
                        borderColor: isUnlocked ? colors.border : '#1F2937',
                        transform: [{ rotate: `${rotation}deg` }],
                        borderTopLeftRadius: 15 + (index % 12),
                        borderBottomRightRadius: 20 + (index % 8),
                        borderTopRightRadius: 8 + (index % 5),
                        borderBottomLeftRadius: 10 + (index % 7),
                    }
                ]}
            >
                {index % 4 === 0 && (
                    <Decoration style={{ top: -10, alignSelf: 'center', width: 35, height: 10, transform: [{ rotate: '-5deg' }] }} color={colors.primary} />
                )}

                {!isUnlocked ? (
                    <Lock size={26} color="#9CA3AF" strokeWidth={3} />
                ) : (
                    <View style={styles.levelContent}>
                        {isCompleted ? (
                            <View style={styles.completedHeader}>
                                <Trophy size={18} color="#FFF" strokeWidth={3} />
                            </View>
                        ) : (
                            <Text style={[styles.levelNumber, { color: colors.text }]}>{level.index}</Text>
                        )}
                        <Text style={[styles.levelDifficulty, { color: isCompleted ? '#FFF' : colors.text + '60' }]}>
                            {level.level.toUpperCase()}
                        </Text>
                    </View>
                )}

                {isCompleted && (
                    <View style={[styles.sticker, { backgroundColor: '#FACC15', bottom: -8, right: -4, transform: [{ rotate: '15deg' }] }]}>
                        <Star size={12} color="#000" fill="#000" />
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
});

const ComicLabel = ({ text, color, style }) => (
    <View style={[styles.comicLabel, { backgroundColor: color, borderColor: '#000' }, style]}>
        <Text style={styles.comicLabelText}>{text}</Text>
    </View>
);

const SeasonSection = React.memo(({ season, index, colors, hangmanProgress, handleSelectLevel }) => {
    const isChristmas = season.title.toLowerCase().includes('christmas');
    const seasonColor = isChristmas ? '#EF4444' : (index % 2 === 0 ? colors.primary : colors.success);

    return (
        <View style={[styles.seasonContainer, { borderColor: colors.border }]}>
            {/* Folder Tab Effect */}
            <View style={[styles.folderTab, { backgroundColor: seasonColor, borderColor: colors.border }]} />

            <View style={[styles.seasonHeaderBox, { backgroundColor: seasonColor, borderColor: colors.border }]}>
                {/* Random Tape for Header */}
                <Decoration style={{ top: -8, left: -10, width: 30, height: 8, transform: [{ rotate: '-15deg' }] }} color="#FFF" />
                <Text style={styles.seasonTitle}>{season.title.toUpperCase()}</Text>
                {isChristmas && <Star size={16} color="#FACC15" fill="#FACC15" style={{ marginLeft: 8 }} />}
            </View>

            <View style={styles.seasonGrid}>
                {season.data.map((level, idx) => {
                    const globalIdx = (index * 25) + idx;
                    const isUnlocked = hangmanProgress.includes(level.index);
                    const isCompleted = hangmanProgress.length > 0 && level.index < Math.max(...hangmanProgress);

                    return (
                        <View key={level.index} style={styles.cardWrapper}>
                            {/* Repositioned stickers to be season-relative */}
                            {idx === 5 && index === 0 && <ComicLabel text="POW!" color="#EF4444" style={styles.sticker5} />}
                            {idx === 14 && index === 0 && <ComicLabel text="ZAP!" color="#3B82F6" style={styles.sticker14} />}

                            <LevelCard
                                level={level}
                                index={globalIdx}
                                isUnlocked={isUnlocked}
                                isCompleted={isCompleted}
                                colors={colors}
                                onSelect={() => handleSelectLevel(level, isUnlocked)}
                            />
                        </View>
                    );
                })}
            </View>
        </View>
    );
});

export default function HangmanLevels() {
    const router = useRouter();
    const { colors, hangmanProgress, triggerHaptic } = useGame();
    const [customModalVisible, setCustomModalVisible] = React.useState(false);

    const handleStartCustom = (word, meaning) => {
        setCustomModalVisible(false);
        triggerHaptic('success');
        router.push({
            pathname: '/hangman-game',
            params: { customWord: word, customMeaning: meaning }
        });
    };

    const handleSelectLevel = (level, isUnlocked) => {
        if (!isUnlocked) {
            triggerHaptic('notification', { type: 'error' });
            return;
        }
        triggerHaptic('medium');
        router.push({
            pathname: '/hangman-game',
            params: { levelIndex: level.index }
        });
    };

    // Grouping levels into seasons
    const seasons = React.useMemo(() => {
        const result = [];
        const itemsPerSeason = 25;
        for (let i = 0; i < wordsData.length; i += itemsPerSeason) {
            const seasonChunk = wordsData.slice(i, i + itemsPerSeason);
            const seasonIndex = Math.floor(i / itemsPerSeason) + 1;
            let title = `SEASON ${seasonIndex}`;
            if (seasonIndex === 2) title = "CHRISTMAS SPECIAL"; // Example: Special Season

            result.push({
                id: `season-${seasonIndex}`,
                title: title,
                data: seasonChunk,
                index: seasonIndex - 1
            });
        }
        return result;
    }, []);

    const renderHeader = () => (
        <View style={[styles.sectionHeader, { transform: [{ rotate: '1deg' }] }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>THE CHALLENGE FOLDER</Text>
            <View style={[styles.underline, { backgroundColor: colors.primary }]} />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <DotBackground colors={colors} />

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => { triggerHaptic('light'); router.back(); }}
                    style={[styles.backButton, { borderColor: colors.border, backgroundColor: colors.card }]}
                >
                    <Decoration style={{ top: -8, width: 30, height: 8, transform: [{ rotate: '-10deg' }] }} color={colors.primary} />
                    <ChevronLeft color={colors.text} size={28} strokeWidth={4} />
                </TouchableOpacity>

                <View style={[styles.titleBadge, { backgroundColor: colors.primary, borderColor: colors.border, transform: [{ rotate: '-1.5deg' }] }]}>
                    <Decoration style={{ top: -12, right: 30, width: 40, height: 12, transform: [{ rotate: '5deg' }] }} color="#FFF" />
                    <Gamepad2 size={26} color="#FFF" strokeWidth={3} style={{ marginRight: 10 }} />
                    <View>
                        <Text style={styles.titleSub}>PUZZLE MASTER</Text>
                        <Text style={styles.title}>WORD GURU</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => { triggerHaptic('medium'); setCustomModalVisible(true); }}
                    style={[styles.headerButton, { backgroundColor: '#FACC15', borderColor: colors.border, transform: [{ rotate: '5deg' }], borderWidth: Border.heavy }]}
                >
                    <Plus color="#000" size={28} strokeWidth={4} />
                    <Decoration style={{ bottom: -8, right: '20%', width: 25, height: 8, transform: [{ rotate: '5deg' }] }} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <Animated.FlatList
                data={seasons}
                keyExtractor={(item) => item.id}
                renderItem={({ item: season, index: idx }) => (
                    <SeasonSection
                        season={season}
                        index={idx}
                        colors={colors}
                        hangmanProgress={hangmanProgress}
                        handleSelectLevel={handleSelectLevel}
                    />
                )}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                windowSize={3}
                removeClippedSubviews={true}
                initialNumToRender={2}
            />

            <CustomGameModal
                visible={customModalVisible}
                colors={colors}
                onClose={() => setCustomModalVisible(false)}
                onStart={handleStartCustom}
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
        paddingHorizontal: Spacing.xl,
        paddingTop: 60,
        paddingBottom: Spacing.m,
        zIndex: 20,
        gap: 10,
    },
    backButton: {
        width: 50,
        height: 50,
        borderRadius: 15,
        borderWidth: Border.heavy,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.pop,
        position: 'relative',
    },
    headerButton: {
        width: 50,
        height: 50,
        borderRadius: 15,
        borderWidth: Border.heavy,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.pop,
        position: 'relative',
    },
    titleBadge: {
        flexDirection: 'row',
        flex: 1,
        marginLeft: Spacing.m,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 18,
        borderWidth: Border.heavy,
        alignItems: 'center',
        ...Shadows.pop,
        position: 'relative',
    },
    titleSub: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
        opacity: 0.7,
        color: '#FFF',
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 1,
        marginTop: -4,
        color: '#FFF',
    },
    scrollContent: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.m,
        paddingBottom: 60,
    },
    sectionHeader: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 3,
        textAlign: 'center',
    },
    underline: {
        width: 60,
        height: 6,
        borderRadius: 3,
        marginTop: 4,
    },
    grid: {
        position: 'relative',
    },
    seasonContainer: {
        marginBottom: 60,
        borderWidth: Border.heavy,
        borderRadius: 30,
        padding: Spacing.m,
        backgroundColor: 'rgba(255,255,255,0.08)',
        ...Shadows.popHeavy,
        position: 'relative',
        borderTopLeftRadius: 5, // Folder look
    },
    folderTab: {
        position: 'absolute',
        top: -15,
        left: -4,
        width: 100,
        height: 30,
        borderWidth: Border.heavy,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        zIndex: -1,
    },
    seasonHeaderBox: {
        alignSelf: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: Border.heavy,
        marginTop: -Spacing.xl - 5,
        marginBottom: Spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        ...Shadows.pop,
        position: 'relative',
        transform: [{ rotate: '-1deg' }],
    },
    seasonTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 2,
    },
    seasonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    cardWrapper: {
        width: ITEM_WIDTH,
        marginBottom: Spacing.m,
        alignItems: 'center',
    },
    levelCard: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH,
        borderWidth: 4,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.pop,
        position: 'relative',
    },
    levelContent: {
        alignItems: 'center',
    },
    levelNumber: {
        fontSize: 30,
        fontWeight: '900',
    },
    levelDifficulty: {
        fontSize: 10,
        fontWeight: '900',
        marginTop: 4,
    },
    completedHeader: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },
    floatingParticle: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        zIndex: -1,
    },
    decoration: {
        position: 'absolute',
        borderWidth: 2,
        borderRadius: 4,
        zIndex: 5,
    },
    sticker: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.pop,
    },
    comicLabel: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 3,
        ...Shadows.popHeavy,
    },
    comicLabelText: {
        color: '#FFF',
        fontWeight: '900',
        fontSize: 14,
        fontStyle: 'italic',
    },
    sticker5: {
        position: 'absolute',
        top: -30,
        left: -20,
        zIndex: 10,
        transform: [{ rotate: '-15deg' }],
    },
    sticker14: {
        position: 'absolute',
        top: -40,
        right: 0,
        zIndex: 10,
        transform: [{ rotate: '10deg' }],
    },
    sticker22: {
        position: 'absolute',
        bottom: -20,
        left: 40,
        zIndex: 10,
        transform: [{ rotate: '5deg' }],
    }
});
