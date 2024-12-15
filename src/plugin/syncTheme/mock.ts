import * as SyncUtils from './utils';
import * as GlobalUtils from '../utils/utils';
import { mockNode } from '../../../__mocks__/mockUtils';
import { SliceFrameNames, THEME_PAGE_NAME } from '../../_shared/constants';
import { mockGetNodeById } from '../../../__mocks__/figmaMock';

export const mockRadiiCombinations = [
  { name: 'Radius=XL, Border width=X', cornerRadius: 10, strokeWeight: 1 },
  { name: 'Radius=XL, Border width=Y', cornerRadius: 10, strokeWeight: 2 },
];

export const mockBorderWidthCombinations = [
  { name: 'Radius=S, Border width=Z', cornerRadius: 1, strokeWeight: 4 },
  { name: 'Radius=M, Border width=Z', cornerRadius: 2, strokeWeight: 4 },
];

export const mockFindOne = jest.fn(() => ({
  name: SliceFrameNames.BorderWidth,
  type: 'FRAME',
  children: {
    type: 'FRAME',
    name: 'Box',
    children: [],
  },
}));

export const spyCreateInstance = jest.spyOn(GlobalUtils, 'createBoxInstances');
export const mockAppendChild = jest.fn();

export const mockDefaultPage = mockNode({
  name: THEME_PAGE_NAME,
  findOne: mockFindOne as any,
  getSharedPluginData: jest.fn(() => '123'),
  setSharedPluginData: jest.fn(),
});

export function mockSyncTheme() {
  jest.spyOn(SyncUtils, 'syncBorderWidthVariants').mockReturnValue({
    existentBorderWidthSlices: {},
    newBorderWidthSlices: {},
  });

  jest
    .spyOn(GlobalUtils, 'getVariantCombinations')
    .mockReturnValueOnce(mockRadiiCombinations)
    .mockReturnValueOnce(mockBorderWidthCombinations);

  jest.spyOn(GlobalUtils, 'setRefs').mockImplementation(jest.fn());
  jest.spyOn(SyncUtils, 'syncRadiiVariants').mockReturnValue({ existentRadiusSlices: {}, newRadiusSlices: {} });

  jest
    .spyOn(SyncUtils, 'syncBorderWidthVariants')
    .mockReturnValue({ existentBorderWidthSlices: {}, newBorderWidthSlices: {} });

  mockGetNodeById.mockReturnValue({ type: 'COMPONENT_SET', appendChild: mockAppendChild });
}
