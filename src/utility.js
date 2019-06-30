const uuid = () => '_' + Math.random().toString(36).substr(2, 9);
const get = (obj, key) => {
  try {
    return key.split(".").reduce((acc, curr) => acc[curr], obj);
  } catch (e) {
    return undefined;
  }
};
const setUnset = (root, key, value) => {
  let obj = root;
  const keyParts = key.split(".");
  const length = keyParts.length;
  for (let i = 0; i < length - 1; i++) {
    const currentKey = keyParts[i];
    if (!obj[currentKey]) obj[currentKey] = {};
    obj = obj[currentKey];
  }
  if (value) {
    obj[keyParts[length - 1]] = value;
  } else {
    delete obj[keyParts[length - 1]];
  }
  return Object.assign({}, root);
};
const set = (root, key, value) => setUnset(root, key, value);
const unset = (root, key) => setUnset(root, key);

export { uuid, get, set, unset };
