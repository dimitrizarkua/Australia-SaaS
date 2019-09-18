export function mergeArraysByIndex(arr1: Array<{}>, arr2: Array<{}>): any[] {
  const resLength = Math.max(arr1.length, arr2.length);
  return Array(resLength)
    .fill(0)
    .map((e, i) => {
      const cPeriod = arr2[i] || {};
      const pPeriod = arr1[i] || {};
      return {...cPeriod, ...pPeriod};
    });
}
