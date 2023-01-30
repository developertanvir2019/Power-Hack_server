const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const mongoose = require('mongoose')
const User = require('./models/userSchema')
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();
//   middleware
app.use(cors());
app.use(express.json());

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.czo9kw9.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(url);


async function run() {
    try {
        const billCollections = client.db('Power-Hack').collection('billCollection');
        app.get('/', async (req, res) => {
            res.send('programming hero job task server running..')
        })

        // post bill 

        app.post('/add-billing', async (req, res) => {
            try {
                const billing = req.body;
                console.log(billing);
                const result = await billCollections.insertOne(billing);
                res.send(result)
            } catch (err) {
                res.send(err)
            }
        })


        // get all Bill

        app.get('/billing-list', async (req, res) => {
            try {
                const cursor = billCollections.find({});
                const allBillings = await cursor.toArray();
                res.send(allBillings)
            } catch (err) {
                res.send({
                    success: false,
                    error: err.message,
                })
            }
        })

        //delete billings
        app.delete('/delete-billing/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const query = { _id: ObjectId(id) };
                const result = await billCollections.deleteOne(query);
                res.send(result);
            } catch (error) {
                console.error(error.message);
            }
        });

        //get single items data
        app.get('/edit/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const cursor = billCollections.find(query);
            const singleBill = await cursor.toArray();
            res.send(singleBill)
        })


        //Update one 
        app.put('/update-billing/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const oldBill = req.body;
            const option = { upsert: true };
            const updatedBill = {
                $set: {
                    name: oldBill.name,
                    email: oldBill.email,
                    phone: oldBill.phone,
                    amount: oldBill.amount,
                }
            }
            const result = await billCollections.updateOne(filter, updatedBill, option);
            res.send(result)
        })


        //registration part
        app.post('/registration', async (req, res) => {
            console.log(req.body);
        });






    }
    catch (err) {

    }
}

run()


app.listen(port, () => console.log(`server running on port ${port}`))