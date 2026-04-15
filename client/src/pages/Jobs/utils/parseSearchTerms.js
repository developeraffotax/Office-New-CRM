// export const parseSearchTerms = (searchValue) => {
//   if (!searchValue) return [];

//   const text = searchValue.trim();

//   // Extract phrases inside quotes
//   const phraseRegex = /"([^"]+)"/g;

//   const phrases = [];
//   let match;

//   while ((match = phraseRegex.exec(text))) {
//     phrases.push(match[1]);
//   }

//   // Remove phrases from text
//   const remaining = text.replace(phraseRegex, "");

//   // Split remaining words
//   const words = remaining
//     .split(/\s+/)
//     .filter(Boolean);

//   return [...phrases, ...words];
// };

// export const highlightAdvanced = (
//   text,
//   searchValue
// ) => {
//   if (!text || !searchValue) return text;

//   const terms =
//     parseSearchTerms(searchValue);

//   if (!terms.length) return text;

//   let result = text.toString();

//   terms.forEach((term) => {
//     try {
//       const regex = new RegExp(
//         `(${term})`,
//         "ig"
//       );

//       result = result.split(regex).map(
//         (part, i) =>
//           regex.test(part) ? (
//             <mark
//               key={`${term}-${i}`}
//               className="mrt-highlight"
//             >
//               {part}
//             </mark>
//           ) : (
//             part
//           )
//       );
//     } catch {}
//   });

//   return result;
// };