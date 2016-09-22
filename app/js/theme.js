/*
  Define themes in json:
  {
    "default": {
      "name": "default",
      "readable": "Default",
      "files": []
    }
  }
  Usage:
  theme = new window.Theme(<selector>).then(<success>, <fail>);
  theme.changeTheme(<themename>);
  theme.removeTheme();
*/

(function (window, $, undefined) {
  window.Theme = function(selector) {
    this.themes = undefined;
    this.selector = selector || 'data-theme';
    this.updateThemes = function() {
      return new Promise(function(resolve, reject) {
        $.get('content/json/themes.json', function(data) {
          try {
            json = JSON.parse(data);
            this.themes = json;
            resolve(this);
          } catch (e) {
            reject(new Error("Couldn't parse the JSON!: " + e.message));
          }
        }.bind(this), "html").fail(function() {
          reject(new Error("Couldn't fetch the themes!"));
        });
      }.bind(this));
    };
    this.getThemes = function() {
      return this.themes;
    };
    this.removeTheme = function() {
      $('head').find('link[' + this.selector + ']').remove();
    };
    this.changeTheme = function(name) {
      if (this.themes[name] && this.themes[name].files) {
        this.removeTheme();
        $.each(this.themes[name].files, function(i, file) {
          var el = $('<link />');
          el.attr('rel', 'stylesheet');
          el.attr('type', 'text/css');
          el.attr(this.selector, i);
          el.attr('href', 'css/themes/' + name + '/' + file);
          $('head').append(el);
        }.bind(this));
      }
    };
    return this.updateThemes();
  };
})(window, jQuery);
