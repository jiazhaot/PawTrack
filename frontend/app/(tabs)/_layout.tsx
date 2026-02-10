import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { IconSymbol } from '@/components/icons/IconSymbol';
import { Colors } from '@/constants/theme/Colors';
import { OnboardingWrapper } from '@/components/navigation/OnboardingWrapper';

export default function TabLayout() {
  return (
    <OnboardingWrapper>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textLight,
          tabBarLabelStyle: {
            fontWeight: '600',
            fontSize: 12,
          },
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
            borderTopWidth: 1,
            ...Platform.select({
              ios: {
                position: 'absolute',
              },
              default: {},
            }),
          },
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="record"
          options={{
            title: 'Record',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="record.circle.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: 'Social',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="pawprint.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="map.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.circle.fill" color={color} />,
          }}
        />
      </Tabs>
    </OnboardingWrapper>
  );
}
