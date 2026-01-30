const NODE_WIDTH = 120;
const NODE_HEIGHT = 60;
const LEVEL_GAP = 100;
const NODE_GAP = 20;
const MAX_DEPTH = 50;

const calculateLayout = (node, depth = 0, yOffset = { value: 0 }) => {
    if (!node) return { x: 0, y: 0, totalHeight: 0, id: 'error', label: 'Error', children: [] };
    if (depth > MAX_DEPTH) {
        console.warn("Max recursion depth exceeded for node:", node.label);
        return { x: 0, y: 0, totalHeight: NODE_HEIGHT, id: node.id || 'max_depth', label: 'Max Depth', children: [] };
    }

    const children = Array.isArray(node.children) ? node.children : [];
    const isLeaf = children.length === 0;

    let childrenHeight = 0;
    let childrenNodes = [];

    if (!isLeaf) {
        children.forEach(child => {
            if (child) {
                const childResult = calculateLayout(child, depth + 1, yOffset);
                childrenNodes.push(childResult);
                childrenHeight += childResult.totalHeight;
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

    const safeX = Number.isFinite(myX) ? myX : 0;
    const safeY = Number.isFinite(myY) ? myY : 0;
    const safeHeight = Number.isFinite(myHeight) ? myHeight : NODE_HEIGHT;

    return {
        ...node,
        children: children,
        x: safeX,
        y: safeY,
        totalHeight: safeHeight,
        processedChildren: childrenNodes
    };
};

const data = { "id": "root", "label": "Keyboard", "children": [{ "id": "types", "label": "Types", "children": [{ "id": "mechanical", "label": "Mechanical", "children": [] }, { "id": "membrane", "label": "Membrane", "children": [] }, { "id": "wireless", "label": "Wireless", "children": [] }, { "id": "ergonomic", "label": "Ergonomic", "children": [] }] }, { "id": "layout", "label": "Layout", "children": [{ "id": "qwerty", "label": "QWERTY", "children": [] }, { "id": "azerty", "label": "AZERTY", "children": [] }, { "id": "dvorak", "label": "Dvorak", "children": [] }, { "id": "numeric_pad", "label": "Numeric pad", "children": [] }] }, { "id": "keys", "label": "Keys", "children": [{ "id": "alphanumeric", "label": "Alphanumeric", "children": [] }, { "id": "function_keys", "label": "Function keys", "children": [] }, { "id": "modifier_keys", "label": "Modifier keys", "children": [] }, { "id": "navigation_keys", "label": "Navigation keys", "children": [] }] }, { "id": "connection", "label": "Connection", "children": [{ "id": "usb", "label": "USB", "children": [] }, { "id": "bluetooth", "label": "Bluetooth", "children": [] }, { "id": "ps2", "label": "PS/2", "children": [] }] }, { "id": "features", "label": "Features", "children": [{ "id": "backlight", "label": "Backlight", "children": [] }, { "id": "programmable_keys", "label": "Programmable keys", "children": [] }, { "id": "media_controls", "label": "Media controls", "children": [] }] }] };

try {
    const result = calculateLayout(data);
    console.log("Success! Root Y:", result.y, "Total Height:", result.totalHeight);
    console.log("Children processed:", result.processedChildren.length);
} catch (e) {
    console.error("Layout failed:", e);
}
