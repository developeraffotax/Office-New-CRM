 

/**
 * Hook to parse email HTML into visible and hidden (trimmed) segments.
 * @param {string} htmlContent - The raw HTML body from Gmail API.
 * @returns {object} { visible, hidden, hasThread }
 */
export const gmailParser = (htmlContent) => {
 
    if (!htmlContent) return { visible: '', hidden: '', hasThread: false };

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const body = doc.body;

    // Gmail's internal markers for threading (Enterprise 2026 set)
    const markers = [
      '.gmail_quote',
      '.gmail_attr',
      'blockquote',
      'div[style*="border-top:solid #E1E1E1"]', // Outlook Desktop
      '#divRplyFwdMsg',                        // Outlook Web
      '.outlook_quote',
      '#is_signature'
    ];

    let visibleParts = [];
    let hiddenParts = [];
    let splitReached = false;

    // Convert children to array and iterate
    const children = Array.from(body.children);
    
    children.forEach((el) => {
      // Check if this element or any nested child is a reply marker
      const isMarker = markers.some(selector => 
        el.matches(selector) || el.querySelector(selector)
      );

      if (isMarker && !splitReached) {
        splitReached = true;
      }

      if (!splitReached) {
        visibleParts.push(el.outerHTML);
      } else {
        hiddenParts.push(el.outerHTML);
      }
    });

    // Fallback for flat HTML or single-paragraph emails
    if (visibleParts.length === 0 && !splitReached) {
      return {
        visible: htmlContent,
        hidden: '',
        hasThread: false
      };
    }

    return {
      visible: visibleParts.join(''),
      hidden: hiddenParts.join(''),
      hasThread: hiddenParts.length > 0
    };
 
};
