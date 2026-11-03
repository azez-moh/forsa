/**
 * Single swap point for the Wow agent's components (src/components/wow/, owned by another agent).
 *
 * TODO(wow): the wow files did not exist when Web Core was built. Once they land, replace the four
 * fallback exports below with the real imports:
 *
 *   export { HeroCounter } from '@/components/wow/HeroCounter';
 *   export { TypeStory } from '@/components/wow/TypeStory';
 *   export { CityMap } from '@/components/wow/CityMap';
 *   export { TiltCard } from '@/components/wow/TiltCard';
 */
export {
  HeroCounterFallback as HeroCounter,
  TypeStoryFallback as TypeStory,
  CityMapFallback as CityMap,
  TiltCardFallback as TiltCard,
} from './Fallbacks';
