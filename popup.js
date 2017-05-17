
getUserPrefs();

function getUserPrefs() {
  chrome.storage.sync.get(['apikey','source_lang','target_lang', 'support_lang'], function (obj) {
    if (obj.apikey == undefined || obj.apikey == "") {
      return;
    }
    document.getElementById('apikey').value = obj.apikey;
    source_lang = obj.source_lang;
    target_lang = obj.target_lang;

    if (source_lang) {
      document.getElementById('source').style = "visibility: block;";
    }
    if (target_lang) {
      document.getElementById('target').style = "visibility: block;";
    }

    support_lang = obj.support_lang;
    if (obj.apikey != undefined && obj.apikey != "" && obj.support_lang == undefined) {
      retrieveSupportLang(obj.apikey);
    }

    if (support_lang) {
      document.getElementById('support_lang').value = support_lang;
      composeLangs(source_lang, target_lang);
    }
  });
}

function retrieveSupportLang(key) {
  url = "https://translation.googleapis.com/language/translate/v2/languages?target=" + navigator.language
  langs = httpGet(url + "&key=" + key);
  chrome.storage.sync.set({'support_lang': langs.replace(/\s+/g, "")}, function() {});
  document.getElementById('support_lang').value = langs.replace(/\s+/g, "");
}

function saveKey(e) {
  key = document.getElementById('apikey').value;
  source_lang = document.getElementById('source_lang') ? document.getElementById('source_lang').value : "ja";
  target_lang = document.getElementById('target_lang') ? document.getElementById('target_lang').value : "en";
  chrome.storage.sync.set({'apikey': key, 'source_lang': source_lang, 'target_lang': target_lang}, function() {});

  if (document.getElementById('support_lang').value == "") {
    retrieveSupportLang(key);
    composeLangs(undefined, undefined);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById("saveButton").addEventListener('click', saveKey);
  document.getElementById("resetButton").addEventListener('click', resetAllStorage); 
});

function composeLangs(s,t){
  lang_str = document.getElementById('support_lang').value
  lang_json = JSON.parse(lang_str).data.languages;

  var select_source = document.createElement("select");
  select_source.setAttribute("id", "source_lang");
  for (var i=0; i < lang_json.length; i++) {
    var option = document.createElement("option");
    option.id = lang_json[i].language;
    option.value = lang_json[i].language;
    option.innerHTML = lang_json[i].name;
    if (option.id == "ja" && s == undefined) {
      option.selected = true;
    }
    if (option.id == s) {
      option.selected = true;
    }
    select_source.appendChild(option);
  }

  var select_target = document.createElement("select");
  select_target.setAttribute("id", "target_lang");
  for (var i=0; i < lang_json.length; i++) {
    var option = document.createElement("option");
    option.id = lang_json[i].language;
    option.value = lang_json[i].language;
    option.innerHTML = lang_json[i].name;
    if (option.id == "en" && t == undefined) {
      option.selected = true;
    }
    if (option.id == t) {
      option.selected = true;
    }
    select_target.appendChild(option);
  }
  
  document.getElementById("source").appendChild(select_source);
  document.getElementById("target").appendChild(select_target);

  document.getElementById("source").style = "visibility: block;";
  document.getElementById("target").style = "visibility: block;";
}

function resetAllStorage() {
  chrome.storage.sync.remove('apikey', function() {});
  chrome.storage.sync.remove('source_lang', function() {});
  chrome.storage.sync.remove('target_lang', function() {});
  chrome.storage.sync.remove('support_lang', function() {});
}

function httpGet(url) {
  var xhr = new XMLHttpRequest();
  try {
    xhr.open( "GET", url, false);
    xhr.send();
  } catch(err) {
    return;
  }
  if (xhr.status === 400) {
    document.getElementById('key').style = "color: red";
  }
  return xhr.responseText;
}
