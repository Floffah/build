export function canResolve(name: string) {
    try {
        require.resolve(name);
    } catch (_e) {
        return false;
    }
    return true;
}
