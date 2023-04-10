const shuffle = <T>(arr: T[]): T[] => {
  const shuffled = [...arr];
  return shuffled.sort(() => Math.random() - 0.5);
};

const choice = <T>(arr: T[]): T => {
  if (!arr.length) {
    throw new Error('Array is empty');
  }
  return arr[Math.floor(Math.random() * arr.length)] as T;
};

const sample = <T>(arr: T[], size: number): T[] => {
  if (size > arr.length) {
    throw new Error('Sample size is bigger than array length');
  }
  const shuffled = shuffle(arr);
  return shuffled.slice(0, size);
};

const random = {
  shuffle,
  choice,
  sample
};

export default random;
