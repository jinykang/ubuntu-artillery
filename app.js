var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var debug = require('debug');


var sequelize = require('./models/index.js').sequelize;


//express기반 서버세션 관리 팩키지 참조하기 
var session = require('express-session');

//socket.io 팩키지 참조 
const SocketIO = require("socket.io"); 


//웹소켓 모듈추가
const webSocket = require('./socket');



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

//mysql과 자동연결처리 및 모델기반 물리 테이블 생성처리제공
sequelize.sync(); 


//노드 어플리케이션의 세션 기본 설정값 세팅하기 
app.use(
  session({
    resave: false,//세션을 항상 저장할지여부
    saveUninitialized: true, //세션이 저장되기전 초기화 안된상태로 미리 저장공간을 만들지여부
    secret: "testsecret", //세션키값을 암호할때 사용할 키값
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge:1000 * 60 * 5 //5분동안 서버세션을 유지하겠다.(1000은 1초)
    },
  }),
);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);






// 404에러 발생시 처리를 위한 미들웨어 기능 적용
// 사용자 요청 웹 리소스를 못찾는 경우 발생 
app.use(function(req, res, next) {
  next(createError(404));
});



//Node App 전역예외처리기-라우팅파일/View 파일에서 에러발생시 에러페이지로 이동처리
app.use(function(err, req, res, next) {
  console.log("에러 핸들러 호출:",err);

  //뷰 전역데이터 속성 정의 
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


//app.js로 통합적용 코드 적용
//어플리케이션 웹사이트 포트설정
app.set('port', process.env.PORT || 3000);

//웹어플리케이션 웹사이트 오픈 
var server = app.listen(app.get('port'), function () {
    //debug('Express server listening on port ' + server.address().port);
});

//웹서버 연결 에러 이벤트 처리기 설정
server.on('error', onError);

//listening 이벤트 처리기 설정
server.on('listening', onListening);


//웹소켓 express서버와 연결처리
webSocket(server);


//웹서버 연결/통신 에러 처리기
function onError(error) {

  console.log("웹서버 연결/통신 에러 발생:",error);

  if (error.syscall !== 'listen') {
      throw error;
  }

  var bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
      case 'EACCES':
          console.error(bind + ' requires elevated privileges');
          process.exit(1);
          break;
      case 'EADDRINUSE':
          console.error(bind + ' is already in use');
          process.exit(1);
          break;
      default:
          throw error;
  }
}

//listening 이벤트 처리기
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
