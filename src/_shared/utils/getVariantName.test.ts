import { getVariantName } from './getVariantName';

describe('getVariantName', () => {
  it('should return expected name', () => {
    expect(getVariantName(0)).toBe('xs');
    expect(getVariantName(4)).toBe('xl');
  });

  it('should return nXl if the index is > baseName.length', () => {
    expect(getVariantName(5)).toBe('2xl');
    expect(getVariantName(6)).toBe('3xl');
    expect(getVariantName(7)).toBe('4xl');
  });
});
