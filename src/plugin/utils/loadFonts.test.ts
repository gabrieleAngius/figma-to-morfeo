import { mockGetLocalTextStyles, mockLoadFontAsync } from '../../../__mocks__/figmaMock';
import { loadFonts } from './loadFonts';

describe('loadFonts', () => {
  it('should call loadFontAsync for textStyles in the lib and default fonts', () => {
    mockGetLocalTextStyles.mockReturnValue([{ fontName: { family: 'AnyFont', style: 'AnyStyle' } }]);
    loadFonts();
    expect(mockLoadFontAsync).toBeCalledWith({ family: 'AnyFont', style: 'AnyStyle' }); // from lib
    expect(mockLoadFontAsync).toBeCalledWith({ family: 'Inter', style: 'Regular' }); //default
    expect(mockLoadFontAsync).toBeCalledWith({ family: 'Inter', style: 'Bold' }); //default
    expect(mockLoadFontAsync).toBeCalledWith({ family: 'Inter', style: 'Thin' }); //default
    expect(mockLoadFontAsync).toBeCalledTimes(4); // 3 default + 1 from lib
  });
});
