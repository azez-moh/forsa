/** Web preview: no Taptic Engine. Same API as haptics.ts, all no-ops. */
const noop = () => {};
export const haptic = { selection: noop, light: noop, success: noop, error: noop, warning: noop };
