/**
 * @module    RootNavigator
 * @desc     Top-level navigation orchestrator. Combines Stack navigator (auth gate)
 *           with Bottom Tab navigator (main app). The single source of truth for
 *           which screen is active based on auth state.
 *
 * @requires @react-navigation/native — NavigationContainer
 * @requires @react-navigation/stack — auth stack
 * @requires @react-navigation/bottom-tabs — main app tabs
 *
 * @author   CUANIFY Team
 * @since    2.0.0
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { TransactionScreen } from '../screens/TransactionScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CustomTabBar } from './CustomTabBar';
import { useAuthStore } from '../store/useAuthStore';

// ─── Type Definitions ────────────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Analytics: undefined;
  AddTransaction: undefined;
  Profile: undefined;
};

// ─── Navigator Instances ─────────────────────────────────────────────────────

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

// ─── Bottom Tab Navigator ────────────────────────────────────────────────────

function AppTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="AddTransaction" component={TransactionScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ──────────────────────────────────────────────────────────

export function RootNavigator() {
  const { token, user } = useAuthStore();
  const isLoggedIn = Boolean(token && user);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="App" component={AppTabs} />
        ) : (
          <Stack.Screen name="Auth" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
