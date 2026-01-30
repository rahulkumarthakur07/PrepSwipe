import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Border, Shadows, Spacing } from '../../constants/theme';
import { useGame } from '../../context/GameContext';

const { width, height } = Dimensions.get('window');

const NODE_WIDTH = 120;
const NODE_HEIGHT = 60;
const LEVEL_GAP = 100; // Horizontal gap
const NODE_GAP = 20;   // Vertical gap

// Recursive layout calculation
const calculateLayout = (node, depth = 0, yOffset = { value: 0 }) => {
    const isLeaf = !node.children || node.children.length === 0;

    // Process children first to determine height
    let childrenHeight = 0;
    let childrenNodes = [];

    if (!isLeaf) {
        node.children.forEach(child => {
            const childResult = calculateLayout(child, depth + 1, yOffset);
            childrenNodes.push(childResult);
            childrenHeight += childResult.totalHeight;
        });
    }

    const myHeight = isLeaf ? NODE_HEIGHT + NODE_GAP : childrenHeight;

    // Calculate my Y position: centered relative to children or just current offset
    // For simple tree: Y is midpoint of children's spread

    let myY;
    if (isLeaf) {
        myY = yOffset.value + myHeight / 2;
        yOffset.value += myHeight;
    } else {
        const firstChildY = childrenNodes[0].y;
        const lastChildY = childrenNodes[childrenNodes.length - 1].y;
        myY = (firstChildY + lastChildY) / 2;
    }

    const myX = depth * (NODE_WIDTH + LEVEL_GAP);

    return {
        ...node,
        x: myX,
        y: myY,
        totalHeight: myHeight,
        processedChildren: childrenNodes
    };
};

const flattenTree = (layoutNode, list = [], edges = []) => {
    list.push({
        id: layoutNode.id,
        label: layoutNode.label,
        x: layoutNode.x,
        y: layoutNode.y,
        depth: layoutNode.x / (NODE_WIDTH + LEVEL_GAP)
    });

    if (layoutNode.processedChildren) {
        layoutNode.processedChildren.forEach(child => {
            edges.push({
                from: { x: layoutNode.x + NODE_WIDTH, y: layoutNode.y },
                to: { x: child.x, y: child.y }
            });
            flattenTree(child, list, edges);
        });
    }
    return { nodes: list, edges };
};

export default function MindmapDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { mindmaps, colors, triggerHaptic } = useGame();

    const mindmap = mindmaps.find(m => m.id === id);

    const { nodes, edges } = useMemo(() => {
        if (!mindmap || !mindmap.root) return { nodes: [], edges: [] };

        // Reset offset for calculation
        const yOffset = { value: 0 };
        const layoutTree = calculateLayout(mindmap.root, 0, yOffset);
        return flattenTree(layoutTree);
    }, [mindmap]);

    // Gestures
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const translateX = useSharedValue(width / 4); // Center roughly
    const translateY = useSharedValue(height / 3);
    const savedTranslateX = useSharedValue(width / 4);
    const savedTranslateY = useSharedValue(height / 3);

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            translateX.value = savedTranslateX.value + e.translationX;
            translateY.value = savedTranslateY.value + e.translationY;
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            scale.value = savedScale.value * e.scale;
        })
        .onEnd(() => {
            savedScale.value = scale.value;
        });

    const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value }
        ]
    }));

    if (!mindmap) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text }}>Mindmap not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, padding: 10 }}>
                    <Text style={{ color: colors.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>

                {/* Header Overlay */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => { triggerHaptic('light'); router.back(); }}
                        style={[styles.backButton, { borderColor: colors.border, backgroundColor: colors.card }]}
                    >
                        <ChevronLeft color={colors.text} size={28} strokeWidth={4} />
                    </TouchableOpacity>
                    <View style={[styles.titleBadge, { backgroundColor: colors.primary, borderColor: colors.border }]}>
                        <Text style={styles.titleText} numberOfLines={1}>{mindmap.title}</Text>
                    </View>
                </View>

                {/* Canvas */}
                <GestureDetector gesture={composedGesture}>
                    <Animated.View style={[styles.canvas, animatedStyle]}>

                        {/* Edges Layer */}
                        <Svg width={5000} height={5000} style={styles.svgLayer}>
                            {edges.map((edge, i) => {
                                const d = `M${edge.from.x},${edge.from.y} C${edge.from.x + 50},${edge.from.y} ${edge.to.x - 50},${edge.to.y} ${edge.to.x},${edge.to.y}`;
                                return (
                                    <Path
                                        key={i}
                                        d={d}
                                        stroke={colors.text + '50'}
                                        strokeWidth={3}
                                        fill="none"
                                    />
                                );
                            })}
                        </Svg>

                        {/* Nodes Layer */}
                        {(nodes || []).map(node => (
                            <View
                                key={node.id}
                                style={[
                                    styles.node,
                                    {
                                        left: node.x,
                                        top: node.y - NODE_HEIGHT / 2, // Centered Y
                                        width: NODE_WIDTH,
                                        height: node.depth === 0 ? 80 : 60, // Root bigger
                                        backgroundColor: node.depth === 0 ? colors.primary : colors.card,
                                        borderColor: colors.border,
                                        zIndex: 10 + node.depth
                                    }
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.nodeText,
                                        {
                                            color: node.depth === 0 ? '#FFF' : colors.text,
                                            fontSize: node.depth === 0 ? 14 : 11
                                        }
                                    ]}
                                    numberOfLines={3}
                                >
                                    {node.label}
                                </Text>
                            </View>
                        ))}

                    </Animated.View>
                </GestureDetector>

                <View style={styles.controls}>
                    <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '700' }}>
                        PINCH TO ZOOM • DRAG TO MOVE
                    </Text>
                </View>
            </View>
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    header: {
        position: 'absolute',
        top: 60,
        left: Spacing.l,
        right: Spacing.l,
        flexDirection: 'row',
        zIndex: 100,
        alignItems: 'center',
        gap: Spacing.m,
        pointerEvents: 'box-none', // Allow touches through empty space
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
    titleBadge: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 16,
        borderWidth: 3,
        ...Shadows.pop,
        flex: 1,
    },
    titleText: {
        color: '#FFF',
        fontWeight: '900',
        fontSize: 14,
        textTransform: 'uppercase',
    },
    canvas: {
        width: 5000, // Large canvas
        height: 5000,
    },
    svgLayer: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    node: {
        position: 'absolute',
        borderRadius: 12,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
        ...Shadows.pop,
    },
    nodeText: {
        textAlign: 'center',
        fontWeight: '700',
    },
    controls: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        backgroundColor: 'rgba(255,255,255,0.8)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    }
});
