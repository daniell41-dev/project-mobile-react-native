import { useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { HomeStackParamList } from '@/bootstrap/navigation/types';
import { Contact } from '@/core/models/contact.model';
import { DataService } from '@/core/services/data.service';
import { AppText } from '@/shared/components/AppText';
import { Button } from '@/shared/components/Button';
import { NumericKeypad } from '@/shared/components/NumericKeypad';
import { Screen } from '@/shared/components/Screen';
import { SearchBar } from '@/shared/components/SearchBar';
import { useTheme } from '@/shared/hooks/useTheme';
import { applyNumericKey } from '@/shared/utils/applyNumericKey';
import { formatCurrency } from '@/shared/utils/formatCurrency';

type Props = NativeStackScreenProps<HomeStackParamList, 'Send'>;

export function SendScreen({ navigation }: Props) {
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [recipient, setRecipient] = useState<Contact | null>(null);
  const [amount, setAmount] = useState('0');

  const contacts = DataService.getContacts();
  const recentContacts = contacts.filter((contact) => contact.recent);
  const filteredContacts = useMemo(
    () => contacts.filter((contact) => contact.name.toLowerCase().includes(query.toLowerCase())),
    [contacts, query],
  );

  const availableBalance = DataService.getUser().balance;
  const amountValue = Number.parseFloat(amount) || 0;

  if (!recipient) {
    return (
      <Screen padded={false}>
        <View style={{ paddingHorizontal: theme.spacing.screenPadding }}>
          <AppText variant="screenTitle" style={styles.title}>
            Enviar dinero
          </AppText>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar contacto" />
        </View>

        {recentContacts.length > 0 && !query && (
          <View style={styles.recentSection}>
            <AppText variant="subtitle" tone="textDim" style={styles.recentLabel}>
              Recientes
            </AppText>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={recentContacts}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: theme.spacing.screenPadding, gap: 16 }}
              renderItem={({ item }) => (
                <Pressable onPress={() => setRecipient(item)} style={styles.avatarItem}>
                  <View
                    style={[
                      styles.avatarCircle,
                      { backgroundColor: theme.colors.surface2 },
                    ]}
                  >
                    <AppText variant="itemTitle" tone="accent">
                      {item.initials}
                    </AppText>
                  </View>
                  <AppText variant="label" tone="textDim" numberOfLines={1}>
                    {item.name.split(' ')[0]}
                  </AppText>
                </Pressable>
              )}
            />
          </View>
        )}

        <AppText
          variant="subtitle"
          tone="textDim"
          style={[styles.recentLabel, { paddingHorizontal: theme.spacing.screenPadding }]}
        >
          Tus contactos
        </AppText>
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.screenPadding }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setRecipient(item)}
              style={[styles.contactRow, { borderBottomColor: theme.colors.hairline }]}
            >
              <View style={[styles.avatarCircle, { backgroundColor: theme.colors.surface2 }]}>
                <AppText variant="itemTitle" tone="accent">
                  {item.initials}
                </AppText>
              </View>
              <View style={styles.contactTextGroup}>
                <AppText variant="itemTitle">{item.name}</AppText>
                <AppText variant="subtitle" tone="textDim">
                  {item.sub}
                </AppText>
              </View>
            </Pressable>
          )}
        />
      </Screen>
    );
  }

  return (
    <Screen style={styles.amountContainer}>
      <Pressable
        onPress={() => setRecipient(null)}
        style={[styles.recipientChip, { backgroundColor: theme.colors.surface2 }]}
      >
        <AppText variant="subtitle">{recipient.name}</AppText>
      </Pressable>

      <View style={styles.amountDisplay}>
        <AppText variant="sendAmount">${amount}</AppText>
        <AppText variant="subtitle" tone="textDim">
          Saldo disponible: {formatCurrency(availableBalance)}
        </AppText>
      </View>

      <NumericKeypad onKeyPress={(key) => setAmount((current) => applyNumericKey(current, key))} />

      <View style={styles.footer}>
        <Button
          label={`Enviar ${formatCurrency(amountValue)}`}
          onPress={() =>
            navigation.navigate('SendDone', { amount: amountValue, recipientName: recipient.name })
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginVertical: 16,
  },
  recentSection: {
    marginTop: 16,
  },
  recentLabel: {
    marginBottom: 8,
  },
  avatarItem: {
    alignItems: 'center',
    gap: 6,
    width: 64,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  contactTextGroup: {
    gap: 2,
  },
  amountContainer: {
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  recipientChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginTop: 8,
  },
  amountDisplay: {
    alignItems: 'center',
    gap: 8,
  },
  footer: {
    marginTop: 16,
  },
});
