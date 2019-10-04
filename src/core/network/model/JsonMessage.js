/**
 * Created by LamHa on 4/16/2016.
 */
function JsonMessage(command, data, userName) {
    this.command = command;
    this.data = data;
    this.userName = userName = "";

    var p = JsonMessage.prototype;
    p.getCommand = function () {
        return this.command;
    }

    p.setCommand = function(command){
        this.command = command;
    }

    p.getData = function(){
        return this.data;
    }

    p.setData = function(data){
        this.data = data;
    }

    p.setUserName = function(userName){
        this.userName = userName;
    }

    p.toString = function(){
        return JSON.stringify(this);
    }
}