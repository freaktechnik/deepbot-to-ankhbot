/**
 * Copyright (c) 2016 Martin Giger
 *
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
"use strict";

var DELIMITER = "|";

var socket = new WebSocket("ws://localhost:3337");

socket.addEventListener("error", function(event) {
    document.getElementById("submit").disabled = true;
    document.getElementById("error").hidden = false;
});

function send(method, ...args) {
    socket.send("api"+DELIMITER+method+DELIMITER+args.join(DELIMITER));
}

function print(users) {
    document.getElementById("out").textContent = users.reduce(function(prev, curr) {
        var points = parseInt(curr.points, 10);
        if(points > 0)
            return prev + curr.user + " " + parseInt(curr.points, 10) + "\n";
        else
            return prev;
    }, "");
}

function connect(apiKey, callback) {
    socket.addEventListener("message", function(msg) {
        var json = JSON.parse(msg.data);

        if(json.function == "register" && json.msg == "success") {
            callback();
            errorNode.hidden = true;
        }
        else if(json.function == "register") {
            console.error(msg);
            var errorNode = document.getElementById("error");
            errorNode.textContent = json.msg;
            errorNode.hidden = false;
        }
    });
    send("register", apiKey);
}

function start(apiKey) {
    var offset = 0;
    var limit = 100;
    var users = [];
    socket.addEventListener("message", function(msg) {
        var json = JSON.parse(msg.data);

        if(json.function == "get_users") {
            users = users.concat(json.msg);
            if(json.msg.length == limit) {
                offset += limit;
                send("get_users", offset, limit);
            }
            else {
                print(users);
            }
        }
    });
    connect(apiKey, function() {
        send("get_users", offset, limit);
    });
}

window.addEventListener("load", function() {
    document.getElementById("go").addEventListener("submit", function(e) {
        e.preventDefault();
        start(document.getElementById("apikey").value);
    });
});
