export const THEME_COOKIE = "zurag_theme";

/**
 * Runs in <head> before the page draws, so there is no white flash: the saved
 * choice ("light"/"dark"), otherwise the device's setting.
 */
export const themeScript = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(light|dark)/);var t=m?m[1]:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;}catch(e){}})();`;
