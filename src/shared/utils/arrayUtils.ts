export const insertAtIndex = (index: number, value: any, array: []) => {
  const [first, last] = [array.slice(0, index), array.slice(index)];

  return [...first, value, ...last];
};
