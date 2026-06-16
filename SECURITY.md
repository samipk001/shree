## Admin protection and server-side recommendations

These are recommended server-side protections — `robots.txt` and `noindex` are advisory only.

1) Remove admin pages from public builds

 - Ensure build scripts do not copy `src/html/admin.html` into production `dist/`.

2) Nginx example (basic auth)

```
location /html/admin.html {
  auth_basic "Restricted";
  auth_basic_user_file /etc/nginx/.htpasswd;
}
```

3) Apache `.htaccess` example

```
<Files "admin.html">
  AuthType Basic
  AuthName "Restricted Area"
  AuthUserFile /path/to/.htpasswd
  Require valid-user
</Files>
```

4) IP allowlist (Nginx)

```
location /html/admin.html {
  allow 203.0.113.4; # replace with your IP
  deny all;
}
```

5) Move admin UI behind an authenticated web app (recommended): implement server-side session checks and only serve admin UI after login.
