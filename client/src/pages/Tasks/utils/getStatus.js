export const getStatus = (startDateOfTask, deadlineOfTask) => {
  const startDate = new Date(startDateOfTask);
  const deadline = new Date(deadlineOfTask);
  const today = new Date();

  // Remove time parts for accurate date comparison
  startDate.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (deadline < today) {
    return "Overdue";
  } else if (startDate <= today && !(deadline < today)) {
    return "Due";
  } else {
    return "Upcoming";
  }
};
