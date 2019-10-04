/**
 * Created by LamHa on 4/16/2016.
 */
function MessageEncoder() {
    var p = MessageEncoder.prototype;

    p.setTea = function (tea) {
        this.tea = tea;
    }

    /* p.encode = function (message) {
     var data = new DataStream();
     data.writeShort(message.commandId);
     data.writeBytes(message.content);
     if (message.isEncrypt == true) {
     //console.log("------------------- DO ENCRYPT --------------------");
     var bytes = data.getBytes();
     //console.log(bytes);
     data = this.tea.encrypt(bytes);
     //console.log(data);
     // console.log("------------------ END ENCRYPT ------------------");
     } else {
     data = data.getBytes();
     }

     var response = new DataStream();
     //protocol version
     response.writeByte(1);
     response.writeInt(data.length);
     //có mã hóa không
     response.writeByte(message.isEncrypt);
     response.writeBytes(data);
     var bytes2 = response.getBytes();
     return bytes2;
     }*/

    p.encode = function (message) {
        var data = new DataStream();
        //object type
        data.writeByte(18);
        //object size
        data.writeShort(1);

        data.writeBytes(message.content);

        var response = new DataStream();
        response.writeBytes(data.getBytes());
        return response.getBytes();
    }

}