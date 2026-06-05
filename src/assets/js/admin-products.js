(function(){
  const DATA_PATH = '../assets/data/products.json';
  const STORAGE_KEY = 'shree_products_overrides';
  const SETTINGS_KEY = 'shree_products_settings';
  let adminInitialized = false;

  // Configure one of these for cloud uploads.
  // Leave blank to keep uploads local (admin will need to copy files manually).
  let IMGBB_API_KEY = ''; // get a free key from https://imgbb.com/
  let CLOUDINARY_UPLOAD_URL = ''; // e.g. https://api.cloudinary.com/v1_1/<cloudName>/image/upload
  let CLOUDINARY_UPLOAD_PRESET = ''; // unsigned preset name for Cloudinary
  // Optionally override values at runtime from a non-committed file `src/assets/js/secrets.js`.
  // Create `secrets.js` with: window.SHREE_CONFIG = { IMGBB_API_KEY: '...', CLOUDINARY: { url: '...', preset: '...' } }
  if (typeof window !== 'undefined' && window.SHREE_CONFIG) {
    if (window.SHREE_CONFIG.IMGBB_API_KEY) IMGBB_API_KEY = window.SHREE_CONFIG.IMGBB_API_KEY;
    if (window.SHREE_CONFIG.CLOUDINARY) {
      CLOUDINARY_UPLOAD_URL = window.SHREE_CONFIG.CLOUDINARY.url || CLOUDINARY_UPLOAD_URL;
      CLOUDINARY_UPLOAD_PRESET = window.SHREE_CONFIG.CLOUDINARY.preset || CLOUDINARY_UPLOAD_PRESET;
    }
  }
  // Supabase runtime config (optional)
  let SUPABASE_URL = '';
  let SUPABASE_ANON_KEY = '';
  let SUPABASE_BUCKET = '';
  let supabaseClient = null;
  function loadRuntimeSecrets(){
    try{
      if(typeof window !== 'undefined' && window.SHREE_CONFIG){
        if(window.SHREE_CONFIG.IMGBB_API_KEY) IMGBB_API_KEY = window.SHREE_CONFIG.IMGBB_API_KEY;
        if(window.SHREE_CONFIG.CLOUDINARY){
          CLOUDINARY_UPLOAD_URL = window.SHREE_CONFIG.CLOUDINARY.url || CLOUDINARY_UPLOAD_URL;
          CLOUDINARY_UPLOAD_PRESET = window.SHREE_CONFIG.CLOUDINARY.preset || CLOUDINARY_UPLOAD_PRESET;
        }
        if(window.SHREE_CONFIG.SUPABASE){
          SUPABASE_URL = window.SHREE_CONFIG.SUPABASE.url || SUPABASE_URL;
          SUPABASE_ANON_KEY = window.SHREE_CONFIG.SUPABASE.anonKey || SUPABASE_ANON_KEY;
          SUPABASE_BUCKET = window.SHREE_CONFIG.SUPABASE.bucket || SUPABASE_BUCKET;
        }
      }
    }catch(e){ /* ignore */ }
  }

  function initSupabaseClient(){
    try{
      if(supabaseClient) return;
      if(SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase && window.supabase.createClient){
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      }
    }catch(e){ console.warn('Supabase init failed', e); }
  }

  let baseData = {};
  let overrides = {};

  function qs(id){ return document.getElementById(id); }

  async function getSupabaseSession(){
    initSupabaseClient();
    if(!supabaseClient || !supabaseClient.auth) return null;
    if(typeof supabaseClient.auth.getSession === 'function'){
      const { data, error } = await supabaseClient.auth.getSession();
      if(error) return null;
      return data?.session || null;
    }
    if(typeof supabaseClient.auth.session === 'function'){
      return supabaseClient.auth.session();
    }
    return null;
  }

  async function isAuthenticated(){
    const session = await getSupabaseSession();
    return Boolean(session);
  }

  function showAdminContent(){
    const content = qs('adminContent'); if(content) content.style.display = '';
  }

  function hideAdminContent(){
    const content = qs('adminContent'); if(content) content.style.display = 'none';
  }

  function showAuthOverlay(){
    const overlay = qs('authOverlay'); if(!overlay) return;
    try{
      overlay.style.setProperty('display', 'flex', 'important');
      overlay.style.setProperty('visibility', 'visible', 'important');
      overlay.style.setProperty('opacity', '1', 'important');
    }catch(e){ overlay.style.display = 'flex'; }
    hideAdminContent();
    const emailInput = qs('adminEmailInput');
    if(emailInput){ setTimeout(()=>{ try{ emailInput.focus(); }catch(e){} }, 50); }
    try{ document.body.style.setProperty('overflow', 'hidden', 'important'); }catch(e){ document.body.style.overflow = 'hidden'; }
  }

  function hideAuthOverlay(){
    const overlay = qs('authOverlay'); if(!overlay) return;
    try{ overlay.style.setProperty('display', 'none', 'important'); }catch(e){ overlay.style.display = 'none'; }
    showAdminContent();
    try{ document.body.style.setProperty('overflow', '', 'important'); }catch(e){ document.body.style.overflow = ''; }
  }

  // Periodic and navigation checks to prevent bypassing the auth overlay.
  async function checkAuthAndEnforce(){
    try{
      loadRuntimeSecrets(); initSupabaseClient();
      if(!qs('authOverlay')) createAuthOverlayFallback();
      const valid = await isAuthenticated();
      if(valid){ hideAuthOverlay(); setLogoutVisible(true); if(!adminInitialized){ await init(); adminInitialized = true; } }
      else { showAuthOverlay(); setLogoutVisible(false); }
    }catch(e){ showAuthOverlay(); setLogoutVisible(false); }
  }

  function setLogoutVisible(val){
    const btn = qs('adminLogoutBtn'); if(btn) btn.style.display = val ? '' : 'none';
  }

  async function attemptLogin(email, password){
    loadRuntimeSecrets();
    initSupabaseClient();
    if(!supabaseClient){
      showAdminAlert('Supabase is not configured yet. Add SUPABASE.url and SUPABASE.anonKey in src/assets/js/secrets.js.', 'danger', 0);
      return false;
    }
    if(!email || !password){
      showAdminAlert('Enter both email and password.', 'warning', 4000);
      return false;
    }
    let result;
    if(typeof supabaseClient.auth.signInWithPassword === 'function'){
      result = await supabaseClient.auth.signInWithPassword({ email, password });
    } else if(typeof supabaseClient.auth.signIn === 'function'){
      result = await supabaseClient.auth.signIn({ email, password });
    } else {
      showAdminAlert('Supabase auth method unsupported by this client version.', 'danger', 0);
      return false;
    }
    const { data, error } = result;
    if(error){
      console.error('Supabase login error', error);
      showAdminAlert('Login failed. Check credentials and try again.', 'danger', 5000);
      return false;
    }
    const session = data?.session || data?.user ? data : null;
    if(session){
      hideAuthOverlay(); setLogoutVisible(true);
      showAdminAlert('Logged in successfully as ' + email, 'success', 5000);
      init();
      return true;
    }
    showAdminAlert('Login failed. Check credentials.', 'danger', 5000);
    return false;
  }

  function setupAuthHandlers(){
    const loginBtn = qs('adminLoginBtn'); const emailInput = qs('adminEmailInput'); const pw = qs('adminPasswordInput'); const logout = qs('adminLogoutBtn');
    if(loginBtn) loginBtn.addEventListener('click', (e)=>{ try{ e.preventDefault(); console.log('adminLoginBtn clicked'); if(!emailInput || !pw){ console.warn('Login inputs not found'); createAuthOverlayFallback(); return; } attemptLogin(emailInput.value, pw.value); }catch(err){ console.error(err); } });
    if(pw) pw.addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ try{ console.log('Enter pressed in password field'); if(!emailInput) { createAuthOverlayFallback(); return; } attemptLogin(emailInput.value, pw.value); }catch(err){ console.error(err); } } });
    if(logout) logout.addEventListener('click', async ()=>{ try{ if(supabaseClient && supabaseClient.auth && typeof supabaseClient.auth.signOut === 'function'){ await supabaseClient.auth.signOut(); } setLogoutVisible(false); showAuthOverlay(); showAdminAlert('Logged out', 'info', 2000); }catch(e){ console.error('Logout failed', e); } });
  }

  async function init(){
    await loadBase();
    loadOverrides();
    populateCategorySelect();
    renderTable();
    initProductsPageToggle();

    qs('productForm').addEventListener('submit', onSave);
    qs('resetBtn').addEventListener('click', onReset);
  }

  async function loadBase(){
    try{
      const res = await fetch(DATA_PATH);
      baseData = await res.json();
    }catch(e){ console.error('Failed to load base data', e); baseData = {}; }
  }

  function loadOverrides(){
    try{ overrides = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }catch(e){ overrides = {}; }
  }

  function saveOverrides(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  }

  function loadSettings(){
    try{ return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') || {}; }catch(e){ return {}; }
  }

  function saveSettings(settings){
    try{ localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings || {})); }catch(e){}
  }

  function isProductsPageEnabled(){
    try{
      const settings = loadSettings();
      if(typeof settings.productsPageEnabled === 'boolean') return settings.productsPageEnabled;
    }catch(e){ }
    return true;
  }

  function setProductsPageEnabled(value){
    const settings = loadSettings();
    settings.productsPageEnabled = Boolean(value);
    saveSettings(settings);
  }

  function initProductsPageToggle(){
    const toggle = qs('productsPageToggle');
    if(!toggle) return;
    toggle.checked = isProductsPageEnabled();
    toggle.addEventListener('change', () => {
      setProductsPageEnabled(toggle.checked);
      showAdminAlert('Product Showcase redirect is now ' + (toggle.checked ? 'enabled' : 'disabled') + '.', 'success', 3000);
    });
  }

  function getMerged(){
    const merged = JSON.parse(JSON.stringify(baseData));
    for(const cat in overrides){
      merged[cat] = merged[cat] || { label: cat, products: [] };
      const map = {};
      (merged[cat].products || []).forEach(p => map[p.id] = p);
      (overrides[cat] || []).forEach(p => map[p.id] = p);
      merged[cat].products = Object.values(map);
    }
    return merged;
  }

  function populateCategorySelect(){
    const sel = qs('productCategory');
    sel.innerHTML = '';
    for(const key of Object.keys(getMerged())){
      const opt = document.createElement('option'); opt.value = key; opt.textContent = getMerged()[key].label || key; sel.appendChild(opt);
    }
  }

  function renderTable(){
    const tableWrap = qs('productsTable');
    const merged = getMerged();
    const table = document.createElement('table');
    table.className = 'table table-striped';

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['Category', 'Image', 'Title', 'Price', 'Stock', 'Actions'].forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    Object.keys(merged).forEach(cat => {
      (merged[cat].products || []).forEach(p => {
        const row = document.createElement('tr');

        const labelCell = document.createElement('td');
        labelCell.textContent = merged[cat].label || cat;
        row.appendChild(labelCell);

        const imageCell = document.createElement('td');
        const img = document.createElement('img');
        img.width = 80;
        img.src = p.image || '../assets/images/products/products-placeholder.png';
        img.onerror = function(){ this.onerror = null; this.src = '../assets/images/products/products-placeholder.png'; };
        imageCell.appendChild(img);
        row.appendChild(imageCell);

        const titleCell = document.createElement('td');
        titleCell.textContent = p.title || '';
        row.appendChild(titleCell);

        const priceCell = document.createElement('td');
        if(p.salePrice && p.salePrice < p.price){
          priceCell.textContent = `Rs. ${p.salePrice}  `;
          const oldPrice = document.createElement('small');
          oldPrice.className = 'text-muted';
          oldPrice.textContent = ` Rs. ${p.price}`;
          priceCell.appendChild(oldPrice);
        } else {
          priceCell.textContent = `Rs. ${p.price}`;
        }
        row.appendChild(priceCell);

        const stockCell = document.createElement('td');
        stockCell.textContent = p.stock || 0;
        if(p.stock !== undefined && p.stock <= 5) stockCell.className = 'text-danger';
        row.appendChild(stockCell);

        const actionCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'btn btn-sm btn-outline-primary me-2';
        editButton.dataset.act = 'edit';
        editButton.dataset.cat = cat;
        editButton.dataset.id = p.id;
        editButton.textContent = 'Edit';
        actionCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'btn btn-sm btn-outline-danger';
        deleteButton.dataset.act = 'del';
        deleteButton.dataset.cat = cat;
        deleteButton.dataset.id = p.id;
        deleteButton.textContent = 'Delete';
        actionCell.appendChild(deleteButton);

        row.appendChild(actionCell);
        tbody.appendChild(row);
      });
    });

    table.appendChild(tbody);
    tableWrap.innerHTML = '';
    tableWrap.appendChild(table);
    tableWrap.querySelectorAll('button[data-act]').forEach(btn => btn.addEventListener('click', onTableAction));
  }

  function extractFilename(path){
    if(!path) return '';
    const raw = path.split('/').pop().split('\\').pop();
    return raw.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  function onTableAction(e){
    const btn = e.currentTarget; const act = btn.dataset.act; const cat = btn.dataset.cat; const id = btn.dataset.id;
    if(act === 'edit'){
      const merged = getMerged();
      const prod = (merged[cat].products || []).find(x=>x.id===id);
      if(!prod) return alert('Product not found');
      qs('productId').value = prod.id;
      qs('productCategory').value = cat;
      qs('productTitle').value = prod.title;
      qs('productImageUrl').value = prod.image || '';
      qs('productImageFile').value = '';
      qs('productPrice').value = prod.price || 0;
      qs('productSale').value = prod.salePrice || '';
      qs('productStock').value = prod.stock || 0;
      qs('productDesc').value = prod.description || '';
      window.scrollTo({top:0, behavior:'smooth'});
    }else if(act === 'del'){
      if(!confirm('Delete this product?')) return;
      overrides[cat] = (overrides[cat] || []).filter(p=>p.id !== id);
      saveOverrides(); renderTable();
    }
  }

  function onReset(e){
    e.preventDefault(); qs('productForm').reset(); qs('productId').value = '';
  }

  function isCloudUploadConfigured(){
    loadRuntimeSecrets();
    initSupabaseClient();
    return Boolean(IMGBB_API_KEY || (CLOUDINARY_UPLOAD_URL && CLOUDINARY_UPLOAD_PRESET) || (supabaseClient && SUPABASE_BUCKET));
  }

  function showAdminAlert(message, type='warning', timeout=6000){
    try{
      const container = qs('adminAlerts');
      if(!container){
        console[type === 'danger' ? 'error' : 'warn'](message);
        return;
      }
      const div = document.createElement('div');
      div.className = `alert alert-${type} alert-dismissible fade show`;
      div.role = 'alert';
      div.textContent = message;
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'btn-close';
      closeBtn.dataset.bsDismiss = 'alert';
      closeBtn.setAttribute('aria-label', 'Close');
      div.appendChild(closeBtn);
      container.appendChild(div);
      if(timeout > 0) setTimeout(() => {
        try{
          if(div.parentNode) div.parentNode.removeChild(div);
        }catch(e){}
      }, timeout);
    }catch(e){ console.warn('showAdminAlert failed', e); }
  }

  // Ensure admin email/password inputs allow pasting and are focusable
  function enableInputPasting(){
    try{
      const ids = ['adminEmailInput','adminPasswordInput'];
      ids.forEach(id=>{
        const el = qs(id);
        if(!el) return;
        try{ el.readOnly = false; }catch(e){}
        try{ el.removeAttribute && el.removeAttribute('onpaste'); }catch(e){}
        // replace node to remove attached listeners that may block paste
        try{ const clone = el.cloneNode(true); el.parentNode.replaceChild(clone, el); }catch(e){}
      });
    }catch(e){ /* ignore */ }
  }

  // If overlay inputs are missing for any reason, build a minimal fallback overlay
  function createAuthOverlayFallback(){
    try{
      if(qs('adminEmailInput') && qs('adminPasswordInput')) return;
      // remove any existing overlay to avoid duplicates
      const existing = qs('authOverlay'); if(existing) existing.parentNode.removeChild(existing);
      const overlay = document.createElement('div');
      overlay.id = 'authOverlay';
      overlay.style.position = 'fixed'; overlay.style.top = '0'; overlay.style.left = '0'; overlay.style.width = '100%'; overlay.style.height = '100%';
      overlay.style.display = 'flex'; overlay.style.alignItems = 'center'; overlay.style.justifyContent = 'center';
      overlay.style.background = 'rgba(0,0,0,0.95)'; overlay.style.zIndex = '999999';

      const panel = document.createElement('div');
      panel.style.background = '#fff'; panel.style.padding = '22px'; panel.style.borderRadius = '8px'; panel.style.maxWidth = '420px'; panel.style.width = '92%'; panel.style.boxShadow = '0 8px 30px rgba(0,0,0,.35)'; panel.style.zIndex = '1000000';

      const h = document.createElement('h5'); h.textContent = 'Admin Login'; h.style.marginTop = '0'; panel.appendChild(h);
      const emailWrap = document.createElement('div'); emailWrap.style.margin = '8px 0';
      const email = document.createElement('input'); email.id = 'adminEmailInput'; email.type = 'email'; email.className = 'form-control'; email.placeholder = 'Admin email'; email.autocomplete = 'username'; email.style.background = '#fff'; email.style.color = '#222'; emailWrap.appendChild(email); panel.appendChild(emailWrap);
      const pwWrap = document.createElement('div'); pwWrap.style.margin = '8px 0';
      const pw = document.createElement('input'); pw.id = 'adminPasswordInput'; pw.type = 'password'; pw.className = 'form-control'; pw.placeholder = 'Admin password'; pw.autocomplete = 'current-password'; pw.style.background = '#fff'; pw.style.color = '#222'; pwWrap.appendChild(pw); panel.appendChild(pwWrap);
      const actions = document.createElement('div'); actions.style.display = 'flex'; actions.style.gap = '8px'; actions.style.marginTop = '10px';
      const loginBtn = document.createElement('button'); loginBtn.id = 'adminLoginBtn'; loginBtn.className = 'btn btn-primary'; loginBtn.textContent = 'Login'; actions.appendChild(loginBtn);
      panel.appendChild(actions);
      overlay.appendChild(panel);
      document.body.appendChild(overlay);
      enableInputPasting();
      // Note: don't bind handlers here; callers will bind after ensuring inputs are in place
      // show overlay explicitly
      showAuthOverlay();
    }catch(e){ console.warn('createAuthOverlayFallback failed', e); }
  }

  // Try to create overlay immediately in case DOMContentLoaded listeners didn't run yet
  try{ if(!qs('authOverlay')){ setTimeout(()=>{ try{ if(!qs('authOverlay')) createAuthOverlayFallback(); }catch(e){} }, 0); } }catch(e){}

  function updateUploadStatusBadge(){
    try{
      const el = document.getElementById('uploadStatusBadge');
      if(!el) return;
      if(isCloudUploadConfigured()){
        el.className = 'badge bg-success ms-2';
        el.textContent = 'Cloud upload configured';
      } else {
        el.className = 'badge bg-secondary ms-2';
        el.textContent = 'Cloud upload NOT configured';
      }
    }catch(e){ /* ignore */ }
  }

  async function onSave(e){
    e.preventDefault();
    loadRuntimeSecrets();
    const id = qs('productId').value || slugify(qs('productTitle').value || 'product');
    const cat = qs('productCategory').value;
    const imageFile = qs('productImageFile').files[0];
    const imageUrlValue = qs('productImageUrl').value.trim();
    let image = '';

    if(imageFile){
      if(isCloudUploadConfigured()){
        showAdminAlert('Uploading image to cloud storage...', 'info', 3000);
        try{
          image = await uploadImageFile(imageFile);
          showAdminAlert('Image uploaded successfully. Using URL: ' + image, 'success', 10000);
        }catch(err){
          showAdminAlert('Image upload failed: ' + err.message, 'danger', 10000);
          return;
        }
      } else {
          const filename = extractFilename(imageFile.name);
          image = '../assets/images/products/' + filename;
          console.warn('Cloud upload is not configured. Using local path for:', filename);
          showAdminAlert('Cloud upload is not configured. Using local path: ' + filename + '. To enable automatic uploads, add keys to src/assets/js/secrets.js or set IMGBB_API_KEY / CLOUDINARY_UPLOAD_URL & CLOUDINARY_UPLOAD_PRESET.', 'warning', 8000);
      }
    } else if(imageUrlValue){
      image = imageUrlValue.match(/^https?:\/\//i) ? imageUrlValue : '../assets/images/products/' + imageUrlValue;
    } else {
      image = '../assets/images/products/products-placeholder.png';
    }

    const item = {
      id,
      title: qs('productTitle').value,
      description: qs('productDesc').value,
      price: Number(qs('productPrice').value)||0,
      salePrice: qs('productSale').value ? Number(qs('productSale').value) : null,
      stock: Number(qs('productStock').value)||0,
      image
    };
    overrides[cat] = overrides[cat] || [];
    // replace or add
    overrides[cat] = overrides[cat].filter(p=>p.id !== id).concat([item]);
    saveOverrides(); renderTable(); qs('productForm').reset(); qs('productId').value = '';
  }

  function slugify(text){ return text.toString().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }

  function fileToBase64(file){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  }

  async function uploadImageFile(file){
    if(IMGBB_API_KEY){
      const base64 = await fileToBase64(file);
      const form = new FormData();
      form.append('key', IMGBB_API_KEY);
      form.append('image', base64.replace(/^data:.+;base64,/, ''));
      const res = await fetch('https://api.imgbb.com/1/upload', { method:'POST', body: form });
      const data = await res.json();
      if(!data.success) throw new Error(data.error?.message || 'ImgBB upload failed');
      return data.data.url;
    }
    if(CLOUDINARY_UPLOAD_URL && CLOUDINARY_UPLOAD_PRESET){
      const form = new FormData();
      form.append('file', file);
      form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(CLOUDINARY_UPLOAD_URL, { method:'POST', body: form });
      const data = await res.json();
      if(!data.secure_url) throw new Error(data.error?.message || 'Cloudinary upload failed');
      return data.secure_url;
    }
    // Supabase Storage
    initSupabaseClient();
    if(supabaseClient && SUPABASE_BUCKET){
      const filename = Date.now() + '-' + extractFilename(file.name);
      const path = 'uploads/' + filename;
      console.log('Supabase upload', { bucket: SUPABASE_BUCKET, path });
      const res = await supabaseClient.storage.from(SUPABASE_BUCKET).upload(path, file, { cacheControl: '3600', upsert: false });
      if(res.error){
        console.error('Supabase upload error', res.error);
        showAdminAlert('Supabase upload error: ' + (res.error.message || JSON.stringify(res.error)), 'danger', 10000);
        throw new Error(res.error.message || JSON.stringify(res.error));
      }
      // Construct canonical public URL for public buckets
      const publicUrl = SUPABASE_URL.replace(/\/$/, '') + '/storage/v1/object/public/' + SUPABASE_BUCKET + '/' + path.split('/').map(encodeURIComponent).join('/');
      console.log('Supabase upload succeeded, public URL:', publicUrl);
      showAdminAlert('Supabase upload succeeded. Public URL: ' + publicUrl, 'success', 10000);
      return publicUrl;
    }
    throw new Error('No cloud upload configured. Set IMGBB_API_KEY or CLOUDINARY_UPLOAD_URL/CLOUDINARY_UPLOAD_PRESET in admin-products.js.');
  }

  // init with Supabase auth
  document.addEventListener('DOMContentLoaded', async function(){
    loadRuntimeSecrets(); initSupabaseClient(); updateUploadStatusBadge();
    // enable pasting and create overlay first, then bind handlers to the current elements
    enableInputPasting(); createAuthOverlayFallback(); setupAuthHandlers();
    // Always enforce auth gate on load
    try{
      await checkAuthAndEnforce();
    }catch(e){ showAuthOverlay(); }

    // Monitor navigation and visibility to prevent bypass
    window.addEventListener('popstate', checkAuthAndEnforce);
    window.addEventListener('pageshow', event => { checkAuthAndEnforce(); });
    window.addEventListener('pagehide', () => { try{ showAuthOverlay(); }catch(e){} });
    document.addEventListener('visibilitychange', () => { if(!document.hidden) checkAuthAndEnforce(); });
    // Periodic session check
    setInterval(checkAuthAndEnforce, 30000);
  });
})();