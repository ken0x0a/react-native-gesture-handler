import * as React from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import {
  NativeViewGestureHandler,
  PanGestureHandler,
  PanGestureHandlerProperties,
  State,
  TapGestureHandler
} from 'react-native-gesture-handler';

import { LoremIpsum } from './common';
import { USE_NATIVE_DRIVER } from './config';

const { height: windowHeight, width: windowWidth } = Dimensions.get('window');
const HEADER_HEIGHT = 64; // header 45 + statusBar 20 - headerBorderWidth 1
const BORDER_RADIUS = 7.5;
const BOTTOM_SHEET_HEADER_HEIGHT = 80;
const SNAP_POINTS_FROM_TOP = [
  HEADER_HEIGHT,
  windowHeight * 0.55,
  windowHeight - BOTTOM_SHEET_HEADER_HEIGHT - HEADER_HEIGHT // - Constants.statusBarHeight
];

interface BottomSheetProps {
  headerBorderTopRadius: number;
  /**
   * snap points from bottom
   */
  snapPoints: number[];
}
interface BottomSheetState {
  lastSnap: number;
}
export class BottomSheet extends React.Component<BottomSheetProps, BottomSheetState> {
  public static defaultProps = {
    headerBorderTopRadius: BORDER_RADIUS
  };
  private _dragY: Animated.Value;
  private _lastScrollY: Animated.Value;
  private _lastScrollYValue: number;
  private _onGestureEvent: ReturnType<typeof Animated.event>;
  private _onRegisterLastScroll: ReturnType<typeof Animated.event>;
  private _reverseLastScrollY: Animated.AnimatedMultiplication;
  private _translateY: Animated.AnimatedAddition;
  private _translateYOffset: Animated.Value;
  private drawer = React.createRef<PanGestureHandler>();
  private drawerHeader = React.createRef<PanGestureHandler>();
  private masterDrawer = React.createRef<TapGestureHandler>();
  private scroll = React.createRef<NativeViewGestureHandler>();

  constructor(props: BottomSheetProps) {
    super(props);
    const START = SNAP_POINTS_FROM_TOP[0];
    const END = SNAP_POINTS_FROM_TOP[SNAP_POINTS_FROM_TOP.length - 1];

    this.state = {
      lastSnap: END
    };

    this._lastScrollYValue = 0;
    this._lastScrollY = new Animated.Value(0);
    this._onRegisterLastScroll = Animated.event([{ nativeEvent: { contentOffset: { y: this._lastScrollY } } }], {
      useNativeDriver: USE_NATIVE_DRIVER
    });
    this._lastScrollY.addListener(({ value }) => {
      this._lastScrollYValue = value;
    });

    this._dragY = new Animated.Value(0);
    this._onGestureEvent = Animated.event([{ nativeEvent: { translationY: this._dragY } }], {
      useNativeDriver: USE_NATIVE_DRIVER
    });

    this._reverseLastScrollY = Animated.multiply(new Animated.Value(-1), this._lastScrollY);

    this._translateYOffset = new Animated.Value(END);
    this._translateY = Animated.add(
      this._translateYOffset,
      Animated.add(this._dragY, this._reverseLastScrollY)
    ).interpolate({
      inputRange: [START, END],
      outputRange: [START, END],
      extrapolate: 'clamp'
    });
  }
  public render() {
    const { headerBorderTopRadius } = this.props;
    return (
      <TapGestureHandler
        maxDurationMs={100000}
        ref={this.masterDrawer}
        maxDeltaY={this.state.lastSnap - SNAP_POINTS_FROM_TOP[0]}
      >
        <View
          style={[StyleSheet.absoluteFillObject, { shadowRadius: 1, shadowColor: 'black', shadowOpacity: 0.075 }]}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                transform: [{ translateY: this._translateY }]
              }
            ]}
          >
            <PanGestureHandler
              ref={this.drawerHeader}
              simultaneousHandlers={[this.scroll, this.masterDrawer]}
              shouldCancelWhenOutside={false}
              onGestureEvent={this._onGestureEvent}
              onHandlerStateChange={this._onHeaderHandlerStateChange}
            >
              <Animated.View
                style={[
                  styles.header,
                  { borderTopRightRadius: headerBorderTopRadius, borderTopLeftRadius: headerBorderTopRadius }
                ]}
              >
                {/* <View
                  style={[StyleSheet.absoluteFill, {
                    // height: BOTTOM_SHEET_HEADER_HEIGHT,
                    // width: windowWidth,
                    // flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }]}
                > */}
                <View
                  style={{
                    top: 5,
                    alignSelf: 'center',
                    height: 5,
                    width: 40,
                    backgroundColor: '#BFBFBF',
                    borderRadius: 2.5
                  }}
                />
                {/* </View> */}
              </Animated.View>
            </PanGestureHandler>
            <PanGestureHandler
              ref={this.drawer}
              simultaneousHandlers={[this.scroll, this.masterDrawer]}
              shouldCancelWhenOutside={false}
              onGestureEvent={this._onGestureEvent}
              onHandlerStateChange={this._onHandlerStateChange}
            >
              <Animated.View style={styles.container}>
                <NativeViewGestureHandler
                  ref={this.scroll}
                  waitFor={this.masterDrawer}
                  simultaneousHandlers={this.drawer}
                >
                  <Animated.ScrollView
                    style={[styles.scrollView, { marginBottom: SNAP_POINTS_FROM_TOP[0] }]}
                    bounces={false}
                    onScrollBeginDrag={this._onRegisterLastScroll}
                    scrollEventThrottle={1}
                  >
                    <LoremIpsum />
                    <LoremIpsum />
                    <LoremIpsum />
                  </Animated.ScrollView>
                </NativeViewGestureHandler>
              </Animated.View>
            </PanGestureHandler>
          </Animated.View>
        </View>
      </TapGestureHandler>
    );
  }
  private _onHandlerStateChange: Required<PanGestureHandlerProperties>['onHandlerStateChange'] = ({ nativeEvent }) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      let { velocityY, translationY } = nativeEvent;
      translationY -= this._lastScrollYValue;
      const dragToss = 0.05;
      const endOffsetY = this.state.lastSnap + translationY + dragToss * velocityY;

      let destSnapPoint = SNAP_POINTS_FROM_TOP[0];
      for (const snapPoint of SNAP_POINTS_FROM_TOP) {
        const distFromSnap = Math.abs(snapPoint - endOffsetY);
        if (distFromSnap < Math.abs(destSnapPoint - endOffsetY)) destSnapPoint = snapPoint;
      }
      this.setState({ lastSnap: destSnapPoint });
      this._translateYOffset.extractOffset();
      this._translateYOffset.setValue(translationY);
      this._translateYOffset.flattenOffset();
      this._dragY.setValue(0);
      Animated.spring(this._translateYOffset, {
        velocity: velocityY,
        tension: 68,
        friction: 12,
        toValue: destSnapPoint,
        useNativeDriver: USE_NATIVE_DRIVER
      }).start();
    }
  };
  private _onHeaderHandlerStateChange: Required<PanGestureHandlerProperties>['onHandlerStateChange'] = ({
    nativeEvent
  }) => {
    if (nativeEvent.oldState === State.BEGAN) this._lastScrollY.setValue(0);

    this._onHandlerStateChange({ nativeEvent });
  };
}

export default class Example extends React.Component {
  public render() {
    return (
      <View style={styles.container}>
        <BottomSheet />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    height: BOTTOM_SHEET_HEADER_HEIGHT,
    width: windowWidth,
    backgroundColor: 'white'
  },
  scrollView: {}
});
