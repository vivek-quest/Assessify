const express = require('express');
const mongoose = require('mongoose');

const { apiKeyAuth, auth } = require('./middleware/auth');
const { MONGODB_URI, PORT } = require('./config/config');
const { ROLE } = require('./config/enum');


const app = express();
app.use(express.json());

mongoose.connect(MONGODB_URI, { useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/institutes', apiKeyAuth, auth([ROLE.INSTITUTE]), require('./routes/institutes'));
app.use('/api/candidates', apiKeyAuth, auth([ROLE.CANDIDATE]), require('./routes/candidates'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
