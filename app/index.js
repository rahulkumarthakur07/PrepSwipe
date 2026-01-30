import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Bookmark, Gamepad2, Menu, Network, RefreshCw, Settings } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, StatusBar as RNStatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BookmarkModal from '../components/BookmarkModal';
import CategoriesModal from '../components/CategoriesModal';
import InstructionsOverlay from '../components/InstructionsOverlay';
import QuestionListModal from '../components/QuestionListModal';
import RewardModal from '../components/RewardModal';
import SettingsModal from '../components/SettingsModal';
import SwipeDeck from '../components/SwipeDeck';
import { Border, Shadows, Spacing } from '../constants/theme';
import { useGame } from '../context/GameContext';

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

export default function App() {
    const router = useRouter();
    const {
        questions,
        currentIndex,
        bookmarks,
        saveBookmark,
        removeBookmark,
        incrementIndex,
        markDiscarded,
        resetDiscarded,
        resetProgress,
        clearBookmarks,
        colors,
        isDark,
        currentCategory,
        playPopSound,
        triggerHaptic,
        hasSeenInstructions,
        setHasSeenInstructions
    } = useGame();

    const [bookmarkModalVisible, setBookmarkModalVisible] = useState(false);
    const [settingsModalVisible, setSettingsModalVisible] = useState(false);
    const [questionListModalVisible, setQuestionListModalVisible] = useState(false);
    const [categoriesModalVisible, setCategoriesModalVisible] = useState(false);
    const [instructionsVisible, setInstructionsVisible] = useState(false);
    const [rewardModalVisible, setRewardModalVisible] = useState(false);
    const [activeMilestone, setActiveMilestone] = useState(0);
    const [shownMilestones, setShownMilestones] = useState([]);
    const [deckKey, setDeckKey] = useState(0);

    // Show instructions on first open
    React.useEffect(() => {
        if (!hasSeenInstructions) {
            const timer = setTimeout(() => {
                setInstructionsVisible(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [hasSeenInstructions]);

    // Reward Logic
    React.useEffect(() => {
        if (questions.length === 0) return;

        // Calculate percentage based on cards seen/swiped
        const percentage = Math.floor((currentIndex / questions.length) * 100);
        const milestones = [10, 40, 70, 90, 100];

        // Special case for 100% - check if we are on the "last" card wrap around?
        // Actually, currentIndex incrementing means a card was just finished.

        const reachedMilestone = milestones.find(m => percentage >= m && !shownMilestones.includes(m));

        if (reachedMilestone) {
            setActiveMilestone(reachedMilestone);
            setRewardModalVisible(true);
            setShownMilestones(prev => [...prev, reachedMilestone]);
        }
    }, [currentIndex, questions.length]);

    // Reset milestones when category changes or index resets to 0
    React.useEffect(() => {
        if (currentIndex === 0) {
            setShownMilestones([]);
        }
    }, [currentCategory, currentIndex]);

    const forceDeckReset = () => setDeckKey(prev => prev + 1);

    const openCategories = () => {
        triggerHaptic('light');
        setCategoriesModalVisible(true);
    };

    const openBookmarks = () => {
        triggerHaptic('light');
        setBookmarkModalVisible(true);
    };

    const openSettings = () => {
        triggerHaptic('light');
        setSettingsModalVisible(true);
    };

    const openQuestionList = () => {
        triggerHaptic('light');
        setQuestionListModalVisible(true);
    };

    const handleSwipeUp = (item) => {
        // Skip (Next)
        incrementIndex();
        forceDeckReset();
    };

    const handleSwipeLeft = (item) => {
        // Don't show again (Discard)
        markDiscarded();
        forceDeckReset();
    };

    const handleSwipeRight = (item) => {
        // Save
        saveBookmark(item);
        incrementIndex();
        forceDeckReset();
    };

    // Circular Deck Logic:
    // We want the deck to appear infinite.
    // We pass [Current, Next, NextNext...] wrapping around to Start.
    const deckData = [
        ...questions.slice(currentIndex),
        ...questions.slice(0, currentIndex)
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <DotBackground colors={colors} />
            <StatusBar style={isDark ? "light" : "dark"} backgroundColor={colors.background} />
            <View style={styles.header}>
                <View style={[styles.headerBadge, { backgroundColor: colors.card, borderColor: colors.border, transform: [{ rotate: '-4deg' }], borderWidth: Border.heavy }]}>
                    <TouchableOpacity onPress={openCategories} style={styles.badgeContent}>
                        <Menu color={colors.text} size={20} strokeWidth={3} />
                        <Text style={[styles.badgeText, { color: colors.text }]} numberOfLines={1}>
                            {currentCategory}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.titleContainer, { transform: [{ rotate: '2deg' }], borderWidth: Border.heavy, paddingHorizontal: 20 }]}>
                    <Text style={[styles.headerTitle, { color: colors.primary, fontSize: 22 }]}>PrepSwipe</Text>
                </View>

                <TouchableOpacity
                    onPress={openSettings}
                    style={[styles.headerButton, { backgroundColor: colors.card, borderColor: colors.border, transform: [{ rotate: '5deg' }], borderWidth: Border.heavy }]}
                >
                    <Settings color={colors.text} size={28} strokeWidth={4} />
                </TouchableOpacity>
            </View>

            <View style={styles.progressContainer}>
                <View style={[styles.progressBarWrapper, { borderColor: colors.border, backgroundColor: colors.card, borderWidth: Border.heavy, height: 24, borderRadius: 12 }]}>
                    <View
                        style={[
                            styles.progressBarFill,
                            {
                                backgroundColor: colors.primary,
                                width: `${(Math.min(currentIndex + 1, questions.length) / questions.length) * 100}%`,
                                borderRightWidth: 3,
                                borderColor: colors.border
                            }
                        ]}
                    />
                </View>
                <View style={[styles.progressLabelBadge, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 2, transform: [{ rotate: '-1deg' }] }]}>
                    <Text style={[styles.progressLabel, { color: colors.text }]}>
                        CARD <Text style={{ color: colors.primary }}>{Math.min(currentIndex + 1, questions.length)}</Text> OF <Text style={{ color: colors.primary }}>{questions.length}</Text>
                    </Text>
                </View>
            </View>

            <View style={styles.content}>
                <SwipeDeck
                    key={deckKey}
                    data={deckData}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    onSwipeUp={handleSwipeUp}
                />
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    onPress={openQuestionList}
                    style={[styles.footerButton, { backgroundColor: '#FEE2E2', borderColor: colors.border, transform: [{ rotate: '-3deg' }], borderWidth: Border.heavy, ...Shadows.popHeavy }]}
                >
                    <Menu color="#000" size={24} strokeWidth={4} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => { triggerHaptic('medium'); router.push('/hangman'); }}
                    style={[styles.footerButton, { backgroundColor: '#FACC15', borderColor: colors.border, transform: [{ rotate: '2deg' }], borderWidth: Border.heavy, ...Shadows.popHeavy }]}
                >
                    <Gamepad2 color="#000" size={24} strokeWidth={4} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => { triggerHaptic('medium'); router.push('/mindmap'); }}
                    style={[styles.footerButton, { backgroundColor: '#E9D5FF', borderColor: colors.border, transform: [{ rotate: '-2deg' }], borderWidth: Border.heavy, ...Shadows.popHeavy }]}
                >
                    <Network color="#000" size={24} strokeWidth={4} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        triggerHaptic('medium');
                        resetDiscarded();
                        forceDeckReset();
                    }}
                    style={[styles.footerButton, { backgroundColor: '#FEF3C7', borderColor: colors.border, transform: [{ rotate: '3deg' }], borderWidth: Border.heavy, ...Shadows.popHeavy }]}
                >
                    <RefreshCw color="#000" size={24} strokeWidth={4} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={openBookmarks}
                    style={[styles.footerButton, { backgroundColor: colors.primary, borderColor: colors.border, transform: [{ rotate: '-4deg' }], borderWidth: Border.heavy, ...Shadows.popHeavy }]}
                >
                    <Bookmark color="#FFF" size={24} strokeWidth={4} />
                    {bookmarks.length > 0 && (
                        <View style={[styles.badge, { backgroundColor: '#EF4444', borderColor: '#FFF', width: 20, height: 20, borderRadius: 10, top: -6, right: -6 }]}>
                            <Text style={[styles.badgeCount, { fontSize: 10 }]}>{bookmarks.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <BookmarkModal
                visible={bookmarkModalVisible}
                onClose={() => setBookmarkModalVisible(false)}
                bookmarks={bookmarks}
                onRemoveBookmark={removeBookmark}
            />

            <SettingsModal
                visible={settingsModalVisible}
                onClose={() => setSettingsModalVisible(false)}
            />

            <QuestionListModal
                visible={questionListModalVisible}
                onClose={() => setQuestionListModalVisible(false)}
            />

            <CategoriesModal
                visible={categoriesModalVisible}
                onClose={() => setCategoriesModalVisible(false)}
            />

            <InstructionsOverlay
                visible={instructionsVisible}
                onClose={() => setInstructionsVisible(false)}
            />

            <RewardModal
                visible={rewardModalVisible}
                milestone={activeMilestone}
                onClose={() => setRewardModalVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.l,
        paddingVertical: Spacing.m,
        zIndex: 10,
    },
    headerBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 3,
        ...Shadows.pop,
    },
    badgeContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '900',
        maxWidth: 100,
    },
    titleContainer: {
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 3,
        borderColor: '#000',
        ...Shadows.pop,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    headerButton: {
        padding: 8,
        borderRadius: 16,
        borderWidth: 3,
        ...Shadows.pop,
    },
    progressContainer: {
        paddingHorizontal: Spacing.l,
        marginBottom: Spacing.s,
    },
    progressBarWrapper: {
        height: 16,
        borderRadius: 8,
        borderWidth: 3,
        overflow: 'hidden',
        ...Shadows.pop,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressLabelBadge: {
        alignSelf: 'center',
        marginTop: -12,
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 12,
        ...Shadows.pop,
    },
    progressLabel: {
        fontSize: 12,
        fontWeight: '900',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    content: {
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.l,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        paddingTop: Spacing.m,
        gap: Spacing.m,
        alignItems: 'center',
    },
    footerButton: {
        height: 64,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    bookmarkBtnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        maxWidth: '100%',
    },
    footerButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 1,
    },
    badge: {
        position: 'absolute',
        top: -10,
        right: -10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        ...Shadows.pop,
    },
    badgeCount: {
        color: '#FFF',
        fontWeight: '900',
    }
});
