/**
 * Monica Chat Widget Embed Script
 *
 * Usage:
 * <script src="https://your-domain.com/embed.js"
 *   data-clinic="Primal Health"
 *   data-color="#14b8a6"
 *   data-position="bottom-right">
 * </script>
 */

(function () {
  'use strict';

  // Get configuration from script tag
  const script = document.currentScript;
  const config = {
    clinic: script.getAttribute('data-clinic') || 'Primal Health',
    color: script.getAttribute('data-color') || '#14b8a6',
    position: script.getAttribute('data-position') || 'bottom-right',
    baseUrl: script.getAttribute('data-base-url') || script.src.replace('/embed.js', ''),
  };

  // Create widget container
  const container = document.createElement('div');
  container.id = 'monica-chat-widget';
  container.style.cssText = `
    position: fixed;
    bottom: 0;
    ${config.position === 'bottom-left' ? 'left: 0;' : 'right: 0;'}
    z-index: 999999;
    width: 450px;
    height: 700px;
    max-width: 100vw;
    max-height: 100vh;
    pointer-events: none;
  `;

  // Create iframe
  const iframe = document.createElement('iframe');
  const params = new URLSearchParams({
    clinic: config.clinic,
    color: config.color,
    position: config.position,
  });

  iframe.src = `${config.baseUrl}/widget?${params.toString()}`;
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
    pointer-events: auto;
  `;
  iframe.allow = 'microphone; camera';
  iframe.title = 'Monica Chat Widget';

  // Append to page
  container.appendChild(iframe);

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      document.body.appendChild(container);
    });
  } else {
    document.body.appendChild(container);
  }

  // Expose API for programmatic control
  window.MonicaWidget = {
    open: function () {
      iframe.contentWindow.postMessage({ type: 'MONICA_OPEN' }, '*');
    },
    close: function () {
      iframe.contentWindow.postMessage({ type: 'MONICA_CLOSE' }, '*');
    },
    destroy: function () {
      container.remove();
    },
  };
})();
