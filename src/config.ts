/** App-wide configuration loaded from Vite environment variables. */

/** Base URL of the backend API. Falls back to the Vite dev proxy path. */
export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? '/api'

export const APP_NAME: string = import.meta.env.VITE_APP_NAME ?? 'HRMS'
