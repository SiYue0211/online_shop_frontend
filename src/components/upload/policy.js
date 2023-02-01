import http from '@/utils/httpRequest.js'
export function policy (file) {
  return new Promise((resolve, reject) => {
    console.log(file)
    http({
      url: http.adornUrl('/thirdparty/s3/presignedurl/' + file.name),
      method: 'get',
      params: http.adornParams({})
    }).then(({ data }) => {
      resolve(data)
    })
  })
}
