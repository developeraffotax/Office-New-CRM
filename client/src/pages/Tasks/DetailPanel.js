// import axios from "axios";
// import React, { useEffect, useRef, useState } from "react";
// import toast from "react-hot-toast";


// export default function DetailPanel({
//   row
// }) {


//   useEffect(() => {
//     console.log(row, "THE ROW IS>>>>>>>>>>>>>>>> in Detaill USEFEECT")
//     getSingleTask()
//   }, [row])

//   //    -----------Single Task----------
//   const getSingleTask = async () => {
   
//     try {
//       const { data } = await axios.get(
//         `${process.env.REACT_APP_API_URL}/api/v1/tasks/get/single/${row.original._id}`
//       );
//         console.log(data, "THE FETCHED DATA IS>>>>>>>>>>>>>>>> in Detaill")
//     } catch (error) {
//       console.log(error)
//       toast.error(error?.response?.data?.message || "Error in single task!");
//     } 
//   };


//   return (
//     <div>
//       <h1>Hello</h1>
//       <h2>Hello</h2>
//       <h2>Hello</h2>
//     </div>
//   )
// }
