import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGame } from '../context/GameContext';
import { Spacing, Border, Shadows } from '../constants/theme';
import { ChevronLeft, RotateCcw, ThumbsUp, ThumbsDown, Trophy, Zap, Star, Flame, Cloud } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withRepeat, withSequence, withTiming, Easing, FadeIn, ZoomIn, FadeOut, BounceIn } from 'react-native-reanimated';
import wordsData from '../assets/words.json';

const { width } = Dimensions.get('window');
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const Sunburst = ({ color }) => {
    const rotation = useSharedValue(0);

    useEffect(() => {
        rotation.value = withRepeat(withTiming(360, { duration: 20000, easing: Easing.linear }), -1);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return (
        <Animated.View style={[styles.sunburst, animatedStyle]}>
            {[...Array(12)].map((_, i) => (
                <View
                    key={i}
                    style={[
                        styles.sunburstRay,
                        { transform: [{ rotate: `${i * 30}deg` }], borderRightColor: color + '15' }
                    ]}
                />
            ))}
        </Animated.View>
    );
};


const Decoration = ({ style, color = '#000' }) => (
    <View style={[styles.decoration, style, { backgroundColor: color + '30', borderColor: color }]}>
        <View style={{ position: 'absolute', top: '20%', left: '10%', width: '80%', height: 2, backgroundColor: color + '20' }} />
        <View style={{ position: 'absolute', bottom: '20%', left: '10%', width: '80%', height: 2, backgroundColor: color + '20' }} />
    </View>
);

const ComicLabel = ({ text, color, style }) => (
    <View style={[styles.comicLabel, { backgroundColor: color, borderColor: '#000' }, style]}>
        <Text style={styles.comicLabelText}>{text}</Text>
    </View>
);

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

const StickerPop = ({ type, color }) => {
    return (
        <Animated.View
            entering={ZoomIn.duration(400).springify()}
            exiting={FadeOut}
            style={[styles.stickerPop, { backgroundColor: color, transform: [{ rotate: '-10deg' }] }]}
        >
            <Text style={styles.stickerPopText}>{type}</Text>
        </Animated.View>
    );
};

const HangmanDrawing = ({ mistakes, color }) => {
    const parts = [
        <View key="base" style={[styles.drawPart, { width: 140, height: 12, bottom: 0, backgroundColor: color, borderRadius: 6 }]} />,
        <View key="pole" style={[styles.drawPart, { width: 12, height: 180, bottom: 0, left: 20, backgroundColor: color, borderRadius: 6 }]} />,
        <View key="top" style={[styles.drawPart, { width: 90, height: 12, top: 0, left: 20, backgroundColor: color, borderRadius: 6 }]} />,
        <View key="rope" style={[styles.drawPart, { width: 6, height: 35, top: 0, left: 100, backgroundColor: color, borderRadius: 3 }]} />,
        <View key="head" style={[styles.drawPart, { width: 50, height: 50, borderRadius: 25, top: 35, left: 78, borderWidth: 5, borderColor: color, backgroundColor: '#FFF' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
                <View style={[styles.eye, { backgroundColor: color }]} />
                <View style={[styles.eye, { backgroundColor: color }]} />
            </View>
            {mistakes >= 5 && <View style={[styles.mouth, { backgroundColor: color, height: mistakes >= 9 ? 10 : 3, width: 20, alignSelf: 'center', marginTop: 5, borderRadius: 2 }]} />}
        </View>,
        <View key="body" style={[styles.drawPart, { width: 10, height: 65, top: 85, left: 98, backgroundColor: color, borderRadius: 5 }]} />,
        <View key="l-arm" style={[styles.drawPart, { width: 45, height: 10, top: 105, left: 58, backgroundColor: color, transform: [{ rotate: '35deg' }], borderRadius: 5 }]} />,
        <View key="r-arm" style={[styles.drawPart, { width: 45, height: 10, top: 105, left: 103, backgroundColor: color, transform: [{ rotate: '-35deg' }], borderRadius: 5 }]} />,
        <View key="l-leg" style={[styles.drawPart, { width: 10, height: 45, top: 145, left: 88, backgroundColor: color, transform: [{ rotate: '25deg' }], borderRadius: 5 }]} />,
        <View key="r-leg" style={[styles.drawPart, { width: 10, height: 45, top: 145, left: 108, backgroundColor: color, transform: [{ rotate: '-25deg' }], borderRadius: 5 }]} />,
    ];

    return (
        <View style={styles.drawingContainer}>
            {parts.slice(0, mistakes + 1)}
        </View>
    );
};

export default function HangmanGame() {
    const { levelIndex, customWord, customMeaning } = useLocalSearchParams();
    const router = useRouter();
    const { colors, triggerHaptic, unlockLevel, playFlipSound, playAlphabetClickSound } = useGame();

    const isCustom = !!customWord;
    const levelData = isCustom ? { word: customWord, meaning: customMeaning } : wordsData.find(w => w.index === parseInt(levelIndex || "1"));
    const word = levelData?.word.toUpperCase() || "";

    const [guessedLetters, setGuessedLetters] = useState([]);
    const [mistakes, setMistakes] = useState(0);
    const [gameState, setGameState] = useState('playing'); // 'playing', 'won', 'lost'
    const [activeSticker, setActiveSticker] = useState(null);

    const shake = useSharedValue(0);
    const keyboardWiggle = useSharedValue(0);

    const triggerShake = () => {
        shake.value = withSequence(
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(-10, { duration: 50 }),
            withTiming(0, { duration: 50 })
        );
    };

    const animatedShakeStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shake.value }]
    }));

    useEffect(() => {
        if (gameState !== 'playing') return;

        const isWon = word.split('').every(letter => guessedLetters.includes(letter) || letter === ' ');
        if (isWon) {
            setGameState('won');
            if (!isCustom) {
                unlockLevel(parseInt(levelIndex || "1") + 1); // Unlock the NEXT level
            }
            triggerHaptic('success');
        } else if (mistakes >= 9) {
            setGameState('lost');
            triggerHaptic('error');
        }
    }, [guessedLetters, mistakes]);

    const handleGuess = (letter) => {
        if (gameState !== 'playing' || guessedLetters.includes(letter)) return;

        playAlphabetClickSound();
        setGuessedLetters(prev => [...prev, letter]);

        if (!word.includes(letter)) {
            setMistakes(prev => prev + 1);
            triggerShake();
            triggerHaptic('medium');
            showSticker('DOH!');
        } else {
            triggerHaptic('light');
            showSticker('BAM!');
            wiggleKeyboard();
        }
    };

    const showSticker = (type) => {
        setActiveSticker(type);
        setTimeout(() => setActiveSticker(null), 800);
    };

    const wiggleKeyboard = () => {
        keyboardWiggle.value = withSequence(
            withTiming(-5, { duration: 50 }),
            withTiming(5, { duration: 50 }),
            withTiming(-5, { duration: 50 }),
            withTiming(0, { duration: 50 })
        );
    };

    const resetGame = () => {
        setGuessedLetters([]);
        setMistakes(0);
        setGameState('playing');
        triggerHaptic('light');
    };

    const renderWord = () => {
        return word.split('').map((letter, i) => (
            <View key={i} style={[styles.letterBubbleContainer]}>
                <View
                    style={[
                        styles.letterBox,
                        {
                            borderColor: colors.border,
                            backgroundColor: colors.card,
                            borderTopLeftRadius: 12 + (i % 6),
                            borderBottomRightRadius: 18 + (i % 4),
                            borderTopRightRadius: 8,
                            borderBottomLeftRadius: 10,
                            transform: [{ rotate: `${(i % 2 === 0 ? 1 : -1) * 2}deg` }]
                        }
                    ]}
                >
                    {letter === ' ' ? (
                        <View style={{ width: 10 }} />
                    ) : (
                        guessedLetters.includes(letter) || gameState === 'lost' ? (
                            <Animated.Text
                                entering={BounceIn.duration(400)}
                                style={[styles.letterText, { color: colors.text }]}
                            >
                                {letter}
                            </Animated.Text>
                        ) : null
                    )}
                    <View style={[styles.underline, { backgroundColor: colors.primary }]} />
                </View>
            </View>
        ));
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Sunburst color={colors.primary} />
            {[...Array(15)].map((_, i) => <FloatingParticle key={i} colors={colors} />)}

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => { triggerHaptic('light'); router.back(); }}
                    style={[styles.backButton, { borderColor: colors.border, backgroundColor: colors.card }]}
                >
                    <Decoration style={{ top: -8, left: '20%', width: 30, height: 8, transform: [{ rotate: '-10deg' }] }} color={colors.primary} />
                    <ChevronLeft color={colors.text} size={28} strokeWidth={4} />
                </TouchableOpacity>

                <View style={[styles.levelBadge, { backgroundColor: '#FEF3C7', borderColor: colors.border, transform: [{ rotate: '2deg' }] }]}>
                    <Decoration style={{ bottom: -8, right: '10%', width: 25, height: 8, transform: [{ rotate: '5deg' }] }} color="#000" />
                    <Text style={styles.levelLabel}>{isCustom ? 'CHALLENGE' : `LEVEL ${levelIndex}`}</Text>
                </View>

                <TouchableOpacity
                    onPress={resetGame}
                    style={[styles.backButton, { borderColor: colors.border, backgroundColor: colors.card }]}
                >
                    <Decoration style={{ top: -8, right: '20%', width: 30, height: 8, transform: [{ rotate: '15deg' }] }} color={colors.danger} />
                    <RotateCcw color={colors.text} size={24} strokeWidth={4} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Animated.View style={[styles.drawingWrapper, animatedShakeStyle]}>
                    <HangmanDrawing mistakes={mistakes} color={colors.text} />
                </Animated.View>

                <View style={styles.wordContainer}>
                    {renderWord()}
                </View>

                <View style={[styles.hintContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Decoration style={{ top: -12, left: 30, width: 40, height: 12, transform: [{ rotate: '-5deg' }] }} color={colors.primary} />
                    <Text style={[styles.hintTitle, { color: colors.primary }]}>HINT:</Text>
                    <Text style={[styles.hintText, { color: colors.text }]}>{levelData?.meaning}</Text>
                </View>

                <Animated.View style={[styles.keyboard, { transform: [{ translateX: keyboardWiggle.value }] }]}>
                    {ALPHABET.map((letter, idx) => {
                        const isGuessed = guessedLetters.includes(letter);
                        const isCorrect = isGuessed && word.includes(letter);
                        const isWrong = isGuessed && !word.includes(letter);

                        return (
                            <TouchableOpacity
                                key={letter}
                                onPress={() => handleGuess(letter)}
                                disabled={isGuessed || gameState !== 'playing'}
                                style={[
                                    styles.key,
                                    {
                                        borderColor: colors.border,
                                        backgroundColor: isCorrect ? colors.success : (isWrong ? '#EF4444' : colors.card),
                                        opacity: isGuessed ? 0.6 : 1,
                                        borderTopLeftRadius: 8 + (idx % 8),
                                        borderBottomRightRadius: 12 + (idx % 6),
                                        borderTopRightRadius: 10,
                                        borderBottomLeftRadius: 10,
                                        transform: [{ rotate: `${(idx % 3 === 0 ? 1 : -1) * 2}deg` }]
                                    }
                                ]}
                            >
                                <Text style={[styles.keyText, { color: isGuessed ? '#FFF' : colors.text }]}>{letter}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </Animated.View>

                {activeSticker && <StickerPop type={activeSticker} color={activeSticker === 'BAM!' ? colors.success : colors.danger} />}
            </ScrollView>

            {gameState !== 'playing' && (
                <View style={styles.overlay}>
                    <Sunburst color={gameState === 'won' ? '#FEF3C7' : '#FEE2E2'} />

                    <Animated.View
                        entering={ZoomIn.duration(600).springify().mass(0.8)}
                        style={[
                            styles.resultCard,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                                transform: [{ rotate: gameState === 'won' ? '-2deg' : '2deg' }],
                                borderTopLeftRadius: 25,
                                borderBottomRightRadius: 35,
                                borderTopRightRadius: 15,
                                borderBottomLeftRadius: 40,
                            }
                        ]}
                    >
                        {/* Tape Decorations on corners */}
                        <Decoration style={{ top: -15, left: -10, width: 50, height: 15, transform: [{ rotate: '-35deg' }] }} color={colors.primary} />
                        <Decoration style={{ bottom: -15, right: -10, width: 50, height: 15, transform: [{ rotate: '-15deg' }] }} color={colors.danger} />

                        <View style={[styles.resultBadge, { backgroundColor: gameState === 'won' ? colors.success : colors.danger, transform: [{ rotate: '-5deg' }], borderRadius: 20 }]}>
                            {gameState === 'won' ? <ThumbsUp size={50} color="#FFF" strokeWidth={3} /> : <ThumbsDown size={50} color="#FFF" strokeWidth={3} />}
                        </View>

                        <ComicLabel
                            text={gameState === 'won' ? 'BOOYAH!' : 'DOH!'}
                            color={gameState === 'won' ? colors.success : colors.danger}
                            style={{ position: 'absolute', top: -40, right: -20, transform: [{ rotate: '15deg' }] }}
                        />

                        <Text style={[styles.resultTitle, { color: colors.text }]}>
                            {gameState === 'won' ? 'LEVEL CLEARED!' : 'GAME OVER!'}
                        </Text>

                        <View style={styles.resultWordContainer}>
                            <Text style={styles.resultWordLabel}>THE WORD WAS:</Text>
                            <Text style={[styles.resultWord, { color: colors.primary }]}>{word.toUpperCase()}</Text>
                        </View>

                        <Animated.View entering={FadeIn.delay(500)} style={styles.resultButtonsRow}>
                            <TouchableOpacity
                                onPress={() => {
                                    triggerHaptic('medium');
                                    router.back();
                                }}
                                style={[styles.secondaryResultButton, { borderColor: colors.border, backgroundColor: '#E5E7EB' }]}
                            >
                                <Text style={styles.secondaryResultButtonText}>MAP</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    triggerHaptic('success');
                                    if (gameState === 'won') {
                                        // Auto-navigation or next level logic
                                        router.back();
                                    } else {
                                        resetGame();
                                    }
                                }}
                                style={[styles.resultButton, { backgroundColor: colors.primary, borderColor: colors.border }]}
                            >
                                <Text style={styles.resultButtonText}>
                                    {gameState === 'won' ? 'NEXT' : 'RETRY'}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingTop: 60,
        paddingBottom: Spacing.m,
        zIndex: 20,
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
    levelBadge: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: Border.heavy,
        ...Shadows.pop,
        position: 'relative',
    },
    levelLabel: {
        fontSize: 18,
        fontWeight: '900',
    },
    scrollContent: {
        paddingHorizontal: Spacing.xl,
        alignItems: 'center',
        paddingBottom: 40,
    },
    drawingWrapper: {
        height: 220,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    drawingContainer: {
        width: 150,
        height: 200,
        position: 'relative',
    },
    drawPart: {
        position: 'absolute',
    },
    wordContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
    },
    letterBubbleContainer: {
        margin: 4,
    },
    letterBox: {
        width: 35,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        ...Shadows.pop,
    },
    letterText: {
        fontSize: 24,
        fontWeight: '900',
    },
    underline: {
        position: 'absolute',
        bottom: 5,
        width: 20,
        height: 3,
        borderRadius: 2,
    },
    hintContainer: {
        width: '100%',
        padding: Spacing.m,
        borderRadius: 25,
        borderWidth: 4,
        marginBottom: Spacing.xl,
        ...Shadows.popHeavy,
        position: 'relative',
    },
    hintTitle: {
        fontSize: 12,
        fontWeight: '900',
        marginBottom: 4,
    },
    hintText: {
        fontSize: 14,
        fontWeight: '800',
    },
    keyboard: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
    },
    key: {
        width: (width - Spacing.xl * 2 - 60) / 7,
        height: 56,
        margin: 4,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.pop,
    },
    keyText: {
        fontSize: 20,
        fontWeight: '900',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    resultCard: {
        width: width * 0.85,
        padding: Spacing.xl,
        borderWidth: Border.heavy,
        ...Shadows.popHeavy,
        alignItems: 'center',
        position: 'relative',
    },
    resultBadge: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: Border.heavy,
        borderColor: '#000',
        marginBottom: Spacing.m,
        ...Shadows.pop,
    },
    resultTitle: {
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: Spacing.s,
    },
    resultWordContainer: {
        backgroundColor: '#F3F4F6',
        padding: Spacing.m,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#000',
        marginBottom: Spacing.xl,
        width: '100%',
        alignItems: 'center',
    },
    resultWordLabel: {
        fontSize: 12,
        fontWeight: '900',
        color: '#6B7280',
        marginBottom: 4,
    },
    resultWord: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: 2,
    },
    resultButtonsRow: {
        flexDirection: 'row',
        gap: 15,
        width: '100%',
    },
    resultButton: {
        flex: 2,
        height: 60,
        borderRadius: 20,
        borderWidth: Border.heavy,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.pop,
    },
    secondaryResultButton: {
        flex: 1,
        height: 60,
        borderRadius: 20,
        borderWidth: Border.heavy,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.pop,
    },
    resultButtonText: {
        fontSize: 20,
        fontWeight: '900',
        color: '#000',
    },
    secondaryResultButtonText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#000',
    },
    comicLabel: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderWidth: 3,
        borderRadius: 10,
        ...Shadows.pop,
    },
    comicLabelText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FFF',
    },
    decoration: {
        position: 'absolute',
        borderWidth: 1.5,
        borderRadius: 2,
        zIndex: 5,
    },
    sunburst: {
        position: 'absolute',
        top: '20%',
        left: -100,
        width: 600,
        height: 600,
        zIndex: -1,
    },
    sunburstRay: {
        position: 'absolute',
        top: 0,
        left: 300,
        width: 0,
        height: 0,
        borderLeftWidth: 15,
        borderLeftColor: 'transparent',
        borderRightWidth: 15,
        borderRightColor: 'transparent',
        borderBottomWidth: 300,
        borderBottomColor: 'transparent',
        transformOrigin: 'top center',
    },
    floatingParticle: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        zIndex: -1,
    },
    stickerPop: {
        position: 'absolute',
        top: '10%',
        alignSelf: 'center',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 20,
        borderWidth: 4,
        borderColor: '#000',
        zIndex: 50,
        ...Shadows.popHeavy,
    },
    stickerPopText: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: 2,
    },
    eye: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    mouth: {
        width: 20,
        borderRadius: 2,
    },
});
