import * as React from 'react';
import { FlatList, StyleSheet, Text, View, YellowBox } from 'react-native';
import { RectButton, ScrollView } from 'react-native-gesture-handler';
import { createAppContainer, createStackNavigator } from 'react-navigation';
import BottomSheet from './src/bottom-sheet';
import Bouncing from './src/bouncing';
import ChatHeads from './src/chatHeads';
import { ComboWithGHScroll, ComboWithRNScroll } from './src/combo';
import doubleDraggable from './src/doubleDraggable';
import doubleScalePinchAndRotate from './src/doubleScalePinchAndRotate';
import Draggable from './src/draggable';
import Fling from './src/fling';
import forceTouch from './src/forcetouch';
import HorizontalDrawer from './src/horizontalDrawer';
import Multitap from './src/multitap';
import PagerAndDrawer from './src/pagerAndDrawer';
import PanAndScroll from './src/panAndScroll';
import PanResponder from './src/panResponder';
import Rows from './src/rows';
import ScaleAndRotate from './src/scaleAndRotate';
import SwipeableTable from './src/swipeable';
import { TouchableExample, TouchablesIndex } from './src/touchables';

YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);
// refers to bug in React Navigation which should be fixed soon
// https://github.com/react-navigation/react-navigation/issues/3956

const SCREENS = {
  BottomSheet: {
    title: 'BottomSheet gestures interactions',
    screen: BottomSheet
  },
  Rows: { screen: Rows, title: 'Table rows & buttons' },
  Multitap: { screen: Multitap },
  Draggable: { screen: Draggable },
  ScaleAndRotate: { screen: ScaleAndRotate, title: 'Scale, rotate & tilt' },
  ScaleAndRotateSimultaneously: {
    screen: doubleScalePinchAndRotate,
    title: 'Scale, rotate & tilt & more'
  },
  PagerAndDrawer: { screen: PagerAndDrawer, title: 'Android pager & drawer' },
  HorizontalDrawer: {
    screen: HorizontalDrawer,
    title: 'Gesture handler based DrawerLayout'
  },
  SwipeableTable: {
    screen: SwipeableTable,
    title: 'Gesture handler based SwipeableRow'
  },
  PanAndScroll: {
    screen: PanAndScroll,
    title: 'Horizontal pan or tap in ScrollView'
  },
  Fling: {
    screen: Fling,
    title: 'Flinghandler'
  },
  PanResponder: { screen: PanResponder },
  Bouncing: { screen: Bouncing, title: 'Twist & bounce back animation' },
  ChatHeads: {
    screen: ChatHeads,
    title: 'Chat Heads (no native animated support yet)'
  },
  Combo: { screen: ComboWithGHScroll },
  ComboWithRNScroll: {
    screen: ComboWithRNScroll,
    title: "Combo with RN's ScrollView"
  },
  doubleDraggable: {
    screen: doubleDraggable,
    title: 'Two handlers simultaneously'
  },
  touchables: {
    screen: TouchablesIndex,
    title: 'Touchables'
  },
  forceTouch: {
    screen: forceTouch,
    title: 'Force touch'
  }
};

class MainScreen extends React.Component {
  public static navigationOptions = {
    title: '✌️ Gesture Handler Demo'
  };
  public render() {
    const data = Object.keys(SCREENS).map(key => ({ key }));
    return (
      <FlatList
        style={styles.list}
        data={data}
        ItemSeparatorComponent={ItemSeparator}
        renderItem={props => (
          <MainScreenItem {...props} onPressItem={({ key }) => this.props.navigation.navigate(key)} />
        )}
        renderScrollComponent={props => <ScrollView {...props} />}
      />
    );
  }
}

const ItemSeparator = () => <View style={styles.separator} />;

class MainScreenItem extends React.Component {
  public _onPress = () => this.props.onPressItem(this.props.item);
  public render() {
    const { key } = this.props.item;
    return (
      <RectButton style={styles.button} onPress={this._onPress}>
        <Text style={styles.buttonText}>{SCREENS[key].title || key}</Text>
      </RectButton>
    );
  }
}

const ExampleApp = createStackNavigator(
  {
    Main: { screen: MainScreen },
    ...SCREENS,
    TouchableExample: {
      screen: TouchableExample,
      title: 'Touchables'
    }
  },
  {
    initialRouteName: 'Main'
  }
);

const styles = StyleSheet.create({
  list: {
    backgroundColor: '#EFEFF4'
  },
  separator: {
    height: 1,
    backgroundColor: '#DBDBE0'
  },
  buttonText: {
    backgroundColor: 'transparent'
  },
  button: {
    flex: 1,
    height: 60,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff'
  }
});

export default createAppContainer(ExampleApp);
