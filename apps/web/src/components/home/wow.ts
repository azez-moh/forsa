/**
 * Single import point for the wow/ motion components.
 * HeroCounter (above the fold) and TiltCard (tiny) load eagerly; TypeStory and CityMap are code-split
 * and only mounted near the viewport via <Deferred> (QA P2-9).
 */
import dynamic from 'next/dynamic';

export { HeroCounter } from '@/components/wow/HeroCounter';
export { TiltCard } from '@/components/wow/TiltCard';

export const TypeStory = dynamic(() => import('@/components/wow/TypeStory').then((m) => m.TypeStory), { ssr: false });
export const CityMap = dynamic(() => import('@/components/wow/CityMap').then((m) => m.CityMap), { ssr: false });
