

export const getLastTwelveMonthsWithLabels = () => {
    const now = new Date();
      const labels = [];

      // Generate last 12 months, starting from current month
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleString('default', { month: 'short', year: 'numeric' }); // e.g. "Apr 2025"
        labels.push(label);
      }

      // Reverse to keep chronological order (from oldest to newest)
      labels.reverse();

      return labels;
}



export const shiftArrFromThisMonth = (arr) => {
    const now = new Date();
    const shiftIndex = now.getMonth() + 1 ;

    const rotatedArr = arr.slice(shiftIndex).concat(arr.slice(0, shiftIndex));


    return rotatedArr


}