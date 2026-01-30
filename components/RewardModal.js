import React, { useEffect } from 'react';
import { View, Text, Modal, StyleSheet, Pressable } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withSequence,
    withTiming,
    Easing
} from 'react-native-reanimated';
import { Spacing, Shadows, Border } from '../constants/theme';
import { useGame } from '../context/GameContext';
import { Trophy, Star, Zap, Flame, Crown } from 'lucide-react-native';

const Sunburst = ({ color }) => {
    const rotation = useSharedValue(0);
    useEffect(() => {
        rotation.value = withRepeat(withTiming(360, { duration: 15000, easing: Easing.linear }), -1, false);
    }, []);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }]
    }));

    return (
        <Animated.View style={[styles.sunburstContainer, animatedStyle]}>
            {[...Array(12)].map((_, i) => (
                <View
                    key={i}
                    style={[
                        styles.sunburstRay,
                        {
                            backgroundColor: color + '15',
                            transform: [{ rotate: `${i * 30}deg` }, { translateY: -150 }]
                        }
                    ]}
                />
            ))}
        </Animated.View>
    );
};

const FloatingShape = ({ colors }) => {
    const tx = useSharedValue(Math.random() * 300 - 150);
    const ty = useSharedValue(Math.random() * 400 - 200);
    const rot = useSharedValue(Math.random() * 360);

    useEffect(() => {
        tx.value = withRepeat(withTiming(tx.value + (Math.random() * 40 - 20), { duration: 2000 + Math.random() * 2000 }), -1, true);
        ty.value = withRepeat(withTiming(ty.value + (Math.random() * 40 - 20), { duration: 2000 + Math.random() * 2000 }), -1, true);
        rot.value = withRepeat(withTiming(rot.value + 360, { duration: 5000 + Math.random() * 5000 }), -1, false);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: tx.value },
            { translateY: ty.value },
            { rotate: `${rot.value}deg` }
        ]
    }));

    const shapes = ['square', 'circle', 'triangle'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    return (
        <Animated.View
            style={[
                styles.floatingShape,
                animatedStyle,
                {
                    backgroundColor: colors.primary + '30',
                    borderRadius: shape === 'circle' ? 10 : 2,
                    borderWidth: 2,
                    borderColor: colors.border + '40'
                }
            ]}
        />
    );
};

const Decoration = ({ style, colors }) => {
    const rotation = useSharedValue(0);
    useEffect(() => {
        rotation.value = withRepeat(withTiming(360, { duration: 3000, easing: Easing.linear }), -1, false);
    }, []);
    const animatedStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
    return <Animated.View style={[styles.decoration, style, animatedStyle, { backgroundColor: colors.text + '10', borderColor: colors.border }]} />;
};

const RewardModal = ({ visible, milestone, onClose }) => {
    const { colors, triggerHaptic } = useGame();
    const scale = useSharedValue(0);
    const bounce = useSharedValue(1);

    useEffect(() => {
        if (visible) {
            scale.value = withSpring(1, { damping: 10, stiffness: 100 });
            bounce.value = withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 300 }),
                    withTiming(1, { duration: 300 })
                ),
                -1,
                true
            );
            triggerHaptic('success');
        } else {
            scale.value = 0;
            bounce.value = 1;
        }
    }, [visible]);

    const animatedContentStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    const animatedBounceStyle = useAnimatedStyle(() => ({
        transform: [{ scale: bounce.value }, { rotate: '-5deg' }]
    }));

    if (!visible) return null;

    const getMilestoneData = () => {
        switch (milestone) {
            case 10:
                return {
                    title: "POW!",
                    subtitle: "GETTING STARTED!",
                    icon: <Zap size={48} color={colors.primary} />,
                    color: colors.primary
                };
            case 40:
                return {
                    title: "BAM!",
                    subtitle: "ALMOST HALFWAY!",
                    icon: <Star size={48} color="#EAB308" />,
                    color: "#EAB308"
                };
            case 70:
                return {
                    title: "FIRE!",
                    subtitle: "YOU'RE UNSTOPPABLE!",
                    icon: <Flame size={48} color="#EF4444" />,
                    color: "#EF4444"
                };
            case 90:
                return {
                    title: "WOW!",
                    subtitle: "SO CLOSE NOW!",
                    icon: <Trophy size={48} color="#A855F7" />,
                    color: "#A855F7"
                };
            case 100:
                return {
                    title: "KING!",
                    subtitle: "TOTAL MASTERY!",
                    icon: <Crown size={48} color={colors.success} />,
                    color: colors.success
                };
            default:
                return {
                    title: "NICE!",
                    subtitle: "KEEP GOING!",
                    icon: <Star size={48} color={colors.primary} />,
                    color: colors.primary
                };
        }
    };

    const data = getMilestoneData();

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <Sunburst color={data.color} />
                {[...Array(15)].map((_, i) => (
                    <FloatingShape key={i} colors={colors} />
                ))}

                <Animated.View style={[styles.content, { backgroundColor: colors.background, borderColor: colors.border }, animatedContentStyle]}>
                    <Decoration style={{ top: -20, left: -20, width: 60, height: 60 }} colors={colors} />
                    <Decoration style={{ bottom: -20, right: -20, width: 80, height: 80 }} colors={colors} />

                    <Animated.View style={[styles.badge, { backgroundColor: data.color + '20', borderColor: data.color }, animatedBounceStyle]}>
                        <Text style={[styles.title, { color: data.color }]}>{data.title}</Text>
                    </Animated.View>

                    <View style={styles.iconContainer}>
                        {data.icon}
                    </View>

                    <Text style={[styles.subtitle, { color: colors.text }]}>{data.subtitle}</Text>
                    <Text style={[styles.percent, { color: data.color }]}>{milestone}% COMPLETE</Text>

                    <Pressable
                        onPress={() => {
                            triggerHaptic('light');
                            onClose();
                        }}
                        style={[styles.button, { backgroundColor: data.color, borderColor: colors.border, transform: [{ rotate: '2deg' }] }]}
                    >
                        <Text style={styles.buttonText}>KEEP SWIPING</Text>
                    </Pressable>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    content: {
        width: '100%',
        padding: Spacing.xl,
        borderRadius: 40,
        borderWidth: 6,
        alignItems: 'center',
        ...Shadows.popHeavy,
        position: 'relative',
        overflow: 'visible',
    },
    decoration: {
        position: 'absolute',
        borderWidth: 4,
        borderRadius: 12,
        zIndex: 5,
    },
    sunburstContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1,
    },
    sunburstRay: {
        position: 'absolute',
        width: 40,
        height: 800,
        borderRadius: 20,
    },
    floatingShape: {
        position: 'absolute',
        width: 15,
        height: 15,
        zIndex: 0,
    },
    badge: {
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 4,
        marginBottom: Spacing.xl,
        ...Shadows.pop,
    },
    title: {
        fontSize: 48,
        fontWeight: '1000',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.l,
        borderWidth: 4,
        borderStyle: 'dashed',
    },
    subtitle: {
        fontSize: 22,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 8,
    },
    percent: {
        fontSize: 18,
        fontWeight: '1000',
        marginBottom: Spacing.xl,
    },
    button: {
        width: '100%',
        paddingVertical: 18,
        borderRadius: 24,
        borderWidth: 4,
        alignItems: 'center',
        ...Shadows.popHeavy,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '1000',
        letterSpacing: 1,
    }
});

export default RewardModal;
