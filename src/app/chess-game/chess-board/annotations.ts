/** Circles and arrows drawn on the board with the right mouse button. */

export type BrushColor = 'green' | 'red' | 'blue' | 'yellow';

export const BRUSH_COLORS: Record<BrushColor, string> = {
  green: '#3f8a2e',
  red: '#b8392b',
  blue: '#2f5fa8',
  yellow: '#d89a14',
};

/** Board coordinates: x is the file (0 = a), y the rank (0 = 1). */
export interface BoardSquare {
  x: number;
  y: number;
}

export interface CircleAnnotation {
  square: BoardSquare;
  color: BrushColor;
}

export interface ArrowAnnotation {
  from: BoardSquare;
  to: BoardSquare;
  color: BrushColor;
}

/**
 * No modifier: green, Ctrl (Cmd on Mac): red, Alt: blue, both: yellow.
 * Shift is not used: Brave and Firefox always open their own menu on
 * Shift + right click, whatever the page does.
 */
export function brushFromModifiers(event: {
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}): BrushColor {
  const ctrl = event.ctrlKey || event.metaKey;
  if (ctrl && event.altKey) {
    return 'yellow';
  }
  if (ctrl) {
    return 'red';
  }
  return event.altKey ? 'blue' : 'green';
}

const sameSquare = (a: BoardSquare, b: BoardSquare) =>
  a.x === b.x && a.y === b.y;

/**
 * Drawing an annotation that already exists in the same color removes it;
 * in another color, it is recolored.
 */
export function toggleCircle(
  circles: CircleAnnotation[],
  circle: CircleAnnotation
): CircleAnnotation[] {
  const existing = circles.find(c => sameSquare(c.square, circle.square));
  const others = circles.filter(c => c !== existing);
  return existing?.color === circle.color ? others : [...others, circle];
}

export function toggleArrow(
  arrows: ArrowAnnotation[],
  arrow: ArrowAnnotation
): ArrowAnnotation[] {
  const existing = arrows.find(
    a => sameSquare(a.from, arrow.from) && sameSquare(a.to, arrow.to)
  );
  const others = arrows.filter(a => a !== existing);
  return existing?.color === arrow.color ? others : [...others, arrow];
}

/** Shape of an arrow in display units (1 = one square). */
export interface ArrowShape {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Arrowhead triangle, as an SVG points list. */
  head: string;
}

const HEAD_LENGTH = 0.42;
const HEAD_WIDTH = 0.42;
/** The tip stops a little before the center of the target square. */
const TIP_INSET = 0.08;

/** From the center of a square to the center of another (display coordinates). */
export function arrowShape(
  from: { x: number; y: number },
  to: { x: number; y: number }
): ArrowShape {
  const [x1, y1] = [from.x + 0.5, from.y + 0.5];
  const [cx, cy] = [to.x + 0.5, to.y + 0.5];
  const length = Math.hypot(cx - x1, cy - y1);
  const [dx, dy] = [(cx - x1) / length, (cy - y1) / length];
  const tip = [cx - dx * TIP_INSET, cy - dy * TIP_INSET];
  const base = [tip[0] - dx * HEAD_LENGTH, tip[1] - dy * HEAD_LENGTH];
  const [px, py] = [-dy * (HEAD_WIDTH / 2), dx * (HEAD_WIDTH / 2)];
  const round = (value: number) => Math.round(value * 1000) / 1000;
  const point = (x: number, y: number) => `${round(x)},${round(y)}`;
  return {
    x1: round(x1),
    y1: round(y1),
    // the shaft stops under the head so the transparent parts don't overlap
    x2: round(base[0] + dx * 0.01),
    y2: round(base[1] + dy * 0.01),
    head: [
      point(tip[0], tip[1]),
      point(base[0] + px, base[1] + py),
      point(base[0] - px, base[1] - py),
    ].join(' '),
  };
}
