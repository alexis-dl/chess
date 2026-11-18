import {
  arrowShape,
  brushFromModifiers,
  CircleAnnotation,
  toggleArrow,
  toggleCircle,
} from './annotations';

describe('board annotations', () => {
  const keys = (ctrlKey = false, altKey = false, metaKey = false) => ({
    ctrlKey,
    altKey,
    metaKey,
  });

  it('picks the brush color from the modifier keys', () => {
    expect(brushFromModifiers(keys())).toBe('green');
    expect(brushFromModifiers(keys(true))).toBe('red');
    expect(brushFromModifiers(keys(false, false, true))).toBe('red'); // Cmd
    expect(brushFromModifiers(keys(false, true))).toBe('blue');
    expect(brushFromModifiers(keys(true, true))).toBe('yellow');
  });

  describe('toggleCircle', () => {
    const e4: CircleAnnotation = { square: { x: 4, y: 3 }, color: 'green' };

    it('adds a circle', () => {
      expect(toggleCircle([], e4)).toEqual([e4]);
    });

    it('removes the same circle drawn again', () => {
      expect(toggleCircle([e4], { ...e4 })).toEqual([]);
    });

    it('recolors a circle drawn in another color', () => {
      expect(toggleCircle([e4], { ...e4, color: 'red' })).toEqual([
        { ...e4, color: 'red' },
      ]);
    });
  });

  describe('toggleArrow', () => {
    const e2e4 = {
      from: { x: 4, y: 1 },
      to: { x: 4, y: 3 },
      color: 'green' as const,
    };

    it('adds, recolors and removes arrows', () => {
      const added = toggleArrow([], e2e4);
      expect(added).toEqual([e2e4]);
      const recolored = toggleArrow(added, { ...e2e4, color: 'blue' });
      expect(recolored).toEqual([{ ...e2e4, color: 'blue' }]);
      expect(toggleArrow(recolored, { ...e2e4, color: 'blue' })).toEqual([]);
    });

    it('keeps arrows in opposite directions apart', () => {
      const back = { ...e2e4, from: e2e4.to, to: e2e4.from };
      expect(toggleArrow([e2e4], back)).toEqual([e2e4, back]);
    });
  });

  describe('arrowShape', () => {
    it('goes from the center of a square towards the center of another', () => {
      // display coordinates: one square up
      const shape = arrowShape({ x: 4, y: 6 }, { x: 4, y: 5 });
      expect(shape.x1).toBe(4.5);
      expect(shape.y1).toBe(6.5);
      expect(shape.x2).toBe(4.5);
      // shaft ends below the head: tip at 5.58, head 0.42 long
      expect(shape.y2).toBeCloseTo(5.99, 2);
      expect(shape.head.split(' ')[0]).toBe('4.5,5.58');
    });
  });
});
