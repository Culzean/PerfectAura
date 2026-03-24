import React from 'react';
import { Platform, KeyboardAvoidingView } from 'react-native';
import { YStack, XStack, Text, Input, Button, Separator } from 'tamagui';
import { Scissors, Clock, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useSession } from '../context/SessionContext';
import { colors } from '../constants/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { userName, setUserName, consultations } = useSession();
  const hasHistory = consultations.length > 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <YStack
        flex={1}
        paddingTop={insets.top + 48}
        paddingBottom={insets.bottom + 24}
        paddingHorizontal={24}
        justifyContent="space-between"
      >
        <YStack gap={8}>
          <XStack alignItems="center" gap={12}>
            <YStack
              width={56}
              height={56}
              borderRadius={16}
              backgroundColor={colors.primary}
              alignItems="center"
              justifyContent="center"
            >
              <Scissors size={28} color="#FFFFFF" />
            </YStack>
            <YStack>
              <Text fontSize={32} fontWeight="800" color={colors.text} letterSpacing={-1}>
                HairAdvisor
              </Text>
              <Text fontSize={14} color={colors.textSecondary} marginTop={-2}>
                AI-powered haircut recommendations
              </Text>
            </YStack>
          </XStack>
        </YStack>

        <YStack gap={24} flex={1} justifyContent="center">
          <YStack
            backgroundColor={colors.surface}
            borderRadius={20}
            padding={24}
            gap={20}
            borderWidth={1}
            borderColor={colors.border}
          >
            <YStack gap={8}>
              <Text fontSize={13} fontWeight="600" color={colors.textSecondary} letterSpacing={0.5}>
                YOUR NAME
              </Text>
              <Input
                value={userName}
                onChangeText={setUserName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textTertiary}
                fontSize={16}
                height={52}
                borderRadius={14}
                borderWidth={1.5}
                borderColor={colors.border}
                backgroundColor={colors.background}
                paddingHorizontal={16}
                focusStyle={{ borderColor: colors.primary }}
                color={colors.text}
              />
            </YStack>

            <Separator borderColor={colors.borderLight} />

            <Button
              size="$5"
              backgroundColor={colors.primary}
              pressStyle={{ backgroundColor: colors.primaryDark, scale: 0.98 }}
              borderRadius={14}
              onPress={() => navigation.navigate('Input')}
            >
              <XStack alignItems="center" gap={8}>
                <Text color="#FFFFFF" fontSize={16} fontWeight="700">
                  Get Started
                </Text>
                <ChevronRight size={18} color="#FFFFFF" />
              </XStack>
            </Button>
          </YStack>

          <Button
            size="$5"
            backgroundColor={hasHistory ? colors.surface : colors.borderLight}
            borderWidth={1}
            borderColor={hasHistory ? colors.border : colors.borderLight}
            pressStyle={hasHistory ? { backgroundColor: colors.background, scale: 0.98 } : {}}
            borderRadius={14}
            disabled={!hasHistory}
            opacity={hasHistory ? 1 : 0.5}
            onPress={() => navigation.navigate('History')}
          >
            <XStack alignItems="center" gap={10}>
              <Clock size={18} color={hasHistory ? colors.textSecondary : colors.disabled} />
              <Text
                color={hasHistory ? colors.text : colors.disabled}
                fontSize={16}
                fontWeight="600"
              >
                View History
              </Text>
              {hasHistory && (
                <YStack
                  backgroundColor={colors.primaryFaint}
                  paddingHorizontal={10}
                  paddingVertical={2}
                  borderRadius={10}
                >
                  <Text fontSize={12} fontWeight="700" color={colors.primary}>
                    {consultations.length}
                  </Text>
                </YStack>
              )}
            </XStack>
          </Button>
        </YStack>

        <YStack alignItems="center" paddingTop={16}>
          <Text fontSize={12} color={colors.textTertiary}>
            Your data stays on this device for this session only
          </Text>
        </YStack>
      </YStack>
    </KeyboardAvoidingView>
  );
}
