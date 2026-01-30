import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    interpolate
} from 'react-native-reanimated';
import Card from './Card';
import { useGame } from '../context/GameContext';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

const SwipeDeck = ({ data, onSwipeLeft, onSwipeRight, onSwipeUp, onFinish }) => {
    const { playSwipeSound, triggerHaptic } = useGame();
    const [currentIndex, setCurrentIndex] = useState(0);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);

    // CRITICAL: Hooks must be defined BEFORE any early returns
    const topCardStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { rotateZ: `${interpolate(translateX.value, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [-15, 0, 15])}deg` }
            ],
        };
    });

    const nextCardStyle = useAnimatedStyle(() => {
        const scaleValue = interpolate(
            Math.abs(translateX.value),
            [0, SCREEN_WIDTH],
            [0.9, 1]
        );
        const opacityValue = interpolate(
            Math.abs(translateX.value),
            [0, SCREEN_WIDTH * 0.5],
            [0.6, 1]
        );
        return {
            transform: [{ scale: scaleValue }],
            opacity: opacityValue,
        };
    });

    const leftOverlayStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateX.value,
            [-SWIPE_THRESHOLD, 0],
            [0.5, 0],
            'clamp'
        );
        return { opacity };
    });

    const rightOverlayStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateX.value,
            [0, SWIPE_THRESHOLD],
            [0, 0.5],
            'clamp'
        );
        return { opacity };
    });

    // If no data at all - moved AFTER hooks to follow Rules of Hooks
    if (!data || data.length === 0) {
        return (
            <View style={styles.center}>
                <Card
                    item={{
                        category: 'PrepSwipe',
                        question: 'No questions here!',
                        answer: 'Try another category.',
                        explanation: 'You might have finished everything or the category is empty.'
                    }}
                />
            </View>
        );
    }

    const currentItem = data[currentIndex % data.length];
    const nextItem = data[(currentIndex + 1) % data.length];

    const handleNext = (direction) => {
        if (!currentItem) return;

        if (direction === 'up') onSwipeUp && onSwipeUp(currentItem);
        else if (direction === 'left') onSwipeLeft && onSwipeLeft(currentItem);
        else onSwipeRight && onSwipeRight(currentItem);

        setCurrentIndex(prev => prev + 1);
        playSwipeSound();

        // Haptic feedback based on direction
        if (direction === 'left') triggerHaptic('heavy');
        else if (direction === 'right') triggerHaptic('success');
        else triggerHaptic('medium');

        translateX.value = 0;
        translateY.value = 0;
        scale.value = 1;
    };

    const pan = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY;
        })
        .onEnd((event) => {
            if (Math.abs(event.translationY) > Math.abs(event.translationX) && event.translationY < -SWIPE_THRESHOLD) {
                translateY.value = withTiming(-SCREEN_HEIGHT, { duration: 200 }, () => runOnJS(handleNext)('up'));
            }
            else if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
                const direction = event.translationX > 0 ? 'right' : 'left';
                translateX.value = withTiming(
                    direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5,
                    { duration: 200 },
                    () => runOnJS(handleNext)(direction)
                );
            } else {
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            }
        });

    return (
        <View style={styles.container}>
            {nextItem && (
                <View style={[styles.cardContainer, styles.nextCard]}>
                    <Animated.View style={[styles.animatedWrapper, nextCardStyle]}>
                        <Card item={nextItem} />
                    </Animated.View>
                </View>
            )}

            <GestureDetector gesture={pan}>
                <Animated.View style={[styles.cardContainer, topCardStyle]}>
                    <Card item={currentItem} />
                    <Animated.View
                        style={[
                            styles.overlay,
                            { backgroundColor: '#EF4444' },
                            leftOverlayStyle
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.overlay,
                            { backgroundColor: '#10B981' },
                            rightOverlayStyle
                        ]}
                    />
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        padding: 20,
    },
    cardContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    nextCard: {
        zIndex: 0,
    },
    animatedWrapper: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        margin: 20,
        borderRadius: 20,
        pointerEvents: 'none',
        zIndex: 10,
    }
});

export default SwipeDeck;
