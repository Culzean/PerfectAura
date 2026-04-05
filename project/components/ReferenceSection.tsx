import React from 'react';
import { YStack, XStack, Text, Button } from 'tamagui';
import { Search, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import type { PhotoAsset } from '../types';
import PhotoGrid from './PhotoGrid';
import { colors } from '../constants/colors';

interface ReferenceSectionProps {
  photos: PhotoAsset[];
  maxPhotos: number;
  onPhotosChange: (photos: PhotoAsset[]) => void;
  onBrowseStyles: () => void;
  stylePickerEnabled: boolean;
}

export default function ReferenceSection({
  photos,
  maxPhotos,
  onPhotosChange,
  onBrowseStyles,
  stylePickerEnabled,
}: ReferenceSectionProps) {
  const remaining = maxPhotos - photos.length;
  const atCap = remaining <= 0;

  const pickOwn = async () => {
    if (atCap) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });

    if (result.canceled) return;

    const newAssets: PhotoAsset[] = result.assets.slice(0, remaining).map((a) => ({
      uri: a.uri,
      width: a.width,
      height: a.height,
      source: 'gallery' as const,
    }));

    onPhotosChange([...photos, ...newAssets]);
  };

  const handleRemove = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  return (
    <YStack gap={12}>
      <PhotoGrid photos={photos} onRemove={handleRemove} />

      <XStack gap={10}>
        <Button
          flex={1}
          size="$4"
          backgroundColor={colors.borderLight}
          borderRadius={12}
          disabled={!stylePickerEnabled}
          opacity={stylePickerEnabled ? 1 : 0.4}
          onPress={stylePickerEnabled ? onBrowseStyles : undefined}
        >
          <XStack alignItems="center" gap={6}>
            <Search size={16} color={colors.disabled} />
            <YStack>
              <Text fontSize={13} color={colors.disabled} fontWeight="600">
                Browse styles
              </Text>
              {!stylePickerEnabled && (
                <Text fontSize={10} color={colors.disabled}>Coming soon</Text>
              )}
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
          onPress={pickOwn}
          disabled={atCap}
          opacity={atCap ? 0.5 : 1}
        >
          <XStack alignItems="center" gap={6}>
            <Plus size={16} color={colors.primary} />
            <Text fontSize={13} color={colors.text} fontWeight="600">
              Add your own
            </Text>
          </XStack>
        </Button>
      </XStack>
    </YStack>
  );
}
