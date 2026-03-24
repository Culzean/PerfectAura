import React, { useEffect, useState } from 'react';
import { YStack, Text } from 'tamagui';
import { Scissors } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useSession } from '../context/SessionContext';
import { getHairRecommendation } from '../services/hairAdvisor';
import { colors } from '../constants/colors';
import type { Consultation } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Loading'>;

const LOADING_MESSAGES = [
  'Analysing your hair...',
  'Studying your hair texture...',
  'Considering face shape...',
  'Reviewing reference styles...',
  'Crafting your recommendation...',
];

export default function LoadingScreen({ navigation }: Props) {
  const {
    userName,
    currentPhotos,
    referencePhotos,
    notes,
    addConsultation,
  } = useSession();

  const [error, setError] = useState<string | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);

  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const dotOpacity1 = useSharedValue(0.3);
  const dotOpacity2 = useSharedValue(0.3);
  const dotOpacity3 = useSharedValue(0.3);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    dotOpacity1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0.3, { duration: 400 })
      ),
      -1
    );
    setTimeout(() => {
      dotOpacity2.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1
      );
    }, 200);
    setTimeout(() => {
      dotOpacity3.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1
      );
    }, 400);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const recommendation = await getHairRecommendation(
          { currentPhotos, referencePhotos, notes },
          userName
        );

        if (cancelled) return;

        const consultation: Consultation = {
          id: Date.now().toString(),
          userName,
          createdAt: new Date(),
          input: {
            currentPhotos: [...currentPhotos],
            referencePhotos: [...referencePhotos],
            notes,
          },
          recommendation,
        };

        addConsultation(consultation);
        navigation.replace('Results', { consultation, origin: 'fresh' });
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));

  const dot1Style = useAnimatedStyle(() => ({ opacity: dotOpacity1.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dotOpacity2.value }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dotOpacity3.value }));

  if (error) {
    return (
      <YStack
        flex={1}
        backgroundColor={colors.background}
        justifyContent="center"
        alignItems="center"
        padding={32}
        gap={20}
      >
        <YStack
          width={72}
          height={72}
          borderRadius={36}
          backgroundColor={colors.dangerLight}
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize={32}>!</Text>
        </YStack>
        <Text fontSize={18} fontWeight="700" color={colors.text} textAlign="center">
          Something went wrong
        </Text>
        <Text
          fontSize={14}
          color={colors.textSecondary}
          textAlign="center"
          lineHeight={20}
        >
          {error}
        </Text>
        <YStack gap={10} width="100%" maxWidth={280}>
          <Animated.View>
            <YStack
              backgroundColor={colors.primary}
              paddingVertical={14}
              borderRadius={14}
              alignItems="center"
              pressStyle={{ opacity: 0.9 }}
              onPress={() => {
                setError(null);
                navigation.replace('Loading');
              }}
            >
              <Text color="#FFFFFF" fontSize={16} fontWeight="700">
                Try Again
              </Text>
            </YStack>
          </Animated.View>
          <Animated.View>
            <YStack
              backgroundColor={colors.surface}
              borderWidth={1}
              borderColor={colors.border}
              paddingVertical={14}
              borderRadius={14}
              alignItems="center"
              onPress={() => navigation.goBack()}
            >
              <Text color={colors.text} fontSize={16} fontWeight="600">
                Go Back
              </Text>
            </YStack>
          </Animated.View>
        </YStack>
      </YStack>
    );
  }

  return (
    <YStack
      flex={1}
      backgroundColor={colors.background}
      justifyContent="center"
      alignItems="center"
      padding={32}
      gap={32}
    >
      <Animated.View style={spinStyle}>
        <YStack
          width={88}
          height={88}
          borderRadius={44}
          backgroundColor={colors.primaryFaint}
          borderWidth={2}
          borderColor={colors.primaryLight}
          alignItems="center"
          justifyContent="center"
        >
          <Scissors size={36} color={colors.primary} />
        </YStack>
      </Animated.View>

      <YStack alignItems="center" gap={12}>
        <Text fontSize={18} fontWeight="700" color={colors.text}>
          {LOADING_MESSAGES[messageIndex]}
        </Text>
        <Animated.View style={{ flexDirection: 'row', gap: 6 }}>
          <Animated.View style={dot1Style}>
            <YStack
              width={8}
              height={8}
              borderRadius={4}
              backgroundColor={colors.primary}
            />
          </Animated.View>
          <Animated.View style={dot2Style}>
            <YStack
              width={8}
              height={8}
              borderRadius={4}
              backgroundColor={colors.primary}
            />
          </Animated.View>
          <Animated.View style={dot3Style}>
            <YStack
              width={8}
              height={8}
              borderRadius={4}
              backgroundColor={colors.primary}
            />
          </Animated.View>
        </Animated.View>
      </YStack>
    </YStack>
  );
}
