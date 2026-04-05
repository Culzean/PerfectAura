import React from 'react';
import { YStack, XStack, Text, Button } from 'tamagui';
import { Trash2, Scissors, ChevronRight } from 'lucide-react-native';
import type { Consultation } from '../types';
import { colors } from '../constants/colors';

interface ConsultationSummaryProps {
  consultation: Consultation;
  onPress: () => void;
  onDelete: () => void;
}

function formatDate(date: Date): string {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

export default function ConsultationSummary({
  consultation,
  onPress,
  onDelete,
}: ConsultationSummaryProps) {
  return (
    <Button unstyled onPress={onPress}>
      <YStack
        backgroundColor={colors.surface}
        borderRadius={16}
        padding={16}
        borderWidth={1}
        borderColor={colors.border}
        pressStyle={{ backgroundColor: colors.background }}
      >
        <XStack alignItems="center" gap={14}>
          <YStack
            width={48}
            height={48}
            borderRadius={14}
            backgroundColor={colors.primaryFaint}
            alignItems="center"
            justifyContent="center"
          >
            <Scissors size={22} color={colors.primary} />
          </YStack>

          <YStack flex={1} gap={3}>
            <Text fontSize={16} fontWeight="700" color={colors.text} numberOfLines={1}>
              {consultation.recommendation.cutName}
            </Text>
            <XStack alignItems="center" gap={6}>
              <Text fontSize={13} fontWeight="600" color={colors.textSecondary}>
                {consultation.userName}
              </Text>
              <Text fontSize={13} color={colors.textTertiary}>{'\u00B7'}</Text>
              <Text fontSize={13} color={colors.textTertiary}>
                {formatDate(consultation.createdAt)}
              </Text>
            </XStack>
          </YStack>

          <XStack alignItems="center" gap={4}>
            <Button
              size="$3"
              circular
              backgroundColor="transparent"
              pressStyle={{ backgroundColor: colors.dangerLight }}
              onPress={(e: any) => {
                e.stopPropagation?.();
                onDelete();
              }}
            >
              <Trash2 size={18} color={colors.danger} />
            </Button>
            <ChevronRight size={18} color={colors.textTertiary} />
          </XStack>
        </XStack>
      </YStack>
    </Button>
  );
}
