const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {  
  res.render('sample.ejs')
})

router.get('/abc', (req, res) => {  
  res.send('Khai dep gái traoiiiiiaaa') 
})

module.exports = router; //export router để sử dụng ở file khác