 

// /**
//  * Hook to parse email HTML into visible and hidden (trimmed) segments.
//  * @param {string} htmlContent - The raw HTML body from Gmail API.
//  * @returns {object} { visible, hidden, hasThread }
//  */
// export const gmailParser2 = (htmlContent) => {
 
//     if (!htmlContent) return { visible: '', hidden: '', hasThread: false };

// //  return { visible: htmlContent, hidden: '', hasThread: false };

//     const parser = new DOMParser();
//     const doc = parser.parseFromString(htmlContent, 'text/html');
//     const body = doc.body;

//     // Gmail's internal markers for threading (Enterprise 2026 set)
//     const markers = [
//       '.gmail_quote',
//       '.gmail_attr',
//       'blockquote',
//     'div[style*="border-top:solid #E1E1E1"]', // Outlook Desktop
//       '#divRplyFwdMsg',                        // Outlook Web
//       '.outlook_quote',
//       '#is_signature'
//     ];

//     let visibleParts = [];
//     let hiddenParts = [];
//     let splitReached = false;

//     // Convert children to array and iterate
//     const children = Array.from(body.children);
    
//     children.forEach((el) => {

//       console.log("EL", el)

//       // Check if this element or any nested child is a reply marker
//       const isMarker = markers.some(selector => 
//         el.matches(selector) || el.querySelector(selector)
//       );

//       if (isMarker && !splitReached) {
//         splitReached = true;
//       }

//       if (!splitReached) {
//         visibleParts.push(el.outerHTML);
//       } else {
//         hiddenParts.push(el.outerHTML);
//       }
//     });

//     // Fallback for flat HTML or single-paragraph emails
//     if (visibleParts.length === 0 && !splitReached) {
//       return {
//         visible: htmlContent,
//         hidden: '',
//         hasThread: false
//       };
//     }
    

//     console.log("RESULT ", {
//       visible: visibleParts.join(''),
//       hidden: hiddenParts.join(''),
//       hasThread: hiddenParts.length > 0
//     })
//     return {
//       visible: visibleParts.join(''),
//       hidden: hiddenParts.join(''),
//       hasThread: hiddenParts.length > 0
//     };
 
// };



 

/**
 * Hook to parse email HTML into visible and hidden (trimmed) segments.
 * @param {string} htmlContent - The raw HTML body from Gmail API.
 * @returns {object} { visible, hidden, hasThread }
 */
export const gmailParser   = (htmlContent) => {
  if (!htmlContent) return { visible: '', hidden: '', hasThread: false };

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const body = doc.body;

  // Gmail's internal markers for threading
  const markers = [
    '.gmail_quote',
    '.gmail_attr',
    'blockquote',
    'div[style*="border-top:solid #E1E1E1"]', // Outlook Desktop
    '#divRplyFwdMsg',                          // Outlook Web
    '.outlook_quote',
    '#is_signature'
  ];

  // Regex for Gmail-style reply headers
  const REPLY_REGEX =
    /On\s+(Mon|Tue|Tues|Wed|Thu|Thur|Fri|Sat|Sun),?\s+\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+\d{4}\s+at\s+\d{1,2}:\d{2},\s+.*?<.*?>\s+wrote:/i;

  let visibleParts = [];
  let hiddenParts = [];
  let splitReached = false;

  const children = Array.from(body.children);

  children.forEach((el) => {
    // Check if this element or any nested child matches a marker selector
    const isMarker = markers.some(
      (selector) => el.matches(selector) || el.querySelector(selector)
    );

    // Check if this element or any nested child contains the Gmail reply header
    const hasReplyHeader = REPLY_REGEX.test(el.textContent || '');

    if (!splitReached && (isMarker || hasReplyHeader)) {
      splitReached = true;
    }

    if (!splitReached) {
      visibleParts.push(el.outerHTML);
    } else {
      hiddenParts.push(el.outerHTML);
    }
  });

  // Fallback for single-paragraph emails
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










 