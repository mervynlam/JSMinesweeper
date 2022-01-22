/**
 * 
 */
 "use strict";

class WomWebsocket {

    constructor(gameId, callback) {

        this.gameId = gameId
        this.authKey = '95af4c2f98686cdf2a88aae08e570bc5'
        this.session = '0dcbc0b55cb689a8b371e3985d0e7981'
        this.userId = '5195071'
        this.connection
        this.sid
        this.sent = false
        this.sendCount = 0
        this.callback = callback
    }

    getSid(orig_sid) {
        const request = new XMLHttpRequest();
        var url='https://hong3.minesweeper.online/mine-websocket/?authKey='+this.authKey+'&session='+this.session+'&userId='+this.userId+'&EIO=3&transport=polling';
        if (orig_sid) {
            url += '&sid=' + orig_sid
            request.open("GET", url, false);
            request.send();
            return null
        } else {
            request.open("GET", url, false);
            request.send();
            var response = request.responseText
            var json = response.substring(4,response.length-4)
            json = JSON.parse(json)
            return json.sid
        }
    }

    connect() {
        var sid = this.getSid()
        this.getSid(sid)
        if (window.WebSocket) {
            var url = 'wss://hong3.minesweeper.online/mine-websocket/?authKey='+this.authKey+'&session='+this.session+'&userId='+this.userId+'&EIO=3&transport=websocket&sid='+sid
            this.connection = new WebSocket(url);
        }else {
            //否则报错
            console.log('WebSocket Not Supported');
            return;
        }

        this.connection.onmessage = e => {
            var msg = e.data.toString()
            if (msg == '3probe') {
                this.sendMsg('5')
                this.sendMsg('2')
            } 
            else if (msg == '3') {
                if (!this.sent) {
                    this.sendMsg('42["request",["gj4",['+this.gameId+',"Mervyn","CN",0],"282"]]')
                    this.sendMsg('2')
                    this.sent = true
                } else if (this.sendCount++ < 100) {
                    this.sendMsg('2')
                }
            } else if (msg.startsWith('42["response",["G69.i41",')) {
                this.callback(msg)
                this.connection.close()
            }
        }

        this.connection.onopen = _ => {
            this.getBoard()
        }
    }

    sendMsg(text) {
        this.connection.send(text)
    }

    getBoard() {
        this.sendMsg('2probe')
    }
}


WSSHClient.prototype.connect = function (options) {
    var endpoint = this._generateEndpoint();

    if (window.WebSocket) {
        //如果支持websocket
        this._connection = new WebSocket(endpoint);
    }else {
        //否则报错
        options.onError('WebSocket Not Supported');
        return;
    }

    this._connection.onopen = function () {
        options.onConnect();
        //开始连接，启动心跳检查
        // heartCheck.start();
    };

    this._connection.onmessage = function (evt) {
        var data = evt.data.toString();
        //如果是返回心跳，不执行onData();方法
        if (data !== "Heartbeat healthy") {
            options.onData(data);
        } else {
            //心跳健康，重置重连次数
            reconnectTimes = 0;
        }
        //收到消息，重置心跳检查
        // heartCheck.start();
    };


    this._connection.onclose = function (evt) {
        options.onClose();
        reconnect(options);
    };
};

WSSHClient.prototype.send = function (data) {
    this._connection.send(JSON.stringify(data));
};

WSSHClient.prototype.sendInitData = function (options) {
    //连接参数
    this._connection.send(JSON.stringify(options));
}

//关闭连接
WSSHClient.prototype.close = function () {
    this._connection.close();
}

var client = new WSSHClient();