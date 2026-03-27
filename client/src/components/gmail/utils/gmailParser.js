 

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
/**
 * Enterprise Email Parser
 * Safely extracts latest message and moves quoted history to hidden.
 * Designed for Gmail, Outlook, Yahoo compatibility.
 */

export const gmailParser = (htmlContent) => {
  if (!htmlContent) {
    return { visible: "", hidden: "", hasThread: false };
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const body = doc.body;

    // -------------------------
    // STEP 1 — Remove scripts (security)
    // -------------------------

    body.querySelectorAll("script, style").forEach(el => el.remove());

    // -------------------------
    // STEP 2 — Known Reply Markers
    // -------------------------

    const replySelectors = [
      ".gmail_quote",
      ".gmail_attr",
      ".outlook_quote",
      "#divRplyFwdMsg",
      "blockquote",
      "div[style*='border-top']"
    ];

    let replyNode = null;

    for (const selector of replySelectors) {
      const found = body.querySelector(selector);

      if (found) {
        replyNode = found;
        break;
      }
    }

    // -------------------------
    // STEP 3 — Text Header Detection
    // -------------------------

    if (!replyNode) {
      const nodes = body.querySelectorAll("*");

      const replyRegex =
        /On\s.+?wrote:/i;

      for (const node of nodes) {
        if (replyRegex.test(node.textContent || "")) {
          replyNode = node;
          break;
        }
      }
    }

    // -------------------------
    // STEP 4 — No Thread Found
    // -------------------------

    if (!replyNode) {
      return {
        visible: body.innerHTML.trim(),
        hidden: "",
        hasThread: false
      };
    }

    // -------------------------
    // STEP 5 — Safe Splitting
    // -------------------------

    const visibleParts = [];
    const hiddenParts = [];

    let foundSplit = false;

    const childNodes = Array.from(body.childNodes);

    for (const node of childNodes) {

      if (
        node === replyNode ||
        (node.contains && node.contains(replyNode))
      ) {
        foundSplit = true;
      }

      if (!foundSplit) {
        visibleParts.push(
          node.outerHTML || node.textContent
        );
      } else {
        hiddenParts.push(
          node.outerHTML || node.textContent
        );
      }
    }

    // -------------------------
    // STEP 6 — Fail-Safe Protection
    // -------------------------

    const visibleHTML = visibleParts.join("").trim();
    const hiddenHTML = hiddenParts.join("").trim();

    if (!visibleHTML) {
      return {
        visible: htmlContent,
        hidden: "",
        hasThread: false
      };
    }

    return {
      visible: visibleHTML,
      hidden: hiddenHTML,
      hasThread: hiddenHTML.length > 0
    };

  } catch (err) {

    // Ultimate safety fallback

    return {
      visible: htmlContent,
      hidden: "",
      hasThread: false
    };
  }
};







// export const gmailParser = (htmlContent) => {
//   if (!htmlContent) {
//     return { visible: '', hidden: '', hasThread: false };
//   }

//   const parser = new DOMParser();
//   const doc = parser.parseFromString(htmlContent, 'text/html');
//   const body = doc.body;

//   // Thread markers
//   const markers = [
//     '.gmail_quote',
//     '.gmail_attr',
//     'blockquote',
//     'div[style*="border-top:solid"]',
//     '#divRplyFwdMsg',
//     '.outlook_quote'
//   ];

//   // Gmail-style "On Fri, ..." header
//   const REPLY_REGEX =
//     /On\s+(Mon|Tue|Tues|Wed|Thu|Thur|Fri|Sat|Sun),?\s+\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+\d{4}.*wrote:/i;

//   let splitNode = null;

//   // 1️⃣ Find first marker element
//   for (const selector of markers) {
//     const el = body.querySelector(selector);
//     if (el) {
//       splitNode = el;
//       break;
//     }
//   }

//   // 2️⃣ If no marker, search text-based reply header
//   if (!splitNode) {
//     const allNodes = body.querySelectorAll('*');

//     for (const node of allNodes) {
//       if (REPLY_REGEX.test(node.textContent || '')) {
//         splitNode = node;
//         break;
//       }
//     }
//   }

//   // 3️⃣ No thread detected
//   if (!splitNode) {
//     return {
//       visible: body.innerHTML,
//       hidden: '',
//       hasThread: false
//     };
//   }

//   // 4️⃣ Split content
//   const visibleHTML = [];
//   const hiddenHTML = [];

//   let reached = false;

//   for (const child of Array.from(body.childNodes)) {
//     if (child === splitNode || child.contains?.(splitNode)) {
//       reached = true;
//     }

//     if (!reached) {
//       visibleHTML.push(child.outerHTML || child.textContent);
//     } else {
//       hiddenHTML.push(child.outerHTML || child.textContent);
//     }
//   }

//   return {
//     visible: visibleHTML.join(''),
//     hidden: hiddenHTML.join(''),
//     hasThread: hiddenHTML.length > 0
//   };
// };


 