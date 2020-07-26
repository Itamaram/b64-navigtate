function isUrl(s) {
    return !!new RegExp('^https?:\\/\\/').test(s)
}

var Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); if(s == -1 || o == -1 || u == -1 || a == -1) return ''; n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/\r\n/g, "\n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } }

var menus = [
    {
        id: 'b64navigate',
        title: function (e, d) { return 'Go to ' + d; },
        action: function (e, d) { chrome.tabs.create({ url: d }); },
        visible: function (e, d) { return isUrl(d); },
    },
    {
        id: 'b64decode',
        title: function (e, d) { return 'D: copy ' + d; },
        action: function (e, d) { copy(d); },
        visible: function (e, d) { return !!d },
    },
    {
        id: 'b64encode',
        title: function (e, d) { return 'E: copy  ' + e; },
        action: function (e, d) { copy(e); },
        visible: function (e, d) { return !!e },
    }
];

menus.forEach(function (menu) {
    chrome.contextMenus.create({
        id: menu.id,
        title: '<placeholder>',
        contexts: ['selection'],
        visible: false,
    })
});

function updateContextMenu(selection) {
    var encoded = '', decoded = '';
    if (selection.length < 1000) { 
        encoded = Base64.encode(selection);
        decoded = Base64.decode(selection);
    } 

    menus.forEach(function (menu) {
        chrome.contextMenus.update(menu.id, {
            title: menu.title(encoded, decoded),
            visible: menu.visible(encoded, decoded),
            onclick: function () { menu.action(encoded, decoded); },
        })
    });
}

chrome.runtime.onMessage.addListener(function (msg) {
    if (msg.request === 'onContextChange')
        updateContextMenu(msg.selection);
});

chrome.tabs.onActivated.addListener(function (info) {
    chrome.tabs.sendMessage(info.tabId, { request: 'onTabActivated' }, function (response) {
        if (response !== undefined)
            updateContextMenu(response.selection);
    });
})

function copy(text) {
    var e = document.getElementById('container');
    e.textContent = text;
    e.select();
    document.execCommand('copy');
}