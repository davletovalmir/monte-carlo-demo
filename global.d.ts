interface Set {
  difference<T>(other: Set<T>): Set<T>;
  intersection<T>(other: Set<T>): Set<T>;
  isDisjointFrom<T>(other: Set<T>): boolean;
  isSubsetOf<T>(other: Set<T>): boolean;
  isSupersetOf<T>(other: Set<T>): boolean;
  symmetricDifference<T>(other: Set<T>): Set<T>;
  union<T>(other: Set<T>): Set<T>;
}

interface ObjectConstructor {
  groupBy<Item, Key extends PropertyKey>(
    items: Iterable<Item>,
    keySelector: (item: Item, index: number) => Key,
  ): Record<Key, Item[]>;
}

interface MapConstructor {
  groupBy<Item, Key>(
    items: Iterable<Item>,
    keySelector: (item: Item, index: number) => Key,
  ): Map<Key, Item[]>;
}

interface Array<T> {
  toSorted(compareFn?: (a: T, b: T) => number): T[];
}
