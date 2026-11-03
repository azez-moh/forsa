/**
 * Single import point for the Wow agent's components (src/components/wow/, owned by another agent).
 * Fallbacks.tsx keeps same-contract stand-ins in case the wow folder is ever removed; to use them,
 * swap these re-exports for `export { HeroCounterFallback as HeroCounter, ... } from './Fallbacks'`.
 */
export { HeroCounter } from '@/components/wow/HeroCounter';
export { TypeStory } from '@/components/wow/TypeStory';
export { CityMap } from '@/components/wow/CityMap';
export { TiltCard } from '@/components/wow/TiltCard';
