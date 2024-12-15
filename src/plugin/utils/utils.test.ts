import { mockCreateText, mockGetNodeById } from '../../../__mocks__/figmaMock';
import { mockNode } from '../../../__mocks__/mockUtils';
import { PLUGIN_DATA_NAMESPACE, PluginDataKeys, Slices } from '../../_shared/constants';
import {
  createBoxInstances,
  deleteNodesById,
  generateTextSlices,
  getVariantCombinations,
  parseTextStyles,
  saveCurrentBoxVariants,
  setRefs,
  sortValues,
  updateVariantName,
} from './utils';

describe('get variant combinations', () => {
  it('should return expected combinations', () => {
    const res = getVariantCombinations([
      { sliceName: Slices.Radius, variants: { S: 1, M: 2, L: 3 }, styleKey: 'cornerRadius' },
      { sliceName: Slices.BorderWidth, variants: { X: 1, Y: 2 }, styleKey: 'strokeWeight' },
      { sliceName: 'Spacing' as Slices, variants: { A: 1, B: 2 }, styleKey: 'space' as any },
    ]);

    expect(res).toEqual([
      { name: 'Radius=S, Border width=X, Spacing=A', cornerRadius: 1, strokeWeight: 1, space: 1 },
      { name: 'Radius=S, Border width=X, Spacing=B', cornerRadius: 1, strokeWeight: 1, space: 2 },
      { name: 'Radius=S, Border width=Y, Spacing=A', cornerRadius: 1, strokeWeight: 2, space: 1 },
      { name: 'Radius=S, Border width=Y, Spacing=B', cornerRadius: 1, strokeWeight: 2, space: 2 },

      { name: 'Radius=M, Border width=X, Spacing=A', cornerRadius: 2, strokeWeight: 1, space: 1 },
      { name: 'Radius=M, Border width=X, Spacing=B', cornerRadius: 2, strokeWeight: 1, space: 2 },
      { name: 'Radius=M, Border width=Y, Spacing=A', cornerRadius: 2, strokeWeight: 2, space: 1 },
      { name: 'Radius=M, Border width=Y, Spacing=B', cornerRadius: 2, strokeWeight: 2, space: 2 },

      { name: 'Radius=L, Border width=X, Spacing=A', cornerRadius: 3, strokeWeight: 1, space: 1 },
      { name: 'Radius=L, Border width=X, Spacing=B', cornerRadius: 3, strokeWeight: 1, space: 2 },
      { name: 'Radius=L, Border width=Y, Spacing=A', cornerRadius: 3, strokeWeight: 2, space: 1 },
      { name: 'Radius=L, Border width=Y, Spacing=B', cornerRadius: 3, strokeWeight: 2, space: 2 },
    ]);
  });

  it('should be possible to add a variant', () => {
    const res1 = getVariantCombinations([
      { sliceName: Slices.Radius, variants: { XL: 10 }, styleKey: 'cornerRadius' },
      { sliceName: Slices.BorderWidth, variants: { X: 1, Y: 2 }, styleKey: 'strokeWeight' },
    ]);

    const res2 = getVariantCombinations([
      { sliceName: Slices.Radius, variants: { S: 1, M: 2, L: 3, XL: 10 }, styleKey: 'cornerRadius' },
      { sliceName: Slices.BorderWidth, variants: { Z: 4 }, styleKey: 'strokeWeight' },
    ]);

    const result = [...res1, ...res2];

    expect(result).toEqual([
      expect.objectContaining({ name: 'Radius=XL, Border width=X', cornerRadius: 10, strokeWeight: 1 }),
      expect.objectContaining({ name: 'Radius=XL, Border width=Y', cornerRadius: 10, strokeWeight: 2 }),

      expect.objectContaining({ name: 'Radius=S, Border width=Z', cornerRadius: 1, strokeWeight: 4 }),
      expect.objectContaining({ name: 'Radius=M, Border width=Z', cornerRadius: 2, strokeWeight: 4 }),
      expect.objectContaining({ name: 'Radius=L, Border width=Z', cornerRadius: 3, strokeWeight: 4 }),
      expect.objectContaining({ name: 'Radius=XL, Border width=Z', cornerRadius: 10, strokeWeight: 4 }),
    ]);
  });
});

describe('createInstances', () => {
  it('should return expected refs', () => {
    const combinations = [
      { name: 'Radius=S, Border width=X', cornerRadius: 1, strokeWeight: 1, ciao: 1 },
      { name: 'Radius=S, Border width=X', cornerRadius: 1, strokeWeight: 1, ciao: 2 },
      { name: 'Radius=S, Border width=Y', cornerRadius: 1, strokeWeight: 2, ciao: 1 },
      { name: 'Radius=S, Border width=Y', cornerRadius: 1, strokeWeight: 2, ciao: 2 },
    ];

    const { instances, refIds } = createBoxInstances(combinations as any);

    expect(refIds).toEqual({
      Radius: {
        S: `${instances[0].id}/#/${instances[1].id}/#/${instances[2].id}/#/${instances[3].id}`,
      },
      'Border width': {
        X: `${instances[0].id}/#/${instances[1].id}`,
        Y: `${instances[2].id}/#/${instances[3].id}`,
      },
    });
  });
});

describe('updateVariantName', () => {
  it('should replace the variant name for the provided slice, without mutating the input', () => {
    const oldName = `${Slices.Radius}=S, ${Slices.BorderWidth}=F`;
    const newName = updateVariantName({ instanceName: oldName, sliceName: Slices.Radius, newVariantName: 'A' });
    const newName2 = updateVariantName({
      instanceName: oldName,
      sliceName: Slices.BorderWidth,
      newVariantName: 'none',
    });

    const expectedName = `${Slices.Radius}=A, ${Slices.BorderWidth}=F`;
    const expectedName2 = `${Slices.Radius}=S, ${Slices.BorderWidth}=none`;

    expect(newName).toBe(expectedName);
    expect(newName2).toBe(expectedName2);
  });
});

describe('setRefs', () => {
  it('should call setSharedPluginData on slices with expected params', () => {
    const mockSetSharedPluginData = jest.fn();
    const slices = [
      { name: 'S', id: '123:11', setSharedPluginData: mockSetSharedPluginData },
      { name: 'M', id: '333:11', setSharedPluginData: mockSetSharedPluginData },
    ] as unknown as readonly SceneNode[];
    const refIds: Record<string, string> = { S: '444:32/#/222:12' };
    setRefs({ slices, refIds });

    expect(mockSetSharedPluginData).toBeCalledTimes(1);
    expect(mockSetSharedPluginData).toBeCalledWith(PLUGIN_DATA_NAMESPACE, '123:11', '444:32/#/222:12');
  });
});

describe('deleteNodesById', () => {
  it('should not crash if getNodeById returns null', () => {
    mockGetNodeById.mockReturnValue(null);
    deleteNodesById(['11:22', '22:33']);
  });
  it('should call remove for each node with provided id', () => {
    const mockRemove = jest.fn();
    mockGetNodeById.mockReturnValue({ remove: mockRemove });

    deleteNodesById(['11:22', '22:33']);

    expect(mockRemove).toBeCalledTimes(2);
    expect(mockGetNodeById).toBeCalledWith('11:22');
    expect(mockGetNodeById).toBeCalledWith('22:33');
  });
});

describe('saveCurrentBoxVariants', () => {
  it('should call setSharedPluginData with expected params', () => {
    const themePage = mockNode<PageNode>();
    const refIds = { S: '11:11/#/22:22', M: '33:33/#/44:44' };
    saveCurrentBoxVariants({ themePage, pluginKey: PluginDataKeys.currentRadiiVariants, refIds });

    expect(themePage.setSharedPluginData).toBeCalledWith(
      PLUGIN_DATA_NAMESPACE,
      PluginDataKeys.currentRadiiVariants,
      JSON.stringify(refIds)
    );
  });
});

describe('sortValues', () => {
  it('should sort values as expected', () => {
    const res = sortValues([12, 'auto', 1, 4, 0]);
    expect(res).toEqual(['auto', 0, 1, 4, 12]);
  });
});

describe('parseTextStyles', () => {
  it('should return parsed styles as expected', () => {
    mockCreateText.mockReturnValueOnce({ fontWeight: 400, remove: jest.fn() });
    mockCreateText.mockReturnValue({ fontWeight: 800, remove: jest.fn() });

    const input = [
      {
        fontSize: 16,
        fontName: { family: 'Inter', style: 'Bold' },
        letterSpacing: { unit: 'PIXELS', value: 10 },
        lineHeight: { unit: 'PIXELS', value: 10 },
      },
      {
        fontSize: 16,
        fontName: { family: 'Inter', style: 'Regular' },
        letterSpacing: { unit: 'PIXELS', value: 10 },
        lineHeight: { unit: 'AUTO' },
      },
      {
        fontSize: 14,
        fontName: { family: 'Inter', style: 'Regular' },
        letterSpacing: { unit: 'PERCENT', value: 5 },
        lineHeight: { unit: 'AUTO' },
      },
      {
        fontSize: 14,
        fontName: { family: 'Inter', style: 'Regular' },
        letterSpacing: { unit: 'PERCENT', value: 0 },
        lineHeight: { unit: 'AUTO' },
      },
      {
        fontSize: 14,
        fontName: { family: 'Inter', style: 'Regular' },
        letterSpacing: { unit: 'PERCENT', value: 0 },
        lineHeight: { unit: 'PERCENT', value: 3 },
      },
    ] as TextStyle[];

    const result = parseTextStyles(input);

    expect(result).toEqual({
      [Slices.Fonts]: [
        { family: 'Inter', style: 'Bold' },
        { family: 'Inter', style: 'Regular' },
      ],
      [Slices.FontSizes]: { absolute: { xs: 14, s: 16 } },
      [Slices.FontWeights]: { absolute: { xs: 400, s: 800 } },
      [Slices.LetterSpacings]: {
        absolute: {
          xs: 10,
        },
        relative: {
          none: 0,
          sRelative: 5,
        },
      },
      [Slices.LineHeights]: {
        absolute: {
          xs: 10,
        },
        relative: {
          auto: 'auto',
          sRelative: 3,
        },
      },
    });
  });
});

describe('generateTextSlices', () => {
  it('should call getNewFrame for each variant', () => {
    generateTextSlices({
      [Slices.LineHeights]: {
        absolute: { xs: 10 },
        relative: { sRelative: 4 },
      },
      [Slices.Fonts]: [],
      [Slices.FontSizes]: { absolute: {} },
      [Slices.FontWeights]: { absolute: {} },
      [Slices.LetterSpacings]: { absolute: {} },
    });

    expect(mockCreateText).toBeCalled();
  });
});
