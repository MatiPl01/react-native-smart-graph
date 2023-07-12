const shuffle = <T>(arr: Array<T>): Array<T> => {
  'worklet';
  const shuffled = [...arr];
  return shuffled.sort(() => Math.random() - 0.5);
};

const choice = <T>(arr: Array<T>): T => {
  'worklet';
  if (!arr.length) {
    throw new Error('Array is empty');
  }
  return arr[Math.floor(Math.random() * arr.length)] as T;
};

const sample = <T>(arr: Array<T>, size: number): Array<T> => {
  'worklet';
  if (size > arr.length) {
    throw new Error('Sample size is bigger than array length');
  }
  const shuffled = shuffle(arr);
  return shuffled.slice(0, size);
};

const random = {
  choice,
  sample,
  shuffle
};

export default random;
