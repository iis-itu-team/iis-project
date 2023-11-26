export const getLastUsedUid = () => {
    return window.localStorage.getItem('iisoc-last-used-uid');
}

export const setLastUsedUid = (uid: string) => {
    window.localStorage.setItem('iisoc-last-used-uid', uid);
}
