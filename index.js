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
  const adminCollection = client.db(`${process.env.DB_NAME}`).collection('admins');

    // service added by admin from client side
  app.post('/addService', (req, res) => {
    const services = req.body;
    serviceCollection.insertOne(services)
    .then(result=> {
      console.log(result);
      res.send(result.insertCount > 0)
    }) 
  })

  // customer checkout info when he clicks buy now, for specific id
  app.get('/checkout/:id', (req, res) => {
    serviceCollection.find({_id: ObjectId(req.params.id)})
    .toArray((err, result)=>{
      res.send(result[0]);
    })
  })


    // admin can see all order placed by customers
  app.post('/orderInfo', (req,res)=>{
    const newInfo = req.body;
    ordersCollection.insertOne(newInfo)
    .then(result=> {
      console.log(result);
      res.send(result.insertCount > 0)
    }) 
  })

    // posting admin email from client side
  app.post('/makeAdmin', (req,res)=>{
    const newInfo = req.body;
    adminCollection.insertOne(newInfo)
    .then(result=> {
      console.log(result);
      res.send(result.insertCount > 0)
    }) 
  })

    // sending admin email to client side
  app.get('/isAdmin', (req, res)=>{
    
    adminCollection.find({email : req.query.email})
    .toArray((err, admins)=>{
      res.send(admins);
      
    })
  })

    // admin will see placed orders
  app.get('/orders', (req, res) => {
    ordersCollection.find({})
    .toArray((err, orders)=>{
      res.send(orders);
    })
  })

    // customer can see his previous service purchases
  app.get('/purchase', (req, res)=>{
    ordersCollection.find({email: req.query.email})
    .toArray((err, documents)=>{
      res.send(documents);
    })
  })

  
    // customer can add user review from dashboard
  app.post('/addReview', (req, res) => {
    const users = req.body;
    reviewCollection.insertOne(users)
    .then(result=> {
      console.log(result);
      res.send(result.insertCount > 0)
    }) 
  })

    // customer reviews can be seen from home page
  app.get('/review', (req, res) => {
    reviewCollection.find({})
    .toArray((err, reviews)=>{
      res.send(reviews)
    })
  })


    // services list can be seen at home page
  app.get('/services', (req, res)=>{
    serviceCollection.find({})
    .toArray((err, services)=>{
      res.send(services)
    })
  })

    // admin can delete specific services
  app.delete('/delete/:id', (req, res)=>{
    serviceCollection.deleteOne({_id: ObjectId(req.params.id)})
    .then((err, result)=>{     
    })
  }) 

  // admin can change the state by updating
  app.post('/updateOrderStatus', (req, res)=>{
    const order = req.body;
    console.log(order.id, order.status);
    ordersCollection.updateOne(
      {_id: ObjectId(order.id)},
      {
        $set: {orderStatus: order.status}
        
      },
      (err, result)=>{
        if(err){
          console.log('error')
          res.status(500).send({message: err})
        }
        else{
          res.send(result)
          console.log('successful')
        }
      }
      )
  })

app.get('/', (req, res) => {
    res.send('Database is Working')
  }) 

})

const port = process.env.PORT || 8080;
  
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
}) 