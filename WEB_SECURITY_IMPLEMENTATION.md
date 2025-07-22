# Web Security Implementation Plan

## Overview

This document provides detailed implementation steps for securing the web-based MapLibre mapping application against common web vulnerabilities and protecting intellectual property.

## Phase 1: Critical Security Fixes (Week 1-2)

### 1. API Key Security

**Current Vulnerabilities:**
- MapTiler API Key: `ldV32HV5eBdmgfE7vZJI`
- ClockworkMicro API Key: `9G4F5b99xO28esL8tArIO2Bbp8sGhURW5qIieYTy`
- Google Maps API Key: `AIzaSyAkLRqGt0fFyaJMkDS1UyRt8j6M4XAQuog`
- OS UK API Key: `dclksBdD441tZWuokDrxjRsw7Syr4nRS`

**Implementation Steps:**

1. **Move API Keys to Environment Variables**
```bash
# Add to Vercel dashboard
MAPTILER_API_KEY=ldV32HV5eBdmgfE7vZJI
CLOCKWORK_API_KEY=9G4F5b99xO28esL8tArIO2Bbp8sGhURW5qIieYTy
GOOGLE_MAPS_API_KEY=AIzaSyAkLRqGt0fFyaJMkDS1UyRt8j6M4XAQuog
OS_UK_API_KEY=dclksBdD441tZWuokDrxjRsw7Syr4nRS
```

2. **Create API Proxy Endpoint**
```javascript
// /api/config.js
export default function handler(req, res) {
  const config = {
    maptilerKey: process.env.MAPTILER_API_KEY,
    clockworkKey: process.env.CLOCKWORK_API_KEY,
    googleMapsKey: process.env.GOOGLE_MAPS_API_KEY,
    osUkKey: process.env.OS_UK_API_KEY
  };
  
  res.status(200).json(config);
}
```

3. **Update Client-Side Code**
```javascript
// Replace hardcoded keys with API calls
async function loadConfig() {
  const response = await fetch('/api/config');
  const config = await response.json();
  return config;
}
```

### 2. XSS Prevention

**Vulnerable Files:**
- `src/ui/app.ui.featureselector.js:245,338,357`
- `src/commandline/commandline-interface.js:65,568,1034,3713,3937`

**Implementation Steps:**

1. **Replace innerHTML with Safe DOM Manipulation**
```javascript
// Before (vulnerable)
element.innerHTML = userInput;

// After (secure)
element.textContent = userInput;
// or
const sanitized = DOMPurify.sanitize(userInput);
element.innerHTML = sanitized;
```

2. **Add DOMPurify Library**
```html
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.5/dist/purify.min.js"></script>
```

3. **Create Safe HTML Helper**
```javascript
App.Utils.SafeHTML = {
  sanitize: function(html) {
    if (typeof DOMPurify !== 'undefined') {
      return DOMPurify.sanitize(html);
    }
    // Fallback: escape HTML
    return html.replace(/[<>&"']/g, function(char) {
      const escapeMap = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      return escapeMap[char];
    });
  }
};
```

### 3. Code Injection Prevention

**Vulnerable Files:**
- Command line interface with `eval()` usage

**Implementation Steps:**

1. **Replace eval() with Safe Alternatives**
```javascript
// Before (vulnerable)
eval(userCode);

// After (secure)
const safeFunction = new Function('return ' + userCode);
try {
  const result = safeFunction();
  return result;
} catch (error) {
  console.error('Code execution failed:', error);
  return null;
}
```

2. **Implement Command Whitelist**
```javascript
const allowedCommands = ['help', 'clear', 'status', 'version'];
function executeCommand(command) {
  if (allowedCommands.includes(command)) {
    return commandHandlers[command]();
  }
  throw new Error('Command not allowed');
}
```

## Phase 2: Advanced Security (Week 2-4)

### 1. Content Security Policy

**Implementation:**
```javascript
// Add to index.html or server headers
const csp = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    "https://unpkg.com",
    "https://cdn.jsdelivr.net",
    "https://cdnjs.cloudflare.com"
  ],
  "style-src": ["'self'", "'unsafe-inline'"],
  "connect-src": [
    "'self'",
    "https://api.maptiler.com",
    "https://tile.openstreetmap.org",
    "https://maps.googleapis.com"
  ],
  "img-src": ["'self'", "data:", "https:"],
  "font-src": ["'self'", "https://fonts.gstatic.com"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "frame-ancestors": ["'none'"]
};
```

### 2. Input Validation Framework

**Implementation:**
```javascript
App.Security.Validator = {
  validateCoordinates: function(lat, lng) {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    
    if (isNaN(latNum) || isNaN(lngNum)) {
      throw new Error('Invalid coordinates');
    }
    
    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      throw new Error('Coordinates out of bounds');
    }
    
    return { lat: latNum, lng: lngNum };
  },
  
  validateZoom: function(zoom) {
    const zoomNum = parseInt(zoom);
    if (isNaN(zoomNum) || zoomNum < 0 || zoomNum > 22) {
      throw new Error('Invalid zoom level');
    }
    return zoomNum;
  }
};
```

### 3. Authentication System

**Implementation:**
```javascript
App.Auth = {
  login: async function(credentials) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    if (response.ok) {
      const { token } = await response.json();
      localStorage.setItem('authToken', token);
      return true;
    }
    return false;
  },
  
  isAuthenticated: function() {
    const token = localStorage.getItem('authToken');
    return token && !this.isTokenExpired(token);
  },
  
  logout: function() {
    localStorage.removeItem('authToken');
    window.location.reload();
  }
};
```

## Phase 3: IP Protection (Week 4-8)

### 1. Code Obfuscation

**Build Pipeline Setup:**
```javascript
// webpack.config.js
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: {
            properties: {
              regex: /^_/
            }
          },
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        }
      })
    ]
  }
};
```

### 2. Feature Licensing

**Implementation:**
```javascript
App.License = {
  checkFeature: function(featureName) {
    const license = this.getLicense();
    return license.features.includes(featureName);
  },
  
  enableFeature: function(featureName) {
    if (!this.checkFeature(featureName)) {
      throw new Error('Feature not licensed');
    }
    return true;
  }
};
```

### 3. Server-Side Algorithm Protection

**Move Critical Functions to API:**
```javascript
// /api/stakeout/calculate.js
export default async function handler(req, res) {
  // Verify authentication
  if (!verifyToken(req.headers.authorization)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Perform calculation server-side
  const result = performStakeoutCalculation(req.body);
  res.json({ result });
}
```

## Security Testing

### 1. Vulnerability Scanning
```bash
# Run security audit
npm audit

# Check for known vulnerabilities
npx retire .

# Static analysis
npx eslint --ext .js src/
```

### 2. Manual Testing Checklist
- [ ] Test XSS prevention in all input fields
- [ ] Verify API key security
- [ ] Test authentication bypass attempts
- [ ] Validate input sanitization
- [ ] Check CSP enforcement
- [ ] Test code injection prevention

## Monitoring and Maintenance

### 1. Security Logging
```javascript
App.Security.Logger = {
  logSecurityEvent: function(event, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: event,
      details: details,
      userAgent: navigator.userAgent,
      ip: this.getClientIP()
    };
    
    // Send to monitoring service
    fetch('/api/security/log', {
      method: 'POST',
      body: JSON.stringify(logEntry)
    });
  }
};
```

### 2. Regular Security Updates
- Monthly dependency updates
- Quarterly security reviews
- Annual penetration testing
- Continuous vulnerability monitoring

---

*This implementation plan provides step-by-step security hardening for the web-based mapping application.*