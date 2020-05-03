module.exports = (microseconds) => {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, microseconds);
}
