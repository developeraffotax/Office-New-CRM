import Select, { components } from "react-select";

// Multi-word highlighter
export const HighlightedOption = (props) => {
  const {
    data,
    selectProps: { inputValue },
  } = props;

  const label = data.label || "";

  // No search → return normal label
  if (!inputValue) {
    return (
      <components.Option {...props}>
        {label}
      </components.Option>
    );
  }

  // Split search into words
  const words = inputValue
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  // Escape regex special chars
  const escapedWords = words.map(word =>
    word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );

  // Create regex like: (tax|return)
  const regex = new RegExp(
    `(${escapedWords.join("|")})`,
    "ig"
  );

  const parts = label.split(regex);

  return (
    <components.Option {...props}>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-yellow-200 text-black px-[1px] rounded"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </components.Option>
  );
};














// import Select, { components } from "react-select";

// // Custom highlighter for search matches
// export const HighlightedOption = (props) => {
//   const {
//     data,
//     innerProps,
//     innerRef,
//     isFocused,
//     selectProps: { inputValue },
//   } = props;

//   const label = data.label || "";
//   if (!inputValue) {
//     return (
//       <components.Option {...props}>
//         {label}
//       </components.Option>
//     );
//   }

//   const regex = new RegExp(`(${inputValue})`, "ig");
//   const parts = label.split(regex);

//   return (
//     <components.Option {...props}>
//       {parts.map((part, index) =>
//         regex.test(part) ? (
//           <mark key={index} className="bg-yellow-200 text-black">
//             {part}
//           </mark>
//         ) : (
//           <span key={index}>{part}</span>
//         )
//       )}
//     </components.Option>
//   );
// };
















// Custom filter that also sorts matches
// export const filterOption = (option, rawInput) => {
//   if (!rawInput) return true;
//   return option.label.toLowerCase().includes(rawInput.toLowerCase());
// };



// Multi-word search filter
export const filterOption = (option, rawInput) => {
  if (!rawInput) return true;

  // Split input into words
  const searchWords = rawInput
    .toLowerCase()
    .trim()
    .split(/\s+/); // split by spaces

  const label = option.label.toLowerCase();

  // Check every word exists in label
  return searchWords.every(word =>
    label.includes(word)
  );
};


export const sortOptions = (options, inputValue) => {
  if (!inputValue) return options;
  return [...options].sort((a, b) => {
    const aIndex = a.label.toLowerCase().indexOf(inputValue.toLowerCase());
    const bIndex = b.label.toLowerCase().indexOf(inputValue.toLowerCase());
    return aIndex - bIndex; // lower index = earlier match = higher priority
  });
};