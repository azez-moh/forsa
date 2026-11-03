import { getOpportunity, type InquiryStatus } from '@forsa/data';
import { radii } from '@forsa/tokens';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActionSheetIOS, Alert, FlatList, Modal, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import ReanimatedSwipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { Icon } from '@/components/Icon';
import { ScalePressable } from '@/components/Pressable';
import { Segmented } from '@/components/Segmented';
import { Text } from '@/components/Text';
import { Badge, Card, EmptyState, toast } from '@/components/ui';
import { useT } from '@/i18n';
import { requireAuth } from '@/lib/auth';
import { PIPELINE, relativeTime, sar, sarFull, statusKey } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useApp, type IncomingInquiry, type SentInquiry } from '@/store/app';
import { MARGIN, TAB_BAR_CLEARANCE, useTheme } from '@/theme';

const NEXT: Partial<Record<InquiryStatus, InquiryStatus>> = {
  new: 'nda-sent',
  'nda-sent': 'nda-signed',
  'nda-signed': 'in-discussion',
  'in-discussion': 'meeting',
  meeting: 'closed-won',
};

/** S06 Inbox: owner inquiry pipeline (segments) + investor conversations. */
export default function Inbox() {
  const { t } = useT();
  const [mode, setMode] = useState(0);
  const session = useApp((s) => s.session);

  if (!session) {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <EmptyState icon="tray" title={t('inboxTitle')} body={t('emptyPipelineBody')} action={t('signInCta')} onAction={() => requireAuth(() => {})} />
      </ScrollView>
    );
  }

  return mode === 0 ? <Pipeline header={<ModeSwitch mode={mode} setMode={setMode} />} /> : <Conversations header={<ModeSwitch mode={mode} setMode={setMode} />} />;
}

function ModeSwitch({ mode, setMode }: { mode: number; setMode: (n: number) => void }) {
  const { t } = useT();
  return <Segmented values={[t('incoming'), t('conversations')]} index={mode} onChange={setMode} style={{ marginBottom: 12 }} />;
}

function Pipeline({ header }: { header: React.ReactNode }) {
  const { c } = useTheme();
  const { t, lang } = useT();
  const incoming = useApp((s) => s.incoming);
  const setStatus = useApp((s) => s.setIncomingStatus);
  const markRead = useApp((s) => s.markIncomingRead);
  const [stage, setStage] = useState(0);
  const [open, setOpen] = useState<IncomingInquiry | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const rows = incoming.filter((x) => PIPELINE[stage].statuses.includes(x.status));
  const counts = PIPELINE.map((p) => incoming.filter((x) => p.statuses.includes(x.status)).length);

  const advance = (q: IncomingInquiry) => {
    const to = NEXT[q.status];
    if (!to) return;
    if (to === 'closed-won') return closeWon(q);
    setStatus(q.id, to);
    haptic.success();
    toast(t(statusKey[to]));
  };
  const closeWon = (q: IncomingInquiry) => {
    Alert.prompt(
      t('markWon'),
      `${t('dealValuePrompt')}\n\n${t('commissionDue')}`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('done'),
          onPress: (v?: string) => {
            setStatus(q.id, 'closed-won', v ? Number(v.replace(/\D/g, '')) || undefined : undefined);
            haptic.success();
            setOpen(null);
          },
        },
      ],
      'plain-text',
      '',
      'number-pad',
    );
  };
  const decline = (q: IncomingInquiry) => {
    const reasons = [t('declineReason1'), t('declineReason2'), t('declineReason3')];
    ActionSheetIOS.showActionSheetWithOptions(
      { title: t('decline'), options: [...reasons, t('cancel')], cancelButtonIndex: reasons.length, destructiveButtonIndex: undefined },
      (i) => {
        if (i < reasons.length) {
          setStatus(q.id, 'closed-lost');
          haptic.warning();
          setOpen(null);
        }
      },
    );
  };
  const moveTo = (q: IncomingInquiry) => {
    const opts: InquiryStatus[] = ['new', 'nda-sent', 'nda-signed', 'in-discussion', 'meeting', 'closed-won', 'closed-lost'];
    ActionSheetIOS.showActionSheetWithOptions(
      { title: t('moveTo'), options: [...opts.map((s) => t(statusKey[s])), t('cancel')], cancelButtonIndex: opts.length },
      (i) => {
        if (i >= opts.length) return;
        if (opts[i] === 'closed-won') return closeWon(q);
        setStatus(q.id, opts[i]);
        haptic.selection();
      },
    );
  };

  return (
    <>
      <FlatList
        data={rows}
        keyExtractor={(x) => x.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingHorizontal: MARGIN, paddingBottom: TAB_BAR_CLEARANCE, gap: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 700); }} />}
        ListHeaderComponent={
          <View style={{ paddingTop: 4, paddingBottom: 4 }}>
            {header}
            <Segmented values={PIPELINE.map((p, i) => `${t(p.key)}${counts[i] ? ` ${counts[i]}` : ''}`)} index={stage} onChange={setStage} />
          </View>
        }
        ListEmptyComponent={<EmptyState icon="tray" title={t('emptyPipeline')} body={t('emptyPipelineBody')} />}
        renderItem={({ item }) => (
          <Animated.View layout={LinearTransition.springify()} entering={FadeIn}>
            <SwipeRow
              onPrimary={NEXT[item.status] ? () => advance(item) : undefined}
              primaryLabel={NEXT[item.status] ? t(statusKey[NEXT[item.status]!]) : ''}
              onDestructive={item.status.startsWith('closed') ? undefined : () => decline(item)}
              destructiveLabel={t('decline')}
            >
              <ScalePressable
                pressScale={0.99}
                onPress={() => {
                  markRead(item.id);
                  setOpen(item);
                }}
                onLongPress={() => moveTo(item)}
                accessibilityRole="button"
                accessibilityHint={t('moveTo')}
                // VoiceOver rotor actions mirror the swipe and long-press gestures.
                accessibilityActions={[
                  ...(NEXT[item.status] ? [{ name: 'advance', label: t(statusKey[NEXT[item.status]!]) }] : []),
                  { name: 'move', label: t('moveTo') },
                  ...(item.status.startsWith('closed') ? [] : [{ name: 'decline', label: t('decline') }]),
                ]}
                onAccessibilityAction={(e) => {
                  if (e.nativeEvent.actionName === 'advance') advance(item);
                  if (e.nativeEvent.actionName === 'move') moveTo(item);
                  if (e.nativeEvent.actionName === 'decline') decline(item);
                }}
                style={[styles.inq, { backgroundColor: c.card }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {item.unread ? <View style={[styles.unread, { backgroundColor: c.primary }]} /> : null}
                  <Text variant="headline" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {item.fromName}
                  </Text>
                  {item.fromVerified ? <Icon name="checkmark.seal.fill" size={15} color={c.success} /> : null}
                  <View style={{ flex: 1 }} />
                  <Text variant="caption1" color="labelSecondary">
                    {relativeTime(item.updatedAt, lang)}
                  </Text>
                </View>
                <Text variant="subhead" color="labelSecondary" numberOfLines={2}>
                  {item.message}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  <Badge label={t(statusKey[item.status])} tone={item.status === 'closed-lost' ? 'neutral' : item.status === 'closed-won' ? 'success' : 'primary'} />
                  <Badge label={item.investorType} tone="neutral" />
                  {item.budgetSar ? <Badge label={`${t('budgetShort')} ${sar(item.budgetSar, lang)}`} tone="neutral" /> : null}
                </View>
              </ScalePressable>
            </SwipeRow>
          </Animated.View>
        )}
      />
      <InquiryDetail
        q={open}
        onClose={() => setOpen(null)}
        onAdvance={(q) => {
          advance(q);
          setOpen(null);
        }}
        onDecline={decline}
        onMove={moveTo}
      />
    </>
  );
}

function InquiryDetail({
  q,
  onClose,
  onAdvance,
  onDecline,
  onMove,
}: {
  q: IncomingInquiry | null;
  onClose: () => void;
  onAdvance: (q: IncomingInquiry) => void;
  onDecline: (q: IncomingInquiry) => void;
  onMove: (q: IncomingInquiry) => void;
}) {
  const { c } = useTheme();
  const { t, lang } = useT();
  const insets = useSafeAreaInsets();
  const o = q ? getOpportunity(q.opportunityId) : undefined;
  const next = q ? NEXT[q.status] : undefined;
  return (
    <Modal visible={!!q} presentationStyle="pageSheet" animationType="slide" onRequestClose={onClose}>
      {q ? (
        <View style={{ flex: 1, backgroundColor: c.groupedBg }}>
          <View style={styles.modalHeader}>
            <Text variant="headline" style={{ flex: 1 }}>
              {q.fromName}
            </Text>
            <Button title={t('done')} variant="plain" size="medium" onPress={onClose} />
          </View>
          <ScrollView contentContainerStyle={{ padding: MARGIN, gap: 12, paddingBottom: 140 }}>
            <Card style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                <Badge label={t(statusKey[q.status])} />
                {q.fromVerified ? <Badge label={t('nafathVerified')} tone="success" icon="checkmark.seal.fill" /> : null}
                <Badge label={q.investorType} tone="neutral" />
              </View>
              {q.budgetSar ? (
                <Text variant="subhead" tabular>
                  {t('budgetShort')}: {sarFull(q.budgetSar, lang)}
                </Text>
              ) : null}
              {o ? (
                <Button
                  title={o.title}
                  variant="plain"
                  size="small"
                  onPress={() => {
                    onClose();
                    router.push({ pathname: '/opportunity/[id]', params: { id: String(o.id) } });
                  }}
                />
              ) : null}
            </Card>
            <View style={[styles.bubble, { backgroundColor: c.card, alignSelf: 'flex-start' }]}>
              <Text>{q.message}</Text>
              <Text variant="caption2" color="labelSecondary">
                {relativeTime(q.createdAt, lang)}
              </Text>
            </View>
            {q.status === 'closed-won' ? (
              <Card style={{ backgroundColor: c.successTint, gap: 4 }}>
                <Text variant="headline" color="success">
                  {t('stWon')}
                  {q.dealValueSar ? ` · ${sarFull(q.dealValueSar, lang)}` : ''}
                </Text>
                <Text variant="footnote">{t('commissionDue')}</Text>
              </Card>
            ) : null}
          </ScrollView>
          {!q.status.startsWith('closed') ? (
            <View style={[styles.actions, { paddingBottom: insets.bottom + 8, borderTopColor: c.separator, backgroundColor: c.groupedBg }]}>
              {next ? (
                <Button
                  title={q.status === 'nda-signed' ? t('grantAccess') : q.status === 'new' ? t('sendNda') : t(statusKey[next])}
                  full
                  haptics={false}
                  onPress={() => onAdvance(q)}
                />
              ) : null}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button title={t('moveTo')} variant="gray" full style={{ flex: 1 }} onPress={() => onMove(q)} />
                <Button title={t('decline')} variant="destructiveTinted" full style={{ flex: 1 }} onPress={() => onDecline(q)} />
              </View>
            </View>
          ) : null}
        </View>
      ) : null}
    </Modal>
  );
}

/** Swipe actions: leading = advance stage, trailing = decline. */
function SwipeRow({
  children,
  onPrimary,
  primaryLabel,
  onDestructive,
  destructiveLabel,
}: {
  children: React.ReactNode;
  onPrimary?: () => void;
  primaryLabel: string;
  onDestructive?: () => void;
  destructiveLabel: string;
}) {
  const { c } = useTheme();
  const ref = useRef<SwipeableMethods>(null);
  const action = (label: string, color: string, icon: string, fn: () => void, directional = false) => (
    <ScalePressable
      onPress={() => {
        ref.current?.close();
        fn();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.swipeAction, { backgroundColor: color }]}
    >
      <Icon name={icon} size={20} color="#FFFFFF" directional={directional} />
      <Text variant="caption1" weight="600" style={{ color: '#FFFFFF' }} numberOfLines={1}>
        {label}
      </Text>
    </ScalePressable>
  );
  return (
    <ReanimatedSwipeable
      ref={ref}
      friction={1.6}
      overshootFriction={8}
      renderLeftActions={onPrimary ? () => action(primaryLabel, c.primary, 'arrow.forward.circle.fill', onPrimary, true) : undefined}
      renderRightActions={onDestructive ? () => action(destructiveLabel, c.danger, 'xmark.circle.fill', onDestructive) : undefined}
      containerStyle={{ borderRadius: radii.lg, overflow: 'hidden' }}
    >
      {children}
    </ReanimatedSwipeable>
  );
}

function Conversations({ header }: { header: React.ReactNode }) {
  const { c } = useTheme();
  const { t, lang } = useT();
  const sent = useApp((s) => s.sent);
  const [open, setOpen] = useState<SentInquiry | null>(null);
  return (
    <>
      <FlatList
        data={sent}
        keyExtractor={(x) => x.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingHorizontal: MARGIN, paddingBottom: TAB_BAR_CLEARANCE, gap: 10 }}
        ListHeaderComponent={<View style={{ paddingTop: 4 }}>{header}</View>}
        ListEmptyComponent={
          <EmptyState icon="bubble.left.and.bubble.right" title={t('noConversations')} body={t('noConversationsBody')} action={t('explore')} onAction={() => router.push('/opportunities')} />
        }
        renderItem={({ item }) => {
          const o = getOpportunity(item.opportunityId);
          const last = item.messages[item.messages.length - 1];
          return (
            <ScalePressable pressScale={0.99} onPress={() => setOpen(item)} accessibilityRole="button" style={[styles.inq, { backgroundColor: c.card }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text variant="headline" numberOfLines={1} style={{ flex: 1 }}>
                  {o?.title}
                </Text>
                <Text variant="caption1" color="labelSecondary">
                  {relativeTime(item.updatedAt, lang)}
                </Text>
              </View>
              <Text variant="subhead" color="labelSecondary" numberOfLines={1}>
                {last?.from === 'me' ? `${t('you')}: ` : ''}
                {last?.text}
              </Text>
              <Badge label={t(statusKey[item.status])} tone={item.status === 'nda-signed' ? 'success' : 'primary'} />
            </ScalePressable>
          );
        }}
      />
      <Thread q={open ? sent.find((x) => x.id === open.id) ?? null : null} onClose={() => setOpen(null)} />
    </>
  );
}

function Thread({ q, onClose }: { q: SentInquiry | null; onClose: () => void }) {
  const { c } = useTheme();
  const { t, lang } = useT();
  const insets = useSafeAreaInsets();
  const sendMessage = useApp((s) => s.sendMessage);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (replyTimer.current) clearTimeout(replyTimer.current);
  }, []);
  const o = q ? getOpportunity(q.opportunityId) : undefined;
  const send = () => {
    if (!q || !text.trim()) return;
    sendMessage(q.id, text.trim());
    setText('');
    haptic.light();
    // Mock owner auto-reply
    setTyping(true);
    if (replyTimer.current) clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      useApp.setState((s) => ({
        sent: s.sent.map((x) =>
          x.id === q.id ? { ...x, messages: [...x.messages, { id: `r${Date.now()}`, from: 'them', text: t('ownerAutoReply'), at: new Date().toISOString() }] } : x,
        ),
      }));
      setTyping(false);
    }, 1600);
  };
  return (
    <Modal visible={!!q} presentationStyle="pageSheet" animationType="slide" onRequestClose={onClose}>
      {q ? (
        <View style={{ flex: 1, backgroundColor: c.groupedBg }}>
          <View style={styles.modalHeader}>
            <Text variant="headline" numberOfLines={1} style={{ flex: 1 }}>
              {o?.title}
            </Text>
            <Button title={t('done')} variant="plain" size="medium" onPress={onClose} />
          </View>
          <ScrollView contentContainerStyle={{ padding: MARGIN, gap: 8 }}>
            {q.messages.map((m) => (
              <View key={m.id} style={[styles.bubble, m.from === 'me' ? { backgroundColor: c.primary, alignSelf: 'flex-end' } : { backgroundColor: c.card, alignSelf: 'flex-start' }]}>
                <Text style={m.from === 'me' ? { color: c.onPrimary } : undefined}>{m.text}</Text>
                <Text variant="caption2" style={{ color: m.from === 'me' ? c.onDarkSecondary : c.labelSecondary }}>
                  {relativeTime(m.at, lang)}
                </Text>
              </View>
            ))}
            {typing ? (
              <View style={[styles.bubble, { backgroundColor: c.card, alignSelf: 'flex-start' }]}>
                <Text color="labelSecondary">…</Text>
              </View>
            ) : null}
          </ScrollView>
          <View style={[styles.composer, { paddingBottom: insets.bottom + 8, borderTopColor: c.separator }]}>
            <View style={{ flex: 1 }}>
              <Field value={text} onChangeText={setText} placeholder={t('writeMessage')} accessibilityLabel={t('writeMessage')} />
            </View>
            <Button title="" icon="arrow.up" size="medium" accessibilityLabel={t('send')} onPress={send} disabled={!text.trim()} />
          </View>
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  inq: { borderRadius: radii.lg, padding: 14, gap: 4 },
  unread: { width: 9, height: 9, borderRadius: 5 },
  swipeAction: { width: 96, alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 6 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: MARGIN, paddingTop: 16, paddingBottom: 8 },
  bubble: { maxWidth: '82%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, gap: 2 },
  actions: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: MARGIN, gap: 10, borderTopWidth: StyleSheet.hairlineWidth },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: MARGIN, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth },
});
