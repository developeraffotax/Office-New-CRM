// import axios from "axios";

//  const BASE_URL = `${process.env.REACT_APP_API_URL}/api/v1/tickets/signatures`;

// export const api = {
//   list: (params = {}) => axios.get(BASE_URL, { params }).then(r => r.data),
//   get: (id) => axios.get(`${BASE_URL}/${id}`).then(r => r.data),
//   create: (body) => axios.post(BASE_URL, body).then(r => r.data),
//   update: (id, body) => axios.put(`${BASE_URL}/${id}`, body).then(r => r.data),
//   remove: (id) => axios.delete(`${BASE_URL}/${id}`).then(r => r.data),
//   setDefault: (id) => axios.post(`${BASE_URL}/${id}/set-default`).then(r => r.data),
// }; 