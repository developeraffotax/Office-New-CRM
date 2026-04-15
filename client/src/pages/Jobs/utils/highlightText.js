export const highlightText = (text, searchValue) => {
  if (!text) return text;
  if (!searchValue) return text;

 
  const search = searchValue.toString().trim();

  if (!search) return text;

 

  try {
    const regex = new RegExp(`(${search})`, "ig");

    const parts = text.toString().split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          style={{
            backgroundColor: "#FEF3C7",
            color: "#92400E",
            fontWeight: 600,
            padding: "0 2px",
            borderRadius: "3px",
          }}
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  } catch {
    return text;
  }
};