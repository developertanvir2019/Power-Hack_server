const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { mongodb, MongoClient, ObjectId } = require('mongodb');
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
        const usersCollections = client.db('Power-Hack').collection('users');
        app.get('/', async (req, res) => {
            res.send('programming hero job task server running..')
        })

        const authenticateJWT = (req, res, next) => {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                return res.status(401).send({ error: 'No authorization header' });
            }

            const token = authHeader.split(' ')[1];

            jwt.verify(token, 'secret', (error, decoded) => {
                if (error) {
                    return res.status(401).send({ error: 'Invalid token' });
                }

                req.user = decoded;
                next();
            });
        };

        app.get('/private', authenticateJWT, (req, res) => {
            res.send({ message: 'Hello from a private endpoint' });
        });


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
                const page = parseInt(req?.query?.page);
                const size = parseInt(req?.query?.size);
                console.log(page, size);
                const cursor = billCollections.find({});
                const allBillings = await cursor.skip(page * size).limit(size).toArray();
                const count = await billCollections.estimatedDocumentCount();
                res.send({ count, allBillings })
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
            const { email, password } = req.body;
            // Validate the password
            if (password.length < 8) {
                return res.status(400).send({ error: 'Password must be at least 8 characters long' });
            }

            try {
                // Check if the email address already exists in the database
                const existingUser = await usersCollections.findOne({ email });
                if (existingUser) {
                    return res.status(400).send({ error: 'Email address already in use' });
                }

                // Insert the user into the collection
                await usersCollections.insertOne({ email, password });

                res.send({ message: 'User registered successfully' });
            } catch (error) {
                console.error(error);
                res.status(500).send({ error: 'Server error' });
            }
        });



        app.post('/login', async (req, res) => {
            const { email, password } = req.body;

            try {
                // Find the user by email
                const user = await usersCollections.findOne({ email });

                // Compare the hashed password
                if (!user || password !== user.password) {
                    return res.status(401).send({ error: 'Invalid email or password' });
                }

                // Sign the JWT with the user information
                const token = jwt.sign({ sub: user._id, email: user.email }, 'secret');

                // Return the JWT to the client
                res.send({ token });
            } catch (error) {
                console.error(error);
                res.status(500).send({ error: 'Server error' });
            }
        });




    }
    catch (err) {

    }
}

run()


app.listen(port, () => console.log(`server running on port ${port}`))