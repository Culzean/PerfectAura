import React from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import { ChevronLeft, Clock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useSession } from '../context/SessionContext';
import { colors } from '../constants/colors';
import ConsultationSummary from '../components/ConsultationSummary';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

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
            Your recommendations will appear here
          </Text>
        </YStack>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16, gap: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {consultations.map((consultation) => (
            <ConsultationSummary
              key={consultation.id}
              consultation={consultation}
              onPress={() =>
                navigation.navigate('Results', {
                  consultation,
                  origin: 'history',
                })
              }
              onDelete={() => deleteConsultation(consultation.id)}
            />
          ))}
        </ScrollView>
      )}
    </YStack>
  );
}
