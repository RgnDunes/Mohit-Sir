var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('button clicked');
});

router.post('/api/add', function(req, res, next) {
  const { num1, num2 } = req.body;
  if (isNaN(num1) || isNaN(num2)) {
    return res.status(400).send('Invalid input');
  }
  const sum = parseInt(num1) + parseInt(num2);
  res.json({ sum });

});

router.get('/api/subtract', function(req, res, next) {
  const { num1, num2 } = req.query;
  if (isNaN(num1) || isNaN(num2)) {
    return res.status(400).send('Invalid input');
  }
  const diff = parseInt(num1) - parseInt(num2);
  res.json({ diff });

});
module.exports = router;
