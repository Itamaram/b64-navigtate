////
//Base64 encoding - If url, navigate b64root
//  -Copy encoded to clipboard b64encode
//  -Copy decoded to clipboard b64decode

// ID to manage the context menu entry
var cmid;
var cm_clickHandler = function (data) {
    chrome.tabs.create({
        url: Base64.decode(data.selectionText)
    })
};

function isUrl(s) {
    return !!new RegExp('^https?:\\/\\/').test(s)
}

var Base64 = { _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = Base64._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t }, decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9\+\/\=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = Base64._utf8_decode(t); return t }, _utf8_encode: function (e) { e = e.replace(/\r\n/g, "\n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t }, _utf8_decode: function (e) { var t = ""; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t } }

var cm = {
    contexts: ['selection'],
    root: {
        id: 'b64root',
        title: 'B64 (en|de)code',
    },
    decode: {
        id: 'b64decode',
        title: 'D: copy ',
        action: function (s) { return Base64.decode(s); },
    },
    encode: {
        id: 'b64encode',
        title: 'E: copy ',
        action: function (s) { return Base64.encode(s); },
    },
}

chrome.contextMenus.create({
    id: cm.root.id,
    title: cm.root.title,
    contexts: cm.contexts,
    visible: false,
}, function () {
    [cm.decode, cm.encode].forEach(function (child) {
        chrome.contextMenus.create({
            id: child.id,
            title: child.title,
            contexts: cm.contexts,
            parentId: cm.root.id,
            visible: false,
        });
    });
});

function updateChildMenus(selection) {
    var visible = !!selection;
    [cm.decode, cm.encode].forEach(function (child) {
        var b64 = child.action(selection);
        chrome.contextMenus.update(child.id, {
            visible: visible,
            title: child.title + b64,
            onclick: function () {
                chrome.tabs.getCurrent(function(tab){
                    chrome.tabs.sendMessage(tab.tabId, {
                        request: 'copyToClipboard',
                        text: b64,
                    })
                });
            }
        });
    });
}

function updateContextMenu(selection) {
    if (!selection) {
        chrome.contextMenus.update(cm.root.id, { visible: false, })
        return;
    }

    var decoded = Base64.decode(selection);

    var options = {
        visible: true,
        title: cm.root.title,
        onclick: null, // todo test this works
    };

    if (isUrl(decoded)) {
        options.title = 'Go to ' + decoded;
        options.onclick = function () { chrome.tabs.create({ url: decoded }); };
    }

    chrome.contextMenus.update(cm.root.id, options, function () { updateChildMenus(selection); });
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