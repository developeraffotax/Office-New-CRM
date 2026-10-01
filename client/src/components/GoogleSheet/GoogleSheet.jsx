const GoogleSheet = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "calc(100vh - 80px)",
        overflow: "hidden",
      }}
    >
      <iframe
        src={`https://docs.google.com/spreadsheets/d/e/2PACX-1vQ70U6qM2UyI0C_pAER6GQ1j_QsNdAokUrQioMGq01ISviloGYUgveB8KVxjdIB6MK5ASCbdbo6eIie/pubhtml?gid=549310213&amp;single=true&amp;widget=true&amp;headers=false`}
        title="Google Sheet"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
      />
    </div>
  );
};

export default GoogleSheet;