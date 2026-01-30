import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, ZoomIn } from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, Pattern, Rect } from 'react-native-svg';
import ErrorBoundary from '../../components/ErrorBoundary';
import { Shadows, Spacing } from '../../constants/theme';
import { useGame } from '../../context/GameContext';

const { width, height } = Dimensions.get('window');
const NODE_WIDTH = 190;
const LEVEL_GAP = 140; // Increased Gap
const NODE_GAP = 40;     // Increased Gap
const MIN_NODE_HEIGHT = 80;

const getNodeWidth = (depth) => {
    if (depth === 0) return 220; // Root
    if (depth === 1) return 190; // Branch
    return 170; // Sub-branch
};

const LAYOUT_TYPE = 'tree';

const PASTEL_PALETTE = [
    { main: '#F48FB1', light: '#FCE4EC', dark: '#C2185B' }, // Pink
    { main: '#81D4FA', light: '#E1F5FE', dark: '#0288D1' }, // Blue
    { main: '#A5D6A7', light: '#E8F5E9', dark: '#388E3C' }, // Green
    { main: '#FFCC80', light: '#FFF3E0', dark: '#F57C00' }, // Orange
    { main: '#B39DDB', light: '#EDE7F6', dark: '#512DA8' }, // Purple
    { main: '#B0BEC5', light: '#ECEFF1', dark: '#455A64' }, // Slate
];

const getBranchColor = (depth, branchIndex) => {
    if (depth === 0) return { main: '#5C6BC0', light: '#E8EAF6', dark: '#3F51B5' };
    return PASTEL_PALETTE[branchIndex % PASTEL_PALETTE.length];
};

// Recursive layout calculation
// Recursive layout calculation
const MAX_DEPTH = 50;

/**
 * Heuristic to estimate how tall a node will be based on its text content.
 */
const estimateNodeHeight = (node) => {
    const isRoot = node.depth === 0;
    const titleLines = Math.ceil((node.label?.length || 0) / (isRoot ? 20 : 25));
    const noteLines = Math.ceil((node.note?.length || 0) / 30);

    const baseHeight = isRoot ? 50 : 40;
    const titlePart = titleLines * 20;
    const notePart = node.note ? (noteLines * 16 + 10) : 0;

    const estimated = baseHeight + titlePart + notePart;
    return Math.max(estimated, isRoot ? 90 : 70);
};

/**
 * calculateLayout: Recursively positions nodes in a weighted tree.
 * @param side: -1 for Left, 1 for Right
 * @param branchIndex: Index of the top-level branch
 */
const calculateLayout = (node, depth = 0, side = 1, branchIndex = 0, yOffset = { value: 0 }, visited = new Set()) => {
    if (!node) return null;

    if (visited.has(node.id)) {
        return {
            ...node,
            id: `${node.id}_cycle_${Math.random()}`,
            label: `${node.label} (Cycle)`,
            children: [],
            x: 0, y: 0, totalHeight: NODE_HEIGHT + NODE_GAP,
            side,
            branchIndex
        };
    }

    const newVisited = new Set(visited).add(node.id);
    if (depth > MAX_DEPTH) return null;

    const children = Array.isArray(node.children) ? node.children : [];
    const childrenNodes = [];
    let childrenHeight = 0;

    children.forEach((child, i) => {
        if (child) {
            // Inherit branchIndex from level 1
            const effectiveBranchIndex = depth === 0 ? i : branchIndex;
            const childResult = calculateLayout(child, depth + 1, side, effectiveBranchIndex, yOffset, newVisited);
            if (childResult) {
                childrenNodes.push(childResult);
                childrenHeight += childResult.totalHeight;
            }
        }
    });

    const isLeaf = childrenNodes.length === 0;
    const myHeight = estimateNodeHeight({ ...node, depth });
    const totalBranchHeight = isLeaf ? myHeight + NODE_GAP : childrenHeight;

    let myY;
    if (isLeaf) {
        myY = yOffset.value + totalBranchHeight / 2;
        yOffset.value += totalBranchHeight;
    } else {
        const firstY = childrenNodes[0].y;
        const lastY = childrenNodes[childrenNodes.length - 1].y;
        myY = (firstY + lastY) / 2;
    }

    // Root is always at (0, 0). Children spread left (-1) or right (1).
    const myX = depth === 0 ? 0 : side * depth * (NODE_WIDTH + LEVEL_GAP);

    return {
        ...node,
        children: children,
        x: Number.isFinite(myX) ? myX : 0,
        y: Number.isFinite(myY) ? myY : 0,
        totalHeight: Number.isFinite(totalBranchHeight) ? totalBranchHeight : MIN_NODE_HEIGHT + NODE_GAP,
        nodeHeight: myHeight,
        processedChildren: childrenNodes,
        side,
        depth,
        branchIndex
    };
};

const calculateRadialLayout = (node, depth = 0, angle = 0, arc = 2 * Math.PI, branchIndex = 0, visited = new Set()) => {
    if (!node || depth > MAX_DEPTH || visited.has(node.id)) return null;

    const newVisited = new Set(visited).add(node.id);
    const radius = depth * (NODE_WIDTH + LEVEL_GAP);

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    const children = Array.isArray(node.children) ? node.children : [];
    const processedChildren = [];

    if (children.length > 0) {
        // Sub-nodes get a fraction of the parent's arc
        const startAngle = depth === 0 ? 0 : angle - arc / 2;
        const arcPerChild = arc / children.length;

        children.forEach((child, i) => {
            const effectiveBranchIndex = depth === 0 ? i : branchIndex;
            const childAngle = depth === 0
                ? (i / children.length) * 2 * Math.PI
                : startAngle + (i + 0.5) * arcPerChild;

            // At deeper levels, we tighten the arc to keep clusters together
            const nextArc = depth === 0 ? (2 * Math.PI) / children.length : arcPerChild * 0.8;

            const result = calculateRadialLayout(child, depth + 1, childAngle, nextArc, effectiveBranchIndex, newVisited);
            if (result) processedChildren.push(result);
        });
    }

    return {
        ...node,
        x, y, depth, side: 0, // Side is 0 for radial
        angle,
        branchIndex,
        processedChildren
    };
};

const processGraph = (root) => {
    if (!root) return { nodes: [], edges: [], width: 100, height: 100 };

    let layoutTree;
    let canvasWidth, canvasHeight;
    let minX = 0, maxX = 0, minY = 0, maxY = 0;

    if (LAYOUT_TYPE === 'radial') {
        layoutTree = calculateRadialLayout(root, 0, 0, 2 * Math.PI, 0);
    } else {
        const children = Array.isArray(root.children) ? root.children : [];
        const leftChildren = children.slice(0, Math.ceil(children.length / 2));
        const rightChildren = children.slice(Math.ceil(children.length / 2));
        const leftOffset = { value: 0 };
        const rightOffset = { value: 0 };

        // Use proper branch indices for left/right split
        const leftResults = leftChildren.map((c, i) => calculateLayout(c, 1, -1, i, leftOffset));
        const rightResults = rightChildren.map((c, i) => calculateLayout(c, 1, 1, leftChildren.length + i, rightOffset));

        const maxHeight = Math.max(leftOffset.value, rightOffset.value, MIN_NODE_HEIGHT);
        const leftShift = (maxHeight - leftOffset.value) / 2;
        const rightShift = (maxHeight - rightOffset.value) / 2;
        const shiftSubtree = (node, shift) => {
            if (!node) return;
            node.y += shift;
            node.processedChildren?.forEach(c => shiftSubtree(c, shift));
        };
        leftResults.forEach(r => shiftSubtree(r, leftShift));
        rightResults.forEach(r => shiftSubtree(r, rightShift));

        // Construct the full tree for flattening
        layoutTree = {
            ...root,
            x: 0,
            y: maxHeight / 2,
            depth: 0,
            nodeHeight: estimateNodeHeight({ ...root, depth: 0 }), // Calculate root height
            side: 0,
            branchIndex: 0,
            processedChildren: [...leftResults, ...rightResults].filter(Boolean)
        };
    }

    const nodes = [];
    const edges = [];

    const flatten = (node) => {
        if (!node) return;
        nodes.push({
            id: node.id,
            label: node.label,
            note: node.note,
            x: node.x,
            y: node.y,
            depth: node.depth,
            nodeHeight: node.nodeHeight, // Propagate estimated height
            side: node.side || 0,
            branchIndex: node.branchIndex
        });
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x);
        minY = Math.min(minY, node.y);
        maxY = Math.max(maxY, node.y);

        node.processedChildren?.forEach(child => {
            edges.push({
                from: { x: node.x, y: node.y, side: node.side || 0, depth: node.depth, branchIndex: node.branchIndex },
                to: { x: child.x, y: child.y, side: child.side || 0, depth: child.depth, branchIndex: child.branchIndex }
            });
            flatten(child);
        });
    };

    flatten(layoutTree);

    // Padding & Canvas Centering Logic
    canvasWidth = (maxX - minX) + 600;
    canvasHeight = (maxY - minY) + 600;

    // Global offset to keep everything in view
    const xGlobalShift = -minX + 300;
    const yGlobalShift = -minY + 300;

    nodes.forEach(n => { n.x += xGlobalShift; n.y += yGlobalShift; });
    edges.forEach(e => {
        e.from.x += xGlobalShift; e.from.y += yGlobalShift;
        e.to.x += xGlobalShift; e.to.y += yGlobalShift;
    });

    return { nodes, edges, width: canvasWidth, height: canvasHeight };
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
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    // Center view on root when data loads
    useEffect(() => {
        if (nodes.length > 0) {
            const rootNode = nodes.find(n => n.depth === 0);
            if (rootNode) {
                translateX.value = width / 2 - rootNode.x;
                translateY.value = height / 2 - rootNode.y;
                savedTranslateX.value = translateX.value;
                savedTranslateY.value = translateY.value;
            }
        }
    }, [nodes, width, height]);

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
                    {/* Dot Pattern */}
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
                            r="1"
                            fill={colors.text}
                            fillOpacity={0.08}
                        />
                    </Pattern>
                </Defs>

                {/* Theme-aware Background */}
                <Rect width="100%" height="100%" fill={colors.background} />
                <Rect width="100%" height="100%" fill="url(#dots)" />

                {
                    edges.map((edge, i) => {
                        const { from, to } = edge;
                        const branchColor = getBranchColor(to.depth, to.branchIndex);
                        const strokeColor = branchColor.main;

                        // Variable thickness based on depth for better hierarchy
                        const strokeWidth = to.depth === 1 ? 5 : (to.depth === 2 ? 3 : 2);

                        let d;

                        if (LAYOUT_TYPE === 'radial') {
                            d = `M${from.x},${from.y} L${to.x},${to.y}`;
                        } else {
                            // Adjust anchor points for hierarchical scaling
                            const fromWidth = getNodeWidth(from.depth);
                            const toWidth = getNodeWidth(to.depth);

                            const fromX = from.depth === 0 ? from.x + (to.side * (fromWidth / 2)) : from.x + (from.side * (fromWidth / 2));
                            const toX = to.x - (to.side * (toWidth / 2));
                            const fromY = from.y;
                            const toY = to.y;

                            const cp1X = fromX + (to.side * LEVEL_GAP / 2);
                            const cp2X = toX - (to.side * LEVEL_GAP / 2);

                            d = `M${fromX},${fromY} C${cp1X},${fromY} ${cp2X},${toY} ${toX},${toY}`;
                        }

                        return (
                            <Path
                                key={i}
                                d={d}
                                stroke={strokeColor}
                                strokeOpacity={to.depth === 1 ? 0.7 : 0.4}
                                strokeWidth={strokeWidth}
                                fill="none"
                                strokeLinecap="round"
                            />
                        );
                    })
                }
            </Svg >
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
                {/* <View style={[StyleSheet.absoluteFill, { opacity: 0.05, backgroundColor: colors.text }]} pointerEvents="none" /> */}

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

                        {(nodes || []).map((node, index) => {
                            const isRoot = node.depth === 0;
                            const branchColor = getBranchColor(node.depth, node.branchIndex);

                            // Adjust colors based on theme and depth
                            const isDark = colors.background === '#121212' || colors.background === '#1A1A1A';
                            const bgColor = isRoot ? branchColor.main : (node.depth === 1 ? branchColor.main : (isDark ? branchColor.dark : branchColor.light));
                            const borderColor = isRoot ? colors.text : (isDark ? '#FFF' : '#000'); // Bold black in light, white in dark

                            const nodeWidth = getNodeWidth(node.depth);

                            return (
                                <Animated.View
                                    key={node.id}
                                    entering={ZoomIn.delay(index * 20).springify().mass(0.5)}
                                    style={[
                                        styles.node,
                                        {
                                            left: node.x - (nodeWidth / 2),
                                            top: node.y - (node.nodeHeight / 2),
                                            width: nodeWidth,
                                            minHeight: node.nodeHeight,
                                            backgroundColor: bgColor,
                                            borderColor: borderColor,
                                            borderWidth: 2.5,
                                            borderRadius: isRoot ? 16 : 12, // Squared look
                                            zIndex: 10 + node.depth,
                                            paddingVertical: 12,
                                            paddingHorizontal: 12,
                                        }
                                    ]}
                                >
                                    <View style={{ flex: 1, justifyContent: 'center', width: '100%' }}>
                                        <Text
                                            style={[
                                                styles.nodeText,
                                                {
                                                    color: (isRoot || node.depth === 1) ? '#FFF' : colors.text,
                                                    fontSize: isRoot ? 16 : 13,
                                                    fontWeight: '900',
                                                    lineHeight: isRoot ? 20 : 16,
                                                }
                                            ]}
                                        >
                                            {node.label}
                                        </Text>
                                        {node.note && (
                                            <Text
                                                style={{
                                                    color: (isRoot || node.depth === 1) ? '#FFF' : colors.text,
                                                    fontSize: 11,
                                                    fontWeight: '400', // Regular weight for definitions
                                                    textAlign: 'center',
                                                    marginTop: 6,
                                                    opacity: 0.9,
                                                }}
                                            >
                                                {node.note}
                                            </Text>
                                        )}
                                    </View>
                                </Animated.View>
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
        justifyContent: 'center',
        alignItems: 'center',
        // Pill-style Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
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
