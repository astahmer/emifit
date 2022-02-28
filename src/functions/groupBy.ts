export function groupBy<Item = any>(array: Item[], keyOrGetter: keyof Item | ((item: Item) => string | number)) {
    let kv;
    return array.reduce((r, a) => {
        kv = typeof keyOrGetter === "function" ? keyOrGetter(a) : a[keyOrGetter];
        r[kv] = [...(r[kv] || []), a];
        return r;
    }, {} as Record<string | number, Item[]>);
}
