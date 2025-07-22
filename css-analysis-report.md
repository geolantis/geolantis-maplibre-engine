# CSS Analysis Report
Generated on: 2025-06-04T18:22:34.493Z

## Summary
- Total CSS rules analyzed: 1334
- Unused rules found: 866
- Duplicate/Override issues found: 1965
- Used classes detected: 209
- Used IDs detected: 53

## Unused CSS Rules

### src/css-backup-20250604/button-themes.css
- **:root** (line 4)
  Properties: --primary-color
- **.maplibregl-ctrl button:not(:disabled):is(.active** (line 58)
  Properties: background-color, border-color
- **.maplibregl-ctrl button:not(:disabled):is(.active** (line 68)
  Properties: color
- **.-active)** (line 58)
  Properties: background-color, border-color
- **.-active)** (line 68)
  Properties: color
- **body.color-theme-steelblue** (line 9)
  Properties: --primary-color
- **.button-size-large .sidebar-toggle** (line 26)
  Properties: width, height
- **.button-size-large .maplibregl-ctrl button** (line 26)
  Properties: width, height
- **.button-size-small .maplibregl-ctrl-icon:before** (line 33)
  Properties: width, height, font-size
- **.button-size-medium .maplibregl-ctrl-icon:before** (line 41)
  Properties: width, height, font-size
- **.button-size-large .sidebar-toggle svg** (line 49)
  Properties: width, height, font-size
- **.button-size-large .maplibregl-ctrl button svg** (line 49)
  Properties: width, height, font-size
- **.button-size-large .maplibregl-ctrl-icon:before** (line 49)
  Properties: width, height, font-size
- **.basemap-radio[checked]::part(control)** (line 58)
  Properties: background-color, border-color
- **sl-switch::part(control):checked** (line 58)
  Properties: background-color, border-color
- **.maplibregl-ctrl-geolocate-active .maplibregl-ctrl-icon:before** (line 68)
  Properties: color
- **.basemap-radio[checked]::part(base)** (line 74)
  Properties: border-left-color
- **.controls button:hover** (line 85)
  Properties: background-color, opacity
- **.control-group** (line 91)
  Properties: margin
- **.control-group sl-label** (line 95)
  Properties: display, margin-bottom, font-weight
- **sl-radio-group** (line 101)
  Properties: width
- **sl-radio** (line 105)
  Properties: margin-bottom, display

### src/css-backup-20250604/drawer-tabs.css
- **#left1-drawer sl-tab-group[placement="start"]** (line 7)
  Properties: height, display, margin-top
- **#left1-drawer sl-tab-group[placement="start"]** (line 334)
  Properties: height, display, margin-top...
- **#left2-drawer sl-tab-group[placement="start"]** (line 7)
  Properties: height, display, margin-top
- **#left2-drawer sl-tab-group[placement="start"]** (line 334)
  Properties: height, display, margin-top...
- **#left1-drawer sl-tab-group::part(nav)** (line 14)
  Properties: min-width, width, align-items...
- **#left2-drawer sl-tab-group::part(nav)** (line 14)
  Properties: min-width, width, align-items...
- **#left1-drawer sl-tab[active] sl-icon** (line 35)
  Properties: color
- **#left2-drawer sl-tab[active] sl-icon** (line 35)
  Properties: color
- **#left1-drawer sl-icon::part(base)** (line 41)
  Properties: outline
- **#left2-drawer sl-icon::part(base)** (line 41)
  Properties: outline
- **#left1-drawer sl-tab::part(base)** (line 57)
  Properties: padding, margin, border-radius...
- **#left2-drawer sl-tab::part(base)** (line 57)
  Properties: padding, margin, border-radius...
- **#left1-drawer sl-tab::part(base):hover** (line 70)
  Properties: background-color
- **#left2-drawer sl-tab::part(base):hover** (line 70)
  Properties: background-color
- **#left1-drawer sl-tab[active]::part(base)** (line 75)
  Properties: background-color
- **#left2-drawer sl-tab[active]::part(base)** (line 75)
  Properties: background-color
- **#left2-drawer sl-switch:hover** (line 165)
  Properties: background-color
- **#left2-drawer sl-switch::part(base)** (line 169)
  Properties: width, display, justify-content...
- **#left2-drawer sl-switch::part(base)** (line 354)
  Properties: width, display, justify-content...
- **#left2-drawer sl-switch::part(label)** (line 177)
  Properties: font-size, color, text-align...
- **#left2-drawer sl-switch::part(control)** (line 186)
  Properties: margin-left, position
- **#left2-drawer .settings-buttons button:hover** (line 226)
  Properties: background-color
- **#left1-drawer .overlaycontrols sl-button::part(base)** (line 266)
  Properties: width, justify-content, text-align...
- **#left1-drawer .overlaycontrols sl-button::part(base):hover** (line 276)
  Properties: background-color
- **#left1-drawer sl-tab-group::part(body)** (line 281)
  Properties: flex, min-width, overflow...
- **#left1-drawer sl-tab-group::part(body)** (line 296)
  Properties: padding, flex, min-width
- **#left1-drawer sl-tab-group::part(body)** (line 316)
  Properties: flex, min-width, overflow...
- **#left1-drawer sl-tab-group::part(body)** (line 405)
  Properties: flex, width, min-width...
- **#left2-drawer sl-tab-group::part(body)** (line 281)
  Properties: flex, min-width, overflow...
- **#left2-drawer sl-tab-group::part(body)** (line 296)
  Properties: padding, flex, min-width
- **#left2-drawer sl-tab-group::part(body)** (line 316)
  Properties: flex, min-width, overflow...
- **#left2-drawer sl-tab-group::part(body)** (line 405)
  Properties: flex, width, min-width...
- **#left1-drawer sl-tab-group[placement="start"]::part(nav)** (line 290)
  Properties: padding-top
- **#left2-drawer sl-tab-group[placement="start"]::part(nav)** (line 290)
  Properties: padding-top
- **#sl-tab-panel-4** (line 372)
  Properties: width, box-sizing
- **#sl-tab-panel-1** (line 376)
  Properties: width, max-width, min-width...
- **sl-tab-panel[name="baselayers"]** (line 416)
  Properties: width, max-width, min-width...
- **sl-tab-panel[name="overlays"]** (line 416)
  Properties: width, max-width, min-width...
- **sl-tab-panel[name="tools"]** (line 416)
  Properties: width, max-width, min-width...
- **sl-tab-group::part(body)** (line 429)
  Properties: width, max-width, overflow-x...
- **sl-tab-group[placement="start"]** (line 439)
  Properties: width, max-width, display...
- **sl-tab-group[placement="start"]::part(nav)** (line 447)
  Properties: flex, width, min-width...
- **sl-tab-panel::part(base)** (line 470)
  Properties: padding

### src/css-backup-20250604/layer-catogories.css
- **:root** (line 358)
  Properties: --geolantis-blue
- **#left4** (line 4)
  Properties: overflow
- **#left4 .sidebar-content** (line 8)
  Properties: padding, width, box-sizing
- **.layer-list-header** (line 15)
  Properties: background, color, padding...
- **.layer-list-header sl-button** (line 28)
  Properties: --sl-color-neutral-0, --sl-color-neutral-700, --sl-input-border-color...
- **.layer-list-header sl-button:hover** (line 42)
  Properties: background-color
- **.layer-list-title** (line 46)
  Properties: font-size, font-weight, font-family...
- **.lc-layer-controls-header::after** (line 71)
  Properties: content, position, left...
- **.lc-layer-controls-header::after** (line 457)
  Properties: content, position, left...
- **.lc-layer-controls-header::after** (line 498)
  Properties: content, position, left...
- **.lc-layer-controls-description** (line 81)
  Properties: font-size, color, font-weight...
- **.lc-category-header:hover** (line 145)
  Properties: background
- **sl-icon[name="chevron-down"]** (line 165)
  Properties: width, height, flex-shrink...
- **.lc-category:not(.expanded) sl-icon[name="chevron-down"]** (line 173)
  Properties: transform
- **.lc-feature-item:hover** (line 211)
  Properties: background
- **.lc-feature-content::before** (line 224)
  Properties: content, width, flex-shrink
- **.lc-feature-content::before** (line 416)
  Properties: display
- **.lc-feature-icon.point** (line 267)
  Properties: width, height, border-radius...
- **.lc-feature-icon.line** (line 274)
  Properties: width, height, background-color...
- **.lc-feature-icon.polygon** (line 281)
  Properties: width, height, border...
- **sl-checkbox::part(base)** (line 289)
  Properties: --sl-input-height-small
- **sl-checkbox::part(control)** (line 293)
  Properties: width, height, background-color...
- **sl-checkbox[checked]::part(control)** (line 302)
  Properties: background-color, border-color
- **sl-checkbox[checked] svg** (line 308)
  Properties: display
- **sl-checkbox[checked]::part(control)::after** (line 313)
  Properties: content, position, left...
- **sl-icon-button::part(base)** (line 327)
  Properties: height, width, align-items...
- **sl-icon-button::part(base):hover** (line 336)
  Properties: color
- **#expandCollapseAll::part(base)** (line 378)
  Properties: background-color, color, border...
- **#expandCollapseAll::part(base):hover** (line 386)
  Properties: background-color, box-shadow
- **#expandCollapseAll::part(base):focus** (line 391)
  Properties: box-shadow, outline
- **#expandCollapseAll:hover** (line 440)
  Properties: background
- **.lc-layer-controls-master::after** (line 484)
  Properties: content, width, height...
- **.lc-layer-controls-master::after** (line 528)
  Properties: content, width, height...
- **.lc-category-controls sl-icon-button::part(base)** (line 542)
  Properties: width, height, background...
- **.lc-feature-controls sl-icon-button::part(base)** (line 542)
  Properties: width, height, background...
- **sl-checkbox::part(label)** (line 552)
  Properties: user-select, -webkit-user-select, -moz-user-select...
- **sl-switch::part(label)** (line 552)
  Properties: user-select, -webkit-user-select, -moz-user-select...
- **sl-radio::part(label)** (line 552)
  Properties: user-select, -webkit-user-select, -moz-user-select...
- **sl-toggle::part(label)** (line 552)
  Properties: user-select, -webkit-user-select, -moz-user-select...
- **.no-select** (line 564)
  Properties: user-select, -webkit-user-select, -moz-user-select...

### src/css-backup-20250604/mobile-overrides.css
- **:root** (line 8)
  Properties: --sidebar-width
- **:root** (line 104)
  Properties: font-size
- **sl-drawer[placement="start"]::part(panel)** (line 19)
  Properties: width
- **sl-drawer[placement="start"]::part(panel)** (line 33)
  Properties: width, height, border-radius...
- **sl-drawer[placement="start"]::part(panel)** (line 109)
  Properties: width
- **sl-drawer[placement="end"]::part(panel)** (line 19)
  Properties: width
- **sl-drawer[placement="end"]::part(panel)** (line 33)
  Properties: width, height, border-radius...
- **sl-drawer[placement="end"]::part(panel)** (line 109)
  Properties: width
- **sl-drawer[placement="start"]** (line 28)
  Properties: --size
- **sl-drawer[placement="start"]** (line 130)
  Properties: --size
- **sl-drawer[placement="end"]** (line 28)
  Properties: --size
- **sl-drawer[placement="end"]** (line 130)
  Properties: --size
- **sl-drawer#right1-drawer::part(panel)** (line 46)
  Properties: width
- **sl-drawer#right2-drawer::part(panel)** (line 46)
  Properties: width
- **#footer-bar** (line 52)
  Properties: font-size, font-weight, color...
- **#fab-main** (line 77)
  Properties: position, bottom, right...
- **#fab-main** (line 121)
  Properties: bottom, right
- **#fab-main** (line 142)
  Properties: bottom
- **#fab-main:hover** (line 96)
  Properties: background-color

### src/css-backup-20250604/modernstyle.css
- **:root** (line 243)
  Properties: --ml-ctrl-border-radius, --ml-font, --ml-font-attribution...
- **:root** (line 283)
  Properties: --ml-c-bg-1, --ml-c-bg-2, --ml-c-bg-3...
- **:root** (line 296)
  Properties: --ml-c-bg-1, --ml-c-bg-2, --ml-c-bg-3...
- **.maplibregl-ctrl-top-left** (line 1)
  Properties: pointer-events, position, z-index
- **.maplibregl-ctrl-top-left** (line 9)
  Properties: left, top
- **.maplibregl-ctrl-attrib.maplibregl-compact-show** (line 31)
  Properties: visibility
- **.maplibregl-ctrl-attrib.maplibregl-compact-show** (line 491)
  Properties: padding
- **.maplibregl-ctrl-attrib-button** (line 34)
  Properties: display
- **.maplibregl-ctrl-attrib-button** (line 356)
  Properties: border, color, cursor...
- **.maplibregl-ctrl-attrib-button** (line 500)
  Properties: border-radius, position, right...
- **.maplibregl-ctrl-attrib.maplibregl-compact .maplibregl-ctrl-attrib-inner** (line 34)
  Properties: display
- **.maplibregl-ctrl-attrib summary.maplibregl-ctrl-attrib-button** (line 38)
  Properties: -webkit-appearance, -moz-appearance, appearance...
- **.maplibregl-ctrl-attrib
    summary.maplibregl-ctrl-attrib-button::-webkit-details-marker** (line 44)
  Properties: display
- **.maplibregl-ctrl-attrib.maplibregl-compact .maplibregl-ctrl-attrib-button** (line 48)
  Properties: display
- **.maplibregl-ctrl-attrib.maplibregl-compact-show
    .maplibregl-ctrl-attrib-inner** (line 48)
  Properties: display
- **.maplibregl-canvas-container.maplibregl-interactive** (line 65)
  Properties: cursor, -webkit-user-select, -moz-user-select...
- **.maplibregl-canvas-container.maplibregl-interactive:active** (line 72)
  Properties: cursor
- **.maplibregl-ctrl-group button.maplibregl-ctrl-compass:active** (line 72)
  Properties: cursor
- **.maplibregl-boxzoom** (line 76)
  Properties: height, left, position...
- **.maplibregl-boxzoom** (line 710)
  Properties: background, border, border-radius...
- **.maplibregl-cooperative-gesture-screen** (line 83)
  Properties: align-items, display, inset...
- **.maplibregl-cooperative-gesture-screen** (line 716)
  Properties: background, color, font-size...
- **.maplibregl-cooperative-gesture-screen.maplibregl-show** (line 93)
  Properties: opacity
- **.maplibregl-cooperative-gesture-screen.maplibregl-show** (line 724)
  Properties: transition
- **.maplibregl-cooperative-gesture-screen .maplibregl-mobile-message** (line 96)
  Properties: display
- **.maplibregl-cooperative-gesture-screen .maplibregl-mobile-message** (line 103)
  Properties: display
- **.maplibregl-cooperative-gesture-screen .maplibregl-desktop-message** (line 100)
  Properties: display
- **.maplibregl-popup** (line 110)
  Properties: left, position, top...
- **.maplibregl-popup** (line 117)
  Properties: display, pointer-events
- **.maplibregl-popup-anchor-top** (line 121)
  Properties: flex-direction
- **.maplibregl-popup-anchor-top-left** (line 121)
  Properties: flex-direction
- **.maplibregl-popup-anchor-top-right** (line 121)
  Properties: flex-direction
- **.maplibregl-popup-anchor-bottom** (line 126)
  Properties: flex-direction
- **.maplibregl-popup-anchor-bottom-left** (line 126)
  Properties: flex-direction
- **.maplibregl-popup-anchor-bottom-right** (line 126)
  Properties: flex-direction
- **.maplibregl-popup-anchor-left** (line 131)
  Properties: flex-direction
- **.maplibregl-popup-anchor-right** (line 134)
  Properties: flex-direction
- **.maplibregl-popup-tip** (line 137)
  Properties: height, width, z-index
- **.maplibregl-popup-tip** (line 727)
  Properties: border
- **.maplibregl-popup-anchor-top .maplibregl-popup-tip** (line 142)
  Properties: align-self, border-top
- **.maplibregl-popup-anchor-top .maplibregl-popup-tip** (line 730)
  Properties: border-bottom-color
- **.maplibregl-popup-anchor-top-left .maplibregl-popup-tip** (line 146)
  Properties: align-self, border-left, border-top
- **.maplibregl-popup-anchor-top-left .maplibregl-popup-tip** (line 730)
  Properties: border-bottom-color
- **.maplibregl-popup-anchor-top-right .maplibregl-popup-tip** (line 151)
  Properties: align-self, border-right, border-top
- **.maplibregl-popup-anchor-top-right .maplibregl-popup-tip** (line 730)
  Properties: border-bottom-color
- **.maplibregl-popup-anchor-bottom .maplibregl-popup-tip** (line 156)
  Properties: align-self, border-bottom
- **.maplibregl-popup-anchor-bottom .maplibregl-popup-tip** (line 735)
  Properties: border-top-color
- **.maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip** (line 160)
  Properties: align-self, border-bottom, border-left
- **.maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip** (line 735)
  Properties: border-top-color
- **.maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip** (line 165)
  Properties: align-self, border-bottom, border-right
- **.maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip** (line 735)
  Properties: border-top-color
- **.maplibregl-popup-anchor-left .maplibregl-popup-tip** (line 170)
  Properties: align-self, border-left
- **.maplibregl-popup-anchor-left .maplibregl-popup-tip** (line 740)
  Properties: border-right-color
- **.maplibregl-popup-anchor-right .maplibregl-popup-tip** (line 174)
  Properties: align-self, border-right
- **.maplibregl-popup-anchor-right .maplibregl-popup-tip** (line 743)
  Properties: border-left-color
- **.maplibregl-map:hover .maplibregl-popup-track-pointer** (line 187)
  Properties: display
- **.maplibregl-map:active .maplibregl-popup-track-pointer** (line 190)
  Properties: display
- **.maplibregl-popup-content** (line 193)
  Properties: pointer-events, position
- **.maplibregl-popup-content** (line 781)
  Properties: background, border-radius, box-shadow...
- **.maplibregl-canvas-container.maplibregl-interactive.maplibregl-track-pointer** (line 197)
  Properties: cursor
- **.maplibregl-canvas-container.maplibregl-touch-zoom-rotate** (line 200)
  Properties: touch-action
- **.maplibregl-canvas-container.maplibregl-touch-zoom-rotate .maplibregl-canvas** (line 200)
  Properties: touch-action
- **.maplibregl-canvas-container.maplibregl-touch-drag-pan** (line 204)
  Properties: touch-action
- **.maplibregl-canvas-container.maplibregl-touch-drag-pan .maplibregl-canvas** (line 204)
  Properties: touch-action
- **.maplibregl-canvas-container.maplibregl-touch-zoom-rotate.maplibregl-touch-drag-pan** (line 208)
  Properties: touch-action
- **.maplibregl-canvas-container.maplibregl-touch-zoom-rotate.maplibregl-touch-drag-pan
  .maplibregl-canvas** (line 208)
  Properties: touch-action
- **.maplibregl-canvas-container.maplibregl-touch-drag-pan.maplibregl-cooperative-gestures** (line 213)
  Properties: touch-action
- **.maplibregl-canvas-container.maplibregl-touch-drag-pan.maplibregl-cooperative-gestures
  .maplibregl-canvas** (line 213)
  Properties: touch-action
- **.maplibregl-crosshair .maplibregl-interactive:active** (line 218)
  Properties: cursor
- **.maplibregl-canvas** (line 228)
  Properties: left, position, top
- **.maplibregl-map:fullscreen** (line 233)
  Properties: height, width
- **.dark** (line 269)
  Properties: --ml-c-bg-1, --ml-c-bg-2, --ml-c-bg-3...
- **.dark** (line 283)
  Properties: --ml-c-bg-1, --ml-c-bg-2, --ml-c-bg-3...
- **.dark** (line 296)
  Properties: --ml-c-bg-1, --ml-c-bg-2, --ml-c-bg-3...
- **.maplibregl-ctrl-top-left .maplibregl-ctrl** (line 311)
  Properties: float, margin
- **.maplibregl-ctrl-group:not(:empty)** (line 331)
  Properties: box-shadow
- **.maplibregl-ctrl-group:not(:empty)** (line 335)
  Properties: box-shadow
- **.maplibregl-ctrl-group button:first-child** (line 347)
  Properties: border-radius
- **.maplibregl-ctrl-group button:last-child** (line 350)
  Properties: border-radius
- **.maplibregl-ctrl-group button:only-child** (line 353)
  Properties: border-radius
- **.maplibregl-ctrl button:not(:disabled):hover** (line 378)
  Properties: background-color, color
- **.maplibregl-ctrl-attrib-button:not(:disabled):hover** (line 378)
  Properties: background-color, color
- **.maplibregl-ctrl button:not(:disabled):is(.active** (line 383)
  Properties: color
- **.-active)** (line 383)
  Properties: color
- **.maplibregl-ctrl button:not(:disabled):active** (line 386)
  Properties: background-color, box-shadow
- **.maplibregl-ctrl-attrib-button:not(:disabled):active** (line 386)
  Properties: background-color, box-shadow
- **.maplibregl-ctrl button:focus** (line 391)
  Properties: --ml-ring-shadow-active
- **.maplibregl-ctrl button:focus** (line 395)
  Properties: z-index
- **.maplibregl-ctrl-attrib-button:focus** (line 391)
  Properties: --ml-ring-shadow-active
- **.maplibregl-ctrl button:focus:focus-visible** (line 398)
  Properties: --ml-ring-shadow-active
- **.maplibregl-ctrl-attrib-button:focus:focus-visible** (line 398)
  Properties: --ml-ring-shadow-active
- **.maplibregl-ctrl button:focus:not(:focus-visible)** (line 402)
  Properties: --ml-ring-shadow-active
- **.maplibregl-ctrl-attrib-button:focus:not(:focus-visible)** (line 402)
  Properties: --ml-ring-shadow-active
- **.maplibregl-ctrl button::-moz-focus-inner** (line 411)
  Properties: border, padding
- **.maplibregl-ctrl button:disabled** (line 415)
  Properties: cursor
- **.maplibregl-ctrl button:disabled :is(.maplibregl-ctrl-icon:before** (line 418)
  Properties: opacity
- **.maplibregl-ctrl .maplibregl-ctrl-attrib-button:before** (line 421)
  Properties: -webkit-font-smoothing, -moz-osx-font-smoothing, font-variant...
- **.maplibregl-ctrl .maplibregl-ctrl-attrib-button:before** (line 434)
  Properties: font-family
- **.maplibregl-ctrl .maplibregl-ctrl-attrib-button:before** (line 445)
  Properties: display, font-size, font-style...
- **.maplibregl-ctrl button .maplibregl-ctrl-icon:before** (line 421)
  Properties: -webkit-font-smoothing, -moz-osx-font-smoothing, font-variant...
- **.maplibregl-ctrl button .maplibregl-ctrl-icon:before** (line 434)
  Properties: font-family
- **.maplibregl-ctrl button .maplibregl-ctrl-icon:before** (line 445)
  Properties: display, font-size, font-style...
- **.maplibregl-ctrl button.maplibregl-ctrl-compass .maplibregl-ctrl-icon:after** (line 421)
  Properties: -webkit-font-smoothing, -moz-osx-font-smoothing, font-variant...
- **.maplibregl-ctrl button.maplibregl-ctrl-compass .maplibregl-ctrl-icon:after** (line 434)
  Properties: font-family
- **.maplibregl-ctrl button.maplibregl-ctrl-compass .maplibregl-ctrl-icon:after** (line 445)
  Properties: display, font-size, font-style...
- **.maplibregl-ctrl button.maplibregl-ctrl-compass .maplibregl-ctrl-icon:after** (line 681)
  Properties: color, content, left...
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate:disabled
  .maplibregl-ctrl-icon:after** (line 421)
  Properties: -webkit-font-smoothing, -moz-osx-font-smoothing, font-variant...
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate:disabled
  .maplibregl-ctrl-icon:after** (line 434)
  Properties: font-family
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate:disabled
  .maplibregl-ctrl-icon:after** (line 445)
  Properties: display, font-size, font-style...
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate:disabled
  .maplibregl-ctrl-icon:after** (line 590)
  Properties: color, content, left...
- **a.maplibregl-ctrl-logo:before** (line 421)
  Properties: -webkit-font-smoothing, -moz-osx-font-smoothing, font-variant...
- **a.maplibregl-ctrl-logo:before** (line 442)
  Properties: font-family
- **a.maplibregl-ctrl-logo:before** (line 643)
  Properties: color, content, font-size...
- **a.maplibregl-ctrl-logo:before** (line 660)
  Properties: text-stroke, -webkit-text-stroke
- **.maplibregl-ctrl.maplibregl-ctrl-attrib** (line 464)
  Properties: background-color, margin, min-height...
- **.maplibregl-ctrl-bottom-right > .maplibregl-ctrl-attrib** (line 470)
  Properties: border-top-left-radius
- **.maplibregl-ctrl-top-right > .maplibregl-ctrl-attrib** (line 473)
  Properties: border-bottom-left-radius
- **.maplibregl-ctrl-top-left > .maplibregl-ctrl-attrib** (line 476)
  Properties: border-bottom-right-radius
- **.maplibregl-ctrl-bottom-left > .maplibregl-ctrl-attrib** (line 479)
  Properties: border-top-right-radius
- **.maplibregl-ctrl-attrib.maplibregl-compact** (line 483)
  Properties: background-color, border-radius, margin...
- **.maplibregl-ctrl-bottom-left
    > .maplibregl-ctrl-attrib.maplibregl-compact-show** (line 494)
  Properties: border-radius, padding
- **.maplibregl-ctrl-top-left > .maplibregl-ctrl-attrib.maplibregl-compact-show** (line 494)
  Properties: border-radius, padding
- **.maplibregl-ctrl-attrib-button:before** (line 506)
  Properties: content, margin
- **.maplibregl-ctrl-bottom-left .maplibregl-ctrl-attrib-button** (line 510)
  Properties: left
- **.maplibregl-ctrl-top-left .maplibregl-ctrl-attrib-button** (line 510)
  Properties: left
- **.maplibregl-ctrl-attrib-inner** (line 515)
  Properties: line-height
- **.maplibregl-ctrl-attrib a** (line 518)
  Properties: color, text-decoration
- **.maplibregl-ctrl-attrib a:hover** (line 522)
  Properties: color, text-decoration
- **.maplibregl-ctrl
  button.maplibregl-ctrl-fullscreen
  .maplibregl-ctrl-icon:before** (line 529)
  Properties: content
- **.maplibregl-ctrl button.maplibregl-ctrl-shrink .maplibregl-ctrl-icon:before** (line 534)
  Properties: content
- **.maplibregl-user-location-dot** (line 537)
  Properties: background-color, border-radius, height...
- **.maplibregl-user-location-dot:before** (line 537)
  Properties: background-color, border-radius, height...
- **.maplibregl-user-location-dot:before** (line 544)
  Properties: animation, content, position
- **.maplibregl-user-location-dot:after** (line 549)
  Properties: border, border-radius, box-shadow...
- **0%** (line 562)
  Properties: opacity, transform
- **0%** (line 630)
  Properties: transform
- **70%** (line 566)
  Properties: opacity, transform
- **to** (line 570)
  Properties: opacity, transform
- **to** (line 633)
  Properties: transform
- **.maplibregl-user-location-dot-stale:after** (line 578)
  Properties: display
- **.maplibregl-user-location-accuracy-circle** (line 581)
  Properties: background-color, border-radius, height...
- **.maplibregl-ctrl button.maplibregl-ctrl-geolocate .maplibregl-ctrl-icon:before** (line 587)
  Properties: content
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-active
  .maplibregl-ctrl-icon:before** (line 600)
  Properties: color, content
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-active-error
  .maplibregl-ctrl-icon:before** (line 606)
  Properties: color, content
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-background
  .maplibregl-ctrl-icon:before** (line 612)
  Properties: color, content
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-background-error
  .maplibregl-ctrl-icon:before** (line 618)
  Properties: color, content
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-waiting
  .maplibregl-ctrl-icon:before** (line 624)
  Properties: animation
- **a.maplibregl-ctrl-logo** (line 637)
  Properties: cursor, display, margin...
- **.dark a.maplibregl-ctrl-logo:before** (line 655)
  Properties: text-stroke, -webkit-text-stroke
- **.dark a.maplibregl-ctrl-logo:before** (line 660)
  Properties: text-stroke, -webkit-text-stroke
- **a.maplibregl-ctrl-logo:hover:before** (line 666)
  Properties: color
- **a.maplibregl-ctrl-logo.maplibregl-compact:before** (line 669)
  Properties: content
- **.maplibregl-ctrl button.maplibregl-ctrl-zoom-out .maplibregl-ctrl-icon:before** (line 672)
  Properties: content
- **.maplibregl-ctrl button.maplibregl-ctrl-zoom-in .maplibregl-ctrl-icon:before** (line 675)
  Properties: content
- **.maplibregl-ctrl button.maplibregl-ctrl-compass .maplibregl-ctrl-icon:before** (line 678)
  Properties: content
- **.maplibregl-ctrl button.maplibregl-ctrl-terrain .maplibregl-ctrl-icon:before** (line 701)
  Properties: content
- **.maplibregl-ctrl
  button.maplibregl-ctrl-terrain-enabled
  .maplibregl-ctrl-icon:before** (line 704)
  Properties: color, content
- **.maplibregl-popup-anchor-top-left .maplibregl-popup-content** (line 746)
  Properties: border-top-left-radius
- **.maplibregl-popup-anchor-top-right .maplibregl-popup-content** (line 749)
  Properties: border-top-right-radius
- **.maplibregl-popup-anchor-bottom-left .maplibregl-popup-content** (line 752)
  Properties: border-bottom-left-radius
- **.maplibregl-popup-anchor-bottom-right .maplibregl-popup-content** (line 755)
  Properties: border-bottom-right-radius
- **.maplibregl-popup-close-button** (line 758)
  Properties: background-color, border, border-radius...
- **.maplibregl-popup-close-button:hover** (line 775)
  Properties: background-color
- **.maplibregl-popup-close-button:active** (line 778)
  Properties: background-color
- **.maplibregl-popup-content:has(.maplibregl-popup-close-button)** (line 789)
  Properties: padding

### src/css-backup-20250604/objectinfo.css
- **:root** (line 47)
  Properties: --feature-primary, --feature-primary-dark, --feature-text...
- **.header-title** (line 109)
  Properties: font-size, font-weight, margin...
- **.feature-name** (line 123)
  Properties: font-size, font-weight, margin...
- **#feature-empty-state** (line 158)
  Properties: text-align, padding, color...
- **.section:last-child** (line 170)
  Properties: margin-bottom
- **.section-header:hover** (line 186)
  Properties: background
- **.data-row:last-child** (line 247)
  Properties: border-bottom
- **.linked-feature** (line 312)
  Properties: display, align-items, gap...
- **.linked-feature:hover** (line 323)
  Properties: background
- **.linked-feature-icon** (line 327)
  Properties: color
- **.linked-feature-details** (line 331)
  Properties: flex
- **.linked-feature-details .feature-name** (line 335)
  Properties: font-weight, font-size
- **.linked-feature-details .feature-id** (line 340)
  Properties: font-size, color
- **.zoom-button** (line 356)
  Properties: display, align-items, justify-content...
- **.zoom-button** (line 405)
  Properties: width
- **.edit-button:hover** (line 372)
  Properties: background
- **.zoom-button:hover** (line 372)
  Properties: background
- **#address-content p** (line 385)
  Properties: margin, font-size

### src/css-backup-20250604/responsive-sidebar.css
- **.left1.collapsed** (line 44)
  Properties: transform
- **.left2.collapsed** (line 44)
  Properties: transform
- **.left3.collapsed** (line 44)
  Properties: transform
- **.left4.collapsed** (line 44)
  Properties: transform
- **.sidebar:not(.collapsed) + .sidebar-toggle** (line 17)
  Properties: z-index
- **.sidebar:not(.collapsed)::before** (line 59)
  Properties: content, position, top...

### src/css-backup-20250604/responsive-variables.css
- **:root** (line 2)
  Properties: font-size, --spacing-xs, --spacing-sm...
- **:root** (line 48)
  Properties: --sidebar-width, font-size
- **:root** (line 57)
  Properties: --sidebar-width, font-size
- **:root** (line 66)
  Properties: font-size
- **.responsive-component** (line 74)
  Properties: --sidebar-width

### src/css-backup-20250604/shoelace-custom.css
- **:root** (line 3)
  Properties: --sl-color-primary-500, --sl-color-primary-600, --sl-input-height-medium...
- **.sidebar .controls sl-switch::part(base)** (line 14)
  Properties: margin, width, display...
- **.sidebar .controls sl-switch::part(label)** (line 21)
  Properties: font-size, color, text-align...
- **.sidebar .controls sl-switch::part(control)** (line 28)
  Properties: order
- **.sidebar .controls sl-switch::part(control)** (line 131)
  Properties: margin-right
- **.sidebar .controls sl-button::part(base)** (line 33)
  Properties: width, margin, justify-content...
- **.sidebar .controls sl-button::part(base):hover** (line 46)
  Properties: background-color, border-color
- **.sidebar .controls sl-button::part(label)** (line 51)
  Properties: flex-grow, text-align
- **#map_search_input::part(base)** (line 69)
  Properties: height
- **#search_button::part(base)** (line 78)
  Properties: height, width
- **#search_button_mapExtend::part(base)** (line 78)
  Properties: height, width
- **sl-range::part(base)** (line 85)
  Properties: width
- **#map_search_results a:hover** (line 97)
  Properties: background-color, color
- **.status-footer sl-button::part(base)** (line 103)
  Properties: padding, font-size
- **sl-switch::part(thumb)** (line 109)
  Properties: background-color
- **sl-switch::part(control)** (line 113)
  Properties: background-color
- **sl-switch[checked]::part(control)** (line 117)
  Properties: background-color
- **#left4 .controls sl-button::part(base)** (line 136)
  Properties: background-color, border, color...
- **#left4 .controls sl-button::part(base):hover** (line 144)
  Properties: background-color
- **#left4 .controls sl-button::part(label)** (line 149)
  Properties: text-align, padding-left
- **.sidebar-content sl-tooltip::part(base)** (line 167)
  Properties: width, max-width, box-sizing...

### src/css-backup-20250604/sidebar-headers.css
- **sl-drawer::part(panel)** (line 5)
  Properties: padding
- **sl-drawer::part(body)** (line 9)
  Properties: padding, margin, height
- **sl-drawer::part(header)** (line 15)
  Properties: display
- **sl-drawer .sidebar-content > h3:first-child** (line 69)
  Properties: margin-top
- **sl-drawer[id^="left"] .sidebar-content > h3** (line 79)
  Properties: border-top-right-radius
- **sl-drawer[id^="right"] .sidebar-content > h3** (line 84)
  Properties: border-top-left-radius
- **sl-drawer .sidebar-content > *:not(h3)** (line 89)
  Properties: padding-left, padding-right
- **sl-drawer .sidebar-content > .rounded-rect** (line 95)
  Properties: padding-left, padding-right
- **sl-drawer .sidebar-content .rounded-rect > *** (line 104)
  Properties: padding-left, padding-right
- **sl-drawer#left4-drawer .sidebar-content > *:first-child** (line 127)
  Properties: margin-top, padding-top
- **sl-drawer#left4-drawer::part(body)** (line 161)
  Properties: padding, margin
- **sl-drawer#left4-drawer .sidebar-content::before** (line 177)
  Properties: display

### src/css-backup-20250604/sidebar-width-fix.css
- **:root** (line 2)
  Properties: --sidebar-width, --right-sidebar-width
- **:root** (line 66)
  Properties: --sidebar-width, --right-sidebar-width
- **.left1** (line 21)
  Properties: left, width, border-top-right-radius...
- **.left1** (line 71)
  Properties: width, max-width
- **.left2** (line 21)
  Properties: left, width, border-top-right-radius...
- **.left2** (line 71)
  Properties: width, max-width
- **.left3** (line 21)
  Properties: left, width, border-top-right-radius...
- **.left3** (line 71)
  Properties: width, max-width
- **.left4** (line 21)
  Properties: left, width, border-top-right-radius...
- **.left4** (line 71)
  Properties: width, max-width
- **.left1.collapsed** (line 39)
  Properties: transform
- **.left2.collapsed** (line 39)
  Properties: transform
- **.left3.collapsed** (line 39)
  Properties: transform
- **.left4.collapsed** (line 39)
  Properties: transform
- **.left1:not(.collapsed) ~ .sidebar-toggle-group .sidebar-toggle.left1** (line 52)
  Properties: transform
- **.left2:not(.collapsed) ~ .sidebar-toggle-group .sidebar-toggle.left2** (line 52)
  Properties: transform
- **.left3:not(.collapsed) ~ .sidebar-toggle-group .sidebar-toggle.left3** (line 52)
  Properties: transform
- **.left4:not(.collapsed) ~ .sidebar-toggle-group .sidebar-toggle.left4** (line 52)
  Properties: transform
- **.right1:not(.collapsed) ~ .sidebar-toggle-group-right .sidebar-toggle.right1** (line 59)
  Properties: transform
- **.right2:not(.collapsed) ~ .sidebar-toggle-group-right .sidebar-toggle.right2** (line 59)
  Properties: transform

### src/css/button-themes.css
- **:root** (line 4)
  Properties: --primary-color
- **.button-size-large .sidebar-toggle** (line 21)
  Properties: width, height
- **.button-size-large .maplibregl-ctrl button** (line 21)
  Properties: width, height
- **.button-size-small .maplibregl-ctrl-icon:before** (line 28)
  Properties: width, height, font-size
- **.button-size-medium .maplibregl-ctrl-icon:before** (line 36)
  Properties: width, height, font-size
- **.button-size-large .sidebar-toggle svg** (line 44)
  Properties: width, height, font-size
- **.button-size-large .maplibregl-ctrl button svg** (line 44)
  Properties: width, height, font-size
- **.button-size-large .maplibregl-ctrl-icon:before** (line 44)
  Properties: width, height, font-size
- **.maplibregl-ctrl-geolocate-active .maplibregl-ctrl-icon:before** (line 62)
  Properties: color
- **.controls button:hover** (line 78)
  Properties: background-color, opacity
- **.maplibregl-ctrl button:not(:disabled).active** (line 53)
  Properties: background-color, border-color
- **.maplibregl-ctrl button:not(:disabled).active** (line 62)
  Properties: color
- **sl-switch[checked]::part(thumb)** (line 53)
  Properties: background-color, border-color

### src/css/drawer-tabs.css
- **#left2-drawer sl-switch:hover** (line 100)
  Properties: background-color
- **#left2-drawer sl-switch::part(base)** (line 104)
  Properties: width, display, justify-content...
- **#left2-drawer sl-switch::part(label)** (line 112)
  Properties: font-size, color, text-align...
- **#left2-drawer sl-switch::part(control)** (line 120)
  Properties: flex-shrink
- **.drawer-with-tabs sl-tab-group[placement="start"]** (line 7)
  Properties: height, display, margin-top
- **.drawer-with-tabs sl-tab-group::part(nav)** (line 13)
  Properties: min-width, width, align-items...
- **.drawer-with-tabs sl-tab-group::part(nav)** (line 172)
  Properties: min-width, width, padding-top
- **.drawer-with-tabs sl-tab[active] sl-icon** (line 32)
  Properties: color
- **.drawer-with-tabs sl-icon::part(base)** (line 37)
  Properties: outline
- **.drawer-with-tabs sl-tab::part(base)** (line 51)
  Properties: padding, margin, border-radius...
- **.drawer-with-tabs sl-tab::part(base)** (line 178)
  Properties: width, height, margin
- **.drawer-with-tabs sl-tab::part(base):hover** (line 63)
  Properties: background-color
- **.drawer-with-tabs sl-tab[active]::part(base)** (line 67)
  Properties: background-color
- **#left2-drawer .button-group** (line 125)
  Properties: display, gap, padding...
- **#left2-drawer .button-group button** (line 134)
  Properties: flex, padding, border...
- **#left2-drawer .button-group button:hover** (line 145)
  Properties: background-color
- **#left2-drawer .button-group button.active** (line 149)
  Properties: background-color, color, border-color
- **#left2-drawer .settings-section** (line 156)
  Properties: margin-bottom, padding
- **#left2-drawer .settings-section h4** (line 161)
  Properties: margin, font-size, color...

### src/css/layer-catogories.css
- **:root** (line 358)
  Properties: --geolantis-blue
- **#left4** (line 4)
  Properties: overflow
- **#left4 .sidebar-content** (line 8)
  Properties: padding, width, box-sizing
- **.layer-list-header** (line 15)
  Properties: background, color, padding...
- **.layer-list-header sl-button** (line 28)
  Properties: --sl-color-neutral-0, --sl-color-neutral-700, --sl-input-border-color...
- **.layer-list-header sl-button:hover** (line 42)
  Properties: background-color
- **.layer-list-title** (line 46)
  Properties: font-size, font-weight, font-family...
- **.lc-layer-controls-header::after** (line 71)
  Properties: content, position, left...
- **.lc-layer-controls-description** (line 81)
  Properties: font-size, color, font-weight...
- **.lc-category-header:hover** (line 145)
  Properties: background
- **sl-icon[name="chevron-down"]** (line 165)
  Properties: width, height, flex-shrink...
- **.lc-category:not(.expanded) sl-icon[name="chevron-down"]** (line 173)
  Properties: transform
- **.lc-feature-item:hover** (line 211)
  Properties: background
- **.lc-feature-content::before** (line 224)
  Properties: content, width, flex-shrink
- **.lc-feature-content::before** (line 416)
  Properties: display
- **.lc-feature-icon.point** (line 267)
  Properties: width, height, border-radius...
- **.lc-feature-icon.line** (line 274)
  Properties: width, height, background-color...
- **.lc-feature-icon.polygon** (line 281)
  Properties: width, height, border...
- **sl-checkbox::part(base)** (line 289)
  Properties: --sl-input-height-small
- **sl-checkbox::part(control)** (line 293)
  Properties: width, height, background-color...
- **sl-checkbox[checked]::part(control)** (line 302)
  Properties: background-color, border-color
- **sl-checkbox[checked] svg** (line 308)
  Properties: display
- **sl-checkbox[checked]::part(control)::after** (line 313)
  Properties: content, position, left...
- **sl-icon-button::part(base)** (line 327)
  Properties: height, width, align-items...
- **sl-icon-button::part(base):hover** (line 336)
  Properties: color
- **#expandCollapseAll::part(base)** (line 378)
  Properties: background-color, color, border...
- **#expandCollapseAll::part(base):hover** (line 386)
  Properties: background-color, box-shadow
- **#expandCollapseAll::part(base):focus** (line 391)
  Properties: box-shadow, outline
- **#expandCollapseAll:hover** (line 440)
  Properties: background
- **.lc-layer-controls-master::after** (line 472)
  Properties: content, width, height...
- **.lc-category-controls sl-icon-button::part(base)** (line 513)
  Properties: width, height, background...
- **.lc-feature-controls sl-icon-button::part(base)** (line 513)
  Properties: width, height, background...
- **sl-checkbox::part(label)** (line 523)
  Properties: user-select, -webkit-user-select, -moz-user-select...
- **sl-switch::part(label)** (line 523)
  Properties: user-select, -webkit-user-select, -moz-user-select...
- **sl-radio::part(label)** (line 523)
  Properties: user-select, -webkit-user-select, -moz-user-select...
- **sl-toggle::part(label)** (line 523)
  Properties: user-select, -webkit-user-select, -moz-user-select...
- **.no-select** (line 535)
  Properties: user-select, -webkit-user-select, -moz-user-select...

### src/css/mobile-overrides.css
- **:root** (line 8)
  Properties: --sidebar-width
- **:root** (line 104)
  Properties: font-size
- **sl-drawer[placement="start"]::part(panel)** (line 19)
  Properties: width
- **sl-drawer[placement="start"]::part(panel)** (line 33)
  Properties: width, height, border-radius...
- **sl-drawer[placement="start"]::part(panel)** (line 109)
  Properties: width
- **sl-drawer[placement="end"]::part(panel)** (line 19)
  Properties: width
- **sl-drawer[placement="end"]::part(panel)** (line 33)
  Properties: width, height, border-radius...
- **sl-drawer[placement="end"]::part(panel)** (line 109)
  Properties: width
- **sl-drawer[placement="start"]** (line 28)
  Properties: --size
- **sl-drawer[placement="start"]** (line 130)
  Properties: --size
- **sl-drawer[placement="end"]** (line 28)
  Properties: --size
- **sl-drawer[placement="end"]** (line 130)
  Properties: --size
- **sl-drawer#right1-drawer::part(panel)** (line 46)
  Properties: width
- **sl-drawer#right2-drawer::part(panel)** (line 46)
  Properties: width
- **#footer-bar** (line 52)
  Properties: font-size, font-weight, color...
- **#fab-main** (line 77)
  Properties: position, bottom, right...
- **#fab-main** (line 121)
  Properties: bottom, right
- **#fab-main** (line 142)
  Properties: bottom
- **#fab-main:hover** (line 96)
  Properties: background-color

### src/css/modernstyle.css
- **:root** (line 243)
  Properties: --ml-ctrl-border-radius, --ml-font, --ml-font-attribution...
- **:root** (line 283)
  Properties: --ml-c-bg-1, --ml-c-bg-2, --ml-c-bg-3...
- **:root** (line 296)
  Properties: --ml-c-bg-1, --ml-c-bg-2, --ml-c-bg-3...
- **.maplibregl-ctrl-top-left** (line 1)
  Properties: pointer-events, position, z-index
- **.maplibregl-ctrl-top-left** (line 9)
  Properties: left, top
- **.maplibregl-ctrl-attrib.maplibregl-compact-show** (line 31)
  Properties: visibility
- **.maplibregl-ctrl-attrib.maplibregl-compact-show** (line 491)
  Properties: padding
- **.maplibregl-ctrl-attrib-button** (line 34)
  Properties: display
- **.maplibregl-ctrl-attrib-button** (line 356)
  Properties: border, color, cursor...
- **.maplibregl-ctrl-attrib-button** (line 500)
  Properties: border-radius, position, right...
- **.maplibregl-ctrl-attrib.maplibregl-compact .maplibregl-ctrl-attrib-inner** (line 34)
  Properties: display
- **.maplibregl-ctrl-attrib summary.maplibregl-ctrl-attrib-button** (line 38)
  Properties: -webkit-appearance, -moz-appearance, appearance...
- **.maplibregl-ctrl-attrib
    summary.maplibregl-ctrl-attrib-button::-webkit-details-marker** (line 44)
  Properties: display
- **.maplibregl-ctrl-attrib.maplibregl-compact .maplibregl-ctrl-attrib-button** (line 48)
  Properties: display
- **.maplibregl-ctrl-attrib.maplibregl-compact-show
    .maplibregl-ctrl-attrib-inner** (line 48)
  Properties: display
- **.maplibregl-canvas-container.maplibregl-interactive** (line 65)
  Properties: cursor, -webkit-user-select, -moz-user-select...
- **.maplibregl-canvas-container.maplibregl-interactive:active** (line 72)
  Properties: cursor
- **.maplibregl-ctrl-group button.maplibregl-ctrl-compass:active** (line 72)
  Properties: cursor
- **.maplibregl-boxzoom** (line 76)
  Properties: height, left, position...
- **.maplibregl-boxzoom** (line 710)
  Properties: background, border, border-radius...
- **.maplibregl-cooperative-gesture-screen** (line 83)
  Properties: align-items, display, inset...
- **.maplibregl-cooperative-gesture-screen** (line 716)
  Properties: background, color, font-size...
- **.maplibregl-cooperative-gesture-screen.maplibregl-show** (line 93)
  Properties: opacity
- **.maplibregl-cooperative-gesture-screen.maplibregl-show** (line 724)
  Properties: transition
- **.maplibregl-cooperative-gesture-screen .maplibregl-mobile-message** (line 96)
  Properties: display
- **.maplibregl-cooperative-gesture-screen .maplibregl-mobile-message** (line 103)
  Properties: display
- **.maplibregl-cooperative-gesture-screen .maplibregl-desktop-message** (line 100)
  Properties: display
- **.maplibregl-popup** (line 110)
  Properties: left, position, top...
- **.maplibregl-popup** (line 117)
  Properties: display, pointer-events
- **.maplibregl-popup-anchor-top** (line 121)
  Properties: flex-direction
- **.maplibregl-popup-anchor-top-left** (line 121)
  Properties: flex-direction
- **.maplibregl-popup-anchor-top-right** (line 121)
  Properties: flex-direction
- **.maplibregl-popup-anchor-bottom** (line 126)
  Properties: flex-direction
- **.maplibregl-popup-anchor-bottom-left** (line 126)
  Properties: flex-direction
- **.maplibregl-popup-anchor-bottom-right** (line 126)
  Properties: flex-direction
- **.maplibregl-popup-anchor-left** (line 131)
  Properties: flex-direction
- **.maplibregl-popup-anchor-right** (line 134)
  Properties: flex-direction
- **.maplibregl-popup-tip** (line 137)
  Properties: height, width, z-index
- **.maplibregl-popup-tip** (line 727)
  Properties: border
- **.maplibregl-popup-anchor-top .maplibregl-popup-tip** (line 142)
  Properties: align-self, border-top
- **.maplibregl-popup-anchor-top .maplibregl-popup-tip** (line 730)
  Properties: border-bottom-color
- **.maplibregl-popup-anchor-top-left .maplibregl-popup-tip** (line 146)
  Properties: align-self, border-left, border-top
- **.maplibregl-popup-anchor-top-left .maplibregl-popup-tip** (line 730)
  Properties: border-bottom-color
- **.maplibregl-popup-anchor-top-right .maplibregl-popup-tip** (line 151)
  Properties: align-self, border-right, border-top
- **.maplibregl-popup-anchor-top-right .maplibregl-popup-tip** (line 730)
  Properties: border-bottom-color
- **.maplibregl-popup-anchor-bottom .maplibregl-popup-tip** (line 156)
  Properties: align-self, border-bottom
- **.maplibregl-popup-anchor-bottom .maplibregl-popup-tip** (line 735)
  Properties: border-top-color
- **.maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip** (line 160)
  Properties: align-self, border-bottom, border-left
- **.maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip** (line 735)
  Properties: border-top-color
- **.maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip** (line 165)
  Properties: align-self, border-bottom, border-right
- **.maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip** (line 735)
  Properties: border-top-color
- **.maplibregl-popup-anchor-left .maplibregl-popup-tip** (line 170)
  Properties: align-self, border-left
- **.maplibregl-popup-anchor-left .maplibregl-popup-tip** (line 740)
  Properties: border-right-color
- **.maplibregl-popup-anchor-right .maplibregl-popup-tip** (line 174)
  Properties: align-self, border-right
- **.maplibregl-popup-anchor-right .maplibregl-popup-tip** (line 743)
  Properties: border-left-color
- **.maplibregl-map:hover .maplibregl-popup-track-pointer** (line 187)
  Properties: display
- **.maplibregl-map:active .maplibregl-popup-track-pointer** (line 190)
  Properties: display
- **.maplibregl-popup-content** (line 193)
  Properties: pointer-events, position
- **.maplibregl-popup-content** (line 781)
  Properties: background, border-radius, box-shadow...
- **.maplibregl-canvas-container.maplibregl-interactive.maplibregl-track-pointer** (line 197)
  Properties: cursor
- **.maplibregl-canvas-container.maplibregl-touch-zoom-rotate** (line 200)
  Properties: touch-action
- **.maplibregl-canvas-container.maplibregl-touch-zoom-rotate .maplibregl-canvas** (line 200)
  Properties: touch-action
- **.maplibregl-canvas-container.maplibregl-touch-drag-pan** (line 204)
  Properties: touch-action
- **.maplibregl-canvas-container.maplibregl-touch-drag-pan .maplibregl-canvas** (line 204)
  Properties: touch-action
- **.maplibregl-canvas-container.maplibregl-touch-zoom-rotate.maplibregl-touch-drag-pan** (line 208)
  Properties: touch-action
- **.maplibregl-canvas-container.maplibregl-touch-zoom-rotate.maplibregl-touch-drag-pan
  .maplibregl-canvas** (line 208)
  Properties: touch-action
- **.maplibregl-canvas-container.maplibregl-touch-drag-pan.maplibregl-cooperative-gestures** (line 213)
  Properties: touch-action
- **.maplibregl-canvas-container.maplibregl-touch-drag-pan.maplibregl-cooperative-gestures
  .maplibregl-canvas** (line 213)
  Properties: touch-action
- **.maplibregl-crosshair .maplibregl-interactive:active** (line 218)
  Properties: cursor
- **.maplibregl-canvas** (line 228)
  Properties: left, position, top
- **.maplibregl-map:fullscreen** (line 233)
  Properties: height, width
- **.dark** (line 269)
  Properties: --ml-c-bg-1, --ml-c-bg-2, --ml-c-bg-3...
- **.dark** (line 283)
  Properties: --ml-c-bg-1, --ml-c-bg-2, --ml-c-bg-3...
- **.dark** (line 296)
  Properties: --ml-c-bg-1, --ml-c-bg-2, --ml-c-bg-3...
- **.maplibregl-ctrl-top-left .maplibregl-ctrl** (line 311)
  Properties: float, margin
- **.maplibregl-ctrl-group:not(:empty)** (line 331)
  Properties: box-shadow
- **.maplibregl-ctrl-group:not(:empty)** (line 335)
  Properties: box-shadow
- **.maplibregl-ctrl-group button:first-child** (line 347)
  Properties: border-radius
- **.maplibregl-ctrl-group button:last-child** (line 350)
  Properties: border-radius
- **.maplibregl-ctrl-group button:only-child** (line 353)
  Properties: border-radius
- **.maplibregl-ctrl button:not(:disabled):hover** (line 378)
  Properties: background-color, color
- **.maplibregl-ctrl-attrib-button:not(:disabled):hover** (line 378)
  Properties: background-color, color
- **.maplibregl-ctrl button:not(:disabled):is(.active** (line 383)
  Properties: color
- **.-active)** (line 383)
  Properties: color
- **.maplibregl-ctrl button:not(:disabled):active** (line 386)
  Properties: background-color, box-shadow
- **.maplibregl-ctrl-attrib-button:not(:disabled):active** (line 386)
  Properties: background-color, box-shadow
- **.maplibregl-ctrl button:focus** (line 391)
  Properties: --ml-ring-shadow-active
- **.maplibregl-ctrl button:focus** (line 395)
  Properties: z-index
- **.maplibregl-ctrl-attrib-button:focus** (line 391)
  Properties: --ml-ring-shadow-active
- **.maplibregl-ctrl button:focus:focus-visible** (line 398)
  Properties: --ml-ring-shadow-active
- **.maplibregl-ctrl-attrib-button:focus:focus-visible** (line 398)
  Properties: --ml-ring-shadow-active
- **.maplibregl-ctrl button:focus:not(:focus-visible)** (line 402)
  Properties: --ml-ring-shadow-active
- **.maplibregl-ctrl-attrib-button:focus:not(:focus-visible)** (line 402)
  Properties: --ml-ring-shadow-active
- **.maplibregl-ctrl button::-moz-focus-inner** (line 411)
  Properties: border, padding
- **.maplibregl-ctrl button:disabled** (line 415)
  Properties: cursor
- **.maplibregl-ctrl button:disabled :is(.maplibregl-ctrl-icon:before** (line 418)
  Properties: opacity
- **.maplibregl-ctrl .maplibregl-ctrl-attrib-button:before** (line 421)
  Properties: -webkit-font-smoothing, -moz-osx-font-smoothing, font-variant...
- **.maplibregl-ctrl .maplibregl-ctrl-attrib-button:before** (line 434)
  Properties: font-family
- **.maplibregl-ctrl .maplibregl-ctrl-attrib-button:before** (line 445)
  Properties: display, font-size, font-style...
- **.maplibregl-ctrl button .maplibregl-ctrl-icon:before** (line 421)
  Properties: -webkit-font-smoothing, -moz-osx-font-smoothing, font-variant...
- **.maplibregl-ctrl button .maplibregl-ctrl-icon:before** (line 434)
  Properties: font-family
- **.maplibregl-ctrl button .maplibregl-ctrl-icon:before** (line 445)
  Properties: display, font-size, font-style...
- **.maplibregl-ctrl button.maplibregl-ctrl-compass .maplibregl-ctrl-icon:after** (line 421)
  Properties: -webkit-font-smoothing, -moz-osx-font-smoothing, font-variant...
- **.maplibregl-ctrl button.maplibregl-ctrl-compass .maplibregl-ctrl-icon:after** (line 434)
  Properties: font-family
- **.maplibregl-ctrl button.maplibregl-ctrl-compass .maplibregl-ctrl-icon:after** (line 445)
  Properties: display, font-size, font-style...
- **.maplibregl-ctrl button.maplibregl-ctrl-compass .maplibregl-ctrl-icon:after** (line 681)
  Properties: color, content, left...
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate:disabled
  .maplibregl-ctrl-icon:after** (line 421)
  Properties: -webkit-font-smoothing, -moz-osx-font-smoothing, font-variant...
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate:disabled
  .maplibregl-ctrl-icon:after** (line 434)
  Properties: font-family
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate:disabled
  .maplibregl-ctrl-icon:after** (line 445)
  Properties: display, font-size, font-style...
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate:disabled
  .maplibregl-ctrl-icon:after** (line 590)
  Properties: color, content, left...
- **a.maplibregl-ctrl-logo:before** (line 421)
  Properties: -webkit-font-smoothing, -moz-osx-font-smoothing, font-variant...
- **a.maplibregl-ctrl-logo:before** (line 442)
  Properties: font-family
- **a.maplibregl-ctrl-logo:before** (line 643)
  Properties: color, content, font-size...
- **a.maplibregl-ctrl-logo:before** (line 660)
  Properties: text-stroke, -webkit-text-stroke
- **.maplibregl-ctrl.maplibregl-ctrl-attrib** (line 464)
  Properties: background-color, margin, min-height...
- **.maplibregl-ctrl-bottom-right > .maplibregl-ctrl-attrib** (line 470)
  Properties: border-top-left-radius
- **.maplibregl-ctrl-top-right > .maplibregl-ctrl-attrib** (line 473)
  Properties: border-bottom-left-radius
- **.maplibregl-ctrl-top-left > .maplibregl-ctrl-attrib** (line 476)
  Properties: border-bottom-right-radius
- **.maplibregl-ctrl-bottom-left > .maplibregl-ctrl-attrib** (line 479)
  Properties: border-top-right-radius
- **.maplibregl-ctrl-attrib.maplibregl-compact** (line 483)
  Properties: background-color, border-radius, margin...
- **.maplibregl-ctrl-bottom-left
    > .maplibregl-ctrl-attrib.maplibregl-compact-show** (line 494)
  Properties: border-radius, padding
- **.maplibregl-ctrl-top-left > .maplibregl-ctrl-attrib.maplibregl-compact-show** (line 494)
  Properties: border-radius, padding
- **.maplibregl-ctrl-attrib-button:before** (line 506)
  Properties: content, margin
- **.maplibregl-ctrl-bottom-left .maplibregl-ctrl-attrib-button** (line 510)
  Properties: left
- **.maplibregl-ctrl-top-left .maplibregl-ctrl-attrib-button** (line 510)
  Properties: left
- **.maplibregl-ctrl-attrib-inner** (line 515)
  Properties: line-height
- **.maplibregl-ctrl-attrib a** (line 518)
  Properties: color, text-decoration
- **.maplibregl-ctrl-attrib a:hover** (line 522)
  Properties: color, text-decoration
- **.maplibregl-ctrl
  button.maplibregl-ctrl-fullscreen
  .maplibregl-ctrl-icon:before** (line 529)
  Properties: content
- **.maplibregl-ctrl button.maplibregl-ctrl-shrink .maplibregl-ctrl-icon:before** (line 534)
  Properties: content
- **.maplibregl-user-location-dot** (line 537)
  Properties: background-color, border-radius, height...
- **.maplibregl-user-location-dot:before** (line 537)
  Properties: background-color, border-radius, height...
- **.maplibregl-user-location-dot:before** (line 544)
  Properties: animation, content, position
- **.maplibregl-user-location-dot:after** (line 549)
  Properties: border, border-radius, box-shadow...
- **0%** (line 562)
  Properties: opacity, transform
- **0%** (line 630)
  Properties: transform
- **70%** (line 566)
  Properties: opacity, transform
- **to** (line 570)
  Properties: opacity, transform
- **to** (line 633)
  Properties: transform
- **.maplibregl-user-location-dot-stale:after** (line 578)
  Properties: display
- **.maplibregl-user-location-accuracy-circle** (line 581)
  Properties: background-color, border-radius, height...
- **.maplibregl-ctrl button.maplibregl-ctrl-geolocate .maplibregl-ctrl-icon:before** (line 587)
  Properties: content
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-active
  .maplibregl-ctrl-icon:before** (line 600)
  Properties: color, content
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-active-error
  .maplibregl-ctrl-icon:before** (line 606)
  Properties: color, content
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-background
  .maplibregl-ctrl-icon:before** (line 612)
  Properties: color, content
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-background-error
  .maplibregl-ctrl-icon:before** (line 618)
  Properties: color, content
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-waiting
  .maplibregl-ctrl-icon:before** (line 624)
  Properties: animation
- **a.maplibregl-ctrl-logo** (line 637)
  Properties: cursor, display, margin...
- **.dark a.maplibregl-ctrl-logo:before** (line 655)
  Properties: text-stroke, -webkit-text-stroke
- **.dark a.maplibregl-ctrl-logo:before** (line 660)
  Properties: text-stroke, -webkit-text-stroke
- **a.maplibregl-ctrl-logo:hover:before** (line 666)
  Properties: color
- **a.maplibregl-ctrl-logo.maplibregl-compact:before** (line 669)
  Properties: content
- **.maplibregl-ctrl button.maplibregl-ctrl-zoom-out .maplibregl-ctrl-icon:before** (line 672)
  Properties: content
- **.maplibregl-ctrl button.maplibregl-ctrl-zoom-in .maplibregl-ctrl-icon:before** (line 675)
  Properties: content
- **.maplibregl-ctrl button.maplibregl-ctrl-compass .maplibregl-ctrl-icon:before** (line 678)
  Properties: content
- **.maplibregl-ctrl button.maplibregl-ctrl-terrain .maplibregl-ctrl-icon:before** (line 701)
  Properties: content
- **.maplibregl-ctrl
  button.maplibregl-ctrl-terrain-enabled
  .maplibregl-ctrl-icon:before** (line 704)
  Properties: color, content
- **.maplibregl-popup-anchor-top-left .maplibregl-popup-content** (line 746)
  Properties: border-top-left-radius
- **.maplibregl-popup-anchor-top-right .maplibregl-popup-content** (line 749)
  Properties: border-top-right-radius
- **.maplibregl-popup-anchor-bottom-left .maplibregl-popup-content** (line 752)
  Properties: border-bottom-left-radius
- **.maplibregl-popup-anchor-bottom-right .maplibregl-popup-content** (line 755)
  Properties: border-bottom-right-radius
- **.maplibregl-popup-close-button** (line 758)
  Properties: background-color, border, border-radius...
- **.maplibregl-popup-close-button:hover** (line 775)
  Properties: background-color
- **.maplibregl-popup-close-button:active** (line 778)
  Properties: background-color
- **.maplibregl-popup-content:has(.maplibregl-popup-close-button)** (line 789)
  Properties: padding

### src/css/responsive-variables.css
- **:root** (line 2)
  Properties: font-size, --spacing-xs, --spacing-sm...
- **:root** (line 48)
  Properties: --sidebar-width, font-size
- **:root** (line 57)
  Properties: --sidebar-width, font-size
- **:root** (line 66)
  Properties: font-size
- **.responsive-component** (line 74)
  Properties: --sidebar-width

### src/css/shoelace-custom.css
- **:root** (line 3)
  Properties: --sl-color-primary-500, --sl-color-primary-600, --sl-input-height-medium...
- **.sidebar .controls sl-switch::part(base)** (line 14)
  Properties: margin, width, display...
- **.sidebar .controls sl-switch::part(label)** (line 21)
  Properties: font-size, color, text-align...
- **.sidebar .controls sl-switch::part(control)** (line 28)
  Properties: order
- **.sidebar .controls sl-switch::part(control)** (line 131)
  Properties: margin-right
- **.sidebar .controls sl-button::part(base)** (line 33)
  Properties: width, margin, justify-content...
- **.sidebar .controls sl-button::part(base):hover** (line 46)
  Properties: background-color, border-color
- **.sidebar .controls sl-button::part(label)** (line 51)
  Properties: flex-grow, text-align
- **#map_search_input::part(base)** (line 69)
  Properties: height
- **#search_button::part(base)** (line 78)
  Properties: height, width
- **#search_button_mapExtend::part(base)** (line 78)
  Properties: height, width
- **sl-range::part(base)** (line 85)
  Properties: width
- **#map_search_results a:hover** (line 97)
  Properties: background-color, color
- **.status-footer sl-button::part(base)** (line 103)
  Properties: padding, font-size
- **sl-switch::part(thumb)** (line 109)
  Properties: background-color
- **sl-switch::part(control)** (line 113)
  Properties: background-color
- **sl-switch[checked]::part(control)** (line 117)
  Properties: background-color
- **#left4 .controls sl-button::part(base)** (line 136)
  Properties: background-color, border, color...
- **#left4 .controls sl-button::part(base):hover** (line 144)
  Properties: background-color
- **#left4 .controls sl-button::part(label)** (line 149)
  Properties: text-align, padding-left
- **.sidebar-content sl-tooltip::part(base)** (line 167)
  Properties: width, max-width, box-sizing...

### src/css/sidebar-consolidated.css
- **:root** (line 6)
  Properties: --sidebar-width, --right-sidebar-width, --sidebar-transition...
- **:root** (line 151)
  Properties: --sidebar-width, --right-sidebar-width
- **:root** (line 212)
  Properties: --sidebar-width, --right-sidebar-width
- **sl-drawer::part(panel)** (line 76)
  Properties: box-shadow
- **sl-drawer::part(panel)** (line 163)
  Properties: width, max-width
- **sl-drawer::part(body)** (line 68)
  Properties: padding, height, overflow...
- **sl-drawer::part(header)** (line 52)
  Properties: padding, background-color, border-bottom
- **.sidebar-toggle:hover** (line 125)
  Properties: background-color, border-color
- **.sidebar.left** (line 31)
  Properties: left
- **.sidebar.left** (line 157)
  Properties: width
- **.sidebar.right** (line 35)
  Properties: right, width
- **.sidebar.right** (line 157)
  Properties: width
- **.sidebar.left.collapsed** (line 41)
  Properties: transform
- **.sidebar.right.collapsed** (line 45)
  Properties: transform
- **sl-drawer::part(title)** (line 58)
  Properties: font-size, font-weight, color
- **sl-drawer::part(close-button)** (line 64)
  Properties: display
- **.sidebar.left:not(.collapsed) ~ .sidebar-toggle.left** (line 131)
  Properties: left
- **.sidebar.left:not(.collapsed) ~ .sidebar-toggle.left** (line 196)
  Properties: opacity
- **.sidebar.left.collapsed ~ .sidebar-toggle.left** (line 135)
  Properties: left
- **.sidebar.right:not(.collapsed) ~ .sidebar-toggle.right** (line 139)
  Properties: right
- **.sidebar.right:not(.collapsed) ~ .sidebar-toggle.right** (line 196)
  Properties: opacity
- **.sidebar.right.collapsed ~ .sidebar-toggle.right** (line 143)
  Properties: right
- **sl-drawer::part(overlay)** (line 169)
  Properties: z-index
- **.sidebar-toggle.left** (line 179)
  Properties: position, bottom
- **.sidebar-toggle.left** (line 185)
  Properties: left, right
- **.sidebar-toggle.right** (line 179)
  Properties: position, bottom
- **.sidebar-toggle.right** (line 190)
  Properties: right, left
- **.sidebar-content::-webkit-scrollbar** (line 226)
  Properties: width
- **.sidebar-content::-webkit-scrollbar-track** (line 230)
  Properties: background
- **.sidebar-content::-webkit-scrollbar-thumb** (line 234)
  Properties: background, border-radius
- **.sidebar-content::-webkit-scrollbar-thumb:hover** (line 239)
  Properties: background

### src/css/styles.css
- **:root** (line 12)
  Properties: --left-sidebar-width, --right-sidebar-width
- **.left1** (line 80)
  Properties: left, border-top-right-radius, border-bottom-right-radius
- **.left2** (line 80)
  Properties: left, border-top-right-radius, border-bottom-right-radius
- **.left3** (line 80)
  Properties: left, border-top-right-radius, border-bottom-right-radius
- **.left4** (line 80)
  Properties: left, border-top-right-radius, border-bottom-right-radius
- **sl-drawer::part(panel)** (line 1209)
  Properties: top, bottom, height...
- **sl-drawer::part(panel)** (line 1249)
  Properties: transition
- **sl-drawer::part(panel)** (line 1261)
  Properties: height, overflow
- **sl-drawer::part(panel)** (line 1350)
  Properties: display, flex-direction, height...
- **sl-drawer::part(body)** (line 1266)
  Properties: height, display, flex-direction...
- **sl-drawer::part(body)** (line 1358)
  Properties: padding, height, overflow
- **sl-drawer::part(body)** (line 1523)
  Properties: padding, height, overflow...
- **sl-drawer#left4-drawer::part(body)** (line 1650)
  Properties: padding
- **.maplibregl-ctrl-top-left** (line 1032)
  Properties: top
- **.maplibregl-ctrl-attrib-button** (line 467)
  Properties: 
- **.maplibregl-ctrl button .maplibregl-ctrl-icon:before** (line 470)
  Properties: font-size
- **0%** (line 926)
  Properties: transform, opacity
- **sl-drawer[placement="start"]::part(panel)** (line 1906)
  Properties: width, height, border-radius...
- **sl-drawer[placement="end"]::part(panel)** (line 1327)
  Properties: right, left
- **sl-drawer[placement="end"]::part(panel)** (line 1337)
  Properties: transition
- **sl-drawer[placement="end"]::part(panel)** (line 1906)
  Properties: width, height, border-radius...
- **sl-drawer[placement="start"]** (line 1901)
  Properties: --size
- **sl-drawer[placement="end"]** (line 1901)
  Properties: --size
- **sl-drawer#right1-drawer::part(panel)** (line 1918)
  Properties: width
- **sl-drawer#right2-drawer::part(panel)** (line 1231)
  Properties: background-color
- **sl-drawer#right2-drawer::part(panel)** (line 1918)
  Properties: width
- **#footer-bar** (line 135)
  Properties: background-color, padding, display...
- **#footer-bar** (line 1924)
  Properties: font-size, font-weight, color...
- **.controls button:hover** (line 432)
  Properties: background-color
- **label** (line 18)
  Properties: font-family, font-weight
- **label** (line 31)
  Properties: font-weight
- **label** (line 558)
  Properties: display, margin-bottom
- **#right2** (line 97)
  Properties: background-color, display, flex-direction...
- **#right2** (line 238)
  Properties: background-color, display, flex-direction...
- **#gnss-status** (line 109)
  Properties: background-image, background-repeat, background-size...
- **#accuracy-icon** (line 117)
  Properties: background-image, background-repeat, background-size...
- **#status-footer** (line 126)
  Properties: font-family, position, bottom...
- **#footer-bar:hover** (line 147)
  Properties: background-color
- **#footer-expanded** (line 151)
  Properties: display, position, bottom...
- **.expanded-row** (line 163)
  Properties: padding, display, justify-content...
- **#gnss-accuracy** (line 171)
  Properties: display, align-items
- **#accuracy-indicator** (line 176)
  Properties: width, height, border-radius...
- **#arrow-container** (line 186)
  Properties: width, height, display...
- **#arrow-container** (line 1320)
  Properties: width, height, margin
- **#arrow-container div** (line 204)
  Properties: display, flex-direction, align-items...
- **#arrow-container svg** (line 219)
  Properties: width, height, max-height...
- **#arrow-container div > div:last-child** (line 228)
  Properties: font-size, margin-top, color...
- **sl-drawer#left1-drawer[open] ~ .sidebar-toggle-group .sidebar-toggle** (line 270)
  Properties: left
- **sl-drawer#left2-drawer[open] ~ .sidebar-toggle-group .sidebar-toggle** (line 274)
  Properties: left
- **sl-drawer#left3-drawer[open] ~ .sidebar-toggle-group .sidebar-toggle** (line 278)
  Properties: left
- **sl-drawer#left4-drawer[open] ~ .sidebar-toggle-group .sidebar-toggle** (line 282)
  Properties: left
- **sl-drawer#right1-drawer[open] ~ .sidebar-toggle-group-right .sidebar-toggle** (line 286)
  Properties: right
- **sl-drawer#right2-drawer[open] ~ .sidebar-toggle-group-right .sidebar-toggle** (line 290)
  Properties: right
- **sl-drawer[id^="left"]::part(panel)** (line 295)
  Properties: width
- **sl-drawer[id^="left"]::part(panel)** (line 1218)
  Properties: width, border-top-right-radius, border-bottom-right-radius
- **sl-drawer[id^="right"]::part(panel)** (line 299)
  Properties: width
- **sl-drawer[id^="right"]::part(panel)** (line 1224)
  Properties: width, border-top-left-radius, border-bottom-left-radius
- **.sidebar-toggle:hover** (line 373)
  Properties: background-color
- **.sidebar-toggle svg .arrow** (line 377)
  Properties: transition
- **.sidebar:not(.collapsed) ~ .sidebar-toggle svg .arrow** (line 381)
  Properties: transform
- **.controls label** (line 401)
  Properties: margin, padding, font-size...
- **#feature-info** (line 436)
  Properties: width, display, flex-direction...
- **#feature-info h3** (line 443)
  Properties: font-size, margin-bottom
- **#feature-details p** (line 448)
  Properties: font-size, margin
- **#geojson-data** (line 453)
  Properties: background-color, padding, border-radius...
- **.maplibregl-ctrl button:hover** (line 492)
  Properties: background-color
- **.switch** (line 507)
  Properties: display, align-items, margin
- **.switch input** (line 513)
  Properties: display
- **.switch .slider** (line 517)
  Properties: position, width, height...
- **.switch .slider:before** (line 527)
  Properties: position, content, height...
- **.switch input:checked + .slider** (line 539)
  Properties: background-color
- **.switch input:checked + .slider:before** (line 543)
  Properties: transform
- **.switch span** (line 547)
  Properties: margin-left, font-size, color
- **input[type="range"]** (line 553)
  Properties: width, margin
- **.maplibregl-measurement-label** (line 563)
  Properties: font-family, font-size, color...
- **.mapboxgl-ctrl-geocoder** (line 587)
  Properties: top
- **#mainwrapper** (line 591)
  Properties: width, height
- **#mainwrapper header** (line 597)
  Properties: width, float, border-bottom...
- **#mainwrapper header #logo** (line 605)
  Properties: float, margin-left, padding-top...
- **#status-band** (line 631)
  Properties: position, top, left...
- **#status-band** (line 828)
  Properties: position, top, left...
- **#mainwrapper header #control_panel_button** (line 640)
  Properties: padding-top, padding-bottom, width...
- **#mainwrapper #content_wrapper** (line 650)
  Properties: width, height, padding-left...
- **#mainwrapper #content_wrapper #control_panel** (line 658)
  Properties: width, min-width, height...
- **#mainwrapper
  #content_wrapper
  #control_panel
  .control_panel_dropdownwrapper_openArea** (line 670)
  Properties: width, height, float...
- **#mainwrapper #content_wrapper #control_panel .control_panel_iconwrapper** (line 684)
  Properties: position, margin, float...
- **#mainwrapper #content_wrapper #control_panel .control_panel_iconwrapper > img** (line 692)
  Properties: height, display, border...
- **#mainwrapper
  #content_wrapper
  #control_panel
  .control_panel_iconwrapper
  > figure** (line 702)
  Properties: height, display, margin...
- **#mainwrapper
  #content_wrapper
  #control_panel
  .control_panel_iconwrapper
  > figure
  > figcaption** (line 716)
  Properties: max-width, text-align
- **#mainwrapper
  #content_wrapper
  #control_panel
  .control_panel_iconwrapper
  > figure
  > img** (line 727)
  Properties: height, display, border...
- **#mainwrapper #content_wrapper #search_wrapper > #search_button_mapExtend** (line 742)
  Properties: position, float, top...
- **#mainwrapper #content_wrapper #search_wrapper .search_button_icon** (line 756)
  Properties: width, position, transform...
- **#mainwrapper #content_wrapper #search_wrapper #map_search_results** (line 764)
  Properties: float, position, top
- **#mainwrapper #content_wrapper #search_wrapper #map_search_results > a** (line 771)
  Properties: font-size, color, display...
- **#mainwrapper
  #content_wrapper
  #search_wrapper
  #map_search_results
  > a:last-child** (line 793)
  Properties: border
- **#mainwrapper #content_wrapper #search_wrapper #map_search_results > a:hover** (line 801)
  Properties: background-color, color
- **#mainwrapper #content_wrapper #search_wrapper #map_search_results > a.active** (line 806)
  Properties: background-color, color
- **#mainwrapper
  #content_wrapper
  #search_wrapper
  #map_search_results
  > a.active:hover** (line 811)
  Properties: background
- **#mainwrapper #content_wrapper #search_wrapper #map_search_results > a > img** (line 819)
  Properties: float
- **#mainwrapper #content_wrapper #search_wrapper #map_search_results > a > div** (line 823)
  Properties: float, margin-left
- **#project-name** (line 846)
  Properties: font-weight
- **#status-info** (line 850)
  Properties: font-style
- **#dxf-controls** (line 856)
  Properties: background-color, border-radius, box-shadow...
- **#dxf-controls label** (line 864)
  Properties: display, margin-bottom, font-weight
- **#dxf-controls select** (line 870)
  Properties: width, padding, margin-bottom...
- **#dxf-controls input[type="text"]** (line 870)
  Properties: width, padding, margin-bottom...
- **.dxf-control-button:hover** (line 893)
  Properties: background-color
- **#dxf-clear-button** (line 897)
  Properties: background-color
- **#dxf-clear-button:hover** (line 901)
  Properties: background-color
- **#dxf-options** (line 905)
  Properties: margin-top, padding-top, border-top
- **50%** (line 930)
  Properties: transform, opacity
- **100%** (line 934)
  Properties: transform, opacity
- **#snap-toggle-button** (line 945)
  Properties: transition
- **#snap-toggle-button** (line 1021)
  Properties: top
- **#snap-toggle-button:hover** (line 949)
  Properties: opacity
- **#snap-toggle-button:active** (line 953)
  Properties: transform
- **#snap-status-message** (line 958)
  Properties: font-family, box-shadow
- **#feature-info-panel** (line 964)
  Properties: font-family, line-height, max-height...
- **#feature-info-panel** (line 1015)
  Properties: width, left, right
- **#feature-info-panel h3** (line 971)
  Properties: margin-top, border-bottom, padding-bottom...
- **#feature-info-panel h4** (line 978)
  Properties: margin, color
- **#feature-info-panel table** (line 983)
  Properties: border-collapse, width
- **#feature-info-panel td** (line 988)
  Properties: padding, border-bottom, word-break
- **#feature-info-panel td:first-child** (line 994)
  Properties: font-weight, width
- **#feature-info-panel button** (line 999)
  Properties: transition
- **#feature-info-panel button:hover** (line 1003)
  Properties: opacity
- **.empty-value** (line 1008)
  Properties: color, font-style
- **.basemap-radio-group** (line 1042)
  Properties: width, margin-bottom
- **.basemap-radio-group sl-radio** (line 1048)
  Properties: margin-bottom, display
- **.basemap-radio-group sl-radio** (line 1078)
  Properties: margin-bottom, padding
- **.basemap-radio-group sl-radio::part(label)** (line 1054)
  Properties: font-size, padding-left
- **.basemap-radio-group sl-radio .flag-emoji** (line 1060)
  Properties: margin-right
- **.basemap-radio-group sl-radio[checked]::part(base)** (line 1065)
  Properties: background-color, border-radius
- **.basemap-radio-group sl-radio[checked]::part(control)** (line 1071)
  Properties: border-color, background-color
- **.basemap-radio-group sl-radio::part(control)** (line 1083)
  Properties: --sl-toggle-size
- **.basemap-button** (line 1091)
  Properties: width
- **.basemap-button::part(base)** (line 1095)
  Properties: width, justify-content, text-align...
- **.basemap-button::part(base)** (line 1154)
  Properties: padding
- **.basemap-button[variant="default"]::part(base):hover** (line 1105)
  Properties: background-color, transform, box-shadow
- **.basemap-button[variant="primary"]::part(base)** (line 1111)
  Properties: background-color, color, box-shadow
- **.basemap-button[variant="primary"]::part(base):hover** (line 1117)
  Properties: background-color, transform, box-shadow
- **.basemap-flag** (line 1124)
  Properties: margin-right, font-size
- **#basemap-controls label** (line 1130)
  Properties: display, margin-bottom, padding...
- **#basemap-controls label** (line 1158)
  Properties: padding
- **#basemap-controls label:hover** (line 1140)
  Properties: background-color
- **#basemap-controls input[type="radio"]** (line 1144)
  Properties: margin-right
- **#basemap-controls input[type="radio"]:checked + span** (line 1148)
  Properties: font-weight
- **#basemap-controls .basemap-radio::part(base)** (line 1173)
  Properties: margin
- **#basemap-controls label.basemap-label** (line 1178)
  Properties: padding, margin, width
- **sl-drawer::part(base)** (line 1254)
  Properties: position, top, bottom...
- **sl-drawer .sidebar-content.rounded-rect** (line 1291)
  Properties: border-radius, background, padding...
- **sl-drawer[placement="end"]:not([open])::part(panel)** (line 1341)
  Properties: transform
- **sl-drawer[placement="end"][open]::part(panel)** (line 1345)
  Properties: transform
- **sl-drawer#right2-drawer #arrow-container** (line 1452)
  Properties: width, height, display...
- **.sidebar-content.rounded-rect** (line 1469)
  Properties: border-radius, padding, margin...
- **sl-drawer .sidebar-content::-webkit-scrollbar** (line 1503)
  Properties: width
- **sl-drawer .sidebar-content::-webkit-scrollbar-track** (line 1507)
  Properties: background, border-radius
- **sl-drawer .sidebar-content::-webkit-scrollbar-thumb** (line 1512)
  Properties: background, border-radius
- **sl-drawer .sidebar-content::-webkit-scrollbar-thumb:hover** (line 1517)
  Properties: background
- **sl-drawer .rounded-rect** (line 1543)
  Properties: flex, border-radius, background...
- **.flex-center** (line 1569)
  Properties: display, justify-content, align-items...
- **sl-drawer#left4-drawer .category-item** (line 1641)
  Properties: margin-bottom
- **sl-drawer#left4-drawer .lc-layer-item** (line 1706)
  Properties: padding
- **sl-drawer#left4-drawer .lc-layer-item** (line 1763)
  Properties: padding
- **sl-drawer#left4-drawer .lc-layer-controls sl-icon-button** (line 1729)
  Properties: --sl-spacing-medium
- **sl-drawer#left4-drawer .lc-collapse-all-btn** (line 1734)
  Properties: padding, font-size
- **#left1-drawer sl-details** (line 1768)
  Properties: margin-bottom
- **#left1-drawer sl-details::part(base)** (line 1772)
  Properties: border, background
- **#left2-drawer sl-details::part(base)** (line 1772)
  Properties: border, background
- **#left1-drawer sl-details::part(summary)** (line 1778)
  Properties: background-color, color, font-family...
- **#left2-drawer sl-details::part(summary)** (line 1778)
  Properties: background-color, color, font-family...
- **#left1-drawer sl-details::part(summary):hover** (line 1790)
  Properties: background-color
- **#left1-drawer sl-details[open]::part(summary)** (line 1794)
  Properties: background-color
- **#left1-drawer sl-details::part(content)** (line 1798)
  Properties: padding
- **#left2-drawer sl-details::part(content)** (line 1798)
  Properties: padding
- **.overlaycontrols sl-button::part(base)** (line 1816)
  Properties: width, justify-content, text-align...
- **.overlaycontrols sl-button::part(base):hover** (line 1826)
  Properties: background-color
- **.overlaycontrols sl-button[variant="primary"]::part(base)** (line 1830)
  Properties: background-color, color, border-color
- **.overlaycontrols sl-button[variant="primary"]::part(base):hover** (line 1836)
  Properties: background-color
- **#left1-drawer .sidebar-content::-webkit-scrollbar** (line 1859)
  Properties: display
- **#left1-drawer .sidebar-content::-webkit-scrollbar** (line 1883)
  Properties: display
- **#left2-drawer .sidebar-content::-webkit-scrollbar** (line 1859)
  Properties: display
- **#left2-drawer .sidebar-content::-webkit-scrollbar** (line 1883)
  Properties: display
- **#left4-drawer .sidebar-content::-webkit-scrollbar** (line 1883)
  Properties: display
- **#left4-drawer .categories-container::-webkit-scrollbar** (line 1895)
  Properties: display

## Duplicates and Overrides

### Exact Duplicates
- **:root**
  Original: src/css-backup-20250604/shoelace-custom.css:3
  Duplicate: src/css/shoelace-custom.css:3
- **:root**
  Original: src/css-backup-20250604/responsive-variables.css:2
  Duplicate: src/css/responsive-variables.css:2
- **:root**
  Original: src/css-backup-20250604/responsive-variables.css:48
  Duplicate: src/css/responsive-variables.css:48
- **:root**
  Original: src/css-backup-20250604/responsive-variables.css:57
  Duplicate: src/css/responsive-variables.css:57
- **:root**
  Original: src/css-backup-20250604/responsive-variables.css:66
  Duplicate: src/css/responsive-variables.css:66
- **:root**
  Original: src/css-backup-20250604/modernstyle.css:243
  Duplicate: src/css/modernstyle.css:243
- **:root**
  Original: src/css-backup-20250604/modernstyle.css:283
  Duplicate: src/css/modernstyle.css:283
- **:root**
  Original: src/css-backup-20250604/modernstyle.css:296
  Duplicate: src/css/modernstyle.css:296
- **:root**
  Original: src/css-backup-20250604/mobile-overrides.css:8
  Duplicate: src/css/mobile-overrides.css:8
- **:root**
  Original: src/css-backup-20250604/mobile-overrides.css:104
  Duplicate: src/css/mobile-overrides.css:104
- **:root**
  Original: src/css-backup-20250604/layer-catogories.css:358
  Duplicate: src/css/layer-catogories.css:358
- **:root**
  Original: src/css-backup-20250604/button-themes.css:4
  Duplicate: src/css/button-themes.css:4
- **sl-drawer::part(body)**
  Original: src/css/styles.css:1523
  Duplicate: src/css/sidebar-consolidated.css:68
- **.sidebar .controls sl-switch::part(base)**
  Original: src/css-backup-20250604/shoelace-custom.css:14
  Duplicate: src/css/shoelace-custom.css:14
- **.sidebar .controls sl-switch::part(label)**
  Original: src/css-backup-20250604/shoelace-custom.css:21
  Duplicate: src/css/shoelace-custom.css:21
- **.sidebar .controls sl-switch::part(control)**
  Original: src/css-backup-20250604/shoelace-custom.css:28
  Duplicate: src/css/shoelace-custom.css:28
- **.sidebar .controls sl-switch::part(control)**
  Original: src/css-backup-20250604/shoelace-custom.css:131
  Duplicate: src/css/shoelace-custom.css:131
- **.sidebar .controls sl-button::part(base)**
  Original: src/css-backup-20250604/shoelace-custom.css:33
  Duplicate: src/css/shoelace-custom.css:33
- **.sidebar .controls sl-button::part(base):hover**
  Original: src/css-backup-20250604/shoelace-custom.css:46
  Duplicate: src/css/shoelace-custom.css:46
- **.sidebar .controls sl-button::part(label)**
  Original: src/css-backup-20250604/shoelace-custom.css:51
  Duplicate: src/css/shoelace-custom.css:51
- **#search_wrapper**
  Original: src/css-backup-20250604/shoelace-custom.css:57
  Duplicate: src/css/shoelace-custom.css:57
- **#map_search_input**
  Original: src/css-backup-20250604/shoelace-custom.css:64
  Duplicate: src/css/shoelace-custom.css:64
- **#map_search_input::part(base)**
  Original: src/css-backup-20250604/shoelace-custom.css:69
  Duplicate: src/css/shoelace-custom.css:69
- **#search_button**
  Original: src/css-backup-20250604/shoelace-custom.css:73
  Duplicate: src/css/shoelace-custom.css:73
- **#search_button_mapExtend**
  Original: src/css-backup-20250604/shoelace-custom.css:73
  Duplicate: src/css/shoelace-custom.css:73
- **#search_button::part(base)**
  Original: src/css-backup-20250604/shoelace-custom.css:78
  Duplicate: src/css/shoelace-custom.css:78
- **#search_button_mapExtend::part(base)**
  Original: src/css-backup-20250604/shoelace-custom.css:78
  Duplicate: src/css/shoelace-custom.css:78
- **sl-range::part(base)**
  Original: src/css-backup-20250604/shoelace-custom.css:85
  Duplicate: src/css/shoelace-custom.css:85
- **#map_search_results a**
  Original: src/css-backup-20250604/shoelace-custom.css:90
  Duplicate: src/css/shoelace-custom.css:90
- **#map_search_results a:hover**
  Original: src/css-backup-20250604/shoelace-custom.css:97
  Duplicate: src/css/shoelace-custom.css:97
- **.status-footer sl-button::part(base)**
  Original: src/css-backup-20250604/shoelace-custom.css:103
  Duplicate: src/css/shoelace-custom.css:103
- **sl-switch::part(thumb)**
  Original: src/css-backup-20250604/shoelace-custom.css:109
  Duplicate: src/css/shoelace-custom.css:109
- **sl-switch::part(control)**
  Original: src/css-backup-20250604/shoelace-custom.css:113
  Duplicate: src/css/shoelace-custom.css:113
- **sl-switch[checked]::part(control)**
  Original: src/css-backup-20250604/shoelace-custom.css:117
  Duplicate: src/css/shoelace-custom.css:117
- **.sidebar .controls sl-switch**
  Original: src/css-backup-20250604/shoelace-custom.css:122
  Duplicate: src/css/shoelace-custom.css:122
- **#left4 .controls sl-button::part(base)**
  Original: src/css-backup-20250604/shoelace-custom.css:136
  Duplicate: src/css/shoelace-custom.css:136
- **#left4 .controls sl-button::part(base):hover**
  Original: src/css-backup-20250604/shoelace-custom.css:144
  Duplicate: src/css/shoelace-custom.css:144
- **#left4 .controls sl-button::part(label)**
  Original: src/css-backup-20250604/shoelace-custom.css:149
  Duplicate: src/css/shoelace-custom.css:149
- **.sidebar-content sl-switch**
  Original: src/css-backup-20250604/shoelace-custom.css:167
  Duplicate: src/css/shoelace-custom.css:167
- **.sidebar-content sl-button**
  Original: src/css-backup-20250604/shoelace-custom.css:167
  Duplicate: src/css/shoelace-custom.css:167
- **.sidebar-content sl-input**
  Original: src/css-backup-20250604/shoelace-custom.css:167
  Duplicate: src/css/shoelace-custom.css:167
- **.sidebar-content sl-range**
  Original: src/css-backup-20250604/shoelace-custom.css:167
  Duplicate: src/css/shoelace-custom.css:167
- **.sidebar-content sl-label**
  Original: src/css-backup-20250604/shoelace-custom.css:167
  Duplicate: src/css/shoelace-custom.css:167
- **.sidebar-content sl-tooltip::part(base)**
  Original: src/css-backup-20250604/shoelace-custom.css:167
  Duplicate: src/css/shoelace-custom.css:167
- **.sidebar-content sl-divider**
  Original: src/css-backup-20250604/shoelace-custom.css:167
  Duplicate: src/css/shoelace-custom.css:167
- **.responsive-component**
  Original: src/css-backup-20250604/responsive-variables.css:74
  Duplicate: src/css/responsive-variables.css:74
- **.sidebar-toggle-group**
  Original: src/css-backup-20250604/mobile-overrides.css:60
  Duplicate: src/css/mobile-overrides.css:60
- **.sidebar-toggle-group**
  Original: src/css-backup-20250604/mobile-overrides.css:68
  Duplicate: src/css/mobile-overrides.css:68
- **.sidebar-toggle-group**
  Original: src/css-backup-20250604/mobile-overrides.css:136
  Duplicate: src/css/mobile-overrides.css:136
- **.sidebar-toggle-group-right**
  Original: src/css-backup-20250604/mobile-overrides.css:60
  Duplicate: src/css/mobile-overrides.css:60
- **.sidebar-toggle-group-right**
  Original: src/css-backup-20250604/mobile-overrides.css:72
  Duplicate: src/css/mobile-overrides.css:72
- **.sidebar-toggle-group-right**
  Original: src/css-backup-20250604/mobile-overrides.css:136
  Duplicate: src/css/mobile-overrides.css:136
- **.maplibregl-ctrl-bottom-left**
  Original: src/css-backup-20250604/modernstyle.css:1
  Duplicate: src/css/modernstyle.css:1
- **.maplibregl-ctrl-bottom-left**
  Original: src/css-backup-20250604/modernstyle.css:17
  Duplicate: src/css/modernstyle.css:17
- **.maplibregl-ctrl-bottom-right**
  Original: src/css-backup-20250604/modernstyle.css:1
  Duplicate: src/css/modernstyle.css:1
- **.maplibregl-ctrl-bottom-right**
  Original: src/css-backup-20250604/modernstyle.css:21
  Duplicate: src/css/modernstyle.css:21
- **.maplibregl-ctrl-top-left**
  Original: src/css-backup-20250604/modernstyle.css:1
  Duplicate: src/css/modernstyle.css:1
- **.maplibregl-ctrl-top-left**
  Original: src/css-backup-20250604/modernstyle.css:9
  Duplicate: src/css/modernstyle.css:9
- **.maplibregl-ctrl-top-right**
  Original: src/css-backup-20250604/modernstyle.css:1
  Duplicate: src/css/modernstyle.css:1
- **.maplibregl-ctrl-top-right**
  Original: src/css-backup-20250604/modernstyle.css:13
  Duplicate: src/css/modernstyle.css:13
- **.maplibregl-ctrl**
  Original: src/css-backup-20250604/modernstyle.css:25
  Duplicate: src/css/modernstyle.css:25
- **.maplibregl-ctrl-attrib.maplibregl-compact-show**
  Original: src/css-backup-20250604/modernstyle.css:31
  Duplicate: src/css/modernstyle.css:31
- **.maplibregl-ctrl-attrib.maplibregl-compact-show**
  Original: src/css-backup-20250604/modernstyle.css:491
  Duplicate: src/css/modernstyle.css:491
- **.maplibregl-ctrl-attrib-button**
  Original: src/css-backup-20250604/modernstyle.css:34
  Duplicate: src/css/modernstyle.css:34
- **.maplibregl-ctrl-attrib-button**
  Original: src/css-backup-20250604/modernstyle.css:356
  Duplicate: src/css/modernstyle.css:356
- **.maplibregl-ctrl-attrib-button**
  Original: src/css-backup-20250604/modernstyle.css:500
  Duplicate: src/css/modernstyle.css:500
- **.maplibregl-ctrl-attrib.maplibregl-compact .maplibregl-ctrl-attrib-inner**
  Original: src/css-backup-20250604/modernstyle.css:34
  Duplicate: src/css/modernstyle.css:34
- **.maplibregl-ctrl-attrib summary.maplibregl-ctrl-attrib-button**
  Original: src/css-backup-20250604/modernstyle.css:38
  Duplicate: src/css/modernstyle.css:38
- **.maplibregl-ctrl-attrib
    summary.maplibregl-ctrl-attrib-button::-webkit-details-marker**
  Original: src/css-backup-20250604/modernstyle.css:44
  Duplicate: src/css/modernstyle.css:44
- **.maplibregl-ctrl-attrib.maplibregl-compact .maplibregl-ctrl-attrib-button**
  Original: src/css-backup-20250604/modernstyle.css:48
  Duplicate: src/css/modernstyle.css:48
- **.maplibregl-ctrl-attrib.maplibregl-compact-show
    .maplibregl-ctrl-attrib-inner**
  Original: src/css-backup-20250604/modernstyle.css:48
  Duplicate: src/css/modernstyle.css:48
- **.maplibregl-pseudo-fullscreen**
  Original: src/css-backup-20250604/modernstyle.css:54
  Duplicate: src/css/modernstyle.css:54
- **.maplibregl-ctrl-group button.maplibregl-ctrl-compass**
  Original: src/css-backup-20250604/modernstyle.css:62
  Duplicate: src/css/modernstyle.css:62
- **.maplibregl-ctrl-group button.maplibregl-ctrl-compass**
  Original: src/css-backup-20250604/modernstyle.css:65
  Duplicate: src/css/modernstyle.css:65
- **.maplibregl-canvas-container.maplibregl-interactive**
  Original: src/css-backup-20250604/modernstyle.css:65
  Duplicate: src/css/modernstyle.css:65
- **.maplibregl-canvas-container.maplibregl-interactive:active**
  Original: src/css-backup-20250604/modernstyle.css:72
  Duplicate: src/css/modernstyle.css:72
- **.maplibregl-ctrl-group button.maplibregl-ctrl-compass:active**
  Original: src/css-backup-20250604/modernstyle.css:72
  Duplicate: src/css/modernstyle.css:72
- **.maplibregl-boxzoom**
  Original: src/css-backup-20250604/modernstyle.css:76
  Duplicate: src/css/modernstyle.css:76
- **.maplibregl-boxzoom**
  Original: src/css-backup-20250604/modernstyle.css:710
  Duplicate: src/css/modernstyle.css:710
- **.maplibregl-cooperative-gesture-screen**
  Original: src/css-backup-20250604/modernstyle.css:83
  Duplicate: src/css/modernstyle.css:83
- **.maplibregl-cooperative-gesture-screen**
  Original: src/css-backup-20250604/modernstyle.css:716
  Duplicate: src/css/modernstyle.css:716
- **.maplibregl-cooperative-gesture-screen.maplibregl-show**
  Original: src/css-backup-20250604/modernstyle.css:93
  Duplicate: src/css/modernstyle.css:93
- **.maplibregl-cooperative-gesture-screen.maplibregl-show**
  Original: src/css-backup-20250604/modernstyle.css:724
  Duplicate: src/css/modernstyle.css:724
- **.maplibregl-cooperative-gesture-screen .maplibregl-mobile-message**
  Original: src/css-backup-20250604/modernstyle.css:96
  Duplicate: src/css/modernstyle.css:96
- **.maplibregl-cooperative-gesture-screen .maplibregl-mobile-message**
  Original: src/css-backup-20250604/modernstyle.css:103
  Duplicate: src/css/modernstyle.css:103
- **.maplibregl-cooperative-gesture-screen .maplibregl-desktop-message**
  Original: src/css-backup-20250604/modernstyle.css:100
  Duplicate: src/css/modernstyle.css:100
- **.maplibregl-marker**
  Original: src/css-backup-20250604/modernstyle.css:107
  Duplicate: src/css/modernstyle.css:107
- **.maplibregl-marker**
  Original: src/css-backup-20250604/modernstyle.css:110
  Duplicate: src/css/modernstyle.css:110
- **.maplibregl-popup**
  Original: src/css-backup-20250604/modernstyle.css:110
  Duplicate: src/css/modernstyle.css:110
- **.maplibregl-popup**
  Original: src/css-backup-20250604/modernstyle.css:117
  Duplicate: src/css/modernstyle.css:117
- **.maplibregl-popup-anchor-top**
  Original: src/css-backup-20250604/modernstyle.css:121
  Duplicate: src/css/modernstyle.css:121
- **.maplibregl-popup-anchor-top-left**
  Original: src/css-backup-20250604/modernstyle.css:121
  Duplicate: src/css/modernstyle.css:121
- **.maplibregl-popup-anchor-top-right**
  Original: src/css-backup-20250604/modernstyle.css:121
  Duplicate: src/css/modernstyle.css:121
- **.maplibregl-popup-anchor-bottom**
  Original: src/css-backup-20250604/modernstyle.css:126
  Duplicate: src/css/modernstyle.css:126
- **.maplibregl-popup-anchor-bottom-left**
  Original: src/css-backup-20250604/modernstyle.css:126
  Duplicate: src/css/modernstyle.css:126
- **.maplibregl-popup-anchor-bottom-right**
  Original: src/css-backup-20250604/modernstyle.css:126
  Duplicate: src/css/modernstyle.css:126
- **.maplibregl-popup-anchor-left**
  Original: src/css-backup-20250604/modernstyle.css:131
  Duplicate: src/css/modernstyle.css:131
- **.maplibregl-popup-anchor-right**
  Original: src/css-backup-20250604/modernstyle.css:134
  Duplicate: src/css/modernstyle.css:134
- **.maplibregl-popup-tip**
  Original: src/css-backup-20250604/modernstyle.css:137
  Duplicate: src/css/modernstyle.css:137
- **.maplibregl-popup-tip**
  Original: src/css-backup-20250604/modernstyle.css:727
  Duplicate: src/css/modernstyle.css:727
- **.maplibregl-popup-anchor-top .maplibregl-popup-tip**
  Original: src/css-backup-20250604/modernstyle.css:142
  Duplicate: src/css/modernstyle.css:142
- **.maplibregl-popup-anchor-top .maplibregl-popup-tip**
  Original: src/css-backup-20250604/modernstyle.css:730
  Duplicate: src/css/modernstyle.css:730
- **.maplibregl-popup-anchor-top-left .maplibregl-popup-tip**
  Original: src/css-backup-20250604/modernstyle.css:146
  Duplicate: src/css/modernstyle.css:146
- **.maplibregl-popup-anchor-top-left .maplibregl-popup-tip**
  Original: src/css-backup-20250604/modernstyle.css:730
  Duplicate: src/css/modernstyle.css:730
- **.maplibregl-popup-anchor-top-right .maplibregl-popup-tip**
  Original: src/css-backup-20250604/modernstyle.css:151
  Duplicate: src/css/modernstyle.css:151
- **.maplibregl-popup-anchor-top-right .maplibregl-popup-tip**
  Original: src/css-backup-20250604/modernstyle.css:730
  Duplicate: src/css/modernstyle.css:730
- **.maplibregl-popup-anchor-bottom .maplibregl-popup-tip**
  Original: src/css-backup-20250604/modernstyle.css:156
  Duplicate: src/css/modernstyle.css:156
- **.maplibregl-popup-anchor-bottom .maplibregl-popup-tip**
  Original: src/css-backup-20250604/modernstyle.css:735
  Duplicate: src/css/modernstyle.css:735
- **.maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip**
  Original: src/css-backup-20250604/modernstyle.css:160
  Duplicate: src/css/modernstyle.css:160
- **.maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip**
  Original: src/css-backup-20250604/modernstyle.css:735
  Duplicate: src/css/modernstyle.css:735
- **.maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip**
  Original: src/css-backup-20250604/modernstyle.css:165
  Duplicate: src/css/modernstyle.css:165
- **.maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip**
  Original: src/css-backup-20250604/modernstyle.css:735
  Duplicate: src/css/modernstyle.css:735
- **.maplibregl-popup-anchor-left .maplibregl-popup-tip**
  Original: src/css-backup-20250604/modernstyle.css:170
  Duplicate: src/css/modernstyle.css:170
- **.maplibregl-popup-anchor-left .maplibregl-popup-tip**
  Original: src/css-backup-20250604/modernstyle.css:740
  Duplicate: src/css/modernstyle.css:740
- **.maplibregl-popup-anchor-right .maplibregl-popup-tip**
  Original: src/css-backup-20250604/modernstyle.css:174
  Duplicate: src/css/modernstyle.css:174
- **.maplibregl-popup-anchor-right .maplibregl-popup-tip**
  Original: src/css-backup-20250604/modernstyle.css:743
  Duplicate: src/css/modernstyle.css:743
- **.maplibregl-popup-track-pointer**
  Original: src/css-backup-20250604/modernstyle.css:178
  Duplicate: src/css/modernstyle.css:178
- **.maplibregl-popup-track-pointer ***
  Original: src/css-backup-20250604/modernstyle.css:181
  Duplicate: src/css/modernstyle.css:181
- **.maplibregl-map:hover .maplibregl-popup-track-pointer**
  Original: src/css-backup-20250604/modernstyle.css:187
  Duplicate: src/css/modernstyle.css:187
- **.maplibregl-map:active .maplibregl-popup-track-pointer**
  Original: src/css-backup-20250604/modernstyle.css:190
  Duplicate: src/css/modernstyle.css:190
- **.maplibregl-popup-content**
  Original: src/css-backup-20250604/modernstyle.css:193
  Duplicate: src/css/modernstyle.css:193
- **.maplibregl-popup-content**
  Original: src/css-backup-20250604/modernstyle.css:781
  Duplicate: src/css/modernstyle.css:781
- **.maplibregl-canvas-container.maplibregl-interactive.maplibregl-track-pointer**
  Original: src/css-backup-20250604/modernstyle.css:197
  Duplicate: src/css/modernstyle.css:197
- **.maplibregl-canvas-container.maplibregl-touch-zoom-rotate**
  Original: src/css-backup-20250604/modernstyle.css:200
  Duplicate: src/css/modernstyle.css:200
- **.maplibregl-canvas-container.maplibregl-touch-zoom-rotate .maplibregl-canvas**
  Original: src/css-backup-20250604/modernstyle.css:200
  Duplicate: src/css/modernstyle.css:200
- **.maplibregl-canvas-container.maplibregl-touch-drag-pan**
  Original: src/css-backup-20250604/modernstyle.css:204
  Duplicate: src/css/modernstyle.css:204
- **.maplibregl-canvas-container.maplibregl-touch-drag-pan .maplibregl-canvas**
  Original: src/css-backup-20250604/modernstyle.css:204
  Duplicate: src/css/modernstyle.css:204
- **.maplibregl-canvas-container.maplibregl-touch-zoom-rotate.maplibregl-touch-drag-pan**
  Original: src/css-backup-20250604/modernstyle.css:208
  Duplicate: src/css/modernstyle.css:208
- **.maplibregl-canvas-container.maplibregl-touch-zoom-rotate.maplibregl-touch-drag-pan
  .maplibregl-canvas**
  Original: src/css-backup-20250604/modernstyle.css:208
  Duplicate: src/css/modernstyle.css:208
- **.maplibregl-canvas-container.maplibregl-touch-drag-pan.maplibregl-cooperative-gestures**
  Original: src/css-backup-20250604/modernstyle.css:213
  Duplicate: src/css/modernstyle.css:213
- **.maplibregl-canvas-container.maplibregl-touch-drag-pan.maplibregl-cooperative-gestures
  .maplibregl-canvas**
  Original: src/css-backup-20250604/modernstyle.css:213
  Duplicate: src/css/modernstyle.css:213
- **.maplibregl-crosshair**
  Original: src/css-backup-20250604/modernstyle.css:218
  Duplicate: src/css/modernstyle.css:218
- **.maplibregl-crosshair .maplibregl-interactive**
  Original: src/css-backup-20250604/modernstyle.css:218
  Duplicate: src/css/modernstyle.css:218
- **.maplibregl-crosshair .maplibregl-interactive:active**
  Original: src/css-backup-20250604/modernstyle.css:218
  Duplicate: src/css/modernstyle.css:218
- **.maplibregl-map**
  Original: src/css-backup-20250604/modernstyle.css:223
  Duplicate: src/css/modernstyle.css:223
- **.maplibregl-map**
  Original: src/css-backup-20250604/modernstyle.css:308
  Duplicate: src/css/modernstyle.css:308
- **.maplibregl-map**
  Original: src/css-backup-20250604/modernstyle.css:792
  Duplicate: src/css/modernstyle.css:792
- **.maplibregl-canvas**
  Original: src/css-backup-20250604/modernstyle.css:228
  Duplicate: src/css/modernstyle.css:228
- **.maplibregl-map:fullscreen**
  Original: src/css-backup-20250604/modernstyle.css:233
  Duplicate: src/css/modernstyle.css:233
- **.dark**
  Original: src/css-backup-20250604/modernstyle.css:269
  Duplicate: src/css/modernstyle.css:269
- **.dark**
  Original: src/css-backup-20250604/modernstyle.css:283
  Duplicate: src/css/modernstyle.css:283
- **.dark**
  Original: src/css-backup-20250604/modernstyle.css:296
  Duplicate: src/css/modernstyle.css:296
- **.maplibregl-ctrl-top-left .maplibregl-ctrl**
  Original: src/css-backup-20250604/modernstyle.css:311
  Duplicate: src/css/modernstyle.css:311
- **.maplibregl-ctrl-top-right .maplibregl-ctrl**
  Original: src/css-backup-20250604/modernstyle.css:315
  Duplicate: src/css/modernstyle.css:315
- **.maplibregl-ctrl-bottom-left .maplibregl-ctrl**
  Original: src/css-backup-20250604/modernstyle.css:319
  Duplicate: src/css/modernstyle.css:319
- **.maplibregl-ctrl-bottom-right .maplibregl-ctrl**
  Original: src/css-backup-20250604/modernstyle.css:323
  Duplicate: src/css/modernstyle.css:323
- **.maplibregl-ctrl-group**
  Original: src/css-backup-20250604/modernstyle.css:327
  Duplicate: src/css/modernstyle.css:327
- **.maplibregl-ctrl-group:not(:empty)**
  Original: src/css-backup-20250604/modernstyle.css:331
  Duplicate: src/css/modernstyle.css:331
- **.maplibregl-ctrl-group:not(:empty)**
  Original: src/css-backup-20250604/modernstyle.css:335
  Duplicate: src/css/modernstyle.css:335
- **.maplibregl-ctrl-group button + button**
  Original: src/css-backup-20250604/modernstyle.css:339
  Duplicate: src/css/modernstyle.css:339
- **.maplibregl-ctrl-group button + button**
  Original: src/css-backup-20250604/modernstyle.css:343
  Duplicate: src/css/modernstyle.css:343
- **.maplibregl-ctrl-group button:first-child**
  Original: src/css-backup-20250604/modernstyle.css:347
  Duplicate: src/css/modernstyle.css:347
- **.maplibregl-ctrl-group button:last-child**
  Original: src/css-backup-20250604/modernstyle.css:350
  Duplicate: src/css/modernstyle.css:350
- **.maplibregl-ctrl-group button:only-child**
  Original: src/css-backup-20250604/modernstyle.css:353
  Duplicate: src/css/modernstyle.css:353
- **.maplibregl-ctrl button**
  Original: src/css-backup-20250604/modernstyle.css:356
  Duplicate: src/css/modernstyle.css:356
- **.maplibregl-ctrl-group button**
  Original: src/css-backup-20250604/modernstyle.css:370
  Duplicate: src/css/modernstyle.css:370
- **.maplibregl-ctrl button:not(:disabled):hover**
  Original: src/css-backup-20250604/modernstyle.css:378
  Duplicate: src/css/modernstyle.css:378
- **.maplibregl-ctrl-attrib-button:not(:disabled):hover**
  Original: src/css-backup-20250604/modernstyle.css:378
  Duplicate: src/css/modernstyle.css:378
- **.maplibregl-ctrl button:not(:disabled):is(.active**
  Original: src/css-backup-20250604/modernstyle.css:383
  Duplicate: src/css/modernstyle.css:383
- **.-active)**
  Original: src/css-backup-20250604/modernstyle.css:383
  Duplicate: src/css/modernstyle.css:383
- **.maplibregl-ctrl button:not(:disabled):active**
  Original: src/css-backup-20250604/modernstyle.css:386
  Duplicate: src/css/modernstyle.css:386
- **.maplibregl-ctrl-attrib-button:not(:disabled):active**
  Original: src/css-backup-20250604/modernstyle.css:386
  Duplicate: src/css/modernstyle.css:386
- **.maplibregl-ctrl button:focus**
  Original: src/css-backup-20250604/modernstyle.css:391
  Duplicate: src/css/modernstyle.css:391
- **.maplibregl-ctrl button:focus**
  Original: src/css-backup-20250604/modernstyle.css:395
  Duplicate: src/css/modernstyle.css:395
- **.maplibregl-ctrl-attrib-button:focus**
  Original: src/css-backup-20250604/modernstyle.css:391
  Duplicate: src/css/modernstyle.css:391
- **.maplibregl-ctrl button:focus:focus-visible**
  Original: src/css-backup-20250604/modernstyle.css:398
  Duplicate: src/css/modernstyle.css:398
- **.maplibregl-ctrl-attrib-button:focus:focus-visible**
  Original: src/css-backup-20250604/modernstyle.css:398
  Duplicate: src/css/modernstyle.css:398
- **.maplibregl-ctrl button:focus:not(:focus-visible)**
  Original: src/css-backup-20250604/modernstyle.css:402
  Duplicate: src/css/modernstyle.css:402
- **.maplibregl-ctrl-attrib-button:focus:not(:focus-visible)**
  Original: src/css-backup-20250604/modernstyle.css:402
  Duplicate: src/css/modernstyle.css:402
- **.maplibregl-ctrl-icon**
  Original: src/css-backup-20250604/modernstyle.css:407
  Duplicate: src/css/modernstyle.css:407
- **.maplibregl-ctrl button::-moz-focus-inner**
  Original: src/css-backup-20250604/modernstyle.css:411
  Duplicate: src/css/modernstyle.css:411
- **.maplibregl-ctrl button:disabled**
  Original: src/css-backup-20250604/modernstyle.css:415
  Duplicate: src/css/modernstyle.css:415
- **.maplibregl-ctrl button:disabled :is(.maplibregl-ctrl-icon:before**
  Original: src/css-backup-20250604/modernstyle.css:418
  Duplicate: src/css/modernstyle.css:418
- **svg)**
  Original: src/css-backup-20250604/modernstyle.css:418
  Duplicate: src/css/modernstyle.css:418
- **.maplibregl-ctrl .maplibregl-ctrl-attrib-button:before**
  Original: src/css-backup-20250604/modernstyle.css:421
  Duplicate: src/css/modernstyle.css:421
- **.maplibregl-ctrl .maplibregl-ctrl-attrib-button:before**
  Original: src/css-backup-20250604/modernstyle.css:434
  Duplicate: src/css/modernstyle.css:434
- **.maplibregl-ctrl .maplibregl-ctrl-attrib-button:before**
  Original: src/css-backup-20250604/modernstyle.css:445
  Duplicate: src/css/modernstyle.css:445
- **.maplibregl-ctrl button .maplibregl-ctrl-icon:before**
  Original: src/css-backup-20250604/modernstyle.css:421
  Duplicate: src/css/modernstyle.css:421
- **.maplibregl-ctrl button .maplibregl-ctrl-icon:before**
  Original: src/css-backup-20250604/modernstyle.css:434
  Duplicate: src/css/modernstyle.css:434
- **.maplibregl-ctrl button .maplibregl-ctrl-icon:before**
  Original: src/css-backup-20250604/modernstyle.css:445
  Duplicate: src/css/modernstyle.css:445
- **.maplibregl-ctrl button.maplibregl-ctrl-compass .maplibregl-ctrl-icon:after**
  Original: src/css-backup-20250604/modernstyle.css:421
  Duplicate: src/css/modernstyle.css:421
- **.maplibregl-ctrl button.maplibregl-ctrl-compass .maplibregl-ctrl-icon:after**
  Original: src/css-backup-20250604/modernstyle.css:434
  Duplicate: src/css/modernstyle.css:434
- **.maplibregl-ctrl button.maplibregl-ctrl-compass .maplibregl-ctrl-icon:after**
  Original: src/css-backup-20250604/modernstyle.css:445
  Duplicate: src/css/modernstyle.css:445
- **.maplibregl-ctrl button.maplibregl-ctrl-compass .maplibregl-ctrl-icon:after**
  Original: src/css-backup-20250604/modernstyle.css:681
  Duplicate: src/css/modernstyle.css:681
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate:disabled
  .maplibregl-ctrl-icon:after**
  Original: src/css-backup-20250604/modernstyle.css:421
  Duplicate: src/css/modernstyle.css:421
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate:disabled
  .maplibregl-ctrl-icon:after**
  Original: src/css-backup-20250604/modernstyle.css:434
  Duplicate: src/css/modernstyle.css:434
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate:disabled
  .maplibregl-ctrl-icon:after**
  Original: src/css-backup-20250604/modernstyle.css:445
  Duplicate: src/css/modernstyle.css:445
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate:disabled
  .maplibregl-ctrl-icon:after**
  Original: src/css-backup-20250604/modernstyle.css:590
  Duplicate: src/css/modernstyle.css:590
- **a.maplibregl-ctrl-logo:before**
  Original: src/css-backup-20250604/modernstyle.css:421
  Duplicate: src/css/modernstyle.css:421
- **a.maplibregl-ctrl-logo:before**
  Original: src/css-backup-20250604/modernstyle.css:442
  Duplicate: src/css/modernstyle.css:442
- **a.maplibregl-ctrl-logo:before**
  Original: src/css-backup-20250604/modernstyle.css:643
  Duplicate: src/css/modernstyle.css:643
- **a.maplibregl-ctrl-logo:before**
  Original: src/css-backup-20250604/modernstyle.css:660
  Duplicate: src/css/modernstyle.css:660
- **.maplibregl-ctrl button svg**
  Original: src/css-backup-20250604/modernstyle.css:460
  Duplicate: src/css/modernstyle.css:460
- **.maplibregl-ctrl.maplibregl-ctrl-attrib**
  Original: src/css-backup-20250604/modernstyle.css:464
  Duplicate: src/css/modernstyle.css:464
- **.maplibregl-ctrl-bottom-right > .maplibregl-ctrl-attrib**
  Original: src/css-backup-20250604/modernstyle.css:470
  Duplicate: src/css/modernstyle.css:470
- **.maplibregl-ctrl-top-right > .maplibregl-ctrl-attrib**
  Original: src/css-backup-20250604/modernstyle.css:473
  Duplicate: src/css/modernstyle.css:473
- **.maplibregl-ctrl-top-left > .maplibregl-ctrl-attrib**
  Original: src/css-backup-20250604/modernstyle.css:476
  Duplicate: src/css/modernstyle.css:476
- **.maplibregl-ctrl-bottom-left > .maplibregl-ctrl-attrib**
  Original: src/css-backup-20250604/modernstyle.css:479
  Duplicate: src/css/modernstyle.css:479
- **.maplibregl-ctrl-attrib.maplibregl-compact**
  Original: src/css-backup-20250604/modernstyle.css:483
  Duplicate: src/css/modernstyle.css:483
- **.maplibregl-ctrl-bottom-left
    > .maplibregl-ctrl-attrib.maplibregl-compact-show**
  Original: src/css-backup-20250604/modernstyle.css:494
  Duplicate: src/css/modernstyle.css:494
- **.maplibregl-ctrl-top-left > .maplibregl-ctrl-attrib.maplibregl-compact-show**
  Original: src/css-backup-20250604/modernstyle.css:494
  Duplicate: src/css/modernstyle.css:494
- **.maplibregl-ctrl-attrib-button:before**
  Original: src/css-backup-20250604/modernstyle.css:506
  Duplicate: src/css/modernstyle.css:506
- **.maplibregl-ctrl-bottom-left .maplibregl-ctrl-attrib-button**
  Original: src/css-backup-20250604/modernstyle.css:510
  Duplicate: src/css/modernstyle.css:510
- **.maplibregl-ctrl-top-left .maplibregl-ctrl-attrib-button**
  Original: src/css-backup-20250604/modernstyle.css:510
  Duplicate: src/css/modernstyle.css:510
- **.maplibregl-ctrl-attrib-inner**
  Original: src/css-backup-20250604/modernstyle.css:515
  Duplicate: src/css/modernstyle.css:515
- **.maplibregl-ctrl-attrib a**
  Original: src/css-backup-20250604/modernstyle.css:518
  Duplicate: src/css/modernstyle.css:518
- **.maplibregl-ctrl-attrib a:hover**
  Original: src/css-backup-20250604/modernstyle.css:522
  Duplicate: src/css/modernstyle.css:522
- **.maplibregl-attrib-empty**
  Original: src/css-backup-20250604/modernstyle.css:526
  Duplicate: src/css/modernstyle.css:526
- **.maplibregl-ctrl
  button.maplibregl-ctrl-fullscreen
  .maplibregl-ctrl-icon:before**
  Original: src/css-backup-20250604/modernstyle.css:529
  Duplicate: src/css/modernstyle.css:529
- **.maplibregl-ctrl button.maplibregl-ctrl-shrink .maplibregl-ctrl-icon:before**
  Original: src/css-backup-20250604/modernstyle.css:534
  Duplicate: src/css/modernstyle.css:534
- **.maplibregl-user-location-dot**
  Original: src/css-backup-20250604/modernstyle.css:537
  Duplicate: src/css/modernstyle.css:537
- **.maplibregl-user-location-dot:before**
  Original: src/css-backup-20250604/modernstyle.css:537
  Duplicate: src/css/modernstyle.css:537
- **.maplibregl-user-location-dot:before**
  Original: src/css-backup-20250604/modernstyle.css:544
  Duplicate: src/css/modernstyle.css:544
- **.maplibregl-user-location-dot:after**
  Original: src/css-backup-20250604/modernstyle.css:549
  Duplicate: src/css/modernstyle.css:549
- **0%**
  Original: src/css-backup-20250604/modernstyle.css:562
  Duplicate: src/css/modernstyle.css:562
- **0%**
  Original: src/css-backup-20250604/modernstyle.css:630
  Duplicate: src/css/modernstyle.css:630
- **70%**
  Original: src/css-backup-20250604/modernstyle.css:566
  Duplicate: src/css/modernstyle.css:566
- **to**
  Original: src/css-backup-20250604/modernstyle.css:570
  Duplicate: src/css/modernstyle.css:570
- **to**
  Original: src/css-backup-20250604/modernstyle.css:633
  Duplicate: src/css/modernstyle.css:633
- **.maplibregl-user-location-dot-stale**
  Original: src/css-backup-20250604/modernstyle.css:575
  Duplicate: src/css/modernstyle.css:575
- **.maplibregl-user-location-dot-stale:after**
  Original: src/css-backup-20250604/modernstyle.css:578
  Duplicate: src/css/modernstyle.css:578
- **.maplibregl-user-location-accuracy-circle**
  Original: src/css-backup-20250604/modernstyle.css:581
  Duplicate: src/css/modernstyle.css:581
- **.maplibregl-ctrl button.maplibregl-ctrl-geolocate .maplibregl-ctrl-icon:before**
  Original: src/css-backup-20250604/modernstyle.css:587
  Duplicate: src/css/modernstyle.css:587
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-active
  .maplibregl-ctrl-icon:before**
  Original: src/css-backup-20250604/modernstyle.css:600
  Duplicate: src/css/modernstyle.css:600
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-active-error
  .maplibregl-ctrl-icon:before**
  Original: src/css-backup-20250604/modernstyle.css:606
  Duplicate: src/css/modernstyle.css:606
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-background
  .maplibregl-ctrl-icon:before**
  Original: src/css-backup-20250604/modernstyle.css:612
  Duplicate: src/css/modernstyle.css:612
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-background-error
  .maplibregl-ctrl-icon:before**
  Original: src/css-backup-20250604/modernstyle.css:618
  Duplicate: src/css/modernstyle.css:618
- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-waiting
  .maplibregl-ctrl-icon:before**
  Original: src/css-backup-20250604/modernstyle.css:624
  Duplicate: src/css/modernstyle.css:624
- **a.maplibregl-ctrl-logo**
  Original: src/css-backup-20250604/modernstyle.css:637
  Duplicate: src/css/modernstyle.css:637
- **.dark a.maplibregl-ctrl-logo:before**
  Original: src/css-backup-20250604/modernstyle.css:655
  Duplicate: src/css-backup-20250604/modernstyle.css:660
- **.dark a.maplibregl-ctrl-logo:before**
  Original: src/css-backup-20250604/modernstyle.css:655
  Duplicate: src/css/modernstyle.css:655
- **.dark a.maplibregl-ctrl-logo:before**
  Original: src/css-backup-20250604/modernstyle.css:655
  Duplicate: src/css/modernstyle.css:660
- **a.maplibregl-ctrl-logo:hover:before**
  Original: src/css-backup-20250604/modernstyle.css:666
  Duplicate: src/css/modernstyle.css:666
- **a.maplibregl-ctrl-logo.maplibregl-compact:before**
  Original: src/css-backup-20250604/modernstyle.css:669
  Duplicate: src/css/modernstyle.css:669
- **.maplibregl-ctrl button.maplibregl-ctrl-zoom-out .maplibregl-ctrl-icon:before**
  Original: src/css-backup-20250604/modernstyle.css:672
  Duplicate: src/css/modernstyle.css:672
- **.maplibregl-ctrl button.maplibregl-ctrl-zoom-in .maplibregl-ctrl-icon:before**
  Original: src/css-backup-20250604/modernstyle.css:675
  Duplicate: src/css/modernstyle.css:675
- **.maplibregl-ctrl button.maplibregl-ctrl-compass .maplibregl-ctrl-icon:before**
  Original: src/css-backup-20250604/modernstyle.css:678
  Duplicate: src/css/modernstyle.css:678
- **.maplibregl-ctrl-scale**
  Original: src/css-backup-20250604/modernstyle.css:689
  Duplicate: src/css/modernstyle.css:689
- **.maplibregl-ctrl button.maplibregl-ctrl-terrain .maplibregl-ctrl-icon:before**
  Original: src/css-backup-20250604/modernstyle.css:701
  Duplicate: src/css/modernstyle.css:701
- **.maplibregl-ctrl
  button.maplibregl-ctrl-terrain-enabled
  .maplibregl-ctrl-icon:before**
  Original: src/css-backup-20250604/modernstyle.css:704
  Duplicate: src/css/modernstyle.css:704
- **.maplibregl-popup-anchor-top-left .maplibregl-popup-content**
  Original: src/css-backup-20250604/modernstyle.css:746
  Duplicate: src/css/modernstyle.css:746
- **.maplibregl-popup-anchor-top-right .maplibregl-popup-content**
  Original: src/css-backup-20250604/modernstyle.css:749
  Duplicate: src/css/modernstyle.css:749
- **.maplibregl-popup-anchor-bottom-left .maplibregl-popup-content**
  Original: src/css-backup-20250604/modernstyle.css:752
  Duplicate: src/css/modernstyle.css:752
- **.maplibregl-popup-anchor-bottom-right .maplibregl-popup-content**
  Original: src/css-backup-20250604/modernstyle.css:755
  Duplicate: src/css/modernstyle.css:755
- **.maplibregl-popup-close-button**
  Original: src/css-backup-20250604/modernstyle.css:758
  Duplicate: src/css/modernstyle.css:758
- **.maplibregl-popup-close-button:hover**
  Original: src/css-backup-20250604/modernstyle.css:775
  Duplicate: src/css/modernstyle.css:775
- **.maplibregl-popup-close-button:active**
  Original: src/css-backup-20250604/modernstyle.css:778
  Duplicate: src/css/modernstyle.css:778
- **.maplibregl-popup-content:has(.maplibregl-popup-close-button)**
  Original: src/css-backup-20250604/modernstyle.css:789
  Duplicate: src/css/modernstyle.css:789
- **.sidebar-toggle**
  Original: src/css-backup-20250604/mobile-overrides.css:13
  Duplicate: src/css/mobile-overrides.css:13
- **.sidebar-toggle**
  Original: src/css-backup-20250604/mobile-overrides.css:115
  Duplicate: src/css/mobile-overrides.css:115
- **sl-drawer[placement="start"]::part(panel)**
  Original: src/css-backup-20250604/mobile-overrides.css:19
  Duplicate: src/css/mobile-overrides.css:19
- **sl-drawer[placement="start"]::part(panel)**
  Original: src/css-backup-20250604/mobile-overrides.css:33
  Duplicate: src/css/mobile-overrides.css:33
- **sl-drawer[placement="start"]::part(panel)**
  Original: src/css-backup-20250604/mobile-overrides.css:109
  Duplicate: src/css/mobile-overrides.css:109
- **sl-drawer[placement="end"]::part(panel)**
  Original: src/css-backup-20250604/mobile-overrides.css:19
  Duplicate: src/css/mobile-overrides.css:19
- **sl-drawer[placement="end"]::part(panel)**
  Original: src/css-backup-20250604/mobile-overrides.css:33
  Duplicate: src/css/mobile-overrides.css:33
- **sl-drawer[placement="end"]::part(panel)**
  Original: src/css-backup-20250604/mobile-overrides.css:109
  Duplicate: src/css/mobile-overrides.css:109
- **sl-drawer[placement="start"]**
  Original: src/css-backup-20250604/mobile-overrides.css:28
  Duplicate: src/css/styles.css:1901
- **sl-drawer[placement="start"]**
  Original: src/css-backup-20250604/mobile-overrides.css:28
  Duplicate: src/css/mobile-overrides.css:28
- **sl-drawer[placement="start"]**
  Original: src/css-backup-20250604/mobile-overrides.css:130
  Duplicate: src/css/mobile-overrides.css:130
- **sl-drawer[placement="end"]**
  Original: src/css-backup-20250604/mobile-overrides.css:28
  Duplicate: src/css/styles.css:1901
- **sl-drawer[placement="end"]**
  Original: src/css-backup-20250604/mobile-overrides.css:28
  Duplicate: src/css/mobile-overrides.css:28
- **sl-drawer[placement="end"]**
  Original: src/css-backup-20250604/mobile-overrides.css:130
  Duplicate: src/css/mobile-overrides.css:130
- **sl-drawer#right1-drawer::part(panel)**
  Original: src/css-backup-20250604/mobile-overrides.css:46
  Duplicate: src/css/styles.css:1918
- **sl-drawer#right1-drawer::part(panel)**
  Original: src/css-backup-20250604/mobile-overrides.css:46
  Duplicate: src/css/mobile-overrides.css:46
- **sl-drawer#right2-drawer::part(panel)**
  Original: src/css-backup-20250604/mobile-overrides.css:46
  Duplicate: src/css/styles.css:1918
- **sl-drawer#right2-drawer::part(panel)**
  Original: src/css-backup-20250604/mobile-overrides.css:46
  Duplicate: src/css/mobile-overrides.css:46
- **#footer-bar**
  Original: src/css-backup-20250604/mobile-overrides.css:52
  Duplicate: src/css/mobile-overrides.css:52
- **#fab-main**
  Original: src/css-backup-20250604/mobile-overrides.css:77
  Duplicate: src/css/mobile-overrides.css:77
- **#fab-main**
  Original: src/css-backup-20250604/mobile-overrides.css:121
  Duplicate: src/css/mobile-overrides.css:121
- **#fab-main**
  Original: src/css-backup-20250604/mobile-overrides.css:142
  Duplicate: src/css/mobile-overrides.css:142
- **#fab-main:hover**
  Original: src/css-backup-20250604/mobile-overrides.css:96
  Duplicate: src/css/mobile-overrides.css:96
- **#left4**
  Original: src/css-backup-20250604/layer-catogories.css:4
  Duplicate: src/css/layer-catogories.css:4
- **#left4 .sidebar-content**
  Original: src/css-backup-20250604/layer-catogories.css:8
  Duplicate: src/css/layer-catogories.css:8
- **.layer-list-header**
  Original: src/css-backup-20250604/layer-catogories.css:15
  Duplicate: src/css/layer-catogories.css:15
- **.layer-list-header sl-button**
  Original: src/css-backup-20250604/layer-catogories.css:28
  Duplicate: src/css/layer-catogories.css:28
- **.layer-list-header sl-button:hover**
  Original: src/css-backup-20250604/layer-catogories.css:42
  Duplicate: src/css/layer-catogories.css:42
- **.layer-list-title**
  Original: src/css-backup-20250604/layer-catogories.css:46
  Duplicate: src/css/layer-catogories.css:46
- **.search-container**
  Original: src/css-backup-20250604/layer-catogories.css:54
  Duplicate: src/css/layer-catogories.css:54
- **.search-container sl-input**
  Original: src/css-backup-20250604/layer-catogories.css:63
  Duplicate: src/css/layer-catogories.css:63
- **.lc-layer-controls-header**
  Original: src/css-backup-20250604/layer-catogories.css:68
  Duplicate: src/css/layer-catogories.css:68
- **.lc-layer-controls-header**
  Original: src/css-backup-20250604/layer-catogories.css:449
  Duplicate: src/css/layer-catogories.css:449
- **.lc-layer-controls-header**
  Original: src/css-backup-20250604/layer-catogories.css:492
  Duplicate: src/css/layer-catogories.css:480
- **.lc-layer-controls-header::after**
  Original: src/css-backup-20250604/layer-catogories.css:71
  Duplicate: src/css-backup-20250604/layer-catogories.css:457
- **.lc-layer-controls-header::after**
  Original: src/css-backup-20250604/layer-catogories.css:71
  Duplicate: src/css-backup-20250604/layer-catogories.css:498
- **.lc-layer-controls-header::after**
  Original: src/css-backup-20250604/layer-catogories.css:71
  Duplicate: src/css/layer-catogories.css:71
- **.lc-layer-controls-description**
  Original: src/css-backup-20250604/layer-catogories.css:81
  Duplicate: src/css/layer-catogories.css:81
- **.lc-layer-controls-master**
  Original: src/css-backup-20250604/layer-catogories.css:89
  Duplicate: src/css/layer-catogories.css:89
- **.lc-layer-controls-master**
  Original: src/css-backup-20250604/layer-catogories.css:398
  Duplicate: src/css/layer-catogories.css:398
- **.lc-layer-controls-master**
  Original: src/css-backup-20250604/layer-catogories.css:422
  Duplicate: src/css/layer-catogories.css:422
- **.lc-layer-controls-master**
  Original: src/css-backup-20250604/layer-catogories.css:476
  Duplicate: src/css/layer-catogories.css:464
- **.lc-layer-controls-master**
  Original: src/css-backup-20250604/layer-catogories.css:520
  Duplicate: src/css/layer-catogories.css:498
- **.lc-master-control**
  Original: src/css-backup-20250604/layer-catogories.css:102
  Duplicate: src/css/layer-catogories.css:102
- **.lc-master-control**
  Original: src/css-backup-20250604/layer-catogories.css:537
  Duplicate: src/css/layer-catogories.css:508
- **.lc-control-label**
  Original: src/css-backup-20250604/layer-catogories.css:111
  Duplicate: src/css/layer-catogories.css:111
- **.lc-control-label**
  Original: src/css-backup-20250604/layer-catogories.css:552
  Duplicate: src/css/layer-catogories.css:523
- **#featureLayersContainer**
  Original: src/css-backup-20250604/layer-catogories.css:119
  Duplicate: src/css/layer-catogories.css:119
- **.lc-category**
  Original: src/css-backup-20250604/layer-catogories.css:127
  Duplicate: src/css/layer-catogories.css:127
- **.lc-category-header**
  Original: src/css-backup-20250604/layer-catogories.css:132
  Duplicate: src/css/layer-catogories.css:132
- **.lc-category-header**
  Original: src/css-backup-20250604/layer-catogories.css:573
  Duplicate: src/css/layer-catogories.css:544
- **.lc-category-header:hover**
  Original: src/css-backup-20250604/layer-catogories.css:145
  Duplicate: src/css/layer-catogories.css:145
- **.lc-category-header-left**
  Original: src/css-backup-20250604/layer-catogories.css:149
  Duplicate: src/css/layer-catogories.css:149
- **.lc-category-name**
  Original: src/css-backup-20250604/layer-catogories.css:157
  Duplicate: src/css/layer-catogories.css:157
- **sl-icon[name="chevron-down"]**
  Original: src/css-backup-20250604/layer-catogories.css:165
  Duplicate: src/css/layer-catogories.css:165
- **.lc-category:not(.expanded) sl-icon[name="chevron-down"]**
  Original: src/css-backup-20250604/layer-catogories.css:173
  Duplicate: src/css/layer-catogories.css:173
- **.lc-category-controls**
  Original: src/css-backup-20250604/layer-catogories.css:178
  Duplicate: src/css/layer-catogories.css:178
- **.lc-category-controls**
  Original: src/css-backup-20250604/layer-catogories.css:422
  Duplicate: src/css/layer-catogories.css:422
- **.lc-category-controls**
  Original: src/css-backup-20250604/layer-catogories.css:520
  Duplicate: src/css/layer-catogories.css:498
- **.lc-feature-controls**
  Original: src/css-backup-20250604/layer-catogories.css:178
  Duplicate: src/css/layer-catogories.css:178
- **.lc-feature-controls**
  Original: src/css-backup-20250604/layer-catogories.css:422
  Duplicate: src/css/layer-catogories.css:422
- **.lc-feature-controls**
  Original: src/css-backup-20250604/layer-catogories.css:520
  Duplicate: src/css/layer-catogories.css:498
- **.lc-checkbox-container**
  Original: src/css-backup-20250604/layer-catogories.css:190
  Duplicate: src/css/layer-catogories.css:190
- **.lc-feature-item**
  Original: src/css-backup-20250604/layer-catogories.css:200
  Duplicate: src/css/layer-catogories.css:200
- **.lc-feature-item**
  Original: src/css-backup-20250604/layer-catogories.css:573
  Duplicate: src/css/layer-catogories.css:544
- **.lc-feature-item:hover**
  Original: src/css-backup-20250604/layer-catogories.css:211
  Duplicate: src/css/layer-catogories.css:211
- **.lc-feature-content**
  Original: src/css-backup-20250604/layer-catogories.css:215
  Duplicate: src/css/layer-catogories.css:215
- **.lc-feature-content::before**
  Original: src/css-backup-20250604/layer-catogories.css:224
  Duplicate: src/css/layer-catogories.css:224
- **.lc-feature-content::before**
  Original: src/css-backup-20250604/layer-catogories.css:416
  Duplicate: src/css/layer-catogories.css:416
- **.lc-feature-icon**
  Original: src/css-backup-20250604/layer-catogories.css:230
  Duplicate: src/css/layer-catogories.css:230
- **.lc-feature-icon.bitmap**
  Original: src/css-backup-20250604/layer-catogories.css:239
  Duplicate: src/css/layer-catogories.css:239
- **.lc-feature-info**
  Original: src/css-backup-20250604/layer-catogories.css:245
  Duplicate: src/css/layer-catogories.css:245
- **.lc-feature-name**
  Original: src/css-backup-20250604/layer-catogories.css:253
  Duplicate: src/css/layer-catogories.css:253
- **.lc-feature-name**
  Original: src/css-backup-20250604/layer-catogories.css:580
  Duplicate: src/css/layer-catogories.css:551
- **.lc-feature-icon.point**
  Original: src/css-backup-20250604/layer-catogories.css:267
  Duplicate: src/css/layer-catogories.css:267
- **.lc-feature-icon.line**
  Original: src/css-backup-20250604/layer-catogories.css:274
  Duplicate: src/css/layer-catogories.css:274
- **.lc-feature-icon.polygon**
  Original: src/css-backup-20250604/layer-catogories.css:281
  Duplicate: src/css/layer-catogories.css:281
- **sl-checkbox::part(base)**
  Original: src/css-backup-20250604/layer-catogories.css:289
  Duplicate: src/css/layer-catogories.css:289
- **sl-checkbox::part(control)**
  Original: src/css-backup-20250604/layer-catogories.css:293
  Duplicate: src/css/layer-catogories.css:293
- **sl-checkbox[checked]::part(control)**
  Original: src/css-backup-20250604/layer-catogories.css:302
  Duplicate: src/css/layer-catogories.css:302
- **sl-checkbox[checked] svg**
  Original: src/css-backup-20250604/layer-catogories.css:308
  Duplicate: src/css/layer-catogories.css:308
- **sl-checkbox[checked]::part(control)::after**
  Original: src/css-backup-20250604/layer-catogories.css:313
  Duplicate: src/css/layer-catogories.css:313
- **sl-icon-button::part(base)**
  Original: src/css-backup-20250604/layer-catogories.css:327
  Duplicate: src/css/layer-catogories.css:327
- **sl-icon-button::part(base):hover**
  Original: src/css-backup-20250604/layer-catogories.css:336
  Duplicate: src/css/layer-catogories.css:336
- **.lc-feature-list**
  Original: src/css-backup-20250604/layer-catogories.css:341
  Duplicate: src/css/layer-catogories.css:341
- **.lc-feature-list.expanded**
  Original: src/css-backup-20250604/layer-catogories.css:348
  Duplicate: src/css/layer-catogories.css:348
- **.lc-checkbox-label**
  Original: src/css-backup-20250604/layer-catogories.css:353
  Duplicate: src/css/layer-catogories.css:353
- **#expandCollapseAll**
  Original: src/css-backup-20250604/layer-catogories.css:444
  Duplicate: src/css-backup-20250604/layer-catogories.css:468
- **#expandCollapseAll**
  Original: src/css-backup-20250604/layer-catogories.css:363
  Duplicate: src/css/layer-catogories.css:363
- **#expandCollapseAll**
  Original: src/css-backup-20250604/layer-catogories.css:431
  Duplicate: src/css/layer-catogories.css:431
- **#expandCollapseAll**
  Original: src/css-backup-20250604/layer-catogories.css:444
  Duplicate: src/css/layer-catogories.css:444
- **#expandCollapseAll**
  Original: src/css-backup-20250604/layer-catogories.css:510
  Duplicate: src/css/layer-catogories.css:488
- **#expandCollapseAll::part(base)**
  Original: src/css-backup-20250604/layer-catogories.css:378
  Duplicate: src/css/layer-catogories.css:378
- **#expandCollapseAll::part(base):hover**
  Original: src/css-backup-20250604/layer-catogories.css:386
  Duplicate: src/css/layer-catogories.css:386
- **#expandCollapseAll::part(base):focus**
  Original: src/css-backup-20250604/layer-catogories.css:391
  Duplicate: src/css/layer-catogories.css:391
- **#expandCollapseAll:hover**
  Original: src/css-backup-20250604/layer-catogories.css:440
  Duplicate: src/css/layer-catogories.css:440
- **.lc-layer-controls-master::after**
  Original: src/css-backup-20250604/layer-catogories.css:484
  Duplicate: src/css-backup-20250604/layer-catogories.css:528
- **.lc-layer-controls-master::after**
  Original: src/css-backup-20250604/layer-catogories.css:484
  Duplicate: src/css/layer-catogories.css:472
- **.lc-category-controls sl-icon-button::part(base)**
  Original: src/css-backup-20250604/layer-catogories.css:542
  Duplicate: src/css/layer-catogories.css:513
- **.lc-feature-controls sl-icon-button::part(base)**
  Original: src/css-backup-20250604/layer-catogories.css:542
  Duplicate: src/css/layer-catogories.css:513
- **sl-checkbox::part(label)**
  Original: src/css-backup-20250604/layer-catogories.css:552
  Duplicate: src/css/layer-catogories.css:523
- **sl-switch::part(label)**
  Original: src/css-backup-20250604/layer-catogories.css:552
  Duplicate: src/css/layer-catogories.css:523
- **sl-radio::part(label)**
  Original: src/css-backup-20250604/layer-catogories.css:552
  Duplicate: src/css/layer-catogories.css:523
- **sl-toggle::part(label)**
  Original: src/css-backup-20250604/layer-catogories.css:552
  Duplicate: src/css/layer-catogories.css:523
- **.no-select**
  Original: src/css-backup-20250604/layer-catogories.css:564
  Duplicate: src/css/layer-catogories.css:535
- **.button-size-small .sidebar-toggle**
  Original: src/css-backup-20250604/button-themes.css:14
  Duplicate: src/css/button-themes.css:9
- **.button-size-small .maplibregl-ctrl button**
  Original: src/css-backup-20250604/button-themes.css:14
  Duplicate: src/css/button-themes.css:9
- **.button-size-medium .sidebar-toggle**
  Original: src/css-backup-20250604/button-themes.css:20
  Duplicate: src/css/button-themes.css:15
- **.button-size-medium .maplibregl-ctrl button**
  Original: src/css-backup-20250604/button-themes.css:20
  Duplicate: src/css/button-themes.css:15
- **.button-size-large .sidebar-toggle**
  Original: src/css-backup-20250604/button-themes.css:26
  Duplicate: src/css/button-themes.css:21
- **.button-size-large .maplibregl-ctrl button**
  Original: src/css-backup-20250604/button-themes.css:26
  Duplicate: src/css/button-themes.css:21
- **.button-size-small .sidebar-toggle svg**
  Original: src/css-backup-20250604/button-themes.css:33
  Duplicate: src/css/button-themes.css:28
- **.button-size-small .maplibregl-ctrl button svg**
  Original: src/css-backup-20250604/button-themes.css:33
  Duplicate: src/css/button-themes.css:28
- **.button-size-small .maplibregl-ctrl-icon:before**
  Original: src/css-backup-20250604/button-themes.css:33
  Duplicate: src/css/button-themes.css:28
- **.button-size-medium .sidebar-toggle svg**
  Original: src/css-backup-20250604/button-themes.css:41
  Duplicate: src/css/button-themes.css:36
- **.button-size-medium .maplibregl-ctrl button svg**
  Original: src/css-backup-20250604/button-themes.css:41
  Duplicate: src/css/button-themes.css:36
- **.button-size-medium .maplibregl-ctrl-icon:before**
  Original: src/css-backup-20250604/button-themes.css:41
  Duplicate: src/css/button-themes.css:36
- **.button-size-large .sidebar-toggle svg**
  Original: src/css-backup-20250604/button-themes.css:49
  Duplicate: src/css/button-themes.css:44
- **.button-size-large .maplibregl-ctrl button svg**
  Original: src/css-backup-20250604/button-themes.css:49
  Duplicate: src/css/button-themes.css:44
- **.button-size-large .maplibregl-ctrl-icon:before**
  Original: src/css-backup-20250604/button-themes.css:49
  Duplicate: src/css/button-themes.css:44
- **.controls button**
  Original: src/css-backup-20250604/button-themes.css:58
  Duplicate: src/css/button-themes.css:53
- **.controls button**
  Original: src/css-backup-20250604/button-themes.css:80
  Duplicate: src/css/button-themes.css:73
- **.selected-basemap**
  Original: src/css-backup-20250604/button-themes.css:58
  Duplicate: src/css/button-themes.css:53
- **.selected-basemap**
  Original: src/css-backup-20250604/button-themes.css:74
  Duplicate: src/css/button-themes.css:68
- **.maplibregl-ctrl-geolocate-active .maplibregl-ctrl-icon:before**
  Original: src/css-backup-20250604/button-themes.css:68
  Duplicate: src/css/button-themes.css:62
- **.controls button:hover**
  Original: src/css-backup-20250604/button-themes.css:85
  Duplicate: src/css/button-themes.css:78
- **#left1-drawer .sidebar-content::-webkit-scrollbar**
  Original: src/css/styles.css:1859
  Duplicate: src/css/styles.css:1883
- **#left2-drawer .sidebar-content::-webkit-scrollbar**
  Original: src/css/styles.css:1859
  Duplicate: src/css/styles.css:1883

### Property Overrides

- **:root**
  --sidebar-width: "400px" (src/css-backup-20250604/sidebar-width-fix.css:2)
         → "80vw" (src/css-backup-20250604/sidebar-width-fix.css:66)
  --right-sidebar-width: "400px" (src/css-backup-20250604/sidebar-width-fix.css:2)
         → "85vw" (src/css-backup-20250604/sidebar-width-fix.css:66)
  --sidebar-width: "400px" (src/css-backup-20250604/sidebar-width-fix.css:2)
         → "var(--sidebar-width-desktop)" (src/css-backup-20250604/responsive-variables.css:2)
  --sidebar-width: "400px" (src/css-backup-20250604/sidebar-width-fix.css:2)
         → "var(--sidebar-width-tablet)" (src/css-backup-20250604/responsive-variables.css:48)
  font-size: "16px" (src/css-backup-20250604/responsive-variables.css:2)
         → "14px" (src/css-backup-20250604/responsive-variables.css:48)
  --sidebar-width: "400px" (src/css-backup-20250604/sidebar-width-fix.css:2)
         → "var(--sidebar-width-mobile)" (src/css-backup-20250604/responsive-variables.css:57)
  font-size: "16px" (src/css-backup-20250604/responsive-variables.css:2)
         → "16px" (src/css-backup-20250604/responsive-variables.css:57)
  font-size: "16px" (src/css-backup-20250604/responsive-variables.css:2)
         → "20px" (src/css-backup-20250604/responsive-variables.css:66)
  --ml-c-bg-1: "255 255 255" (src/css-backup-20250604/modernstyle.css:243)
         → "255 255 255" (src/css-backup-20250604/modernstyle.css:283)
  --ml-c-bg-2: "240 240 240" (src/css-backup-20250604/modernstyle.css:243)
         → "200 200 200" (src/css-backup-20250604/modernstyle.css:283)
  --ml-c-bg-3: "215 215 215" (src/css-backup-20250604/modernstyle.css:243)
         → "180 180 180" (src/css-backup-20250604/modernstyle.css:283)
  --ml-c-icon-1: "51 51 51" (src/css-backup-20250604/modernstyle.css:243)
         → "0 0 0" (src/css-backup-20250604/modernstyle.css:283)
  --ml-c-icon-2: "0 0 0" (src/css-backup-20250604/modernstyle.css:243)
         → "0 0 0" (src/css-backup-20250604/modernstyle.css:283)
  --ml-c-logo-1: "255 255 255" (src/css-backup-20250604/modernstyle.css:243)
         → "255 255 255" (src/css-backup-20250604/modernstyle.css:283)
  --ml-c-logo-2: "215 215 215" (src/css-backup-20250604/modernstyle.css:243)
         → "180 180 180" (src/css-backup-20250604/modernstyle.css:283)
  --ml-c-error: "229 78 51" (src/css-backup-20250604/modernstyle.css:243)
         → "255 0 0" (src/css-backup-20250604/modernstyle.css:283)
  --ml-c-bg-1: "255 255 255" (src/css-backup-20250604/modernstyle.css:243)
         → "0 0 0" (src/css-backup-20250604/modernstyle.css:296)
  --ml-c-bg-2: "240 240 240" (src/css-backup-20250604/modernstyle.css:243)
         → "65 72 83" (src/css-backup-20250604/modernstyle.css:296)
  --ml-c-bg-3: "215 215 215" (src/css-backup-20250604/modernstyle.css:243)
         → "50 54 63" (src/css-backup-20250604/modernstyle.css:296)
  --ml-c-icon-1: "51 51 51" (src/css-backup-20250604/modernstyle.css:243)
         → "255 255 255" (src/css-backup-20250604/modernstyle.css:296)
  --ml-c-icon-2: "0 0 0" (src/css-backup-20250604/modernstyle.css:243)
         → "255 255 255" (src/css-backup-20250604/modernstyle.css:296)
  --ml-c-logo-1: "255 255 255" (src/css-backup-20250604/modernstyle.css:243)
         → "0 0 0" (src/css-backup-20250604/modernstyle.css:296)
  --ml-c-logo-2: "215 215 215" (src/css-backup-20250604/modernstyle.css:243)
         → "50 54 63" (src/css-backup-20250604/modernstyle.css:296)
  --ml-c-error: "229 78 51" (src/css-backup-20250604/modernstyle.css:243)
         → "255 0 0" (src/css-backup-20250604/modernstyle.css:296)
  --sidebar-width: "400px" (src/css-backup-20250604/sidebar-width-fix.css:2)
         → "var(--sidebar-width-tablet)" (src/css-backup-20250604/mobile-overrides.css:8)
  font-size: "16px" (src/css-backup-20250604/responsive-variables.css:2)
         → "18px" (src/css-backup-20250604/mobile-overrides.css:104)
  --right-sidebar-width: "400px" (src/css-backup-20250604/sidebar-width-fix.css:2)
         → "var(--sidebar-width, min(400px, 30vw))" (src/css/styles.css:12)
  --sidebar-width: "400px" (src/css-backup-20250604/sidebar-width-fix.css:2)
         → "300px" (src/css/sidebar-consolidated.css:6)
  --right-sidebar-width: "400px" (src/css-backup-20250604/sidebar-width-fix.css:2)
         → "350px" (src/css/sidebar-consolidated.css:6)
  --sidebar-width: "400px" (src/css-backup-20250604/sidebar-width-fix.css:2)
         → "85vw" (src/css/sidebar-consolidated.css:151)
  --right-sidebar-width: "400px" (src/css-backup-20250604/sidebar-width-fix.css:2)
         → "85vw" (src/css/sidebar-consolidated.css:151)
  --sidebar-width: "400px" (src/css-backup-20250604/sidebar-width-fix.css:2)
         → "100vw" (src/css/sidebar-consolidated.css:212)
  --right-sidebar-width: "400px" (src/css-backup-20250604/sidebar-width-fix.css:2)
         → "100vw" (src/css/sidebar-consolidated.css:212)
  --sl-color-primary-500: "#4682b4" (src/css-backup-20250604/shoelace-custom.css:3)
         → "#4682b4" (src/css/shoelace-custom.css:3)
  --sl-color-primary-600: "#3a6d94" (src/css-backup-20250604/shoelace-custom.css:3)
         → "#3a6d94" (src/css/shoelace-custom.css:3)
  --sl-input-height-medium: "33.5px" (src/css-backup-20250604/shoelace-custom.css:3)
         → "33.5px" (src/css/shoelace-custom.css:3)
  --sl-border-radius-medium: "4px" (src/css-backup-20250604/shoelace-custom.css:3)
         → "4px" (src/css/shoelace-custom.css:3)
  --sl-font-size-medium: "14px" (src/css-backup-20250604/shoelace-custom.css:3)
         → "14px" (src/css/shoelace-custom.css:3)
  --sl-font-family: ""Roboto", sans-serif" (src/css-backup-20250604/shoelace-custom.css:3)
         → ""Roboto", sans-serif" (src/css/shoelace-custom.css:3)
  font-size: "16px" (src/css-backup-20250604/responsive-variables.css:2)
         → "16px" (src/css/responsive-variables.css:2)
  --spacing-xs: "clamp(0.125rem, 0.5vw, 0.25rem)" (src/css-backup-20250604/responsive-variables.css:2)
         → "clamp(0.125rem, 0.5vw, 0.25rem)" (src/css/responsive-variables.css:2)
  --spacing-sm: "clamp(0.25rem, 0.8vw, 0.5rem)" (src/css-backup-20250604/responsive-variables.css:2)
         → "clamp(0.25rem, 0.8vw, 0.5rem)" (src/css/responsive-variables.css:2)
  --spacing-md: "clamp(0.5rem, 1.2vw, 0.75rem)" (src/css-backup-20250604/responsive-variables.css:2)
         → "clamp(0.5rem, 1.2vw, 0.75rem)" (src/css/responsive-variables.css:2)
  --spacing-lg: "clamp(0.75rem, 1.5vw, 1rem)" (src/css-backup-20250604/responsive-variables.css:2)
         → "clamp(0.75rem, 1.5vw, 1rem)" (src/css/responsive-variables.css:2)
  --spacing-xl: "clamp(1rem, 2vw, 1.5rem)" (src/css-backup-20250604/responsive-variables.css:2)
         → "clamp(1rem, 2vw, 1.5rem)" (src/css/responsive-variables.css:2)
  --font-xs: "clamp(0.625rem, 1.2vw, 0.75rem)" (src/css-backup-20250604/responsive-variables.css:2)
         → "clamp(0.625rem, 1.2vw, 0.75rem)" (src/css/responsive-variables.css:2)
  --font-sm: "clamp(0.75rem, 1.5vw, 0.875rem)" (src/css-backup-20250604/responsive-variables.css:2)
         → "clamp(0.75rem, 1.5vw, 0.875rem)" (src/css/responsive-variables.css:2)
  --font-base: "clamp(0.875rem, 2vw, 1rem)" (src/css-backup-20250604/responsive-variables.css:2)
         → "clamp(0.875rem, 2vw, 1rem)" (src/css/responsive-variables.css:2)
  --font-md: "clamp(1rem, 2.5vw, 1.125rem)" (src/css-backup-20250604/responsive-variables.css:2)
         → "clamp(1rem, 2.5vw, 1.125rem)" (src/css/responsive-variables.css:2)
  --font-lg: "clamp(1.125rem, 3vw, 1.25rem)" (src/css-backup-20250604/responsive-variables.css:2)
         → "clamp(1.125rem, 3vw, 1.25rem)" (src/css/responsive-variables.css:2)
  --font-xl: "clamp(1.25rem, 3.5vw, 1.5rem)" (src/css-backup-20250604/responsive-variables.css:2)
         → "clamp(1.25rem, 3.5vw, 1.5rem)" (src/css/responsive-variables.css:2)
  --font-2xl: "clamp(1.5rem, 4vw, 2rem)" (src/css-backup-20250604/responsive-variables.css:2)
         → "clamp(1.5rem, 4vw, 2rem)" (src/css/responsive-variables.css:2)
  --sidebar-width-mobile: "85vw" (src/css-backup-20250604/responsive-variables.css:2)
         → "85vw" (src/css/responsive-variables.css:2)
  --sidebar-width-tablet: "min(350px, 40vw)" (src/css-backup-20250604/responsive-variables.css:2)
         → "min(350px, 40vw)" (src/css/responsive-variables.css:2)
  --sidebar-width-desktop: "min(350px, 25vw)" (src/css-backup-20250604/responsive-variables.css:2)
         → "min(350px, 25vw)" (src/css/responsive-variables.css:2)
  --sidebar-width: "400px" (src/css-backup-20250604/sidebar-width-fix.css:2)
         → "var(--sidebar-width-desktop)" (src/css/responsive-variables.css:2)
  --button-size-sm: "clamp(1.5rem, 4vw, 2rem)" (src/css-backup-20250604/responsive-variables.css:2)
         → "clamp(1.5rem, 4vw, 2rem)" (src/css/responsive-variables.css:2)
  --button-size-md: "clamp(2rem, 5vw, 2.5rem)" (src/css-backup-20250604/responsive-variables.css:2)
         → "clamp(2rem, 5vw, 2.5rem)" (src/css/responsive-variables.css:2)
  --button-size-lg: "clamp(2.5rem, 6vw, 3rem)" (src/css-backup-20250604/responsive-variables.css:2)
         → "clamp(2.5rem, 6vw, 3rem)" (src/css/responsive-variables.css:2)
  --container-sm: "640px" (src/css-backup-20250604/responsive-variables.css:2)
         → "640px" (src/css/responsive-variables.css:2)
  --container-md: "768px" (src/css-backup-20250604/responsive-variables.css:2)
         → "768px" (src/css/responsive-variables.css:2)
  --container-lg: "1024px" (src/css-backup-20250604/responsive-variables.css:2)
         → "1024px" (src/css/responsive-variables.css:2)
  --container-xl: "1280px" (src/css-backup-20250604/responsive-variables.css:2)
         → "1280px" (src/css/responsive-variables.css:2)
  --breakpoint-sm: "640px" (src/css-backup-20250604/responsive-variables.css:2)
         → "640px" (src/css/responsive-variables.css:2)
  --breakpoint-md: "768px" (src/css-backup-20250604/responsive-variables.css:2)
         → "768px" (src/css/responsive-variables.css:2)
  --breakpoint-lg: "1024px" (src/css-backup-20250604/responsive-variables.css:2)
         → "1024px" (src/css/responsive-variables.css:2)
  --breakpoint-xl: "1280px" (src/css-backup-20250604/responsive-variables.css:2)
         → "1280px" (src/css/responsive-variables.css:2)
  --sidebar-width: "400px" (src/css-backup-20250604/sidebar-width-fix.css:2)
         → "var(--sidebar-width-tablet)" (src/css/responsive-variables.css:48)
  font-size: "16px" (src/css-backup-20250604/responsive-variables.css:2)
         → "14px" (src/css/responsive-variables.css:48)
  --sidebar-width: "400px" (src/css-backup-20250604/sidebar-width-fix.css:2)
         → "var(--sidebar-width-mobile)" (src/css/responsive-variables.css:57)
  font-size: "16px" (src/css-backup-20250604/responsive-variables.css:2)
         → "16px" (src/css/responsive-variables.css:57)
  font-size: "16px" (src/css-backup-20250604/responsive-variables.css:2)
         → "20px" (src/css/responsive-variables.css:66)
  --ml-ctrl-border-radius: "1rem" (src/css-backup-20250604/modernstyle.css:243)
         → "1rem" (src/css/modernstyle.css:243)
  --ml-font: "16px/24px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif" (src/css-backup-20250604/modernstyle.css:243)
         → "16px/24px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif" (src/css/modernstyle.css:243)
  --ml-font-attribution: "inherit" (src/css-backup-20250604/modernstyle.css:243)
         → "inherit" (src/css/modernstyle.css:243)
  --ml-c-bg-1: "255 255 255" (src/css-backup-20250604/modernstyle.css:243)
         → "255 255 255" (src/css/modernstyle.css:243)
  --ml-c-bg-2: "240 240 240" (src/css-backup-20250604/modernstyle.css:243)
         → "240 240 240" (src/css/modernstyle.css:243)
  --ml-c-bg-3: "215 215 215" (src/css-backup-20250604/modernstyle.css:243)
         → "215 215 215" (src/css/modernstyle.css:243)
  --ml-c-icon-1: "51 51 51" (src/css-backup-20250604/modernstyle.css:243)
         → "51 51 51" (src/css/modernstyle.css:243)
  --ml-c-icon-2: "0 0 0" (src/css-backup-20250604/modernstyle.css:243)
         → "0 0 0" (src/css/modernstyle.css:243)
  --ml-c-active: "29 161 242" (src/css-backup-20250604/modernstyle.css:243)
         → "29 161 242" (src/css/modernstyle.css:243)
  --ml-c-error: "229 78 51" (src/css-backup-20250604/modernstyle.css:243)
         → "229 78 51" (src/css/modernstyle.css:243)
  --ml-c-outline: "219 167 38" (src/css-backup-20250604/modernstyle.css:243)
         → "219 167 38" (src/css/modernstyle.css:243)
  --ml-o-disabled: "0.25" (src/css-backup-20250604/modernstyle.css:243)
         → "0.25" (src/css/modernstyle.css:243)
  --ml-shadow: "0 1px 3px 0 rgba(0, 0, 0, 0.15),
    0 1px 2px -1px rgba(0, 0, 0, 0.15)" (src/css-backup-20250604/modernstyle.css:243)
         → "0 1px 3px 0 rgba(0, 0, 0, 0.15),
    0 1px 2px -1px rgba(0, 0, 0, 0.15)" (src/css/modernstyle.css:243)
  --ml-shadow-active: "0 10px 15px -3px rgba(0, 0, 0, 0.15),
    0 4px 6px -2px rgba(0, 0, 0, 0.15)" (src/css-backup-20250604/modernstyle.css:243)
         → "0 10px 15px -3px rgba(0, 0, 0, 0.15),
    0 4px 6px -2px rgba(0, 0, 0, 0.15)" (src/css/modernstyle.css:243)
  --ml-c-link-1: "51 51 51" (src/css-backup-20250604/modernstyle.css:243)
         → "51 51 51" (src/css/modernstyle.css:243)
  --ml-c-link-2: "0 0 0" (src/css-backup-20250604/modernstyle.css:243)
         → "0 0 0" (src/css/modernstyle.css:243)
  --ml-c-logo-1: "255 255 255" (src/css-backup-20250604/modernstyle.css:243)
         → "255 255 255" (src/css/modernstyle.css:243)
  --ml-c-logo-2: "215 215 215" (src/css-backup-20250604/modernstyle.css:243)
         → "215 215 215" (src/css/modernstyle.css:243)
  --ml-c-geoloc: "29 161 242" (src/css-backup-20250604/modernstyle.css:243)
         → "29 161 242" (src/css/modernstyle.css:243)
  --ml-ring-shadow: "0 0 0px 2px rgb(var(--ml-c-outline) / 1)" (src/css-backup-20250604/modernstyle.css:243)
         → "0 0 0px 2px rgb(var(--ml-c-outline) / 1)" (src/css/modernstyle.css:243)
  --ml-font-icons: ""maplibregl-icons-default"" (src/css-backup-20250604/modernstyle.css:243)
         → ""maplibregl-icons-default"" (src/css/modernstyle.css:243)
  --ml-c-bg-1: "255 255 255" (src/css-backup-20250604/modernstyle.css:243)
         → "255 255 255" (src/css/modernstyle.css:283)
  --ml-c-bg-2: "240 240 240" (src/css-backup-20250604/modernstyle.css:243)
         → "200 200 200" (src/css/modernstyle.css:283)
  --ml-c-bg-3: "215 215 215" (src/css-backup-20250604/modernstyle.css:243)
         → "180 180 180" (src/css/modernstyle.css:283)
  --ml-c-icon-1: "51 51 51" (src/css-backup-20250604/modernstyle.css:243)
         → "0 0 0" (src/css/modernstyle.css:283)
  --ml-c-icon-2: "0 0 0" (src/css-backup-20250604/modernstyle.css:243)
         → "0 0 0" (src/css/modernstyle.css:283)
  --ml-c-logo-1: "255 255 255" (src/css-backup-20250604/modernstyle.css:243)
         → "255 255 255" (src/css/modernstyle.css:283)
  --ml-c-logo-2: "215 215 215" (src/css-backup-20250604/modernstyle.css:243)
         → "180 180 180" (src/css/modernstyle.css:283)
  --ml-c-error: "229 78 51" (src/css-backup-20250604/modernstyle.css:243)
         → "255 0 0" (src/css/modernstyle.css:283)
  --ml-c-bg-1: "255 255 255" (src/css-backup-20250604/modernstyle.css:243)
         → "0 0 0" (src/css/modernstyle.css:296)
  --ml-c-bg-2: "240 240 240" (src/css-backup-20250604/modernstyle.css:243)
         → "65 72 83" (src/css/modernstyle.css:296)
  --ml-c-bg-3: "215 215 215" (src/css-backup-20250604/modernstyle.css:243)
         → "50 54 63" (src/css/modernstyle.css:296)
  --ml-c-icon-1: "51 51 51" (src/css-backup-20250604/modernstyle.css:243)
         → "255 255 255" (src/css/modernstyle.css:296)
  --ml-c-icon-2: "0 0 0" (src/css-backup-20250604/modernstyle.css:243)
         → "255 255 255" (src/css/modernstyle.css:296)
  --ml-c-logo-1: "255 255 255" (src/css-backup-20250604/modernstyle.css:243)
         → "0 0 0" (src/css/modernstyle.css:296)
  --ml-c-logo-2: "215 215 215" (src/css-backup-20250604/modernstyle.css:243)
         → "50 54 63" (src/css/modernstyle.css:296)
  --ml-c-error: "229 78 51" (src/css-backup-20250604/modernstyle.css:243)
         → "255 0 0" (src/css/modernstyle.css:296)
  --sidebar-width: "400px" (src/css-backup-20250604/sidebar-width-fix.css:2)
         → "var(--sidebar-width-tablet)" (src/css/mobile-overrides.css:8)
  font-size: "16px" (src/css-backup-20250604/responsive-variables.css:2)
         → "18px" (src/css/mobile-overrides.css:104)
  --geolantis-blue: "#4682b4" (src/css-backup-20250604/layer-catogories.css:358)
         → "#4682b4" (src/css/layer-catogories.css:358)
  --primary-color: "rgba(70, 130, 180, 0.7)" (src/css-backup-20250604/button-themes.css:4)
         → "rgba(70, 130, 180, 0.7)" (src/css/button-themes.css:4)

- **.sidebar**
  position: "absolute" (src/css-backup-20250604/sidebar-width-fix.css:7)
         → "absolute" (src/css/styles.css:63)
  top: "30px" (src/css-backup-20250604/sidebar-width-fix.css:7)
         → "30px" (src/css/styles.css:63)
  bottom: "32px" (src/css-backup-20250604/sidebar-width-fix.css:7)
         → "32px" (src/css/styles.css:63)
  width: "80vw" (src/css-backup-20250604/responsive-sidebar.css:4)
         → "400px" (src/css/styles.css:63)
  background: "rgba(255, 255, 255, 0.9)" (src/css-backup-20250604/sidebar-width-fix.css:7)
         → "rgba(255, 255, 255, 0.9)" (src/css/styles.css:63)
  z-index: "10" (src/css-backup-20250604/sidebar-width-fix.css:7)
         → "10" (src/css/styles.css:63)
  transition: "transform 0.3s ease" (src/css-backup-20250604/sidebar-width-fix.css:7)
         → "transform 0.3s ease" (src/css/styles.css:63)
  display: "flex" (src/css-backup-20250604/sidebar-width-fix.css:7)
         → "flex" (src/css/styles.css:63)
  justify-content: "center" (src/css-backup-20250604/sidebar-width-fix.css:7)
         → "center" (src/css/styles.css:63)
  align-items: "center" (src/css-backup-20250604/sidebar-width-fix.css:7)
         → "center" (src/css/styles.css:63)
  box-shadow: "0 0 10px rgba(0, 0, 0, 0.5)" (src/css-backup-20250604/sidebar-width-fix.css:7)
         → "0 0 10px rgba(0, 0, 0, 0.5)" (src/css/styles.css:63)
  height: "calc(100% - 66px)" (src/css-backup-20250604/sidebar-width-fix.css:7)
         → "calc(
    100% - 66px
  )" (src/css/styles.css:63)
  position: "absolute" (src/css-backup-20250604/sidebar-width-fix.css:7)
         → "fixed" (src/css/sidebar-consolidated.css:17)
  top: "30px" (src/css-backup-20250604/sidebar-width-fix.css:7)
         → "0" (src/css/sidebar-consolidated.css:17)
  bottom: "32px" (src/css-backup-20250604/sidebar-width-fix.css:7)
         → "0" (src/css/sidebar-consolidated.css:17)
  width: "80vw" (src/css-backup-20250604/responsive-sidebar.css:4)
         → "var(--sidebar-width)" (src/css/sidebar-consolidated.css:17)
  box-shadow: "0 0 10px rgba(0, 0, 0, 0.5)" (src/css-backup-20250604/sidebar-width-fix.css:7)
         → "2px 0 5px rgba(0, 0, 0, 0.1)" (src/css/sidebar-consolidated.css:17)
  transition: "transform 0.3s ease" (src/css-backup-20250604/sidebar-width-fix.css:7)
         → "var(--sidebar-transition)" (src/css/sidebar-consolidated.css:17)
  z-index: "10" (src/css-backup-20250604/sidebar-width-fix.css:7)
         → "1000" (src/css/sidebar-consolidated.css:17)
  display: "flex" (src/css-backup-20250604/sidebar-width-fix.css:7)
         → "flex" (src/css/sidebar-consolidated.css:17)
  z-index: "10" (src/css-backup-20250604/sidebar-width-fix.css:7)
         → "9999" (src/css/sidebar-consolidated.css:169)

- **.left1**
  width: "var(--sidebar-width)" (src/css-backup-20250604/sidebar-width-fix.css:21)
         → "var(--sidebar-width)" (src/css-backup-20250604/sidebar-width-fix.css:71)
  left: "0" (src/css-backup-20250604/sidebar-width-fix.css:21)
         → "0" (src/css/styles.css:80)
  border-top-right-radius: "15px" (src/css-backup-20250604/sidebar-width-fix.css:21)
         → "15px" (src/css/styles.css:80)
  border-bottom-right-radius: "15px" (src/css-backup-20250604/sidebar-width-fix.css:21)
         → "15px" (src/css/styles.css:80)

- **.left2**
  width: "var(--sidebar-width)" (src/css-backup-20250604/sidebar-width-fix.css:21)
         → "var(--sidebar-width)" (src/css-backup-20250604/sidebar-width-fix.css:71)
  left: "0" (src/css-backup-20250604/sidebar-width-fix.css:21)
         → "0" (src/css/styles.css:80)
  border-top-right-radius: "15px" (src/css-backup-20250604/sidebar-width-fix.css:21)
         → "15px" (src/css/styles.css:80)
  border-bottom-right-radius: "15px" (src/css-backup-20250604/sidebar-width-fix.css:21)
         → "15px" (src/css/styles.css:80)

- **.left3**
  width: "var(--sidebar-width)" (src/css-backup-20250604/sidebar-width-fix.css:21)
         → "var(--sidebar-width)" (src/css-backup-20250604/sidebar-width-fix.css:71)
  left: "0" (src/css-backup-20250604/sidebar-width-fix.css:21)
         → "0" (src/css/styles.css:80)
  border-top-right-radius: "15px" (src/css-backup-20250604/sidebar-width-fix.css:21)
         → "15px" (src/css/styles.css:80)
  border-bottom-right-radius: "15px" (src/css-backup-20250604/sidebar-width-fix.css:21)
         → "15px" (src/css/styles.css:80)

- **.left4**
  width: "var(--sidebar-width)" (src/css-backup-20250604/sidebar-width-fix.css:21)
         → "var(--sidebar-width)" (src/css-backup-20250604/sidebar-width-fix.css:71)
  left: "0" (src/css-backup-20250604/sidebar-width-fix.css:21)
         → "0" (src/css/styles.css:80)
  border-top-right-radius: "15px" (src/css-backup-20250604/sidebar-width-fix.css:21)
         → "15px" (src/css/styles.css:80)
  border-bottom-right-radius: "15px" (src/css-backup-20250604/sidebar-width-fix.css:21)
         → "15px" (src/css/styles.css:80)

- **.right1**
  width: "var(--right-sidebar-width)" (src/css-backup-20250604/sidebar-width-fix.css:31)
         → "var(--right-sidebar-width)" (src/css-backup-20250604/sidebar-width-fix.css:79)
  width: "var(--right-sidebar-width)" (src/css-backup-20250604/sidebar-width-fix.css:31)
         → "85vw" (src/css-backup-20250604/responsive-sidebar.css:10)
  max-width: "400px" (src/css-backup-20250604/sidebar-width-fix.css:79)
         → "400px" (src/css-backup-20250604/responsive-sidebar.css:10)
  right: "0" (src/css-backup-20250604/sidebar-width-fix.css:31)
         → "0" (src/css/styles.css:88)
  width: "var(--right-sidebar-width)" (src/css-backup-20250604/sidebar-width-fix.css:31)
         → "400px" (src/css/styles.css:88)
  border-top-left-radius: "15px" (src/css-backup-20250604/sidebar-width-fix.css:31)
         → "1rem" (src/css/styles.css:88)
  border-bottom-left-radius: "15px" (src/css-backup-20250604/sidebar-width-fix.css:31)
         → "1rem" (src/css/styles.css:88)

- **.right2**
  width: "var(--right-sidebar-width)" (src/css-backup-20250604/sidebar-width-fix.css:31)
         → "var(--right-sidebar-width)" (src/css-backup-20250604/sidebar-width-fix.css:79)
  width: "var(--right-sidebar-width)" (src/css-backup-20250604/sidebar-width-fix.css:31)
         → "85vw" (src/css-backup-20250604/responsive-sidebar.css:10)
  max-width: "400px" (src/css-backup-20250604/sidebar-width-fix.css:79)
         → "400px" (src/css-backup-20250604/responsive-sidebar.css:10)
  right: "0" (src/css-backup-20250604/sidebar-width-fix.css:31)
         → "0" (src/css/styles.css:88)
  width: "var(--right-sidebar-width)" (src/css-backup-20250604/sidebar-width-fix.css:31)
         → "400px" (src/css/styles.css:88)
  border-top-left-radius: "15px" (src/css-backup-20250604/sidebar-width-fix.css:31)
         → "1rem" (src/css/styles.css:88)
  border-bottom-left-radius: "15px" (src/css-backup-20250604/sidebar-width-fix.css:31)
         → "1rem" (src/css/styles.css:88)

- **.left1.collapsed**
  transform: "translateX(calc(-1 * var(--sidebar-width)))" (src/css-backup-20250604/sidebar-width-fix.css:39)
         → "translateX(-100%)" (src/css-backup-20250604/responsive-sidebar.css:44)

- **.left2.collapsed**
  transform: "translateX(calc(-1 * var(--sidebar-width)))" (src/css-backup-20250604/sidebar-width-fix.css:39)
         → "translateX(-100%)" (src/css-backup-20250604/responsive-sidebar.css:44)

- **.left3.collapsed**
  transform: "translateX(calc(-1 * var(--sidebar-width)))" (src/css-backup-20250604/sidebar-width-fix.css:39)
         → "translateX(-100%)" (src/css-backup-20250604/responsive-sidebar.css:44)

- **.left4.collapsed**
  transform: "translateX(calc(-1 * var(--sidebar-width)))" (src/css-backup-20250604/sidebar-width-fix.css:39)
         → "translateX(-100%)" (src/css-backup-20250604/responsive-sidebar.css:44)

- **.right1.collapsed**
  transform: "translateX(var(--right-sidebar-width))" (src/css-backup-20250604/sidebar-width-fix.css:46)
         → "translateX(100%)" (src/css-backup-20250604/responsive-sidebar.css:51)

- **.right2.collapsed**
  transform: "translateX(var(--right-sidebar-width))" (src/css-backup-20250604/sidebar-width-fix.css:46)
         → "translateX(100%)" (src/css-backup-20250604/responsive-sidebar.css:51)

- **sl-drawer::part(panel)**
  height: "calc(100% - 66px)" (src/css/styles.css:1209)
         → "100%" (src/css/styles.css:1261)
  height: "calc(100% - 66px)" (src/css/styles.css:1209)
         → "calc(100% - 66px)" (src/css/styles.css:1350)
  top: "30px" (src/css/styles.css:1209)
         → "30px" (src/css/styles.css:1350)
  bottom: "32px" (src/css/styles.css:1209)
         → "32px" (src/css/styles.css:1350)
  box-shadow: "0 0 10px rgba(0, 0, 0, 0.5)" (src/css/styles.css:1209)
         → "0 0 10px rgba(0, 0, 0, 0.1)" (src/css/sidebar-consolidated.css:76)

- **sl-drawer::part(body)**
  height: "100%" (src/css-backup-20250604/sidebar-headers.css:9)
         → "100%" (src/css/styles.css:1266)
  padding: "0" (src/css-backup-20250604/sidebar-headers.css:9)
         → "0" (src/css/styles.css:1266)
  padding: "0" (src/css-backup-20250604/sidebar-headers.css:9)
         → "0" (src/css/styles.css:1358)
  height: "100%" (src/css-backup-20250604/sidebar-headers.css:9)
         → "100%" (src/css/styles.css:1358)
  padding: "0" (src/css-backup-20250604/sidebar-headers.css:9)
         → "0" (src/css/styles.css:1523)
  height: "100%" (src/css-backup-20250604/sidebar-headers.css:9)
         → "100%" (src/css/styles.css:1523)
  overflow: "hidden" (src/css/styles.css:1358)
         → "hidden" (src/css/styles.css:1523)
  display: "flex" (src/css/styles.css:1266)
         → "flex" (src/css/styles.css:1523)
  flex-direction: "column" (src/css/styles.css:1266)
         → "column" (src/css/styles.css:1523)
  padding: "0" (src/css-backup-20250604/sidebar-headers.css:9)
         → "0" (src/css/sidebar-consolidated.css:68)
  height: "100%" (src/css-backup-20250604/sidebar-headers.css:9)
         → "100%" (src/css/sidebar-consolidated.css:68)
  overflow: "hidden" (src/css/styles.css:1358)
         → "hidden" (src/css/sidebar-consolidated.css:68)
  display: "flex" (src/css/styles.css:1266)
         → "flex" (src/css/sidebar-consolidated.css:68)
  flex-direction: "column" (src/css/styles.css:1266)
         → "column" (src/css/sidebar-consolidated.css:68)

- **sl-drawer .sidebar-content**
  height: "100%" (src/css-backup-20250604/sidebar-headers.css:20)
         → "100%" (src/css/styles.css:1236)
  padding: "0" (src/css-backup-20250604/sidebar-headers.css:20)
         → "15px" (src/css/styles.css:1236)
  display: "flex" (src/css-backup-20250604/sidebar-headers.css:20)
         → "flex" (src/css/styles.css:1236)
  flex-direction: "column" (src/css-backup-20250604/sidebar-headers.css:20)
         → "column" (src/css/styles.css:1236)
  width: "100%" (src/css/styles.css:1236)
         → "100%" (src/css/styles.css:1274)
  height: "100%" (src/css-backup-20250604/sidebar-headers.css:20)
         → "100%" (src/css/styles.css:1274)
  padding: "0" (src/css-backup-20250604/sidebar-headers.css:20)
         → "15px" (src/css/styles.css:1274)
  overflow-y: "auto" (src/css/styles.css:1236)
         → "auto" (src/css/styles.css:1274)
  width: "100%" (src/css/styles.css:1236)
         → "100%" (src/css/styles.css:1365)
  height: "100%" (src/css-backup-20250604/sidebar-headers.css:20)
         → "100%" (src/css/styles.css:1365)
  overflow-y: "auto" (src/css/styles.css:1236)
         → "auto" (src/css/styles.css:1365)
  padding: "0" (src/css-backup-20250604/sidebar-headers.css:20)
         → "5px" (src/css/styles.css:1365)
  box-sizing: "border-box" (src/css/styles.css:1274)
         → "border-box" (src/css/styles.css:1365)
  display: "flex" (src/css-backup-20250604/sidebar-headers.css:20)
         → "flex" (src/css/styles.css:1365)
  flex-direction: "column" (src/css-backup-20250604/sidebar-headers.css:20)
         → "column" (src/css/styles.css:1365)
  width: "100%" (src/css/styles.css:1236)
         → "100%" (src/css/styles.css:1532)
  height: "100%" (src/css-backup-20250604/sidebar-headers.css:20)
         → "100%" (src/css/styles.css:1532)
  padding: "0" (src/css-backup-20250604/sidebar-headers.css:20)
         → "15px" (src/css/styles.css:1532)
  box-sizing: "border-box" (src/css/styles.css:1274)
         → "border-box" (src/css/styles.css:1532)
  display: "flex" (src/css-backup-20250604/sidebar-headers.css:20)
         → "flex" (src/css/styles.css:1532)
  flex-direction: "column" (src/css-backup-20250604/sidebar-headers.css:20)
         → "column" (src/css/styles.css:1532)
  overflow-y: "auto" (src/css/styles.css:1236)
         → "auto" (src/css/styles.css:1532)

- **sl-drawer#left4-drawer .sidebar-content**
  padding: "0" (src/css-backup-20250604/sidebar-headers.css:112)
         → "0" (src/css-backup-20250604/sidebar-headers.css:166)
  margin: "0" (src/css-backup-20250604/sidebar-headers.css:112)
         → "0" (src/css-backup-20250604/sidebar-headers.css:166)
  display: "flex" (src/css-backup-20250604/sidebar-headers.css:112)
         → "flex" (src/css/styles.css:1577)
  flex-direction: "column" (src/css-backup-20250604/sidebar-headers.css:112)
         → "column" (src/css/styles.css:1577)
  height: "100%" (src/css-backup-20250604/sidebar-headers.css:112)
         → "100%" (src/css/styles.css:1577)
  padding: "0" (src/css-backup-20250604/sidebar-headers.css:112)
         → "15px 10px" (src/css/styles.css:1655)
  display: "flex" (src/css-backup-20250604/sidebar-headers.css:112)
         → "flex" (src/css/styles.css:1655)
  flex-direction: "column" (src/css-backup-20250604/sidebar-headers.css:112)
         → "column" (src/css/styles.css:1655)
  height: "100%" (src/css-backup-20250604/sidebar-headers.css:112)
         → "100%" (src/css/styles.css:1655)
  overflow: "hidden" (src/css/styles.css:1577)
         → "hidden" (src/css/styles.css:1655)
  padding: "0" (src/css-backup-20250604/sidebar-headers.css:112)
         → "10px 5px" (src/css/styles.css:1740)

- **sl-drawer#left4-drawer .search-container**
  width: "100%" (src/css/styles.css:1427)
         → "100%" (src/css/styles.css:1591)
  margin-bottom: "10px" (src/css/styles.css:1427)
         → "10px" (src/css/styles.css:1591)
  margin-bottom: "10px" (src/css/styles.css:1427)
         → "10px" (src/css/styles.css:1671)
  flex-shrink: "0" (src/css/styles.css:1591)
         → "0" (src/css/styles.css:1671)
  margin-bottom: "10px" (src/css/styles.css:1427)
         → "8px" (src/css/styles.css:1749)

- **sl-drawer#left4-drawer .lc-layer-controls-header**
  width: "100%" (src/css/styles.css:1497)
         → "100%" (src/css/styles.css:1598)
  margin-bottom: "10px" (src/css/styles.css:1497)
         → "10px" (src/css/styles.css:1598)
  margin-bottom: "10px" (src/css/styles.css:1497)
         → "10px" (src/css/styles.css:1677)
  flex-shrink: "0" (src/css/styles.css:1598)
         → "0" (src/css/styles.css:1677)
  margin-bottom: "10px" (src/css/styles.css:1497)
         → "8px" (src/css/styles.css:1753)

- **sl-drawer#left4-drawer .categories-container**
  flex: "1" (src/css-backup-20250604/sidebar-headers.css:153)
         → "1" (src/css/styles.css:1432)
  overflow-y: "auto" (src/css-backup-20250604/sidebar-headers.css:153)
         → "auto" (src/css/styles.css:1432)
  flex: "1" (src/css-backup-20250604/sidebar-headers.css:153)
         → "1" (src/css/styles.css:1618)
  overflow-y: "auto" (src/css-backup-20250604/sidebar-headers.css:153)
         → "auto" (src/css/styles.css:1618)
  flex: "1" (src/css-backup-20250604/sidebar-headers.css:153)
         → "1" (src/css/styles.css:1693)
  overflow-y: "auto" (src/css-backup-20250604/sidebar-headers.css:153)
         → "auto" (src/css/styles.css:1693)
  min-height: "0" (src/css/styles.css:1618)
         → "0" (src/css/styles.css:1693)
  padding: "0 var(--spacing-lg, 1rem)" (src/css-backup-20250604/sidebar-headers.css:153)
         → "0" (src/css/styles.css:1693)

- **sl-drawer#left4-drawer::part(body)**
  padding: "0" (src/css-backup-20250604/sidebar-headers.css:161)
         → "0" (src/css/styles.css:1650)

- **.sidebar .controls sl-switch::part(base)**
  margin: "10px 0" (src/css-backup-20250604/shoelace-custom.css:14)
         → "10px 0" (src/css/shoelace-custom.css:14)
  width: "100%" (src/css-backup-20250604/shoelace-custom.css:14)
         → "100%" (src/css/shoelace-custom.css:14)
  display: "flex" (src/css-backup-20250604/shoelace-custom.css:14)
         → "flex" (src/css/shoelace-custom.css:14)
  justify-content: "flex-start" (src/css-backup-20250604/shoelace-custom.css:14)
         → "flex-start" (src/css/shoelace-custom.css:14)

- **.sidebar .controls sl-switch::part(label)**
  font-size: "var(--sl-font-size-medium)" (src/css-backup-20250604/shoelace-custom.css:21)
         → "var(--sl-font-size-medium)" (src/css/shoelace-custom.css:21)
  color: "#333" (src/css-backup-20250604/shoelace-custom.css:21)
         → "#333" (src/css/shoelace-custom.css:21)
  text-align: "left" (src/css-backup-20250604/shoelace-custom.css:21)
         → "left" (src/css/shoelace-custom.css:21)
  padding-left: "10px" (src/css-backup-20250604/shoelace-custom.css:21)
         → "10px" (src/css/shoelace-custom.css:21)

- **.sidebar .controls sl-switch::part(control)**
  order: "-1" (src/css-backup-20250604/shoelace-custom.css:28)
         → "-1" (src/css/shoelace-custom.css:28)
  margin-right: "15px" (src/css-backup-20250604/shoelace-custom.css:131)
         → "15px" (src/css/shoelace-custom.css:131)

- **.sidebar .controls sl-button::part(base)**
  width: "calc(100% - 20px)" (src/css-backup-20250604/shoelace-custom.css:33)
         → "calc(100% - 20px)" (src/css/shoelace-custom.css:33)
  margin: "4px 10px" (src/css-backup-20250604/shoelace-custom.css:33)
         → "4px 10px" (src/css/shoelace-custom.css:33)
  justify-content: "flex-start" (src/css-backup-20250604/shoelace-custom.css:33)
         → "flex-start" (src/css/shoelace-custom.css:33)
  text-align: "left" (src/css-backup-20250604/shoelace-custom.css:33)
         → "left" (src/css/shoelace-custom.css:33)
  background-color: "transparent" (src/css-backup-20250604/shoelace-custom.css:33)
         → "transparent" (src/css/shoelace-custom.css:33)
  border: "1px solid #4682b4" (src/css-backup-20250604/shoelace-custom.css:33)
         → "1px solid #4682b4" (src/css/shoelace-custom.css:33)
  color: "#4682b4" (src/css-backup-20250604/shoelace-custom.css:33)
         → "#4682b4" (src/css/shoelace-custom.css:33)
  min-height: "36px" (src/css-backup-20250604/shoelace-custom.css:33)
         → "36px" (src/css/shoelace-custom.css:33)
  padding-left: "15px" (src/css-backup-20250604/shoelace-custom.css:33)
         → "15px" (src/css/shoelace-custom.css:33)
  padding-right: "15px" (src/css-backup-20250604/shoelace-custom.css:33)
         → "15px" (src/css/shoelace-custom.css:33)

- **.sidebar .controls sl-button::part(base):hover**
  background-color: "rgba(70, 130, 180, 0.1)" (src/css-backup-20250604/shoelace-custom.css:46)
         → "rgba(70, 130, 180, 0.1)" (src/css/shoelace-custom.css:46)
  border-color: "#3a6d94" (src/css-backup-20250604/shoelace-custom.css:46)
         → "#3a6d94" (src/css/shoelace-custom.css:46)

- **.sidebar .controls sl-button::part(label)**
  flex-grow: "1" (src/css-backup-20250604/shoelace-custom.css:51)
         → "1" (src/css/shoelace-custom.css:51)
  text-align: "left" (src/css-backup-20250604/shoelace-custom.css:51)
         → "left" (src/css/shoelace-custom.css:51)

- **#search_wrapper**
  position: "relative" (src/css-backup-20250604/shoelace-custom.css:57)
         → "relative" (src/css/styles.css:1299)
  display: "flex" (src/css-backup-20250604/shoelace-custom.css:57)
         → "flex" (src/css/shoelace-custom.css:57)
  align-items: "center" (src/css-backup-20250604/shoelace-custom.css:57)
         → "center" (src/css/shoelace-custom.css:57)
  flex-wrap: "wrap" (src/css-backup-20250604/shoelace-custom.css:57)
         → "wrap" (src/css/shoelace-custom.css:57)
  position: "relative" (src/css-backup-20250604/shoelace-custom.css:57)
         → "relative" (src/css/shoelace-custom.css:57)

- **#map_search_input**
  flex: "1" (src/css-backup-20250604/shoelace-custom.css:64)
         → "1" (src/css/shoelace-custom.css:64)
  min-width: "200px" (src/css-backup-20250604/shoelace-custom.css:64)
         → "200px" (src/css/shoelace-custom.css:64)

- **#map_search_input::part(base)**
  height: "36px" (src/css-backup-20250604/shoelace-custom.css:69)
         → "36px" (src/css/shoelace-custom.css:69)

- **#search_button**
  margin-left: "5px" (src/css-backup-20250604/shoelace-custom.css:73)
         → "5px" (src/css/shoelace-custom.css:73)

- **#search_button_mapExtend**
  margin-left: "5px" (src/css-backup-20250604/shoelace-custom.css:73)
         → "5px" (src/css/shoelace-custom.css:73)

- **#search_button::part(base)**
  height: "36px" (src/css-backup-20250604/shoelace-custom.css:78)
         → "36px" (src/css/shoelace-custom.css:78)
  width: "36px" (src/css-backup-20250604/shoelace-custom.css:78)
         → "36px" (src/css/shoelace-custom.css:78)

- **#search_button_mapExtend::part(base)**
  height: "36px" (src/css-backup-20250604/shoelace-custom.css:78)
         → "36px" (src/css/shoelace-custom.css:78)
  width: "36px" (src/css-backup-20250604/shoelace-custom.css:78)
         → "36px" (src/css/shoelace-custom.css:78)

- **sl-range::part(base)**
  width: "100%" (src/css-backup-20250604/shoelace-custom.css:85)
         → "100%" (src/css/shoelace-custom.css:85)

- **#map_search_results a**
  display: "block" (src/css-backup-20250604/shoelace-custom.css:90)
         → "block" (src/css/shoelace-custom.css:90)
  padding: "10px" (src/css-backup-20250604/shoelace-custom.css:90)
         → "10px" (src/css/shoelace-custom.css:90)
  border-bottom: "1px solid rgba(0, 0, 0, 0.25)" (src/css-backup-20250604/shoelace-custom.css:90)
         → "1px solid rgba(0, 0, 0, 0.25)" (src/css/shoelace-custom.css:90)
  transition: "background-color 0.2s" (src/css-backup-20250604/shoelace-custom.css:90)
         → "background-color 0.2s" (src/css/shoelace-custom.css:90)

- **#map_search_results a:hover**
  background-color: "#efefef" (src/css-backup-20250604/shoelace-custom.css:97)
         → "#efefef" (src/css/shoelace-custom.css:97)
  color: "#404040" (src/css-backup-20250604/shoelace-custom.css:97)
         → "#404040" (src/css/shoelace-custom.css:97)

- **.status-footer sl-button::part(base)**
  padding: "6px" (src/css-backup-20250604/shoelace-custom.css:103)
         → "6px" (src/css/shoelace-custom.css:103)
  font-size: "0.8rem" (src/css-backup-20250604/shoelace-custom.css:103)
         → "0.8rem" (src/css/shoelace-custom.css:103)

- **sl-switch::part(thumb)**
  background-color: "white" (src/css-backup-20250604/shoelace-custom.css:109)
         → "white" (src/css/shoelace-custom.css:109)

- **sl-switch::part(control)**
  background-color: "#ccc" (src/css-backup-20250604/shoelace-custom.css:113)
         → "#ccc" (src/css/shoelace-custom.css:113)

- **sl-switch[checked]::part(control)**
  background-color: "#4682b4" (src/css-backup-20250604/shoelace-custom.css:117)
         → "#4682b4" (src/css/shoelace-custom.css:117)

- **.sidebar .controls sl-switch**
  display: "flex" (src/css-backup-20250604/shoelace-custom.css:122)
         → "flex" (src/css/shoelace-custom.css:122)
  align-items: "center" (src/css-backup-20250604/shoelace-custom.css:122)
         → "center" (src/css/shoelace-custom.css:122)
  text-align: "left" (src/css-backup-20250604/shoelace-custom.css:122)
         → "left" (src/css/shoelace-custom.css:122)
  width: "100%" (src/css-backup-20250604/shoelace-custom.css:122)
         → "100%" (src/css/shoelace-custom.css:122)
  padding-left: "20px" (src/css-backup-20250604/shoelace-custom.css:122)
         → "20px" (src/css/shoelace-custom.css:122)

- **#left4 .controls sl-button::part(base)**
  background-color: "transparent" (src/css-backup-20250604/shoelace-custom.css:136)
         → "transparent" (src/css/shoelace-custom.css:136)
  border: "1px solid #4682b4" (src/css-backup-20250604/shoelace-custom.css:136)
         → "1px solid #4682b4" (src/css/shoelace-custom.css:136)
  color: "#4682b4" (src/css-backup-20250604/shoelace-custom.css:136)
         → "#4682b4" (src/css/shoelace-custom.css:136)
  width: "calc(100% - 20px)" (src/css-backup-20250604/shoelace-custom.css:136)
         → "calc(100% - 20px)" (src/css/shoelace-custom.css:136)
  margin: "6px 10px" (src/css-backup-20250604/shoelace-custom.css:136)
         → "6px 10px" (src/css/shoelace-custom.css:136)

- **#left4 .controls sl-button::part(base):hover**
  background-color: "rgba(70, 130, 180, 0.1)" (src/css-backup-20250604/shoelace-custom.css:144)
         → "rgba(70, 130, 180, 0.1)" (src/css/shoelace-custom.css:144)

- **#left4 .controls sl-button::part(label)**
  text-align: "left" (src/css-backup-20250604/shoelace-custom.css:149)
         → "left" (src/css/shoelace-custom.css:149)
  padding-left: "5px" (src/css-backup-20250604/shoelace-custom.css:149)
         → "5px" (src/css/shoelace-custom.css:149)

- **.sidebar-content sl-switch**
  width: "90%" (src/css-backup-20250604/shoelace-custom.css:167)
         → "90%" (src/css/shoelace-custom.css:167)
  max-width: "90%" (src/css-backup-20250604/shoelace-custom.css:167)
         → "90%" (src/css/shoelace-custom.css:167)
  box-sizing: "border-box" (src/css-backup-20250604/shoelace-custom.css:167)
         → "border-box" (src/css/shoelace-custom.css:167)
  margin: "5px auto" (src/css-backup-20250604/shoelace-custom.css:167)
         → "5px auto" (src/css/shoelace-custom.css:167)

- **.sidebar-content sl-button**
  width: "90%" (src/css-backup-20250604/shoelace-custom.css:167)
         → "90%" (src/css/shoelace-custom.css:167)
  max-width: "90%" (src/css-backup-20250604/shoelace-custom.css:167)
         → "90%" (src/css/shoelace-custom.css:167)
  box-sizing: "border-box" (src/css-backup-20250604/shoelace-custom.css:167)
         → "border-box" (src/css/shoelace-custom.css:167)
  margin: "5px auto" (src/css-backup-20250604/shoelace-custom.css:167)
         → "5px auto" (src/css/shoelace-custom.css:167)

- **.sidebar-content sl-input**
  width: "90%" (src/css-backup-20250604/shoelace-custom.css:167)
         → "90%" (src/css/shoelace-custom.css:167)
  max-width: "90%" (src/css-backup-20250604/shoelace-custom.css:167)
         → "90%" (src/css/shoelace-custom.css:167)
  box-sizing: "border-box" (src/css-backup-20250604/shoelace-custom.css:167)
         → "border-box" (src/css/shoelace-custom.css:167)
  margin: "5px auto" (src/css-backup-20250604/shoelace-custom.css:167)
         → "5px auto" (src/css/shoelace-custom.css:167)

- **.sidebar-content sl-range**
  width: "90%" (src/css-backup-20250604/shoelace-custom.css:167)
         → "90%" (src/css/shoelace-custom.css:167)
  max-width: "90%" (src/css-backup-20250604/shoelace-custom.css:167)
         → "90%" (src/css/shoelace-custom.css:167)
  box-sizing: "border-box" (src/css-backup-20250604/shoelace-custom.css:167)
         → "border-box" (src/css/shoelace-custom.css:167)
  margin: "5px auto" (src/css-backup-20250604/shoelace-custom.css:167)
         → "5px auto" (src/css/shoelace-custom.css:167)

- **.sidebar-content sl-label**
  width: "90%" (src/css-backup-20250604/shoelace-custom.css:167)
         → "90%" (src/css/shoelace-custom.css:167)
  max-width: "90%" (src/css-backup-20250604/shoelace-custom.css:167)
         → "90%" (src/css/shoelace-custom.css:167)
  box-sizing: "border-box" (src/css-backup-20250604/shoelace-custom.css:167)
         → "border-box" (src/css/shoelace-custom.css:167)
  margin: "5px auto" (src/css-backup-20250604/shoelace-custom.css:167)
         → "5px auto" (src/css/shoelace-custom.css:167)

- **.sidebar-content sl-tooltip::part(base)**
  width: "90%" (src/css-backup-20250604/shoelace-custom.css:167)
         → "90%" (src/css/shoelace-custom.css:167)
  max-width: "90%" (src/css-backup-20250604/shoelace-custom.css:167)
         → "90%" (src/css/shoelace-custom.css:167)
  box-sizing: "border-box" (src/css-backup-20250604/shoelace-custom.css:167)
         → "border-box" (src/css/shoelace-custom.css:167)
  margin: "5px auto" (src/css-backup-20250604/shoelace-custom.css:167)
         → "5px auto" (src/css/shoelace-custom.css:167)

- **.sidebar-content sl-divider**
  width: "90%" (src/css-backup-20250604/shoelace-custom.css:167)
         → "90%" (src/css/shoelace-custom.css:167)
  max-width: "90%" (src/css-backup-20250604/shoelace-custom.css:167)
         → "90%" (src/css/shoelace-custom.css:167)
  box-sizing: "border-box" (src/css-backup-20250604/shoelace-custom.css:167)
         → "border-box" (src/css/shoelace-custom.css:167)
  margin: "5px auto" (src/css-backup-20250604/shoelace-custom.css:167)
         → "5px auto" (src/css/shoelace-custom.css:167)

- **.responsive-component**
  --sidebar-width: "100%" (src/css-backup-20250604/responsive-variables.css:74)
         → "100%" (src/css/responsive-variables.css:74)

- **.sidebar-toggle-group**
  transform: "none" (src/css-backup-20250604/responsive-sidebar.css:23)
         → "translateY(-50%)" (src/css-backup-20250604/responsive-sidebar.css:30)
  position: "fixed" (src/css-backup-20250604/responsive-sidebar.css:23)
         → "fixed" (src/css-backup-20250604/mobile-overrides.css:60)
  top: "50%" (src/css-backup-20250604/responsive-sidebar.css:30)
         → "50%" (src/css-backup-20250604/mobile-overrides.css:60)
  transform: "none" (src/css-backup-20250604/responsive-sidebar.css:23)
         → "translateY(-50%)" (src/css-backup-20250604/mobile-overrides.css:60)
  z-index: "15" (src/css-backup-20250604/responsive-sidebar.css:17)
         → "15" (src/css-backup-20250604/mobile-overrides.css:60)
  left: "10px" (src/css-backup-20250604/responsive-sidebar.css:30)
         → "var(--spacing-md, 0.75rem)" (src/css-backup-20250604/mobile-overrides.css:68)
  top: "50%" (src/css-backup-20250604/responsive-sidebar.css:30)
         → "60%" (src/css-backup-20250604/mobile-overrides.css:136)
  position: "fixed" (src/css-backup-20250604/responsive-sidebar.css:23)
         → "absolute" (src/css/styles.css:304)
  left: "10px" (src/css-backup-20250604/responsive-sidebar.css:30)
         → "10px" (src/css/styles.css:304)
  top: "50%" (src/css-backup-20250604/responsive-sidebar.css:30)
         → "50%" (src/css/styles.css:304)
  transform: "none" (src/css-backup-20250604/responsive-sidebar.css:23)
         → "translateY(-50%)" (src/css/styles.css:304)
  z-index: "15" (src/css-backup-20250604/responsive-sidebar.css:17)
         → "12" (src/css/styles.css:304)
  position: "fixed" (src/css-backup-20250604/responsive-sidebar.css:23)
         → "fixed" (src/css/mobile-overrides.css:60)
  top: "50%" (src/css-backup-20250604/responsive-sidebar.css:30)
         → "50%" (src/css/mobile-overrides.css:60)
  transform: "none" (src/css-backup-20250604/responsive-sidebar.css:23)
         → "translateY(-50%)" (src/css/mobile-overrides.css:60)
  z-index: "15" (src/css-backup-20250604/responsive-sidebar.css:17)
         → "15" (src/css/mobile-overrides.css:60)
  left: "10px" (src/css-backup-20250604/responsive-sidebar.css:30)
         → "var(--spacing-md, 0.75rem)" (src/css/mobile-overrides.css:68)
  top: "50%" (src/css-backup-20250604/responsive-sidebar.css:30)
         → "60%" (src/css/mobile-overrides.css:136)

- **.sidebar-toggle-group-right**
  transform: "none" (src/css-backup-20250604/responsive-sidebar.css:23)
         → "translateY(-50%)" (src/css-backup-20250604/responsive-sidebar.css:37)
  position: "fixed" (src/css-backup-20250604/responsive-sidebar.css:23)
         → "fixed" (src/css-backup-20250604/mobile-overrides.css:60)
  top: "50%" (src/css-backup-20250604/responsive-sidebar.css:37)
         → "50%" (src/css-backup-20250604/mobile-overrides.css:60)
  transform: "none" (src/css-backup-20250604/responsive-sidebar.css:23)
         → "translateY(-50%)" (src/css-backup-20250604/mobile-overrides.css:60)
  right: "10px" (src/css-backup-20250604/responsive-sidebar.css:37)
         → "var(--spacing-md, 0.75rem)" (src/css-backup-20250604/mobile-overrides.css:72)
  top: "50%" (src/css-backup-20250604/responsive-sidebar.css:37)
         → "60%" (src/css-backup-20250604/mobile-overrides.css:136)
  position: "fixed" (src/css-backup-20250604/responsive-sidebar.css:23)
         → "absolute" (src/css/styles.css:317)
  right: "10px" (src/css-backup-20250604/responsive-sidebar.css:37)
         → "10px" (src/css/styles.css:317)
  top: "50%" (src/css-backup-20250604/responsive-sidebar.css:37)
         → "50%" (src/css/styles.css:317)
  transform: "none" (src/css-backup-20250604/responsive-sidebar.css:23)
         → "translateY(-50%)" (src/css/styles.css:317)
  z-index: "15" (src/css-backup-20250604/mobile-overrides.css:60)
         → "12" (src/css/styles.css:317)
  position: "fixed" (src/css-backup-20250604/responsive-sidebar.css:23)
         → "fixed" (src/css/mobile-overrides.css:60)
  top: "50%" (src/css-backup-20250604/responsive-sidebar.css:37)
         → "50%" (src/css/mobile-overrides.css:60)
  transform: "none" (src/css-backup-20250604/responsive-sidebar.css:23)
         → "translateY(-50%)" (src/css/mobile-overrides.css:60)
  z-index: "15" (src/css-backup-20250604/mobile-overrides.css:60)
         → "15" (src/css/mobile-overrides.css:60)
  right: "10px" (src/css-backup-20250604/responsive-sidebar.css:37)
         → "var(--spacing-md, 0.75rem)" (src/css/mobile-overrides.css:72)
  top: "50%" (src/css-backup-20250604/responsive-sidebar.css:37)
         → "60%" (src/css/mobile-overrides.css:136)

- **.section**
  margin-bottom: "10px" (src/css-backup-20250604/objectinfo.css:33)
         → "var(--feature-spacing-md)" (src/css-backup-20250604/objectinfo.css:166)

- **.data-row**
  width: "calc(100% - 10px)" (src/css-backup-20250604/objectinfo.css:40)
         → "calc(100% - 10px)" (src/css-backup-20250604/objectinfo.css:235)
  font-size: "var(--feature-font-normal)" (src/css-backup-20250604/objectinfo.css:235)
         → "calc(var(--feature-font-small) * 1.1)" (src/css-backup-20250604/objectinfo.css:396)

- **.dialog-header**
  padding: "var(--feature-spacing-md) var(--feature-spacing-lg)" (src/css-backup-20250604/objectinfo.css:85)
         → "var(--feature-spacing-sm)" (src/css-backup-20250604/objectinfo.css:392)

- **.maplibregl-ctrl-bottom-left**
  bottom: "0" (src/css-backup-20250604/modernstyle.css:17)
         → "40px" (src/css/styles.css:572)
  left: "0" (src/css-backup-20250604/modernstyle.css:17)
         → "5px" (src/css/styles.css:572)
  position: "absolute" (src/css-backup-20250604/modernstyle.css:1)
         → "absolute" (src/css/styles.css:572)
  z-index: "2" (src/css-backup-20250604/modernstyle.css:1)
         → "5" (src/css/styles.css:572)
  pointer-events: "none" (src/css-backup-20250604/modernstyle.css:1)
         → "none" (src/css/modernstyle.css:1)
  position: "absolute" (src/css-backup-20250604/modernstyle.css:1)
         → "absolute" (src/css/modernstyle.css:1)
  z-index: "2" (src/css-backup-20250604/modernstyle.css:1)
         → "2" (src/css/modernstyle.css:1)
  bottom: "0" (src/css-backup-20250604/modernstyle.css:17)
         → "0" (src/css/modernstyle.css:17)
  left: "0" (src/css-backup-20250604/modernstyle.css:17)
         → "0" (src/css/modernstyle.css:17)

- **.maplibregl-ctrl-bottom-right**
  right: "0" (src/css-backup-20250604/modernstyle.css:21)
         → "10px" (src/css/styles.css:502)
  pointer-events: "none" (src/css-backup-20250604/modernstyle.css:1)
         → "none" (src/css/modernstyle.css:1)
  position: "absolute" (src/css-backup-20250604/modernstyle.css:1)
         → "absolute" (src/css/modernstyle.css:1)
  z-index: "2" (src/css-backup-20250604/modernstyle.css:1)
         → "2" (src/css/modernstyle.css:1)
  bottom: "0" (src/css-backup-20250604/modernstyle.css:21)
         → "0" (src/css/modernstyle.css:21)
  right: "0" (src/css-backup-20250604/modernstyle.css:21)
         → "0" (src/css/modernstyle.css:21)

- **.maplibregl-ctrl-top-left**
  top: "0" (src/css-backup-20250604/modernstyle.css:9)
         → "50px" (src/css/styles.css:1032)
  pointer-events: "none" (src/css-backup-20250604/modernstyle.css:1)
         → "none" (src/css/modernstyle.css:1)
  position: "absolute" (src/css-backup-20250604/modernstyle.css:1)
         → "absolute" (src/css/modernstyle.css:1)
  z-index: "2" (src/css-backup-20250604/modernstyle.css:1)
         → "2" (src/css/modernstyle.css:1)
  left: "0" (src/css-backup-20250604/modernstyle.css:9)
         → "0" (src/css/modernstyle.css:9)
  top: "0" (src/css-backup-20250604/modernstyle.css:9)
         → "0" (src/css/modernstyle.css:9)

- **.maplibregl-ctrl-top-right**
  top: "0" (src/css-backup-20250604/modernstyle.css:13)
         → "10px" (src/css/styles.css:389)
  right: "0" (src/css-backup-20250604/modernstyle.css:13)
         → "10px" (src/css/styles.css:389)
  right: "0" (src/css-backup-20250604/modernstyle.css:13)
         → "10px" (src/css/styles.css:498)
  top: "0" (src/css-backup-20250604/modernstyle.css:13)
         → "50px" (src/css/styles.css:1027)
  pointer-events: "none" (src/css-backup-20250604/modernstyle.css:1)
         → "none" (src/css/modernstyle.css:1)
  position: "absolute" (src/css-backup-20250604/modernstyle.css:1)
         → "absolute" (src/css/modernstyle.css:1)
  z-index: "2" (src/css-backup-20250604/modernstyle.css:1)
         → "2" (src/css/modernstyle.css:1)
  right: "0" (src/css-backup-20250604/modernstyle.css:13)
         → "0" (src/css/modernstyle.css:13)
  top: "0" (src/css-backup-20250604/modernstyle.css:13)
         → "0" (src/css/modernstyle.css:13)

- **.maplibregl-ctrl**
  clear: "both" (src/css-backup-20250604/modernstyle.css:25)
         → "both" (src/css/modernstyle.css:25)
  pointer-events: "auto" (src/css-backup-20250604/modernstyle.css:25)
         → "auto" (src/css/modernstyle.css:25)
  transform: "translate(0)" (src/css-backup-20250604/modernstyle.css:25)
         → "translate(0)" (src/css/modernstyle.css:25)

- **.maplibregl-ctrl-attrib.maplibregl-compact-show**
  visibility: "visible" (src/css-backup-20250604/modernstyle.css:31)
         → "visible" (src/css/modernstyle.css:31)
  padding: "0 2.25rem 0 0.5rem" (src/css-backup-20250604/modernstyle.css:491)
         → "0 2.25rem 0 0.5rem" (src/css/modernstyle.css:491)

- **.maplibregl-ctrl-attrib-button**
  display: "none" (src/css-backup-20250604/modernstyle.css:34)
         → "none" (src/css/modernstyle.css:34)
  border: "0" (src/css-backup-20250604/modernstyle.css:356)
         → "0" (src/css/modernstyle.css:356)
  color: "rgb(var(--ml-c-icon-1))" (src/css-backup-20250604/modernstyle.css:356)
         → "rgb(var(--ml-c-icon-1))" (src/css/modernstyle.css:356)
  cursor: "pointer" (src/css-backup-20250604/modernstyle.css:356)
         → "pointer" (src/css/modernstyle.css:356)
  height: "2rem" (src/css-backup-20250604/modernstyle.css:356)
         → "2rem" (src/css/modernstyle.css:356)
  outline: "none" (src/css-backup-20250604/modernstyle.css:356)
         → "none" (src/css/modernstyle.css:356)
  padding: "0" (src/css-backup-20250604/modernstyle.css:356)
         → "0" (src/css/modernstyle.css:356)
  transition-duration: "0.3s" (src/css-backup-20250604/modernstyle.css:356)
         → "0.3s" (src/css/modernstyle.css:356)
  transition-property: "color, background-color, border-color,
    text-decoration-color, fill, stroke, box-shadow" (src/css-backup-20250604/modernstyle.css:356)
         → "color, background-color, border-color,
    text-decoration-color, fill, stroke, box-shadow" (src/css/modernstyle.css:356)
  transition-timing-function: "cubic-bezier(0.4, 0, 0.2, 1)" (src/css-backup-20250604/modernstyle.css:356)
         → "cubic-bezier(0.4, 0, 0.2, 1)" (src/css/modernstyle.css:356)
  width: "2rem" (src/css-backup-20250604/modernstyle.css:356)
         → "2rem" (src/css/modernstyle.css:356)
  border-radius: "var(--ml-ctrl-border-radius)" (src/css-backup-20250604/modernstyle.css:500)
         → "var(--ml-ctrl-border-radius)" (src/css/modernstyle.css:500)
  position: "absolute" (src/css-backup-20250604/modernstyle.css:500)
         → "absolute" (src/css/modernstyle.css:500)
  right: "0" (src/css-backup-20250604/modernstyle.css:500)
         → "0" (src/css/modernstyle.css:500)
  top: "0" (src/css-backup-20250604/modernstyle.css:500)
         → "0" (src/css/modernstyle.css:500)

- **.maplibregl-ctrl-attrib.maplibregl-compact .maplibregl-ctrl-attrib-inner**
  display: "none" (src/css-backup-20250604/modernstyle.css:34)
         → "none" (src/css/modernstyle.css:34)

- **.maplibregl-ctrl-attrib summary.maplibregl-ctrl-attrib-button**
  -webkit-appearance: "none" (src/css-backup-20250604/modernstyle.css:38)
         → "none" (src/css/modernstyle.css:38)
  -moz-appearance: "none" (src/css-backup-20250604/modernstyle.css:38)
         → "none" (src/css/modernstyle.css:38)
  appearance: "none" (src/css-backup-20250604/modernstyle.css:38)
         → "none" (src/css/modernstyle.css:38)
  list-style: "none" (src/css-backup-20250604/modernstyle.css:38)
         → "none" (src/css/modernstyle.css:38)

- **.maplibregl-ctrl-attrib
    summary.maplibregl-ctrl-attrib-button::-webkit-details-marker**
  display: "none" (src/css-backup-20250604/modernstyle.css:44)
         → "none" (src/css/modernstyle.css:44)

- **.maplibregl-ctrl-attrib.maplibregl-compact .maplibregl-ctrl-attrib-button**
  display: "block" (src/css-backup-20250604/modernstyle.css:48)
         → "block" (src/css/modernstyle.css:48)

- **.maplibregl-ctrl-attrib.maplibregl-compact-show
    .maplibregl-ctrl-attrib-inner**
  display: "block" (src/css-backup-20250604/modernstyle.css:48)
         → "block" (src/css/modernstyle.css:48)

- **.maplibregl-pseudo-fullscreen**
  height: "100%" (src/css-backup-20250604/modernstyle.css:54)
         → "100%" (src/css/modernstyle.css:54)
  left: "0" (src/css-backup-20250604/modernstyle.css:54)
         → "0" (src/css/modernstyle.css:54)
  position: "fixed" (src/css-backup-20250604/modernstyle.css:54)
         → "fixed" (src/css/modernstyle.css:54)
  top: "0" (src/css-backup-20250604/modernstyle.css:54)
         → "0" (src/css/modernstyle.css:54)
  width: "100%" (src/css-backup-20250604/modernstyle.css:54)
         → "100%" (src/css/modernstyle.css:54)
  z-index: "99999" (src/css-backup-20250604/modernstyle.css:54)
         → "99999" (src/css/modernstyle.css:54)

- **.maplibregl-ctrl-group button.maplibregl-ctrl-compass**
  touch-action: "none" (src/css-backup-20250604/modernstyle.css:62)
         → "none" (src/css/modernstyle.css:62)
  cursor: "grab" (src/css-backup-20250604/modernstyle.css:65)
         → "grab" (src/css/modernstyle.css:65)
  -webkit-user-select: "none" (src/css-backup-20250604/modernstyle.css:65)
         → "none" (src/css/modernstyle.css:65)
  -moz-user-select: "none" (src/css-backup-20250604/modernstyle.css:65)
         → "none" (src/css/modernstyle.css:65)
  user-select: "none" (src/css-backup-20250604/modernstyle.css:65)
         → "none" (src/css/modernstyle.css:65)

- **.maplibregl-canvas-container.maplibregl-interactive**
  cursor: "grab" (src/css-backup-20250604/modernstyle.css:65)
         → "grab" (src/css/modernstyle.css:65)
  -webkit-user-select: "none" (src/css-backup-20250604/modernstyle.css:65)
         → "none" (src/css/modernstyle.css:65)
  -moz-user-select: "none" (src/css-backup-20250604/modernstyle.css:65)
         → "none" (src/css/modernstyle.css:65)
  user-select: "none" (src/css-backup-20250604/modernstyle.css:65)
         → "none" (src/css/modernstyle.css:65)

- **.maplibregl-canvas-container.maplibregl-interactive:active**
  cursor: "grabbing" (src/css-backup-20250604/modernstyle.css:72)
         → "grabbing" (src/css/modernstyle.css:72)

- **.maplibregl-ctrl-group button.maplibregl-ctrl-compass:active**
  cursor: "grabbing" (src/css-backup-20250604/modernstyle.css:72)
         → "grabbing" (src/css/modernstyle.css:72)

- **.maplibregl-boxzoom**
  height: "0" (src/css-backup-20250604/modernstyle.css:76)
         → "0" (src/css/modernstyle.css:76)
  left: "0" (src/css-backup-20250604/modernstyle.css:76)
         → "0" (src/css/modernstyle.css:76)
  position: "absolute" (src/css-backup-20250604/modernstyle.css:76)
         → "absolute" (src/css/modernstyle.css:76)
  top: "0" (src/css-backup-20250604/modernstyle.css:76)
         → "0" (src/css/modernstyle.css:76)
  width: "0" (src/css-backup-20250604/modernstyle.css:76)
         → "0" (src/css/modernstyle.css:76)
  background: "rgb(var(--ml-c-bg-1))" (src/css-backup-20250604/modernstyle.css:710)
         → "rgb(var(--ml-c-bg-1))" (src/css/modernstyle.css:710)
  border: "2px dotted rgb(var(--ml-c-bg-3))" (src/css-backup-20250604/modernstyle.css:710)
         → "2px dotted rgb(var(--ml-c-bg-3))" (src/css/modernstyle.css:710)
  border-radius: "0.5rem" (src/css-backup-20250604/modernstyle.css:710)
         → "0.5rem" (src/css/modernstyle.css:710)
  opacity: "0.5" (src/css-backup-20250604/modernstyle.css:710)
         → "0.5" (src/css/modernstyle.css:710)

- **.maplibregl-cooperative-gesture-screen**
  align-items: "center" (src/css-backup-20250604/modernstyle.css:83)
         → "center" (src/css/modernstyle.css:83)
  display: "flex" (src/css-backup-20250604/modernstyle.css:83)
         → "flex" (src/css/modernstyle.css:83)
  inset: "0" (src/css-backup-20250604/modernstyle.css:83)
         → "0" (src/css/modernstyle.css:83)
  justify-content: "center" (src/css-backup-20250604/modernstyle.css:83)
         → "center" (src/css/modernstyle.css:83)
  opacity: "0" (src/css-backup-20250604/modernstyle.css:83)
         → "0" (src/css/modernstyle.css:83)
  pointer-events: "none" (src/css-backup-20250604/modernstyle.css:83)
         → "none" (src/css/modernstyle.css:83)
  position: "absolute" (src/css-backup-20250604/modernstyle.css:83)
         → "absolute" (src/css/modernstyle.css:83)
  z-index: "99999" (src/css-backup-20250604/modernstyle.css:83)
         → "99999" (src/css/modernstyle.css:83)
  background: "rgba(0, 0, 0, 0.4)" (src/css-backup-20250604/modernstyle.css:716)
         → "rgba(0, 0, 0, 0.4)" (src/css/modernstyle.css:716)
  color: "#fff" (src/css-backup-20250604/modernstyle.css:716)
         → "#fff" (src/css/modernstyle.css:716)
  font-size: "1.4em" (src/css-backup-20250604/modernstyle.css:716)
         → "1.4em" (src/css/modernstyle.css:716)
  line-height: "1.2" (src/css-backup-20250604/modernstyle.css:716)
         → "1.2" (src/css/modernstyle.css:716)
  padding: "1rem" (src/css-backup-20250604/modernstyle.css:716)
         → "1rem" (src/css/modernstyle.css:716)
  transition: "opacity 1s ease 1s" (src/css-backup-20250604/modernstyle.css:716)
         → "opacity 1s ease 1s" (src/css/modernstyle.css:716)

- **.maplibregl-cooperative-gesture-screen.maplibregl-show**
  opacity: "1" (src/css-backup-20250604/modernstyle.css:93)
         → "1" (src/css/modernstyle.css:93)
  transition: "opacity 0.05s" (src/css-backup-20250604/modernstyle.css:724)
         → "opacity 0.05s" (src/css/modernstyle.css:724)

- **.maplibregl-cooperative-gesture-screen .maplibregl-mobile-message**
  display: "none" (src/css-backup-20250604/modernstyle.css:96)
         → "block" (src/css-backup-20250604/modernstyle.css:103)
  display: "none" (src/css-backup-20250604/modernstyle.css:96)
         → "none" (src/css/modernstyle.css:96)
  display: "none" (src/css-backup-20250604/modernstyle.css:96)
         → "block" (src/css/modernstyle.css:103)

- **.maplibregl-cooperative-gesture-screen .maplibregl-desktop-message**
  display: "none" (src/css-backup-20250604/modernstyle.css:100)
         → "none" (src/css/modernstyle.css:100)

- **.maplibregl-marker**
  transition: "opacity 0.2s" (src/css-backup-20250604/modernstyle.css:107)
         → "opacity 0.2s" (src/css/modernstyle.css:107)
  left: "0" (src/css-backup-20250604/modernstyle.css:110)
         → "0" (src/css/modernstyle.css:110)
  position: "absolute" (src/css-backup-20250604/modernstyle.css:110)
         → "absolute" (src/css/modernstyle.css:110)
  top: "0" (src/css-backup-20250604/modernstyle.css:110)
         → "0" (src/css/modernstyle.css:110)
  will-change: "transform" (src/css-backup-20250604/modernstyle.css:110)
         → "transform" (src/css/modernstyle.css:110)

- **.maplibregl-popup**
  left: "0" (src/css-backup-20250604/modernstyle.css:110)
         → "0" (src/css/modernstyle.css:110)
  position: "absolute" (src/css-backup-20250604/modernstyle.css:110)
         → "absolute" (src/css/modernstyle.css:110)
  top: "0" (src/css-backup-20250604/modernstyle.css:110)
         → "0" (src/css/modernstyle.css:110)
  will-change: "transform" (src/css-backup-20250604/modernstyle.css:110)
         → "transform" (src/css/modernstyle.css:110)
  display: "flex" (src/css-backup-20250604/modernstyle.css:117)
         → "flex" (src/css/modernstyle.css:117)
  pointer-events: "none" (src/css-backup-20250604/modernstyle.css:117)
         → "none" (src/css/modernstyle.css:117)

- **.maplibregl-popup-anchor-top**
  flex-direction: "column" (src/css-backup-20250604/modernstyle.css:121)
         → "column" (src/css/modernstyle.css:121)

- **.maplibregl-popup-anchor-top-left**
  flex-direction: "column" (src/css-backup-20250604/modernstyle.css:121)
         → "column" (src/css/modernstyle.css:121)

- **.maplibregl-popup-anchor-top-right**
  flex-direction: "column" (src/css-backup-20250604/modernstyle.css:121)
         → "column" (src/css/modernstyle.css:121)

- **.maplibregl-popup-anchor-bottom**
  flex-direction: "column-reverse" (src/css-backup-20250604/modernstyle.css:126)
         → "column-reverse" (src/css/modernstyle.css:126)

- **.maplibregl-popup-anchor-bottom-left**
  flex-direction: "column-reverse" (src/css-backup-20250604/modernstyle.css:126)
         → "column-reverse" (src/css/modernstyle.css:126)

- **.maplibregl-popup-anchor-bottom-right**
  flex-direction: "column-reverse" (src/css-backup-20250604/modernstyle.css:126)
         → "column-reverse" (src/css/modernstyle.css:126)

- **.maplibregl-popup-anchor-left**
  flex-direction: "row" (src/css-backup-20250604/modernstyle.css:131)
         → "row" (src/css/modernstyle.css:131)

- **.maplibregl-popup-anchor-right**
  flex-direction: "row-reverse" (src/css-backup-20250604/modernstyle.css:134)
         → "row-reverse" (src/css/modernstyle.css:134)

- **.maplibregl-popup-tip**
  height: "0" (src/css-backup-20250604/modernstyle.css:137)
         → "0" (src/css/modernstyle.css:137)
  width: "0" (src/css-backup-20250604/modernstyle.css:137)
         → "0" (src/css/modernstyle.css:137)
  z-index: "1" (src/css-backup-20250604/modernstyle.css:137)
         → "1" (src/css/modernstyle.css:137)
  border: "10px solid transparent" (src/css-backup-20250604/modernstyle.css:727)
         → "10px solid transparent" (src/css/modernstyle.css:727)

- **.maplibregl-popup-anchor-top .maplibregl-popup-tip**
  align-self: "center" (src/css-backup-20250604/modernstyle.css:142)
         → "center" (src/css/modernstyle.css:142)
  border-top: "none" (src/css-backup-20250604/modernstyle.css:142)
         → "none" (src/css/modernstyle.css:142)
  border-bottom-color: "rgb(var(--ml-c-bg-1))" (src/css-backup-20250604/modernstyle.css:730)
         → "rgb(var(--ml-c-bg-1))" (src/css/modernstyle.css:730)

- **.maplibregl-popup-anchor-top-left .maplibregl-popup-tip**
  align-self: "flex-start" (src/css-backup-20250604/modernstyle.css:146)
         → "flex-start" (src/css/modernstyle.css:146)
  border-left: "none" (src/css-backup-20250604/modernstyle.css:146)
         → "none" (src/css/modernstyle.css:146)
  border-top: "none" (src/css-backup-20250604/modernstyle.css:146)
         → "none" (src/css/modernstyle.css:146)
  border-bottom-color: "rgb(var(--ml-c-bg-1))" (src/css-backup-20250604/modernstyle.css:730)
         → "rgb(var(--ml-c-bg-1))" (src/css/modernstyle.css:730)

- **.maplibregl-popup-anchor-top-right .maplibregl-popup-tip**
  align-self: "flex-end" (src/css-backup-20250604/modernstyle.css:151)
         → "flex-end" (src/css/modernstyle.css:151)
  border-right: "none" (src/css-backup-20250604/modernstyle.css:151)
         → "none" (src/css/modernstyle.css:151)
  border-top: "none" (src/css-backup-20250604/modernstyle.css:151)
         → "none" (src/css/modernstyle.css:151)
  border-bottom-color: "rgb(var(--ml-c-bg-1))" (src/css-backup-20250604/modernstyle.css:730)
         → "rgb(var(--ml-c-bg-1))" (src/css/modernstyle.css:730)

- **.maplibregl-popup-anchor-bottom .maplibregl-popup-tip**
  align-self: "center" (src/css-backup-20250604/modernstyle.css:156)
         → "center" (src/css/modernstyle.css:156)
  border-bottom: "none" (src/css-backup-20250604/modernstyle.css:156)
         → "none" (src/css/modernstyle.css:156)
  border-top-color: "rgb(var(--ml-c-bg-1))" (src/css-backup-20250604/modernstyle.css:735)
         → "rgb(var(--ml-c-bg-1))" (src/css/modernstyle.css:735)

- **.maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip**
  align-self: "flex-start" (src/css-backup-20250604/modernstyle.css:160)
         → "flex-start" (src/css/modernstyle.css:160)
  border-bottom: "none" (src/css-backup-20250604/modernstyle.css:160)
         → "none" (src/css/modernstyle.css:160)
  border-left: "none" (src/css-backup-20250604/modernstyle.css:160)
         → "none" (src/css/modernstyle.css:160)
  border-top-color: "rgb(var(--ml-c-bg-1))" (src/css-backup-20250604/modernstyle.css:735)
         → "rgb(var(--ml-c-bg-1))" (src/css/modernstyle.css:735)

- **.maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip**
  align-self: "flex-end" (src/css-backup-20250604/modernstyle.css:165)
         → "flex-end" (src/css/modernstyle.css:165)
  border-bottom: "none" (src/css-backup-20250604/modernstyle.css:165)
         → "none" (src/css/modernstyle.css:165)
  border-right: "none" (src/css-backup-20250604/modernstyle.css:165)
         → "none" (src/css/modernstyle.css:165)
  border-top-color: "rgb(var(--ml-c-bg-1))" (src/css-backup-20250604/modernstyle.css:735)
         → "rgb(var(--ml-c-bg-1))" (src/css/modernstyle.css:735)

- **.maplibregl-popup-anchor-left .maplibregl-popup-tip**
  align-self: "center" (src/css-backup-20250604/modernstyle.css:170)
         → "center" (src/css/modernstyle.css:170)
  border-left: "none" (src/css-backup-20250604/modernstyle.css:170)
         → "none" (src/css/modernstyle.css:170)
  border-right-color: "rgb(var(--ml-c-bg-1))" (src/css-backup-20250604/modernstyle.css:740)
         → "rgb(var(--ml-c-bg-1))" (src/css/modernstyle.css:740)

- **.maplibregl-popup-anchor-right .maplibregl-popup-tip**
  align-self: "center" (src/css-backup-20250604/modernstyle.css:174)
         → "center" (src/css/modernstyle.css:174)
  border-right: "none" (src/css-backup-20250604/modernstyle.css:174)
         → "none" (src/css/modernstyle.css:174)
  border-left-color: "rgb(var(--ml-c-bg-1))" (src/css-backup-20250604/modernstyle.css:743)
         → "rgb(var(--ml-c-bg-1))" (src/css/modernstyle.css:743)

- **.maplibregl-popup-track-pointer**
  display: "none" (src/css-backup-20250604/modernstyle.css:178)
         → "none" (src/css/modernstyle.css:178)

- **.maplibregl-popup-track-pointer ***
  pointer-events: "none" (src/css-backup-20250604/modernstyle.css:181)
         → "none" (src/css/modernstyle.css:181)
  -webkit-user-select: "none" (src/css-backup-20250604/modernstyle.css:181)
         → "none" (src/css/modernstyle.css:181)
  -moz-user-select: "none" (src/css-backup-20250604/modernstyle.css:181)
         → "none" (src/css/modernstyle.css:181)
  user-select: "none" (src/css-backup-20250604/modernstyle.css:181)
         → "none" (src/css/modernstyle.css:181)

- **.maplibregl-map:hover .maplibregl-popup-track-pointer**
  display: "flex" (src/css-backup-20250604/modernstyle.css:187)
         → "flex" (src/css/modernstyle.css:187)

- **.maplibregl-map:active .maplibregl-popup-track-pointer**
  display: "none" (src/css-backup-20250604/modernstyle.css:190)
         → "none" (src/css/modernstyle.css:190)

- **.maplibregl-popup-content**
  pointer-events: "auto" (src/css-backup-20250604/modernstyle.css:193)
         → "auto" (src/css/modernstyle.css:193)
  position: "relative" (src/css-backup-20250604/modernstyle.css:193)
         → "relative" (src/css/modernstyle.css:193)
  background: "rgb(var(--ml-c-bg-1))" (src/css-backup-20250604/modernstyle.css:781)
         → "rgb(var(--ml-c-bg-1))" (src/css/modernstyle.css:781)
  border-radius: "var(--ml-ctrl-border-radius)" (src/css-backup-20250604/modernstyle.css:781)
         → "var(--ml-ctrl-border-radius)" (src/css/modernstyle.css:781)
  box-shadow: "var(--ml-shadow)" (src/css-backup-20250604/modernstyle.css:781)
         → "var(--ml-shadow)" (src/css/modernstyle.css:781)
  box-sizing: "border-box" (src/css-backup-20250604/modernstyle.css:781)
         → "border-box" (src/css/modernstyle.css:781)
  min-height: "2.5rem" (src/css-backup-20250604/modernstyle.css:781)
         → "2.5rem" (src/css/modernstyle.css:781)
  padding: "0.5rem" (src/css-backup-20250604/modernstyle.css:781)
         → "0.5rem" (src/css/modernstyle.css:781)

- **.maplibregl-canvas-container.maplibregl-interactive.maplibregl-track-pointer**
  cursor: "pointer" (src/css-backup-20250604/modernstyle.css:197)
         → "pointer" (src/css/modernstyle.css:197)

- **.maplibregl-canvas-container.maplibregl-touch-zoom-rotate**
  touch-action: "pan-x pan-y" (src/css-backup-20250604/modernstyle.css:200)
         → "pan-x pan-y" (src/css/modernstyle.css:200)

- **.maplibregl-canvas-container.maplibregl-touch-zoom-rotate .maplibregl-canvas**
  touch-action: "pan-x pan-y" (src/css-backup-20250604/modernstyle.css:200)
         → "pan-x pan-y" (src/css/modernstyle.css:200)

- **.maplibregl-canvas-container.maplibregl-touch-drag-pan**
  touch-action: "pinch-zoom" (src/css-backup-20250604/modernstyle.css:204)
         → "pinch-zoom" (src/css/modernstyle.css:204)

- **.maplibregl-canvas-container.maplibregl-touch-drag-pan .maplibregl-canvas**
  touch-action: "pinch-zoom" (src/css-backup-20250604/modernstyle.css:204)
         → "pinch-zoom" (src/css/modernstyle.css:204)

- **.maplibregl-canvas-container.maplibregl-touch-zoom-rotate.maplibregl-touch-drag-pan**
  touch-action: "none" (src/css-backup-20250604/modernstyle.css:208)
         → "none" (src/css/modernstyle.css:208)

- **.maplibregl-canvas-container.maplibregl-touch-zoom-rotate.maplibregl-touch-drag-pan
  .maplibregl-canvas**
  touch-action: "none" (src/css-backup-20250604/modernstyle.css:208)
         → "none" (src/css/modernstyle.css:208)

- **.maplibregl-canvas-container.maplibregl-touch-drag-pan.maplibregl-cooperative-gestures**
  touch-action: "pan-x pan-y" (src/css-backup-20250604/modernstyle.css:213)
         → "pan-x pan-y" (src/css/modernstyle.css:213)

- **.maplibregl-canvas-container.maplibregl-touch-drag-pan.maplibregl-cooperative-gestures
  .maplibregl-canvas**
  touch-action: "pan-x pan-y" (src/css-backup-20250604/modernstyle.css:213)
         → "pan-x pan-y" (src/css/modernstyle.css:213)

- **.maplibregl-crosshair**
  cursor: "crosshair" (src/css-backup-20250604/modernstyle.css:218)
         → "crosshair" (src/css/modernstyle.css:218)

- **.maplibregl-crosshair .maplibregl-interactive**
  cursor: "crosshair" (src/css-backup-20250604/modernstyle.css:218)
         → "crosshair" (src/css/modernstyle.css:218)

- **.maplibregl-crosshair .maplibregl-interactive:active**
  cursor: "crosshair" (src/css-backup-20250604/modernstyle.css:218)
         → "crosshair" (src/css/modernstyle.css:218)

- **.maplibregl-map**
  overflow: "hidden" (src/css-backup-20250604/modernstyle.css:223)
         → "hidden" (src/css/modernstyle.css:223)
  position: "relative" (src/css-backup-20250604/modernstyle.css:223)
         → "relative" (src/css/modernstyle.css:223)
  -webkit-tap-highlight-color: "rgb(0 0 0/0)" (src/css-backup-20250604/modernstyle.css:223)
         → "rgb(0 0 0/0)" (src/css/modernstyle.css:223)
  font: "var(--ml-font)" (src/css-backup-20250604/modernstyle.css:308)
         → "var(--ml-font)" (src/css/modernstyle.css:308)
  --ml-font-icons: "maplibregl-icons-lucide" (src/css-backup-20250604/modernstyle.css:792)
         → "maplibregl-icons-lucide" (src/css/modernstyle.css:792)

- **.maplibregl-canvas**
  left: "0" (src/css-backup-20250604/modernstyle.css:228)
         → "0" (src/css/modernstyle.css:228)
  position: "absolute" (src/css-backup-20250604/modernstyle.css:228)
         → "absolute" (src/css/modernstyle.css:228)
  top: "0" (src/css-backup-20250604/modernstyle.css:228)
         → "0" (src/css/modernstyle.css:228)

- **.maplibregl-map:fullscreen**
  height: "100%" (src/css-backup-20250604/modernstyle.css:233)
         → "100%" (src/css/modernstyle.css:233)
  width: "100%" (src/css-backup-20250604/modernstyle.css:233)
         → "100%" (src/css/modernstyle.css:233)

- **.dark**
  --ml-c-bg-1: "17 23 37" (src/css-backup-20250604/modernstyle.css:269)
         → "255 255 255" (src/css-backup-20250604/modernstyle.css:283)
  --ml-c-bg-2: "65 72 83" (src/css-backup-20250604/modernstyle.css:269)
         → "200 200 200" (src/css-backup-20250604/modernstyle.css:283)
  --ml-c-bg-3: "50 54 63" (src/css-backup-20250604/modernstyle.css:269)
         → "180 180 180" (src/css-backup-20250604/modernstyle.css:283)
  --ml-c-icon-1: "203 213 225" (src/css-backup-20250604/modernstyle.css:269)
         → "0 0 0" (src/css-backup-20250604/modernstyle.css:283)
  --ml-c-icon-2: "255 255 255" (src/css-backup-20250604/modernstyle.css:269)
         → "0 0 0" (src/css-backup-20250604/modernstyle.css:283)
  --ml-c-logo-1: "17 23 37" (src/css-backup-20250604/modernstyle.css:269)
         → "255 255 255" (src/css-backup-20250604/modernstyle.css:283)
  --ml-c-logo-2: "50 54 63" (src/css-backup-20250604/modernstyle.css:269)
         → "180 180 180" (src/css-backup-20250604/modernstyle.css:283)
  --ml-c-bg-1: "17 23 37" (src/css-backup-20250604/modernstyle.css:269)
         → "0 0 0" (src/css-backup-20250604/modernstyle.css:296)
  --ml-c-bg-2: "65 72 83" (src/css-backup-20250604/modernstyle.css:269)
         → "65 72 83" (src/css-backup-20250604/modernstyle.css:296)
  --ml-c-bg-3: "50 54 63" (src/css-backup-20250604/modernstyle.css:269)
         → "50 54 63" (src/css-backup-20250604/modernstyle.css:296)
  --ml-c-icon-1: "203 213 225" (src/css-backup-20250604/modernstyle.css:269)
         → "255 255 255" (src/css-backup-20250604/modernstyle.css:296)
  --ml-c-icon-2: "255 255 255" (src/css-backup-20250604/modernstyle.css:269)
         → "255 255 255" (src/css-backup-20250604/modernstyle.css:296)
  --ml-c-logo-1: "17 23 37" (src/css-backup-20250604/modernstyle.css:269)
         → "0 0 0" (src/css-backup-20250604/modernstyle.css:296)
  --ml-c-logo-2: "50 54 63" (src/css-backup-20250604/modernstyle.css:269)
         → "50 54 63" (src/css-backup-20250604/modernstyle.css:296)
  --ml-c-error: "255 0 0" (src/css-backup-20250604/modernstyle.css:283)
         → "255 0 0" (src/css-backup-20250604/modernstyle.css:296)
  --ml-c-bg-1: "17 23 37" (src/css-backup-20250604/modernstyle.css:269)
         → "17 23 37" (src/css/modernstyle.css:269)
  --ml-c-bg-2: "65 72 83" (src/css-backup-20250604/modernstyle.css:269)
         → "65 72 83" (src/css/modernstyle.css:269)
  --ml-c-bg-3: "50 54 63" (src/css-backup-20250604/modernstyle.css:269)
         → "50 54 63" (src/css/modernstyle.css:269)
  --ml-c-icon-1: "203 213 225" (src/css-backup-20250604/modernstyle.css:269)
         → "203 213 225" (src/css/modernstyle.css:269)
  --ml-c-icon-2: "255 255 255" (src/css-backup-20250604/modernstyle.css:269)
         → "255 255 255" (src/css/modernstyle.css:269)
  --ml-shadow: "0 1px 3px 0 rgba(0, 0, 0, 0.15),
    0 1px 2px -1px rgba(0, 0, 0, 0.15)" (src/css-backup-20250604/modernstyle.css:269)
         → "0 1px 3px 0 rgba(0, 0, 0, 0.15),
    0 1px 2px -1px rgba(0, 0, 0, 0.15)" (src/css/modernstyle.css:269)
  --ml-c-link-1: "203 213 225" (src/css-backup-20250604/modernstyle.css:269)
         → "203 213 225" (src/css/modernstyle.css:269)
  --ml-c-link-2: "255 255 255" (src/css-backup-20250604/modernstyle.css:269)
         → "255 255 255" (src/css/modernstyle.css:269)
  --ml-c-logo-1: "17 23 37" (src/css-backup-20250604/modernstyle.css:269)
         → "17 23 37" (src/css/modernstyle.css:269)
  --ml-c-logo-2: "50 54 63" (src/css-backup-20250604/modernstyle.css:269)
         → "50 54 63" (src/css/modernstyle.css:269)
  --ml-c-bg-1: "17 23 37" (src/css-backup-20250604/modernstyle.css:269)
         → "255 255 255" (src/css/modernstyle.css:283)
  --ml-c-bg-2: "65 72 83" (src/css-backup-20250604/modernstyle.css:269)
         → "200 200 200" (src/css/modernstyle.css:283)
  --ml-c-bg-3: "50 54 63" (src/css-backup-20250604/modernstyle.css:269)
         → "180 180 180" (src/css/modernstyle.css:283)
  --ml-c-icon-1: "203 213 225" (src/css-backup-20250604/modernstyle.css:269)
         → "0 0 0" (src/css/modernstyle.css:283)
  --ml-c-icon-2: "255 255 255" (src/css-backup-20250604/modernstyle.css:269)
         → "0 0 0" (src/css/modernstyle.css:283)
  --ml-c-logo-1: "17 23 37" (src/css-backup-20250604/modernstyle.css:269)
         → "255 255 255" (src/css/modernstyle.css:283)
  --ml-c-logo-2: "50 54 63" (src/css-backup-20250604/modernstyle.css:269)
         → "180 180 180" (src/css/modernstyle.css:283)
  --ml-c-error: "255 0 0" (src/css-backup-20250604/modernstyle.css:283)
         → "255 0 0" (src/css/modernstyle.css:283)
  --ml-c-bg-1: "17 23 37" (src/css-backup-20250604/modernstyle.css:269)
         → "0 0 0" (src/css/modernstyle.css:296)
  --ml-c-bg-2: "65 72 83" (src/css-backup-20250604/modernstyle.css:269)
         → "65 72 83" (src/css/modernstyle.css:296)
  --ml-c-bg-3: "50 54 63" (src/css-backup-20250604/modernstyle.css:269)
         → "50 54 63" (src/css/modernstyle.css:296)
  --ml-c-icon-1: "203 213 225" (src/css-backup-20250604/modernstyle.css:269)
         → "255 255 255" (src/css/modernstyle.css:296)
  --ml-c-icon-2: "255 255 255" (src/css-backup-20250604/modernstyle.css:269)
         → "255 255 255" (src/css/modernstyle.css:296)
  --ml-c-logo-1: "17 23 37" (src/css-backup-20250604/modernstyle.css:269)
         → "0 0 0" (src/css/modernstyle.css:296)
  --ml-c-logo-2: "50 54 63" (src/css-backup-20250604/modernstyle.css:269)
         → "50 54 63" (src/css/modernstyle.css:296)
  --ml-c-error: "255 0 0" (src/css-backup-20250604/modernstyle.css:283)
         → "255 0 0" (src/css/modernstyle.css:296)

- **.maplibregl-ctrl-top-left .maplibregl-ctrl**
  float: "left" (src/css-backup-20250604/modernstyle.css:311)
         → "left" (src/css/modernstyle.css:311)
  margin: "0.5rem 0 0 0.5rem" (src/css-backup-20250604/modernstyle.css:311)
         → "0.5rem 0 0 0.5rem" (src/css/modernstyle.css:311)

- **.maplibregl-ctrl-top-right .maplibregl-ctrl**
  float: "right" (src/css-backup-20250604/modernstyle.css:315)
         → "right" (src/css/modernstyle.css:315)
  margin: "0.5rem 0.5rem 0 0" (src/css-backup-20250604/modernstyle.css:315)
         → "0.5rem 0.5rem 0 0" (src/css/modernstyle.css:315)

- **.maplibregl-ctrl-bottom-left .maplibregl-ctrl**
  float: "left" (src/css-backup-20250604/modernstyle.css:319)
         → "left" (src/css/modernstyle.css:319)
  margin: "0 0 0.5rem 0.5rem" (src/css-backup-20250604/modernstyle.css:319)
         → "0 0 0.5rem 0.5rem" (src/css/modernstyle.css:319)

- **.maplibregl-ctrl-bottom-right .maplibregl-ctrl**
  float: "right" (src/css-backup-20250604/modernstyle.css:323)
         → "right" (src/css/modernstyle.css:323)
  margin: "0 0.5rem 0.5rem 0" (src/css-backup-20250604/modernstyle.css:323)
         → "0 0.5rem 0.5rem 0" (src/css/modernstyle.css:323)

- **.maplibregl-ctrl-group**
  background: "rgb(var(--ml-c-bg-1))" (src/css-backup-20250604/modernstyle.css:327)
         → "rgb(var(--ml-c-bg-1))" (src/css/modernstyle.css:327)
  border-radius: "var(--ml-ctrl-border-radius)" (src/css-backup-20250604/modernstyle.css:327)
         → "var(--ml-ctrl-border-radius)" (src/css/modernstyle.css:327)

- **.maplibregl-ctrl-group:not(:empty)**
  box-shadow: "var(--ml-shadow)" (src/css-backup-20250604/modernstyle.css:331)
         → "0 0 0 2px ButtonText" (src/css-backup-20250604/modernstyle.css:335)
  box-shadow: "var(--ml-shadow)" (src/css-backup-20250604/modernstyle.css:331)
         → "var(--ml-shadow)" (src/css/modernstyle.css:331)
  box-shadow: "var(--ml-shadow)" (src/css-backup-20250604/modernstyle.css:331)
         → "0 0 0 2px ButtonText" (src/css/modernstyle.css:335)

- **.maplibregl-ctrl-group button + button**
  border-top: "1px solid rgb(var(--ml-c-bg-3))" (src/css-backup-20250604/modernstyle.css:339)
         → "1px solid ButtonText" (src/css-backup-20250604/modernstyle.css:343)
  border-top: "1px solid rgb(var(--ml-c-bg-3))" (src/css-backup-20250604/modernstyle.css:339)
         → "1px solid rgb(var(--ml-c-bg-3))" (src/css/modernstyle.css:339)
  border-top: "1px solid rgb(var(--ml-c-bg-3))" (src/css-backup-20250604/modernstyle.css:339)
         → "1px solid ButtonText" (src/css/modernstyle.css:343)

- **.maplibregl-ctrl-group button:first-child**
  border-radius: "var(--ml-ctrl-border-radius) var(--ml-ctrl-border-radius) 0 0" (src/css-backup-20250604/modernstyle.css:347)
         → "var(--ml-ctrl-border-radius) var(--ml-ctrl-border-radius) 0 0" (src/css/modernstyle.css:347)

- **.maplibregl-ctrl-group button:last-child**
  border-radius: "0 0 var(--ml-ctrl-border-radius) var(--ml-ctrl-border-radius)" (src/css-backup-20250604/modernstyle.css:350)
         → "0 0 var(--ml-ctrl-border-radius) var(--ml-ctrl-border-radius)" (src/css/modernstyle.css:350)

- **.maplibregl-ctrl-group button:only-child**
  border-radius: "inherit" (src/css-backup-20250604/modernstyle.css:353)
         → "inherit" (src/css/modernstyle.css:353)

- **.maplibregl-ctrl button**
  width: "2rem" (src/css-backup-20250604/modernstyle.css:356)
         → "4rem" (src/css/styles.css:462)
  height: "2rem" (src/css-backup-20250604/modernstyle.css:356)
         → "4rem" (src/css/styles.css:462)
  border: "0" (src/css-backup-20250604/modernstyle.css:356)
         → "0" (src/css/modernstyle.css:356)
  color: "rgb(var(--ml-c-icon-1))" (src/css-backup-20250604/modernstyle.css:356)
         → "rgb(var(--ml-c-icon-1))" (src/css/modernstyle.css:356)
  cursor: "pointer" (src/css-backup-20250604/modernstyle.css:356)
         → "pointer" (src/css/modernstyle.css:356)
  height: "2rem" (src/css-backup-20250604/modernstyle.css:356)
         → "2rem" (src/css/modernstyle.css:356)
  outline: "none" (src/css-backup-20250604/modernstyle.css:356)
         → "none" (src/css/modernstyle.css:356)
  padding: "0" (src/css-backup-20250604/modernstyle.css:356)
         → "0" (src/css/modernstyle.css:356)
  transition-duration: "0.3s" (src/css-backup-20250604/modernstyle.css:356)
         → "0.3s" (src/css/modernstyle.css:356)
  transition-property: "color, background-color, border-color,
    text-decoration-color, fill, stroke, box-shadow" (src/css-backup-20250604/modernstyle.css:356)
         → "color, background-color, border-color,
    text-decoration-color, fill, stroke, box-shadow" (src/css/modernstyle.css:356)
  transition-timing-function: "cubic-bezier(0.4, 0, 0.2, 1)" (src/css-backup-20250604/modernstyle.css:356)
         → "cubic-bezier(0.4, 0, 0.2, 1)" (src/css/modernstyle.css:356)
  width: "2rem" (src/css-backup-20250604/modernstyle.css:356)
         → "2rem" (src/css/modernstyle.css:356)

- **.maplibregl-ctrl-group button**
  display: "flex" (src/css-backup-20250604/modernstyle.css:370)
         → "flex" (src/css/styles.css:474)
  justify-content: "center" (src/css-backup-20250604/modernstyle.css:370)
         → "center" (src/css/styles.css:474)
  align-items: "center" (src/css-backup-20250604/modernstyle.css:370)
         → "center" (src/css/styles.css:474)
  background-color: "transparent" (src/css-backup-20250604/modernstyle.css:370)
         → "transparent" (src/css/styles.css:474)
  align-items: "center" (src/css-backup-20250604/modernstyle.css:370)
         → "center" (src/css/modernstyle.css:370)
  background-color: "transparent" (src/css-backup-20250604/modernstyle.css:370)
         → "transparent" (src/css/modernstyle.css:370)
  box-shadow: "var(--ml-ring-shadow-active, 0 0 #0000)" (src/css-backup-20250604/modernstyle.css:370)
         → "var(--ml-ring-shadow-active, 0 0 #0000)" (src/css/modernstyle.css:370)
  display: "flex" (src/css-backup-20250604/modernstyle.css:370)
         → "flex" (src/css/modernstyle.css:370)
  justify-content: "center" (src/css-backup-20250604/modernstyle.css:370)
         → "center" (src/css/modernstyle.css:370)
  position: "relative" (src/css-backup-20250604/modernstyle.css:370)
         → "relative" (src/css/modernstyle.css:370)

- **.maplibregl-ctrl button:not(:disabled):hover**
  background-color: "rgb(var(--ml-c-bg-2))" (src/css-backup-20250604/modernstyle.css:378)
         → "rgb(var(--ml-c-bg-2))" (src/css/modernstyle.css:378)
  color: "rgb(var(--ml-c-icon-2))" (src/css-backup-20250604/modernstyle.css:378)
         → "rgb(var(--ml-c-icon-2))" (src/css/modernstyle.css:378)

- **.maplibregl-ctrl-attrib-button:not(:disabled):hover**
  background-color: "rgb(var(--ml-c-bg-2))" (src/css-backup-20250604/modernstyle.css:378)
         → "rgb(var(--ml-c-bg-2))" (src/css/modernstyle.css:378)
  color: "rgb(var(--ml-c-icon-2))" (src/css-backup-20250604/modernstyle.css:378)
         → "rgb(var(--ml-c-icon-2))" (src/css/modernstyle.css:378)

- **.maplibregl-ctrl button:not(:disabled):is(.active**
  color: "rgb(var(--ml-c-active))" (src/css-backup-20250604/modernstyle.css:383)
         → "var(--primary-color)" (src/css-backup-20250604/button-themes.css:68)
  color: "rgb(var(--ml-c-active))" (src/css-backup-20250604/modernstyle.css:383)
         → "rgb(var(--ml-c-active))" (src/css/modernstyle.css:383)

- **.-active)**
  color: "rgb(var(--ml-c-active))" (src/css-backup-20250604/modernstyle.css:383)
         → "var(--primary-color)" (src/css-backup-20250604/button-themes.css:68)
  color: "rgb(var(--ml-c-active))" (src/css-backup-20250604/modernstyle.css:383)
         → "rgb(var(--ml-c-active))" (src/css/modernstyle.css:383)

- **.maplibregl-ctrl button:not(:disabled):active**
  background-color: "rgb(var(--ml-c-bg-3))" (src/css-backup-20250604/modernstyle.css:386)
         → "rgb(var(--ml-c-bg-3))" (src/css/modernstyle.css:386)
  box-shadow: "var(--ml-ring-shadow-active, 0 0 #0000), var(--ml-shadow-active)" (src/css-backup-20250604/modernstyle.css:386)
         → "var(--ml-ring-shadow-active, 0 0 #0000), var(--ml-shadow-active)" (src/css/modernstyle.css:386)

- **.maplibregl-ctrl-attrib-button:not(:disabled):active**
  background-color: "rgb(var(--ml-c-bg-3))" (src/css-backup-20250604/modernstyle.css:386)
         → "rgb(var(--ml-c-bg-3))" (src/css/modernstyle.css:386)
  box-shadow: "var(--ml-ring-shadow-active, 0 0 #0000), var(--ml-shadow-active)" (src/css-backup-20250604/modernstyle.css:386)
         → "var(--ml-ring-shadow-active, 0 0 #0000), var(--ml-shadow-active)" (src/css/modernstyle.css:386)

- **.maplibregl-ctrl button:focus**
  --ml-ring-shadow-active: "var(--ml-ring-shadow)" (src/css-backup-20250604/modernstyle.css:391)
         → "var(--ml-ring-shadow)" (src/css/modernstyle.css:391)
  z-index: "2" (src/css-backup-20250604/modernstyle.css:395)
         → "2" (src/css/modernstyle.css:395)

- **.maplibregl-ctrl-attrib-button:focus**
  --ml-ring-shadow-active: "var(--ml-ring-shadow)" (src/css-backup-20250604/modernstyle.css:391)
         → "var(--ml-ring-shadow)" (src/css/modernstyle.css:391)

- **.maplibregl-ctrl button:focus:focus-visible**
  --ml-ring-shadow-active: "var(--ml-ring-shadow)" (src/css-backup-20250604/modernstyle.css:398)
         → "var(--ml-ring-shadow)" (src/css/modernstyle.css:398)

- **.maplibregl-ctrl-attrib-button:focus:focus-visible**
  --ml-ring-shadow-active: "var(--ml-ring-shadow)" (src/css-backup-20250604/modernstyle.css:398)
         → "var(--ml-ring-shadow)" (src/css/modernstyle.css:398)

- **.maplibregl-ctrl button:focus:not(:focus-visible)**
  --ml-ring-shadow-active: "0 0 #0000" (src/css-backup-20250604/modernstyle.css:402)
         → "0 0 #0000" (src/css/modernstyle.css:402)

- **.maplibregl-ctrl-attrib-button:focus:not(:focus-visible)**
  --ml-ring-shadow-active: "0 0 #0000" (src/css-backup-20250604/modernstyle.css:402)
         → "0 0 #0000" (src/css/modernstyle.css:402)

- **.maplibregl-ctrl-icon**
  background-color: "transparent" (src/css-backup-20250604/modernstyle.css:407)
         → "transparent" (src/css/modernstyle.css:407)

- **.maplibregl-ctrl button::-moz-focus-inner**
  border: "0" (src/css-backup-20250604/modernstyle.css:411)
         → "0" (src/css/modernstyle.css:411)
  padding: "0" (src/css-backup-20250604/modernstyle.css:411)
         → "0" (src/css/modernstyle.css:411)

- **.maplibregl-ctrl button:disabled**
  cursor: "not-allowed" (src/css-backup-20250604/modernstyle.css:415)
         → "not-allowed" (src/css/modernstyle.css:415)

- **.maplibregl-ctrl button:disabled :is(.maplibregl-ctrl-icon:before**
  opacity: "var(--ml-o-disabled)" (src/css-backup-20250604/modernstyle.css:418)
         → "var(--ml-o-disabled)" (src/css/modernstyle.css:418)

- **svg)**
  opacity: "var(--ml-o-disabled)" (src/css-backup-20250604/modernstyle.css:418)
         → "var(--ml-o-disabled)" (src/css/modernstyle.css:418)

- **.maplibregl-ctrl .maplibregl-ctrl-attrib-button:before**
  -webkit-font-smoothing: "antialiased" (src/css-backup-20250604/modernstyle.css:421)
         → "antialiased" (src/css/modernstyle.css:421)
  -moz-osx-font-smoothing: "grayscale" (src/css-backup-20250604/modernstyle.css:421)
         → "grayscale" (src/css/modernstyle.css:421)
  font-variant: "normal" (src/css-backup-20250604/modernstyle.css:421)
         → "normal" (src/css/modernstyle.css:421)
  text-decoration: "inherit" (src/css-backup-20250604/modernstyle.css:421)
         → "inherit" (src/css/modernstyle.css:421)
  text-transform: "none" (src/css-backup-20250604/modernstyle.css:421)
         → "none" (src/css/modernstyle.css:421)
  font-family: "var(--ml-font-icons)" (src/css-backup-20250604/modernstyle.css:434)
         → "var(--ml-font-icons)" (src/css/modernstyle.css:434)
  display: "inline-block" (src/css-backup-20250604/modernstyle.css:445)
         → "inline-block" (src/css/modernstyle.css:445)
  font-size: "1.25rem" (src/css-backup-20250604/modernstyle.css:445)
         → "1.25rem" (src/css/modernstyle.css:445)
  font-style: "normal" (src/css-backup-20250604/modernstyle.css:445)
         → "normal" (src/css/modernstyle.css:445)
  font-weight: "400" (src/css-backup-20250604/modernstyle.css:445)
         → "400" (src/css/modernstyle.css:445)
  height: "1.563rem" (src/css-backup-20250604/modernstyle.css:445)
         → "1.563rem" (src/css/modernstyle.css:445)
  line-height: "1.25em" (src/css-backup-20250604/modernstyle.css:445)
         → "1.25em" (src/css/modernstyle.css:445)
  text-align: "center" (src/css-backup-20250604/modernstyle.css:445)
         → "center" (src/css/modernstyle.css:445)
  width: "1.563rem" (src/css-backup-20250604/modernstyle.css:445)
         → "1.563rem" (src/css/modernstyle.css:445)

- **.maplibregl-ctrl button .maplibregl-ctrl-icon:before**
  font-size: "1.25rem" (src/css-backup-20250604/modernstyle.css:445)
         → "1.5rem" (src/css/styles.css:470)
  -webkit-font-smoothing: "antialiased" (src/css-backup-20250604/modernstyle.css:421)
         → "antialiased" (src/css/modernstyle.css:421)
  -moz-osx-font-smoothing: "grayscale" (src/css-backup-20250604/modernstyle.css:421)
         → "grayscale" (src/css/modernstyle.css:421)
  font-variant: "normal" (src/css-backup-20250604/modernstyle.css:421)
         → "normal" (src/css/modernstyle.css:421)
  text-decoration: "inherit" (src/css-backup-20250604/modernstyle.css:421)
         → "inherit" (src/css/modernstyle.css:421)
  text-transform: "none" (src/css-backup-20250604/modernstyle.css:421)
         → "none" (src/css/modernstyle.css:421)
  font-family: "var(--ml-font-icons)" (src/css-backup-20250604/modernstyle.css:434)
         → "var(--ml-font-icons)" (src/css/modernstyle.css:434)
  display: "inline-block" (src/css-backup-20250604/modernstyle.css:445)
         → "inline-block" (src/css/modernstyle.css:445)
  font-size: "1.25rem" (src/css-backup-20250604/modernstyle.css:445)
         → "1.25rem" (src/css/modernstyle.css:445)
  font-style: "normal" (src/css-backup-20250604/modernstyle.css:445)
         → "normal" (src/css/modernstyle.css:445)
  font-weight: "400" (src/css-backup-20250604/modernstyle.css:445)
         → "400" (src/css/modernstyle.css:445)
  height: "1.563rem" (src/css-backup-20250604/modernstyle.css:445)
         → "1.563rem" (src/css/modernstyle.css:445)
  line-height: "1.25em" (src/css-backup-20250604/modernstyle.css:445)
         → "1.25em" (src/css/modernstyle.css:445)
  text-align: "center" (src/css-backup-20250604/modernstyle.css:445)
         → "center" (src/css/modernstyle.css:445)
  width: "1.563rem" (src/css-backup-20250604/modernstyle.css:445)
         → "1.563rem" (src/css/modernstyle.css:445)

- **.maplibregl-ctrl button.maplibregl-ctrl-compass .maplibregl-ctrl-icon:after**
  -webkit-font-smoothing: "antialiased" (src/css-backup-20250604/modernstyle.css:421)
         → "antialiased" (src/css/modernstyle.css:421)
  -moz-osx-font-smoothing: "grayscale" (src/css-backup-20250604/modernstyle.css:421)
         → "grayscale" (src/css/modernstyle.css:421)
  font-variant: "normal" (src/css-backup-20250604/modernstyle.css:421)
         → "normal" (src/css/modernstyle.css:421)
  text-decoration: "inherit" (src/css-backup-20250604/modernstyle.css:421)
         → "inherit" (src/css/modernstyle.css:421)
  text-transform: "none" (src/css-backup-20250604/modernstyle.css:421)
         → "none" (src/css/modernstyle.css:421)
  font-family: "var(--ml-font-icons)" (src/css-backup-20250604/modernstyle.css:434)
         → "var(--ml-font-icons)" (src/css/modernstyle.css:434)
  display: "inline-block" (src/css-backup-20250604/modernstyle.css:445)
         → "inline-block" (src/css/modernstyle.css:445)
  font-size: "1.25rem" (src/css-backup-20250604/modernstyle.css:445)
         → "1.25rem" (src/css/modernstyle.css:445)
  font-style: "normal" (src/css-backup-20250604/modernstyle.css:445)
         → "normal" (src/css/modernstyle.css:445)
  font-weight: "400" (src/css-backup-20250604/modernstyle.css:445)
         → "400" (src/css/modernstyle.css:445)
  height: "1.563rem" (src/css-backup-20250604/modernstyle.css:445)
         → "1.563rem" (src/css/modernstyle.css:445)
  line-height: "1.25em" (src/css-backup-20250604/modernstyle.css:445)
         → "1.25em" (src/css/modernstyle.css:445)
  text-align: "center" (src/css-backup-20250604/modernstyle.css:445)
         → "center" (src/css/modernstyle.css:445)
  width: "1.563rem" (src/css-backup-20250604/modernstyle.css:445)
         → "1.563rem" (src/css/modernstyle.css:445)
  color: "rgb(var(--ml-c-bg-3))" (src/css-backup-20250604/modernstyle.css:681)
         → "rgb(var(--ml-c-bg-3))" (src/css/modernstyle.css:681)
  content: ""\e80a"" (src/css-backup-20250604/modernstyle.css:681)
         → ""\e80a"" (src/css/modernstyle.css:681)
  left: "50%" (src/css-backup-20250604/modernstyle.css:681)
         → "50%" (src/css/modernstyle.css:681)
  position: "absolute" (src/css-backup-20250604/modernstyle.css:681)
         → "absolute" (src/css/modernstyle.css:681)
  top: "50%" (src/css-backup-20250604/modernstyle.css:681)
         → "50%" (src/css/modernstyle.css:681)
  transform: "translate(-50%, -50%)" (src/css-backup-20250604/modernstyle.css:681)
         → "translate(-50%, -50%)" (src/css/modernstyle.css:681)

- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate:disabled
  .maplibregl-ctrl-icon:after**
  -webkit-font-smoothing: "antialiased" (src/css-backup-20250604/modernstyle.css:421)
         → "antialiased" (src/css/modernstyle.css:421)
  -moz-osx-font-smoothing: "grayscale" (src/css-backup-20250604/modernstyle.css:421)
         → "grayscale" (src/css/modernstyle.css:421)
  font-variant: "normal" (src/css-backup-20250604/modernstyle.css:421)
         → "normal" (src/css/modernstyle.css:421)
  text-decoration: "inherit" (src/css-backup-20250604/modernstyle.css:421)
         → "inherit" (src/css/modernstyle.css:421)
  text-transform: "none" (src/css-backup-20250604/modernstyle.css:421)
         → "none" (src/css/modernstyle.css:421)
  font-family: "var(--ml-font-icons)" (src/css-backup-20250604/modernstyle.css:434)
         → "var(--ml-font-icons)" (src/css/modernstyle.css:434)
  display: "inline-block" (src/css-backup-20250604/modernstyle.css:445)
         → "inline-block" (src/css/modernstyle.css:445)
  font-size: "1.25rem" (src/css-backup-20250604/modernstyle.css:445)
         → "1.25rem" (src/css/modernstyle.css:445)
  font-style: "normal" (src/css-backup-20250604/modernstyle.css:445)
         → "normal" (src/css/modernstyle.css:445)
  font-weight: "400" (src/css-backup-20250604/modernstyle.css:445)
         → "400" (src/css/modernstyle.css:445)
  height: "1.563rem" (src/css-backup-20250604/modernstyle.css:445)
         → "1.563rem" (src/css/modernstyle.css:445)
  line-height: "1.25em" (src/css-backup-20250604/modernstyle.css:445)
         → "1.25em" (src/css/modernstyle.css:445)
  text-align: "center" (src/css-backup-20250604/modernstyle.css:445)
         → "center" (src/css/modernstyle.css:445)
  width: "1.563rem" (src/css-backup-20250604/modernstyle.css:445)
         → "1.563rem" (src/css/modernstyle.css:445)
  color: "rgb(var(--ml-c-error))" (src/css-backup-20250604/modernstyle.css:590)
         → "rgb(var(--ml-c-error))" (src/css/modernstyle.css:590)
  content: ""\e80e"" (src/css-backup-20250604/modernstyle.css:590)
         → ""\e80e"" (src/css/modernstyle.css:590)
  left: "50%" (src/css-backup-20250604/modernstyle.css:590)
         → "50%" (src/css/modernstyle.css:590)
  position: "absolute" (src/css-backup-20250604/modernstyle.css:590)
         → "absolute" (src/css/modernstyle.css:590)
  top: "50%" (src/css-backup-20250604/modernstyle.css:590)
         → "50%" (src/css/modernstyle.css:590)
  transform: "translate(-50%, calc(-50% - 1px))" (src/css-backup-20250604/modernstyle.css:590)
         → "translate(-50%, calc(-50% - 1px))" (src/css/modernstyle.css:590)

- **a.maplibregl-ctrl-logo:before**
  text-stroke: "1px #999" (src/css-backup-20250604/modernstyle.css:643)
         → "0" (src/css-backup-20250604/modernstyle.css:660)
  -webkit-text-stroke: "1px #999" (src/css-backup-20250604/modernstyle.css:643)
         → "0" (src/css-backup-20250604/modernstyle.css:660)
  -webkit-font-smoothing: "antialiased" (src/css-backup-20250604/modernstyle.css:421)
         → "antialiased" (src/css/modernstyle.css:421)
  -moz-osx-font-smoothing: "grayscale" (src/css-backup-20250604/modernstyle.css:421)
         → "grayscale" (src/css/modernstyle.css:421)
  font-variant: "normal" (src/css-backup-20250604/modernstyle.css:421)
         → "normal" (src/css/modernstyle.css:421)
  text-decoration: "inherit" (src/css-backup-20250604/modernstyle.css:421)
         → "inherit" (src/css/modernstyle.css:421)
  text-transform: "none" (src/css-backup-20250604/modernstyle.css:421)
         → "none" (src/css/modernstyle.css:421)
  font-family: "maplibregl-icons-core" (src/css-backup-20250604/modernstyle.css:442)
         → "maplibregl-icons-core" (src/css/modernstyle.css:442)
  color: "rgb(var(--ml-c-logo-1))" (src/css-backup-20250604/modernstyle.css:643)
         → "rgb(var(--ml-c-logo-1))" (src/css/modernstyle.css:643)
  content: ""\e813MapLibre"" (src/css-backup-20250604/modernstyle.css:643)
         → ""\e813MapLibre"" (src/css/modernstyle.css:643)
  font-size: "1rem" (src/css-backup-20250604/modernstyle.css:643)
         → "1rem" (src/css/modernstyle.css:643)
  font-weight: "900" (src/css-backup-20250604/modernstyle.css:643)
         → "900" (src/css/modernstyle.css:643)
  text-stroke: "1px #999" (src/css-backup-20250604/modernstyle.css:643)
         → "1px #999" (src/css/modernstyle.css:643)
  -webkit-text-stroke: "1px #999" (src/css-backup-20250604/modernstyle.css:643)
         → "1px #999" (src/css/modernstyle.css:643)
  paint-order: "stroke fill" (src/css-backup-20250604/modernstyle.css:643)
         → "stroke fill" (src/css/modernstyle.css:643)
  transition-duration: "0.3s" (src/css-backup-20250604/modernstyle.css:643)
         → "0.3s" (src/css/modernstyle.css:643)
  transition-property: "color" (src/css-backup-20250604/modernstyle.css:643)
         → "color" (src/css/modernstyle.css:643)
  transition-timing-function: "cubic-bezier(0.4, 0, 0.2, 1)" (src/css-backup-20250604/modernstyle.css:643)
         → "cubic-bezier(0.4, 0, 0.2, 1)" (src/css/modernstyle.css:643)
  text-stroke: "1px #999" (src/css-backup-20250604/modernstyle.css:643)
         → "0" (src/css/modernstyle.css:660)
  -webkit-text-stroke: "1px #999" (src/css-backup-20250604/modernstyle.css:643)
         → "0" (src/css/modernstyle.css:660)

- **.maplibregl-ctrl button svg**
  height: "1.563rem" (src/css-backup-20250604/modernstyle.css:460)
         → "1.563rem" (src/css/modernstyle.css:460)
  width: "1.563rem" (src/css-backup-20250604/modernstyle.css:460)
         → "1.563rem" (src/css/modernstyle.css:460)

- **.maplibregl-ctrl.maplibregl-ctrl-attrib**
  background-color: "rgb(var(--ml-c-bg-1) / 65%)" (src/css-backup-20250604/modernstyle.css:464)
         → "rgb(var(--ml-c-bg-1) / 65%)" (src/css/modernstyle.css:464)
  margin: "0" (src/css-backup-20250604/modernstyle.css:464)
         → "0" (src/css/modernstyle.css:464)
  min-height: "2rem" (src/css-backup-20250604/modernstyle.css:464)
         → "2rem" (src/css/modernstyle.css:464)
  padding: "0 0.5rem" (src/css-backup-20250604/modernstyle.css:464)
         → "0 0.5rem" (src/css/modernstyle.css:464)

- **.maplibregl-ctrl-bottom-right > .maplibregl-ctrl-attrib**
  border-top-left-radius: "var(--ml-ctrl-border-radius)" (src/css-backup-20250604/modernstyle.css:470)
         → "var(--ml-ctrl-border-radius)" (src/css/modernstyle.css:470)

- **.maplibregl-ctrl-top-right > .maplibregl-ctrl-attrib**
  border-bottom-left-radius: "var(--ml-ctrl-border-radius)" (src/css-backup-20250604/modernstyle.css:473)
         → "var(--ml-ctrl-border-radius)" (src/css/modernstyle.css:473)

- **.maplibregl-ctrl-top-left > .maplibregl-ctrl-attrib**
  border-bottom-right-radius: "var(--ml-ctrl-border-radius)" (src/css-backup-20250604/modernstyle.css:476)
         → "var(--ml-ctrl-border-radius)" (src/css/modernstyle.css:476)

- **.maplibregl-ctrl-bottom-left > .maplibregl-ctrl-attrib**
  border-top-right-radius: "var(--ml-ctrl-border-radius)" (src/css-backup-20250604/modernstyle.css:479)
         → "var(--ml-ctrl-border-radius)" (src/css/modernstyle.css:479)

- **.maplibregl-ctrl-attrib.maplibregl-compact**
  background-color: "rgb(var(--ml-c-bg-1))" (src/css-backup-20250604/modernstyle.css:483)
         → "rgb(var(--ml-c-bg-1))" (src/css/modernstyle.css:483)
  border-radius: "var(--ml-ctrl-border-radius)" (src/css-backup-20250604/modernstyle.css:483)
         → "var(--ml-ctrl-border-radius)" (src/css/modernstyle.css:483)
  margin: "0.5rem" (src/css-backup-20250604/modernstyle.css:483)
         → "0.5rem" (src/css/modernstyle.css:483)
  min-height: "2rem" (src/css-backup-20250604/modernstyle.css:483)
         → "2rem" (src/css/modernstyle.css:483)
  padding: "0 2rem 0 0" (src/css-backup-20250604/modernstyle.css:483)
         → "0 2rem 0 0" (src/css/modernstyle.css:483)
  position: "relative" (src/css-backup-20250604/modernstyle.css:483)
         → "relative" (src/css/modernstyle.css:483)

- **.maplibregl-ctrl-bottom-left
    > .maplibregl-ctrl-attrib.maplibregl-compact-show**
  border-radius: "var(--ml-ctrl-border-radius)" (src/css-backup-20250604/modernstyle.css:494)
         → "var(--ml-ctrl-border-radius)" (src/css/modernstyle.css:494)
  padding: "0 0.5rem 0 2.5rem" (src/css-backup-20250604/modernstyle.css:494)
         → "0 0.5rem 0 2.5rem" (src/css/modernstyle.css:494)

- **.maplibregl-ctrl-top-left > .maplibregl-ctrl-attrib.maplibregl-compact-show**
  border-radius: "var(--ml-ctrl-border-radius)" (src/css-backup-20250604/modernstyle.css:494)
         → "var(--ml-ctrl-border-radius)" (src/css/modernstyle.css:494)
  padding: "0 0.5rem 0 2.5rem" (src/css-backup-20250604/modernstyle.css:494)
         → "0 0.5rem 0 2.5rem" (src/css/modernstyle.css:494)

- **.maplibregl-ctrl-attrib-button:before**
  content: ""\e808"" (src/css-backup-20250604/modernstyle.css:506)
         → ""\e808"" (src/css/modernstyle.css:506)
  margin: "0.2rem" (src/css-backup-20250604/modernstyle.css:506)
         → "0.2rem" (src/css/modernstyle.css:506)

- **.maplibregl-ctrl-bottom-left .maplibregl-ctrl-attrib-button**
  left: "0" (src/css-backup-20250604/modernstyle.css:510)
         → "0" (src/css/modernstyle.css:510)

- **.maplibregl-ctrl-top-left .maplibregl-ctrl-attrib-button**
  left: "0" (src/css-backup-20250604/modernstyle.css:510)
         → "0" (src/css/modernstyle.css:510)

- **.maplibregl-ctrl-attrib-inner**
  line-height: "2rem" (src/css-backup-20250604/modernstyle.css:515)
         → "2rem" (src/css/modernstyle.css:515)

- **.maplibregl-ctrl-attrib a**
  color: "rgb(var(--ml-c-link-1))" (src/css-backup-20250604/modernstyle.css:518)
         → "rgb(var(--ml-c-link-1))" (src/css/modernstyle.css:518)
  text-decoration: "none" (src/css-backup-20250604/modernstyle.css:518)
         → "none" (src/css/modernstyle.css:518)

- **.maplibregl-ctrl-attrib a:hover**
  color: "rgb(var(--ml-c-link-2))" (src/css-backup-20250604/modernstyle.css:522)
         → "rgb(var(--ml-c-link-2))" (src/css/modernstyle.css:522)
  text-decoration: "underline" (src/css-backup-20250604/modernstyle.css:522)
         → "underline" (src/css/modernstyle.css:522)

- **.maplibregl-attrib-empty**
  display: "none" (src/css-backup-20250604/modernstyle.css:526)
         → "none" (src/css/modernstyle.css:526)

- **.maplibregl-ctrl
  button.maplibregl-ctrl-fullscreen
  .maplibregl-ctrl-icon:before**
  content: ""\e80b"" (src/css-backup-20250604/modernstyle.css:529)
         → ""\e80b"" (src/css/modernstyle.css:529)

- **.maplibregl-ctrl button.maplibregl-ctrl-shrink .maplibregl-ctrl-icon:before**
  content: ""\e80f"" (src/css-backup-20250604/modernstyle.css:534)
         → ""\e80f"" (src/css/modernstyle.css:534)

- **.maplibregl-user-location-dot**
  background-color: "rgb(var(--ml-c-geoloc))" (src/css-backup-20250604/modernstyle.css:537)
         → "rgb(var(--ml-c-geoloc))" (src/css/modernstyle.css:537)
  border-radius: "50%" (src/css-backup-20250604/modernstyle.css:537)
         → "50%" (src/css/modernstyle.css:537)
  height: "15px" (src/css-backup-20250604/modernstyle.css:537)
         → "15px" (src/css/modernstyle.css:537)
  width: "15px" (src/css-backup-20250604/modernstyle.css:537)
         → "15px" (src/css/modernstyle.css:537)

- **.maplibregl-user-location-dot:before**
  background-color: "rgb(var(--ml-c-geoloc))" (src/css-backup-20250604/modernstyle.css:537)
         → "rgb(var(--ml-c-geoloc))" (src/css/modernstyle.css:537)
  border-radius: "50%" (src/css-backup-20250604/modernstyle.css:537)
         → "50%" (src/css/modernstyle.css:537)
  height: "15px" (src/css-backup-20250604/modernstyle.css:537)
         → "15px" (src/css/modernstyle.css:537)
  width: "15px" (src/css-backup-20250604/modernstyle.css:537)
         → "15px" (src/css/modernstyle.css:537)
  animation: "maplibregl-user-location-dot-pulse 2s infinite" (src/css-backup-20250604/modernstyle.css:544)
         → "maplibregl-user-location-dot-pulse 2s infinite" (src/css/modernstyle.css:544)
  content: """" (src/css-backup-20250604/modernstyle.css:544)
         → """" (src/css/modernstyle.css:544)
  position: "absolute" (src/css-backup-20250604/modernstyle.css:544)
         → "absolute" (src/css/modernstyle.css:544)

- **.maplibregl-user-location-dot:after**
  border: "2px solid rgb(var(--ml-c-bg-1))" (src/css-backup-20250604/modernstyle.css:549)
         → "2px solid rgb(var(--ml-c-bg-1))" (src/css/modernstyle.css:549)
  border-radius: "50%" (src/css-backup-20250604/modernstyle.css:549)
         → "50%" (src/css/modernstyle.css:549)
  box-shadow: "0 0 3px rgba(0, 0, 0, 0.35)" (src/css-backup-20250604/modernstyle.css:549)
         → "0 0 3px rgba(0, 0, 0, 0.35)" (src/css/modernstyle.css:549)
  box-sizing: "border-box" (src/css-backup-20250604/modernstyle.css:549)
         → "border-box" (src/css/modernstyle.css:549)
  content: """" (src/css-backup-20250604/modernstyle.css:549)
         → """" (src/css/modernstyle.css:549)
  height: "19px" (src/css-backup-20250604/modernstyle.css:549)
         → "19px" (src/css/modernstyle.css:549)
  left: "-2px" (src/css-backup-20250604/modernstyle.css:549)
         → "-2px" (src/css/modernstyle.css:549)
  position: "absolute" (src/css-backup-20250604/modernstyle.css:549)
         → "absolute" (src/css/modernstyle.css:549)
  top: "-2px" (src/css-backup-20250604/modernstyle.css:549)
         → "-2px" (src/css/modernstyle.css:549)
  width: "19px" (src/css-backup-20250604/modernstyle.css:549)
         → "19px" (src/css/modernstyle.css:549)

- **0%**
  transform: "scale(1)" (src/css-backup-20250604/modernstyle.css:562)
         → "rotate(0deg)" (src/css-backup-20250604/modernstyle.css:630)
  transform: "scale(1)" (src/css-backup-20250604/modernstyle.css:562)
         → "scale(1)" (src/css/styles.css:926)
  opacity: "1" (src/css-backup-20250604/modernstyle.css:562)
         → "1" (src/css/styles.css:926)
  opacity: "1" (src/css-backup-20250604/modernstyle.css:562)
         → "1" (src/css/modernstyle.css:562)
  transform: "scale(1)" (src/css-backup-20250604/modernstyle.css:562)
         → "scale(1)" (src/css/modernstyle.css:562)
  transform: "scale(1)" (src/css-backup-20250604/modernstyle.css:562)
         → "rotate(0deg)" (src/css/modernstyle.css:630)

- **70%**
  opacity: "0" (src/css-backup-20250604/modernstyle.css:566)
         → "0" (src/css/modernstyle.css:566)
  transform: "scale(3)" (src/css-backup-20250604/modernstyle.css:566)
         → "scale(3)" (src/css/modernstyle.css:566)

- **to**
  transform: "scale(1)" (src/css-backup-20250604/modernstyle.css:570)
         → "rotate(1turn)" (src/css-backup-20250604/modernstyle.css:633)
  opacity: "0" (src/css-backup-20250604/modernstyle.css:570)
         → "0" (src/css/modernstyle.css:570)
  transform: "scale(1)" (src/css-backup-20250604/modernstyle.css:570)
         → "scale(1)" (src/css/modernstyle.css:570)
  transform: "scale(1)" (src/css-backup-20250604/modernstyle.css:570)
         → "rotate(1turn)" (src/css/modernstyle.css:633)

- **.maplibregl-user-location-dot-stale**
  background-color: "rgb(var(--ml-c-error))" (src/css-backup-20250604/modernstyle.css:575)
         → "rgb(var(--ml-c-error))" (src/css/modernstyle.css:575)

- **.maplibregl-user-location-dot-stale:after**
  display: "none" (src/css-backup-20250604/modernstyle.css:578)
         → "none" (src/css/modernstyle.css:578)

- **.maplibregl-user-location-accuracy-circle**
  background-color: "rgb(var(--ml-c-geoloc) / 20%)" (src/css-backup-20250604/modernstyle.css:581)
         → "rgb(var(--ml-c-geoloc) / 20%)" (src/css/modernstyle.css:581)
  border-radius: "100%" (src/css-backup-20250604/modernstyle.css:581)
         → "100%" (src/css/modernstyle.css:581)
  height: "1px" (src/css-backup-20250604/modernstyle.css:581)
         → "1px" (src/css/modernstyle.css:581)
  width: "1px" (src/css-backup-20250604/modernstyle.css:581)
         → "1px" (src/css/modernstyle.css:581)

- **.maplibregl-ctrl button.maplibregl-ctrl-geolocate .maplibregl-ctrl-icon:before**
  content: ""\e80c"" (src/css-backup-20250604/modernstyle.css:587)
         → ""\e80c"" (src/css/modernstyle.css:587)

- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-active
  .maplibregl-ctrl-icon:before**
  color: "rgb(var(--ml-c-active))" (src/css-backup-20250604/modernstyle.css:600)
         → "rgb(var(--ml-c-active))" (src/css/modernstyle.css:600)
  content: ""\e80c"" (src/css-backup-20250604/modernstyle.css:600)
         → ""\e80c"" (src/css/modernstyle.css:600)

- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-active-error
  .maplibregl-ctrl-icon:before**
  color: "rgb(var(--ml-c-error))" (src/css-backup-20250604/modernstyle.css:606)
         → "rgb(var(--ml-c-error))" (src/css/modernstyle.css:606)
  content: ""\e80c"" (src/css-backup-20250604/modernstyle.css:606)
         → ""\e80c"" (src/css/modernstyle.css:606)

- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-background
  .maplibregl-ctrl-icon:before**
  color: "rgb(var(--ml-c-active))" (src/css-backup-20250604/modernstyle.css:612)
         → "rgb(var(--ml-c-active))" (src/css/modernstyle.css:612)
  content: ""\e80d"" (src/css-backup-20250604/modernstyle.css:612)
         → ""\e80d"" (src/css/modernstyle.css:612)

- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-background-error
  .maplibregl-ctrl-icon:before**
  color: "rgb(var(--ml-c-error))" (src/css-backup-20250604/modernstyle.css:618)
         → "rgb(var(--ml-c-error))" (src/css/modernstyle.css:618)
  content: ""\e80d"" (src/css-backup-20250604/modernstyle.css:618)
         → ""\e80d"" (src/css/modernstyle.css:618)

- **.maplibregl-ctrl
  button.maplibregl-ctrl-geolocate.maplibregl-ctrl-geolocate-waiting
  .maplibregl-ctrl-icon:before**
  animation: "maplibregl-spin 2s linear infinite" (src/css-backup-20250604/modernstyle.css:624)
         → "maplibregl-spin 2s linear infinite" (src/css/modernstyle.css:624)

- **a.maplibregl-ctrl-logo**
  cursor: "pointer" (src/css-backup-20250604/modernstyle.css:637)
         → "pointer" (src/css/modernstyle.css:637)
  display: "block" (src/css-backup-20250604/modernstyle.css:637)
         → "block" (src/css/modernstyle.css:637)
  margin: "0 0 -4px -4px" (src/css-backup-20250604/modernstyle.css:637)
         → "0 0 -4px -4px" (src/css/modernstyle.css:637)
  text-decoration: "none" (src/css-backup-20250604/modernstyle.css:637)
         → "none" (src/css/modernstyle.css:637)

- **.dark a.maplibregl-ctrl-logo:before**
  text-stroke: "0" (src/css-backup-20250604/modernstyle.css:655)
         → "0" (src/css-backup-20250604/modernstyle.css:660)
  -webkit-text-stroke: "0" (src/css-backup-20250604/modernstyle.css:655)
         → "0" (src/css-backup-20250604/modernstyle.css:660)
  text-stroke: "0" (src/css-backup-20250604/modernstyle.css:655)
         → "0" (src/css/modernstyle.css:655)
  -webkit-text-stroke: "0" (src/css-backup-20250604/modernstyle.css:655)
         → "0" (src/css/modernstyle.css:655)
  text-stroke: "0" (src/css-backup-20250604/modernstyle.css:655)
         → "0" (src/css/modernstyle.css:660)
  -webkit-text-stroke: "0" (src/css-backup-20250604/modernstyle.css:655)
         → "0" (src/css/modernstyle.css:660)

- **a.maplibregl-ctrl-logo:hover:before**
  color: "rgb(var(--ml-c-logo-2))" (src/css-backup-20250604/modernstyle.css:666)
         → "rgb(var(--ml-c-logo-2))" (src/css/modernstyle.css:666)

- **a.maplibregl-ctrl-logo.maplibregl-compact:before**
  content: ""\e813"" (src/css-backup-20250604/modernstyle.css:669)
         → ""\e813"" (src/css/modernstyle.css:669)

- **.maplibregl-ctrl button.maplibregl-ctrl-zoom-out .maplibregl-ctrl-icon:before**
  content: ""-"" (src/css-backup-20250604/modernstyle.css:672)
         → ""-"" (src/css/modernstyle.css:672)

- **.maplibregl-ctrl button.maplibregl-ctrl-zoom-in .maplibregl-ctrl-icon:before**
  content: ""+"" (src/css-backup-20250604/modernstyle.css:675)
         → ""+"" (src/css/modernstyle.css:675)

- **.maplibregl-ctrl button.maplibregl-ctrl-compass .maplibregl-ctrl-icon:before**
  content: ""\e809"" (src/css-backup-20250604/modernstyle.css:678)
         → ""\e809"" (src/css/modernstyle.css:678)

- **.maplibregl-ctrl-scale**
  background-color: "rgb(var(--ml-c-bg-1) / 65%)" (src/css-backup-20250604/modernstyle.css:689)
         → "rgb(var(--ml-c-bg-1) / 65%)" (src/css/modernstyle.css:689)
  border-bottom-left-radius: "4px" (src/css-backup-20250604/modernstyle.css:689)
         → "4px" (src/css/modernstyle.css:689)
  border-bottom-right-radius: "4px" (src/css-backup-20250604/modernstyle.css:689)
         → "4px" (src/css/modernstyle.css:689)
  border-color: "rgb(var(--ml-c-icon-1))" (src/css-backup-20250604/modernstyle.css:689)
         → "rgb(var(--ml-c-icon-1))" (src/css/modernstyle.css:689)
  border-style: "none solid solid" (src/css-backup-20250604/modernstyle.css:689)
         → "none solid solid" (src/css/modernstyle.css:689)
  border-width: "medium 2px 2px" (src/css-backup-20250604/modernstyle.css:689)
         → "medium 2px 2px" (src/css/modernstyle.css:689)
  box-sizing: "border-box" (src/css-backup-20250604/modernstyle.css:689)
         → "border-box" (src/css/modernstyle.css:689)
  font-size: "0.875rem" (src/css-backup-20250604/modernstyle.css:689)
         → "0.875rem" (src/css/modernstyle.css:689)
  line-height: "1rem" (src/css-backup-20250604/modernstyle.css:689)
         → "1rem" (src/css/modernstyle.css:689)
  padding: "0 5px" (src/css-backup-20250604/modernstyle.css:689)
         → "0 5px" (src/css/modernstyle.css:689)

- **.maplibregl-ctrl button.maplibregl-ctrl-terrain .maplibregl-ctrl-icon:before**
  content: ""\e810"" (src/css-backup-20250604/modernstyle.css:701)
         → ""\e810"" (src/css/modernstyle.css:701)

- **.maplibregl-ctrl
  button.maplibregl-ctrl-terrain-enabled
  .maplibregl-ctrl-icon:before**
  color: "rgb(var(--ml-c-active))" (src/css-backup-20250604/modernstyle.css:704)
         → "rgb(var(--ml-c-active))" (src/css/modernstyle.css:704)
  content: ""\e810"" (src/css-backup-20250604/modernstyle.css:704)
         → ""\e810"" (src/css/modernstyle.css:704)

- **.maplibregl-popup-anchor-top-left .maplibregl-popup-content**
  border-top-left-radius: "0" (src/css-backup-20250604/modernstyle.css:746)
         → "0" (src/css/modernstyle.css:746)

- **.maplibregl-popup-anchor-top-right .maplibregl-popup-content**
  border-top-right-radius: "0" (src/css-backup-20250604/modernstyle.css:749)
         → "0" (src/css/modernstyle.css:749)

- **.maplibregl-popup-anchor-bottom-left .maplibregl-popup-content**
  border-bottom-left-radius: "0" (src/css-backup-20250604/modernstyle.css:752)
         → "0" (src/css/modernstyle.css:752)

- **.maplibregl-popup-anchor-bottom-right .maplibregl-popup-content**
  border-bottom-right-radius: "0" (src/css-backup-20250604/modernstyle.css:755)
         → "0" (src/css/modernstyle.css:755)

- **.maplibregl-popup-close-button**
  background-color: "transparent" (src/css-backup-20250604/modernstyle.css:758)
         → "transparent" (src/css/modernstyle.css:758)
  border: "0" (src/css-backup-20250604/modernstyle.css:758)
         → "0" (src/css/modernstyle.css:758)
  border-radius: "var(--ml-ctrl-border-radius)" (src/css-backup-20250604/modernstyle.css:758)
         → "var(--ml-ctrl-border-radius)" (src/css/modernstyle.css:758)
  color: "rgb(var(--ml-c-icon-1))" (src/css-backup-20250604/modernstyle.css:758)
         → "rgb(var(--ml-c-icon-1))" (src/css/modernstyle.css:758)
  cursor: "pointer" (src/css-backup-20250604/modernstyle.css:758)
         → "pointer" (src/css/modernstyle.css:758)
  font-size: "1.5rem" (src/css-backup-20250604/modernstyle.css:758)
         → "1.5rem" (src/css/modernstyle.css:758)
  height: "2rem" (src/css-backup-20250604/modernstyle.css:758)
         → "2rem" (src/css/modernstyle.css:758)
  position: "absolute" (src/css-backup-20250604/modernstyle.css:758)
         → "absolute" (src/css/modernstyle.css:758)
  right: "0.25rem" (src/css-backup-20250604/modernstyle.css:758)
         → "0.25rem" (src/css/modernstyle.css:758)
  top: "0.25rem" (src/css-backup-20250604/modernstyle.css:758)
         → "0.25rem" (src/css/modernstyle.css:758)
  transition-duration: "0.3s" (src/css-backup-20250604/modernstyle.css:758)
         → "0.3s" (src/css/modernstyle.css:758)
  transition-property: "color, background-color, border-color,
    text-decoration-color, fill, stroke, box-shadow" (src/css-backup-20250604/modernstyle.css:758)
         → "color, background-color, border-color,
    text-decoration-color, fill, stroke, box-shadow" (src/css/modernstyle.css:758)
  transition-timing-function: "cubic-bezier(0.4, 0, 0.2, 1)" (src/css-backup-20250604/modernstyle.css:758)
         → "cubic-bezier(0.4, 0, 0.2, 1)" (src/css/modernstyle.css:758)
  width: "2rem" (src/css-backup-20250604/modernstyle.css:758)
         → "2rem" (src/css/modernstyle.css:758)

- **.maplibregl-popup-close-button:hover**
  background-color: "rgb(var(--ml-c-bg-2))" (src/css-backup-20250604/modernstyle.css:775)
         → "rgb(var(--ml-c-bg-2))" (src/css/modernstyle.css:775)

- **.maplibregl-popup-close-button:active**
  background-color: "rgb(var(--ml-c-bg-3))" (src/css-backup-20250604/modernstyle.css:778)
         → "rgb(var(--ml-c-bg-3))" (src/css/modernstyle.css:778)

- **.maplibregl-popup-content:has(.maplibregl-popup-close-button)**
  padding: "0.5rem 2.5rem 0.5rem 0.5rem" (src/css-backup-20250604/modernstyle.css:789)
         → "0.5rem 2.5rem 0.5rem 0.5rem" (src/css/modernstyle.css:789)

- **.sidebar-toggle**
  width: "var(--button-size-md)" (src/css-backup-20250604/mobile-overrides.css:13)
         → "var(--button-size-lg)" (src/css-backup-20250604/mobile-overrides.css:115)
  height: "var(--button-size-md)" (src/css-backup-20250604/mobile-overrides.css:13)
         → "var(--button-size-lg)" (src/css-backup-20250604/mobile-overrides.css:115)
  width: "var(--button-size-md)" (src/css-backup-20250604/mobile-overrides.css:13)
         → "2.3em" (src/css/styles.css:329)
  height: "var(--button-size-md)" (src/css-backup-20250604/mobile-overrides.css:13)
         → "2.3em" (src/css/styles.css:329)
  background-color: "rgba(255, 255, 255, 0.8)" (src/css/styles.css:329)
         → "rgba(255, 255, 255, 0.9)" (src/css/sidebar-consolidated.css:109)
  border-radius: "25%" (src/css/styles.css:329)
         → "4px" (src/css/sidebar-consolidated.css:109)
  cursor: "pointer" (src/css/styles.css:329)
         → "pointer" (src/css/sidebar-consolidated.css:109)
  transition: "background-color 0.3s" (src/css/styles.css:329)
         → "all 0.3s ease" (src/css/sidebar-consolidated.css:109)
  display: "flex" (src/css/styles.css:329)
         → "flex" (src/css/sidebar-consolidated.css:109)
  align-items: "center" (src/css/styles.css:329)
         → "center" (src/css/sidebar-consolidated.css:109)
  justify-content: "center" (src/css/styles.css:329)
         → "center" (src/css/sidebar-consolidated.css:109)
  width: "var(--button-size-md)" (src/css-backup-20250604/mobile-overrides.css:13)
         → "2.3em" (src/css/sidebar-consolidated.css:109)
  height: "var(--button-size-md)" (src/css-backup-20250604/mobile-overrides.css:13)
         → "2.3em" (src/css/sidebar-consolidated.css:109)
  z-index: "1001" (src/css/sidebar-consolidated.css:109)
         → "10000" (src/css/sidebar-consolidated.css:174)
  width: "var(--button-size-md)" (src/css-backup-20250604/mobile-overrides.css:13)
         → "var(--button-size-md)" (src/css/mobile-overrides.css:13)
  height: "var(--button-size-md)" (src/css-backup-20250604/mobile-overrides.css:13)
         → "var(--button-size-md)" (src/css/mobile-overrides.css:13)
  width: "var(--button-size-md)" (src/css-backup-20250604/mobile-overrides.css:13)
         → "var(--button-size-lg)" (src/css/mobile-overrides.css:115)
  height: "var(--button-size-md)" (src/css-backup-20250604/mobile-overrides.css:13)
         → "var(--button-size-lg)" (src/css/mobile-overrides.css:115)

- **sl-drawer[placement="start"]::part(panel)**
  width: "var(--sidebar-width-tablet)" (src/css-backup-20250604/mobile-overrides.css:19)
         → "var(--sidebar-width-mobile)" (src/css-backup-20250604/mobile-overrides.css:33)
  width: "var(--sidebar-width-tablet)" (src/css-backup-20250604/mobile-overrides.css:19)
         → "100vw" (src/css-backup-20250604/mobile-overrides.css:109)
  width: "var(--sidebar-width-tablet)" (src/css-backup-20250604/mobile-overrides.css:19)
         → "85vw" (src/css/styles.css:1906)
  height: "auto" (src/css-backup-20250604/mobile-overrides.css:33)
         → "auto" (src/css/styles.css:1906)
  border-radius: "0.75rem 0.75rem 0 0" (src/css-backup-20250604/mobile-overrides.css:33)
         → "12px 12px 0 0" (src/css/styles.css:1906)
  bottom: "0" (src/css-backup-20250604/mobile-overrides.css:33)
         → "0" (src/css/styles.css:1906)
  top: "auto" (src/css-backup-20250604/mobile-overrides.css:33)
         → "auto" (src/css/styles.css:1906)
  left: "50%" (src/css-backup-20250604/mobile-overrides.css:33)
         → "50%" (src/css/styles.css:1906)
  transform: "translateX(-50%)" (src/css-backup-20250604/mobile-overrides.css:33)
         → "translateX(-50%)" (src/css/styles.css:1906)
  box-shadow: "0 -0.125rem 0.625rem rgba(0, 0, 0, 0.3)" (src/css-backup-20250604/mobile-overrides.css:33)
         → "0px -2px 10px rgba(0, 0, 0, 0.3)" (src/css/styles.css:1906)
  width: "var(--sidebar-width-tablet)" (src/css-backup-20250604/mobile-overrides.css:19)
         → "var(--sidebar-width-tablet)" (src/css/mobile-overrides.css:19)
  width: "var(--sidebar-width-tablet)" (src/css-backup-20250604/mobile-overrides.css:19)
         → "var(--sidebar-width-mobile)" (src/css/mobile-overrides.css:33)
  height: "auto" (src/css-backup-20250604/mobile-overrides.css:33)
         → "auto" (src/css/mobile-overrides.css:33)
  border-radius: "0.75rem 0.75rem 0 0" (src/css-backup-20250604/mobile-overrides.css:33)
         → "0.75rem 0.75rem 0 0" (src/css/mobile-overrides.css:33)
  bottom: "0" (src/css-backup-20250604/mobile-overrides.css:33)
         → "0" (src/css/mobile-overrides.css:33)
  top: "auto" (src/css-backup-20250604/mobile-overrides.css:33)
         → "auto" (src/css/mobile-overrides.css:33)
  left: "50%" (src/css-backup-20250604/mobile-overrides.css:33)
         → "50%" (src/css/mobile-overrides.css:33)
  transform: "translateX(-50%)" (src/css-backup-20250604/mobile-overrides.css:33)
         → "translateX(-50%)" (src/css/mobile-overrides.css:33)
  box-shadow: "0 -0.125rem 0.625rem rgba(0, 0, 0, 0.3)" (src/css-backup-20250604/mobile-overrides.css:33)
         → "0 -0.125rem 0.625rem rgba(0, 0, 0, 0.3)" (src/css/mobile-overrides.css:33)
  width: "var(--sidebar-width-tablet)" (src/css-backup-20250604/mobile-overrides.css:19)
         → "100vw" (src/css/mobile-overrides.css:109)

- **sl-drawer[placement="end"]::part(panel)**
  width: "var(--sidebar-width-tablet)" (src/css-backup-20250604/mobile-overrides.css:19)
         → "var(--sidebar-width-mobile)" (src/css-backup-20250604/mobile-overrides.css:33)
  width: "var(--sidebar-width-tablet)" (src/css-backup-20250604/mobile-overrides.css:19)
         → "100vw" (src/css-backup-20250604/mobile-overrides.css:109)
  left: "50%" (src/css-backup-20250604/mobile-overrides.css:33)
         → "auto" (src/css/styles.css:1327)
  width: "var(--sidebar-width-tablet)" (src/css-backup-20250604/mobile-overrides.css:19)
         → "85vw" (src/css/styles.css:1906)
  height: "auto" (src/css-backup-20250604/mobile-overrides.css:33)
         → "auto" (src/css/styles.css:1906)
  border-radius: "0.75rem 0.75rem 0 0" (src/css-backup-20250604/mobile-overrides.css:33)
         → "12px 12px 0 0" (src/css/styles.css:1906)
  bottom: "0" (src/css-backup-20250604/mobile-overrides.css:33)
         → "0" (src/css/styles.css:1906)
  top: "auto" (src/css-backup-20250604/mobile-overrides.css:33)
         → "auto" (src/css/styles.css:1906)
  left: "50%" (src/css-backup-20250604/mobile-overrides.css:33)
         → "50%" (src/css/styles.css:1906)
  transform: "translateX(-50%)" (src/css-backup-20250604/mobile-overrides.css:33)
         → "translateX(-50%)" (src/css/styles.css:1906)
  box-shadow: "0 -0.125rem 0.625rem rgba(0, 0, 0, 0.3)" (src/css-backup-20250604/mobile-overrides.css:33)
         → "0px -2px 10px rgba(0, 0, 0, 0.3)" (src/css/styles.css:1906)
  width: "var(--sidebar-width-tablet)" (src/css-backup-20250604/mobile-overrides.css:19)
         → "var(--sidebar-width-tablet)" (src/css/mobile-overrides.css:19)
  width: "var(--sidebar-width-tablet)" (src/css-backup-20250604/mobile-overrides.css:19)
         → "var(--sidebar-width-mobile)" (src/css/mobile-overrides.css:33)
  height: "auto" (src/css-backup-20250604/mobile-overrides.css:33)
         → "auto" (src/css/mobile-overrides.css:33)
  border-radius: "0.75rem 0.75rem 0 0" (src/css-backup-20250604/mobile-overrides.css:33)
         → "0.75rem 0.75rem 0 0" (src/css/mobile-overrides.css:33)
  bottom: "0" (src/css-backup-20250604/mobile-overrides.css:33)
         → "0" (src/css/mobile-overrides.css:33)
  top: "auto" (src/css-backup-20250604/mobile-overrides.css:33)
         → "auto" (src/css/mobile-overrides.css:33)
  left: "50%" (src/css-backup-20250604/mobile-overrides.css:33)
         → "50%" (src/css/mobile-overrides.css:33)
  transform: "translateX(-50%)" (src/css-backup-20250604/mobile-overrides.css:33)
         → "translateX(-50%)" (src/css/mobile-overrides.css:33)
  box-shadow: "0 -0.125rem 0.625rem rgba(0, 0, 0, 0.3)" (src/css-backup-20250604/mobile-overrides.css:33)
         → "0 -0.125rem 0.625rem rgba(0, 0, 0, 0.3)" (src/css/mobile-overrides.css:33)
  width: "var(--sidebar-width-tablet)" (src/css-backup-20250604/mobile-overrides.css:19)
         → "100vw" (src/css/mobile-overrides.css:109)

- **sl-drawer[placement="start"]**
  --size: "90vh" (src/css-backup-20250604/mobile-overrides.css:28)
         → "80vh" (src/css-backup-20250604/mobile-overrides.css:130)
  --size: "90vh" (src/css-backup-20250604/mobile-overrides.css:28)
         → "90vh" (src/css/styles.css:1901)
  --size: "90vh" (src/css-backup-20250604/mobile-overrides.css:28)
         → "90vh" (src/css/mobile-overrides.css:28)
  --size: "90vh" (src/css-backup-20250604/mobile-overrides.css:28)
         → "80vh" (src/css/mobile-overrides.css:130)

- **sl-drawer[placement="end"]**
  --size: "90vh" (src/css-backup-20250604/mobile-overrides.css:28)
         → "80vh" (src/css-backup-20250604/mobile-overrides.css:130)
  --size: "90vh" (src/css-backup-20250604/mobile-overrides.css:28)
         → "90vh" (src/css/styles.css:1901)
  --size: "90vh" (src/css-backup-20250604/mobile-overrides.css:28)
         → "90vh" (src/css/mobile-overrides.css:28)
  --size: "90vh" (src/css-backup-20250604/mobile-overrides.css:28)
         → "80vh" (src/css/mobile-overrides.css:130)

- **sl-drawer#right1-drawer::part(panel)**
  width: "90vw" (src/css-backup-20250604/mobile-overrides.css:46)
         → "90vw" (src/css/styles.css:1918)
  width: "90vw" (src/css-backup-20250604/mobile-overrides.css:46)
         → "90vw" (src/css/mobile-overrides.css:46)

- **sl-drawer#right2-drawer::part(panel)**
  width: "90vw" (src/css-backup-20250604/mobile-overrides.css:46)
         → "90vw" (src/css/styles.css:1918)
  width: "90vw" (src/css-backup-20250604/mobile-overrides.css:46)
         → "90vw" (src/css/mobile-overrides.css:46)

- **#footer-bar**
  background-color: "rgba(255, 255, 255, 0.9)" (src/css-backup-20250604/mobile-overrides.css:52)
         → "rgba(255, 255, 255, 0.25)" (src/css/styles.css:135)
  font-size: "var(--font-base, 1rem)" (src/css-backup-20250604/mobile-overrides.css:52)
         → "var(--font-xs, 0.75rem)" (src/css/styles.css:135)
  font-size: "var(--font-base, 1rem)" (src/css-backup-20250604/mobile-overrides.css:52)
         → "14px" (src/css/styles.css:1924)
  font-weight: "600" (src/css-backup-20250604/mobile-overrides.css:52)
         → "600" (src/css/styles.css:1924)
  color: "black" (src/css-backup-20250604/mobile-overrides.css:52)
         → "black" (src/css/styles.css:1924)
  background-color: "rgba(255, 255, 255, 0.9)" (src/css-backup-20250604/mobile-overrides.css:52)
         → "rgba(255, 255, 255, 0.9)" (src/css/styles.css:1924)
  font-size: "var(--font-base, 1rem)" (src/css-backup-20250604/mobile-overrides.css:52)
         → "var(--font-base, 1rem)" (src/css/mobile-overrides.css:52)
  font-weight: "600" (src/css-backup-20250604/mobile-overrides.css:52)
         → "600" (src/css/mobile-overrides.css:52)
  color: "black" (src/css-backup-20250604/mobile-overrides.css:52)
         → "black" (src/css/mobile-overrides.css:52)
  background-color: "rgba(255, 255, 255, 0.9)" (src/css-backup-20250604/mobile-overrides.css:52)
         → "rgba(255, 255, 255, 0.9)" (src/css/mobile-overrides.css:52)

- **#fab-main**
  bottom: "5rem" (src/css-backup-20250604/mobile-overrides.css:77)
         → "4rem" (src/css-backup-20250604/mobile-overrides.css:121)
  right: "var(--spacing-lg, 1rem)" (src/css-backup-20250604/mobile-overrides.css:77)
         → "var(--spacing-md, 0.75rem)" (src/css-backup-20250604/mobile-overrides.css:121)
  bottom: "5rem" (src/css-backup-20250604/mobile-overrides.css:77)
         → "var(--spacing-lg, 1rem)" (src/css-backup-20250604/mobile-overrides.css:142)
  position: "fixed" (src/css-backup-20250604/mobile-overrides.css:77)
         → "fixed" (src/css/mobile-overrides.css:77)
  bottom: "5rem" (src/css-backup-20250604/mobile-overrides.css:77)
         → "5rem" (src/css/mobile-overrides.css:77)
  right: "var(--spacing-lg, 1rem)" (src/css-backup-20250604/mobile-overrides.css:77)
         → "var(--spacing-lg, 1rem)" (src/css/mobile-overrides.css:77)
  z-index: "20" (src/css-backup-20250604/mobile-overrides.css:77)
         → "20" (src/css/mobile-overrides.css:77)
  width: "var(--button-size-lg, 3.5rem)" (src/css-backup-20250604/mobile-overrides.css:77)
         → "var(--button-size-lg, 3.5rem)" (src/css/mobile-overrides.css:77)
  height: "var(--button-size-lg, 3.5rem)" (src/css-backup-20250604/mobile-overrides.css:77)
         → "var(--button-size-lg, 3.5rem)" (src/css/mobile-overrides.css:77)
  border-radius: "50%" (src/css-backup-20250604/mobile-overrides.css:77)
         → "50%" (src/css/mobile-overrides.css:77)
  background-color: "#4682b4" (src/css-backup-20250604/mobile-overrides.css:77)
         → "#4682b4" (src/css/mobile-overrides.css:77)
  color: "white" (src/css-backup-20250604/mobile-overrides.css:77)
         → "white" (src/css/mobile-overrides.css:77)
  font-size: "var(--font-lg, 1.25rem)" (src/css-backup-20250604/mobile-overrides.css:77)
         → "var(--font-lg, 1.25rem)" (src/css/mobile-overrides.css:77)
  box-shadow: "0 0.125rem 0.5rem rgba(0, 0, 0, 0.3)" (src/css-backup-20250604/mobile-overrides.css:77)
         → "0 0.125rem 0.5rem rgba(0, 0, 0, 0.3)" (src/css/mobile-overrides.css:77)
  cursor: "pointer" (src/css-backup-20250604/mobile-overrides.css:77)
         → "pointer" (src/css/mobile-overrides.css:77)
  display: "flex" (src/css-backup-20250604/mobile-overrides.css:77)
         → "flex" (src/css/mobile-overrides.css:77)
  align-items: "center" (src/css-backup-20250604/mobile-overrides.css:77)
         → "center" (src/css/mobile-overrides.css:77)
  justify-content: "center" (src/css-backup-20250604/mobile-overrides.css:77)
         → "center" (src/css/mobile-overrides.css:77)
  bottom: "5rem" (src/css-backup-20250604/mobile-overrides.css:77)
         → "4rem" (src/css/mobile-overrides.css:121)
  right: "var(--spacing-lg, 1rem)" (src/css-backup-20250604/mobile-overrides.css:77)
         → "var(--spacing-md, 0.75rem)" (src/css/mobile-overrides.css:121)
  bottom: "5rem" (src/css-backup-20250604/mobile-overrides.css:77)
         → "var(--spacing-lg, 1rem)" (src/css/mobile-overrides.css:142)

- **#fab-main:hover**
  background-color: "#3a6d94" (src/css-backup-20250604/mobile-overrides.css:96)
         → "#3a6d94" (src/css/mobile-overrides.css:96)

- **#left4**
  overflow: "hidden" (src/css-backup-20250604/layer-catogories.css:4)
         → "hidden" (src/css/layer-catogories.css:4)

- **#left4 .sidebar-content**
  padding: "0" (src/css-backup-20250604/layer-catogories.css:8)
         → "0" (src/css/layer-catogories.css:8)
  width: "100%" (src/css-backup-20250604/layer-catogories.css:8)
         → "100%" (src/css/layer-catogories.css:8)
  box-sizing: "border-box" (src/css-backup-20250604/layer-catogories.css:8)
         → "border-box" (src/css/layer-catogories.css:8)

- **.layer-list-header**
  background: "var(--geolantis-blue, #4682b4)" (src/css-backup-20250604/layer-catogories.css:15)
         → "var(--geolantis-blue, #4682b4)" (src/css/layer-catogories.css:15)
  color: "white" (src/css-backup-20250604/layer-catogories.css:15)
         → "white" (src/css/layer-catogories.css:15)
  padding: "16px" (src/css-backup-20250604/layer-catogories.css:15)
         → "16px" (src/css/layer-catogories.css:15)
  display: "flex" (src/css-backup-20250604/layer-catogories.css:15)
         → "flex" (src/css/layer-catogories.css:15)
  justify-content: "space-between" (src/css-backup-20250604/layer-catogories.css:15)
         → "space-between" (src/css/layer-catogories.css:15)
  align-items: "center" (src/css-backup-20250604/layer-catogories.css:15)
         → "center" (src/css/layer-catogories.css:15)
  width: "100%" (src/css-backup-20250604/layer-catogories.css:15)
         → "100%" (src/css/layer-catogories.css:15)
  box-sizing: "border-box" (src/css-backup-20250604/layer-catogories.css:15)
         → "border-box" (src/css/layer-catogories.css:15)
  margin: "0" (src/css-backup-20250604/layer-catogories.css:15)
         → "0" (src/css/layer-catogories.css:15)

- **.layer-list-header sl-button**
  --sl-color-neutral-0: "var(--sl-color-neutral-500)" (src/css-backup-20250604/layer-catogories.css:28)
         → "var(--sl-color-neutral-500)" (src/css/layer-catogories.css:28)
  --sl-color-neutral-700: "var(--sl-color-neutral-700)" (src/css-backup-20250604/layer-catogories.css:28)
         → "var(--sl-color-neutral-700)" (src/css/layer-catogories.css:28)
  --sl-input-border-color: "transparent" (src/css-backup-20250604/layer-catogories.css:28)
         → "transparent" (src/css/layer-catogories.css:28)
  background-color: "var(--sl-color-neutral-200)" (src/css-backup-20250604/layer-catogories.css:28)
         → "var(--sl-color-neutral-200)" (src/css/layer-catogories.css:28)
  color: "var(--sl-color-neutral-700)" (src/css-backup-20250604/layer-catogories.css:28)
         → "var(--sl-color-neutral-700)" (src/css/layer-catogories.css:28)
  border: "1px solid var(--sl-color-neutral-300)" (src/css-backup-20250604/layer-catogories.css:28)
         → "1px solid var(--sl-color-neutral-300)" (src/css/layer-catogories.css:28)
  font-size: "12px" (src/css-backup-20250604/layer-catogories.css:28)
         → "12px" (src/css/layer-catogories.css:28)
  padding: "4px 8px" (src/css-backup-20250604/layer-catogories.css:28)
         → "4px 8px" (src/css/layer-catogories.css:28)
  height: "24px" (src/css-backup-20250604/layer-catogories.css:28)
         → "24px" (src/css/layer-catogories.css:28)
  min-width: "80px" (src/css-backup-20250604/layer-catogories.css:28)
         → "80px" (src/css/layer-catogories.css:28)
  margin-left: "auto" (src/css-backup-20250604/layer-catogories.css:28)
         → "auto" (src/css/layer-catogories.css:28)

- **.layer-list-header sl-button:hover**
  background-color: "var(--sl-color-neutral-300)" (src/css-backup-20250604/layer-catogories.css:42)
         → "var(--sl-color-neutral-300)" (src/css/layer-catogories.css:42)

- **.layer-list-title**
  font-size: "18px" (src/css-backup-20250604/layer-catogories.css:46)
         → "18px" (src/css/layer-catogories.css:46)
  font-weight: "500" (src/css-backup-20250604/layer-catogories.css:46)
         → "500" (src/css/layer-catogories.css:46)
  font-family: ""Roboto", sans-serif" (src/css-backup-20250604/layer-catogories.css:46)
         → ""Roboto", sans-serif" (src/css/layer-catogories.css:46)
  text-align: "left" (src/css-backup-20250604/layer-catogories.css:46)
         → "left" (src/css/layer-catogories.css:46)

- **.search-container**
  padding: "16px" (src/css-backup-20250604/layer-catogories.css:54)
         → "16px" (src/css/layer-catogories.css:54)
  background: "white" (src/css-backup-20250604/layer-catogories.css:54)
         → "white" (src/css/layer-catogories.css:54)
  border-bottom: "1px solid var(--sl-color-neutral-200)" (src/css-backup-20250604/layer-catogories.css:54)
         → "1px solid var(--sl-color-neutral-200)" (src/css/layer-catogories.css:54)
  width: "100%" (src/css-backup-20250604/layer-catogories.css:54)
         → "100%" (src/css/layer-catogories.css:54)
  box-sizing: "border-box" (src/css-backup-20250604/layer-catogories.css:54)
         → "border-box" (src/css/layer-catogories.css:54)
  margin: "0" (src/css-backup-20250604/layer-catogories.css:54)
         → "0" (src/css/layer-catogories.css:54)

- **.search-container sl-input**
  width: "100%" (src/css-backup-20250604/layer-catogories.css:63)
         → "100%" (src/css/layer-catogories.css:63)

- **.lc-layer-controls-header**
  position: "relative" (src/css-backup-20250604/layer-catogories.css:68)
         → "relative" (src/css-backup-20250604/layer-catogories.css:492)
  flex-direction: "row" (src/css-backup-20250604/layer-catogories.css:449)
         → "row" (src/css-backup-20250604/layer-catogories.css:492)
  align-items: "center" (src/css-backup-20250604/layer-catogories.css:449)
         → "center" (src/css-backup-20250604/layer-catogories.css:492)
  padding: "8px 16px" (src/css-backup-20250604/layer-catogories.css:449)
         → "8px 16px" (src/css-backup-20250604/layer-catogories.css:492)
  position: "relative" (src/css-backup-20250604/layer-catogories.css:68)
         → "relative" (src/css/layer-catogories.css:68)
  display: "flex" (src/css-backup-20250604/layer-catogories.css:449)
         → "flex" (src/css/layer-catogories.css:449)
  flex-direction: "row" (src/css-backup-20250604/layer-catogories.css:449)
         → "row" (src/css/layer-catogories.css:449)
  align-items: "center" (src/css-backup-20250604/layer-catogories.css:449)
         → "center" (src/css/layer-catogories.css:449)
  justify-content: "space-between" (src/css-backup-20250604/layer-catogories.css:449)
         → "space-between" (src/css/layer-catogories.css:449)
  width: "100%" (src/css-backup-20250604/layer-catogories.css:449)
         → "100%" (src/css/layer-catogories.css:449)
  padding: "8px 16px" (src/css-backup-20250604/layer-catogories.css:449)
         → "8px 16px" (src/css/layer-catogories.css:449)
  position: "relative" (src/css-backup-20250604/layer-catogories.css:68)
         → "relative" (src/css/layer-catogories.css:480)
  flex-direction: "row" (src/css-backup-20250604/layer-catogories.css:449)
         → "row" (src/css/layer-catogories.css:480)
  align-items: "center" (src/css-backup-20250604/layer-catogories.css:449)
         → "center" (src/css/layer-catogories.css:480)
  padding: "8px 16px" (src/css-backup-20250604/layer-catogories.css:449)
         → "8px 16px" (src/css/layer-catogories.css:480)

- **.lc-layer-controls-header::after**
  content: """" (src/css-backup-20250604/layer-catogories.css:71)
         → """" (src/css-backup-20250604/layer-catogories.css:457)
  position: "absolute" (src/css-backup-20250604/layer-catogories.css:71)
         → "absolute" (src/css-backup-20250604/layer-catogories.css:457)
  left: "0" (src/css-backup-20250604/layer-catogories.css:71)
         → "0" (src/css-backup-20250604/layer-catogories.css:457)
  right: "0" (src/css-backup-20250604/layer-catogories.css:71)
         → "0" (src/css-backup-20250604/layer-catogories.css:457)
  bottom: "0" (src/css-backup-20250604/layer-catogories.css:71)
         → "0" (src/css-backup-20250604/layer-catogories.css:457)
  height: "1px" (src/css-backup-20250604/layer-catogories.css:71)
         → "1px" (src/css-backup-20250604/layer-catogories.css:457)
  background: "var(--sl-color-neutral-200)" (src/css-backup-20250604/layer-catogories.css:71)
         → "var(--sl-color-neutral-200)" (src/css-backup-20250604/layer-catogories.css:457)
  content: """" (src/css-backup-20250604/layer-catogories.css:71)
         → """" (src/css-backup-20250604/layer-catogories.css:498)
  position: "absolute" (src/css-backup-20250604/layer-catogories.css:71)
         → "absolute" (src/css-backup-20250604/layer-catogories.css:498)
  left: "0" (src/css-backup-20250604/layer-catogories.css:71)
         → "0" (src/css-backup-20250604/layer-catogories.css:498)
  right: "0" (src/css-backup-20250604/layer-catogories.css:71)
         → "0" (src/css-backup-20250604/layer-catogories.css:498)
  bottom: "0" (src/css-backup-20250604/layer-catogories.css:71)
         → "0" (src/css-backup-20250604/layer-catogories.css:498)
  height: "1px" (src/css-backup-20250604/layer-catogories.css:71)
         → "1px" (src/css-backup-20250604/layer-catogories.css:498)
  background: "var(--sl-color-neutral-200)" (src/css-backup-20250604/layer-catogories.css:71)
         → "var(--sl-color-neutral-200)" (src/css-backup-20250604/layer-catogories.css:498)
  content: """" (src/css-backup-20250604/layer-catogories.css:71)
         → """" (src/css/layer-catogories.css:71)
  position: "absolute" (src/css-backup-20250604/layer-catogories.css:71)
         → "absolute" (src/css/layer-catogories.css:71)
  left: "0" (src/css-backup-20250604/layer-catogories.css:71)
         → "0" (src/css/layer-catogories.css:71)
  right: "0" (src/css-backup-20250604/layer-catogories.css:71)
         → "0" (src/css/layer-catogories.css:71)
  bottom: "0" (src/css-backup-20250604/layer-catogories.css:71)
         → "0" (src/css/layer-catogories.css:71)
  height: "1px" (src/css-backup-20250604/layer-catogories.css:71)
         → "1px" (src/css/layer-catogories.css:71)
  background: "var(--sl-color-neutral-200)" (src/css-backup-20250604/layer-catogories.css:71)
         → "var(--sl-color-neutral-200)" (src/css/layer-catogories.css:71)

- **.lc-layer-controls-description**
  font-size: "13px" (src/css-backup-20250604/layer-catogories.css:81)
         → "13px" (src/css/layer-catogories.css:81)
  color: "var(--sl-color-neutral-700)" (src/css-backup-20250604/layer-catogories.css:81)
         → "var(--sl-color-neutral-700)" (src/css/layer-catogories.css:81)
  font-weight: "500" (src/css-backup-20250604/layer-catogories.css:81)
         → "500" (src/css/layer-catogories.css:81)
  margin-bottom: "4px" (src/css-backup-20250604/layer-catogories.css:81)
         → "4px" (src/css/layer-catogories.css:81)

- **.lc-layer-controls-master**
  display: "flex" (src/css-backup-20250604/layer-catogories.css:89)
         → "flex" (src/css-backup-20250604/layer-catogories.css:398)
  align-items: "left" (src/css-backup-20250604/layer-catogories.css:89)
         → "center" (src/css-backup-20250604/layer-catogories.css:398)
  gap: "18px" (src/css-backup-20250604/layer-catogories.css:89)
         → "18px" (src/css-backup-20250604/layer-catogories.css:398)
  margin-top: "0" (src/css-backup-20250604/layer-catogories.css:89)
         → "0" (src/css-backup-20250604/layer-catogories.css:398)
  padding-left: "0" (src/css-backup-20250604/layer-catogories.css:89)
         → "0" (src/css-backup-20250604/layer-catogories.css:398)
  margin-left: "auto" (src/css-backup-20250604/layer-catogories.css:89)
         → "auto" (src/css-backup-20250604/layer-catogories.css:398)
  margin-right: "8px" (src/css-backup-20250604/layer-catogories.css:89)
         → "8px" (src/css-backup-20250604/layer-catogories.css:398)
  flex-shrink: "0" (src/css-backup-20250604/layer-catogories.css:89)
         → "0" (src/css-backup-20250604/layer-catogories.css:398)
  width: "100px" (src/css-backup-20250604/layer-catogories.css:89)
         → "100px" (src/css-backup-20250604/layer-catogories.css:398)
  justify-content: "flex-end" (src/css-backup-20250604/layer-catogories.css:89)
         → "flex-end" (src/css-backup-20250604/layer-catogories.css:398)
  width: "100px" (src/css-backup-20250604/layer-catogories.css:89)
         → "96px" (src/css-backup-20250604/layer-catogories.css:422)
  gap: "18px" (src/css-backup-20250604/layer-catogories.css:89)
         → "18px" (src/css-backup-20250604/layer-catogories.css:422)
  justify-content: "flex-end" (src/css-backup-20250604/layer-catogories.css:89)
         → "flex-end" (src/css-backup-20250604/layer-catogories.css:422)
  justify-content: "flex-end" (src/css-backup-20250604/layer-catogories.css:89)
         → "flex-end" (src/css-backup-20250604/layer-catogories.css:476)
  gap: "18px" (src/css-backup-20250604/layer-catogories.css:89)
         → "18px" (src/css-backup-20250604/layer-catogories.css:476)
  width: "100px" (src/css-backup-20250604/layer-catogories.css:89)
         → "140px" (src/css-backup-20250604/layer-catogories.css:520)
  gap: "18px" (src/css-backup-20250604/layer-catogories.css:89)
         → "18px" (src/css-backup-20250604/layer-catogories.css:520)
  justify-content: "flex-end" (src/css-backup-20250604/layer-catogories.css:89)
         → "flex-end" (src/css-backup-20250604/layer-catogories.css:520)
  display: "flex" (src/css-backup-20250604/layer-catogories.css:89)
         → "flex" (src/css/layer-catogories.css:89)
  align-items: "left" (src/css-backup-20250604/layer-catogories.css:89)
         → "left" (src/css/layer-catogories.css:89)
  gap: "18px" (src/css-backup-20250604/layer-catogories.css:89)
         → "18px" (src/css/layer-catogories.css:89)
  margin-top: "0" (src/css-backup-20250604/layer-catogories.css:89)
         → "0" (src/css/layer-catogories.css:89)
  padding-left: "0" (src/css-backup-20250604/layer-catogories.css:89)
         → "0" (src/css/layer-catogories.css:89)
  margin-left: "auto" (src/css-backup-20250604/layer-catogories.css:89)
         → "auto" (src/css/layer-catogories.css:89)
  margin-right: "8px" (src/css-backup-20250604/layer-catogories.css:89)
         → "8px" (src/css/layer-catogories.css:89)
  flex-shrink: "0" (src/css-backup-20250604/layer-catogories.css:89)
         → "0" (src/css/layer-catogories.css:89)
  width: "100px" (src/css-backup-20250604/layer-catogories.css:89)
         → "100px" (src/css/layer-catogories.css:89)
  justify-content: "flex-end" (src/css-backup-20250604/layer-catogories.css:89)
         → "flex-end" (src/css/layer-catogories.css:89)
  display: "flex" (src/css-backup-20250604/layer-catogories.css:89)
         → "flex" (src/css/layer-catogories.css:398)
  align-items: "left" (src/css-backup-20250604/layer-catogories.css:89)
         → "center" (src/css/layer-catogories.css:398)
  gap: "18px" (src/css-backup-20250604/layer-catogories.css:89)
         → "18px" (src/css/layer-catogories.css:398)
  margin-top: "0" (src/css-backup-20250604/layer-catogories.css:89)
         → "0" (src/css/layer-catogories.css:398)
  padding-left: "0" (src/css-backup-20250604/layer-catogories.css:89)
         → "0" (src/css/layer-catogories.css:398)
  margin-left: "auto" (src/css-backup-20250604/layer-catogories.css:89)
         → "auto" (src/css/layer-catogories.css:398)
  margin-right: "8px" (src/css-backup-20250604/layer-catogories.css:89)
         → "8px" (src/css/layer-catogories.css:398)
  flex-shrink: "0" (src/css-backup-20250604/layer-catogories.css:89)
         → "0" (src/css/layer-catogories.css:398)
  width: "100px" (src/css-backup-20250604/layer-catogories.css:89)
         → "100px" (src/css/layer-catogories.css:398)
  justify-content: "flex-end" (src/css-backup-20250604/layer-catogories.css:89)
         → "flex-end" (src/css/layer-catogories.css:398)
  padding-right: "0" (src/css-backup-20250604/layer-catogories.css:398)
         → "0" (src/css/layer-catogories.css:398)
  width: "100px" (src/css-backup-20250604/layer-catogories.css:89)
         → "96px" (src/css/layer-catogories.css:422)
  gap: "18px" (src/css-backup-20250604/layer-catogories.css:89)
         → "18px" (src/css/layer-catogories.css:422)
  justify-content: "flex-end" (src/css-backup-20250604/layer-catogories.css:89)
         → "flex-end" (src/css/layer-catogories.css:422)
  justify-content: "flex-end" (src/css-backup-20250604/layer-catogories.css:89)
         → "flex-end" (src/css/layer-catogories.css:464)
  gap: "18px" (src/css-backup-20250604/layer-catogories.css:89)
         → "18px" (src/css/layer-catogories.css:464)
  min-width: "140px" (src/css-backup-20250604/layer-catogories.css:520)
         → "140px" (src/css/layer-catogories.css:498)
  width: "100px" (src/css-backup-20250604/layer-catogories.css:89)
         → "140px" (src/css/layer-catogories.css:498)
  gap: "18px" (src/css-backup-20250604/layer-catogories.css:89)
         → "18px" (src/css/layer-catogories.css:498)
  justify-content: "flex-end" (src/css-backup-20250604/layer-catogories.css:89)
         → "flex-end" (src/css/layer-catogories.css:498)

- **.lc-master-control**
  width: "32px" (src/css-backup-20250604/layer-catogories.css:102)
         → "32px" (src/css-backup-20250604/layer-catogories.css:537)
  display: "flex" (src/css-backup-20250604/layer-catogories.css:102)
         → "flex" (src/css/layer-catogories.css:102)
  flex-direction: "column" (src/css-backup-20250604/layer-catogories.css:102)
         → "column" (src/css/layer-catogories.css:102)
  align-items: "left" (src/css-backup-20250604/layer-catogories.css:102)
         → "left" (src/css/layer-catogories.css:102)
  gap: "4px" (src/css-backup-20250604/layer-catogories.css:102)
         → "4px" (src/css/layer-catogories.css:102)
  width: "32px" (src/css-backup-20250604/layer-catogories.css:102)
         → "32px" (src/css/layer-catogories.css:102)
  flex-shrink: "0" (src/css-backup-20250604/layer-catogories.css:102)
         → "0" (src/css/layer-catogories.css:102)
  width: "32px" (src/css-backup-20250604/layer-catogories.css:102)
         → "32px" (src/css/layer-catogories.css:508)

- **.lc-control-label**
  user-select: "none" (src/css-backup-20250604/layer-catogories.css:111)
         → "none" (src/css-backup-20250604/layer-catogories.css:552)
  font-size: "11px" (src/css-backup-20250604/layer-catogories.css:111)
         → "11px" (src/css/layer-catogories.css:111)
  color: "var(--sl-color-neutral-900)" (src/css-backup-20250604/layer-catogories.css:111)
         → "var(--sl-color-neutral-900)" (src/css/layer-catogories.css:111)
  user-select: "none" (src/css-backup-20250604/layer-catogories.css:111)
         → "none" (src/css/layer-catogories.css:111)
  text-align: "center" (src/css-backup-20250604/layer-catogories.css:111)
         → "center" (src/css/layer-catogories.css:111)
  user-select: "none" (src/css-backup-20250604/layer-catogories.css:111)
         → "none" (src/css/layer-catogories.css:523)
  -webkit-user-select: "none" (src/css-backup-20250604/layer-catogories.css:552)
         → "none" (src/css/layer-catogories.css:523)
  -moz-user-select: "none" (src/css-backup-20250604/layer-catogories.css:552)
         → "none" (src/css/layer-catogories.css:523)
  -ms-user-select: "none" (src/css-backup-20250604/layer-catogories.css:552)
         → "none" (src/css/layer-catogories.css:523)

- **#featureLayersContainer**
  width: "100%" (src/css-backup-20250604/layer-catogories.css:119)
         → "100%" (src/css/layer-catogories.css:119)
  box-sizing: "border-box" (src/css-backup-20250604/layer-catogories.css:119)
         → "border-box" (src/css/layer-catogories.css:119)
  margin-right: "0" (src/css-backup-20250604/layer-catogories.css:119)
         → "0" (src/css/layer-catogories.css:119)
  padding-right: "8px" (src/css-backup-20250604/layer-catogories.css:119)
         → "8px" (src/css/layer-catogories.css:119)

- **.lc-category**
  border-bottom: "1px solid var(--sl-color-neutral-200)" (src/css-backup-20250604/layer-catogories.css:127)
         → "1px solid var(--sl-color-neutral-200)" (src/css/layer-catogories.css:127)
  width: "100%" (src/css-backup-20250604/layer-catogories.css:127)
         → "100%" (src/css/layer-catogories.css:127)

- **.lc-category-header**
  background: "var(--sl-color-neutral-50)" (src/css-backup-20250604/layer-catogories.css:132)
         → "var(--sl-color-neutral-50)" (src/css/layer-catogories.css:132)
  padding: "8px 16px" (src/css-backup-20250604/layer-catogories.css:132)
         → "8px 16px" (src/css/layer-catogories.css:132)
  display: "flex" (src/css-backup-20250604/layer-catogories.css:132)
         → "flex" (src/css/layer-catogories.css:132)
  justify-content: "space-between" (src/css-backup-20250604/layer-catogories.css:132)
         → "space-between" (src/css/layer-catogories.css:132)
  align-items: "center" (src/css-backup-20250604/layer-catogories.css:132)
         → "center" (src/css/layer-catogories.css:132)
  cursor: "pointer" (src/css-backup-20250604/layer-catogories.css:132)
         → "pointer" (src/css/layer-catogories.css:132)
  user-select: "none" (src/css-backup-20250604/layer-catogories.css:132)
         → "none" (src/css/layer-catogories.css:132)
  min-height: "48px" (src/css-backup-20250604/layer-catogories.css:132)
         → "48px" (src/css/layer-catogories.css:132)
  width: "100%" (src/css-backup-20250604/layer-catogories.css:132)
         → "100%" (src/css/layer-catogories.css:132)
  box-sizing: "border-box" (src/css-backup-20250604/layer-catogories.css:132)
         → "border-box" (src/css/layer-catogories.css:132)
  min-width: "0" (src/css-backup-20250604/layer-catogories.css:573)
         → "0" (src/css/layer-catogories.css:544)

- **.lc-category-header:hover**
  background: "var(--sl-color-neutral-100)" (src/css-backup-20250604/layer-catogories.css:145)
         → "var(--sl-color-neutral-100)" (src/css/layer-catogories.css:145)

- **.lc-category-header-left**
  display: "flex" (src/css-backup-20250604/layer-catogories.css:149)
         → "flex" (src/css/layer-catogories.css:149)
  align-items: "center" (src/css-backup-20250604/layer-catogories.css:149)
         → "center" (src/css/layer-catogories.css:149)
  gap: "8px" (src/css-backup-20250604/layer-catogories.css:149)
         → "8px" (src/css/layer-catogories.css:149)
  flex: "1" (src/css-backup-20250604/layer-catogories.css:149)
         → "1" (src/css/layer-catogories.css:149)
  min-width: "0" (src/css-backup-20250604/layer-catogories.css:149)
         → "0" (src/css/layer-catogories.css:149)

- **.lc-category-name**
  font-weight: "500" (src/css-backup-20250604/layer-catogories.css:157)
         → "500" (src/css/layer-catogories.css:157)
  font-size: "16px" (src/css-backup-20250604/layer-catogories.css:157)
         → "16px" (src/css/layer-catogories.css:157)
  font-family: ""Roboto", sans-serif" (src/css-backup-20250604/layer-catogories.css:157)
         → ""Roboto", sans-serif" (src/css/layer-catogories.css:157)
  margin-left: "0" (src/css-backup-20250604/layer-catogories.css:157)
         → "0" (src/css/layer-catogories.css:157)

- **sl-icon[name="chevron-down"]**
  width: "24px" (src/css-backup-20250604/layer-catogories.css:165)
         → "24px" (src/css/layer-catogories.css:165)
  height: "24px" (src/css-backup-20250604/layer-catogories.css:165)
         → "24px" (src/css/layer-catogories.css:165)
  flex-shrink: "0" (src/css-backup-20250604/layer-catogories.css:165)
         → "0" (src/css/layer-catogories.css:165)
  transition: "transform 0.3s ease" (src/css-backup-20250604/layer-catogories.css:165)
         → "transform 0.3s ease" (src/css/layer-catogories.css:165)
  transform: "rotate(0deg)" (src/css-backup-20250604/layer-catogories.css:165)
         → "rotate(0deg)" (src/css/layer-catogories.css:165)

- **.lc-category:not(.expanded) sl-icon[name="chevron-down"]**
  transform: "rotate(-90deg)" (src/css-backup-20250604/layer-catogories.css:173)
         → "rotate(-90deg)" (src/css/layer-catogories.css:173)

- **.lc-category-controls**
  width: "100px" (src/css-backup-20250604/layer-catogories.css:178)
         → "96px" (src/css-backup-20250604/layer-catogories.css:422)
  gap: "18px" (src/css-backup-20250604/layer-catogories.css:178)
         → "18px" (src/css-backup-20250604/layer-catogories.css:422)
  justify-content: "flex-end" (src/css-backup-20250604/layer-catogories.css:178)
         → "flex-end" (src/css-backup-20250604/layer-catogories.css:422)
  width: "100px" (src/css-backup-20250604/layer-catogories.css:178)
         → "140px" (src/css-backup-20250604/layer-catogories.css:520)
  gap: "18px" (src/css-backup-20250604/layer-catogories.css:178)
         → "18px" (src/css-backup-20250604/layer-catogories.css:520)
  justify-content: "flex-end" (src/css-backup-20250604/layer-catogories.css:178)
         → "flex-end" (src/css-backup-20250604/layer-catogories.css:520)
  display: "flex" (src/css-backup-20250604/layer-catogories.css:178)
         → "flex" (src/css/layer-catogories.css:178)
  align-items: "center" (src/css-backup-20250604/layer-catogories.css:178)
         → "center" (src/css/layer-catogories.css:178)
  gap: "18px" (src/css-backup-20250604/layer-catogories.css:178)
         → "18px" (src/css/layer-catogories.css:178)
  margin-left: "auto" (src/css-backup-20250604/layer-catogories.css:178)
         → "auto" (src/css/layer-catogories.css:178)
  flex-shrink: "0" (src/css-backup-20250604/layer-catogories.css:178)
         → "0" (src/css/layer-catogories.css:178)
  padding-right: "0" (src/css-backup-20250604/layer-catogories.css:178)
         → "0" (src/css/layer-catogories.css:178)
  width: "100px" (src/css-backup-20250604/layer-catogories.css:178)
         → "100px" (src/css/layer-catogories.css:178)
  justify-content: "flex-end" (src/css-backup-20250604/layer-catogories.css:178)
         → "flex-end" (src/css/layer-catogories.css:178)
  width: "100px" (src/css-backup-20250604/layer-catogories.css:178)
         → "96px" (src/css/layer-catogories.css:422)
  gap: "18px" (src/css-backup-20250604/layer-catogories.css:178)
         → "18px" (src/css/layer-catogories.css:422)
  justify-content: "flex-end" (src/css-backup-20250604/layer-catogories.css:178)
         → "flex-end" (src/css/layer-catogories.css:422)
  min-width: "140px" (src/css-backup-20250604/layer-catogories.css:520)
         → "140px" (src/css/layer-catogories.css:498)
  width: "100px" (src/css-backup-20250604/layer-catogories.css:178)
         → "140px" (src/css/layer-catogories.css:498)
  gap: "18px" (src/css-backup-20250604/layer-catogories.css:178)
         → "18px" (src/css/layer-catogories.css:498)
  justify-content: "flex-end" (src/css-backup-20250604/layer-catogories.css:178)
         → "flex-end" (src/css/layer-catogories.css:498)

- **.lc-feature-controls**
  width: "100px" (src/css-backup-20250604/layer-catogories.css:178)
         → "96px" (src/css-backup-20250604/layer-catogories.css:422)
  gap: "18px" (src/css-backup-20250604/layer-catogories.css:178)
         → "18px" (src/css-backup-20250604/layer-catogories.css:422)
  justify-content: "flex-end" (src/css-backup-20250604/layer-catogories.css:178)
         → "flex-end" (src/css-backup-20250604/layer-catogories.css:422)
  width: "100px" (src/css-backup-20250604/layer-catogories.css:178)
         → "140px" (src/css-backup-20250604/layer-catogories.css:520)
  gap: "18px" (src/css-backup-20250604/layer-catogories.css:178)
         → "18px" (src/css-backup-20250604/layer-catogories.css:520)
  justify-content: "flex-end" (src/css-backup-20250604/layer-catogories.css:178)
         → "flex-end" (src/css-backup-20250604/layer-catogories.css:520)
  display: "flex" (src/css-backup-20250604/layer-catogories.css:178)
         → "flex" (src/css/layer-catogories.css:178)
  align-items: "center" (src/css-backup-20250604/layer-catogories.css:178)
         → "center" (src/css/layer-catogories.css:178)
  gap: "18px" (src/css-backup-20250604/layer-catogories.css:178)
         → "18px" (src/css/layer-catogories.css:178)
  margin-left: "auto" (src/css-backup-20250604/layer-catogories.css:178)
         → "auto" (src/css/layer-catogories.css:178)
  flex-shrink: "0" (src/css-backup-20250604/layer-catogories.css:178)
         → "0" (src/css/layer-catogories.css:178)
  padding-right: "0" (src/css-backup-20250604/layer-catogories.css:178)
         → "0" (src/css/layer-catogories.css:178)
  width: "100px" (src/css-backup-20250604/layer-catogories.css:178)
         → "100px" (src/css/layer-catogories.css:178)
  justify-content: "flex-end" (src/css-backup-20250604/layer-catogories.css:178)
         → "flex-end" (src/css/layer-catogories.css:178)
  width: "100px" (src/css-backup-20250604/layer-catogories.css:178)
         → "96px" (src/css/layer-catogories.css:422)
  gap: "18px" (src/css-backup-20250604/layer-catogories.css:178)
         → "18px" (src/css/layer-catogories.css:422)
  justify-content: "flex-end" (src/css-backup-20250604/layer-catogories.css:178)
         → "flex-end" (src/css/layer-catogories.css:422)
  min-width: "140px" (src/css-backup-20250604/layer-catogories.css:520)
         → "140px" (src/css/layer-catogories.css:498)
  width: "100px" (src/css-backup-20250604/layer-catogories.css:178)
         → "140px" (src/css/layer-catogories.css:498)
  gap: "18px" (src/css-backup-20250604/layer-catogories.css:178)
         → "18px" (src/css/layer-catogories.css:498)
  justify-content: "flex-end" (src/css-backup-20250604/layer-catogories.css:178)
         → "flex-end" (src/css/layer-catogories.css:498)

- **.lc-checkbox-container**
  display: "flex" (src/css-backup-20250604/layer-catogories.css:190)
         → "flex" (src/css/layer-catogories.css:190)
  align-items: "center" (src/css-backup-20250604/layer-catogories.css:190)
         → "center" (src/css/layer-catogories.css:190)
  justify-content: "center" (src/css-backup-20250604/layer-catogories.css:190)
         → "center" (src/css/layer-catogories.css:190)
  width: "32px" (src/css-backup-20250604/layer-catogories.css:190)
         → "32px" (src/css/layer-catogories.css:190)
  height: "32px" (src/css-backup-20250604/layer-catogories.css:190)
         → "32px" (src/css/layer-catogories.css:190)
  flex-shrink: "0" (src/css-backup-20250604/layer-catogories.css:190)
         → "0" (src/css/layer-catogories.css:190)

- **.lc-feature-item**
  padding: "8px 16px" (src/css-backup-20250604/layer-catogories.css:200)
         → "8px 16px" (src/css/layer-catogories.css:200)
  display: "flex" (src/css-backup-20250604/layer-catogories.css:200)
         → "flex" (src/css/layer-catogories.css:200)
  align-items: "center" (src/css-backup-20250604/layer-catogories.css:200)
         → "center" (src/css/layer-catogories.css:200)
  background: "white" (src/css-backup-20250604/layer-catogories.css:200)
         → "white" (src/css/layer-catogories.css:200)
  transition: "background 0.2s" (src/css-backup-20250604/layer-catogories.css:200)
         → "background 0.2s" (src/css/layer-catogories.css:200)
  min-height: "48px" (src/css-backup-20250604/layer-catogories.css:200)
         → "48px" (src/css/layer-catogories.css:200)
  width: "100%" (src/css-backup-20250604/layer-catogories.css:200)
         → "100%" (src/css/layer-catogories.css:200)
  box-sizing: "border-box" (src/css-backup-20250604/layer-catogories.css:200)
         → "border-box" (src/css/layer-catogories.css:200)
  min-width: "0" (src/css-backup-20250604/layer-catogories.css:573)
         → "0" (src/css/layer-catogories.css:544)

- **.lc-feature-item:hover**
  background: "var(--sl-color-neutral-50)" (src/css-backup-20250604/layer-catogories.css:211)
         → "var(--sl-color-neutral-50)" (src/css/layer-catogories.css:211)

- **.lc-feature-content**
  display: "flex" (src/css-backup-20250604/layer-catogories.css:215)
         → "flex" (src/css/layer-catogories.css:215)
  align-items: "center" (src/css-backup-20250604/layer-catogories.css:215)
         → "center" (src/css/layer-catogories.css:215)
  gap: "8px" (src/css-backup-20250604/layer-catogories.css:215)
         → "8px" (src/css/layer-catogories.css:215)
  flex: "1" (src/css-backup-20250604/layer-catogories.css:215)
         → "1" (src/css/layer-catogories.css:215)
  min-width: "0" (src/css-backup-20250604/layer-catogories.css:215)
         → "0" (src/css/layer-catogories.css:215)

- **.lc-feature-content::before**
  content: """" (src/css-backup-20250604/layer-catogories.css:224)
         → """" (src/css/layer-catogories.css:224)
  width: "24px" (src/css-backup-20250604/layer-catogories.css:224)
         → "24px" (src/css/layer-catogories.css:224)
  flex-shrink: "0" (src/css-backup-20250604/layer-catogories.css:224)
         → "0" (src/css/layer-catogories.css:224)
  display: "none" (src/css-backup-20250604/layer-catogories.css:416)
         → "none" (src/css/layer-catogories.css:416)

- **.lc-feature-icon**
  width: "24px" (src/css-backup-20250604/layer-catogories.css:230)
         → "24px" (src/css/layer-catogories.css:230)
  height: "24px" (src/css-backup-20250604/layer-catogories.css:230)
         → "24px" (src/css/layer-catogories.css:230)
  display: "flex" (src/css-backup-20250604/layer-catogories.css:230)
         → "flex" (src/css/layer-catogories.css:230)
  align-items: "center" (src/css-backup-20250604/layer-catogories.css:230)
         → "center" (src/css/layer-catogories.css:230)
  justify-content: "center" (src/css-backup-20250604/layer-catogories.css:230)
         → "center" (src/css/layer-catogories.css:230)
  flex-shrink: "0" (src/css-backup-20250604/layer-catogories.css:230)
         → "0" (src/css/layer-catogories.css:230)

- **.lc-feature-icon.bitmap**
  width: "24px" (src/css-backup-20250604/layer-catogories.css:239)
         → "24px" (src/css/layer-catogories.css:239)
  height: "24px" (src/css-backup-20250604/layer-catogories.css:239)
         → "24px" (src/css/layer-catogories.css:239)
  object-fit: "contain" (src/css-backup-20250604/layer-catogories.css:239)
         → "contain" (src/css/layer-catogories.css:239)

- **.lc-feature-info**
  flex: "1" (src/css-backup-20250604/layer-catogories.css:245)
         → "1" (src/css/layer-catogories.css:245)
  min-width: "0" (src/css-backup-20250604/layer-catogories.css:245)
         → "0" (src/css/layer-catogories.css:245)
  display: "flex" (src/css-backup-20250604/layer-catogories.css:245)
         → "flex" (src/css/layer-catogories.css:245)
  align-items: "center" (src/css-backup-20250604/layer-catogories.css:245)
         → "center" (src/css/layer-catogories.css:245)
  justify-content: "flex-start" (src/css-backup-20250604/layer-catogories.css:245)
         → "flex-start" (src/css/layer-catogories.css:245)

- **.lc-feature-name**
  overflow: "hidden" (src/css-backup-20250604/layer-catogories.css:253)
         → "hidden" (src/css-backup-20250604/layer-catogories.css:580)
  text-overflow: "ellipsis" (src/css-backup-20250604/layer-catogories.css:253)
         → "ellipsis" (src/css-backup-20250604/layer-catogories.css:580)
  white-space: "nowrap" (src/css-backup-20250604/layer-catogories.css:253)
         → "nowrap" (src/css-backup-20250604/layer-catogories.css:580)
  font-size: "16px" (src/css-backup-20250604/layer-catogories.css:253)
         → "16px" (src/css/layer-catogories.css:253)
  color: "var(--sl-color-neutral-900)" (src/css-backup-20250604/layer-catogories.css:253)
         → "var(--sl-color-neutral-900)" (src/css/layer-catogories.css:253)
  white-space: "nowrap" (src/css-backup-20250604/layer-catogories.css:253)
         → "nowrap" (src/css/layer-catogories.css:253)
  overflow: "hidden" (src/css-backup-20250604/layer-catogories.css:253)
         → "hidden" (src/css/layer-catogories.css:253)
  text-overflow: "ellipsis" (src/css-backup-20250604/layer-catogories.css:253)
         → "ellipsis" (src/css/layer-catogories.css:253)
  font-family: ""Roboto", sans-serif" (src/css-backup-20250604/layer-catogories.css:253)
         → ""Roboto", sans-serif" (src/css/layer-catogories.css:253)
  font-weight: "500" (src/css-backup-20250604/layer-catogories.css:253)
         → "500" (src/css/layer-catogories.css:253)
  width: "100%" (src/css-backup-20250604/layer-catogories.css:253)
         → "100%" (src/css/layer-catogories.css:253)
  display: "block" (src/css-backup-20250604/layer-catogories.css:253)
         → "block" (src/css/layer-catogories.css:253)
  text-align: "left" (src/css-backup-20250604/layer-catogories.css:253)
         → "left" (src/css/layer-catogories.css:253)
  overflow: "hidden" (src/css-backup-20250604/layer-catogories.css:253)
         → "hidden" (src/css/layer-catogories.css:551)
  text-overflow: "ellipsis" (src/css-backup-20250604/layer-catogories.css:253)
         → "ellipsis" (src/css/layer-catogories.css:551)
  white-space: "nowrap" (src/css-backup-20250604/layer-catogories.css:253)
         → "nowrap" (src/css/layer-catogories.css:551)

- **.lc-feature-icon.point**
  width: "20px" (src/css-backup-20250604/layer-catogories.css:267)
         → "20px" (src/css/layer-catogories.css:267)
  height: "20px" (src/css-backup-20250604/layer-catogories.css:267)
         → "20px" (src/css/layer-catogories.css:267)
  border-radius: "50%" (src/css-backup-20250604/layer-catogories.css:267)
         → "50%" (src/css/layer-catogories.css:267)
  border: "2px solid #333" (src/css-backup-20250604/layer-catogories.css:267)
         → "2px solid #333" (src/css/layer-catogories.css:267)

- **.lc-feature-icon.line**
  width: "24px" (src/css-backup-20250604/layer-catogories.css:274)
         → "24px" (src/css/layer-catogories.css:274)
  height: "4px" (src/css-backup-20250604/layer-catogories.css:274)
         → "4px" (src/css/layer-catogories.css:274)
  background-color: "#333" (src/css-backup-20250604/layer-catogories.css:274)
         → "#333" (src/css/layer-catogories.css:274)
  border-radius: "2px" (src/css-backup-20250604/layer-catogories.css:274)
         → "2px" (src/css/layer-catogories.css:274)

- **.lc-feature-icon.polygon**
  width: "20px" (src/css-backup-20250604/layer-catogories.css:281)
         → "20px" (src/css/layer-catogories.css:281)
  height: "20px" (src/css-backup-20250604/layer-catogories.css:281)
         → "20px" (src/css/layer-catogories.css:281)
  border: "3px solid #333" (src/css-backup-20250604/layer-catogories.css:281)
         → "3px solid #333" (src/css/layer-catogories.css:281)
  border-radius: "4px" (src/css-backup-20250604/layer-catogories.css:281)
         → "4px" (src/css/layer-catogories.css:281)

- **sl-checkbox::part(base)**
  --sl-input-height-small: "18px" (src/css-backup-20250604/layer-catogories.css:289)
         → "18px" (src/css/layer-catogories.css:289)

- **sl-checkbox::part(control)**
  width: "18px" (src/css-backup-20250604/layer-catogories.css:293)
         → "18px" (src/css/layer-catogories.css:293)
  height: "18px" (src/css-backup-20250604/layer-catogories.css:293)
         → "18px" (src/css/layer-catogories.css:293)
  background-color: "white" (src/css-backup-20250604/layer-catogories.css:293)
         → "white" (src/css/layer-catogories.css:293)
  border: "1px solid var(--sl-color-neutral-400)" (src/css-backup-20250604/layer-catogories.css:293)
         → "1px solid var(--sl-color-neutral-400)" (src/css/layer-catogories.css:293)
  transition: "background-color 0.2s, border-color 0.2s" (src/css-backup-20250604/layer-catogories.css:293)
         → "background-color 0.2s, border-color 0.2s" (src/css/layer-catogories.css:293)

- **sl-checkbox[checked]::part(control)**
  background-color: "white" (src/css-backup-20250604/layer-catogories.css:302)
         → "white" (src/css/layer-catogories.css:302)
  border-color: "var(--geolantis-blue, #4682b4)" (src/css-backup-20250604/layer-catogories.css:302)
         → "var(--geolantis-blue, #4682b4)" (src/css/layer-catogories.css:302)

- **sl-checkbox[checked] svg**
  display: "none" (src/css-backup-20250604/layer-catogories.css:308)
         → "none" (src/css/layer-catogories.css:308)

- **sl-checkbox[checked]::part(control)::after**
  content: """" (src/css-backup-20250604/layer-catogories.css:313)
         → """" (src/css/layer-catogories.css:313)
  position: "absolute" (src/css-backup-20250604/layer-catogories.css:313)
         → "absolute" (src/css/layer-catogories.css:313)
  left: "4px" (src/css-backup-20250604/layer-catogories.css:313)
         → "4px" (src/css/layer-catogories.css:313)
  top: "1px" (src/css-backup-20250604/layer-catogories.css:313)
         → "1px" (src/css/layer-catogories.css:313)
  width: "6px" (src/css-backup-20250604/layer-catogories.css:313)
         → "6px" (src/css/layer-catogories.css:313)
  height: "10px" (src/css-backup-20250604/layer-catogories.css:313)
         → "10px" (src/css/layer-catogories.css:313)
  border: "solid var(--geolantis-blue, #4682b4)" (src/css-backup-20250604/layer-catogories.css:313)
         → "solid var(--geolantis-blue, #4682b4)" (src/css/layer-catogories.css:313)
  border-width: "0 3px 3px 0" (src/css-backup-20250604/layer-catogories.css:313)
         → "0 3px 3px 0" (src/css/layer-catogories.css:313)
  transform: "rotate(45deg)" (src/css-backup-20250604/layer-catogories.css:313)
         → "rotate(45deg)" (src/css/layer-catogories.css:313)
  opacity: "1" (src/css-backup-20250604/layer-catogories.css:313)
         → "1" (src/css/layer-catogories.css:313)

- **sl-icon-button::part(base)**
  height: "32px" (src/css-backup-20250604/layer-catogories.css:327)
         → "32px" (src/css/layer-catogories.css:327)
  width: "32px" (src/css-backup-20250604/layer-catogories.css:327)
         → "32px" (src/css/layer-catogories.css:327)
  align-items: "center" (src/css-backup-20250604/layer-catogories.css:327)
         → "center" (src/css/layer-catogories.css:327)
  justify-content: "center" (src/css-backup-20250604/layer-catogories.css:327)
         → "center" (src/css/layer-catogories.css:327)
  color: "var(--sl-color-neutral-600)" (src/css-backup-20250604/layer-catogories.css:327)
         → "var(--sl-color-neutral-600)" (src/css/layer-catogories.css:327)

- **sl-icon-button::part(base):hover**
  color: "var(--geolantis-blue)" (src/css-backup-20250604/layer-catogories.css:336)
         → "var(--geolantis-blue)" (src/css/layer-catogories.css:336)

- **.lc-feature-list**
  display: "none" (src/css-backup-20250604/layer-catogories.css:341)
         → "none" (src/css/layer-catogories.css:341)
  overflow: "hidden" (src/css-backup-20250604/layer-catogories.css:341)
         → "hidden" (src/css/layer-catogories.css:341)
  transition: "max-height 0.3s ease" (src/css-backup-20250604/layer-catogories.css:341)
         → "max-height 0.3s ease" (src/css/layer-catogories.css:341)
  width: "100%" (src/css-backup-20250604/layer-catogories.css:341)
         → "100%" (src/css/layer-catogories.css:341)

- **.lc-feature-list.expanded**
  display: "block" (src/css-backup-20250604/layer-catogories.css:348)
         → "block" (src/css/layer-catogories.css:348)

- **.lc-checkbox-label**
  display: "none" (src/css-backup-20250604/layer-catogories.css:353)
         → "none" (src/css/layer-catogories.css:353)

- **#expandCollapseAll**
  border: "1px solid var(--sl-color-neutral-300)" (src/css-backup-20250604/layer-catogories.css:363)
         → "none" (src/css-backup-20250604/layer-catogories.css:431)
  box-shadow: "none" (src/css-backup-20250604/layer-catogories.css:363)
         → "none" (src/css-backup-20250604/layer-catogories.css:431)
  font-size: "12px" (src/css-backup-20250604/layer-catogories.css:363)
         → "13px" (src/css-backup-20250604/layer-catogories.css:431)
  padding: "4px 8px" (src/css-backup-20250604/layer-catogories.css:363)
         → "2px 6px" (src/css-backup-20250604/layer-catogories.css:431)
  margin-left: "10px" (src/css-backup-20250604/layer-catogories.css:431)
         → "0" (src/css-backup-20250604/layer-catogories.css:444)
  margin-left: "10px" (src/css-backup-20250604/layer-catogories.css:431)
         → "0" (src/css-backup-20250604/layer-catogories.css:468)
  margin-left: "10px" (src/css-backup-20250604/layer-catogories.css:431)
         → "0" (src/css-backup-20250604/layer-catogories.css:510)
  background: "transparent" (src/css-backup-20250604/layer-catogories.css:431)
         → "transparent" (src/css-backup-20250604/layer-catogories.css:510)
  border: "1px solid var(--sl-color-neutral-300)" (src/css-backup-20250604/layer-catogories.css:363)
         → "none" (src/css-backup-20250604/layer-catogories.css:510)
  box-shadow: "none" (src/css-backup-20250604/layer-catogories.css:363)
         → "none" (src/css-backup-20250604/layer-catogories.css:510)
  font-size: "12px" (src/css-backup-20250604/layer-catogories.css:363)
         → "13px" (src/css-backup-20250604/layer-catogories.css:510)
  padding: "4px 8px" (src/css-backup-20250604/layer-catogories.css:363)
         → "2px 6px" (src/css-backup-20250604/layer-catogories.css:510)
  --sl-color-neutral-0: "var(--sl-color-neutral-500)" (src/css-backup-20250604/layer-catogories.css:363)
         → "var(--sl-color-neutral-500)" (src/css/layer-catogories.css:363)
  --sl-color-neutral-700: "var(--sl-color-neutral-700)" (src/css-backup-20250604/layer-catogories.css:363)
         → "var(--sl-color-neutral-700)" (src/css/layer-catogories.css:363)
  --sl-input-border-color: "transparent" (src/css-backup-20250604/layer-catogories.css:363)
         → "transparent" (src/css/layer-catogories.css:363)
  background-color: "var(--sl-color-neutral-200)" (src/css-backup-20250604/layer-catogories.css:363)
         → "var(--sl-color-neutral-200)" (src/css/layer-catogories.css:363)
  color: "var(--sl-color-neutral-700)" (src/css-backup-20250604/layer-catogories.css:363)
         → "var(--sl-color-neutral-700)" (src/css/layer-catogories.css:363)
  border: "1px solid var(--sl-color-neutral-300)" (src/css-backup-20250604/layer-catogories.css:363)
         → "1px solid var(--sl-color-neutral-300)" (src/css/layer-catogories.css:363)
  font-size: "12px" (src/css-backup-20250604/layer-catogories.css:363)
         → "12px" (src/css/layer-catogories.css:363)
  padding: "4px 8px" (src/css-backup-20250604/layer-catogories.css:363)
         → "4px 8px" (src/css/layer-catogories.css:363)
  height: "24px" (src/css-backup-20250604/layer-catogories.css:363)
         → "24px" (src/css/layer-catogories.css:363)
  min-width: "80px" (src/css-backup-20250604/layer-catogories.css:363)
         → "80px" (src/css/layer-catogories.css:363)
  box-shadow: "none" (src/css-backup-20250604/layer-catogories.css:363)
         → "none" (src/css/layer-catogories.css:363)
  outline: "none" (src/css-backup-20250604/layer-catogories.css:363)
         → "none" (src/css/layer-catogories.css:363)
  margin-left: "10px" (src/css-backup-20250604/layer-catogories.css:431)
         → "10px" (src/css/layer-catogories.css:431)
  background: "transparent" (src/css-backup-20250604/layer-catogories.css:431)
         → "transparent" (src/css/layer-catogories.css:431)
  border: "1px solid var(--sl-color-neutral-300)" (src/css-backup-20250604/layer-catogories.css:363)
         → "none" (src/css/layer-catogories.css:431)
  box-shadow: "none" (src/css-backup-20250604/layer-catogories.css:363)
         → "none" (src/css/layer-catogories.css:431)
  font-size: "12px" (src/css-backup-20250604/layer-catogories.css:363)
         → "13px" (src/css/layer-catogories.css:431)
  padding: "4px 8px" (src/css-backup-20250604/layer-catogories.css:363)
         → "2px 6px" (src/css/layer-catogories.css:431)
  margin-left: "10px" (src/css-backup-20250604/layer-catogories.css:431)
         → "0" (src/css/layer-catogories.css:444)
  margin-left: "10px" (src/css-backup-20250604/layer-catogories.css:431)
         → "0" (src/css/layer-catogories.css:488)
  background: "transparent" (src/css-backup-20250604/layer-catogories.css:431)
         → "transparent" (src/css/layer-catogories.css:488)
  border: "1px solid var(--sl-color-neutral-300)" (src/css-backup-20250604/layer-catogories.css:363)
         → "none" (src/css/layer-catogories.css:488)
  box-shadow: "none" (src/css-backup-20250604/layer-catogories.css:363)
         → "none" (src/css/layer-catogories.css:488)
  font-size: "12px" (src/css-backup-20250604/layer-catogories.css:363)
         → "13px" (src/css/layer-catogories.css:488)
  padding: "4px 8px" (src/css-backup-20250604/layer-catogories.css:363)
         → "2px 6px" (src/css/layer-catogories.css:488)

- **#expandCollapseAll::part(base)**
  background-color: "var(--sl-color-neutral-200)" (src/css-backup-20250604/layer-catogories.css:378)
         → "var(--sl-color-neutral-200)" (src/css/layer-catogories.css:378)
  color: "var(--sl-color-neutral-700)" (src/css-backup-20250604/layer-catogories.css:378)
         → "var(--sl-color-neutral-700)" (src/css/layer-catogories.css:378)
  border: "1px solid var(--sl-color-neutral-300)" (src/css-backup-20250604/layer-catogories.css:378)
         → "1px solid var(--sl-color-neutral-300)" (src/css/layer-catogories.css:378)
  box-shadow: "none" (src/css-backup-20250604/layer-catogories.css:378)
         → "none" (src/css/layer-catogories.css:378)
  outline: "none" (src/css-backup-20250604/layer-catogories.css:378)
         → "none" (src/css/layer-catogories.css:378)

- **#expandCollapseAll::part(base):hover**
  background-color: "var(--sl-color-neutral-300)" (src/css-backup-20250604/layer-catogories.css:386)
         → "var(--sl-color-neutral-300)" (src/css/layer-catogories.css:386)
  box-shadow: "none" (src/css-backup-20250604/layer-catogories.css:386)
         → "none" (src/css/layer-catogories.css:386)

- **#expandCollapseAll::part(base):focus**
  box-shadow: "none" (src/css-backup-20250604/layer-catogories.css:391)
         → "none" (src/css/layer-catogories.css:391)
  outline: "none" (src/css-backup-20250604/layer-catogories.css:391)
         → "none" (src/css/layer-catogories.css:391)

- **#expandCollapseAll:hover**
  background: "var(--sl-color-neutral-100)" (src/css-backup-20250604/layer-catogories.css:440)
         → "var(--sl-color-neutral-100)" (src/css/layer-catogories.css:440)

- **.lc-layer-controls-master::after**
  content: """" (src/css-backup-20250604/layer-catogories.css:484)
         → """" (src/css-backup-20250604/layer-catogories.css:528)
  width: "32px" (src/css-backup-20250604/layer-catogories.css:484)
         → "32px" (src/css-backup-20250604/layer-catogories.css:528)
  height: "32px" (src/css-backup-20250604/layer-catogories.css:484)
         → "32px" (src/css-backup-20250604/layer-catogories.css:528)
  flex-shrink: "0" (src/css-backup-20250604/layer-catogories.css:484)
         → "0" (src/css-backup-20250604/layer-catogories.css:528)
  content: """" (src/css-backup-20250604/layer-catogories.css:484)
         → """" (src/css/layer-catogories.css:472)
  width: "32px" (src/css-backup-20250604/layer-catogories.css:484)
         → "32px" (src/css/layer-catogories.css:472)
  height: "32px" (src/css-backup-20250604/layer-catogories.css:484)
         → "32px" (src/css/layer-catogories.css:472)
  flex-shrink: "0" (src/css-backup-20250604/layer-catogories.css:484)
         → "0" (src/css/layer-catogories.css:472)

- **.lc-category-controls sl-icon-button::part(base)**
  width: "36px" (src/css-backup-20250604/layer-catogories.css:542)
         → "36px" (src/css/layer-catogories.css:513)
  height: "36px" (src/css-backup-20250604/layer-catogories.css:542)
         → "36px" (src/css/layer-catogories.css:513)
  background: "var(--sl-color-neutral-100)" (src/css-backup-20250604/layer-catogories.css:542)
         → "var(--sl-color-neutral-100)" (src/css/layer-catogories.css:513)
  color: "var(--sl-color-neutral-600)" (src/css-backup-20250604/layer-catogories.css:542)
         → "var(--sl-color-neutral-600)" (src/css/layer-catogories.css:513)
  border-radius: "50%" (src/css-backup-20250604/layer-catogories.css:542)
         → "50%" (src/css/layer-catogories.css:513)

- **.lc-feature-controls sl-icon-button::part(base)**
  width: "36px" (src/css-backup-20250604/layer-catogories.css:542)
         → "36px" (src/css/layer-catogories.css:513)
  height: "36px" (src/css-backup-20250604/layer-catogories.css:542)
         → "36px" (src/css/layer-catogories.css:513)
  background: "var(--sl-color-neutral-100)" (src/css-backup-20250604/layer-catogories.css:542)
         → "var(--sl-color-neutral-100)" (src/css/layer-catogories.css:513)
  color: "var(--sl-color-neutral-600)" (src/css-backup-20250604/layer-catogories.css:542)
         → "var(--sl-color-neutral-600)" (src/css/layer-catogories.css:513)
  border-radius: "50%" (src/css-backup-20250604/layer-catogories.css:542)
         → "50%" (src/css/layer-catogories.css:513)

- **sl-checkbox::part(label)**
  user-select: "none" (src/css-backup-20250604/layer-catogories.css:552)
         → "none" (src/css/layer-catogories.css:523)
  -webkit-user-select: "none" (src/css-backup-20250604/layer-catogories.css:552)
         → "none" (src/css/layer-catogories.css:523)
  -moz-user-select: "none" (src/css-backup-20250604/layer-catogories.css:552)
         → "none" (src/css/layer-catogories.css:523)
  -ms-user-select: "none" (src/css-backup-20250604/layer-catogories.css:552)
         → "none" (src/css/layer-catogories.css:523)

- **sl-switch::part(label)**
  user-select: "none" (src/css-backup-20250604/layer-catogories.css:552)
         → "none" (src/css/layer-catogories.css:523)
  -webkit-user-select: "none" (src/css-backup-20250604/layer-catogories.css:552)
         → "none" (src/css/layer-catogories.css:523)
  -moz-user-select: "none" (src/css-backup-20250604/layer-catogories.css:552)
         → "none" (src/css/layer-catogories.css:523)
  -ms-user-select: "none" (src/css-backup-20250604/layer-catogories.css:552)
         → "none" (src/css/layer-catogories.css:523)

- **sl-radio::part(label)**
  user-select: "none" (src/css-backup-20250604/layer-catogories.css:552)
         → "none" (src/css/layer-catogories.css:523)
  -webkit-user-select: "none" (src/css-backup-20250604/layer-catogories.css:552)
         → "none" (src/css/layer-catogories.css:523)
  -moz-user-select: "none" (src/css-backup-20250604/layer-catogories.css:552)
         → "none" (src/css/layer-catogories.css:523)
  -ms-user-select: "none" (src/css-backup-20250604/layer-catogories.css:552)
         → "none" (src/css/layer-catogories.css:523)

- **sl-toggle::part(label)**
  user-select: "none" (src/css-backup-20250604/layer-catogories.css:552)
         → "none" (src/css/layer-catogories.css:523)
  -webkit-user-select: "none" (src/css-backup-20250604/layer-catogories.css:552)
         → "none" (src/css/layer-catogories.css:523)
  -moz-user-select: "none" (src/css-backup-20250604/layer-catogories.css:552)
         → "none" (src/css/layer-catogories.css:523)
  -ms-user-select: "none" (src/css-backup-20250604/layer-catogories.css:552)
         → "none" (src/css/layer-catogories.css:523)

- **.no-select**
  user-select: "none" (src/css-backup-20250604/layer-catogories.css:564)
         → "none" (src/css/layer-catogories.css:535)
  -webkit-user-select: "none" (src/css-backup-20250604/layer-catogories.css:564)
         → "none" (src/css/layer-catogories.css:535)
  -moz-user-select: "none" (src/css-backup-20250604/layer-catogories.css:564)
         → "none" (src/css/layer-catogories.css:535)
  -ms-user-select: "none" (src/css-backup-20250604/layer-catogories.css:564)
         → "none" (src/css/layer-catogories.css:535)

- **#left1-drawer sl-tab-group[placement="start"]**
  height: "calc(100% - 0px)" (src/css-backup-20250604/drawer-tabs.css:7)
         → "calc(100% - 0px)" (src/css-backup-20250604/drawer-tabs.css:334)
  display: "flex" (src/css-backup-20250604/drawer-tabs.css:7)
         → "flex" (src/css-backup-20250604/drawer-tabs.css:334)
  margin-top: "0px" (src/css-backup-20250604/drawer-tabs.css:7)
         → "0px" (src/css-backup-20250604/drawer-tabs.css:334)

- **#left2-drawer sl-tab-group[placement="start"]**
  height: "calc(100% - 0px)" (src/css-backup-20250604/drawer-tabs.css:7)
         → "calc(100% - 0px)" (src/css-backup-20250604/drawer-tabs.css:334)
  display: "flex" (src/css-backup-20250604/drawer-tabs.css:7)
         → "flex" (src/css-backup-20250604/drawer-tabs.css:334)
  margin-top: "0px" (src/css-backup-20250604/drawer-tabs.css:7)
         → "0px" (src/css-backup-20250604/drawer-tabs.css:334)

- **#left1-drawer sl-tab-panel**
  padding: "0" (src/css-backup-20250604/drawer-tabs.css:81)
         → "0" (src/css-backup-20250604/drawer-tabs.css:304)
  height: "100%" (src/css-backup-20250604/drawer-tabs.css:81)
         → "100%" (src/css-backup-20250604/drawer-tabs.css:304)
  overflow-y: "auto" (src/css-backup-20250604/drawer-tabs.css:81)
         → "auto" (src/css-backup-20250604/drawer-tabs.css:304)
  width: "100%" (src/css-backup-20250604/drawer-tabs.css:81)
         → "100%" (src/css-backup-20250604/drawer-tabs.css:304)
  flex: "1" (src/css-backup-20250604/drawer-tabs.css:81)
         → "1" (src/css-backup-20250604/drawer-tabs.css:304)

- **#left2-drawer sl-tab-panel**
  padding: "0" (src/css-backup-20250604/drawer-tabs.css:81)
         → "0" (src/css-backup-20250604/drawer-tabs.css:304)
  height: "100%" (src/css-backup-20250604/drawer-tabs.css:81)
         → "100%" (src/css-backup-20250604/drawer-tabs.css:304)
  overflow-y: "auto" (src/css-backup-20250604/drawer-tabs.css:81)
         → "auto" (src/css-backup-20250604/drawer-tabs.css:304)
  width: "100%" (src/css-backup-20250604/drawer-tabs.css:81)
         → "100%" (src/css-backup-20250604/drawer-tabs.css:304)
  flex: "1" (src/css-backup-20250604/drawer-tabs.css:81)
         → "1" (src/css-backup-20250604/drawer-tabs.css:304)

- **#left1-drawer sl-tab-panel .controls**
  padding: "0" (src/css-backup-20250604/drawer-tabs.css:103)
         → "0 var(--spacing-md, 0.75rem)" (src/css-backup-20250604/drawer-tabs.css:326)

- **#left2-drawer sl-tab-panel .controls**
  padding: "0" (src/css-backup-20250604/drawer-tabs.css:103)
         → "0 var(--spacing-md, 0.75rem)" (src/css-backup-20250604/drawer-tabs.css:326)

- **#left1-drawer .sidebar-content**
  height: "100%" (src/css-backup-20250604/drawer-tabs.css:110)
         → "100%" (src/css-backup-20250604/drawer-tabs.css:387)
  padding: "0" (src/css-backup-20250604/drawer-tabs.css:110)
         → "0" (src/css-backup-20250604/drawer-tabs.css:387)
  display: "flex" (src/css-backup-20250604/drawer-tabs.css:110)
         → "flex" (src/css-backup-20250604/drawer-tabs.css:387)
  flex-direction: "column" (src/css-backup-20250604/drawer-tabs.css:110)
         → "column" (src/css-backup-20250604/drawer-tabs.css:387)
  padding: "0" (src/css-backup-20250604/drawer-tabs.css:110)
         → "15px" (src/css/styles.css:1849)
  scrollbar-width: "none" (src/css/styles.css:1849)
         → "none" (src/css/styles.css:1874)
  -ms-overflow-style: "none" (src/css/styles.css:1849)
         → "none" (src/css/styles.css:1874)

- **#left2-drawer .sidebar-content**
  height: "100%" (src/css-backup-20250604/drawer-tabs.css:110)
         → "100%" (src/css-backup-20250604/drawer-tabs.css:387)
  padding: "0" (src/css-backup-20250604/drawer-tabs.css:110)
         → "0" (src/css-backup-20250604/drawer-tabs.css:387)
  display: "flex" (src/css-backup-20250604/drawer-tabs.css:110)
         → "flex" (src/css-backup-20250604/drawer-tabs.css:387)
  flex-direction: "column" (src/css-backup-20250604/drawer-tabs.css:110)
         → "column" (src/css-backup-20250604/drawer-tabs.css:387)
  padding: "0" (src/css-backup-20250604/drawer-tabs.css:110)
         → "15px" (src/css/styles.css:1849)
  scrollbar-width: "none" (src/css/styles.css:1849)
         → "none" (src/css/styles.css:1874)
  -ms-overflow-style: "none" (src/css/styles.css:1849)
         → "none" (src/css/styles.css:1874)

- **#left2-drawer sl-switch**
  width: "100%" (src/css-backup-20250604/drawer-tabs.css:156)
         → "100%" (src/css-backup-20250604/drawer-tabs.css:343)
  padding: "var(--spacing-sm, 0.5rem) var(--spacing-md, 0.75rem)" (src/css-backup-20250604/drawer-tabs.css:156)
         → "var(--spacing-sm, 0.5rem) var(--spacing-md, 0.75rem)" (src/css-backup-20250604/drawer-tabs.css:343)
  background: "white" (src/css-backup-20250604/drawer-tabs.css:156)
         → "white" (src/css-backup-20250604/drawer-tabs.css:343)
  transition: "background-color 0.2s" (src/css-backup-20250604/drawer-tabs.css:156)
         → "background-color 0.2s" (src/css-backup-20250604/drawer-tabs.css:343)
  margin: "0" (src/css-backup-20250604/drawer-tabs.css:156)
         → "0" (src/css-backup-20250604/drawer-tabs.css:343)
  border-radius: "var(--spacing-xs, 0.25rem)" (src/css-backup-20250604/drawer-tabs.css:156)
         → "var(--spacing-xs, 0.25rem)" (src/css-backup-20250604/drawer-tabs.css:343)
  width: "100%" (src/css-backup-20250604/drawer-tabs.css:156)
         → "100%" (src/css/drawer-tabs.css:96)

- **#left2-drawer sl-switch:hover**
  background-color: "var(--sl-color-neutral-50)" (src/css-backup-20250604/drawer-tabs.css:165)
         → "rgba(70, 130, 180, 0.1)" (src/css/drawer-tabs.css:100)

- **#left2-drawer sl-switch::part(base)**
  width: "100%" (src/css-backup-20250604/drawer-tabs.css:169)
         → "100%" (src/css-backup-20250604/drawer-tabs.css:354)
  display: "flex" (src/css-backup-20250604/drawer-tabs.css:169)
         → "flex" (src/css-backup-20250604/drawer-tabs.css:354)
  justify-content: "flex-start" (src/css-backup-20250604/drawer-tabs.css:169)
         → "space-between" (src/css-backup-20250604/drawer-tabs.css:354)
  align-items: "center" (src/css-backup-20250604/drawer-tabs.css:169)
         → "center" (src/css-backup-20250604/drawer-tabs.css:354)
  gap: "var(--spacing-md, 0.75rem)" (src/css-backup-20250604/drawer-tabs.css:169)
         → "var(--spacing-md, 0.75rem)" (src/css-backup-20250604/drawer-tabs.css:354)
  width: "100%" (src/css-backup-20250604/drawer-tabs.css:169)
         → "100%" (src/css/drawer-tabs.css:104)
  display: "flex" (src/css-backup-20250604/drawer-tabs.css:169)
         → "flex" (src/css/drawer-tabs.css:104)
  justify-content: "flex-start" (src/css-backup-20250604/drawer-tabs.css:169)
         → "space-between" (src/css/drawer-tabs.css:104)
  align-items: "center" (src/css-backup-20250604/drawer-tabs.css:169)
         → "center" (src/css/drawer-tabs.css:104)

- **#left2-drawer sl-switch::part(label)**
  font-size: "var(--font-sm, 0.875rem)" (src/css-backup-20250604/drawer-tabs.css:177)
         → "var(--font-sm, 0.875rem)" (src/css/drawer-tabs.css:112)
  color: "#333" (src/css-backup-20250604/drawer-tabs.css:177)
         → "#333" (src/css/drawer-tabs.css:112)
  text-align: "left" (src/css-backup-20250604/drawer-tabs.css:177)
         → "left" (src/css/drawer-tabs.css:112)

- **#left2-drawer .settings-buttons**
  display: "flex" (src/css-backup-20250604/drawer-tabs.css:208)
         → "flex" (src/css-backup-20250604/drawer-tabs.css:363)
  justify-content: "space-between" (src/css-backup-20250604/drawer-tabs.css:208)
         → "space-between" (src/css-backup-20250604/drawer-tabs.css:363)
  margin: "var(--spacing-sm, 0.5rem) 0" (src/css-backup-20250604/drawer-tabs.css:208)
         → "var(--spacing-sm, 0.5rem) 0" (src/css-backup-20250604/drawer-tabs.css:363)
  gap: "var(--spacing-sm, 0.5rem)" (src/css-backup-20250604/drawer-tabs.css:208)
         → "var(--spacing-sm, 0.5rem)" (src/css-backup-20250604/drawer-tabs.css:363)

- **#left1-drawer sl-tab-group::part(body)**
  flex: "1 1 auto" (src/css-backup-20250604/drawer-tabs.css:281)
         → "1 1 auto" (src/css-backup-20250604/drawer-tabs.css:296)
  min-width: "0" (src/css-backup-20250604/drawer-tabs.css:281)
         → "0" (src/css-backup-20250604/drawer-tabs.css:296)
  flex: "1 1 auto" (src/css-backup-20250604/drawer-tabs.css:281)
         → "1 1 auto" (src/css-backup-20250604/drawer-tabs.css:316)
  min-width: "0" (src/css-backup-20250604/drawer-tabs.css:281)
         → "0" (src/css-backup-20250604/drawer-tabs.css:316)
  overflow: "auto" (src/css-backup-20250604/drawer-tabs.css:281)
         → "auto" (src/css-backup-20250604/drawer-tabs.css:316)
  box-sizing: "border-box" (src/css-backup-20250604/drawer-tabs.css:281)
         → "border-box" (src/css-backup-20250604/drawer-tabs.css:316)
  flex: "1 1 auto" (src/css-backup-20250604/drawer-tabs.css:281)
         → "1 0 auto" (src/css-backup-20250604/drawer-tabs.css:405)
  width: "100%" (src/css-backup-20250604/drawer-tabs.css:316)
         → "100%" (src/css-backup-20250604/drawer-tabs.css:405)
  min-width: "0" (src/css-backup-20250604/drawer-tabs.css:281)
         → "0" (src/css-backup-20250604/drawer-tabs.css:405)
  overflow: "auto" (src/css-backup-20250604/drawer-tabs.css:281)
         → "auto" (src/css-backup-20250604/drawer-tabs.css:405)
  box-sizing: "border-box" (src/css-backup-20250604/drawer-tabs.css:281)
         → "border-box" (src/css-backup-20250604/drawer-tabs.css:405)

- **#left2-drawer sl-tab-group::part(body)**
  flex: "1 1 auto" (src/css-backup-20250604/drawer-tabs.css:281)
         → "1 1 auto" (src/css-backup-20250604/drawer-tabs.css:296)
  min-width: "0" (src/css-backup-20250604/drawer-tabs.css:281)
         → "0" (src/css-backup-20250604/drawer-tabs.css:296)
  flex: "1 1 auto" (src/css-backup-20250604/drawer-tabs.css:281)
         → "1 1 auto" (src/css-backup-20250604/drawer-tabs.css:316)
  min-width: "0" (src/css-backup-20250604/drawer-tabs.css:281)
         → "0" (src/css-backup-20250604/drawer-tabs.css:316)
  overflow: "auto" (src/css-backup-20250604/drawer-tabs.css:281)
         → "auto" (src/css-backup-20250604/drawer-tabs.css:316)
  box-sizing: "border-box" (src/css-backup-20250604/drawer-tabs.css:281)
         → "border-box" (src/css-backup-20250604/drawer-tabs.css:316)
  flex: "1 1 auto" (src/css-backup-20250604/drawer-tabs.css:281)
         → "1 0 auto" (src/css-backup-20250604/drawer-tabs.css:405)
  width: "100%" (src/css-backup-20250604/drawer-tabs.css:316)
         → "100%" (src/css-backup-20250604/drawer-tabs.css:405)
  min-width: "0" (src/css-backup-20250604/drawer-tabs.css:281)
         → "0" (src/css-backup-20250604/drawer-tabs.css:405)
  overflow: "auto" (src/css-backup-20250604/drawer-tabs.css:281)
         → "auto" (src/css-backup-20250604/drawer-tabs.css:405)
  box-sizing: "border-box" (src/css-backup-20250604/drawer-tabs.css:281)
         → "border-box" (src/css-backup-20250604/drawer-tabs.css:405)

- **.button-size-small .sidebar-toggle**
  width: "1.8em" (src/css-backup-20250604/button-themes.css:14)
         → "1.8em" (src/css/button-themes.css:9)
  height: "1.8em" (src/css-backup-20250604/button-themes.css:14)
         → "1.8em" (src/css/button-themes.css:9)

- **.button-size-small .maplibregl-ctrl button**
  width: "1.8em" (src/css-backup-20250604/button-themes.css:14)
         → "1.8em" (src/css/button-themes.css:9)
  height: "1.8em" (src/css-backup-20250604/button-themes.css:14)
         → "1.8em" (src/css/button-themes.css:9)

- **.button-size-medium .sidebar-toggle**
  width: "2.3em" (src/css-backup-20250604/button-themes.css:20)
         → "2.3em" (src/css/button-themes.css:15)
  height: "2.3em" (src/css-backup-20250604/button-themes.css:20)
         → "2.3em" (src/css/button-themes.css:15)

- **.button-size-medium .maplibregl-ctrl button**
  width: "2.3em" (src/css-backup-20250604/button-themes.css:20)
         → "2.3em" (src/css/button-themes.css:15)
  height: "2.3em" (src/css-backup-20250604/button-themes.css:20)
         → "2.3em" (src/css/button-themes.css:15)

- **.button-size-large .sidebar-toggle**
  width: "2.8em" (src/css-backup-20250604/button-themes.css:26)
         → "2.8em" (src/css/button-themes.css:21)
  height: "2.8em" (src/css-backup-20250604/button-themes.css:26)
         → "2.8em" (src/css/button-themes.css:21)

- **.button-size-large .maplibregl-ctrl button**
  width: "2.8em" (src/css-backup-20250604/button-themes.css:26)
         → "2.8em" (src/css/button-themes.css:21)
  height: "2.8em" (src/css-backup-20250604/button-themes.css:26)
         → "2.8em" (src/css/button-themes.css:21)

- **.button-size-small .sidebar-toggle svg**
  width: "20px" (src/css-backup-20250604/button-themes.css:33)
         → "20px" (src/css/button-themes.css:28)
  height: "20px" (src/css-backup-20250604/button-themes.css:33)
         → "20px" (src/css/button-themes.css:28)
  font-size: "20px" (src/css-backup-20250604/button-themes.css:33)
         → "20px" (src/css/button-themes.css:28)

- **.button-size-small .maplibregl-ctrl button svg**
  width: "20px" (src/css-backup-20250604/button-themes.css:33)
         → "20px" (src/css/button-themes.css:28)
  height: "20px" (src/css-backup-20250604/button-themes.css:33)
         → "20px" (src/css/button-themes.css:28)
  font-size: "20px" (src/css-backup-20250604/button-themes.css:33)
         → "20px" (src/css/button-themes.css:28)

- **.button-size-small .maplibregl-ctrl-icon:before**
  width: "20px" (src/css-backup-20250604/button-themes.css:33)
         → "20px" (src/css/button-themes.css:28)
  height: "20px" (src/css-backup-20250604/button-themes.css:33)
         → "20px" (src/css/button-themes.css:28)
  font-size: "20px" (src/css-backup-20250604/button-themes.css:33)
         → "20px" (src/css/button-themes.css:28)

- **.button-size-medium .sidebar-toggle svg**
  width: "24px" (src/css-backup-20250604/button-themes.css:41)
         → "24px" (src/css/button-themes.css:36)
  height: "24px" (src/css-backup-20250604/button-themes.css:41)
         → "24px" (src/css/button-themes.css:36)
  font-size: "24px" (src/css-backup-20250604/button-themes.css:41)
         → "24px" (src/css/button-themes.css:36)

- **.button-size-medium .maplibregl-ctrl button svg**
  width: "24px" (src/css-backup-20250604/button-themes.css:41)
         → "24px" (src/css/button-themes.css:36)
  height: "24px" (src/css-backup-20250604/button-themes.css:41)
         → "24px" (src/css/button-themes.css:36)
  font-size: "24px" (src/css-backup-20250604/button-themes.css:41)
         → "24px" (src/css/button-themes.css:36)

- **.button-size-medium .maplibregl-ctrl-icon:before**
  width: "24px" (src/css-backup-20250604/button-themes.css:41)
         → "24px" (src/css/button-themes.css:36)
  height: "24px" (src/css-backup-20250604/button-themes.css:41)
         → "24px" (src/css/button-themes.css:36)
  font-size: "24px" (src/css-backup-20250604/button-themes.css:41)
         → "24px" (src/css/button-themes.css:36)

- **.button-size-large .sidebar-toggle svg**
  width: "28px" (src/css-backup-20250604/button-themes.css:49)
         → "28px" (src/css/button-themes.css:44)
  height: "28px" (src/css-backup-20250604/button-themes.css:49)
         → "28px" (src/css/button-themes.css:44)
  font-size: "28px" (src/css-backup-20250604/button-themes.css:49)
         → "28px" (src/css/button-themes.css:44)

- **.button-size-large .maplibregl-ctrl button svg**
  width: "28px" (src/css-backup-20250604/button-themes.css:49)
         → "28px" (src/css/button-themes.css:44)
  height: "28px" (src/css-backup-20250604/button-themes.css:49)
         → "28px" (src/css/button-themes.css:44)
  font-size: "28px" (src/css-backup-20250604/button-themes.css:49)
         → "28px" (src/css/button-themes.css:44)

- **.button-size-large .maplibregl-ctrl-icon:before**
  width: "28px" (src/css-backup-20250604/button-themes.css:49)
         → "28px" (src/css/button-themes.css:44)
  height: "28px" (src/css-backup-20250604/button-themes.css:49)
         → "28px" (src/css/button-themes.css:44)
  font-size: "28px" (src/css-backup-20250604/button-themes.css:49)
         → "28px" (src/css/button-themes.css:44)

- **.controls button**
  background-color: "var(--primary-color)" (src/css-backup-20250604/button-themes.css:58)
         → "var(--primary-color)" (src/css-backup-20250604/button-themes.css:80)
  background-color: "var(--primary-color)" (src/css-backup-20250604/button-themes.css:58)
         → "#f0f0f0" (src/css/styles.css:415)
  background-color: "var(--primary-color)" (src/css-backup-20250604/button-themes.css:58)
         → "rgba(70, 130, 180, 0.7)" (src/css/styles.css:427)
  color: "white" (src/css-backup-20250604/button-themes.css:80)
         → "white" (src/css/styles.css:427)
  background-color: "var(--primary-color)" (src/css-backup-20250604/button-themes.css:58)
         → "var(--primary-color)" (src/css/button-themes.css:53)
  border-color: "var(--primary-color)" (src/css-backup-20250604/button-themes.css:58)
         → "var(--primary-color)" (src/css/button-themes.css:53)
  background-color: "var(--primary-color)" (src/css-backup-20250604/button-themes.css:58)
         → "var(--primary-color)" (src/css/button-themes.css:73)
  color: "white" (src/css-backup-20250604/button-themes.css:80)
         → "white" (src/css/button-themes.css:73)

- **.selected-basemap**
  background-color: "var(--primary-color)" (src/css-backup-20250604/button-themes.css:58)
         → "var(--primary-color)" (src/css/button-themes.css:53)
  border-color: "var(--primary-color)" (src/css-backup-20250604/button-themes.css:58)
         → "var(--primary-color)" (src/css/button-themes.css:53)
  border-left-color: "var(--primary-color)" (src/css-backup-20250604/button-themes.css:74)
         → "var(--primary-color)" (src/css/button-themes.css:68)

- **.maplibregl-ctrl-geolocate-active .maplibregl-ctrl-icon:before**
  color: "var(--primary-color)" (src/css-backup-20250604/button-themes.css:68)
         → "var(--primary-color)" (src/css/button-themes.css:62)

- **.controls button:hover**
  background-color: "var(--primary-color)" (src/css-backup-20250604/button-themes.css:85)
         → "rgba(70, 130, 180, 0.9)" (src/css/styles.css:432)
  background-color: "var(--primary-color)" (src/css-backup-20250604/button-themes.css:85)
         → "var(--primary-color)" (src/css/button-themes.css:78)
  opacity: "0.9" (src/css-backup-20250604/button-themes.css:85)
         → "0.9" (src/css/button-themes.css:78)

- **#map**
  position: "relative" (src/css/styles.css:1)
         → "absolute" (src/css/styles.css:52)
  width: "100vw" (src/css/styles.css:1)
         → "100vw" (src/css/styles.css:52)
  height: "100vh" (src/css/styles.css:1)
         → "100vh" (src/css/styles.css:52)

- **h3**
  font-weight: "400" (src/css/styles.css:18)
         → "700" (src/css/styles.css:27)

- **label**
  font-weight: "400" (src/css/styles.css:18)
         → "500" (src/css/styles.css:31)

- **button**
  font-weight: "400" (src/css/styles.css:18)
         → "500" (src/css/styles.css:31)

- **.sidebar-content**
  overflow-y: "auto" (src/css/styles.css:256)
         → "auto" (src/css/sidebar-consolidated.css:99)
  padding: "var(--spacing-sm, 0.5rem)" (src/css/styles.css:256)
         → "16px" (src/css/sidebar-consolidated.css:99)
  height: "100%" (src/css/styles.css:256)
         → "calc(100% - var(--header-height))" (src/css/sidebar-consolidated.css:99)
  padding: "var(--spacing-sm, 0.5rem)" (src/css/styles.css:256)
         → "12px" (src/css/sidebar-consolidated.css:202)
  padding: "var(--spacing-sm, 0.5rem)" (src/css/styles.css:256)
         → "8px" (src/css/sidebar-consolidated.css:218)

- **#right2**
  background-color: "rgba(238, 238, 238, 0.7)" (src/css/styles.css:97)
         → "rgba(
    238,
    238,
    238,
    0.4
  )" (src/css/styles.css:238)
  display: "flex" (src/css/styles.css:97)
         → "flex" (src/css/styles.css:238)
  flex-direction: "column" (src/css/styles.css:97)
         → "column" (src/css/styles.css:238)
  justify-content: "center" (src/css/styles.css:97)
         → "center" (src/css/styles.css:238)
  align-items: "center" (src/css/styles.css:97)
         → "center" (src/css/styles.css:238)
  pointer-events: "none" (src/css/styles.css:97)
         → "none" (src/css/styles.css:238)
  padding: "0" (src/css/styles.css:97)
         → "0" (src/css/styles.css:238)
  border-top-left-radius: "1rem" (src/css/styles.css:97)
         → "1rem" (src/css/styles.css:238)
  border-bottom-left-radius: "1rem" (src/css/styles.css:97)
         → "1rem" (src/css/styles.css:238)

- **#arrow-container**
  width: "100%" (src/css/styles.css:186)
         → "100%" (src/css/styles.css:1320)
  height: "90%" (src/css/styles.css:186)
         → "90%" (src/css/styles.css:1320)
  margin: "5% 0" (src/css/styles.css:186)
         → "5% 0" (src/css/styles.css:1320)

- **sl-drawer[id^="left"]::part(panel)**
  width: "var(--left-sidebar-width)" (src/css/styles.css:295)
         → "400px" (src/css/styles.css:1218)

- **sl-drawer[id^="right"]::part(panel)**
  width: "var(--right-sidebar-width)" (src/css/styles.css:299)
         → "400px" (src/css/styles.css:1224)

- **.sidebar-toggle:hover**
  background-color: "rgba(200, 200, 200, 0.9)" (src/css/styles.css:373)
         → "#f5f8fa" (src/css/sidebar-consolidated.css:125)

- **#status-band**
  position: "fixed" (src/css/styles.css:631)
         → "absolute" (src/css/styles.css:828)
  top: "0" (src/css/styles.css:631)
         → "0" (src/css/styles.css:828)
  left: "0" (src/css/styles.css:631)
         → "0" (src/css/styles.css:828)
  width: "100%" (src/css/styles.css:631)
         → "100%" (src/css/styles.css:828)
  z-index: "1001" (src/css/styles.css:631)
         → "1000" (src/css/styles.css:828)

- **.basemap-radio-group sl-radio**
  margin-bottom: "8px" (src/css/styles.css:1048)
         → "12px" (src/css/styles.css:1078)

- **.basemap-button::part(base)**
  padding: "0px 1px" (src/css/styles.css:1095)
         → "10px 15px" (src/css/styles.css:1154)

- **#basemap-controls label**
  padding: "1px 1px" (src/css/styles.css:1130)
         → "10px 12px" (src/css/styles.css:1158)

- **sl-drawer#left1-drawer .sidebar-content**
  display: "flex" (src/css/styles.css:1284)
         → "flex" (src/css/styles.css:1384)
  flex-direction: "column" (src/css/styles.css:1284)
         → "column" (src/css/styles.css:1384)

- **sl-drawer#left2-drawer .controls**
  width: "100%" (src/css/styles.css:1305)
         → "100%" (src/css/styles.css:1393)
  display: "flex" (src/css/styles.css:1305)
         → "flex" (src/css/styles.css:1393)
  flex-direction: "column" (src/css/styles.css:1305)
         → "column" (src/css/styles.css:1393)

- **sl-drawer#right2-drawer .sidebar-content**
  padding: "0" (src/css/styles.css:1313)
         → "0" (src/css/styles.css:1444)
  display: "flex" (src/css/styles.css:1313)
         → "flex" (src/css/styles.css:1444)
  justify-content: "center" (src/css/styles.css:1313)
         → "center" (src/css/styles.css:1444)
  align-items: "center" (src/css/styles.css:1313)
         → "center" (src/css/styles.css:1444)

- **sl-drawer h3**
  text-align: "center" (src/css/styles.css:1478)
         → "center" (src/css/styles.css:1562)

- **sl-drawer#left4-drawer h3**
  margin: "0 0 15px 0" (src/css/styles.css:1585)
         → "0 0 10px 0" (src/css/styles.css:1664)
  flex-shrink: "0" (src/css/styles.css:1585)
         → "0" (src/css/styles.css:1664)
  margin: "0 0 15px 0" (src/css/styles.css:1585)
         → "0 0 8px 0" (src/css/styles.css:1745)

- **sl-drawer#left4-drawer .lc-layer-controls-master**
  display: "flex" (src/css/styles.css:1605)
         → "flex" (src/css/styles.css:1683)
  justify-content: "space-between" (src/css/styles.css:1605)
         → "flex-start" (src/css/styles.css:1683)
  padding: "0 10px" (src/css/styles.css:1605)
         → "0" (src/css/styles.css:1683)

- **sl-drawer#left4-drawer sl-input**
  width: "100%" (src/css/styles.css:1625)
         → "100%" (src/css/styles.css:1723)

- **sl-drawer#left4-drawer .lc-control-label**
  font-size: "14px" (src/css/styles.css:1630)
         → "13px" (src/css/styles.css:1716)

- **sl-drawer#left4-drawer .lc-category**
  margin-bottom: "8px" (src/css/styles.css:1701)
         → "5px" (src/css/styles.css:1758)

- **sl-drawer#left4-drawer .lc-layer-item**
  padding: "5px 0" (src/css/styles.css:1706)
         → "3px 0" (src/css/styles.css:1763)

- **#left1-drawer .sidebar-content::-webkit-scrollbar**
  display: "none" (src/css/styles.css:1859)
         → "none" (src/css/styles.css:1883)

- **#left2-drawer .sidebar-content::-webkit-scrollbar**
  display: "none" (src/css/styles.css:1859)
         → "none" (src/css/styles.css:1883)

- **.sidebar.right**
  width: "var(--right-sidebar-width)" (src/css/sidebar-consolidated.css:35)
         → "var(--sidebar-width)" (src/css/sidebar-consolidated.css:157)

- **.drawer-header**
  padding: "16px" (src/css/sidebar-consolidated.css:81)
         → "12px" (src/css/sidebar-consolidated.css:206)

- **.drawer-with-tabs sl-tab-group::part(nav)**
  min-width: "var(--button-size-lg, 4rem)" (src/css/drawer-tabs.css:13)
         → "var(--button-size-md, 3rem)" (src/css/drawer-tabs.css:172)
  width: "var(--button-size-lg, 4rem)" (src/css/drawer-tabs.css:13)
         → "var(--button-size-md, 3rem)" (src/css/drawer-tabs.css:172)
  padding-top: "var(--spacing-lg, 1rem)" (src/css/drawer-tabs.css:13)
         → "var(--spacing-sm, 0.5rem)" (src/css/drawer-tabs.css:172)

- **.drawer-with-tabs sl-tab sl-icon**
  font-size: "var(--font-xl, 1.75rem)" (src/css/drawer-tabs.css:25)
         → "var(--font-base, 1rem)" (src/css/drawer-tabs.css:184)

- **.drawer-with-tabs sl-tab::part(base)**
  width: "var(--button-size-md, 3rem)" (src/css/drawer-tabs.css:51)
         → "var(--button-size-sm, 2.5rem)" (src/css/drawer-tabs.css:178)
  height: "var(--button-size-md, 3rem)" (src/css/drawer-tabs.css:51)
         → "var(--button-size-sm, 2.5rem)" (src/css/drawer-tabs.css:178)
  margin: "var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem)" (src/css/drawer-tabs.css:51)
         → "var(--spacing-xs, 0.25rem)" (src/css/drawer-tabs.css:178)