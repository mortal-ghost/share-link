const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const filesRoute = require('./routes/files');
const showRoute = require('./routes/show');
const downloadRoute = require('./routes/download');
const PORT = process.env.PORT || 3000;
const app = express();

connectDB();


app.use(express.static('public'));
app.use('views', express.static('views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/api/files', filesRoute);
app.use('/files', showRoute);
app.use('/files/download', downloadRoute);

app.use((req, res, next) => {
    res.locals.baseURL = process.env.APP_BASE_URL;
    next();
});

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});