import CustomSelect from "../../../../utlis/CustomSelect"; // adjust to your actual path

const selectStyles = {
  control: (provided) => ({
    ...provided,
    border: "0px",
    borderRadius: "0px",
    boxShadow: "none",
    minHeight: "36px",
    maxHeight: "36px",
    fontSize: "14px",
  }),
};

export default function SubjectTemplateRow({
  subject,
  setSubject,
  templateId,
  templateOptions,
  onSelectTemplate,
}) {
  return (
    <>
      <div className="flex items-center px-4 py-2">
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="flex-1 text-sm outline-none placeholder:text-gray-400"
        />
      </div>

      <div className="flex items-center border-t border-gray-100" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex-1">
          <CustomSelect
            value={templateId}
            options={templateOptions}
            placeholder="Select a template..."
            styles={selectStyles}
            onChange={onSelectTemplate}
          />
        </div>
      </div>
    </>
  );
}
