/** Outer surfaces: cards, dialogs, inputs, buttons. */
export const APP_BORDER_RADIUS = 12;

/** Nested blocks inside cards: macro pills, food rows, icon tiles. */
export const APP_BORDER_RADIUS_SM = 8;

/** Thin controls: progress bars (use ≤ half the element height). */
export const APP_BORDER_RADIUS_XS = 4;

/**
 * Use in `sx` props. MUI multiplies numeric borderRadius by theme.shape.borderRadius,
 * so pass px strings here to get the intended radius.
 */
export const appRadius = {
  lg: `${APP_BORDER_RADIUS}px`,
  sm: `${APP_BORDER_RADIUS_SM}px`,
  xs: `${APP_BORDER_RADIUS_XS}px`,
} as const;
