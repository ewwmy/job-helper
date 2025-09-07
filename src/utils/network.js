const { URL } = require('node:url')
const https = require('node:https')
const zlib = require('node:zlib')

const getHtmlFrom = async (url) => {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url)
    const options = {
      protocol: parsedUrl.protocol,
      port: parsedUrl.port,
      host: parsedUrl.host,
      hostname: parsedUrl.hostname,
      origin: parsedUrl.origin,
      path: parsedUrl.pathname + parsedUrl.search,
      headers: {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "max-age=0",
        "dnt": "1",
        "priority": "u=0, i",
        "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Google Chrome\";v=\"138\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Linux\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
      },
    }

    let data
    https.get(options, (res) => {
      let stream = res
  
      const encoding = res.headers['content-encoding']
      if (encoding === 'gzip') {
        stream = res.pipe(zlib.createGunzip())
      } else if (encoding === 'deflate') {
        stream = res.pipe(zlib.createInflate())
      } else if (encoding === 'br') {
        stream = res.pipe(zlib.createBrotliDecompress())
      }

      stream.on('data', (chunk) => data += chunk)
      stream.on('end', () => {
        resolve(data)
      })
      stream.on('error', (error) => {
        reject(error)
      })
    })
  })
}

module.exports = {
  getHtmlFrom,
}
