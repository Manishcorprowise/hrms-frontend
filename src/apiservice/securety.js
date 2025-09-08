// import React from "react";
// import * as crc32 from "crc-32";
// const CRC_KEY = process.env.REACT_APP_SECURE_KEY;
// export const getSecureKey = (ApiUrl, body) => {
//   const url = new URL(ApiUrl);
//   const queryParams = Object.fromEntries(url.searchParams.entries());
//   const jsonString_b = JSON.stringify(body);
//   const dataWithSecret_b = jsonString_b + CRC_KEY;
//   let bodySecureKey = crc32.str(dataWithSecret_b).toString(16);
//   const jsonString_p = JSON.stringify(queryParams);
//   const dataWithSecret_p = jsonString_p + CRC_KEY;
//   let paramSecureKey = crc32.str(dataWithSecret_p).toString(16);
//   return { bodySecureKey, paramSecureKey };
// };
// export const verifyResponse = (secureKey, body) => {
//   const jsonString_b = JSON.stringify(body);
//   const dataWithSecret_b = jsonString_b + CRC_KEY;
//   let resSecureKey = crc32.str(dataWithSecret_b).toString(16);
//   return secureKey === resSecureKey;
// };
