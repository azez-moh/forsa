import { getProvider, getService } from '@forsa/data';
import { radii } from '@forsa/tokens';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { Badge, Card, EmptyState, SectionHeader, toast } from '@/components/ui';
import { useT } from '@/i18n';
import { requireAuth } from '@/lib/auth';
import { cityName, sarFull } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useApp } from '@/store/app';
import { MARGIN, useTheme } from '@/theme';

/** S08 Service detail + request. */
export default function ServiceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = getService(Number(id));
  const { c } = useTheme();
  const { t, lang } = useT();
  const insets = useSafeAreaInsets();
  const requestService = useApp((st) => st.requestService);
  const [sheet, setSheet] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  if (!s) return <EmptyState icon="questionmark.folder" title={t('noResults')} />;
  const p = getProvider(s.providerId);

  const submit = () => {
    if (notes.trim().length < 5) {
      haptic.error();
      setError(t('requestNotesError'));
      return;
    }
    requestService(s.id, notes.trim());
    haptic.success();
    setSheet(false);
    setNotes('');
    toast(t('requestSent'));
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Button
              title=""
              icon="square.and.arrow.up"
              variant="plain"
              size="medium"
              accessibilityLabel={t('share')}
              onPress={() => Share.share({ message: `${s.title}\n${s.sourceUrl}`, url: s.sourceUrl }).catch(() => {})}
            />
          ),
        }}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
        <View style={{ paddingHorizontal: MARGIN, gap: 8 }}>
          <Text variant="title1" accessibilityRole="header">
            {s.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <Text variant="title2" color="primary" tabular>
              {sarFull(s.priceSar, lang)}
            </Text>
            {s.originalPriceSar ? (
              <Text variant="subhead" color="labelTertiary" tabular style={{ textDecorationLine: 'line-through' }}>
                {sarFull(s.originalPriceSar, lang)}
              </Text>
            ) : null}
          </View>
          <Text variant="body">{s.description}</Text>
        </View>

        {s.duration ? (
          <Card style={[styles.inline, { marginHorizontal: MARGIN, marginTop: 16 }]}>
            <Icon name="clock" size={18} color={c.primary} />
            <Text variant="footnote" color="labelSecondary">
              {t('duration')}
            </Text>
            <Text variant="subhead" style={{ flex: 1 }}>
              {s.duration}
            </Text>
          </Card>
        ) : null}

        {s.deliverables?.length ? (
          <>
            <SectionHeader title={t('deliverables')} />
            <Card style={{ marginHorizontal: MARGIN, gap: 8 }}>
              {s.deliverables.map((d) => (
                <View key={d} style={styles.inline}>
                  <Icon name="checkmark.circle.fill" size={16} color={c.success} />
                  <Text variant="subhead" style={{ flex: 1 }}>
                    {d}
                  </Text>
                </View>
              ))}
            </Card>
          </>
        ) : null}

        {s.requirements?.length ? (
          <>
            <SectionHeader title={t('requirements')} />
            <Card style={{ marginHorizontal: MARGIN, gap: 8 }}>
              {s.requirements.map((d) => (
                <View key={d} style={styles.inline}>
                  <Icon name="doc.text" size={16} color={c.labelSecondary} />
                  <Text variant="subhead" style={{ flex: 1 }}>
                    {d}
                  </Text>
                </View>
              ))}
            </Card>
          </>
        ) : null}

        {p ? (
          <>
            <SectionHeader title={t('provider')} />
            <Card style={{ marginHorizontal: MARGIN, gap: 6 }}>
              <Text variant="headline">{p.name}</Text>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                {p.certified ? <Badge label={t('certified')} tone="success" icon="checkmark.seal.fill" /> : null}
                {p.completedOrders === 0 ? <Badge label={t('newProvider')} tone="neutral" /> : <Badge label={`${p.completedOrders} ${t('ordersDone')}`} tone="neutral" />}
                {p.cityId ? <Badge label={cityName(p.cityId, lang)} tone="neutral" icon="mappin" /> : null}
              </View>
            </Card>
          </>
        ) : null}

        {s.disclaimer ? (
          <Text variant="footnote" color="labelSecondary" style={{ paddingHorizontal: MARGIN, marginTop: 16 }}>
            {s.disclaimer}
          </Text>
        ) : null}
      </ScrollView>
      <View style={[styles.cta, { paddingBottom: insets.bottom + 8, backgroundColor: c.groupedBg, borderTopColor: c.separator }]}>
        <Button title={t('requestService')} full onPress={() => requireAuth(() => setSheet(true))} />
      </View>

      <Modal visible={sheet} presentationStyle="formSheet" animationType="slide" onRequestClose={() => setSheet(false)}>
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1, backgroundColor: c.groupedBg, padding: MARGIN, gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 8 }}>
            <Text variant="headline" style={{ flex: 1 }}>
              {t('requestService')}
            </Text>
            <Button title={t('cancel')} variant="plain" size="medium" onPress={() => setSheet(false)} />
          </View>
          <Card>
            <Text variant="subhead" weight="600">
              {s.title}
            </Text>
            <Text variant="footnote" color="labelSecondary" tabular>
              {sarFull(s.priceSar, lang)}
            </Text>
          </Card>
          <Field label={t('requestNotes')} value={notes} onChangeText={(v) => { setNotes(v); setError(null); }} multiline error={error} autoFocus />
          <Button title={t('submitRequest')} full onPress={submit} haptics={false} />
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cta: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: MARGIN, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
});
