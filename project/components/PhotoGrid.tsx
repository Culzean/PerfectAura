import React from 'react';
import { ScrollView, Image } from 'react-native';
import { XStack, YStack, Button } from 'tamagui';
import { X } from 'lucide-react-native';
import type { PhotoAsset } from '../types';

interface PhotoGridProps {
  photos: PhotoAsset[];
  onRemove?: (index: number) => void;
  size?: number;
}

export default function PhotoGrid({ photos, onRemove, size = 80 }: PhotoGridProps) {
  if (photos.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <XStack gap={8}>
        {photos.map((photo, i) => (
          <YStack
            key={photo.uri}
            width={size}
            height={size}
            borderRadius={12}
            overflow="hidden"
            borderWidth={1}
            borderColor="#E7E5E4"
          >
            <Image
              source={{ uri: photo.uri }}
              style={{ width: size, height: size }}
            />
            {onRemove && (
              <Button
                size="$2"
                circular
                position="absolute"
                top={4}
                right={4}
                backgroundColor="rgba(0,0,0,0.6)"
                pressStyle={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
                onPress={() => onRemove(i)}
              >
                <X size={10} color="#FFFFFF" />
              </Button>
            )}
          </YStack>
        ))}
      </XStack>
    </ScrollView>
  );
}
