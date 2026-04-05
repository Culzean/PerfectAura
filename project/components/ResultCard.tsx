import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image } from 'react-native';
import { YStack, Text, Button, XStack, Spinner } from 'tamagui';
import { ImageOff, RefreshCw } from 'lucide-react-native';
import { colors } from '../constants/colors';
import type { ImageGenStatus } from '../types';

interface ResultCardProps {
  afterImageUrl?: string;
  status: ImageGenStatus;
  onRetry?: () => void;
}

function PulsingBackground({ children }: { children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity, width: '100%', height: 220, justifyContent: 'center', alignItems: 'center' }}>
      {children}
    </Animated.View>
  );
}

export default function ResultCard({ afterImageUrl, status, onRetry }: ResultCardProps) {
  const [imageError, setImageError] = useState(false);
  const effectiveStatus = imageError ? 'failed' : status;

  if (effectiveStatus === 'generating') {
    return (
      <YStack height={220} backgroundColor="#E8F5F3" alignItems="center" justifyContent="center">
        <PulsingBackground>
          <YStack alignItems="center" gap={12}>
            <Spinner size="large" color={colors.primaryLight} />
            <Text fontSize={13} color={colors.textTertiary} fontWeight="500">
              Generating your new look...
            </Text>
          </YStack>
        </PulsingBackground>
      </YStack>
    );
  }

  if (effectiveStatus === 'succeeded' && afterImageUrl) {
    return (
      <YStack height={220} position="relative">
        <Image
          source={{ uri: afterImageUrl }}
          style={{ width: '100%', height: 220 }}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
        <YStack position="absolute" bottom={8} right={8}>
          <Text
            fontSize={10}
            color="rgba(255,255,255,0.8)"
            backgroundColor="rgba(0,0,0,0.4)"
            paddingHorizontal={8}
            paddingVertical={3}
            borderRadius={6}
            fontWeight="500"
          >
            AI-generated preview
          </Text>
        </YStack>
      </YStack>
    );
  }

  // idle or failed
  return (
    <YStack
      height={220}
      backgroundColor="#E8F5F3"
      alignItems="center"
      justifyContent="center"
      gap={12}
    >
      <YStack
        width={64}
        height={64}
        borderRadius={32}
        backgroundColor="rgba(15, 118, 110, 0.1)"
        alignItems="center"
        justifyContent="center"
      >
        <ImageOff size={28} color={colors.primaryLight} />
      </YStack>
      <Text fontSize={13} color={colors.textTertiary} fontWeight="500">
        {effectiveStatus === 'failed' ? 'Preview unavailable' : 'AI preview'}
      </Text>
      {effectiveStatus === 'failed' && onRetry && (
        <Button
          size="$2"
          backgroundColor={colors.primary}
          pressStyle={{ backgroundColor: colors.primaryDark }}
          borderRadius={10}
          onPress={onRetry}
        >
          <XStack alignItems="center" gap={4}>
            <RefreshCw size={12} color="#FFFFFF" />
            <Text color="#FFFFFF" fontSize={12} fontWeight="600">
              Retry
            </Text>
          </XStack>
        </Button>
      )}
    </YStack>
  );
}
