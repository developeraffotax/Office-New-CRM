// import cluster from "cluster";
// import os from "os";
// import { createServer } from "./main.js";

// // Clustering setup
// const setupCluster = (port) => {
//   if (cluster.isPrimary) {
//     const numCPUs = os.cpus().length;
//     console.log(`Primary process ${process.pid} is running`.bgGreen.white);

//     // Fork workers
//     for (let i = 0; i < numCPUs; i++) {
//       cluster.fork();
//     }

//     // Restart workers on exit
//     cluster.on("exit", (worker, code, signal) => {
//       console.log(`Worker ${worker.process.pid} exited. Forking a new one...`);
//       cluster.fork();
//     });
//   } else {
//     // Worker logic: Run the server
//     createServer(port);
//   }
// };

// export default setupCluster;
