import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, Pattern, Rect } from 'react-native-svg';
import ErrorBoundary from '../../components/ErrorBoundary';
import { Shadows, Spacing } from '../../constants/theme';
import { useGame } from '../../context/GameContext';

const { width, height } = Dimensions.get('window');
const NODE_WIDTH = 120;
const NODE_HEIGHT = 60;
const LEVEL_GAP = 100; // Horizontal gap
const NODE_GAP = 20;   // Vertical gap

// Recursive layout calculation
// Recursive layout calculation
const MAX_DEPTH = 50;

// Recursive layout calculation
// Safe Layout Calculation with Cycle Detection
const calculateLayout = (node, depth = 0, yOffset = { value: 0 }, visited = new Set()) => {
    if (!node) return null;

    // Cycle detection
    if (visited.has(node.id)) {
        console.warn("Cycle detected for node:", node.label);
        return {
            ...node,
            id: `${node.id}_cycle_${Math.random()}`, // Unique ID for visual
            label: `${node.label} (Cycle)`,
            children: [],
            x: 0, y: 0, totalHeight: NODE_HEIGHT
        };
    }

    const newVisited = new Set(visited).add(node.id);

    if (depth > MAX_DEPTH) {
        return {
            ...node,
            id: `${node.id}_max_${Math.random()}`,
            label: 'Max Depth Reached',
            children: [],
            x: 0, y: 0, totalHeight: NODE_HEIGHT
        };
    }

    const children = Array.isArray(node.children) ? node.children : [];
    const isLeaf = children.length === 0;

    let childrenHeight = 0;
    let childrenNodes = [];

    if (!isLeaf) {
        children.forEach(child => {
            if (child) {
                const childResult = calculateLayout(child, depth + 1, yOffset, newVisited);
                if (childResult) {
                    childrenNodes.push(childResult);
                    childrenHeight += childResult.totalHeight;
                }
            }
        });
    }

    const effectiveIsLeaf = childrenNodes.length === 0;
    const myHeight = effectiveIsLeaf ? NODE_HEIGHT + NODE_GAP : childrenHeight;

    let myY;
    if (effectiveIsLeaf) {
        myY = yOffset.value + myHeight / 2;
        yOffset.value += myHeight;
    } else {
        const firstChildY = childrenNodes[0].y;
        const lastChildY = childrenNodes[childrenNodes.length - 1].y;
        myY = (firstChildY + lastChildY) / 2;
    }

    const myX = depth * (NODE_WIDTH + LEVEL_GAP);

    // Strict Finite Checks
    const safeX = Number.isFinite(myX) ? myX : 0;
    const safeY = Number.isFinite(myY) ? myY : 0;
    const safeHeight = Number.isFinite(myHeight) ? myHeight : NODE_HEIGHT;

    return {
        ...node,
        children: children,
        note: node.note, // Preserve the definition
        x: safeX,
        y: safeY,
        totalHeight: safeHeight,
        processedChildren: childrenNodes
    };
};

const processGraph = (root) => {
    if (!root) return { nodes: [], edges: [], width: 100, height: 100 };

    const yOffset = { value: 0 };
    const layoutTree = calculateLayout(root, 0, yOffset);

    // Flatten and compute bounds
    const nodes = [];
    const edges = [];
    let maxX = 0;
    let maxY = 0;

    const traverse = (node) => {
        if (!node) return;

        nodes.push({
            id: node.id,
            label: node.label,
            note: node.note, // Pass the definition
            x: node.x,
            y: node.y,
            depth: node.x / (NODE_WIDTH + LEVEL_GAP)
        });

        maxX = Math.max(maxX, node.x + NODE_WIDTH);
        maxY = Math.max(maxY, node.y + NODE_HEIGHT / 2);

        if (node.processedChildren) {
            node.processedChildren.forEach(child => {
                edges.push({
                    from: { x: node.x + NODE_WIDTH, y: node.y },
                    to: { x: child.x, y: child.y }
                });
                traverse(child);
            });
        }
    };

    traverse(layoutTree);

    // Add padding
    return {
        nodes,
        edges,
        width: Math.max(Dimensions.get('window').width, maxX + 200),
        height: Math.max(Dimensions.get('window').height, maxY + 200)
    };
};

const NODE_COLORS = [
    '#FF6B6B', // Level 0 (Root) - Red/Coral
    '#4ECDC4', // Level 1 - Teal
    '#45B7D1', // Level 2 - Sky Blue
    '#96CEB4', // Level 3 - Sage
    '#FFEEAD', // Level 4 - Cream
    '#D4A5A5', // Level 5 - Dusty Rose
];

const getNodeColor = (depth, colors) => {
    if (depth === 0) return colors.primary; // Root uses primary theme color
    // Cycle through vibrant colors for other levels
    return NODE_COLORS[(depth - 1) % NODE_COLORS.length];
};

function MindmapDetailScreenContent() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { mindmaps, colors, triggerHaptic } = useGame();

    // ID Normalization
    const mindmap = mindmaps.find(m => String(m.id) === String(id));

    const { nodes, edges, dimensions, error } = useMemo(() => {
        if (!mindmap || !mindmap.root) {
            return { nodes: [], edges: [], dimensions: { width: 500, height: 500 }, error: null };
        }

        try {
            const { nodes, edges, width, height } = processGraph(mindmap.root);
            return { nodes, edges, dimensions: { width, height }, error: null };
        } catch (e) {
            console.error("Layout Calc Error:", e);
            return { nodes: [], edges: [], dimensions: { width: 500, height: 500 }, error: e.message };
        }
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

    const edgesLayer = useMemo(() => {
        return (
            <Svg width={dimensions.width} height={dimensions.height} style={styles.svgLayer}>
                <Defs>
                    <Pattern
                        id="dots"
                        x="0"
                        y="0"
                        width="30"
                        height="30"
                        patternUnits="userSpaceOnUse"
                    >
                        <Circle
                            cx="2"
                            cy="2"
                            r="1.5"
                            fill={colors.text}
                            fillOpacity={0.1}
                        />
                    </Pattern>
                </Defs>

                {/* Background Pattern */}
                <Rect width="100%" height="100%" fill="url(#dots)" />

                {edges.map((edge, i) => {
                    const d = `M${edge.from.x},${edge.from.y} C${edge.from.x + 60},${edge.from.y} ${edge.to.x - 60},${edge.to.y} ${edge.to.x},${edge.to.y}`;
                    return (
                        <Path
                            key={i}
                            d={d}
                            stroke={colors.text}
                            strokeOpacity={0.2}
                            strokeWidth={2}
                            fill="none"
                            strokeLinecap="round"
                        />
                    );
                })}
            </Svg>
        );
    }, [edges, dimensions, colors]);

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

    if (error) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 20 }]}>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Failed to load Mindmap</Text>
                <Text style={{ color: colors.error || 'red', textAlign: 'center', marginBottom: 20 }}>{error}</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 10, backgroundColor: colors.card, borderRadius: 8 }}>
                    <Text style={{ color: colors.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Subtle Grid Background */}
                <View style={[StyleSheet.absoluteFill, { opacity: 0.05, backgroundColor: colors.text }]} pointerEvents="none" />

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
                    <Animated.View style={[styles.canvas, { width: dimensions.width, height: dimensions.height }, animatedStyle]}>

                        {edgesLayer}

                        {/* Nodes Layer */}
                        {(nodes || []).map(node => {
                            const isRoot = node.depth === 0;
                            const nodeColor = getNodeColor(node.depth, colors);

                            return (
                                <View
                                    key={node.id}
                                    style={[
                                        styles.node,
                                        {
                                            left: node.x,
                                            top: node.y - (isRoot ? 50 : 40), // Adjusted for taller nodes
                                            width: isRoot ? 180 : 150,
                                            height: isRoot ? 100 : 80,
                                            backgroundColor: isRoot ? nodeColor : colors.card,
                                            borderColor: colors.border,
                                            borderWidth: 3,
                                            borderLeftWidth: isRoot ? 3 : 8,
                                            borderLeftColor: isRoot ? colors.border : nodeColor,
                                            zIndex: 10 + node.depth,
                                            shadowColor: colors.border,
                                        }
                                    ]}
                                >
                                    <View style={{ flex: 1, justifyContent: 'center' }}>
                                        <Text
                                            style={[
                                                styles.nodeText,
                                                {
                                                    color: isRoot ? '#FFF' : colors.text,
                                                    fontSize: isRoot ? 15 : 12,
                                                    fontWeight: '900',
                                                    marginBottom: node.note ? 4 : 0
                                                }
                                            ]}
                                            numberOfLines={2}
                                        >
                                            {node.label}
                                        </Text>
                                        {node.note && (
                                            <Text
                                                style={{
                                                    color: isRoot ? 'rgba(255,255,255,0.8)' : colors.textSecondary,
                                                    fontSize: 10,
                                                    fontWeight: '600',
                                                    lineHeight: 12,
                                                    textAlign: 'center'
                                                }}
                                                numberOfLines={3}
                                            >
                                                {node.note}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })}

                    </Animated.View>
                </GestureDetector>

                <View style={[styles.controls, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={{ color: colors.textSecondary, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>
                        PINCH TO ZOOM • DRAG TO MOVE
                    </Text>
                </View>
            </View>
        </View>
    );
}

export default function MindmapDetailScreen() {
    const { colors } = useGame();
    const router = useRouter();

    return (
        <ErrorBoundary colors={colors} onReset={() => router.replace('/mindmap')}>
            <MindmapDetailScreenContent />
        </ErrorBoundary>
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
        pointerEvents: 'box-none',
    },
    backButton: {
        width: 50,
        height: 50,
        borderRadius: 15, // Neo-Brutalist
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.pop,
    },
    titleBadge: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 15,
        borderWidth: 3,
        ...Shadows.pop,
        flex: 1,
    },
    titleText: {
        color: '#FFF',
        fontWeight: '900',
        fontSize: 16,
        textTransform: 'uppercase',
    },
    canvas: {
        // Dimensions set dynamically
    },
    svgLayer: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    node: {
        position: 'absolute',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
        ...Shadows.pop,
    },
    nodeText: {
        textAlign: 'center',
    },
    controls: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 3,
        ...Shadows.pop,
    }
});
