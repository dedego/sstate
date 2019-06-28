const get = (obj, key) => {
  try {
    return key.split(".").reduce((acc, curr) => acc[curr], obj);
  } catch (e) {
    return null;
  }
};
const set = (root, key, value) => {
  let obj = root;
  const keyParts = key.split(".");
  const length = keyParts.length;
  for (let i = 0; i < length - 1; i++) {
    const currentKey = keyParts[i];
    if (!obj[currentKey]) obj[currentKey] = {};
    obj = obj[currentKey];
  }
  obj[keyParts[length - 1]] = value;
  return Object.assign({}, root);
};
const unset = (obj, key) => {
  const keyParts = key.split(".");
  const length = keyParts.length;
  for (let i = 0; i < length - 1; i++) {
    const currentKey = keyParts[i];
    if (!obj[currentKey]) obj[currentKey] = {};
    obj = obj[currentKey];
  }
  delete obj[keyParts[length - 1]];
};

export { get, set, unset };
