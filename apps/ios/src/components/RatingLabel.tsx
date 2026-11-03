import { View } from 'react-native';

import { useT } from '@/i18n';
import { useTheme } from '@/theme';

import { Icon } from './Icon';
import { Text } from './Text';
import { Badge } from './ui';

/** Fewer than 3 reviews → "جديد على المنصة" instead of a star rating. */
export function RatingLabel({ rating, reviews }: { rating: number; reviews: number }) {
  const { c } = useTheme();
  const { t } = useT();
  if (reviews < 3) return <Badge label={t('newOnPlatform')} tone="neutral" icon="sparkles" />;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Icon name="star.fill" size={13} color={c.warning} />
      <Text variant="footnote" weight="600" tabular>
        {rating.toFixed(1)}
      </Text>
      <Text variant="footnote" color="labelSecondary" tabular>
        ({reviews} {t('reviews')})
      </Text>
    </View>
  );
}

