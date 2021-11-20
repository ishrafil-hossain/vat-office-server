const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y6gag.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        // console.log('database connnect successfully');
        const database = client.db('vat_office');
        const filesCollection = database.collection('files');
        const usersCollection = database.collection('users');

        // find a single file via person email 
        app.get('/files', async (req, res) => {
            const email = req.query.email;
            const query = { personEmail: email }
            const cursor = filesCollection.find(query);
            const files = await cursor.toArray();
            res.json(files);
        });

        // find all files 
        app.get('/files/user', async (req, res) => {
            const cursor = filesCollection.find({});
            const files = await cursor.toArray();
            res.json(files);
        });

        // Delete a single files
        app.delete('/files/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await filesCollection.deleteOne(query);
            res.json(result);
        });

        // post or add a file 
        app.post('/files', async (req, res) => {
            const file = req.body;
            const result = await filesCollection.insertOne(file);
            res.json(result);
        });

        // post or add a user in database 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Ishrafil this is vat office server');
})

app.listen(port, () => {
    console.log(`Listening port :${port}`)
})