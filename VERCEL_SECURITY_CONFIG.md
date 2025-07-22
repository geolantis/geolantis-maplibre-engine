# Vercel Security Configuration

## Overview

This document provides specific security configurations for deploying the MapLibre mapping application on Vercel, including security headers, environment variables, and deployment settings.

## Vercel Configuration Files

### 1. Security Headers Configuration

**vercel.json - Complete Security Configuration:**
```json
{
  "version": 2,
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), camera=(), microphone=(), payment=(), usb=(), vr=(), accelerometer=(), gyroscope=(), magnetometer=(), midi=()"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://code.jquery.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.maptiler.com https://tile.openstreetmap.org https://maps.googleapis.com https://api.os.uk https://clockworkmicro.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://your-domain.vercel.app"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization, X-API-Key"
        },
        {
          "key": "Access-Control-Max-Age",
          "value": "86400"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "header",
          "key": "x-forwarded-proto",
          "value": "http"
        }
      ],
      "destination": "https://your-domain.vercel.app/$1",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/api/config",
      "destination": "/api/secure-config"
    }
  ]
}
```

### 2. Environment Variables Configuration

**Required Environment Variables (Set in Vercel Dashboard):**
```bash
# API Keys (Move from source code)
MAPTILER_API_KEY=ldV32HV5eBdmgfE7vZJI
CLOCKWORK_API_KEY=9G4F5b99xO28esL8tArIO2Bbp8sGhURW5qIieYTy
GOOGLE_MAPS_API_KEY=AIzaSyAkLRqGt0fFyaJMkDS1UyRt8j6M4XAQuog
OS_UK_API_KEY=dclksBdD441tZWuokDrxjRsw7Syr4nRS

# Security Configuration
JWT_SECRET=your-jwt-secret-key-here
ENCRYPTION_KEY=your-encryption-key-here
API_RATE_LIMIT=100
SESSION_TIMEOUT=3600

# License Management
LICENSE_SERVER_URL=https://license.yourcompany.com
LICENSE_API_KEY=your-license-api-key

# IP Protection
OBFUSCATION_LEVEL=high
WATERMARK_KEY=your-watermark-key
MONITORING_ENDPOINT=https://monitor.yourcompany.com

# Database (if using)
DATABASE_URL=postgresql://username:password@host:port/database
REDIS_URL=redis://username:password@host:port
```

## API Security Implementation

### 1. Secure Configuration API

**api/secure-config.js:**
```javascript
// Secure API configuration endpoint
export default async function handler(req, res) {
    // Verify request origin
    const origin = req.headers.origin;
    const allowedOrigins = [
        'https://your-domain.vercel.app',
        'https://your-custom-domain.com'
    ];
    
    if (!allowedOrigins.includes(origin)) {
        return res.status(403).json({ error: 'Forbidden origin' });
    }
    
    // Rate limiting
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (!await checkRateLimit(clientIP)) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    
    // Validate request method
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Return secure configuration
    const config = {
        maptilerKey: process.env.MAPTILER_API_KEY,
        // Only return necessary keys, not all
        version: '1.0.0',
        features: await getEnabledFeatures(req),
        timestamp: Date.now()
    };
    
    // Add security headers
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.status(200).json(config);
}

async function checkRateLimit(ip) {
    // Implement rate limiting logic
    // Could use Redis or in-memory store
    return true; // Placeholder
}

async function getEnabledFeatures(req) {
    // Return features based on license/user
    return ['basic-mapping', 'measurement'];
}
```

### 2. Authentication API

**api/auth/login.js:**
```javascript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    
    try {
        // Verify credentials (implement your auth logic)
        const user = await verifyCredentials(username, password);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id,
                username: user.username,
                features: user.features 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Log successful login
        await logSecurityEvent('login_success', {
            userId: user.id,
            ip: req.headers['x-forwarded-for'],
            userAgent: req.headers['user-agent']
        });
        
        res.status(200).json({ 
            token,
            user: {
                id: user.id,
                username: user.username,
                features: user.features
            }
        });
        
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function verifyCredentials(username, password) {
    // Implement credential verification
    // This could query a database or external service
    return null; // Placeholder
}
```

### 3. License Validation API

**api/license/validate.js:**
```javascript
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { licenseKey, domain } = req.body;
    
    // Validate license key format
    if (!licenseKey || !isValidLicenseFormat(licenseKey)) {
        return res.status(400).json({ error: 'Invalid license key format' });
    }
    
    // Validate domain
    if (!domain || !isValidDomain(domain)) {
        return res.status(400).json({ error: 'Invalid domain' });
    }
    
    try {
        // Verify license with license server
        const licenseData = await verifyLicense(licenseKey, domain);
        
        if (!licenseData.valid) {
            return res.status(403).json({ error: 'Invalid license' });
        }
        
        // Check expiration
        if (licenseData.expiryDate && new Date() > new Date(licenseData.expiryDate)) {
            return res.status(403).json({ error: 'License expired' });
        }
        
        // Log license validation
        await logSecurityEvent('license_validation', {
            licenseKey: licenseKey.substring(0, 8) + '...', // Partial key for security
            domain: domain,
            valid: licenseData.valid
        });
        
        res.status(200).json({
            valid: true,
            features: licenseData.features,
            expiryDate: licenseData.expiryDate,
            licensee: licenseData.licensee
        });
        
    } catch (error) {
        console.error('License validation error:', error);
        res.status(500).json({ error: 'License validation failed' });
    }
}

function isValidLicenseFormat(key) {
    // Validate license key format (UUID, custom format, etc.)
    return /^[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}$/.test(key);
}

function isValidDomain(domain) {
    // Validate domain format
    return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain);
}

async function verifyLicense(key, domain) {
    // Implement license verification logic
    // This could query a database or external license service
    return { valid: true, features: ['basic'], expiryDate: null };
}
```

### 4. Security Monitoring API

**api/security/log.js:**
```javascript
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const securityEvent = req.body;
    
    // Validate security event structure
    if (!securityEvent.type || !securityEvent.timestamp) {
        return res.status(400).json({ error: 'Invalid security event format' });
    }
    
    // Add additional metadata
    const enrichedEvent = {
        ...securityEvent,
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        serverTimestamp: Date.now()
    };
    
    try {
        // Store security event
        await storeSecurityEvent(enrichedEvent);
        
        // Check for critical events
        if (isCriticalEvent(enrichedEvent)) {
            await alertSecurityTeam(enrichedEvent);
        }
        
        res.status(200).json({ status: 'logged' });
        
    } catch (error) {
        console.error('Security logging error:', error);
        res.status(500).json({ error: 'Logging failed' });
    }
}

async function storeSecurityEvent(event) {
    // Store in database or external logging service
    console.log('Security event:', event);
}

function isCriticalEvent(event) {
    const criticalEvents = [
        'code_injection',
        'bridge_compromise',
        'license_tampering',
        'rapid_api_calls'
    ];
    
    return criticalEvents.includes(event.type);
}

async function alertSecurityTeam(event) {
    // Send alert to security team
    // Could use email, Slack, or monitoring service
    console.log('CRITICAL SECURITY EVENT:', event);
}
```

## Deployment Security

### 1. Build Security Configuration

**package.json additions:**
```json
{
  "scripts": {
    "build": "npm run security-check && npm run build-prod",
    "build-prod": "webpack --mode production --config webpack.security.js",
    "security-check": "npm audit && npm run lint-security",
    "lint-security": "eslint --config .eslintrc.security.js src/",
    "obfuscate": "javascript-obfuscator src/ --output dist/ --config obfuscator.config.js"
  },
  "devDependencies": {
    "javascript-obfuscator": "^4.0.0",
    "webpack-obfuscator": "^3.5.1",
    "eslint-plugin-security": "^1.4.0"
  }
}
```

### 2. Webpack Security Configuration

**webpack.security.js:**
```javascript
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = {
    mode: 'production',
    entry: './src/app.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'app.[contenthash].js'
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true,
                        drop_debugger: true
                    },
                    mangle: true,
                    output: {
                        comments: false
                    }
                }
            })
        ]
    },
    plugins: [
        new JavaScriptObfuscator({
            rotateStringArray: true,
            stringArray: true,
            debugProtection: true,
            debugProtectionInterval: true,
            disableConsoleOutput: true,
            domainLock: ['your-domain.vercel.app'],
            selfDefending: true,
            sourceMap: false
        }, ['excluded-file.js'])
    ]
};
```

### 3. ESLint Security Configuration

**.eslintrc.security.js:**
```javascript
module.exports = {
    extends: ['eslint:recommended', 'plugin:security/recommended'],
    plugins: ['security'],
    rules: {
        'security/detect-eval-with-expression': 'error',
        'security/detect-non-literal-fs-filename': 'error',
        'security/detect-unsafe-regex': 'error',
        'security/detect-buffer-noassert': 'error',
        'security/detect-child-process': 'error',
        'security/detect-disable-mustache-escape': 'error',
        'security/detect-eval-with-expression': 'error',
        'security/detect-new-buffer': 'error',
        'security/detect-no-csrf-before-method-override': 'error',
        'security/detect-object-injection': 'error',
        'security/detect-possible-timing-attacks': 'error',
        'security/detect-pseudoRandomBytes': 'error'
    }
};
```

## Production Deployment Checklist

### Pre-Deployment Security Checklist

- [ ] All API keys moved to environment variables
- [ ] Security headers configured in vercel.json
- [ ] Content Security Policy implemented
- [ ] Code obfuscation enabled
- [ ] Debug code removed from production build
- [ ] License validation implemented
- [ ] Rate limiting configured
- [ ] Security monitoring enabled
- [ ] HTTPS enforcement configured
- [ ] Source maps disabled in production

### Post-Deployment Verification

1. **Test Security Headers:**
```bash
curl -I https://your-domain.vercel.app/
```

2. **Verify CSP:**
```bash
curl -H "User-Agent: Mozilla/5.0" https://your-domain.vercel.app/ | grep "Content-Security-Policy"
```

3. **Test API Security:**
```bash
# Test rate limiting
for i in {1..200}; do curl https://your-domain.vercel.app/api/config; done

# Test CORS
curl -H "Origin: https://evil-site.com" https://your-domain.vercel.app/api/config
```

4. **Verify Code Obfuscation:**
   - Check browser developer tools
   - Verify source code is obfuscated
   - Confirm no sensitive data exposed

## Monitoring and Alerting

### 1. Vercel Analytics Integration

**Add to index.html:**
```html
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

### 2. Security Monitoring Dashboard

**Create monitoring dashboard at `/admin/security`:**
```javascript
// Security metrics tracking
App.Monitor.Dashboard = {
    initialize: function() {
        this.trackSecurityMetrics();
        this.displaySecurityStatus();
    },
    
    trackSecurityMetrics: function() {
        // Track API usage
        // Monitor license validation
        // Track security events
        setInterval(() => {
            this.updateSecurityMetrics();
        }, 60000);
    },
    
    updateSecurityMetrics: function() {
        fetch('/api/security/metrics')
            .then(response => response.json())
            .then(metrics => {
                this.displayMetrics(metrics);
            });
    }
};
```

### 3. Automated Security Alerts

**Set up alerts for:**
- Unusual API usage patterns
- License validation failures
- Security event spikes
- Failed authentication attempts
- Code tampering detection

## Backup and Recovery

### 1. Configuration Backup

**Backup vercel.json and environment variables:**
```bash
# Export environment variables
vercel env ls > env-backup.txt

# Backup configuration
cp vercel.json vercel.json.backup
```

### 2. Security Incident Response

**Incident Response Plan:**
1. Detect security incident
2. Isolate affected systems
3. Assess damage and scope
4. Contain the incident
5. Eradicate the threat
6. Recover systems
7. Document lessons learned

---

*This configuration provides comprehensive security for the MapLibre mapping application deployed on Vercel, protecting both the application and intellectual property.*