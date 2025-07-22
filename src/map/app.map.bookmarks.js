App.Map.Bookmarks = (function() {
    var _bookmarks = [];
    var _storageKey = 'geo360_map_bookmarks';
    var _map = null;
    var _initialized = false;
    var _container = null;
    
    var _generateId = function() {
        return 'bookmark_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    };
    
    var _saveBookmarks = function() {
        try {
            localStorage.setItem(_storageKey, JSON.stringify(_bookmarks));
            App.Core.Events.trigger('bookmarks:saved', _bookmarks);
        } catch (error) {
            console.error('Error saving bookmarks:', error);
        }
    };
    
    var _loadBookmarks = function() {
        try {
            var stored = localStorage.getItem(_storageKey);
            if (stored) {
                _bookmarks = JSON.parse(stored);
                App.Core.Events.trigger('bookmarks:loaded', _bookmarks);
            }
        } catch (error) {
            console.error('Error loading bookmarks:', error);
            _bookmarks = [];
        }
    };
    
    var _captureCurrentView = function() {
        if (!_map) return null;
        
        var center = _map.getCenter();
        var zoom = _map.getZoom();
        var bearing = _map.getBearing();
        var pitch = _map.getPitch();
        
        return {
            center: [center.lng, center.lat],
            zoom: zoom,
            bearing: bearing,
            pitch: pitch
        };
    };
    
    var _flyToBookmark = function(bookmark) {
        if (!_map || !bookmark.view) return;
        
        _map.flyTo({
            center: bookmark.view.center,
            zoom: bookmark.view.zoom,
            bearing: bookmark.view.bearing,
            pitch: bookmark.view.pitch,
            duration: 1500
        });
        
        App.Core.Events.trigger('bookmark:applied', bookmark);
    };
    
    var _createBookmark = function(name) {
        var view = _captureCurrentView();
        if (!view) return null;
        
        var bookmark = {
            id: _generateId(),
            name: name || App.I18n.t('ui.bookmarks.bookmarkPrefix') + ' ' + (_bookmarks.length + 1),
            view: view,
            createdAt: new Date().toISOString()
        };
        
        _bookmarks.push(bookmark);
        _saveBookmarks();
        
        App.Core.Events.trigger('bookmark:created', bookmark);
        
        return bookmark;
    };
    
    var _deleteBookmark = function(id) {
        var index = _bookmarks.findIndex(b => b.id === id);
        if (index === -1) return false;
        
        var deleted = _bookmarks.splice(index, 1)[0];
        _saveBookmarks();
        
        App.Core.Events.trigger('bookmark:deleted', deleted);
        
        return true;
    };
    
    var _updateBookmark = function(id, updates) {
        var bookmark = _bookmarks.find(b => b.id === id);
        if (!bookmark) return false;
        
        if (updates.name !== undefined) {
            bookmark.name = updates.name;
        }
        
        if (updates.view !== undefined) {
            bookmark.view = updates.view;
        }
        
        _saveBookmarks();
        
        App.Core.Events.trigger('bookmark:updated', bookmark);
        
        return true;
    };
    
    var _reorderBookmarks = function(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= _bookmarks.length || 
            toIndex < 0 || toIndex >= _bookmarks.length) {
            return false;
        }
        
        var bookmark = _bookmarks.splice(fromIndex, 1)[0];
        _bookmarks.splice(toIndex, 0, bookmark);
        
        _saveBookmarks();
        
        App.Core.Events.trigger('bookmarks:reordered', {
            fromIndex: fromIndex,
            toIndex: toIndex,
            bookmarks: _bookmarks
        });
        
        return true;
    };
    
    var _initializeUI = function() {
        _container = document.getElementById('bookmarks-container');
        if (!_container) {
            console.warn('Bookmarks container not found');
            return;
        }
        
        _renderBookmarks();
        _setupDragAndDrop();
    };
    
    var _renderBookmarks = function() {
        if (!_container) {
            _container = document.getElementById('bookmarks-container');
        }
        if (!_container) return;
        
        _container.innerHTML = '';
        
        if (_bookmarks.length === 0) {
            _container.innerHTML = '<div class="empty-state">' + App.I18n.t('ui.bookmarks.empty') + '</div>';
            return;
        }
        
        _bookmarks.forEach((bookmark, index) => {
            var item = _createBookmarkItem(bookmark, index);
            _container.appendChild(item);
        });
    };
    
    var _createBookmarkItem = function(bookmark, index) {
        var item = document.createElement('div');
        item.className = 'bookmark-item';
        item.dataset.bookmarkId = bookmark.id;
        item.dataset.index = index;
        item.draggable = true;
        
        var content = document.createElement('div');
        content.className = 'bookmark-content';
        
        var name = document.createElement('span');
        name.className = 'bookmark-name';
        name.textContent = bookmark.name;
        content.appendChild(name);
        
        var actions = document.createElement('div');
        actions.className = 'bookmark-actions';
        
        var dragHandle = document.createElement('sl-icon-button');
        dragHandle.name = 'grip-vertical';
        dragHandle.className = 'drag-handle';
        dragHandle.setAttribute('label', App.I18n.t('ui.bookmarks.dragToReorder'));
        actions.appendChild(dragHandle);
        
        var flyToBtn = document.createElement('sl-icon-button');
        flyToBtn.name = 'crosshair';
        flyToBtn.setAttribute('label', App.I18n.t('ui.bookmarks.goToBookmark'));
        flyToBtn.addEventListener('click', function() {
            _flyToBookmark(bookmark);
        });
        actions.appendChild(flyToBtn);
        
        var deleteBtn = document.createElement('sl-icon-button');
        deleteBtn.name = 'trash';
        deleteBtn.setAttribute('label', App.I18n.t('ui.bookmarks.deleteBookmark'));
        deleteBtn.addEventListener('click', function() {
            _showDeleteConfirmation(bookmark);
        });
        actions.appendChild(deleteBtn);
        
        item.appendChild(content);
        item.appendChild(actions);
        
        content.addEventListener('click', function() {
            _flyToBookmark(bookmark);
        });
        
        return item;
    };
    
    var _showDeleteConfirmation = function(bookmark) {
        var dialog = document.createElement('sl-dialog');
        dialog.label = App.I18n.t('ui.bookmarks.deleteBookmark');
        dialog.innerHTML = `
            <p>Are you sure you want to delete "${bookmark.name}"?</p>
            <sl-button slot="footer" variant="default" onclick="this.closest('sl-dialog').hide()">Cancel</sl-button>
            <sl-button slot="footer" variant="danger" onclick="App.Map.Bookmarks.deleteBookmark('${bookmark.id}'); this.closest('sl-dialog').hide()">Delete</sl-button>
        `;
        document.body.appendChild(dialog);
        dialog.show();
        
        dialog.addEventListener('sl-after-hide', function() {
            dialog.remove();
        });
    };
    
    var _setupDragAndDrop = function() {
        if (!_container) return;
        
        var draggedElement = null;
        var draggedIndex = null;
        
        _container.addEventListener('dragstart', function(e) {
            if (!e.target.classList.contains('bookmark-item')) return;
            
            draggedElement = e.target;
            draggedIndex = parseInt(e.target.dataset.index);
            e.target.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        _container.addEventListener('dragend', function(e) {
            if (!e.target.classList.contains('bookmark-item')) return;
            
            e.target.classList.remove('dragging');
            draggedElement = null;
            draggedIndex = null;
        });
        
        _container.addEventListener('dragover', function(e) {
            e.preventDefault();
            if (!draggedElement) return;
            
            var afterElement = _getDragAfterElement(_container, e.clientY);
            if (afterElement == null) {
                _container.appendChild(draggedElement);
            } else {
                _container.insertBefore(draggedElement, afterElement);
            }
        });
        
        _container.addEventListener('drop', function(e) {
            e.preventDefault();
            if (!draggedElement) return;
            
            var allItems = [..._container.querySelectorAll('.bookmark-item')];
            var newIndex = allItems.indexOf(draggedElement);
            
            if (draggedIndex !== newIndex) {
                _reorderBookmarks(draggedIndex, newIndex);
                _renderBookmarks();
            }
        });
    };
    
    var _getDragAfterElement = function(container, y) {
        var draggableElements = [...container.querySelectorAll('.bookmark-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            var box = child.getBoundingClientRect();
            var offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    };
    
    return {
        initialize: function(map) {
            if (_initialized) return;
            
            _map = map || App.Map.Init.getMap();
            
            _loadBookmarks();
            
            App.Core.Events.on('drawer:shown', function(drawerId) {
                if (drawerId === 'left1-drawer') {
                    setTimeout(_initializeUI, 100);
                }
            });
            
            // Also listen for tab changes
            document.addEventListener('sl-tab-show', function(event) {
                if (event.detail.name === 'bookmarks') {
                    setTimeout(_initializeUI, 100);
                }
            });
            
            _initialized = true;
        },
        
        createBookmark: function(name) {
            return _createBookmark(name);
        },
        
        deleteBookmark: function(id) {
            var result = _deleteBookmark(id);
            if (result) {
                _renderBookmarks();
            }
            return result;
        },
        
        updateBookmark: function(id, updates) {
            var result = _updateBookmark(id, updates);
            if (result) {
                _renderBookmarks();
            }
            return result;
        },
        
        getBookmarks: function() {
            return [..._bookmarks];
        },
        
        getBookmark: function(id) {
            return _bookmarks.find(b => b.id === id);
        },
        
        flyToBookmark: function(id) {
            var bookmark = _bookmarks.find(b => b.id === id);
            if (bookmark) {
                _flyToBookmark(bookmark);
            }
        },
        
        showCreateDialog: function() {
            var dialog = document.createElement('sl-dialog');
            dialog.label = 'Create Bookmark';
            dialog.innerHTML = `
                <sl-input id="bookmark-name" label="Name" placeholder="Enter bookmark name" autofocus></sl-input>
                <sl-button slot="footer" variant="default" onclick="this.closest('sl-dialog').hide()">Cancel</sl-button>
                <sl-button slot="footer" variant="primary" id="create-bookmark-btn">Create</sl-button>
            `;
            document.body.appendChild(dialog);
            
            var createBtn = dialog.querySelector('#create-bookmark-btn');
            var nameInput = dialog.querySelector('#bookmark-name');
            
            var handleCreate = function() {
                var name = nameInput.value.trim();
                if (!name) {
                    name = 'Bookmark ' + (_bookmarks.length + 1);
                }
                App.Map.Bookmarks.createBookmark(name);
                dialog.hide();
                _renderBookmarks();
            };
            
            createBtn.addEventListener('click', handleCreate);
            nameInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handleCreate();
                }
            });
            
            dialog.show();
            
            dialog.addEventListener('sl-after-hide', function() {
                dialog.remove();
            });
        }
    };
})();