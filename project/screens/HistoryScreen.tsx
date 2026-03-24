import React from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import {
  ChevronLeft,
  Trash2,
  Clock,
  ChevronRight,
  Scissors,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useSession } from '../context/SessionContext';
import { colors } from '../constants/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

function formatDate(date: Date): string {
  const d = new Date(date);
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${month} ${day} at ${hour12}:${minutes} ${ampm}`;
}

export default function HistoryScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { consultations, deleteConsultation } = useSession();

  return (
    <YStack flex={1} backgroundColor={colors.background}>
      <XStack
        paddingTop={insets.top + 8}
        paddingBottom={12}
        paddingHorizontal={16}
        alignItems="center"
        gap={12}
        backgroundColor={colors.surface}
        borderBottomWidth={1}
        borderBottomColor={colors.border}
      >
        <Button
          size="$3"
          circular
          backgroundColor="transparent"
          pressStyle={{ backgroundColor: colors.background }}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={22} color={colors.text} />
        </Button>
        <Text fontSize={18} fontWeight="700" color={colors.text} flex={1}>
          History
        </Text>
        <Text fontSize={13} color={colors.textTertiary}>
          {consultations.length} {consultations.length === 1 ? 'consultation' : 'consultations'}
        </Text>
      </XStack>

      {consultations.length === 0 ? (
        <YStack flex={1} justifyContent="center" alignItems="center" padding={32} gap={16}>
          <YStack
            width={72}
            height={72}
            borderRadius={36}
            backgroundColor={colors.borderLight}
            alignItems="center"
            justifyContent="center"
          >
            <Clock size={32} color={colors.textTertiary} />
          </YStack>
          <Text fontSize={18} fontWeight="700" color={colors.text}>
            No consultations yet
          </Text>
          <Text fontSize={14} color={colors.textSecondary} textAlign="center">
            Your completed consultations will appear here
          </Text>
        </YStack>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16, gap: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {consultations.map((consultation, index) => (
            <Button
              key={consultation.id}
              unstyled
              onPress={() =>
                navigation.navigate('Results', {
                  consultation,
                  origin: 'history',
                })
              }
            >
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
                      <Text fontSize={13} color={colors.textSecondary}>
                        {consultation.userName}
                      </Text>
                      <Text fontSize={13} color={colors.textTertiary}>
                        {'\u00B7'}
                      </Text>
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
                        deleteConsultation(consultation.id);
                      }}
                    >
                      <Trash2 size={18} color={colors.danger} />
                    </Button>
                    <ChevronRight size={18} color={colors.textTertiary} />
                  </XStack>
                </XStack>
              </YStack>
            </Button>
          ))}
        </ScrollView>
      )}
    </YStack>
  );
}
