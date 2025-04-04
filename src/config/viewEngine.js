const express = require('express') 

const configViewEngine = (app) => {
    //config  template engine cho express
    app.set('views', './src/views') //set thư mục chứa template là views
    app.set('view engine', 'ejs') //set template engine cho express là ejs
    //config static file cho express
    app.use(express.static('./src/public')) //set thư mục chứa static file là public
}

module.exports = configViewEngine //export hàm configViewEngine để sử dụng ở file khác 