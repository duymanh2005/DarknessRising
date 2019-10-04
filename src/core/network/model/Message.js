/**
 * Created by LamHa on 4/16/2016.
 */
function Message(commandId, content, isEncrypt) {
    this.commandId = commandId;
    this.content = content;
    this.isEncrypt = isEncrypt;

    var p = Message.prototype;
    p.toString = function () {
        return "{commandId:" + commandId + ", content:" + content + ", isEncrypt:" + isEncrypt + "}";
    }
}