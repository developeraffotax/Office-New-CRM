// import { parseSearchTerms } from "./parseSearchTerms";

 
// export const rowMatchesSearch = (
//   row,
//   searchValue
// ) => {
//   if (!searchValue) return false;

//   const terms =
//     parseSearchTerms(searchValue);

//   if (!terms.length) return false;

//   const rowText = JSON.stringify(
//     row.original
//   ).toLowerCase();

//   return terms.some((term) =>
//     rowText.includes(
//       term.toLowerCase()
//     )
//   );
// };