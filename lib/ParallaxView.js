'use strict';

var React = require('react');
var ReactNative = require('react-native');
var {
    Dimensions,
    StyleSheet,
    View,
    ScrollView,
    Animated,
    } = ReactNative;
import { CachedImage } from 'react-native-cached-image';
/**
 * BlurView temporarily removed until semver stuff is set up properly
 */
//var BlurView /* = require('react-native-blur').BlurView */;
var ScrollableMixin = require('react-native-scrollable-mixin');
var screen = Dimensions.get('window');
var ScrollViewPropTypes = ScrollView.propTypes;

export default class ParallaxView extends React.Component {
    constructor(props) {
        super(props);
        this.windowHeight = props.windowHeight || 300;
        this.contentInset = props.contentInset || { top: screen.scale };
        this.state = {
            scrollY: new Animated.Value(0)
        }
    }

    /**
     * IMPORTANT: You must return the scroll responder of the underlying
     * scrollable component from getScrollResponder() when using ScrollableMixin.
     */
    getScrollResponder() {
      return this._scrollView.getScrollResponder();
    }

    setNativeProps(props) {
      this._scrollView.setNativeProps(props);
    }

    renderBackground() {
        var { backgroundSource, blur } = this.props;
        var { scrollY } = this.state;
        if (!this.windowHeight || !backgroundSource) {
            return null;
        }
        return (
            <Animated.View
                style={[styles.background, {
                    height: this.windowHeight,
                    transform: [{
                        translateY: scrollY.interpolate({
                            inputRange: [ -this.windowHeight, 0, this.windowHeight],
                            outputRange: [this.windowHeight/2, 0, -this.windowHeight/3]
                        })
                    },{
                        scale: scrollY.interpolate({
                            inputRange: [ -this.windowHeight, 0, this.windowHeight],
                            outputRange: [2, 1, 1]
                        })
                    }]
                }]}>
                <CachedImage
                    source={backgroundSource}
                    style = {{flex: 1, alignSelf: 'stretch'}}
                />
                {/*
                    !!blur && (BlurView || (BlurView = require('react-native-blur').BlurView)) &&
                    <BlurView blurType={blur} style={styles.blur} />
                */}
            </Animated.View>
        );
    }

    renderHeader() {
        var { backgroundSource } = this.props;
        var { scrollY } = this.state;
        if (!this.windowHeight || !backgroundSource) {
            return null;
        }
        return (
            <Animated.View style={{
                position: 'relative',
                height: this.windowHeight,
                opacity: scrollY.interpolate({
                    inputRange: [-this.windowHeight, 0, this.windowHeight / 1.2],
                    outputRange: [1, 1, 0]
                }),
            }}>
                {this.props.header}
            </Animated.View>
        );
    }

    render() {
        var { style, ...props } = this.props;
        return (
            <View style={[styles.container, style]}>
                {this.renderBackground()}
                <ScrollView
                    ref={component => { this._scrollView = component; }}
                    {...props}
                    style={styles.scrollView}
                    onScroll={Animated.event(
                      [{ nativeEvent: { contentOffset: { y: this.state.scrollY }}}]
                    )}
                    scrollEventThrottle={16}>
                    {this.renderHeader()}
                    <View style={[styles.content, props.scrollableViewStyle]}>
                        {this.props.children}
                    </View>
                </ScrollView>
            </View>
        );
    }
};

ParallaxView.mixins = [ScrollableMixin];

var styles = StyleSheet.create({
    container: {
        flex: 1,
        borderColor: 'transparent',
    },
    scrollView: {
        backgroundColor: 'transparent',
    },
    background: {
        position: 'absolute',
        backgroundColor: '#2e2f31',
        width: screen.width,
    },
    blur: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'transparent',
    },
    content: {
        shadowColor: '#222',
        shadowOpacity: 0.3,
        shadowRadius: 2,
        backgroundColor: '#fff',
        flex: 1,
        flexDirection: 'column'
    }
});
