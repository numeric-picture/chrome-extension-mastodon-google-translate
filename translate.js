(function() {
  var TRANSLATE_KEY = undefined;
  chrome.storage.sync.get(['apikey'], function(items) {
    console.log('Settings retrieved', items.apikey);
    TRANSLATE_KEY = items.apikey;
    init();
  });

  function init() {
    if (TRANSLATE_KEY == undefined) {
      console.log("Google Translate API Key is not provided.");
      return;
    }
    var last_req_time = 10;

    source_area = document.getElementsByClassName('autosuggest-textarea__textarea')[0];
    if (source_area == undefined) {
      console.log("Cannot detect Mastodon input area.");
      return;
    }
    var translate_area = document.createElement('div');
    translate_area.setAttribute("id", "google_translate_element");
    translate_area.innerText = "Translated result will display below";

    var compose_form = document.getElementsByClassName('drawer__inner')[0];
    compose_form.appendChild(translate_area);

    source_area.onkeyup = function() {
      console.log(source_area.value);
      source_text = source_area.value;

      // Do not send translate request if text is too short
      if (source_text.length < 10) {
        return;
      }
      if (last_req_time == 0) {
        requestTranslate(source_text);
        last_req_time = 10;
        return;
      } else {
        last_req_time = last_req_time - 1;
        return;
      }
    };
  }

  function requestTranslate(query) {
    var url = "https://www.googleapis.com/language/translate/v2?target=en&key=" + TRANSLATE_KEY + "&q=" + encodeURIComponent(query);
    var ret = httpGet(url);

    console.log("result is", ret);
    console.log(ret);
    var json = JSON.parse(ret);
    var draw_area = document.getElementById('google_translate_element');
    draw_area.innerText = json.data.translations[0].translatedText;
  }

  function httpGet(url) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false ); // false for synchronous request
    xmlHttp.send( null );
    console.log("translate requested to:", url);
    return xmlHttp.responseText;
  }
})();

