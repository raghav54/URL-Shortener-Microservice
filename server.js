require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const dns = require('dns');
const urlparser = require('url');
const bodyParser = require("body-parser");
mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true, useUnifiedTopology: true });
const  Schema  = mongoose.Schema;

const sitesSchema = new Schema({
    url:  String
});
const Sites = mongoose.model('Sites', sitesSchema);

app.use(bodyParser.urlencoded({ extended: false }));

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl/', function(req, res) {
const bodyurl = req.body.url;
dns.lookup(urlparser.parse(bodyurl).hostname, (err,address) => {
    if (!address) {
      res.json({ error: 'invalid url' });
    } else {
      const url = new Sites({url:bodyurl});
      url.save(function(err, data) {
     res.json( {
        original_url: data.url,
        short_url: data.id,
      });
     });
      
    }
  });
});
app.get('/api/shorturl/:id', function(req, res) {
const id = req.params.id;
Sites.findById(id,(err,data) =>  {
    if (!data) {
      res.json({ error: 'invalid url' });
    } else {
      res.redirect(data.url);
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

