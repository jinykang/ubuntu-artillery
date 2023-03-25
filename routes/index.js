var express = require('express');
var router = express.Router();

//ORM DB객체 참조 
var db = require('../models/index');

//bcryptjs참조
const bcrypt = require('bcryptjs');


/* 샘플 홈페이지 호출 라우팅메소드 */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* 
-모든 사용자 대상 채팅 페이지 호출 라우팅 메소드
-호출주소: http://localhost:3000/chat
*/
router.get('/chat', function(req, res, next) {
  res.render('chat.ejs');
});


/* 
-그룹 채팅-채팅방 기반 채팅 페이지 호출 라우팅 메소드
-호출주소: http://localhost:3000/groupchat
*/
router.get('/groupchat', function(req, res, next) {
  res.render('groupchat.ejs');
});


/* 
-스몰 그룹 채팅-채팅방 기반 채팅 페이지 호출 라우팅 메소드
-호출주소: http://localhost:3000/smallchat?roomid=room1&nickname=eddy
*/
router.get('/smallchat', function(req, res, next) {

  var roomid = req.query.roomid;
  var nickname = req.query.nickname;

  res.render('smallchat.ejs',{roomid:roomid,nickname:nickname});
});


//회원가입 페이지 호출 라우팅메소드
//http://localhost:3000/entry
router.get('/entry', async(req, res, next)=>{
  res.render('entry.ejs');
});

//회원가입 데이터 처리 라우팅 POST 메소드
//회원가입 폼태그내 INPUT요소의 값을 수집하고 데이터를 처리한다.
router.post('/entry', async(req, res, next)=>{

  var email = req.body.email;
  var member_pwd = req.body.member_pwd;
  var name = req.body.name;
  var birthday = req.body.birthday;
  var profile_path = req.body.profile_path;
  var entry_state_code = req.body.entry_state_code;

  //사용자 입력 암호를 해쉬암호화 기법 적용한 암호화된 문자열 생성하기
  var encryptPwd = await bcrypt.hash(member_pwd,12);

  //Member테이블에 저장할 회원가입 사용자 데이터 정의/세팅
  var userData ={
    email,
    member_pwd:encryptPwd,
    name,
    birthday,
    profile_path,
    entry_state_code,
    entry_date:Date.now()
  }

  //db.모델.create()호출하면 db에 저장된 데이터가 반환된다.
  var dbUserData = await db.Member.create(userData);

  //메인 페이지로 리다이렉션 처리 
  res.redirect('/');

});

//로그인후 사용자 정보를 확인할수 있는 프로필 페이지 제공 라우팅 메소드
//http://localhost:3000/profile
//반드시 로그인한 사용자만 호출가능/로그인 안한경우는 로그인 페이지로 되돌려보낼것..
router.get('/profile', async(req, res, next)=>{

  if(req.session.isLogined == undefined){
    res.redirect("/login");
  }else{
    res.render('profile.ejs',{memberName:req.session.loginUser.userName});
  }

});

//로그인 페이지 호출 라우팅메소드
router.get('/login', async(req, res, next)=>{
  res.render('login.ejs',{loginResult:""});
});

//로그인 처리(인증=Authentication)
//사용자 인증 및 세션처리 기능제공 
router.post('/login1', async(req, res, next)=> {

  var userid = req.body.email;
  var userpwd = req.body.password;

  var member = await db.Member.findOne({where:{email:userid}});


  var loginResult = "";

  if(member != null){

    loginResult ="사용자 아이디가 존재합니다.";
    var isCorrectPwd = await bcrypt.compare(userpwd,member.member_pwd);

      if(isCorrectPwd){
        loginResult ="동일한 암호입니다.";

        req.session.isLogined = true;

        req.session.loginUser ={
          userSeq:member.member_id,
          userId:member.email,
          userName:member.name,
          userProfile:member.profile_path
        };


        req.session.save(function(){
            res.redirect('/');
        });


      }else{
        loginResult ="사용자 암호가 동일하지 않습니다.";
        res.render('login',{loginResult});
      }

  
  }else{
    loginResult ="사용자 아이디가 존재하지 않습니다.";
    res.render('login',{loginResult});
  }
});


//API부하 테스트1 
//GET방식
//http://localhost:3000/api/test1?name=eddy
//http://20.194.2.144:3022/api/test1?name=eddy
router.get('/api/test1', async(req, res, next)=>{
  var userName = req.query.name;
  
  var members = await db.Member.findAll({where:{name:userName}});

  res.json(members);
});




//API부하 테스트2
//POST방식
//http://localhost:3000/api/test2
router.post('/api/test2', async(req, res, next)=>{

  var userName = req.body.name;

  console.log("호출주소 POST방식 /api/test2:",userName);
  
  var members = await db.Member.findAll({where:{name:userName}});

  res.json(members);
});




module.exports = router;
