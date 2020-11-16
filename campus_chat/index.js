/* eslint-disable no-console */
import express from 'express';
// import session from 'express-session';
import logger from 'morgan';
import path from 'path';
import socket from './socketio';
import db from './models';

require('dotenv').config();

const app = express();
db.sequelize
  .sync()
  .then(() => console.log('DB 서버 연결 성공!'))
  .catch(err => console.error(err));

app.set('host', process.env.ENV || 'localhost');
app.set('port', process.env.PORT || 8001);
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger(process.env.ENV || 'dev'));
app.use('/', express.static(path.resolve(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('home', {});
});

const server = app.listen(app.get('port'), () => {
  console.log(`listening on http://${app.get('host')}:${app.get('port')}`);
});

socket(server, app);