// Function to calculate the next start date
const calculateStartDate = (date, recurringType) => {
    const currentDate = new Date(date);
  
    const addDaysSkippingWeekends = (date, days) => {
      let result = new Date(date);
      while (days > 0) {
        result.setDate(result.getDate() + 1);
        if (result.getDay() !== 6 && result.getDay() !== 5) {
          days--;
        }
      }
      return result;
    };
  
    // const adjustForFridayAndWeekend = (date) => {
    //   const day = date.getDay();
    //   if (day === 5) {
    //     date.setDate(date.getDate() + 3);
    //   } else if (day === 6) {
    //     date.setDate(date.getDate() + 2);
    //   } else if (day === 0) {
    //     date.setDate(date.getDate() + 1);
    //   }
    //   return date;
    // };




    const skipWeekends = (date ) => {
        const currentDate = new Date(date);
          const day = currentDate.getDay();
        switch (day) {
          case 1: return new Date(currentDate.setDate(currentDate.getDate() + 1));
          case 2: return new Date(currentDate.setDate(currentDate.getDate() + 1));
          case 3: return new Date(currentDate.setDate(currentDate.getDate() + 1));
          case 4: return new Date(currentDate.setDate(currentDate.getDate() + 1));
        //   case 5: return new Date(currentDate.setDate(currentDate.getDate() + 3));
        //   case 6: return new Date(currentDate.setDate(currentDate.getDate() + 2));
          case 0: return new Date(currentDate.setDate(currentDate.getDate() + 1));
          // case 6: return currentDate.setDate(currentDate.getDate() + 2);
          // case 0: return currentDate.setDate(currentDate.getDate() + 1);
        
          default:
            break;
        }

        return currentDate
      }
    
    
      // Mon   1
      // Tue   2
      // Wed   3
      // Thu   4
      // Fri   5
      // Sat   6
      // Sun   0
    
    


    
    const adjustForFridayAndWeekend = (date) => {
        const day = date.getDay();
        if (day === 5) {
          date.setDate(date.getDate() + 2);
        } else if (day === 6) {
          date.setDate(date.getDate() + 1);
        }
        return date;
      };
  
    switch (recurringType) {
      case "daily":
        return skipWeekends(currentDate);
      case "weekly":
        return addDaysSkippingWeekends(currentDate, 5);
      case "monthly":
        const nextMonthDate = new Date(
          currentDate.setMonth(currentDate.getMonth() + 1)
        );
        return adjustForFridayAndWeekend(nextMonthDate);
      case "quarterly":
        const nextQuarterDate = new Date(
          currentDate.setMonth(currentDate.getMonth() + 3)
        );
        return adjustForFridayAndWeekend(nextQuarterDate);
      default:
        return currentDate;
    }
  };



  const tasks = [
    {
        "_id": {
          "$oid": "66cc6bca98d271d861241793"
        },
        
        "jobHolder": "Javed",
        "task": "update social media weekly report",
        "hours": "2",

        "startDate": {
          "$date": "2024-08-26T00:00:00.000Z"
        },
        "deadline": {
          "$date": "2024-09-08T00:00:00.000Z"
        },

        "nextRecurringDate": "2025-04-25T10:50:55.941+00:00",
        "recurring": "daily",



        "status": "completed",
       
       
        "subtasks": [],
        "createdAt": {
          "$date": "2024-08-26T11:49:30.579Z"
        },
        "updatedAt": {
          "$date": "2024-09-16T06:58:27.750Z"
        },
       
      },
      
  ]




// Main task scheduler
export const autoCreateRecurringTasks = async (req, res) => {

    const now = new Date();
    

    

    

    for (const task of tasks) {
       
       

       

      const res = {
        ...task,
        nextRecurringDate: calculateStartDate(
            task.nextRecurringDate,
            task.recurring
          ),

      }


      console.log(res)
    

       
    }

    
  }





 




  autoCreateRecurringTasks()