import React from 'react';
import { ScrollView, Image } from 'react-native';
import { YStack, XStack, Text, Button, Separator } from 'tamagui';
import {
  ChevronLeft,
  Trash2,
  Sparkles,
  MessageSquare,
  ImageOff,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useSession } from '../context/SessionContext';
import { colors } from '../constants/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

export default function ResultsScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { deleteConsultation, resetInput } = useSession();
  const { consultation, origin } = route.params;
  const { recommendation } = consultation;

  const handleBack = () => {
    if (origin === 'fresh') {
      navigation.goBack();
    } else {
      navigation.goBack();
    }
  };

  const handleDelete = () => {
    deleteConsultation(consultation.id);
    if (origin === 'fresh') {
      navigation.navigate('Input');
    } else {
      navigation.navigate('History');
    }
  };

  const handleTryAnother = () => {
    navigation.navigate('Input');
  };

  const handleStartOver = () => {
    resetInput();
    navigation.popToTop();
  };

  return (
    <YStack flex={1} backgroundColor={colors.background}>
      <XStack
        paddingTop={insets.top + 8}
        paddingBottom={12}
        paddingHorizontal={16}
        alignItems="center"
        justifyContent="space-between"
        backgroundColor={colors.surface}
        borderBottomWidth={1}
        borderBottomColor={colors.border}
      >
        <Button
          size="$3"
          circular
          backgroundColor="transparent"
          pressStyle={{ backgroundColor: colors.background }}
          onPress={handleBack}
        >
          <ChevronLeft size={22} color={colors.text} />
        </Button>

        <Text fontSize={16} fontWeight="700" color={colors.text}>
          Your Recommendation
        </Text>

        <Button
          size="$3"
          circular
          backgroundColor="transparent"
          pressStyle={{ backgroundColor: colors.dangerLight }}
          onPress={handleDelete}
        >
          <Trash2 size={20} color={colors.danger} />
        </Button>
      </XStack>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <YStack gap={20}>
          <YStack
            backgroundColor={colors.surface}
            borderRadius={20}
            overflow="hidden"
            borderWidth={1}
            borderColor={colors.border}
          >
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
                AI preview coming soon
              </Text>
            </YStack>

            <YStack padding={20} gap={4}>
              <Text fontSize={12} fontWeight="600" color={colors.primaryLight} letterSpacing={1}>
                RECOMMENDED CUT
              </Text>
              <Text fontSize={26} fontWeight="800" color={colors.text} letterSpacing={-0.5}>
                {recommendation.cutName}
              </Text>
            </YStack>
          </YStack>

          <YStack
            backgroundColor={colors.surface}
            borderRadius={20}
            padding={20}
            gap={16}
            borderWidth={1}
            borderColor={colors.border}
          >
            <XStack alignItems="center" gap={8}>
              <Sparkles size={16} color={colors.primary} />
              <Text fontSize={14} fontWeight="700" color={colors.text}>
                Why this cut works for you
              </Text>
            </XStack>

            <Text fontSize={15} color={colors.textSecondary} lineHeight={24}>
              {recommendation.reasoning}
            </Text>

            {recommendation.addressesFrustrations && (
              <>
                <Separator borderColor={colors.borderLight} />
                <YStack gap={8}>
                  <Text fontSize={14} fontWeight="700" color={colors.text}>
                    How it addresses your concerns
                  </Text>
                  <Text fontSize={15} color={colors.textSecondary} lineHeight={24}>
                    {recommendation.addressesFrustrations}
                  </Text>
                </YStack>
              </>
            )}
          </YStack>

          <YStack
            backgroundColor={colors.primaryFaint}
            borderRadius={20}
            padding={20}
            gap={12}
            borderWidth={1}
            borderColor="#D1FAE5"
          >
            <XStack alignItems="center" gap={8}>
              <MessageSquare size={16} color={colors.primary} />
              <Text fontSize={14} fontWeight="700" color={colors.primary}>
                How to ask for it
              </Text>
            </XStack>

            <Text
              fontSize={15}
              color={colors.text}
              lineHeight={24}
              fontStyle="italic"
            >
              "{recommendation.salonScript}"
            </Text>
          </YStack>

          {consultation.input.currentPhotos.length > 0 && (
            <YStack gap={10}>
              <Text fontSize={12} fontWeight="600" color={colors.textTertiary} letterSpacing={0.5}>
                PHOTOS ANALYSED
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack gap={8}>
                  {consultation.input.currentPhotos.map((photo, i) => (
                    <YStack
                      key={`current-${i}`}
                      width={64}
                      height={64}
                      borderRadius={12}
                      overflow="hidden"
                      borderWidth={1}
                      borderColor={colors.border}
                    >
                      <Image
                        source={{ uri: photo.uri }}
                        style={{ width: 64, height: 64 }}
                      />
                    </YStack>
                  ))}
                  {consultation.input.referencePhotos.map((photo, i) => (
                    <YStack
                      key={`ref-${i}`}
                      width={64}
                      height={64}
                      borderRadius={12}
                      overflow="hidden"
                      borderWidth={1}
                      borderColor={colors.accent}
                    >
                      <Image
                        source={{ uri: photo.uri }}
                        style={{ width: 64, height: 64 }}
                      />
                    </YStack>
                  ))}
                </XStack>
              </ScrollView>
            </YStack>
          )}
        </YStack>
      </ScrollView>

      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        paddingHorizontal={20}
        paddingTop={16}
        paddingBottom={insets.bottom + 16}
        backgroundColor={colors.background}
        borderTopWidth={1}
        borderTopColor={colors.border}
      >
        <XStack gap={12}>
          {origin === 'fresh' && (
            <Button
              flex={1}
              size="$5"
              backgroundColor={colors.surface}
              borderWidth={1}
              borderColor={colors.border}
              pressStyle={{ backgroundColor: colors.background, scale: 0.98 }}
              borderRadius={14}
              onPress={handleTryAnother}
            >
              <XStack alignItems="center" gap={6}>
                <ArrowLeft size={16} color={colors.text} />
                <Text color={colors.text} fontSize={15} fontWeight="600">
                  Try Another
                </Text>
              </XStack>
            </Button>
          )}
          <Button
            flex={1}
            size="$5"
            backgroundColor={colors.primary}
            pressStyle={{ backgroundColor: colors.primaryDark, scale: 0.98 }}
            borderRadius={14}
            onPress={handleStartOver}
          >
            <XStack alignItems="center" gap={6}>
              <RotateCcw size={16} color="#FFFFFF" />
              <Text color="#FFFFFF" fontSize={15} fontWeight="700">
                Start Over
              </Text>
            </XStack>
          </Button>
        </XStack>
      </YStack>
    </YStack>
  );
}
