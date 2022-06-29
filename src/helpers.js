function each(values, each = (value) => value) {
  values.forEach((value) => {
    try {
      each(value);
    } catch (e) {
      console.error(e);
    }
  });
}

export function makeQueue() {
  let next = new Set();
  let current = next;
  return {
    add: (fun) => void next.add(fun),
    delete: (fun) => void next.delete(fun),
    cancel: () => void (current = next = new Set()),
    flush() {
      if (current.size) {
        next = new Set();
        each(current, (fun) => fun() && next.add(fun));
        current = next;
      }
    }
  };
}
