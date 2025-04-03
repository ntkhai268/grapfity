const express = require('express') //đây là commonjs module: const <tên hàm> = require('<tên file module>')
const app = express() 
require('dotenv').config() //đọc file .env và lưu vào biến process.env 
const port = process.env.PORT
const hostname = process.env.HOSTNAME

//config  template engine cho express
app.set('views', './src/views') //set thư mục chứa template là views
app.set('view engine', 'ejs') //set template engine cho express là ejs

//khai báo route cho ứng dụng express
//route là một URL mà ứng dụng express sẽ lắng nghe và phản hồi lại khi có request đến
app.get('/', (req, res) => {  
  // res.send('Hello World!') 
  res.render('sample.ejs')
})

app.get('/abc', (req, res) => {  
  //cú pháp: app.METHOD(PATH, HANDLER)
  //METHOD: là phương thức HTTP mà ứng dụng express sẽ lắng nghe})
  //PATH: là đường dẫn mà ứng dụng express sẽ lắng nghe
  //HANDLER: là hàm xử lý request và response
  res.send('Khai dep gái') 
})

app.listen(port, hostname, () => {
  console.log(`Example app listening on port ${port}`)
})