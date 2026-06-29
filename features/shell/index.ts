/**
 * Public surface of the app-shell feature (authenticated chrome).
 * `AppShell` is the only piece the `(app)` layout mounts; the sidebar and profile
 * menu are composed internally.
 */
export { AppShell } from './components/app-shell'
export { NAV_ITEMS, APP_VERSION, type NavItem, type NavKey } from './config/shell'
