import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { createContext, useContext, useEffect, useState } from 'react';
import questions from '../assets/questions.json';
import { DarkColors, LightColors } from '../constants/theme';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [bookmarks, setBookmarks] = useState([]);
    const [discarded, setDiscarded] = useState([]); // Array of IDs (indices)
    const [isDark, setDark] = useState(false);
    const [loading, setLoading] = useState(true);
    const [musicEnabled, setMusicEnabled] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [currentCategory, setCurrentCategory] = useState('All');
    const [userQuestions, setUserQuestions] = useState([]);
    const [hasSeenInstructions, setHasSeenInstructions] = useState(false);
    const [hangmanProgress, setHangmanProgress] = useState([1]); // Array of unlocked/completed level indices
    const [mindmaps, setMindmaps] = useState([]);

    // Derived Theme
    const colors = isDark ? DarkColors : LightColors;

    // Derived Active Questions (Filter by Category and Exclude Discarded)
    const combinedQuestions = [...questions, ...userQuestions];

    const activeQuestions = combinedQuestions.filter(q => {
        const isDiscarded = discarded.includes(q.index);
        const matchesCategory = currentCategory === 'All' || q.category === currentCategory;
        // In "All" category, we show everything. In specific categories, we hide discarded.
        const shouldShow = currentCategory === 'All' || !isDiscarded;
        return shouldShow && matchesCategory;
    });

    const availableCategories = ['All', ...new Set(combinedQuestions.map(q => q.category?.trim() || 'General').sort((a, b) => a.localeCompare(b)))];

    // Audio Players
    const bgMusicPlayer = useAudioPlayer(require('../assets/audio/background music.mp3'));
    const flipPlayer = useAudioPlayer(require('../assets/audio/flip.mp3'));
    const swipePlayer = useAudioPlayer(require('../assets/audio/swipe.mp3'));
    const alphabetClickPlayer = useAudioPlayer(require('../assets/audio/clickalphabet.mp3'));


    useEffect(() => {
        loadState();
    }, []);

    useEffect(() => {
        if (!loading) {
            saveState();
        }
    }, [currentIndex, bookmarks, discarded, isDark, loading, musicEnabled, soundEnabled, currentCategory, userQuestions, hasSeenInstructions, hangmanProgress]);

    // Handle Background Music
    useEffect(() => {
        if (bgMusicPlayer) {
            bgMusicPlayer.loop = true;
            bgMusicPlayer.volume = 0.5;
            if (musicEnabled) {
                bgMusicPlayer.play();
            } else {
                bgMusicPlayer.pause();
            }
        }
    }, [musicEnabled, bgMusicPlayer]);

    const playFlipSound = () => {
        if (!soundEnabled || !flipPlayer) return;
        flipPlayer.seekTo(0);
        flipPlayer.play();
    };

    const playSwipeSound = () => {
        if (!soundEnabled || !swipePlayer) return;
        swipePlayer.seekTo(0);
        swipePlayer.play();
    };

    const playAlphabetClickSound = () => {
        if (!soundEnabled || !alphabetClickPlayer) return;
        alphabetClickPlayer.seekTo(0);
        alphabetClickPlayer.play();
    };


    const triggerHaptic = (type = 'light') => {
        if (!soundEnabled) return;
        switch (type) {
            case 'heavy':
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                break;
            case 'medium':
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                break;
            case 'success':
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                break;
            case 'error':
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                break;
            default:
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    };

    const loadState = async () => {
        try {
            const savedIndex = await AsyncStorage.getItem('prepSwipe_index');
            const savedBookmarks = await AsyncStorage.getItem('prepSwipe_bookmarks');
            const savedDiscarded = await AsyncStorage.getItem('prepSwipe_discarded');
            const savedTheme = await AsyncStorage.getItem('prepSwipe_theme');
            const savedMusic = await AsyncStorage.getItem('prepSwipe_music');
            const savedSound = await AsyncStorage.getItem('prepSwipe_sound');
            const savedInstructions = await AsyncStorage.getItem('prepSwipe_instructions');

            if (savedIndex) setCurrentIndex(parseInt(savedIndex, 10));
            if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
            if (savedDiscarded) setDiscarded(JSON.parse(savedDiscarded));
            if (savedTheme) setDark(JSON.parse(savedTheme));
            if (savedMusic !== null) setMusicEnabled(JSON.parse(savedMusic));
            if (savedSound !== null) setSoundEnabled(JSON.parse(savedSound));
            if (savedInstructions !== null) setHasSeenInstructions(JSON.parse(savedInstructions));

            const savedHangman = await AsyncStorage.getItem('prepSwipe_hangmanProgress');
            if (savedHangman) setHangmanProgress(JSON.parse(savedHangman));

            const savedCategory = await AsyncStorage.getItem('prepSwipe_category');
            const savedUserQuestions = await AsyncStorage.getItem('prepSwipe_userQuestions');

            if (savedCategory) setCurrentCategory(savedCategory);
            if (savedUserQuestions) {
                const parsed = JSON.parse(savedUserQuestions);
                setUserQuestions(Array.isArray(parsed) ? parsed : []);
            }

            const savedMindmaps = await AsyncStorage.getItem('prepSwipe_mindmaps');
            if (savedMindmaps) {
                const parsed = JSON.parse(savedMindmaps);
                setMindmaps(Array.isArray(parsed) ? parsed : []);
            }
        } catch (e) {
            console.error("Failed to load state", e);
        } finally {
            setLoading(false);
        }
    };

    const saveState = async () => {
        try {
            await AsyncStorage.setItem('prepSwipe_index', currentIndex.toString());
            await AsyncStorage.setItem('prepSwipe_bookmarks', JSON.stringify(bookmarks));
            await AsyncStorage.setItem('prepSwipe_discarded', JSON.stringify(discarded));
            await AsyncStorage.setItem('prepSwipe_theme', JSON.stringify(isDark));
            await AsyncStorage.setItem('prepSwipe_music', JSON.stringify(musicEnabled));
            await AsyncStorage.setItem('prepSwipe_sound', JSON.stringify(soundEnabled));
            await AsyncStorage.setItem('prepSwipe_instructions', JSON.stringify(hasSeenInstructions));
            await AsyncStorage.setItem('prepSwipe_category', currentCategory);
            await AsyncStorage.setItem('prepSwipe_userQuestions', JSON.stringify(userQuestions));
            await AsyncStorage.setItem('prepSwipe_hangmanProgress', JSON.stringify(hangmanProgress));
            await AsyncStorage.setItem('prepSwipe_mindmaps', JSON.stringify(mindmaps));
        } catch (e) {
            console.error("Failed to save state", e);
        }
    };

    const toggleTheme = () => setDark(prev => !prev);
    const toggleMusic = () => setMusicEnabled(prev => !prev);
    const toggleSound = () => setSoundEnabled(prev => !prev);

    const incrementIndex = () => {
        if (activeQuestions.length === 0) return;
        setCurrentIndex(prev => {
            const next = prev + 1;
            return next >= activeQuestions.length ? 0 : next;
        });
    };

    const markDiscarded = () => {
        if (activeQuestions.length === 0) return;
        const currentQ = activeQuestions[currentIndex];
        if (!currentQ) return;

        setDiscarded(prev => [...prev, currentQ.index]);
        setCurrentIndex(prev => {
            if (prev >= activeQuestions.length - 1) return 0;
            return prev;
        });
    };

    const resetDiscarded = () => {
        setDiscarded([]);
        setCurrentIndex(0);
    };

    const resetProgress = () => {
        setCurrentIndex(0);
        setDiscarded([]);
    };

    const changeCategory = (category) => {
        setCurrentCategory(category);
        setCurrentIndex(0);
    };

    const upsertUserQuestion = (newQuestion) => {
        setUserQuestions(prev => {
            const index = typeof newQuestion.index === 'number' ? prev.findIndex(q => q.index === newQuestion.index) : -1;

            if (index >= 0) {
                const updated = [...prev];
                updated[index] = { ...newQuestion };
                return updated;
            } else {
                const currentCombined = [...questions, ...prev];
                const maxIndex = currentCombined.reduce((max, q) => {
                    const idx = typeof q.index === 'number' ? q.index : 0;
                    return Math.max(max, idx);
                }, 0);

                const finalIndex = maxIndex + 1;
                const newCard = { ...newQuestion, index: finalIndex };
                return [...prev, newCard];
            }
        });
    };

    const importQuestions = (newQuestionsArray) => {
        setUserQuestions(prev => {
            const currentCombined = [...questions, ...prev];
            let maxIndex = currentCombined.reduce((max, q) => {
                const idx = typeof q.index === 'number' ? q.index : 0;
                return Math.max(max, idx);
            }, 0);

            const preparedQuestions = newQuestionsArray.map(q => {
                maxIndex++;
                return { ...q, index: maxIndex };
            });

            return [...prev, ...preparedQuestions];
        });
    };

    const deleteUserQuestion = (index) => {
        setUserQuestions(prev => prev.filter(q => q.index !== index));
        setBookmarks(prev => prev.filter(b => b.index !== index));
    };

    const deleteCategory = (categoryName) => {
        if (categoryName === 'All') return;
        setUserQuestions(prev => prev.filter(q => q.category !== categoryName));
        if (currentCategory === categoryName) {
            setCurrentCategory('All');
            setCurrentIndex(0);
        }
    };

    const saveBookmark = (question) => {
        if (!bookmarks.some(b => b.index === question.index)) {
            setBookmarks([...bookmarks, question]);
        }
    };

    const removeBookmark = (index) => {
        setBookmarks(bookmarks.filter(b => b.index !== index));
    };

    const clearBookmarks = () => setBookmarks([]);

    const saveMindmap = (mindmap) => {
        setMindmaps(prev => [...prev, mindmap]);
    };

    const deleteMindmap = (id) => {
        setMindmaps(prev => prev.filter(m => m.id !== id));
    };

    const updateMindmap = (updatedMindmap) => {
        setMindmaps(prev => prev.map(m => m.id === updatedMindmap.id ? updatedMindmap : m));
    };

    return (
        <GameContext.Provider value={{
            questions: activeQuestions,
            allQuestions: combinedQuestions,
            baseQuestions: questions,
            currentIndex,
            bookmarks,
            discarded,
            saveBookmark,
            removeBookmark,
            incrementIndex,
            markDiscarded,
            resetDiscarded,
            resetProgress,
            clearBookmarks,
            loading,
            colors,
            isDark,
            toggleTheme,
            musicEnabled,
            soundEnabled,
            toggleMusic,
            toggleSound,
            playFlipSound,
            playSwipeSound,
            playAlphabetClickSound,
            triggerHaptic,
            currentCategory,
            changeCategory,
            categories: availableCategories,
            upsertUserQuestion,
            deleteUserQuestion,
            deleteCategory,
            userQuestions,
            hasSeenInstructions,
            setHasSeenInstructions,
            hangmanProgress,
            unlockLevel: (level) => setHangmanProgress(prev => [...new Set([...prev, level])]),
            importQuestions,
            mindmaps,
            saveMindmap,
            deleteMindmap,
            updateMindmap
        }}>
            {children}
        </GameContext.Provider>
    );
};
