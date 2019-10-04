/**
 * Created by LamHa on 4/16/2016.
 */
function MessageDecoder() {
    var p = MessageDecoder.prototype;

    p.setTea = function (tea) {
        this.tea = tea;
    }

    p.decode = function (arrayBuffer) {
        console.log("--- Decode message");
        var dataView = new DataView(arrayBuffer);
        var protocol = dataView.getInt8(0);
        var dataLength = dataView.getInt32(1);
        var isEncrypt = dataView.getInt8(5);
        var commandId, content;
        if (isEncrypt == true) {
        } else {
            commandId = dataView.getInt16(6);
            content = new Int8Array(arrayBuffer, 8);
        }
        return new Message(commandId, content, isEncrypt);
    }

}