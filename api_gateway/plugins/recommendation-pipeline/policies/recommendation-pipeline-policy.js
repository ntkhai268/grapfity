// const axios = require('axios');
// // const  schema = require('./schema.json')


// module.exports = {
//   name: 'recommendation-pipeline-policy',
//   schema: {
//   "$id": "http://express-gateway.io/schemas/policies/recommendation-pipeline-policy.json",
//   "type": "object",
//   "properties": {
//     "recommenderService": {
//       "type": "string",
//       "format": "uri"
//     },
//     "backendService": {
//       "type": "string",
//       "format": "uri"
//     }
//   },
//   "required": ["recommenderService", "backendService"]
// },
//  policy: (actionParams) => {
//     return (req, res, next) => {
//      res.status(200).json({
//         mess: "hi",
//         data: res.locals.result  // gắn dữ liệu từ bước trước
//       });
//     };
//   }
// };