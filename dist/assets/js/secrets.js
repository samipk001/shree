// Local secrets file — DO NOT commit this file to source control.
// Copy this file from src/assets/js/secrets.example.js and fill in your own values.
window.SHREE_CONFIG = {
  IMGBB_API_KEY: '',
  CLOUDINARY: {
    url: '',
    preset: ''
  },
  SUPABASE: {
    url: '',
    anonKey: '',
    bucket: ''
  }
};

// Optional admin password protection (recommended):
// 1) Decide an admin password.
// 2) Generate its SHA-256 hex hash with tools/generate-password-hash.html.
// 3) Set ADMIN_PASSWORD_HASH here, e.g.:
// window.SHREE_CONFIG.ADMIN_PASSWORD_HASH = 'your_hash_here';
window.SHREE_CONFIG.ADMIN_PASSWORD_HASH = '';
