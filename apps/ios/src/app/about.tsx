import { platformContact, platformStats, revenueStreams } from '@forsa/data';
import * as WebBrowser from 'expo-web-browser';
import { Linking, ScrollView, View } from 'react-native';

import { Text } from '@/components/Text';
import { Card, Row, SectionHeader } from '@/components/ui';
import { useT } from '@/i18n';
import { num } from '@/lib/format';
import { MARGIN, useTheme } from '@/theme';

/** S14 About + contact. */
export default function About() {
  const { c } = useTheme();
  const { t, lang } = useT();
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 48 }}>
      <Card style={{ marginHorizontal: MARGIN, gap: 10 }}>
        <Text variant="body">{t('aboutBody')}</Text>
        <View style={{ flexDirection: 'row', gap: 16, marginTop: 4 }}>
          {[
            { v: num(platformStats.users), k: t('statUsers') },
            { v: num(platformStats.opportunities), k: t('statOpportunities') },
            { v: `${platformStats.commissionPercent}%`, k: lang === 'ar' ? 'العمولة' : 'Commission' },
          ].map((s) => (
            <View key={s.k}>
              <Text variant="title3" tabular color="primary">
                {s.v}
              </Text>
              <Text variant="caption1" color="labelSecondary">
                {s.k}
              </Text>
            </View>
          ))}
        </View>
      </Card>
      <SectionHeader title={t('aboutModel')} />
      <Card style={{ marginHorizontal: MARGIN, gap: 8 }}>
        {revenueStreams.map((r) => (
          <Text key={r.id} variant="subhead">
            • {r[lang]}
          </Text>
        ))}
      </Card>
      <Text variant="footnote" color="labelSecondary" style={{ paddingHorizontal: MARGIN, marginTop: 12 }}>
        {t('aboutDisclaimer')}
      </Text>
      <SectionHeader title={t('contact')} />
      <Card padded={false} style={{ marginHorizontal: MARGIN }}>
        <Row icon="envelope.fill" iconBg={c.primary} title={platformContact.email} onPress={() => Linking.openURL(`mailto:${platformContact.email}`)} />
        <Row icon="message.fill" iconBg={c.success} title="WhatsApp" onPress={() => Linking.openURL(platformContact.whatsapp)} />
        <Row icon="doc.richtext" iconBg={c.rowGray} title={lang === 'ar' ? 'دليل المستخدم' : 'User guide'} onPress={() => WebBrowser.openBrowserAsync(platformContact.userGuidePdf).catch(() => {})} last />
      </Card>
      <Text variant="caption2" color="labelTertiary" align="center" style={{ marginTop: 16 }}>
        {platformContact.address}
      </Text>
    </ScrollView>
  );
}
