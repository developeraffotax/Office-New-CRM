export function formatRef(prefix, number) {
  

  if(!number) return "-";
  return `${prefix}-${String(number).padStart(3, "0")}`;
}

export const refFilterFn = (row, columnId, filterValue) => {
  const rawValue = row.getValue(columnId); // example: 19
  if (!rawValue) return false;

  const cleanedInput = filterValue.replace(/[^0-9]/g, "");

  return rawValue.toString().includes(cleanedInput);
};




// export const refFilterFn = (row, columnId, filterValue = "") => {
//   const rawValue = row.getValue(columnId); // e.g. 19 or 3
//   if (!rawValue) return false;

//   // Keep only digits from input
//   const cleanedInput = filterValue.replace(/[^0-9]/g, "");

//   if (!cleanedInput) return true;

//   const valueStr = rawValue.toString();     // "19"
//   const paddedStr = valueStr.padStart(3, "0"); // "019" (optional)

//   // match only values STARTING WITH typed value
//   return (
//     valueStr.startsWith(cleanedInput) ||     // match 3 → 3, 30, 39
//     paddedStr.startsWith(cleanedInput)       // match 03 → 003, 030
//   );
// };