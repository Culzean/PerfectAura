import React from 'react';
import { ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { YStack, XStack, Text, Button, TextArea } from 'tamagui';
import { ChevronLeft, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useSession } from '../context/SessionContext';
import { colors } from '../constants/colors';
import PhotoPicker from '../components/PhotoPicker';
import ReferenceSection from '../components/ReferenceSection';

type Props = NativeStackScreenProps<RootStackParamList, 'Input'>;

export default function InputScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const {
    currentPhotos,
    setCurrentPhotos,
    referencePhotos,
    setReferencePhotos,
    notes,
    setNotes,
  } = useSession();

  const canSubmit = currentPhotos.length >= 1;

  const handleSubmit = () => {
    navigation.navigate('Loading');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <YStack flex={1} paddingTop={insets.top}>
        <XStack
          paddingHorizontal={16}
          paddingVertical={12}
          alignItems="center"
          gap={12}
        >
          <Button
            size="$3"
            circular
            backgroundColor={colors.surface}
            borderWidth={1}
            borderColor={colors.border}
            pressStyle={{ backgroundColor: colors.background }}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={20} color={colors.text} />
          </Button>
          <Text fontSize={18} fontWeight="700" color={colors.text} flex={1}>
            New Consultation
          </Text>
        </XStack>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <YStack gap={28}>
            {/* Section 1 — Current Hair Photos */}
            <YStack gap={12}>
              <Text fontSize={13} color={colors.textTertiary}>
                Add 1-3 photos showing your hair from different angles
              </Text>
              <PhotoPicker
                photos={currentPhotos}
                maxPhotos={3}
                label="YOUR HAIR"
                onPhotosChange={setCurrentPhotos}
              />
            </YStack>

            <YStack height={1} backgroundColor={colors.border} marginHorizontal={-20} />

            {/* Section 2 — Reference Photos */}
            <YStack gap={12}>
              <XStack alignItems="center" gap={8}>
                <Sparkles size={16} color={colors.accent} />
                <Text fontSize={13} fontWeight="700" color={colors.textSecondary} letterSpacing={0.5}>
                  INSPIRATION
                </Text>
                <Text fontSize={11} color={colors.textTertiary} fontWeight="500">
                  Optional
                </Text>
              </XStack>
              <Text fontSize={13} color={colors.textTertiary}>
                Add up to 5 photos of styles you like
              </Text>
              <ReferenceSection
                photos={referencePhotos}
                maxPhotos={5}
                onPhotosChange={setReferencePhotos}
                onBrowseStyles={() => {}}
                stylePickerEnabled={false}
              />
            </YStack>

            <YStack height={1} backgroundColor={colors.border} marginHorizontal={-20} />

            {/* Section 3 — Notes */}
            <YStack gap={12}>
              <Text fontSize={13} fontWeight="700" color={colors.textSecondary} letterSpacing={0.5}>
                NOTES
              </Text>
              <TextArea
                value={notes}
                onChangeText={setNotes}
                placeholder="Describe your hair type, what you like, what frustrates you about your current cut, and any styles you're drawn to."
                placeholderTextColor={colors.textTertiary}
                fontSize={15}
                lineHeight={22}
                minHeight={120}
                borderRadius={14}
                borderWidth={1.5}
                borderColor={colors.border}
                backgroundColor={colors.surface}
                padding={16}
                focusStyle={{ borderColor: colors.primary }}
                color={colors.text}
              />
            </YStack>
          </YStack>
        </ScrollView>

        {/* Submit button */}
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
          <Button
            size="$5"
            backgroundColor={canSubmit ? colors.primary : colors.disabled}
            pressStyle={canSubmit ? { backgroundColor: colors.primaryDark, scale: 0.98 } : {}}
            borderRadius={14}
            disabled={!canSubmit}
            onPress={handleSubmit}
          >
            <XStack alignItems="center" gap={8}>
              <Sparkles size={18} color="#FFFFFF" />
              <Text color="#FFFFFF" fontSize={16} fontWeight="700">
                Get Recommendation
              </Text>
            </XStack>
          </Button>
        </YStack>
      </YStack>
    </KeyboardAvoidingView>
  );
}
