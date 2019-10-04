/**
 * Created by LamHa on 4/16/2016.
 */
function DataStream(bufferLength, byteArray) {
    if (bufferLength == null)
        bufferLength = 5120*2;

    this.buffer = new ArrayBuffer(bufferLength);
    this.dataView = new DataView(this.buffer);
    this.position = 0;
    this.byteLength = 0;

    if (byteArray != null) {
        for (var i = 0; i < byteArray.length; i++) {
            this.dataView.setInt8(this.position, byteArray[i]);
            this.position += 1;
            this.byteLength += 1;
        }
        this.position = 0;
    }

    var p = DataStream.prototype;
    p.writeInt = function (value) {
        this.dataView.setInt32(this.position, value);
        this.position += 4;
        this.byteLength += 4;
    }

    p.writeLong = function (value) {
        this.writeBytes(getInt64Bytes(value));
    }

    function getInt64Bytes( x ){
        var bytes = [];
        var i = 8;
        do {
            bytes[--i] = x & (255);
            x = x>>8;
        } while ( i )
        return bytes;
    }

    p.writeByte = function (value) {
        this.dataView.setInt8(this.position, value);
        this.position += 1;
        this.byteLength += 1;
    }

    p.writeByteAt = function (index, value) {
        this.dataView.setInt8(index, value);
        this.position += 1;
        this.byteLength += 1;
    }

    p.writeUByte = function (value) {
        this.dataView.setUint8(this.position, value);
        this.position += 1;
        this.byteLength += 1;
    }

    p.writeShort = function (value) {
        this.dataView.setInt16(this.position, value);
        this.position += 2;
        this.byteLength += 2;
    }

    p.writeString = function (s, length) {
        if (length != null) {
            var i = 0;
            var len = Math.min(s.length, length);
            for (i = 0; i < len; i++) {
                this.writeUByte(s.charCodeAt(i));
            }
            for (; i < length; i++) {
                this.writeUByte(0);
            }
        } else {
            for (var i = 0; i < s.length; i++) {
                this.writeUByte(s.charCodeAt(i));
            }
            //this.writeUByte(0);
        }
    }


    p.writeUTF = function (s) {
        var bytes = this.toUTF8Array(s);
        this.writeShort(bytes.length);
        this.writeBytes(bytes);
    }

    p.toUTF8Array = function(str) {
        // TODO(user): Use native implementations if/when available
        var out = [], p = 0;
        for (var i = 0; i < str.length; i++) {
            var c = str.charCodeAt(i);
            if (c < 128) {
                out[p++] = c;
            } else if (c < 2048) {
                out[p++] = (c >> 6) | 192;
                out[p++] = (c & 63) | 128;
            } else if (
                ((c & 0xFC00) == 0xD800) && (i + 1) < str.length &&
                ((str.charCodeAt(i + 1) & 0xFC00) == 0xDC00)) {
                // Surrogate Pair
                c = 0x10000 + ((c & 0x03FF) << 10) + (str.charCodeAt(++i) & 0x03FF);
                out[p++] = (c >> 18) | 240;
                out[p++] = ((c >> 12) & 63) | 128;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
            } else {
                out[p++] = (c >> 12) | 224;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
            }
        }
        return out;
    }


    p.writeUint8Array = function (arr) {
        this.memcpy(this.buffer, this.position, arr.buffer, 0, arr.byteLength);
        this.mapUint8Array(arr.length);
    }

    p.writeUint16 = function (v) {
        this.dataView.setUint16(this.position, v);
        this.position += 2;
        this.byteLength += 2;
    }

    p.mapUint8Array = function (length) {
        var arr = new Uint8Array(this.buffer, this.position, length);
        this.position += length * 1;
        return arr;
    }

    p.memcpy = function (dst, dstOffset, src, srcOffset, byteLength) {
        var dstU8 = new Uint8Array(dst, dstOffset, byteLength);
        var srcU8 = new Uint8Array(src, srcOffset, byteLength);
        dstU8.set(srcU8);
    }

    p.checkLength = function (valueLength) {
        //if (this.byteLength + valueLength < bufferLength) {
        //    // TODO cần kiểm tra length để giãn buffer, khi tạo một buffer để
        //    // copy vào thì nhớ delete buffer tạm đi
        //}
    }

    p.writeBytes = function (bytes) {
        for (var i = 0; i < bytes.length; i++) {
            this.writeByte(bytes[i]);
        }
    }

    p.getBytes = function () {
        return new Int8Array(this.buffer, 0, this.byteLength);
    }

    //lấy tất cả byte còn lại
    p.readBytes = function () {
        var uint8Array = new Uint8Array(this.buffer, this.position, this.byteLength);
        this.byteLength = 0;
        return uint8Array;
    }

    p.readBytes = function (length) {
        var uint8Array = new Uint8Array(this.buffer, this.position, length);
        this.byteLength -= length;
        this.position += length;
        return uint8Array;
    }

    p.readBytesWithLength = function (length) {
        var uint8Array = new Uint8Array(this.buffer, this.position, length);
        this.byteLength -= length;
        this.position += length;
        return uint8Array;
    }

    p.readShort = function () {
        var v = this.dataView.getInt16(this.position);
        this.position += 2;
        this.byteLength -= 2;
        return v;
    }

    p.readUTF = function () {
        //Chu y: doi voi readUTF cua java thi chi doc short
        //var length = this.readShort();

        var ua2text = function (ua) {
            var s = '';
            for (var i = 0; i < ua.length; i++) {
                s += String.fromCharCode(ua[i]);
            }
            return s;
        };

        var length = this.readInt();
        var value = (new TextDecoder("utf-8")).decode(new Uint8Array(this.buffer, this.position, length));
        //var value = ua2text(new Uint8Array(this.buffer, this.position, length));
        this.byteLength -= length;
        this.position += length;
        return value;
    }

    p.readInt = function () {
        var v = this.dataView.getInt32(this.position);
        this.position += 4;
        this.byteLength -= 4;
        return v;
    }

    p.readByte = function () {
        var v = this.dataView.getInt8(this.position);
        this.position += 1;
        this.byteLength -= 1;
        return v;
    }

    p.readLong = function () {
        var data = new Uint8Array(this.buffer, this.position, 8);
        var value = "";
        var positive = true;

        if ((data[0] & 0x80) > 0) {
            positive = false;
        }
        for (var i = 0; i < 8; i++) {
            if (positive) {
                value += ("0" + data[i].toString(16)).substr(-2, 2);
            } else {
                value += ("0" + (data[i] ^ 0xFF).toString(16)).substr(-2, 2);
            }

        }
        this.position += 8;
        this.byteLength -= 8;

        if (positive) {
            return parseInt(value, 16);
        } else {
            return -parseInt(value, 16) - 1;
        }
    }

    p.readFloat = function(){
        var v = this.dataView.getFloat32(this.position);
        this.position += 4;
        this.byteLength -= 4;
        return v;
    }

    p.readBoolean = function () {
        return this.readByte() == 1;
    }

}