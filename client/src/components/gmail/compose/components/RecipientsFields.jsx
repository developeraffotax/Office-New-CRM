import EmailChipInput from "./EmailChipInput"; // adjust to your actual path

export default function RecipientsFields({
  to,
  setTo,
  cc,
  setCc,
  bcc,
  setBcc,
  showCc,
  showBcc,
  onShowCc,
  onShowBcc,
}) {
  return (
    <>
      <div className="flex items-center px-4 py-2 border-b border-gray-100">
        <EmailChipInput label="To" values={to} setValues={setTo} />
        <div className="flex gap-2 text-sm text-gray-500">
          {!showCc && (
            <button type="button" onClick={onShowCc} className="hover:text-gray-700">
              Cc
            </button>
          )}
          {!showBcc && (
            <button type="button" onClick={onShowBcc} className="hover:text-gray-700">
              Bcc
            </button>
          )}
        </div>
      </div>

      {showCc && (
        <div className="flex items-center px-4 py-2 border-b border-gray-100">
          <EmailChipInput label="Cc" values={cc} setValues={setCc} />
        </div>
      )}

      {showBcc && (
        <div className="flex items-center px-4 py-2 border-b border-gray-100">
          <EmailChipInput label="Bcc" values={bcc} setValues={setBcc} />
        </div>
      )}
    </>
  );
}
