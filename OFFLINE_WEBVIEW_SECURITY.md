# Offline WebView Security Implementation Plan

## Overview

This document provides a comprehensive security framework for implementing offline functionality in the MapLibre GL JS mapping application within WebView environments, addressing critical vulnerabilities and attack vectors specific to offline operation.

## Current Offline Capabilities Analysis

### 🎯 **Existing Offline Infrastructure**

**Offline Map Support:**
- Support for `.mbtiles` and `.pmtiles` offline map formats
- Offline map management UI (`src/map/app.map.offline.js`)
- Sample offline maps for Austrian regions
- File-based offline map loading via `file:///android_asset/`

**Data Persistence:**
- Application state persistence (`src/core/app.core.persistence.js`)
- Layer visibility and configuration storage
- UI preferences and control states
- Theme and button size preferences

**Configuration Management:**
- Fallback configuration system (`src/mapConfigLoader.js`)
- Multiple tile provider support
- Android WebView asset loading

### 🚨 **Critical Offline Security Vulnerabilities**

#### 1. **API Key Exposure in Offline Mode**
```javascript
// VULNERABLE: API keys stored in plain text
const config = {
    maptilerKey: "ldV32HV5eBdmgfE7vZJI",
    clockworkKey: "9G4F5b99xO28esL8tArIO2Bbp8sGhURW5qIieYTy"
};
```

#### 2. **Unencrypted Local Storage**
```javascript
// VULNERABLE: Sensitive data stored without encryption
localStorage.setItem('geolantis360_state', JSON.stringify({
    currentLocation: { lat: 46.6555, lng: 14.3077 },
    gpsData: gpsCoordinates,
    layerConfigs: sensitiveLayerData
}));
```

#### 3. **WebView Bridge Vulnerabilities**
```javascript
// VULNERABLE: Unrestricted bridge access
window.Android.receiveData(userData);
window.interface.executeCommand(userInput);
```

## Secure Offline Architecture

### Phase 1: Critical Security Hardening (Week 1)

#### 1. **Secure API Key Management**

**Implementation:**
```javascript
// Secure API key storage and retrieval
App.Security.OfflineKeys = {
    keyStore: new Map(),
    
    initialize: function() {
        this.loadSecureKeys();
        this.validateKeyAccess();
    },
    
    loadSecureKeys: function() {
        // Load keys from secure native storage
        if (window.Android && window.Android.getSecureString) {
            const encryptedKeys = window.Android.getSecureString('api_keys');
            if (encryptedKeys) {
                this.decryptAndStoreKeys(encryptedKeys);
            }
        }
    },
    
    getKey: function(service) {
        // Validate service request
        if (!this.isValidService(service)) {
            throw new Error('Invalid service requested');
        }
        
        // Check offline mode
        if (this.isOfflineMode()) {
            return this.getOfflineKey(service);
        }
        
        const key = this.keyStore.get(service);
        if (!key) {
            throw new Error('API key not available');
        }
        
        // Log key access
        this.logKeyAccess(service);
        return key;
    },
    
    isValidService: function(service) {
        const allowedServices = ['maptiler', 'clockwork', 'google', 'osuk'];
        return allowedServices.includes(service);
    },
    
    isOfflineMode: function() {
        return !navigator.onLine || App.Map.Offline.isOfflineMode();
    },
    
    getOfflineKey: function(service) {
        // Use limited offline keys for tile access
        const offlineKeys = {
            'maptiler': 'offline_limited_key',
            'clockwork': null // No offline access
        };
        
        return offlineKeys[service] || null;
    },
    
    decryptAndStoreKeys: function(encryptedKeys) {
        try {
            const decrypted = this.decrypt(encryptedKeys);
            const keys = JSON.parse(decrypted);
            
            Object.entries(keys).forEach(([service, key]) => {
                this.keyStore.set(service, key);
            });
        } catch (error) {
            console.error('Key decryption failed:', error);
        }
    },
    
    decrypt: function(encryptedData) {
        // Implement AES decryption
        // Use WebCrypto API or native bridge decryption
        return atob(encryptedData); // Simplified for example
    }
};
```

#### 2. **Encrypted Local Storage**

**Implementation:**
```javascript
// Secure offline data storage
App.Security.OfflineStorage = {
    encryptionKey: null,
    
    initialize: async function() {
        this.encryptionKey = await this.generateEncryptionKey();
    },
    
    generateEncryptionKey: async function() {
        // Generate AES key for data encryption
        return await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    },
    
    secureStore: async function(key, data) {
        try {
            // Encrypt data before storing
            const encrypted = await this.encrypt(JSON.stringify(data));
            
            // Store encrypted data with metadata
            const storageData = {
                encrypted: encrypted.data,
                iv: Array.from(encrypted.iv),
                timestamp: Date.now(),
                checksum: await this.calculateChecksum(data)
            };
            
            localStorage.setItem(key, JSON.stringify(storageData));
            
            // Log storage operation
            this.logStorageOperation('store', key);
            
        } catch (error) {
            console.error('Secure storage failed:', error);
            throw error;
        }
    },
    
    secureRetrieve: async function(key) {
        try {
            const stored = localStorage.getItem(key);
            if (!stored) return null;
            
            const storageData = JSON.parse(stored);
            
            // Decrypt data
            const decrypted = await this.decrypt(
                storageData.encrypted,
                new Uint8Array(storageData.iv)
            );
            
            const data = JSON.parse(decrypted);
            
            // Verify data integrity
            const checksum = await this.calculateChecksum(data);
            if (checksum !== storageData.checksum) {
                throw new Error('Data integrity check failed');
            }
            
            // Log retrieval operation
            this.logStorageOperation('retrieve', key);
            
            return data;
            
        } catch (error) {
            console.error('Secure retrieval failed:', error);
            return null;
        }
    },
    
    encrypt: async function(data) {
        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            this.encryptionKey,
            encoder.encode(data)
        );
        
        return {
            data: Array.from(new Uint8Array(encrypted)),
            iv: iv
        };
    },
    
    decrypt: async function(encryptedData, iv) {
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            this.encryptionKey,
            new Uint8Array(encryptedData)
        );
        
        return new TextDecoder().decode(decrypted);
    },
    
    calculateChecksum: async function(data) {
        const encoder = new TextEncoder();
        const buffer = encoder.encode(JSON.stringify(data));
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0')).join('');
    },
    
    logStorageOperation: function(operation, key) {
        const logEntry = {
            operation: operation,
            key: key,
            timestamp: Date.now(),
            session: this.getSessionId()
        };
        
        // Send to monitoring if online
        if (navigator.onLine) {
            this.sendToMonitoring(logEntry);
        } else {
            // Queue for later transmission
            this.queueLogEntry(logEntry);
        }
    }
};
```

#### 3. **Secure WebView Bridge for Offline Mode**

**Implementation:**
```javascript
// Secure offline bridge communication
App.Security.OfflineBridge = {
    allowedMethods: new Set(['receiveOfflineData', 'updateOfflinePosition', 'getOfflineConfig']),
    methodValidators: new Map(),
    
    initialize: function() {
        this.setupMethodValidators();
        this.setupSecurityMonitoring();
    },
    
    setupMethodValidators: function() {
        this.methodValidators.set('receiveOfflineData', this.validateOfflineData);
        this.methodValidators.set('updateOfflinePosition', this.validatePositionData);
        this.methodValidators.set('getOfflineConfig', this.validateConfigRequest);
    },
    
    callBridge: function(method, data) {
        // Validate method is allowed
        if (!this.allowedMethods.has(method)) {
            this.logSecurityEvent('unauthorized_bridge_call', { method });
            throw new Error(`Bridge method ${method} not allowed`);
        }
        
        // Validate data
        const validator = this.methodValidators.get(method);
        if (validator && !validator.call(this, data)) {
            this.logSecurityEvent('invalid_bridge_data', { method, data });
            throw new Error('Invalid bridge data');
        }
        
        // Check if offline mode is active
        if (!App.Map.Offline.isOfflineMode()) {
            this.logSecurityEvent('bridge_call_online_mode', { method });
            throw new Error('Bridge method only available in offline mode');
        }
        
        // Sanitize and sign data
        const sanitized = this.sanitizeData(data);
        const signed = this.signData(sanitized);
        
        try {
            const result = window.Android[method](signed);
            
            // Log successful bridge call
            this.logSecurityEvent('bridge_call_success', { method });
            
            return result;
        } catch (error) {
            this.logSecurityEvent('bridge_call_failed', { method, error: error.message });
            throw error;
        }
    },
    
    validateOfflineData: function(data) {
        return data && 
               typeof data === 'object' &&
               data.type &&
               data.payload &&
               data.timestamp &&
               Date.now() - data.timestamp < 300000; // 5 minutes max age
    },
    
    validatePositionData: function(data) {
        return data &&
               typeof data.lat === 'number' &&
               typeof data.lng === 'number' &&
               data.lat >= -90 && data.lat <= 90 &&
               data.lng >= -180 && data.lng <= 180 &&
               data.timestamp &&
               Date.now() - data.timestamp < 60000; // 1 minute max age
    },
    
    validateConfigRequest: function(data) {
        return data &&
               data.configType &&
               ['offline', 'tiles', 'layers'].includes(data.configType);
    },
    
    sanitizeData: function(data) {
        // Deep sanitization of data
        if (typeof data === 'string') {
            return data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        }
        
        if (typeof data === 'object' && data !== null) {
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
    
    signData: function(data) {
        // Create HMAC signature for data integrity
        const message = JSON.stringify(data);
        const signature = this.calculateHMAC(message);
        
        return {
            data: data,
            signature: signature,
            timestamp: Date.now()
        };
    },
    
    calculateHMAC: function(message) {
        // Simplified HMAC calculation
        // In production, use crypto.subtle.sign with HMAC
        const key = 'offline_bridge_key';
        return btoa(message + key).substring(0, 32);
    }
};
```

### Phase 2: Offline Tile Security (Week 2)

#### 1. **Secure Tile Caching**

**Implementation:**
```javascript
// Secure offline tile management
App.Security.OfflineTiles = {
    tileCache: new Map(),
    tileHashes: new Map(),
    
    initialize: function() {
        this.loadTileHashes();
        this.setupTileValidation();
    },
    
    loadTileHashes: function() {
        // Load known tile hashes from secure storage
        const hashes = App.Security.OfflineStorage.secureRetrieve('tile_hashes');
        if (hashes) {
            this.tileHashes = new Map(hashes);
        }
    },
    
    cacheTile: async function(tileUrl, tileData) {
        try {
            // Validate tile source
            if (!this.isValidTileSource(tileUrl)) {
                throw new Error('Invalid tile source');
            }
            
            // Calculate tile hash
            const hash = await this.calculateTileHash(tileData);
            
            // Verify tile integrity if hash exists
            const expectedHash = this.tileHashes.get(tileUrl);
            if (expectedHash && expectedHash !== hash) {
                throw new Error('Tile integrity check failed');
            }
            
            // Encrypt tile data
            const encrypted = await this.encryptTile(tileData);
            
            // Store in cache
            this.tileCache.set(tileUrl, {
                data: encrypted,
                hash: hash,
                timestamp: Date.now()
            });
            
            // Persist to storage
            await this.persistTileCache();
            
            this.logTileOperation('cache', tileUrl);
            
        } catch (error) {
            console.error('Tile caching failed:', error);
            throw error;
        }
    },
    
    retrieveTile: async function(tileUrl) {
        try {
            // Check cache first
            let cached = this.tileCache.get(tileUrl);
            
            if (!cached) {
                // Load from persistent storage
                cached = await this.loadCachedTile(tileUrl);
            }
            
            if (!cached) {
                throw new Error('Tile not found in cache');
            }
            
            // Check tile age
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            if (Date.now() - cached.timestamp > maxAge) {
                throw new Error('Cached tile expired');
            }
            
            // Decrypt tile data
            const decrypted = await this.decryptTile(cached.data);
            
            // Verify integrity
            const hash = await this.calculateTileHash(decrypted);
            if (hash !== cached.hash) {
                throw new Error('Tile integrity check failed');
            }
            
            this.logTileOperation('retrieve', tileUrl);
            
            return decrypted;
            
        } catch (error) {
            console.error('Tile retrieval failed:', error);
            return null;
        }
    },
    
    isValidTileSource: function(tileUrl) {
        const allowedSources = [
            'https://api.maptiler.com',
            'https://tile.openstreetmap.org',
            'https://maps.googleapis.com'
        ];
        
        return allowedSources.some(source => tileUrl.startsWith(source));
    },
    
    calculateTileHash: async function(tileData) {
        const buffer = new TextEncoder().encode(tileData);
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0')).join('');
    },
    
    encryptTile: async function(tileData) {
        // Use same encryption as offline storage
        return await App.Security.OfflineStorage.encrypt(tileData);
    },
    
    decryptTile: async function(encryptedData) {
        // Use same decryption as offline storage
        return await App.Security.OfflineStorage.decrypt(
            encryptedData.data,
            new Uint8Array(encryptedData.iv)
        );
    },
    
    persistTileCache: async function() {
        // Convert cache to serializable format
        const cacheData = Array.from(this.tileCache.entries());
        await App.Security.OfflineStorage.secureStore('tile_cache', cacheData);
    },
    
    loadCachedTile: async function(tileUrl) {
        const cacheData = await App.Security.OfflineStorage.secureRetrieve('tile_cache');
        if (cacheData) {
            const cacheMap = new Map(cacheData);
            return cacheMap.get(tileUrl);
        }
        return null;
    },
    
    logTileOperation: function(operation, tileUrl) {
        const logEntry = {
            operation: operation,
            tileUrl: tileUrl,
            timestamp: Date.now(),
            offline: !navigator.onLine
        };
        
        App.Security.OfflineStorage.logStorageOperation('tile_' + operation, tileUrl);
    }
};
```

#### 2. **Offline Map Validation**

**Implementation:**
```javascript
// Offline map file validation
App.Security.OfflineMapValidator = {
    supportedFormats: new Set(['mbtiles', 'pmtiles']),
    maxFileSize: 500 * 1024 * 1024, // 500MB
    
    validateOfflineMap: async function(mapFile) {
        try {
            // Check file format
            if (!this.isValidFormat(mapFile.name)) {
                throw new Error('Unsupported map format');
            }
            
            // Check file size
            if (mapFile.size > this.maxFileSize) {
                throw new Error('Map file too large');
            }
            
            // Validate file structure
            const isValid = await this.validateFileStructure(mapFile);
            if (!isValid) {
                throw new Error('Invalid map file structure');
            }
            
            // Calculate file hash
            const hash = await this.calculateFileHash(mapFile);
            
            // Verify against known hashes if available
            if (!await this.verifyFileHash(mapFile.name, hash)) {
                throw new Error('Map file integrity check failed');
            }
            
            return {
                valid: true,
                hash: hash,
                size: mapFile.size,
                format: this.getFileFormat(mapFile.name)
            };
            
        } catch (error) {
            console.error('Map validation failed:', error);
            return { valid: false, error: error.message };
        }
    },
    
    isValidFormat: function(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        return this.supportedFormats.has(extension);
    },
    
    getFileFormat: function(filename) {
        return filename.split('.').pop().toLowerCase();
    },
    
    validateFileStructure: async function(mapFile) {
        // Read file header to validate structure
        const header = await this.readFileHeader(mapFile);
        
        // Check for SQLite header (mbtiles) or PMTiles header
        if (mapFile.name.endsWith('.mbtiles')) {
            return this.validateMBTilesHeader(header);
        } else if (mapFile.name.endsWith('.pmtiles')) {
            return this.validatePMTilesHeader(header);
        }
        
        return false;
    },
    
    readFileHeader: function(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                resolve(new Uint8Array(e.target.result));
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file.slice(0, 1024)); // Read first 1KB
        });
    },
    
    validateMBTilesHeader: function(header) {
        // Check for SQLite header signature
        const sqliteSignature = [0x53, 0x51, 0x4C, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6F, 0x72, 0x6D, 0x61, 0x74, 0x20, 0x33, 0x00];
        
        for (let i = 0; i < sqliteSignature.length; i++) {
            if (header[i] !== sqliteSignature[i]) {
                return false;
            }
        }
        
        return true;
    },
    
    validatePMTilesHeader: function(header) {
        // Check for PMTiles header signature
        const pmtilesSignature = [0x50, 0x4D, 0x54, 0x69, 0x6C, 0x65, 0x73]; // "PMTiles"
        
        for (let i = 0; i < pmtilesSignature.length; i++) {
            if (header[i] !== pmtilesSignature[i]) {
                return false;
            }
        }
        
        return true;
    },
    
    calculateFileHash: async function(file) {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0')).join('');
    },
    
    verifyFileHash: async function(filename, hash) {
        // Check against known file hashes
        const knownHashes = await App.Security.OfflineStorage.secureRetrieve('map_hashes');
        if (knownHashes && knownHashes[filename]) {
            return knownHashes[filename] === hash;
        }
        
        // If no known hash, accept but log
        this.logUnknownMapFile(filename, hash);
        return true;
    },
    
    logUnknownMapFile: function(filename, hash) {
        const logEntry = {
            type: 'unknown_map_file',
            filename: filename,
            hash: hash,
            timestamp: Date.now()
        };
        
        App.Security.OfflineStorage.logStorageOperation('unknown_map', filename);
    }
};
```

### Phase 3: Offline Synchronization Security (Week 3)

#### 1. **Secure Sync Protocol**

**Implementation:**
```javascript
// Secure offline/online synchronization
App.Security.OfflineSync = {
    syncQueue: [],
    conflictResolver: null,
    
    initialize: function() {
        this.loadSyncQueue();
        this.setupConflictResolver();
        this.setupConnectivityMonitoring();
    },
    
    queueForSync: async function(data) {
        const syncItem = {
            id: this.generateSyncId(),
            data: data,
            timestamp: Date.now(),
            type: data.type || 'unknown',
            hash: await this.calculateDataHash(data),
            retryCount: 0
        };
        
        this.syncQueue.push(syncItem);
        await this.persistSyncQueue();
        
        // Attempt immediate sync if online
        if (navigator.onLine) {
            this.processSync();
        }
    },
    
    processSync: async function() {
        if (this.syncQueue.length === 0) return;
        
        const itemsToSync = this.syncQueue.slice(0, 10); // Process 10 items at a time
        
        for (const item of itemsToSync) {
            try {
                await this.syncItem(item);
                this.removeSyncItem(item.id);
            } catch (error) {
                this.handleSyncError(item, error);
            }
        }
        
        await this.persistSyncQueue();
    },
    
    syncItem: async function(item) {
        // Verify item integrity
        const currentHash = await this.calculateDataHash(item.data);
        if (currentHash !== item.hash) {
            throw new Error('Data integrity check failed');
        }
        
        // Encrypt data for transmission
        const encrypted = await this.encryptForTransmission(item.data);
        
        // Send to server
        const response = await fetch('/api/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Sync-Id': item.id,
                'X-Sync-Hash': item.hash
            },
            body: JSON.stringify({
                data: encrypted,
                timestamp: item.timestamp,
                type: item.type
            })
        });
        
        if (!response.ok) {
            throw new Error('Sync failed: ' + response.statusText);
        }
        
        const result = await response.json();
        
        // Handle conflicts
        if (result.conflict) {
            await this.handleConflict(item, result.serverData);
        }
        
        this.logSyncOperation('sync_success', item.id);
    },
    
    handleConflict: async function(localItem, serverData) {
        const resolution = await this.conflictResolver.resolve(localItem.data, serverData);
        
        if (resolution.useLocal) {
            // Force update server with local data
            await this.forceSyncItem(localItem);
        } else if (resolution.useServer) {
            // Update local data with server data
            await this.updateLocalData(localItem.id, serverData);
        } else if (resolution.merge) {
            // Merge data and sync
            const merged = await this.mergeData(localItem.data, serverData);
            localItem.data = merged;
            await this.syncItem(localItem);
        }
    },
    
    setupConflictResolver: function() {
        this.conflictResolver = {
            resolve: async function(localData, serverData) {
                // Timestamp-based resolution
                if (localData.timestamp > serverData.timestamp) {
                    return { useLocal: true };
                } else if (serverData.timestamp > localData.timestamp) {
                    return { useServer: true };
                } else {
                    // Same timestamp, merge if possible
                    return { merge: true };
                }
            }
        };
    },
    
    setupConnectivityMonitoring: function() {
        window.addEventListener('online', () => {
            this.processSync();
        });
        
        window.addEventListener('offline', () => {
            this.logSyncOperation('connectivity_lost', null);
        });
    },
    
    calculateDataHash: async function(data) {
        const buffer = new TextEncoder().encode(JSON.stringify(data));
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0')).join('');
    },
    
    encryptForTransmission: async function(data) {
        // Use same encryption as offline storage
        return await App.Security.OfflineStorage.encrypt(JSON.stringify(data));
    },
    
    generateSyncId: function() {
        return 'sync_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    persistSyncQueue: async function() {
        await App.Security.OfflineStorage.secureStore('sync_queue', this.syncQueue);
    },
    
    loadSyncQueue: async function() {
        const queue = await App.Security.OfflineStorage.secureRetrieve('sync_queue');
        this.syncQueue = queue || [];
    },
    
    removeSyncItem: function(id) {
        this.syncQueue = this.syncQueue.filter(item => item.id !== id);
    },
    
    handleSyncError: function(item, error) {
        item.retryCount += 1;
        item.lastError = error.message;
        
        if (item.retryCount >= 3) {
            this.logSyncOperation('sync_failed', item.id, error.message);
            this.removeSyncItem(item.id);
        } else {
            this.logSyncOperation('sync_retry', item.id, error.message);
        }
    },
    
    logSyncOperation: function(operation, itemId, error) {
        const logEntry = {
            operation: operation,
            itemId: itemId,
            error: error,
            timestamp: Date.now(),
            queueSize: this.syncQueue.length
        };
        
        App.Security.OfflineStorage.logStorageOperation('sync_' + operation, itemId);
    }
};
```

### Phase 4: Offline Monitoring and Alerts (Week 4)

#### 1. **Offline Security Monitoring**

**Implementation:**
```javascript
// Offline security event monitoring
App.Security.OfflineMonitor = {
    events: [],
    alertThresholds: {
        'failed_bridge_calls': 10,
        'data_integrity_failures': 5,
        'unauthorized_access': 3
    },
    
    initialize: function() {
        this.loadStoredEvents();
        this.setupPeriodicAnalysis();
        this.setupAnomalyDetection();
    },
    
    logSecurityEvent: function(eventType, details) {
        const event = {
            id: this.generateEventId(),
            type: eventType,
            details: details,
            timestamp: Date.now(),
            severity: this.getSeverity(eventType),
            offline: !navigator.onLine
        };
        
        this.events.push(event);
        this.analyzeEvent(event);
        
        // Persist events
        this.persistEvents();
        
        // Send to server if online
        if (navigator.onLine) {
            this.transmitEvent(event);
        }
    },
    
    analyzeEvent: function(event) {
        // Check for alert conditions
        if (this.shouldAlert(event)) {
            this.triggerAlert(event);
        }
        
        // Check for patterns
        this.detectPatterns(event);
    },
    
    shouldAlert: function(event) {
        if (event.severity === 'critical') {
            return true;
        }
        
        // Check frequency thresholds
        const recentEvents = this.getRecentEvents(event.type, 300000); // 5 minutes
        const threshold = this.alertThresholds[event.type] || 5;
        
        return recentEvents.length >= threshold;
    },
    
    triggerAlert: function(event) {
        // Create alert
        const alert = {
            id: this.generateAlertId(),
            eventType: event.type,
            severity: event.severity,
            count: this.getRecentEvents(event.type, 300000).length,
            timestamp: Date.now(),
            offline: !navigator.onLine
        };
        
        // Store alert
        this.storeAlert(alert);
        
        // Display UI warning if critical
        if (event.severity === 'critical') {
            this.displayCriticalAlert(alert);
        }
        
        // Attempt to notify server
        if (navigator.onLine) {
            this.transmitAlert(alert);
        }
    },
    
    detectPatterns: function(event) {
        // Look for attack patterns
        const patterns = {
            'rapid_fire': this.detectRapidFire(event),
            'escalation': this.detectEscalation(event),
            'systematic': this.detectSystematic(event)
        };
        
        Object.entries(patterns).forEach(([pattern, detected]) => {
            if (detected) {
                this.logSecurityEvent('pattern_detected', {
                    pattern: pattern,
                    triggerEvent: event.id
                });
            }
        });
    },
    
    detectRapidFire: function(event) {
        // Check for rapid succession of same event type
        const recent = this.getRecentEvents(event.type, 60000); // 1 minute
        return recent.length > 20;
    },
    
    detectEscalation: function(event) {
        // Check for increasing severity
        const recent = this.getRecentEvents(null, 600000); // 10 minutes
        const severityLevels = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
        
        let escalating = true;
        for (let i = 1; i < recent.length; i++) {
            if (severityLevels[recent[i].severity] < severityLevels[recent[i-1].severity]) {
                escalating = false;
                break;
            }
        }
        
        return escalating && recent.length > 5;
    },
    
    detectSystematic: function(event) {
        // Check for systematic attack patterns
        const recent = this.getRecentEvents(null, 1800000); // 30 minutes
        const eventTypes = [...new Set(recent.map(e => e.type))];
        
        // Multiple different attack types suggests systematic attack
        return eventTypes.length > 5;
    },
    
    getRecentEvents: function(eventType, timeWindow) {
        const cutoff = Date.now() - timeWindow;
        return this.events.filter(event => 
            event.timestamp > cutoff && 
            (eventType === null || event.type === eventType)
        );
    },
    
    getSeverity: function(eventType) {
        const severityMap = {
            'code_injection': 'critical',
            'bridge_compromise': 'critical',
            'data_corruption': 'critical',
            'unauthorized_access': 'high',
            'invalid_bridge_data': 'high',
            'failed_authentication': 'medium',
            'cache_miss': 'low'
        };
        
        return severityMap[eventType] || 'medium';
    },
    
    displayCriticalAlert: function(alert) {
        // Display blocking UI alert
        const alertDiv = document.createElement('div');
        alertDiv.className = 'security-alert critical';
        alertDiv.innerHTML = `
            <div class="alert-content">
                <h3>Critical Security Alert</h3>
                <p>Security threat detected: ${alert.eventType}</p>
                <p>Severity: ${alert.severity}</p>
                <p>Time: ${new Date(alert.timestamp).toLocaleString()}</p>
                <button onclick="this.parentElement.parentElement.remove()">Acknowledge</button>
            </div>
        `;
        
        document.body.appendChild(alertDiv);
    },
    
    persistEvents: async function() {
        // Keep only recent events to prevent storage bloat
        const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
        this.events = this.events.filter(event => event.timestamp > cutoff);
        
        await App.Security.OfflineStorage.secureStore('security_events', this.events);
    },
    
    loadStoredEvents: async function() {
        const stored = await App.Security.OfflineStorage.secureRetrieve('security_events');
        this.events = stored || [];
    },
    
    setupPeriodicAnalysis: function() {
        setInterval(() => {
            this.performPeriodicAnalysis();
        }, 300000); // Every 5 minutes
    },
    
    performPeriodicAnalysis: function() {
        // Generate security summary
        const summary = this.generateSecuritySummary();
        
        // Check for anomalies
        this.checkForAnomalies(summary);
        
        // Clean up old events
        this.cleanupOldEvents();
    },
    
    generateSecuritySummary: function() {
        const recent = this.getRecentEvents(null, 3600000); // 1 hour
        
        return {
            totalEvents: recent.length,
            criticalEvents: recent.filter(e => e.severity === 'critical').length,
            highEvents: recent.filter(e => e.severity === 'high').length,
            mostCommonEvent: this.getMostCommonEvent(recent),
            timeRange: {
                start: Math.min(...recent.map(e => e.timestamp)),
                end: Math.max(...recent.map(e => e.timestamp))
            }
        };
    },
    
    getMostCommonEvent: function(events) {
        const counts = {};
        events.forEach(event => {
            counts[event.type] = (counts[event.type] || 0) + 1;
        });
        
        return Object.entries(counts).reduce((a, b) => 
            counts[a[0]] > counts[b[0]] ? a : b
        )[0];
    },
    
    generateEventId: function() {
        return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    generateAlertId: function() {
        return 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
};
```

## Native WebView Security Configuration

### Android WebView Security Settings

**Secure WebView Configuration:**
```java
// Secure Android WebView settings for offline mode
WebView webView = findViewById(R.id.webview);
WebSettings settings = webView.getSettings();

// Enable necessary features
settings.setJavaScriptEnabled(true);
settings.setDomStorageEnabled(true);
settings.setDatabaseEnabled(true);
settings.setAppCacheEnabled(true);

// Critical security settings
settings.setAllowFileAccess(false);
settings.setAllowFileAccessFromFileURLs(false);
settings.setAllowUniversalAccessFromFileURLs(false);
settings.setAllowContentAccess(false);
settings.setGeolocationEnabled(false);
settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);

// Disable potentially dangerous features
settings.setJavaScriptCanOpenWindowsAutomatically(false);
settings.setPluginsEnabled(false);
settings.setSupportMultipleWindows(false);

// Set secure cache settings
settings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
settings.setAppCachePath(getApplicationContext().getCacheDir().getPath());
settings.setAppCacheMaxSize(50 * 1024 * 1024); // 50MB

// Add secure JavaScript interface
webView.addJavascriptInterface(new SecureJavaScriptInterface(), "Android");
```

### iOS WKWebView Security Configuration

**Secure WKWebView Configuration:**
```swift
// Secure iOS WKWebView configuration for offline mode
let configuration = WKWebViewConfiguration()
let userContentController = WKUserContentController()

// Security preferences
configuration.preferences.javaScriptEnabled = true
configuration.preferences.javaScriptCanOpenWindowsAutomatically = false

// Disable file access
configuration.preferences.setValue(false, forKey: "allowFileAccessFromFileURLs")
configuration.setValue(false, forKey: "allowUniversalAccessFromFileURLs")

// Configure data store for offline caching
let dataStore = WKWebsiteDataStore.default()
configuration.websiteDataStore = dataStore

// Add secure message handlers
userContentController.add(self, name: "secureMessageHandler")
userContentController.add(self, name: "offlineDataHandler")
configuration.userContentController = userContentController

// Create secure web view
let webView = WKWebView(frame: .zero, configuration: configuration)
webView.navigationDelegate = self
```

## Testing and Validation

### Security Testing Checklist

**Offline Security Tests:**
- [ ] API key security in offline mode
- [ ] Encrypted local storage functionality
- [ ] WebView bridge security validation
- [ ] Offline tile integrity checks
- [ ] Sync security during connectivity changes
- [ ] Authentication bypass prevention
- [ ] Data corruption detection
- [ ] Cache poisoning prevention

**Performance Tests:**
- [ ] Encryption/decryption performance
- [ ] Storage space usage
- [ ] Battery impact assessment
- [ ] Memory usage monitoring

**Penetration Testing:**
- [ ] WebView bridge exploitation attempts
- [ ] Local storage manipulation
- [ ] Tile cache poisoning
- [ ] Offline authentication bypass
- [ ] Data integrity attacks

## Implementation Timeline

### Week 1: Critical Security
- [ ] Implement secure API key management
- [ ] Add encrypted local storage
- [ ] Secure WebView bridge communication
- [ ] Basic offline monitoring

### Week 2: Tile Security
- [ ] Implement secure tile caching
- [ ] Add offline map validation
- [ ] Tile integrity checking
- [ ] Cache management security

### Week 3: Synchronization
- [ ] Secure sync protocol
- [ ] Conflict resolution
- [ ] Data integrity verification
- [ ] Connectivity monitoring

### Week 4: Monitoring
- [ ] Security event logging
- [ ] Anomaly detection
- [ ] Alert system
- [ ] Performance monitoring

## Success Metrics

- **API Key Security**: 100% of API keys secured
- **Data Encryption**: 100% of sensitive data encrypted
- **Bridge Security**: 100% of bridge calls validated
- **Tile Security**: 100% of tiles integrity checked
- **Sync Security**: 100% of sync operations secured
- **Performance Impact**: <15% performance degradation
- **Storage Efficiency**: <20% storage overhead
- **Battery Impact**: <10% additional battery usage

---

*This comprehensive offline security plan provides enterprise-grade protection for WebView-based offline mapping applications while maintaining functionality and performance.*