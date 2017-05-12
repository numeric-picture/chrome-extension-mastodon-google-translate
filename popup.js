// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

getUserPrefs();

function click(e) {
  chrome.tabs.executeScript(null,
//      {code:"document.body.style.backgroundColor='" + e.target.id + "'"}
      {code:"alert('" + e.target.id + "');"}
  );
  window.close();
}

function getUserPrefs() {
    chrome.storage.sync.get('apikey', function (obj) {
        console.log(obj.apikey);
        document.getElementById('apikey').value = obj.apikey;
    });
}

function saveKey(e) {
  key = document.getElementById('apikey').value;
  console.log(key);
  chrome.storage.sync.set({'apikey': key}, function() {
          // Notify that we saved.
        });
  window.close();
}

document.addEventListener('DOMContentLoaded', function () {
  var divs = document.querySelectorAll('div');
  for (var i = 0; i < divs.length; i++) {
    divs[i].addEventListener('click', saveKey);
  }
});


