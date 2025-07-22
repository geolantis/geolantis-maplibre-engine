# MapLibre Engine Sharing Manual

This manual explains how to share the MapLibre engine between the Tools frontend project and the Android Geolantis 360 project using Git submodules.

## Overview

The MapLibre engine is currently duplicated between:
- **Tools (Leading)**: `/public/map-engine-0912/` 
- **Android (Manual Copy)**: `/app/src/main/assets/engine_ml/`

This setup creates a **shared repository** that both projects reference as a Git submodule, enabling bidirectional development while eliminating manual copying.

## Architecture

```
geolantis-maplibre-engine (Shared Repository)
├── src/
├── assets/
├── css/
├── package.json
└── README.md

Tools Project                    Android Project
├── public/                      ├── app/src/main/assets/
│   └── map-engine/ ────────────────── └── engine_ml/ ──┐
│       (submodule)                      (submodule)    │
└── ...                          └── ...               │
                                                        │
                                Both point to same repo ┘
```

## Implementation Steps

### Phase 1: Create Shared Repository

1. **Create new repository** on GitHub/GitLab:
   ```bash
   # Repository name: geolantis-maplibre-engine
   # Description: Shared MapLibre engine for Tools and Android projects
   ```

2. **Initialize from Tools version** (current leading version):
   ```bash
   cd /path/to/tools/public/map-engine-0912/
   
   # Initialize as Git repository
   git init
   git add .
   git commit -m "Initial commit: MapLibre engine from Tools project"
   
   # Connect to remote
   git remote add origin https://github.com/geolantis/geolantis-maplibre-engine.git
   git branch -M main
   git push -u origin main
   ```

### Phase 2: Convert Tools Project to Submodule

1. **Backup current engine**:
   ```bash
   cd /path/to/tools/public/
   mv map-engine-0912 map-engine-0912-backup
   ```

2. **Add as submodule**:
   ```bash
   cd /path/to/tools/public/
   git submodule add https://github.com/geolantis/geolantis-maplibre-engine.git map-engine-0912
   git add .gitmodules map-engine-0912
   git commit -m "Convert MapLibre engine to shared submodule"
   ```

3. **Verify setup**:
   ```bash
   cd map-engine-0912
   git remote -v  # Should show origin pointing to shared repo
   ```

### Phase 3: Convert Android Project to Submodule

1. **Remove old engine**:
   ```bash
   cd /path/to/android/app/src/main/assets/
   rm -rf engine_ml
   ```

2. **Add as submodule**:
   ```bash
   cd /path/to/android/app/src/main/assets/
   git submodule add https://github.com/geolantis/geolantis-maplibre-engine.git engine_ml
   git add .gitmodules engine_ml
   git commit -m "Convert MapLibre engine to shared submodule"
   ```

## Development Workflow

### Making Changes

#### From Tools Project:
```bash
cd /path/to/tools/public/map-engine-0912/
# Make changes (UI, features, etc.)
git add .
git commit -m "Update UI components"
git push origin main

# Update Tools parent project
cd /path/to/tools/
git add public/map-engine-0912
git commit -m "Update MapLibre engine"
git push
```

#### From Android Project:
```bash
cd /path/to/android/app/src/main/assets/engine_ml/
# Make changes (bridge, Android-specific features)
git add .
git commit -m "Update Android bridge interface"
git push origin main

# Update Android parent project  
cd /path/to/android/
git add app/src/main/assets/engine_ml
git commit -m "Update MapLibre engine"
git push
```

### Synchronizing Changes

#### Pull latest changes to Tools:
```bash
cd /path/to/tools/public/map-engine-0912/
git pull origin main
cd /path/to/tools/
git add public/map-engine-0912
git commit -m "Sync MapLibre engine updates"
```

#### Pull latest changes to Android:
```bash
cd /path/to/android/app/src/main/assets/engine_ml/
git pull origin main
cd /path/to/android/
git add app/src/main/assets/engine_ml
git commit -m "Sync MapLibre engine updates"
```

#### Auto-update submodules:
```bash
# From either project root
git submodule update --remote
git add .
git commit -m "Auto-update MapLibre engine submodule"
```

## Best Practices

### Branch Strategy
```bash
# Feature development
git checkout -b feature/new-map-feature
# Make changes
git commit -m "Add new map feature"
git push origin feature/new-map-feature
# Create PR/MR to main

# Hotfixes
git checkout -b hotfix/bridge-fix
# Fix critical issue
git commit -m "Fix bridge interface bug"
git push origin hotfix/bridge-fix
# Merge immediately to main
```

### Project-Specific Changes
- **Tools-specific**: UI components, web-specific features
- **Android-specific**: Bridge interfaces, WebView compatibility
- **Shared**: Core map functionality, utilities, styles

### Handling Conflicts
```bash
# When both projects modify same files
cd shared-engine/
git pull origin main  # May show conflicts
# Resolve conflicts in IDE
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

## Troubleshooting

### Submodule Not Updating
```bash
git submodule update --init --recursive
git submodule update --remote
```

### Detached HEAD State
```bash
cd submodule-directory/
git checkout main
git pull origin main
```

### Reset Submodule
```bash
git submodule deinit -f path/to/submodule
git rm -f path/to/submodule
git submodule add https://github.com/geolantis/geolantis-maplibre-engine.git path/to/submodule
```

## Benefits

- ✅ **Single source of truth** for MapLibre engine
- ✅ **Bidirectional development** - both projects can contribute  
- ✅ **Version control** for all changes with full history
- ✅ **Eliminates manual copying** and sync issues
- ✅ **Independent project development** while sharing core engine
- ✅ **Merge conflict resolution** when both projects change same files

## Migration Checklist

- [ ] Create shared repository from Tools version
- [ ] Convert Tools to use submodule
- [ ] Test Tools functionality with submodule
- [ ] Convert Android to use submodule  
- [ ] Test Android WebView with submodule
- [ ] Update CI/CD pipelines for submodule handling
- [ ] Document project-specific development guidelines
- [ ] Train team on submodule workflow

---

*This manual assumes familiarity with Git submodules. For Git submodule basics, see: https://git-scm.com/book/en/v2/Git-Tools-Submodules*