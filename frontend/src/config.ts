export const apiURL =
    process.env.NODE_ENV === 'production'
        ? 'https://your-deployed-server-url.com'
        : 'http://localhost:3000'; // Local development server

export const DEFAULT_PROFILE_PICTURE = '/assets/profiles/default.png';
