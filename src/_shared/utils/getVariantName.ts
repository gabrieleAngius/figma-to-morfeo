const baseNames = ['xs', 's', 'm', 'l', 'xl'];
const namesLength = baseNames.length;
const lastNamesIndex = namesLength - 1;

export const getVariantName = (i: number) => {
  if (i > lastNamesIndex) {
    const prefixNumber = i - namesLength + 2;
    return `${prefixNumber}${baseNames[lastNamesIndex]}`;
  }
  return baseNames[i];
};
