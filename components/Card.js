import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate
} from 'react-native-reanimated';
import { BorderRadius, Spacing, Shadows } from '../constants/theme';
import { useGame } from '../context/GameContext';

const Card = ({ item, onFlip }) => {
    const { colors, playFlipSound, triggerHaptic } = useGame();
    const flip = useSharedValue(0);
    const [isFlipped, setFlipped] = useState(false);

    useEffect(() => {
        flip.value = 0;
        setFlipped(false);
    }, [item]);

    const handlePress = () => {
        const nextState = !isFlipped;
        setFlipped(nextState);
        flip.value = withTiming(nextState ? 180 : 0, { duration: 300 });
        playFlipSound();
        triggerHaptic('light');
        if (onFlip) onFlip(nextState);
    };

    const frontStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(flip.value, [0, 180], [0, 180]);
        return {
            transform: [{ rotateY: `${rotateValue}deg` }],
            opacity: interpolate(flip.value, [0, 90, 90.1, 180], [1, 1, 0, 0]),
            zIndex: flip.value < 90 ? 1 : 0,
        };
    });

    const backStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(flip.value, [0, 180], [180, 360]);
        return {
            transform: [{ rotateY: `${rotateValue}deg` }],
            opacity: interpolate(flip.value, [0, 89.9, 90, 180], [0, 0, 1, 1]),
            zIndex: flip.value > 90 ? 1 : 0,
        };
    });

    return (
        <Pressable onPress={handlePress} style={styles.container}>
            {/* Front */}
            <Animated.View style={[styles.card, styles.front, frontStyle, {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderTopLeftRadius: 45,
                borderBottomRightRadius: 45,
                borderTopRightRadius: 20,
                borderBottomLeftRadius: 20,
            }]}>
                <View style={[styles.badge, { backgroundColor: colors.background, borderColor: colors.border, transform: [{ rotate: '-3deg' }] }]}>
                    <Text style={[styles.badgeText, { color: colors.textSecondary }]}>{item.category}</Text>
                </View>
                <Text style={[styles.question, { color: colors.text }]}>{item.question}</Text>
                <View style={[styles.tapHintBadge, { backgroundColor: colors.primary + '20', borderColor: colors.primary, transform: [{ rotate: '2deg' }] }]}>
                    <Text style={[styles.tapHint, { color: colors.primary }]}>TAP TO REVEAL</Text>
                </View>
            </Animated.View>

            {/* Back */}
            <Animated.View style={[styles.card, styles.back, backStyle, {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderTopRightRadius: 45,
                borderBottomLeftRadius: 45,
                borderTopLeftRadius: 20,
                borderBottomRightRadius: 20,
            }]}>
                <View style={[styles.answerLabelBadge, { backgroundColor: colors.success + '20', borderColor: colors.success, transform: [{ rotate: '-2deg' }] }]}>
                    <Text style={[styles.answerLabel, { color: colors.success }]}>ANSWER</Text>
                </View>
                <Text style={[styles.answer, { color: colors.text }]}>{item.answer}</Text>
                {item.explanation && (
                    <View style={[styles.explanationBox, { backgroundColor: colors.background, borderColor: colors.border, transform: [{ rotate: '1deg' }] }]}>
                        <Text style={[styles.explanationTitle, { color: colors.textSecondary }]}>WHY IT MATTERS</Text>
                        <Text style={[styles.explanation, { color: colors.text }]}>{item.explanation}</Text>
                    </View>
                )}
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '100%',
        height: '100%',
        padding: Spacing.l,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        backfaceVisibility: 'hidden',
        borderWidth: 5,
        shadowColor: '#000',
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 10,
    },
    front: {
        zIndex: 1,
    },
    back: {
        zIndex: 0,
    },
    badge: {
        position: 'absolute',
        top: Spacing.l,
        left: Spacing.l,
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 3,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    question: {
        fontSize: 26,
        fontWeight: '900',
        textAlign: 'center',
        lineHeight: 34,
        paddingHorizontal: 10,
    },
    tapHintBadge: {
        position: 'absolute',
        bottom: Spacing.xl,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
    },
    tapHint: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 2,
    },
    answerLabelBadge: {
        position: 'absolute',
        top: Spacing.l,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 3,
    },
    answerLabel: {
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
    },
    answer: {
        fontSize: 32,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: Spacing.l,
        lineHeight: 40,
    },
    explanationBox: {
        padding: Spacing.m,
        borderRadius: 20,
        width: '100%',
        borderWidth: 3,
        marginTop: Spacing.m,
    },
    explanationTitle: {
        fontSize: 10,
        fontWeight: '900',
        marginBottom: 8,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    explanation: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '700',
    },
});

export default Card;
