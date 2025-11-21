export const renderColumnControls = (allCols, columnVisibility, setColumnVisibility, name) => {






    const toggleColumnVisibility = (column) => {
        const updatedVisibility = {
            ...columnVisibility,
            [column]: !columnVisibility[column],
        };
        setColumnVisibility(updatedVisibility);
        localStorage.setItem(
            `visibile${name}Column`,
            JSON.stringify(updatedVisibility)
        );
    };


    return (
        <div className="flex flex-col gap-0 bg-white rounded-md border shadow-md shadow-black/40  p-4">
            {Object.keys(allCols)?.map((column) => (
                <div key={column} className="flex items-center border-b border-gray-200 last:border-b-0 py-2">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={columnVisibility[column]}
                            onChange={() => toggleColumnVisibility(column)}
                            className="mr-2 accent-orange-600 h-4 w-4"
                        />
                        {column}
                    </label>
                </div>
            ))}
        </div>
    )








}








