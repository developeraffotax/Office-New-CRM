import React from "react";
import Select from "react-select";

const PlaceholderPicker = ({ placeholders, onInsertPlaceholder }) => {
  const options = placeholders.map((ph) => ({
    value: ph,
    label: ph,
  }));

  const handleChange = (selected) => {
    if (selected && selected.value) {
      onInsertPlaceholder(selected.value);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Insert Placeholder:
      </label>
      <Select
        options={options}
        onChange={handleChange}
        placeholder="Select a placeholder..."
        isClearable
      />
    </div>
  );
};

export default PlaceholderPicker;
