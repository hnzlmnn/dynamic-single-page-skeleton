/*
  Define languages in json:
  {
    "default": {
      "name": "en",
      "readable": "English"
    }
  }
  Usage:
  language = new window.Language(<selector>).then(<success>, <fail>);
  language.changeLanguage(<themename>);
  language.removeLanguage();
*/

(function (window, $, undefined) {
  window.Language = function(defaultLanguage, translationfiles) {
    this.languages = undefined;
    this.language = defaultLanguage;
    this.listeners = [];
    this.translationfiles = translationfiles || [];
    this.translations = {};
    function fetchTranslations(i) {
      return new Promise(function(resolve, reject) {
        if (this.translationfiles.length > i) {
          loadTranslationFile.call(this, this.translationfiles[i]).then(function() {
            fetchTranslations.call(this, i + 1).then(function() {
              resolve();
            }.bind(this));
          }.bind(this), function() {
            fetchTranslations.call(this, i + 1).then(function() {
              resolve();
            }.bind(this));
          }.bind(this));
        } else {
          resolve();
        }
      }.bind(this));
    }
    function loadTranslationFile(file) {
      return new Promise(function(resolve, reject) {
        $.get('content/json/' + file + '.json', function(data) {
          try {
            json = JSON.parse(data);
            if (json.entries) {
              this.translations[file] = json.entries;
              resolve();
            } else {
              reject(new Error("Translation file \"" + file + "\" doesn't contain \"entries\"!"));
            }
          } catch (e) {
            reject(new Error("Couldn't parse the JSON!: " + e.message));
          }
        }.bind(this), "html").fail(function() {
          reject(new Error("Couldn't fetch the translation file!"));
        });
      }.bind(this));
    }
    this.updateLanguages = function() {
      return new Promise(function(resolve, reject) {
        $.get('content/json/languages.json', function(data) {
          try {
            json = JSON.parse(data);
            this.languages = json;
            if (!this.languages[this.language] || !this.languages[this.language].name) {
              this.language = undefined;
              for (var k in this.languages) {
                if (this.languages.hasOwnProperty(k) && this.languages[k].name) {
                  this.language = k;
                  break;
                }
              }
              if (!this.language) {
                reject(new Error("No valid languages defined!"));
              }
            } else {
              console.log("Previously selected language " + this.language + " does still exist. use it!");
            }
            this.translations = {};
            fetchTranslations.call(this, 0).then(function() {
              resolve(this);
            }.bind(this));
          } catch (e) {
            reject(new Error("Couldn't parse the JSON!: " + e.message));
          }
        }.bind(this), "html").fail(function() {
          reject(new Error("Couldn't fetch the languages!"));
        });
      }.bind(this));
    };
    this.getLanguages = function() {
      return this.languages;
    };
    this.current = function() {
      return this.languages[this.language];
    };
    this.reloadLanguage = function() {
      if (window.Runtime.Router) {
        window.Runtime.Router.onRouteChanged(true);
      }
      for (var i = 0; i < this.listeners.length; i++) {
        if (typeof this.listeners[i] === "function") {
          this.listeners[i](this);
        }
      }
    };
    this.changeLanguage = function(name) {
      if (this.language != name && this.languages[name] && this.languages[name].name) {
        this.language = name;
        console.log("Language changed to: " + this.language);
        this.reloadLanguage();
        return true;
      }
      return false;
    };
    this.addOnChangeListener = function(listener) {
      this.listeners.push(listener);
    };
    this.addTranslationFile = function(file) {
      this.translationfiles.push(file);
    };
    this._ = function() {
      var p = this.translations;
      for (var i = 0; i < arguments.length; i++) {
        if (p[arguments[i]]) {
          p = p[arguments[i]];
        } else {
          return undefined;
        }
      }
			return p;
    };
    return this.updateLanguages();
  };
})(window, jQuery);
