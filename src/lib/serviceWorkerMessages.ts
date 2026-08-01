/*
 * Shared by the page and the service worker, so it deliberately imports
 * nothing — anything pulled in here would end up in the service worker bundle.
 */
export const skipWaitingMessage = 'skip-waiting';
