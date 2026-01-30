import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Shadows, Spacing } from '../constants/theme';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught Error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleCopyError = () => {
        const errorString = `Error: ${this.state.error?.toString()}\n\nStack: ${this.state.errorInfo?.componentStack}`;
        // Clipboard.setString(errorString); // Requires expo-clipboard, simplifying for now to just alert or standard copy if available
        // Assuming standard Clipboard or just showing it is enough. 
        // Let's rely on visual inspection for now or use the passed in colors.
    };

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    render() {
        if (this.state.hasError) {
            const { colors } = this.props;
            const textColor = colors?.text || '#000';
            const bgColor = colors?.background || '#FFF';
            const cardColor = colors?.card || '#F9F9F9';
            const primaryColor = colors?.primary || 'blue';

            return (
                <View style={[styles.container, { backgroundColor: bgColor }]}>
                    <ScrollView contentContainerStyle={styles.content}>
                        <Text style={[styles.title, { color: primaryColor }]}>Something went wrong</Text>

                        <View style={[styles.card, { backgroundColor: cardColor, borderColor: colors?.border || '#DDD' }]}>
                            <Text style={[styles.errorText, { color: 'red' }]}>
                                {this.state.error && this.state.error.toString()}
                            </Text>
                        </View>

                        {this.state.errorInfo && (
                            <View style={[styles.card, { backgroundColor: cardColor, borderColor: colors?.border || '#DDD', marginTop: 10 }]}>
                                <Text style={[styles.stackText, { color: textColor }]}>
                                    {this.state.errorInfo.componentStack}
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity
                            onPress={this.handleReset}
                            style={[styles.button, { backgroundColor: primaryColor }]}
                        >
                            <Text style={styles.buttonText}>Try Again</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Spacing.m,
        justifyContent: 'center',
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: Spacing.l,
        textAlign: 'center',
    },
    card: {
        padding: Spacing.m,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: Spacing.m,
        ...Shadows.pop,
    },
    errorText: {
        fontSize: 16,
        fontWeight: '600',
    },
    stackText: {
        fontSize: 12,
        fontFamily: 'monospace',
        opacity: 0.8,
    },
    button: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: Spacing.m,
        ...Shadows.pop,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default ErrorBoundary;
