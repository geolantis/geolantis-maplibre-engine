# WebView Security Implementation Plan

## Overview

This document provides detailed implementation steps for securing the MapLibre mapping application in Android/iOS WebView environments, addressing WebView-specific vulnerabilities and attack vectors.

## Critical WebView Vulnerabilities Identified

### 🚨 **High-Risk WebView Issues**
- **JavaScript Bridge Injection**: Unrestricted execution through `window.Android`, `window.interface`, `window.reha`
- **GPS Data Exposure**: Unencrypted location transmission via bridge
- **File System Access**: Android asset access through `file:///android_asset/`
- **Native API Exposure**: Shell command execution capabilities
- **Message Origin Bypass**: No validation of bridge communication origins

## Phase 1: Critical WebView Hardening (Week 1)

### 1. Bridge Security Implementation

**Current Vulnerable Bridge Usage:**
```javascript
// Vulnerable bridge calls
window.Android.receiveData(jsonData);
window.interface.executeShellCommand(command);
window.reha.sendCallback("initiated", "");
```

**Secure Bridge Implementation:**
```javascript
// Secure bridge wrapper
App.WebView.SecureBridge = (function() {
    const allowedMethods = new Set(['receiveData', 'sendCallback', 'updatePosition']);
    const methodValidators = new Map();
    
    return {
        initialize: function() {
            // Validate bridge availability
            if (!window.Android || typeof window.Android !== 'object') {
                throw new Error('Bridge not available');
            }
            
            // Set up method validators
            methodValidators.set('receiveData', this.validateReceiveData);
            methodValidators.set('updatePosition', this.validatePositionData);
        },
        
        callBridge: function(method, data) {
            // Validate method is allowed
            if (!allowedMethods.has(method)) {
                throw new Error(`Bridge method ${method} not allowed`);
            }
            
            // Validate data
            const validator = methodValidators.get(method);
            if (validator && !validator(data)) {
                throw new Error('Invalid bridge data');
            }
            
            // Sanitize data before bridge call
            const sanitized = this.sanitizeData(data);
            
            try {
                return window.Android[method](sanitized);
            } catch (error) {
                this.logSecurityEvent('bridge_error', { method, error: error.message });
                throw error;
            }
        },
        
        sanitizeData: function(data) {
            if (typeof data === 'string') {
                // Remove potential script injection
                return data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            }
            
            if (typeof data === 'object') {
                // Deep sanitize object properties
                const sanitized = {};
                for (const key in data) {
                    if (data.hasOwnProperty(key)) {
                        sanitized[key] = this.sanitizeData(data[key]);
                    }
                }
                return sanitized;
            }
            
            return data;
        },
        
        validateReceiveData: function(data) {
            try {
                const parsed = JSON.parse(data);
                return parsed && typeof parsed === 'object';
            } catch {
                return false;
            }
        },
        
        validatePositionData: function(data) {
            return data && 
                   typeof data.lat === 'number' && 
                   typeof data.lng === 'number' &&
                   data.lat >= -90 && data.lat <= 90 &&
                   data.lng >= -180 && data.lng <= 180;
        }
    };
})();
```

### 2. GPS Data Encryption

**Current Vulnerable GPS Transmission:**
```javascript
// Vulnerable GPS transmission
App.Features.GPSListener.updatePosition(lng, lat, "interface.setPosition");
```

**Secure GPS Implementation:**
```javascript
App.Features.SecureGPS = {
    encryptionKey: null,
    
    initialize: function() {
        // Generate or retrieve encryption key
        this.encryptionKey = this.generateEncryptionKey();
    },
    
    updatePosition: function(lng, lat, source) {
        // Validate coordinates
        if (!this.validateCoordinates(lng, lat)) {
            throw new Error('Invalid GPS coordinates');
        }
        
        // Encrypt GPS data
        const positionData = {
            lng: lng,
            lat: lat,
            timestamp: Date.now(),
            source: source
        };
        
        const encrypted = this.encryptData(JSON.stringify(positionData));
        
        // Send encrypted data through secure bridge
        App.WebView.SecureBridge.callBridge('receiveEncryptedPosition', encrypted);
    },
    
    encryptData: function(data) {
        // Use Web Crypto API for encryption
        if (window.crypto && window.crypto.subtle) {
            return this.encryptWithWebCrypto(data);
        }
        
        // Fallback to simple XOR encryption
        return this.xorEncrypt(data, this.encryptionKey);
    },
    
    encryptWithWebCrypto: function(data) {
        // Implement AES encryption using Web Crypto API
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        
        return window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: new Uint8Array(12) },
            this.encryptionKey,
            dataBuffer
        );
    },
    
    xorEncrypt: function(data, key) {
        let result = '';
        for (let i = 0; i < data.length; i++) {
            result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return btoa(result);
    },
    
    generateEncryptionKey: function() {
        // Generate a secure key for GPS encryption
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    },
    
    validateCoordinates: function(lng, lat) {
        return typeof lng === 'number' && 
               typeof lat === 'number' &&
               lng >= -180 && lng <= 180 &&
               lat >= -90 && lat <= 90;
    }
};
```

### 3. File System Access Restrictions

**Current Vulnerable File Access:**
```javascript
// Vulnerable file access
engineUrl = "file:///android_asset/engine_ml/index.html";
```

**Secure File Access Implementation:**
```javascript
App.WebView.SecureFileAccess = {
    allowedPaths: [
        'engine_ml/',
        'assets/maps/',
        'assets/icons/'
    ],
    
    getSecureAssetUrl: function(path) {
        // Validate path is allowed
        if (!this.isPathAllowed(path)) {
            throw new Error('File access not allowed');
        }
        
        // Normalize path to prevent directory traversal
        const normalizedPath = this.normalizePath(path);
        
        // Return secure asset URL
        return `https://yourapp.vercel.app/assets/${normalizedPath}`;
    },
    
    isPathAllowed: function(path) {
        // Check if path starts with allowed prefix
        return this.allowedPaths.some(allowed => 
            path.startsWith(allowed)
        );
    },
    
    normalizePath: function(path) {
        // Remove potential directory traversal attempts
        return path.replace(/\.\./g, '').replace(/\/+/g, '/');
    }
};
```

## Phase 2: Advanced WebView Security (Week 2-3)

### 1. WebView-Specific Content Security Policy

**Implementation:**
```javascript
App.WebView.CSP = {
    initialize: function() {
        // Detect WebView environment
        if (this.isWebView()) {
            this.applyWebViewCSP();
        }
    },
    
    isWebView: function() {
        const userAgent = navigator.userAgent;
        return /wv\)|WebView|Android.*Version\/\d+\.\d+/i.test(userAgent);
    },
    
    applyWebViewCSP: function() {
        const meta = document.createElement('meta');
        meta.setAttribute('http-equiv', 'Content-Security-Policy');
        meta.setAttribute('content', this.getWebViewCSP());
        document.head.appendChild(meta);
    },
    
    getWebViewCSP: function() {
        return [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net",
            "style-src 'self' 'unsafe-inline'",
            "connect-src 'self' https://api.maptiler.com https://tile.openstreetmap.org",
            "img-src 'self' data: https:",
            "font-src 'self' https://fonts.gstatic.com",
            "object-src 'none'",
            "base-uri 'self'",
            "frame-src 'none'",
            "file-src 'none'"
        ].join('; ');
    }
};
```

### 2. Runtime Application Self-Protection (RASP)

**Implementation:**
```javascript
App.WebView.RASP = {
    initialize: function() {
        this.setupIntegrityChecks();
        this.setupHookDetection();
        this.setupRuntimeValidation();
    },
    
    setupIntegrityChecks: function() {
        // Check if critical functions have been modified
        setInterval(() => {
            this.validateCriticalFunctions();
        }, 30000); // Check every 30 seconds
    },
    
    validateCriticalFunctions: function() {
        const criticalFunctions = [
            'App.Features.GPSListener.updatePosition',
            'App.WebView.SecureBridge.callBridge'
        ];
        
        for (const funcPath of criticalFunctions) {
            if (this.isFunctionHooked(funcPath)) {
                this.handleSecurityThreat('function_hooked', { function: funcPath });
            }
        }
    },
    
    isFunctionHooked: function(funcPath) {
        try {
            const func = this.getNestedProperty(window, funcPath);
            const funcString = func.toString();
            
            // Check for common hooking patterns
            return funcString.includes('arguments.callee') ||
                   funcString.includes('eval(') ||
                   funcString.includes('new Function(');
        } catch {
            return true; // If we can't access the function, consider it hooked
        }
    },
    
    getNestedProperty: function(obj, path) {
        return path.split('.').reduce((current, prop) => current && current[prop], obj);
    },
    
    setupHookDetection: function() {
        // Monitor for bridge method hooking
        if (window.Android) {
            const originalAndroid = window.Android;
            Object.defineProperty(window, 'Android', {
                get: function() {
                    return originalAndroid;
                },
                set: function(value) {
                    App.WebView.RASP.handleSecurityThreat('bridge_replacement', { 
                        original: originalAndroid, 
                        new: value 
                    });
                }
            });
        }
    },
    
    setupRuntimeValidation: function() {
        // Validate WebView runtime environment
        if (!this.validateWebViewEnvironment()) {
            this.handleSecurityThreat('invalid_runtime', {});
        }
    },
    
    validateWebViewEnvironment: function() {
        // Check for expected WebView characteristics
        return window.Android && 
               typeof window.Android === 'object' &&
               navigator.userAgent.includes('WebView');
    },
    
    handleSecurityThreat: function(threatType, details) {
        // Log security event
        console.error('Security threat detected:', threatType, details);
        
        // Notify native app
        if (window.Android && window.Android.securityAlert) {
            window.Android.securityAlert(threatType, JSON.stringify(details));
        }
        
        // Disable sensitive features
        this.disableSensitiveFeatures();
    },
    
    disableSensitiveFeatures: function() {
        // Disable GPS updates
        App.Features.GPSListener.enabled = false;
        
        // Disable bridge communication
        App.WebView.SecureBridge.enabled = false;
        
        // Show security warning
        this.showSecurityWarning();
    },
    
    showSecurityWarning: function() {
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #ff4444;
            color: white;
            padding: 10px;
            text-align: center;
            z-index: 10000;
        `;
        warning.textContent = 'Security threat detected. Application features disabled.';
        document.body.appendChild(warning);
    }
};
```

### 3. Mobile-Specific Input Validation

**Implementation:**
```javascript
App.WebView.InputValidator = {
    initialize: function() {
        this.setupTouchValidation();
        this.setupGestureValidation();
    },
    
    setupTouchValidation: function() {
        // Validate touch events
        document.addEventListener('touchstart', (event) => {
            if (!this.validateTouchEvent(event)) {
                event.preventDefault();
                event.stopPropagation();
            }
        }, { passive: false });
    },
    
    validateTouchEvent: function(event) {
        // Check if touch event is trusted
        if (!event.isTrusted) {
            this.logSecurityEvent('untrusted_touch', { event });
            return false;
        }
        
        // Validate touch coordinates
        for (const touch of event.touches) {
            if (!this.validateTouchCoordinates(touch)) {
                return false;
            }
        }
        
        return true;
    },
    
    validateTouchCoordinates: function(touch) {
        return touch.clientX >= 0 && 
               touch.clientX <= window.innerWidth &&
               touch.clientY >= 0 && 
               touch.clientY <= window.innerHeight;
    },
    
    setupGestureValidation: function() {
        // Validate complex gestures
        let gestureHistory = [];
        
        document.addEventListener('touchmove', (event) => {
            gestureHistory.push({
                timestamp: Date.now(),
                touches: event.touches.length,
                clientX: event.touches[0].clientX,
                clientY: event.touches[0].clientY
            });
            
            // Keep only recent history
            gestureHistory = gestureHistory.filter(
                entry => Date.now() - entry.timestamp < 1000
            );
            
            // Validate gesture pattern
            if (!this.validateGesturePattern(gestureHistory)) {
                event.preventDefault();
            }
        });
    },
    
    validateGesturePattern: function(history) {
        // Check for impossible gesture patterns
        if (history.length < 2) return true;
        
        const recent = history.slice(-2);
        const timeDiff = recent[1].timestamp - recent[0].timestamp;
        const distance = Math.sqrt(
            Math.pow(recent[1].clientX - recent[0].clientX, 2) +
            Math.pow(recent[1].clientY - recent[0].clientY, 2)
        );
        
        // Check for impossible movement speed
        const speed = distance / timeDiff;
        if (speed > 10) { // pixels per millisecond
            this.logSecurityEvent('impossible_gesture', { speed, distance, timeDiff });
            return false;
        }
        
        return true;
    },
    
    logSecurityEvent: function(eventType, details) {
        if (window.Android && window.Android.securityLog) {
            window.Android.securityLog(eventType, JSON.stringify(details));
        }
    }
};
```

## Phase 3: WebView Configuration Security

### 1. Android WebView Security Settings

**Native Android Configuration:**
```java
// Secure WebView configuration
WebView webView = findViewById(R.id.webview);
WebSettings webSettings = webView.getSettings();

// Enable JavaScript (required for app functionality)
webSettings.setJavaScriptEnabled(true);
webSettings.setDomStorageEnabled(true);

// Critical security settings
webSettings.setAllowFileAccess(false);
webSettings.setAllowFileAccessFromFileURLs(false);
webSettings.setAllowUniversalAccessFromFileURLs(false);
webSettings.setAllowContentAccess(false);
webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);

// Disable potentially dangerous features
webSettings.setJavaScriptCanOpenWindowsAutomatically(false);
webSettings.setPluginsEnabled(false);
webSettings.setAllowFileAccessFromFileURLs(false);

// Add secure JavaScript interface
webView.addJavascriptInterface(new SecureJavaScriptInterface(), "Android");

// Set secure WebView client
webView.setWebViewClient(new SecureWebViewClient());
```

### 2. iOS WKWebView Security Configuration

**Native iOS Configuration:**
```swift
// Secure WKWebView configuration
let configuration = WKWebViewConfiguration()
let userContentController = WKUserContentController()

// Security preferences
configuration.preferences.javaScriptEnabled = true
configuration.preferences.javaScriptCanOpenWindowsAutomatically = false

// Disable file access
configuration.preferences.setValue(false, forKey: "allowFileAccessFromFileURLs")
configuration.setValue(false, forKey: "allowUniversalAccessFromFileURLs")

// Add secure message handler
userContentController.add(self, name: "secureMessageHandler")
configuration.userContentController = userContentController

// Create secure web view
let webView = WKWebView(frame: .zero, configuration: configuration)
webView.navigationDelegate = self
```

## Security Testing for WebView

### 1. Bridge Security Tests
```javascript
// Test bridge method enumeration
function testBridgeEnumeration() {
    const bridgeMethods = Object.getOwnPropertyNames(window.Android);
    console.log('Exposed bridge methods:', bridgeMethods);
    
    // Test if sensitive methods are exposed
    const sensitiveMethods = ['executeShellCommand', 'accessFile', 'getSystemInfo'];
    const exposedSensitive = bridgeMethods.filter(method => 
        sensitiveMethods.includes(method)
    );
    
    if (exposedSensitive.length > 0) {
        console.error('Sensitive methods exposed:', exposedSensitive);
    }
}

// Test data injection
function testDataInjection() {
    const maliciousData = '<script>alert("XSS")</script>';
    try {
        App.WebView.SecureBridge.callBridge('receiveData', maliciousData);
        console.error('Data injection successful - security vulnerability!');
    } catch (error) {
        console.log('Data injection blocked:', error.message);
    }
}
```

### 2. GPS Security Tests
```javascript
// Test GPS data encryption
function testGPSEncryption() {
    const testLat = 40.7128;
    const testLng = -74.0060;
    
    // Capture encrypted transmission
    const originalBridge = App.WebView.SecureBridge.callBridge;
    let transmittedData = null;
    
    App.WebView.SecureBridge.callBridge = function(method, data) {
        if (method === 'receiveEncryptedPosition') {
            transmittedData = data;
        }
        return originalBridge.call(this, method, data);
    };
    
    // Test GPS update
    App.Features.SecureGPS.updatePosition(testLng, testLat, 'test');
    
    // Verify data is encrypted
    if (transmittedData && !transmittedData.includes(testLat.toString())) {
        console.log('GPS data properly encrypted');
    } else {
        console.error('GPS data not encrypted - security vulnerability!');
    }
    
    // Restore original bridge
    App.WebView.SecureBridge.callBridge = originalBridge;
}
```

## Monitoring and Maintenance

### 1. Security Event Logging
```javascript
App.WebView.SecurityLogger = {
    logEvent: function(eventType, details) {
        const logEntry = {
            timestamp: Date.now(),
            eventType: eventType,
            details: details,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // Send to native app
        if (window.Android && window.Android.securityLog) {
            window.Android.securityLog(JSON.stringify(logEntry));
        }
        
        // Store locally for analysis
        this.storeSecurityEvent(logEntry);
    },
    
    storeSecurityEvent: function(event) {
        const events = JSON.parse(localStorage.getItem('securityEvents') || '[]');
        events.push(event);
        
        // Keep only last 100 events
        if (events.length > 100) {
            events.shift();
        }
        
        localStorage.setItem('securityEvents', JSON.stringify(events));
    }
};
```

### 2. Regular Security Validation
```javascript
// Periodic security checks
setInterval(() => {
    App.WebView.RASP.validateCriticalFunctions();
    App.WebView.SecurityLogger.logEvent('periodic_check', { status: 'completed' });
}, 60000); // Every minute
```

---

*This implementation plan provides comprehensive WebView security measures specifically designed for the MapLibre mapping application.*