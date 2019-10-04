var RC4 = {};

function _rc4(key_seed, data) {
    var s = [];
    for (var i = 0; i < 256; i++) {
        s[i] = i;
    }

    var j = 0;
    var x = null;
    for (var i = 0; i < 256; i++) {
        j = (j + s[i] + key_seed.charCodeAt(i % key_seed.length)) % 256;
        x = s[i];
        s[i] = s[j];
        s[j] = x;
    }

    var i = 0;
    j = 0;
    var ct = '';
    var y = null;
    for (y = 0; y < data.length; y++) {
        i = (i + 1) % 256;
        j = (j + s[i]) % 256;
        x = s[i];
        s[i] = s[j];
        s[j] = x;
        ct += String.fromCharCode(data.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);
    }
    return ct;
}

RC4.encrypt_data = function (key_seed, data) {
    var bin = _rc4(key_seed, unescape(encodeURIComponent(data)));
    return btoa(bin);
}

RC4.decrypt_data = function (key_seed, data) {
    var bin = atob(data);
    return decodeURIComponent(escape(_rc4(key_seed, bin)));
}

