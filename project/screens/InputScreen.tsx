import React from 'react';
import { ScrollView, Platform, KeyboardAvoidingView, Image } from 'react-native';
import { YStack, XStack, Text, Button, TextArea } from 'tamagui';
import {
  Camera,
  ImagePlus,
  X,
  ChevronLeft,
  Sparkles,
  Search,
  Plus,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useSession } from '../context/SessionContext';
import { colors } from '../constants/colors';
import type { PhotoAsset } from '../types';

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

  const pickPhotos = async (
    target: 'current' | 'reference',
    source: 'gallery' | 'camera'
  ) => {
    const maxForTarget = target === 'current' ? 3 : 5;
    const existing = target === 'current' ? currentPhotos : referencePhotos;
    const remaining = maxForTarget - existing.length;
    if (remaining <= 0) return;

    let result: ImagePicker.ImagePickerResult;

    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') return;
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return;
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: remaining,
        quality: 0.8,
      });
    }

    if (result.canceled) return;

    const newAssets: PhotoAsset[] = result.assets.slice(0, remaining).map((a) => ({
      uri: a.uri,
      width: a.width,
      height: a.height,
    }));

    if (target === 'current') {
      setCurrentPhotos([...existing, ...newAssets]);
    } else {
      setReferencePhotos([...existing, ...newAssets]);
    }
  };

  const removePhoto = (target: 'current' | 'reference', index: number) => {
    if (target === 'current') {
      setCurrentPhotos(currentPhotos.filter((_, i) => i !== index));
    } else {
      setReferencePhotos(referencePhotos.filter((_, i) => i !== index));
    }
  };

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
            <YStack gap={12}>
              <XStack alignItems="center" gap={8}>
                <Camera size={16} color={colors.primary} />
                <Text fontSize={13} fontWeight="700" color={colors.textSecondary} letterSpacing={0.5}>
                  YOUR CURRENT HAIR
                </Text>
                <Text fontSize={12} color={colors.danger}>*</Text>
              </XStack>
              <Text fontSize={13} color={colors.textTertiary}>
                Add 1-3 photos showing your hair from different angles
              </Text>

              <XStack flexWrap="wrap" gap={12}>
                {currentPhotos.map((photo, i) => (
                  <YStack key={photo.uri} width={100} height={100} borderRadius={14} overflow="hidden">
                    <Image
                      source={{ uri: photo.uri }}
                      style={{ width: 100, height: 100 }}
                    />
                    <Button
                      size="$2"
                      circular
                      position="absolute"
                      top={4}
                      right={4}
                      backgroundColor="rgba(0,0,0,0.6)"
                      pressStyle={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
                      onPress={() => removePhoto('current', i)}
                    >
                      <X size={12} color="#FFFFFF" />
                    </Button>
                  </YStack>
                ))}

                {currentPhotos.length < 3 && (
                  <XStack gap={8}>
                    <Button
                      width={100}
                      height={100}
                      borderRadius={14}
                      borderWidth={2}
                      borderColor={colors.border}
                      borderStyle="dashed"
                      backgroundColor={colors.surface}
                      pressStyle={{ backgroundColor: colors.background }}
                      onPress={() => pickPhotos('current', 'gallery')}
                    >
                      <YStack alignItems="center" gap={4}>
                        <ImagePlus size={22} color={colors.textTertiary} />
                        <Text fontSize={11} color={colors.textTertiary}>Gallery</Text>
                      </YStack>
                    </Button>
                    <Button
                      width={100}
                      height={100}
                      borderRadius={14}
                      borderWidth={2}
                      borderColor={colors.border}
                      borderStyle="dashed"
                      backgroundColor={colors.surface}
                      pressStyle={{ backgroundColor: colors.background }}
                      onPress={() => pickPhotos('current', 'camera')}
                    >
                      <YStack alignItems="center" gap={4}>
                        <Camera size={22} color={colors.textTertiary} />
                        <Text fontSize={11} color={colors.textTertiary}>Camera</Text>
                      </YStack>
                    </Button>
                  </XStack>
                )}
              </XStack>
            </YStack>

            <YStack
              height={1}
              backgroundColor={colors.border}
              marginHorizontal={-20}
            />

            <YStack gap={12}>
              <XStack alignItems="center" gap={8}>
                <Sparkles size={16} color={colors.accent} />
                <Text fontSize={13} fontWeight="700" color={colors.textSecondary} letterSpacing={0.5}>
                  REFERENCE / INSPIRATION
                </Text>
              </XStack>
              <Text fontSize={13} color={colors.textTertiary}>
                Optional - add up to 5 photos of styles you like
              </Text>

              <XStack gap={10}>
                <Button
                  flex={1}
                  size="$4"
                  backgroundColor={colors.borderLight}
                  borderRadius={12}
                  disabled
                  opacity={0.5}
                >
                  <XStack alignItems="center" gap={6}>
                    <Search size={16} color={colors.disabled} />
                    <YStack>
                      <Text fontSize={13} color={colors.disabled} fontWeight="600">
                        Browse styles
                      </Text>
                      <Text fontSize={10} color={colors.disabled}>Coming soon</Text>
                    </YStack>
                  </XStack>
                </Button>

                <Button
                  flex={1}
                  size="$4"
                  backgroundColor={colors.surface}
                  borderWidth={1}
                  borderColor={colors.border}
                  borderRadius={12}
                  pressStyle={{ backgroundColor: colors.background }}
                  onPress={() => pickPhotos('reference', 'gallery')}
                  disabled={referencePhotos.length >= 5}
                  opacity={referencePhotos.length >= 5 ? 0.5 : 1}
                >
                  <XStack alignItems="center" gap={6}>
                    <Plus size={16} color={colors.primary} />
                    <Text fontSize={13} color={colors.text} fontWeight="600">
                      Add your own
                    </Text>
                  </XStack>
                </Button>
              </XStack>

              {referencePhotos.length > 0 && (
                <XStack flexWrap="wrap" gap={10} marginTop={4}>
                  {referencePhotos.map((photo, i) => (
                    <YStack
                      key={photo.uri}
                      width={80}
                      height={80}
                      borderRadius={12}
                      overflow="hidden"
                    >
                      <Image
                        source={{ uri: photo.uri }}
                        style={{ width: 80, height: 80 }}
                      />
                      <Button
                        size="$2"
                        circular
                        position="absolute"
                        top={4}
                        right={4}
                        backgroundColor="rgba(0,0,0,0.6)"
                        pressStyle={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
                        onPress={() => removePhoto('reference', i)}
                      >
                        <X size={10} color="#FFFFFF" />
                      </Button>
                    </YStack>
                  ))}
                </XStack>
              )}
            </YStack>

            <YStack
              height={1}
              backgroundColor={colors.border}
              marginHorizontal={-20}
            />

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
