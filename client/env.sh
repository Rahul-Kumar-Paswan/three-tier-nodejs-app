#!/bin/sh
# /docker-entrypoint.d/env.sh

echo "window._env_ = {" > /usr/share/nginx/html/env-config.js
echo "  API_URL: \"${API_URL}\"" >> /usr/share/nginx/html/env-config.js
echo "}" >> /usr/share/nginx/html/env-config.js

echo "✅ Environment variables injected into env-config.js"
