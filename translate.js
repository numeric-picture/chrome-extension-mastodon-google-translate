(function() {
  var TRANSLATE_KEY = undefined;
  var TARGET_LANG = undefined;
  var SOURCE_LANG = undefined;

  chrome.storage.sync.get(['apikey','source_lang','target_lang'], function(items) {
    TRANSLATE_KEY = items.apikey;
    if (TRANSLATE_KEY == undefined) {
      // abort here if translate key has not provided
      return;
    }

    TARGET_LANG = items.target_lang
    if (TARGET_LANG == undefined) {
      TARGET_LANG = 'en';
    }

    SOURCE_LANG = items.source_lang
    if (SOURCE_LANG == undefined) {
      SOURCE_LANG = 'ja';
    }
    initExtTranslate();
  });

  // Observe DOM manupilation and redraw translate objects
  var mo = new MutationObserver(function(records){
    records.forEach(function(record){
      if(record.type==="childList"){
        for(var i=0;i<record.addedNodes.length;i++){
          try {
            if(record.addedNodes[i].className.toLowerCase()==="drawer"){
              initExtTranslate();
            }
          } catch(err) {
          }
        }
      }
    });
  });
  mo.observe(document,{
    childList:true,
    subtree:true
  });

  function initExtTranslate() {
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

    var translate_button = document.createElement('div');
    translate_button.setAttribute("id", "ext_google_translate_button");
    translate_button.setAttribute("class", "text-icon-button");
    translate_button.setAttribute("aria-expanded", "false");
    translate_button.innerText = SOURCE_LANG.toUpperCase() + ">" + TARGET_LANG.toUpperCase();
    translate_button.onclick = function() {
      requestTranslate(source_area.value);
    };

    var buttons = document.getElementsByClassName('compose-form__buttons')[0];
    buttons.appendChild(translate_button);

    var translate_area = document.createElement('div');
    translate_area.setAttribute("id", "ext_google_translate_area");
    translate_area.innerText = "Translation result will be displayed here";
    translate_area.setAttribute("style", "margin: 20px");

    var compose_form = document.getElementsByClassName('drawer__inner')[0];
    compose_form.appendChild(translate_area);

    var enable_realtime_translate = false;

    if (enable_realtime_translate) {
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
  }

  function requestTranslate(query) {

    if (query == undefined || query.length < 1) {
      console.log("query is not specified");
      return;
    }

    if (TRANSLATE_KEY == undefined || TRANSLATE_KEY == "") {
      alert("Missing Google Translate API Key.");
      return;
    }

    var q = replaceTag(query);

    var url = "https://www.googleapis.com/language/translate/v2?format=html&target=" + TARGET_LANG + "&key=" + TRANSLATE_KEY + "&q=" + encodeURIComponent(q);
    var ret = httpGet(url);

    console.log("result is", ret);
    var json = JSON.parse(ret);
    var draw_area = document.getElementById('ext_google_translate_area');

    var raw = json.data.translations[0].translatedText;

    var translated = "<pre style=\"white-space: pre-wrap;\">" + replaceTag(raw) + "</pre>";

    draw_area.innerHTML = translated;
  }

  function httpGet(url) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false);
    xmlHttp.send(null);
    console.log("translate requested to:", escape(url));
    return xmlHttp.responseText;
  }

  function replaceTag(str){
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

})();

