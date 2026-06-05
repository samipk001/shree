// Copy this file to `src/assets/js/secrets.js` and fill the values.
// DO NOT commit `secrets.js` to version control — add it to .gitignore.

window.SHREE_CONFIG = {
  // Example: IMGBB_API_KEY: 'your_imgbb_api_key_here'
  IMGBB_API_KEY: '',
  CLOUDINARY: {
    // CLOUDINARY.url should be like: 'https://api.cloudinary.com/v1_1/<your-cloud-name>/image/upload'
    url: '',
    // CLOUDINARY.upload preset name (unsigned preset) if using unsigned uploads
    preset: ''
  }
  ,
  SUPABASE: {
    // Create a free project at https://app.supabase.com/ and copy the Project URL and anon key here.
    url: '',
    anonKey: '',
    // Bucket name to use for uploads (create a public bucket in Supabase Storage)
    bucket: ''
  }
};

// Optional admin password protection (recommended):
// 1) Decide an admin password (e.g. "s3cret").
// 2) Generate its SHA-256 hex hash (tools/generate-password-hash.html helps).
// 3) Set the hash here as ADMIN_PASSWORD_HASH.
// Example: ADMIN_PASSWORD_HASH: 'e3b0c44298fc1c149afbf4c8996fb924...'
window.SHREE_CONFIG.ADMIN_PASSWORD_HASH = '';
