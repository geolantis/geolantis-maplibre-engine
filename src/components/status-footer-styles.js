/**
 * Styles for the status footer component.
 * Defines the CSS that controls the appearance and layout of the status footer
 * which displays at the bottom of the viewport.
 */
// status-footer-styles.js
export const StatusFooterStyles = `
<style>
  :host {
    display: block;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    font-family: var(--sl-font-sans, "Roboto", sans-serif);
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  
  .status-footer {
    width: 100%;
  }
  
  /* Status bar styling */
  .status-bar {
    background: rgba(255, 255, 255, 0.25);
    box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: background-color 0.3s;
    font-size: 18px;
  }
  
  /* Tablet-specific font sizes for better readability */
  @media (min-width: 769px) and (max-width: 1024px) {
    .status-bar {
      font-size: 22px;
    }
  }
  
  @media (min-width: 1025px) {
    .status-bar {
      font-size: 24px;
    }
  }
  
  .status-bar:hover {
    background: rgba(255, 255, 255, 0.4);
  }
  
  .status-bar-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 8px;
  }
  
  .device-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .device-name {
    font-weight: 500;
    color: #333;
  }
  
  /* Enhanced device name font sizes for tablets */
  @media (min-width: 769px) and (max-width: 1024px) {
    .device-name {
      font-size: 18px;
    }
  }
  
  @media (min-width: 1025px) {
    .device-name {
      font-size: 20px;
    }
  }
  
  .tilt-status {
    margin-left: 8px;
    color: #666;
  }
  
  .status-indicators {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .time-indicator,
  .rtk-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  /* Shoelace icon customization */
  sl-icon {
    font-size: 16px;
    vertical-align: middle;
  }
  
  .tilt-status-icon {
    color: var(--sl-color-primary-600, #4682b4);
  }
  
  /* Accuracy indicator styling */
  .accuracy-indicator {
    font-weight: 600;
    margin-right: 8px;
  }
  
  .accuracy {
    background-color: #4caf50;
    color: black;
    padding: 2px 4px;
    border-radius: 8px;
    font-size: 18px;
    font-weight: 600;
  }
  
  /* Enhanced accuracy indicator font sizes for tablets */
  @media (min-width: 769px) and (max-width: 1024px) {
    .accuracy {
      font-size: 20px;
      padding: 3px 6px;
    }
  }
  
  @media (min-width: 1025px) {
    .accuracy {
      font-size: 22px;
      padding: 4px 8px;
    }
  }
  
  .accuracy.high {
    background-color: #4caf50;
  }
  
  .accuracy.medium {
    background-color: #ff9800;
  }
  
  .accuracy.low {
    background-color: #f44336;
  }
  
  /* Expanded sections */
  .expanded-sections {
    display: block;
    background: rgba(255, 255, 255, 0.95);
    padding: 10px;
    box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.2);
    font-size: 14px;
    transition: all 0.3s;
  }
  
  .expanded-sections.hidden {
    display: none;
  }
  
  .sections-row {
    display: flex;
    gap: 20px;
    justify-content: space-between;
  }
  
  .section {
    flex: 1;
    min-width: 0;
  }
  
  .coordinates-section {
    flex: 1.2;
  }
  
  .gnss-section {
    flex: 1.5;
  }
  
  .device-section {
    flex: 0.8;
  }
  
  .section-title {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #333;
  }
  
  /* Coordinate grid */
  .coordinates-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px 8px;
  }
  
  /* Allow selection only for specific values that users might want to copy */
  .coord-value,
  .gnss-value,
  .device-value {
    -webkit-user-select: text;
    -moz-user-select: text;
    -ms-user-select: text;
    user-select: text;
  }
  
  /* Prevent selection for UI elements and labels */
  .coord-label,
  .gnss-label,
  .device-label,
  .section-title,
  .status-bar,
  .status-indicators,
  .device-info {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  
  .coord-item {
    display: flex;
    flex-direction: column;
  }
  
  .coord-label {
    font-size: 11px;
    color: #666;
  }
  
  .coord-value {
    font-size: 16px;
    font-weight: 500;
    font-family: monospace;
  }
  
  

  .gnss-grid {
    display: flex;
    gap: 24px;
  }
  
  .gnss-block {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }
  
  /* put the satellite + speed icons on one horizontal line */
  .gnss-icon-row {
    display: flex;
    gap: 16px;
    align-items: center;
  }
  
  /* mobile: stack the two blocks */
  @media (max-width: 640px) {
    .gnss-grid {
      flex-direction: column;
      gap: 12px;
    }
  }
  
  .gnss-top-row,
  .gnss-middle-row {
    display: flex;
    gap: 20px;
  }
  
  .gnss-column {
    flex: 1;
    min-width: 0;
  }
  
  .gnss-item {
    display: flex;
    flex-direction: column;
  }
  
  .gnss-icon-row {
    display: flex;
    gap: 16px;
    margin-top: 4px;
    align-items: center;
  }
  
  .gnss-icon-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .gnss-label {
    font-size: 11px;
    color: #666;
  }
  
  .gnss-value {
    font-size: 13px;
    font-weight: 500;
  }
  
  /* Enhanced GNSS value font sizes for tablets */
  @media (min-width: 769px) and (max-width: 1024px) {
    .gnss-value {
      font-size: 16px;
    }
  }
  
  @media (min-width: 1025px) {
    .gnss-value {
      font-size: 18px;
    }
  }
  
  .rtk-status {
    font-size: 13px;
    line-height: 1.4;
  }
  
  .status-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 4px;
  }
  
  .status-dot.connected {
    background-color: #4caf50;
  }
  
  .status-dot.disconnected {
    background-color: #f44336;
  }
  
  /* Device details */
  .device-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .device-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .device-item sl-icon {
    color: var(--sl-color-primary-600, #4682b4);
  }
  
  .device-label {
    font-size: 11px;
    color: #666;
    margin-right: 4px;
  }
  
  .subsection-title {
    font-size: 13px;
    font-weight: 600;
    color: #333;
    margin: 4px 0;
  }
  
  .locator {
    flex-direction: column;
    align-items: flex-start;
  }
  
  /* Shoelace button customization */
  sl-button#toggle-expand {
    --sl-button-font-size-small: 12px;
  }
  
  sl-button#toggle-expand::part(base) {
    padding: 0;
    min-width: 24px;
    min-height: 24px;
    color: #666;
  }
  
  sl-button#toggle-expand::part(base):hover {
    color: var(--sl-color-primary-600, #4682b4);
  }
  
  /* Shoelace progress bar customization */
  sl-progress-bar.battery-progress {
    --height: 8px;
    --border-radius: 4px;
    --indicator-color: var(--sl-color-success-500);
    flex: 1;
    max-width: 80px;
  }
  
  sl-progress-bar.battery-progress::part(base) {
    background-color: #e5e7eb;
  }
  
  sl-progress-bar.battery-progress::part(indicator) {
    transition: width 0.5s ease-in-out;
  }
  
  /* Custom scrollbar */
  .expanded-sections::-webkit-scrollbar {
    width: 8px;
  }
  
  .expanded-sections::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  .expanded-sections::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }
  
  .expanded-sections::-webkit-scrollbar-thumb:hover {
    background: #999;
  }
  
  /* Format switch button */
  .format-switch-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    margin: 0;
    color: #666;
    opacity: 0.7;
    transition: opacity 0.2s;
  }
  
  .format-switch-btn:hover {
    opacity: 1;
  }

  /* Portrait mode adjustments */
  .expanded-sections.portrait-mode {
    max-height: 50vh;
    overflow-y: auto;
  }
  
  .expanded-sections.compact {
    padding: 6px;
    font-size: 13px;
  }
  
  .expanded-sections.compact .section-title {
    font-size: 13px;
    margin: 0 0 4px 0;
  }
  
  .expanded-sections.compact .coord-value {
    font-size: 13px;
  }
  
  .expanded-sections.compact .gnss-value {
    font-size: 12px;
  }
  
  .sections-row.portrait {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  
  .sections-row.portrait .coordinates-section {
    grid-column: 1 / -1;
  }
  
  .sections-row.portrait .gnss-section {
    grid-column: 1 / 2;
  }
  
  .sections-row.portrait .device-section {
    grid-column: 2 / 3;
  }
  
  /* Mobile responsive adjustments */
  @media (max-width: 640px) {
    .sections-row:not(.portrait) {
      flex-direction: column;
      gap: 8px;
    }
    
    .coordinates-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .status-bar-content {
      padding: 3px 6px;
    }
    
    .expanded-sections {
      padding: 8px;
    }
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .status-bar {
      border-top: 2px solid #000;
    }
    
    .coord-label,
    .gnss-label {
      color: #000;
    }
  }
  
  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .status-bar,
    .expanded-sections {
      background: rgba(30, 30, 30, 0.95);
      color: #fff;
    }
    
    .section-title,
    .coord-value,
    .gnss-value,
    .device-name {
      color: #fff;
    }
    
    .coord-label,
    .gnss-label,
    .device-label,
    .tilt-status {
      color: #aaa;
    }
    
    sl-progress-bar.battery-progress::part(base) {
      background-color: #444;
    }
  }
  
  /* Print styles */
  @media print {
    :host {
      position: static;
    }
    
    .status-bar {
      background: #fff;
      box-shadow: none;
      border-bottom: 1px solid #ccc;
    }
    
    .expanded-sections {
      display: block !important;
    }
    
    sl-button {
      display: none;
    }
  }
</style>
`;
