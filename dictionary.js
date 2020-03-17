    var createdDiv,

        LANGUAGE = 'en',
        TRIGGER_KEY = 'none',
        IS_HISTORY_ENABLED = true,

        GOOGLE_SPEECH_URI = 'https://www.google.com/speech-api/v1/synthesize';

    
    function showMeaning(event){
        var info = getSelectionInfo(event);
        if(!info){
            return;
        }

        sendRequest(info);
        createdDiv = createDiv(info);
    }


    function getSelectionInfo(event) {
        var word;
        var boundingRect;
        var ifZero = {};

        if (window.getSelection().toString().length > 1) {
            word = window.getSelection().toString();
            boundingRect = getSelectionCoords(window.getSelection());
        } else {
            return null;
        }

        var top = boundingRect.top + window.scrollY;
        var bottom = boundingRect.bottom + window.scrollY;
        var left = boundingRect.left + window.scrollX;

        if(boundingRect.height == 0){
            top = event.pageY;
            bottom = event.pageY;
            left = event.pageX;
        }

        var toReturn = {
            top: top,
            bottom: bottom,
            left: left,
            word: word,
            clientY: event.clientY,
            height: boundingRect.height,
            width: boundingRect.width
        };

      return toReturn;
    }

    function sendRequest(info){

        var url = `https://www.google.com/search?hl=${LANGUAGE}&q=define+${info.word}`
        var xmlHTTP = new XMLHttpRequest();
        xmlHTTP.responseType = 'document';
        xmlHTTP.onload = createCallback();
        xmlHTTP.open( "GET", url, true ); // true for asynchronous request
        xmlHTTP.send();
    }

    function createCallback(){
        var retrieveMeaning = function(){
            var document = this.responseXML;

            if(!document.querySelectorAll("[data-dobid='hdw']")[0]){
              return noMeaningFound(createdDiv);
            }

            var word = document.querySelectorAll("[data-dobid='hdw']")[0].textContent;
            var definitionDiv = document.querySelector("div[data-dobid='dfn']");
            var meaning = "";

            if (definitionDiv) {
                definitionDiv.querySelectorAll("span").forEach(function(span){
                    if(!span.querySelector("sup"))
                         meaning = meaning + span.textContent;
                });
            }

            meaning = meaning[0].toUpperCase() + meaning.substring(1);
            var audio = document.querySelector("audio[jsname='QInZvb']");
                source = document.querySelector("audio[jsname='QInZvb'] source"),
                audioSrc = source && source.src;

            if (audioSrc) {
                !audioSrc.includes("http") && (audioSrc = audioSrc.replace("//", "https://"));
            }
            else if(audio){
                let exactWord = word.replace(/·/g, ''), // We do not want syllable seperator to be present.
                    
                queryString = new URLSearchParams({
                    text: exactWord, 
                    enc: 'mpeg', 
                    lang: LANGUAGE, 
                    speed: '0.4', 
                    client: 'lr-language-tts', 
                    use_google_only_voices: 1
                }).toString();

                audioSrc = `${GOOGLE_SPEECH_URI}?${queryString}`;
            }

            let content = {word: word, meaning: meaning, audioSrc: audioSrc};

            saveWord(content);
            appendToDiv(createdDiv, content);
        };
        return retrieveMeaning;
    }


    function createDiv(info) {

        var hostDiv = document.createElement("div");
        hostDiv.className = "dictionaryDiv";
        hostDiv.style.left = info.left -10 + "px";
        hostDiv.style.position = "absolute";
        hostDiv.attachShadow({mode: 'open'});

        var shadow = hostDiv.shadowRoot;
        var style = document.createElement("style");
        //style.textContent = "*{ all: initial}";
        style.textContent = ".mwe-popups{background:#fff;position:absolute;z-index:110;-webkit-box-shadow:0 30px 90px -20px rgba(0,0,0,0.3),0 0 1px #a2a9b1;box-shadow:0 30px 90px -20px rgba(0,0,0,0.3),0 0 1px #a2a9b1;padding:0;font-size:14px;min-width:300px;border-radius:2px}.mwe-popups.mwe-popups-is-not-tall{width:320px}.mwe-popups .mwe-popups-container{color:#222;margin-top:-9px;padding-top:9px;text-decoration:none}.mwe-popups.mwe-popups-is-not-tall .mwe-popups-extract{min-height:40px;max-height:140px;overflow:hidden;margin-bottom:47px;padding-bottom:0}.mwe-popups .mwe-popups-extract{margin:16px;display:block;color:#222;text-decoration:none;position:relative} .mwe-popups.flipped_y:before{content:'';position:absolute;border:8px solid transparent;border-bottom:0;border-top: 8px solid #a2a9b1;bottom:-8px;left:10px}.mwe-popups.flipped_y:after{content:'';position:absolute;border:11px solid transparent;border-bottom:0;border-top:11px solid #fff;bottom:-7px;left:7px} .mwe-popups.mwe-popups-no-image-tri:before{content:'';position:absolute;border:8px solid transparent;border-top:0;border-bottom: 8px solid #a2a9b1;top:-8px;left:10px}.mwe-popups.mwe-popups-no-image-tri:after{content:'';position:absolute;border:11px solid transparent;border-top:0;border-bottom:11px solid #fff;top:-7px;left:7px} .audio{background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAcUlEQVQ4y2P4//8/AyUYQhAH3gNxA7IAIQPmo/H3g/QA8XkgFiBkwHyoYnRQABVfj88AmGZcTuuHyjlgMwBZM7IE3NlQGhQe65EN+I8Dw8MLGgYoFpFqADK/YUAMwOsFigORatFIlYRElaRMWmaiBAMAp0n+3U0kqkAAAAAASUVORK5CYII=);background-position: center;background-repeat: no-repeat;cursor:pointer;margin-left: 8px;opacity: 0.5; width: 16px; display: inline-block;} .audio:hover {opacity: 1;}";
        style.textContent += ".mwe-popups.flipped_x:before{left:unset;right:10px;}.mwe-popups.flipped_x:after{left:unset;right:7px;}"
        shadow.appendChild(style);

        var encapsulateDiv = document.createElement("div");
        encapsulateDiv.style = "all: initial; text-shadow: transparent 0px 0px 0px, rgba(0,0,0,1) 0px 0px 0px !important;";
        shadow.appendChild(encapsulateDiv);


        var popupDiv = document.createElement("div");
        popupDiv.style = "font-family: arial,sans-serif; border-radius: 12px; border: 1px solid #a2a9b1; box-shadow: 0 0 17px rgba(0,0,0,0.5)";
        encapsulateDiv.appendChild(popupDiv);


        var contentContainer = document.createElement("div");
        contentContainer.className = "mwe-popups-container";
        popupDiv.appendChild(contentContainer);



        var content = document.createElement("div");
        content.className = "mwe-popups-extract";
        content.style = "line-height: 1.4; margin-top: 0px; margin-bottom: 11px; max-height: none";
        contentContainer.appendChild(content);


        var heading = document.createElement("h3");
        heading.style = "margin-block-end: 0px; display:inline-block;";
        heading.textContent = "Searching";

        var meaning = document.createElement("p");
        meaning.style = "margin-top: 10px";
        meaning.textContent = "Please Wait...";

        var audio = document.createElement("div");
        audio.className = "audio";
        audio.innerHTML = "&nbsp;";
        audio.style.display = "none";

        var moreInfo =document.createElement("a");
        moreInfo.href = `https://www.google.com/search?hl=${LANGUAGE}&q=define+${info.word}`;
        moreInfo.style = "float: right; text-decoration: none;"
        moreInfo.target = "_blank";

        content.appendChild(heading);
        content.appendChild(audio);
        content.appendChild(meaning);
        content.appendChild(moreInfo);
        document.body.appendChild(hostDiv);

        if(info.clientY < window.innerHeight/2){
            popupDiv.className = "mwe-popups mwe-popups-no-image-tri mwe-popups-is-not-tall";
            hostDiv.style.top = info.bottom + 10 + "px";
            if(info.height == 0){
                hostDiv.style.top = parseInt(hostDiv.style.top) + 8 + "px";
            }
        } else {
            popupDiv.className = "mwe-popups flipped_y mwe-popups-is-not-tall";
            hostDiv.style.top = info.top - 10 - popupDiv.clientHeight + "px";
            if(info.height == 0){
                hostDiv.style.top = parseInt(hostDiv.style.top) - 8 + "px";
            }
        }

        if (info.left + popupDiv.clientWidth > window.innerWidth) {
            if (window.innerWidth >= popupDiv.clientWidth) {
                /* Flip to left only if window's width is more than
                 * popupDiv's width. Otherwise, leave it to right side
                 * so that it can be scrollable on narrow windows.
                */
                popupDiv.className += " flipped_x";
                hostDiv.style.left = info.left - popupDiv.clientWidth + info.width + 10 + "px";
            }
        }

        return {heading: heading, meaning: meaning, moreInfo: moreInfo, audio: audio};

    }

    function getSelectionCoords(selection) {
        var oRange = selection.getRangeAt(0); //get the text range
        var oRect = oRange.getBoundingClientRect();
        return oRect;
    }

    function appendToDiv(createdDiv, content){

        var hostDiv = createdDiv.heading.getRootNode().host;
        var popupDiv = createdDiv.heading.getRootNode().querySelectorAll("div")[1];

        var heightBefore = popupDiv.clientHeight;
        createdDiv.heading.textContent = content.word;
        createdDiv.meaning.textContent = content.meaning;
        createdDiv.moreInfo.textContent = "More »";

        var heightAfter = popupDiv.clientHeight;
        var difference = heightAfter - heightBefore;


        if(popupDiv.classList.contains("flipped_y")){
            hostDiv.style.top = parseInt(hostDiv.style.top) - difference + 1 + "px";
        }

        if(content.audioSrc){
          var sound = document.createElement("audio");
          sound.src = content.audioSrc;
          createdDiv.audio.style.display  = "inline-block";
          createdDiv.audio.addEventListener("click", function(){
            sound.play();
          });
        }
    }

    function noMeaningFound(createdDiv){
      createdDiv.heading.textContent = "Sorry";
      createdDiv.meaning.textContent = "No definition found.";
    }

    function removeMeaning(event){
        var element = event.target;
        if(!element.classList.contains("dictionaryDiv")){
            document.querySelectorAll(".dictionaryDiv").forEach(function(Node){
                Node.remove();
            });
        }
    }

    function saveWord (content) {
        let word = content.word,
            meaning = content.meaning,
          
            storageItem = browser.storage.local.get('definitions');

            storageItem.then((results) => {
                let definitions = results.definitions || {};

                definitions[word] = meaning;
                browser.storage.local.set({
                    definitions
                });
            })
    }

    document.addEventListener('dblclick', ((e) => {
        if (TRIGGER_KEY === 'none') {
            return showMeaning(e);
        }

        //e has property altKey, shiftKey, cmdKey representing they key being pressed while double clicking.
        if(e[`${TRIGGER_KEY}Key`]) {
            return showMeaning(e);
        }

        return;
    }));

    document.addEventListener('click', removeMeaning);

    (function () {
        let storageItem = browser.storage.local.get();

        storageItem.then((results) => {
            let language = results.language,
                interaction = results.interaction || {},
                isHistoryEnabled = results.history;

            
            language && (LANGUAGE = language);
            (interaction.dblClick && interaction.dblClick.key) && (TRIGGER_KEY = interaction.dblClick.key);
            results.hasOwnProperty(isHistoryEnabled) && (IS_HISTORY_ENABLED = isHistoryEnabled);
        });
    })();