export function filterByRowId(
  table,
  rowId,
  setCommentTaskId,
  setIsComment,
  columnId = "_id"
) {
  if (!rowId) return;

  setCommentTaskId(rowId);
  setIsComment(true);

  table.resetColumnFilters(true);

  table.setColumnFilters([
    {
      id: columnId,
      value: rowId,
    },
  ]);
}


