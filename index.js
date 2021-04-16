const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
app.use(cors());

app.use(express.urlencoded({ extended:true }));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tqgoj.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    console.log('db connected')
  const reviewCollection = client.db(`${process.env.DB_NAME}`).collection('reviews');
  const serviceCollection = client.db(`${process.env.DB_NAME}`).collection('services');
  const ordersCollection = client.db(`${process.env.DB_NAME}`).collection('orders');

  app.post('/addService', (req, res) => {
    const services = req.body;
    serviceCollection.insertOne(services)
    .then(result=> {
      console.log(result);
      res.send(result.insertCount > 0)
    }) 
  })

  app.get('/checkout/:id', (req, res) => {
    serviceCollection.find({_id: ObjectId(req.params.id)})
    .toArray((err, result)=>{
      res.send(result[0]);
    })
  })



  app.post('/orderInfo', (req,res)=>{
    const newInfo = req.body;
    ordersCollection.insertOne(newInfo)
    .then(result=> {
      console.log(result);
      res.send(result.insertCount > 0)
    }) 
  })

  app.get('/orders', (req, res) => {
    ordersCollection.find({})
    .toArray((err, documents)=>{
      res.send(documents);
    })
  })

  app.get('/purchase', (req, res)=>{
    ordersCollection.find({email: req.query.email})
    .toArray((err, documents)=>{
      res.send(documents);
    })
  })

  app.post('/addReview', (req, res) => {
    const users = req.body;
    reviewCollection.insertOne(users)
    .then(result=> {
      console.log(result);
      res.send(result.insertCount > 0)
    }) 
  })

  app.get('/review', (req, res) => {
    reviewCollection.find({})
    .toArray((err, reviews)=>{
      res.send(reviews)
    })
  })



  app.get('/services', (req, res)=>{
    serviceCollection.find({})
    .toArray((err, services)=>{
      res.send(services)
    })
  })

  app.delete('/delete/:id', (req, res)=>{
    serviceCollection.deleteOne({_id: ObjectId(req.params.id)})
    .then((err, result)=>{     
    })
  }) 


app.get('/', (req, res) => {
    res.send('Database is Working')
  }) 

})

const port = process.env.PORT || 8080;
  
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
}) 