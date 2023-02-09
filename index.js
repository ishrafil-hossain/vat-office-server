const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const { query } = require('express');
const { json } = require('express/lib/response');

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Hello Ishrafil this is vat office server');
})

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.y6gag.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// to check database connected or not 
client.connect()
    .then(result => {
        console.log('mongoDb connected')
    })
    .catch(error => {
        console.log('mongoDb not connected')
    })


async function run() {
    try {
        await client.connect();
        const database = client.db('vat_office');
        const filesCollection = database.collection('files');
        const usersCollection = database.collection('users');
        const adminCollection = database.collection('admins');
        const receptionistCollection = database.collection('receptionist');


        // make admin api
        app.post("/admin", async (req, res) => {
            const admin = req.body;
            const result = await adminCollection.insertOne(admin);
            res.json(result);
        })

        // get admin api
        app.get("/admin", async (req, res) => {
            const cursor = adminCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })
        // make receptionist api
        app.post("/receptionist", async (req, res) => {
            const receptionist = req.body;
            const result = await receptionistCollection.insertOne(receptionist);
            res.json(result);
        })

        // get receptionist api
        app.get("/receptionist", async (req, res) => {
            const cursor = receptionistCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        // find a single file via person email 
        app.get('/files', async (req, res) => {
            const name = req.query.name;
            const query = { personName: name }
            const cursor = filesCollection.find(query);
            const files = await cursor.toArray();
            res.json(files);
        });

        // find a single file via product id 
        app.get('/files/update/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
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
            const query = { _id: new ObjectId(id) };
            const result = await filesCollection.deleteOne(query);
            res.json(result);
        });

        // post or add a file 
        app.post('/files', async (req, res) => {
            const file = req.body;
            const result = await filesCollection.insertOne(file);
            res.json(result);
        });

        // Update file or send file 
        app.put('/users/:id', async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    department: updatedUser.department,
                    personName: updatedUser.personName
                },
            };
            const result = await filesCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // Update file's all information
        app.put('/users/update/:id', async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    fileName: updatedUser.fileName,
                    company: updatedUser.company,
                    date: updatedUser.date_time,
                    department: updatedUser.department,
                    personName: updatedUser.personName
                },
            };
            const result = await filesCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // post or add a user in database 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const users = await cursor.toArray();
            res.json(users);
        });

    }
    finally {

    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`Listening port :${port}`)
})