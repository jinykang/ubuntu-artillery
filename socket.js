//socket.io 팩키지 참조 
const SocketIO = require("socket.io");

//socket.io-redis참조
var redis = require("socket.io-redis");


module.exports =(server)=>{


    //const io = SocketIO(server,{path:"/socket.io"});

    const io = SocketIO(server, {
        path: "/socket.io",
        cors: {
        origin: "*",
        methods: ["GET", "POST"],
        },
    });


    //Redis Backplain 연결설정
    // io.adapter(
    //     redis({
    //         host: "127.0.0.1",
    //         port: "6379",
    //     })
    // );


    io.on("connection",(socket)=>{


        socket.on("broadcast",function(msg){

            io.emit("receiveAll",msg);
            //socket.broadcast.emit("receive",msg);
        });

        socket.on("test1",function(msg1,msg2){
            io.emit("receive1",msg1,msg2);
        });

        socket.on("test2",function(data){
            io.emit("receive2",data);
        });

 
        socket.on("entry",function(roomId,nickName){

            //채팅방 사용자 입장처리하기 
            socket.join(roomId);
            
            //현재 입장 사용자에게만 메시지를 전송한다.
            socket.emit("entryok",`${nickName}님 으로 입장했습니다.`);

             //현재 접속자를 제외한 같은 채팅방내 모든 사용자에게 메시지 발송
             socket.to(roomId).emit("entryok",`${nickName}님이 채팅방에 입장했습니다`);
        });

        
        socket.on("groupmsg",function(roomId,msg){

            //그룹채팅방 사용자에게만 메시지를 발송한다.
            //서버에 연결된 모든사용자가 아닌 지정 채팅방에 입장한 모든사용자에게 
            //메시지를 보낼떄는 io.to(채팅방아이디값).emit()
            io.to(roomId).emit("receiveGroupMsg",roomId,msg);
        });


        //그룹 메시지 성능테스트 
        socket.on("groupmsgtest",function(msg){

            //그룹채팅방 사용자에게만 메시지를 발송한다.
            //서버에 연결된 모든사용자가 아닌 지정 채팅방에 입장한 모든사용자에게 
            //메시지를 보낼떄는 io.to(채팅방아이디값).emit()
            io.to("room1").emit("receiveGroupMsg","room1",msg);
        });


        //그룹 메시지 성능테스트 -JOSN
        socket.on("groupmsgtest2",function(data){
                io.to(data.roomid).emit("receiveGroupMsg",data.roomid,data.msg);
        });


        //스몰그룹채팅: 채팅방 클라이언트 메시지 수신 및 클라이언트로 발신처리하기 
        //그룹 메시징 수신 및 발송
        socket.on("smallmsg",function(roomId,nickName,msg){
            io.to(roomId).emit("receiveSmallMsg",nickName,msg);
        });
        

    });
}


