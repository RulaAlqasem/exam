const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const { get } = require('superagent');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT;
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/char', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

const Schema = mongoose.Schema;

const characters = new Schema({
  nam: String,
  slug: { type: String, unique: true, trim: true },
  gender: String,

  power: Array,
});
const charactersModal = mongoose.model('characters', characters);

app.get('/', (req, res) => {
  res.send('hello from backend ')
});

app.get('/psy', (req, res) => {

  const url = `https://psychonauts-api.herokuapp.com/api/characters?limit=11`

  superagent.get(url).then(ele => {
    const dataArray = ele.body.map((element) => { return new PsyGame(element) })
    res.send(dataArray);
  }).catch(err => { console.log(err) })
});


//-------crud



app.get('/psy/fav', (req, res) => {
  charactersModal.find({}, (err, data) => {
    res.send(data)
  })
});


app.post('/psy/fav', (req, res) => {
  const {
    name,
    gender,
    power
  } = req.body;
  const slug = name.split(' ').join('-');
  charactersModal.find({ slug: slug }, (err, data) => {
    if (data.length > 0) {
      res.send('already there')
    } else {
      const newChar = new charactersModal({
        name: name,
        gender: gender,
        power: power,
        slug: slug
      })
      newChar.save();
      res.send(newChar)

    }
  })

});


app.delete('/psy/fav/:slug', (req, res) => {
  const slug = req.params.slug;
  charactersModal.remove({ slug: slug }, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      charactersModal.find({}, (err, data) => {
        res.send(data)
      })
    }
  })

});


app.put('/psy/fav/:slug', (req, res) => {
  const slug = req.params.slug;
  const {
    name,
    gender,


  } = req.body;
  charactersModal.findByIdAndDelete({ slug: slug }, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      data[0].name = name;
      data[0].gender = gender;
      data[0].save();
      res.send(data)
    }
  })
});

class PsyGame {
  constructor(data) {
    this.name = data.name,
      this.gender = data.gender,
      this.img = data.img,
      this.power = data.psiPowers
  }
}


app.listen(PORT, () => {
  console.log(`Server started on${PORT}`);
});