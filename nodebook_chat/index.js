// modules
import express from 'express';
import path from 'path';
import logger from 'morgan';
import cookie from 'cookie-parser';
import session from 'express-session';
import flash from 'connect-flash';
import webSocket from './src/socket';
import { sequelize } from './src/models';
import ColorHash from 'color-hash';
require('dotenv').config();

// router
import indexRouter from './src/routes/indexRouter';


const app = express();
sequelize.sync()
  .then(() => console.log('Maria DB Connected'))
  .catch((err) => console.error(err));
const sessionMiddleware = session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  }
})

app.set('views', path.resolve(__dirname, 'src', 'views'));
app.set('view engine', 'pug');
app.set('port', process.env.PORT || 8002);


app.use(logger('dev'));
app.use(express.static(path.resolve(__dirname, 'src', 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookie(process.env.COOKIE_SECRET));
app.use(sessionMiddleware);
app.use(flash());
app.use((req, res, next) => {
  if (!req.session.color) {
    const colorHash = new ColorHash();
    req.session.color = colorHash.hex(req.sessionID);
  }
  next();
});


app.use('/', indexRouter);

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

const server = app.listen(app.get('port'), () => {
  console.log(`http://localhost:${app.get('port')} on Listening`);
});

// socket
webSocket(server, app, sessionMiddleware);