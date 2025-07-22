/**
 * Styles for the ObjectInfo component.
 * Contains CSS styles that define the layout, colors, and visual appearance
 * of the ObjectInfo web component.
 */
// object-info-styles.js
export const ObjectInfoStyles = `
<style>
  :host {
    display: flex;
    flex-direction: column;
    background: white;
    font-family: 'Roboto', sans-serif;
    height: 100%;
    position: relative;
  }

  .header {
    background: #4682b4;
    color: white;
    padding: 8px 12px;
    flex-shrink: 0;
  }

  .header-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-title {
    font-size: 1rem;
    font-weight: 500;
    margin: 0;
  }

  .feature-type-badge {
    background-color: #ffffff;
    color: #4682b4;
    border: 1px solid #4682b4;
    font-size: 0.6875rem;
    padding: 2px 8px;
    border-radius: 9999px;
    display: inline-block;
    font-weight: 500;
  }

  .feature-id {
    font-size: 0.6875rem;
    opacity: 0.9;
    margin: 0;
  }

  .feature-name {
    font-size: 0.9375rem;
    font-weight: 600;
    margin: 2px 0;
  }

  .field-note {
    font-size: 0.8125rem;
    font-style: italic;
    opacity: 0.9;
    margin: 0;
  }

  .scrollable-content {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 16px;
  }

  .content {
    padding: 0;
  }

  .section {
    padding: 8px 0;
    border-bottom: 1px solid #e5e5e5;
  }

  .section:last-child {
    border-bottom: none;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: #f8f9fa;
    cursor: pointer;
    user-select: none;
    margin-bottom: 6px;
  }

  .section-header:hover {
    background: #e9ecef;
  }

  .section-icon {
    color: #666;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .section-title {
    font-size: 0.9375rem;
    font-weight: 500;
    color: #333;
    flex: 1;
  }

  .chevron {
    transition: transform 0.2s;
    color: #666;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chevron.collapsed {
    transform: rotate(-90deg);
  }

  .section-content {
    padding: 0 12px;
    display: block;
  }

  .section-content.collapsed {
    display: none;
  }

  .data-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    font-size: 0.8125rem;
    border-bottom: 1px solid #f0f0f0;
  }

  .data-row:last-child {
    border-bottom: none;
  }

  .data-label {
    color: #666;
    font-size: 0.85rem;
  }

  .data-value {
    font-weight: 600;
    color: #333;
    text-align: right;
    font-size: 0.9rem;
  }

  .photos-container {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    padding: 8px 0;
  }

  .photo-item {
    position: relative;
    cursor: pointer;
  }

  .photo-item img {
    border-radius: 4px;
    width: 80px;
    height: 60px;
    object-fit: cover;
    border: 1px solid #e5e5e5;
  }

  .subsection {
    background: #f9f9f9;
    padding: 8px;
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .subsection:last-child {
    margin-bottom: 0;
  }

  .subsection h4 {
    font-weight: 500;
    color: #444;
    margin: 0 0 8px 0;
    font-size: 1rem;
  }

  .linked-feature {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: #f9f9f9;
    border-radius: 4px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .linked-feature:hover {
    background: #f0f0f0;
  }

  .linked-feature:last-child {
    margin-bottom: 0;
  }

  .linked-feature-icon {
    color: #4682b4;
  }

  .feature-name {
    font-weight: 500;
    font-size: 0.9rem;
  }

  .actions {
    position: sticky;
    bottom: 0;
    padding: 12px;
    background: white;
    border-top: 1px solid #e5e5e5;
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .edit-button,
  .close-button {
    flex: 1;
  }

  sl-button.edit-button::part(base),
  sl-button.close-button::part(base) {
    background-color: #4682b4;
    border-color: #4682b4;
    color: white;
    width: 100%;
  }

  sl-button.edit-button::part(base):hover,
  sl-button.close-button::part(base):hover {
    background-color: #3a6d94;
    border-color: #3a6d94;
  }

  sl-button.edit-button::part(base):active,
  sl-button.close-button::part(base):active {
    background-color: #2d5678;
    border-color: #2d5678;
  }

  .address-text {
    padding: 8px 0;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .scrollable-content::-webkit-scrollbar {
    width: 6px;
  }

  .scrollable-content::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .scrollable-content::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }

  .scrollable-content::-webkit-scrollbar-thumb:hover {
    background: #999;
  }

  .svg-icon {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
`;
