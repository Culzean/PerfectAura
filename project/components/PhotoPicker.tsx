import React from 'react';
import { YStack, XStack, Text, Button } from 'tamagui';
import { ImagePlus, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import type { PhotoAsset } from '../types';
import PhotoGrid from './PhotoGrid';
import { colors } from '../constants/colors';

interface PhotoPickerProps {
  photos: PhotoAsset[];
  maxPhotos: number;
  label: string;
  optional?: boolean;
  onPhotosChange: (photos: PhotoAsset[]) => void;
}

export default function PhotoPicker({
  photos,
  maxPhotos,
  label,
  optional,
  onPhotosChange,
}: PhotoPickerProps) {
  const remaining = maxPhotos - photos.length;
  const atCap = remaining <= 0;

  const pickFromGallery = async () => {
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

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled) return;

    const newAssets: PhotoAsset[] = result.assets.slice(0, remaining).map((a) => ({
      uri: a.uri,
      width: a.width,
      height: a.height,
      source: 'camera' as const,
    }));

    onPhotosChange([...photos, ...newAssets]);
  };

  const handleRemove = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  return (
    <YStack gap={12}>
      <XStack alignItems="center" gap={8}>
        <Camera size={16} color={colors.primary} />
        <Text fontSize={13} fontWeight="700" color={colors.textSecondary} letterSpacing={0.5}>
          {label}
        </Text>
        {!optional && <Text fontSize={12} color={colors.danger}>*</Text>}
        {optional && (
          <Text fontSize={11} color={colors.textTertiary} fontWeight="500">
            Optional
          </Text>
        )}
      </XStack>

      <PhotoGrid photos={photos} onRemove={handleRemove} size={100} />

      {!atCap && (
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
            onPress={pickFromGallery}
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
            onPress={pickFromCamera}
          >
            <YStack alignItems="center" gap={4}>
              <Camera size={22} color={colors.textTertiary} />
              <Text fontSize={11} color={colors.textTertiary}>Camera</Text>
            </YStack>
          </Button>
        </XStack>
      )}
    </YStack>
  );
}
