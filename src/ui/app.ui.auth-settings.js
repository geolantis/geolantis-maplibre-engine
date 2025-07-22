/**
 * Authentication Settings UI Module
 * Manages login authentication for the map engine
 * @namespace App.UI.AuthSettings
 */
App.UI = App.UI || {};
App.UI.AuthSettings = (function() {
    
    // Private variables
    var _initialized = false;
    var _elements = {};
    var _isLoggedIn = false;
    var _currentUsername = null;
    var _isLoggingIn = false;
    
    // Storage keys
    var LOGIN_STATUS_KEY = 'map_engine_login_status';
    
    /**
     * Initialize the authentication settings module
     * @public
     */
    function initialize() {
        if (_initialized) {
            console.log('Auth Settings already initialized');
            return;
        }
        
        console.log('Initializing Auth Settings module...');
        
        // Load saved login state
        _loadSavedLoginState();
        
        // Update UI state
        _setupEventListeners();
        _updateUI();
        
        _initialized = true;
        console.log('Auth Settings module initialized');
    }
    
    /**
     * Set up event listeners
     * @private
     */
    function _setupEventListeners() {
        console.log('Setting up auth event listeners...');
        
        // Cache DOM elements
        _elements = {
            // Login elements
            usernameInput: document.getElementById('auth-username-input'),
            passwordInput: document.getElementById('auth-password-input'),
            loginBtn: document.getElementById('login-btn'),
            logoutBtn: document.getElementById('logout-btn'),
            
            // Status elements
            statusContainer: document.getElementById('auth-status-container'),
            statusIcon: document.getElementById('auth-status-icon'),
            statusText: document.getElementById('auth-status-text'),
            lastTested: document.getElementById('auth-last-tested')
        };
        
        // Login button click
        if (_elements.loginBtn) {
            _elements.loginBtn.addEventListener('click', _handleLogin);
        }
        
        // Logout button click
        if (_elements.logoutBtn) {
            _elements.logoutBtn.addEventListener('click', _handleLogout);
        }
        
        // Enter key on username/password inputs
        if (_elements.usernameInput) {
            _elements.usernameInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    if (_elements.passwordInput) {
                        _elements.passwordInput.focus();
                    } else {
                        _handleLogin();
                    }
                }
            });
        }
        
        if (_elements.passwordInput) {
            _elements.passwordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    _handleLogin();
                }
            });
        }
        
        // Input change handlers
        if (_elements.usernameInput) {
            _elements.usernameInput.addEventListener('input', _updateUI);
        }
        if (_elements.passwordInput) {
            _elements.passwordInput.addEventListener('input', _updateUI);
        }
    }
    
    /**
     * Load saved login state from localStorage
     * @private
     */
    function _loadSavedLoginState() {
        try {
            var savedLoginStatus = localStorage.getItem(LOGIN_STATUS_KEY);
            if (savedLoginStatus) {
                var loginData = JSON.parse(savedLoginStatus);
                if (loginData && loginData.isLoggedIn && loginData.username) {
                    console.log('🔄 Restoring login state for:', loginData.username);
                    _isLoggedIn = true;
                    _currentUsername = loginData.username;
                    
                    // Update UI to reflect logged-in state
                    if (_elements.usernameInput) {
                        _elements.usernameInput.value = loginData.username;
                    }
                    
                    _updateLoginUI();
                    _updateStatusDisplay('success', 'Logged in as ' + loginData.username);
                    
                    // Auto-load overlays if available
                    console.log('🔄 Auto-loading overlays for restored session...');
                    if (window.App && window.App.Map && window.App.Map.PdfOverlays) {
                        setTimeout(function() {
                            window.App.Map.PdfOverlays.loadFromAPI();
                        }, 500);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading saved login state:', error);
        }
    }
    
    /**
     * Save login status to localStorage
     * @private
     */
    function _saveLoginStatus(isLoggedIn, username, sessionId) {
        try {
            var loginData = {
                isLoggedIn: isLoggedIn,
                username: username,
                sessionToken: sessionId,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(LOGIN_STATUS_KEY, JSON.stringify(loginData));
            console.log('💾 Login status saved to localStorage');
        } catch (error) {
            console.error('Error saving login status:', error);
        }
    }
    
    /**
     * Get backend URL for API calls
     * @private
     */
    function _getBackendUrl() {
        // Auto-detect based on hostname
        var hostname = window.location.hostname;
        
        if (hostname === 'tools.geolantis.com') {
            // Same domain - backend should be deployed as Vercel serverless functions
            return 'https://tools.geolantis.com';
        } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:8000';
        } else {
            // Default to localhost for development
            return 'http://localhost:8000';
        }
    }
    
    /**
     * Handle login action
     * @private
     */
    function _handleLogin() {
        if (_isLoggingIn) return;
        
        var username = _elements.usernameInput ? _elements.usernameInput.value.trim() : '';
        var password = _elements.passwordInput ? _elements.passwordInput.value : '';
        
        if (!username || !password) {
            _updateStatusDisplay('error', 'Please enter both username and password');
            return;
        }
        
        _isLoggingIn = true;
        _updateUI();
        _updateStatusDisplay('testing', 'Logging in...');
        
        console.log('🔐 Attempting login for user:', username);
        
        // Call the Map Engine Viewer login endpoint
        var apiUrl = _getBackendUrl() + '/api/authenticate/map-viewer';
        
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Important for session cookies
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(function(response) {
            if (response.ok) {
                return response.json();
            } else if (response.status === 401) {
                throw new Error('Invalid username or password');
            } else {
                throw new Error('Login failed (HTTP ' + response.status + ')');
            }
        })
        .then(function(data) {
            console.log('✅ Login successful:', data.username);
            
            // Save login state
            _isLoggedIn = true;
            _currentUsername = data.username;
            
            // Save to localStorage
            _saveLoginStatus(true, data.username, data.session_id);
            
            // Clear password field for security
            if (_elements.passwordInput) {
                _elements.passwordInput.value = '';
            }
            
            // Update UI
            _updateLoginUI();
            _updateStatusDisplay('success', 'Logged in as ' + data.username);
            
            // Auto-load overlays after successful login
            console.log('🔄 Login successful, auto-loading overlays...');
            if (window.App && window.App.Map && window.App.Map.PdfOverlays) {
                // Use direct API loading with session cookies
                setTimeout(function() {
                    window.App.Map.PdfOverlays.loadFromAPI();
                }, 500);
                _updateStatusDisplay('success', 'Logged in as ' + data.username);
            } else {
                _updateStatusDisplay('success', 'Logged in as ' + data.username);
            }
        })
        .catch(function(error) {
            console.error('❌ Login failed:', error);
            _updateStatusDisplay('error', 'Login failed: ' + error.message);
        })
        .finally(function() {
            _isLoggingIn = false;
            _updateUI();
        });
    }
    
    /**
     * Handle logout action
     * @private
     */
    function _handleLogout() {
        console.log('🔓 Logging out user:', _currentUsername);
        
        // Clear login state
        _isLoggedIn = false;
        _currentUsername = null;
        
        // Clear storage
        localStorage.removeItem(LOGIN_STATUS_KEY);
        
        // Clear form fields
        if (_elements.usernameInput) _elements.usernameInput.value = '';
        if (_elements.passwordInput) _elements.passwordInput.value = '';
        
        // Update UI
        _updateLoginUI();
        _updateStatusDisplay('info', 'Logged out successfully');
        
        console.log('✅ User logged out successfully');
    }
    
    /**
     * Update login UI based on authentication state
     * @private
     */
    function _updateLoginUI() {
        console.log('🔄 Updating login UI, logged in:', _isLoggedIn, 'username:', _currentUsername);
        
        if (_isLoggedIn && _currentUsername) {
            // Show logout state
            if (_elements.loginBtn) {
                _elements.loginBtn.style.display = 'none';
            }
            if (_elements.logoutBtn) {
                _elements.logoutBtn.style.display = 'block';
            }
            
            // Disable input fields
            if (_elements.usernameInput) {
                _elements.usernameInput.disabled = true;
            }
            if (_elements.passwordInput) {
                _elements.passwordInput.disabled = true;
            }
        } else {
            // Show login state
            if (_elements.loginBtn) {
                _elements.loginBtn.style.display = 'block';
            }
            if (_elements.logoutBtn) {
                _elements.logoutBtn.style.display = 'none';
            }
            
            // Enable input fields
            if (_elements.usernameInput) {
                _elements.usernameInput.disabled = false;
            }
            if (_elements.passwordInput) {
                _elements.passwordInput.disabled = false;
            }
        }
    }
    
    /**
     * Update UI state
     * @private
     */
    function _updateUI() {
        // Login form state
        var hasCredentials = _elements.usernameInput && _elements.passwordInput && 
                           _elements.usernameInput.value.trim().length > 0 && 
                           _elements.passwordInput.value.length > 0;
        
        if (_elements.loginBtn) {
            _elements.loginBtn.disabled = !hasCredentials || _isLoggingIn || _isLoggedIn;
        }
        
        // Update login/logout UI
        _updateLoginUI();
    }
    
    /**
     * Update status display
     * @private
     */
    function _updateStatusDisplay(type, message) {
        if (!_elements.statusContainer) return;
        
        // Show status container
        _elements.statusContainer.style.display = 'block';
        
        // Update icon and text based on type
        var iconName = 'info-circle';
        var iconColor = '#0066cc';
        
        switch (type) {
            case 'success':
                iconName = 'check-circle';
                iconColor = '#28a745';
                break;
            case 'error':
                iconName = 'x-circle';
                iconColor = '#dc3545';
                break;
            case 'testing':
                iconName = 'arrow-clockwise';
                iconColor = '#fd7e14';
                break;
            case 'info':
            default:
                iconName = 'info-circle';
                iconColor = '#0066cc';
                break;
        }
        
        if (_elements.statusIcon) {
            _elements.statusIcon.name = iconName;
            _elements.statusIcon.style.color = iconColor;
        }
        
        if (_elements.statusText) {
            _elements.statusText.textContent = message || '';
        }
        
        if (_elements.lastTested) {
            _elements.lastTested.textContent = 'Last tested: ' + new Date().toLocaleString();
        }
        
        console.log('Status updated:', type, message);
    }
    
    // Public API
    return {
        /**
         * Initialize the module
         */
        initialize: initialize,
        
        /**
         * Check if user is logged in
         * @returns {boolean} True if logged in
         */
        isLoggedIn: function() {
            return _isLoggedIn;
        },
        
        /**
         * Get current username
         * @returns {string|null} Current username
         */
        getUsername: function() {
            return _currentUsername;
        },
        
        /**
         * Trigger login programmatically
         */
        login: function() {
            _handleLogin();
        },
        
        /**
         * Trigger logout programmatically
         */
        logout: function() {
            _handleLogout();
        },
        
        /**
         * Update status display programmatically
         */
        updateStatus: function(type, message) {
            _updateStatusDisplay(type, message);
        }
    };
})();