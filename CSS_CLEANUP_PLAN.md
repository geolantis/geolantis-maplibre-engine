# CSS Cleanup Plan

## Analysis Summary
- **Total CSS rules**: 777
- **Unused rules**: 507 (65%)
- **Duplicate/Override issues**: 588
- **CSS files**: 16 files

## Cleanup Strategy

### Phase 1: Quick Wins (Safe Changes)
These changes have minimal risk and can be done immediately:

1. **Fix CSS Syntax Error**
   - File: `src/css/styles.css:484`
   - Issue: Unknown word `//rgba` (invalid comment syntax)
   - Action: Change `//` to `/* */` for CSS comments

2. **Remove Exact Duplicates**
   - Target duplicate rules that are identical
   - Priority: Files with most duplicates first
   - Tool: Use the analyzer report to identify exact matches

3. **Clean Up Test/Demo Selectors**
   - Remove obvious test classes not used in production
   - Look for patterns like `.test-*`, `.demo-*`, `.example-*`

### Phase 2: Component-Based Cleanup (Medium Risk)
Review and clean up by component:

1. **Button Themes** (`button-themes.css`)
   - Many unused theme variations
   - Consolidate to actively used themes only
   - Keep: default, active button states
   - Review: color themes (steelblue), size variations

2. **Drawer/Tab Components** (`drawer-tabs.css`)
   - Duplicate rules for `#left1-drawer` and `#left2-drawer`
   - Consider using shared classes instead of ID-specific rules
   - Many unused drawer states

3. **Sidebar Components**
   - Multiple sidebar CSS files with overlapping rules
   - Files: `sidebar-width-fix.css`, `sidebar-headers.css`, `responsive-sidebar.css`
   - Consolidate into single sidebar stylesheet

4. **Mobile Overrides** (`mobile-overrides.css`)
   - Review if all mobile-specific rules are still needed
   - Check against current responsive design

### Phase 3: Deep Cleanup (Higher Risk)
Requires thorough testing:

1. **MapLibre GL Overrides**
   - File: `maplibre-gl.css`
   - Custom overrides for map controls
   - Test each removal with map functionality

2. **Legacy/Deprecated Styles**
   - Icon systems (Lucide icons CSS)
   - Old component styles (objectinfo, RadialMenu)
   - Verify components are still in use

3. **Framework Overrides**
   - Shoelace custom styles
   - Ensure removing doesn't break UI components

### Phase 4: Consolidation
After cleanup:

1. **Merge Related Files**
   - Combine all sidebar CSS into one file
   - Merge responsive styles into component files
   - Consolidate theme variations

2. **Create CSS Architecture**
   ```
   css/
   ├── base/
   │   ├── reset.css
   │   ├── variables.css
   │   └── typography.css
   ├── components/
   │   ├── buttons.css
   │   ├── sidebar.css
   │   ├── map-controls.css
   │   └── drawers.css
   ├── themes/
   │   └── theme-variations.css
   └── main.css (imports all)
   ```

## Implementation Steps

### Step 1: Backup Current CSS
```bash
cp -r src/css src/css-backup-$(date +%Y%m%d)
```

### Step 2: Fix Syntax Errors
- Fix the `//rgba` comment issue in styles.css

### Step 3: Run Safe Cleanups
- Remove exact duplicates
- Clean obvious unused test classes

### Step 4: Test After Each Component Cleanup
- Clean one component at a time
- Test functionality after each change
- Document what was removed

### Step 5: Consolidate Files
- After individual file cleanup
- Merge related styles
- Update HTML/JS imports

## Testing Checklist
After each cleanup phase, test:

- [ ] Map loads and displays correctly
- [ ] All map controls work (zoom, navigation, etc.)
- [ ] Sidebar opens/closes properly
- [ ] Tab navigation functions
- [ ] Mobile responsive behavior
- [ ] Theme switching (if applicable)
- [ ] Search functionality
- [ ] Layer controls
- [ ] Any custom UI components

## Risk Mitigation

1. **Version Control**
   - Commit before each phase
   - Create feature branch for cleanup

2. **Progressive Enhancement**
   - Start with lowest risk changes
   - Test thoroughly between phases

3. **Documentation**
   - Document removed selectors
   - Note any functionality changes

4. **Rollback Plan**
   - Keep CSS backup
   - Git commits for each phase
   - Can revert individual changes

## Expected Outcomes

- **File size reduction**: ~50-60% smaller CSS
- **Performance**: Faster CSS parsing and rendering
- **Maintainability**: Clearer component structure
- **Developer experience**: Easier to find and modify styles

## Timeline Estimate

- Phase 1: 1-2 hours
- Phase 2: 3-4 hours
- Phase 3: 4-6 hours
- Phase 4: 2-3 hours

Total: 10-15 hours of work including testing