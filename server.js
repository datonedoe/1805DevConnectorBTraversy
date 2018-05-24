const express = require('express');
const mongoose = require('mongoose');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express();

// DB config
const db = require('./config/keys').mongoURI;

// Connec to mongoDB
mongoose.connect(db)
    .then(() => console.log('MongoDB on mLab connected'))
    .catch(err => console.log('DB connection failed:', err));

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Hello');
});

// Use routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);


app.listen(PORT, ()=>{
    console.log('Server started on', PORT);
})