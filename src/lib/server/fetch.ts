import axios from "axios";

const defaultOption = {
  // url: '/user',
  // method: 'get', // default
  // baseURL: 'https://some-domain.com/api/',
  // transformRequest: [function (data:any, headers:any) {
  //   // Do whatever you want to transform the data
  //   return data;
  // }],
  // `transformResponse` allows changes to the response data to be made before
  // it is passed to then/catch
  // transformResponse: [function (data:any) {
  //   // Do whatever you want to transform the data
  //   return data;
  // }],
  headers: {
    // 'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json; charset=UTF-8',
    // 'Access-Control-Allow-Origin': '*',
  },
  // params: {
  //   ID: 12345
  // },
  // data: {
  //   firstName: 'Fred'
  // },
  timeout: 1000, // default is `0` (no timeout)
  withCredentials: true, // default
  responseType: 'json', // default
};

const commonRes = (p, url, data) => {
  return p.then(async (res) => {
    return res && res.data;
  })
    .then((res: any) => {
      return res.data;
      // if(res) {
      //   if (res.result >= 100 && res.result <= 200) {
      //     if (res.data === false || res.data === 0) {
      //       return false;
      //     }
      //     return res.data
      //   }
      // }
    })
}

// const commonReq = (p:any) => {
//   return p;
// };

const post = (url: string, data: any = {}) => {
  const options: any = Object.assign({}, defaultOption, {
    url,
    method: 'POST',
    data: JSON.stringify(data),
  });
  return commonRes(axios(options), url, data);
  // return 
}

export default {
  // get: commonReq (get),
  // post: commonReq (post),
  post
}

export const FetchApi = {
  add: (...arg: any) => post('/api/slink/api', ...arg),
}