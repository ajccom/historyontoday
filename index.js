const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs-extra')
const path = require('path')

function getDataFromHTML (body, d) {
  const $ = cheerio.load(body)
  let result = {}
  
  let $preview = $('#slideshow')
  
  let $main = $('.main .list')
  
  let previewData = []
  let mainData = []
  
  $preview.find('img').map(function (i, img) {
    previewData.push($(this).attr('alt'))
  })
  
  $main.find('.gong').map(function () {
    let dom = $(this)
    mainData.push({
      d: dom.find('em').html(),
      t: dom.find('i').html()
    })
  })
  
  result = {date: d , previewData: previewData, mainData: mainData }
  
  // console.log(result)
  
  return new Promise((res) => {
    writeFile(path.resolve(`./dist/${d}.json`), JSON.stringify(result, null, 2)).then(() => {
      res({code: 0})
    }).catch(() => {
      res({code: -1})
    })
  })
}

function getDataByDate (month, date) {
  return new Promise(res => {
    let url = `https://lssdjt.com/${month}/${date}/`
    
    request
      .get(url, function(error, response, body) {
        // console.log(response.statusCode) // 200
        // console.log(response.headers['content-type']) // 'image/png'
        // console.log(body)
        
        try {
          getDataFromHTML(body, `${month}/${date}`).then(data => {
            res()
          }).catch(() => { res() })
        } catch (e) {
          console.log(`error when get data from html at ${month}-${date}`, e)
        }
      })
  })
}

function writeFile (file_path, content = "") {
  if (!file_path) {
    return Promise.reject()
  }

  return new Promise((res, rej) => {
    fs.ensureFileSync(file_path)

    fs.writeFile(file_path, content, "utf8", (err, data) => {
      if (err) {
        rej(err)
        console.log('文件写入失败', err)
        return
      }
      res(data)
      
      console.log('文件写入完成')
    })
  })
}

function run (startMonth, startDate) {
  if (startMonth === 12 && startDate > 31) {
    return
  }
  
  if (startDate > 31) {
    startDate = 1
    startMonth += 1
  }
  
  console.log('正在获取数据：', startMonth, startDate)
  
  getDataByDate(startMonth, startDate)
  
  setTimeout(() => {
    run(startMonth, startDate + 1)
  }, 2000)
}

run(12, 31)

// 用于解析输出数据
// 入参是具体一天的 json 数据
// 输出一个中文分号分隔的数组
function getText (json) {
  if (json && json.mainData) {
    let result = []
    
    json.mainData.forEach((item) => {
      result.push(`${item.d} ${item.t}`)
    })
    
    return result
  }
}

function getSubText (json) {
  if (json && json.mainData) {
    let result = []
    
    json.previewData.forEach((item) => {
      result.push(`${item}`)
    })
    
    return result
  }
}



