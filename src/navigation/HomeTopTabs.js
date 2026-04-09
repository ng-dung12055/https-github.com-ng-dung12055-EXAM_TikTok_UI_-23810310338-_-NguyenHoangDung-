import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FollowingScreen from '../screens/FollowingScreen';
import ForYouScreen from '../screens/ForYouScreen';

const Tab = createMaterialTopTabNavigator();

function TabLabel({ label, focused }) {
  return (
    <View style={styles.labelWrap}>
      <Text
        style={[
          styles.labelText,
          {
            color: focused ? '#fff' : 'rgba(255,255,255,0.65)',
            fontWeight: focused ? '700' : '600',
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function HomeTopTabs() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <Tab.Navigator
        initialRouteName="ForYou"
        tabBarPosition="top"
        screenOptions={{
          swipeEnabled: true,
          tabBarStyle: {
            backgroundColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
            position: 'absolute',
            top: insets.top + 8,
            alignSelf: 'center',
            width: 200,
            zIndex: 10,
          },
          tabBarIndicatorStyle: { height: 0 },
          tabBarItemStyle: { width: 100 },
          tabBarContentContainerStyle: { justifyContent: 'center' },
          tabBarPressColor: 'transparent',
        }}
        style={{ backgroundColor: '#000' }}
        sceneContainerStyle={{ backgroundColor: '#000' }}
      >
        <Tab.Screen
          name="Following"
          component={FollowingScreen}
          options={{
            tabBarLabel: ({ focused }) => (
              <TabLabel label="Following" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="ForYou"
          component={ForYouScreen}
          options={{
            tabBarLabel: ({ focused }) => (
              <TabLabel label="For You" focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  labelWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 17,
  },
});
