(function(window, $) {
  $(document).ready(function() {
    function loadLanguage(next, stopOnError) {
      console.log("Loading Language");
      var cookielang = Cookies.get('language') || "en";
      new window.Language(cookielang, ["menu"]).then(function(data) {
        window.Runtime.Model.languages = [];
        var languages = data.getLanguages();
        for(var language in languages) {
          window.Runtime.Model.languages.push(languages[language]);
        }
        window.Runtime.Language = data;
        window.Runtime.Model.language = window.Runtime.Language.current().name;
        window.Runtime.Language.addOnChangeListener(function() {
          Cookies.set('language', window.Runtime.Language.current().name);
        });
        window.Runtime.Language.addOnChangeListener(function() {
          if (!window.Runtime.Model.links) {
            return;
          }
          for (var i = 0; i < window.Runtime.Model.links.length; i++) {
            var link = window.Runtime.Model.links[i];
            if (typeof link === "object") {
              var translation = window.Runtime.Language._("menu", link.name);
              if (typeof translation === "object") {
                var translated = translation[window.Runtime.Language.current().name];
                if (typeof translated === "string") {
                  window.Runtime.Model.links[i].text = translated;
                }
              }
            }
          }
        });
        if (typeof next === "function") {
          next.call(this);
        }
      }, function(error) {
        console.log(error);
        if (!stopOnError && typeof next === "function") {
          next.call(this);
        }
      });
    }
    function loadRouter(next) {
      console.log("Loading Router");
      window.Runtime.Router = new window.Router('content', function(router, success) {
        if (success) {
          window.Runtime.Model.current = router.current().url;
        }
      });
      if (typeof next === "function") {
        next.call(this);
      }
    }
    function loadTheme(next, stopOnError) {
      console.log("Loading Theme");
      new window.Theme().then(function(data) {
        window.Runtime.Model.themes = [];
        var themes = data.getThemes();
        for(var theme in themes) {
          window.Runtime.Model.themes.push(themes[theme]);
        }
        window.Runtime.theme = data;
        if (typeof next === "function") {
          next.call(this);
        }
      }, function(error) {
        console.log(error);
        if (!stopOnError && typeof next === "function") {
          next.call(this);
        }
      });
    }
    function model_link(name, url, text, template, visible, callback) {
      var self = this;
      self.name = name;
      self.url = url;
      self.text = text;
      self.template = template;
      self.visible = visible;
      self.active = false;
      self.callback = callback;
    }
    function createViewModel() {
      function viewModel() {
        var self = this;
        self.social = {
          "email":    '/* @echo SOCIAL_EMAIL */',
          "twitter":  '/* @echo SOCIAL_TWITTER */',
          "gplus":    '/* @echo SOCIAL_GOOGLEPLUS */',
          "facebook": '/* @echo SOCIAL_FACEBOOK */'
        };
        self.themes = [];
        self.language = undefined;
        self.languages = [];
        self.visibleLinks = function() {
          links = [];
          $.each(self.links, function (i, link) {
            if (link.visible === true) {
              links.push(link);
            }
          });
          return links;
        };
      }
      window.Runtime.Model = new viewModel();
    }
    function updateViewModel() {
      var self = window.Runtime.Model;
      self.router = self.router || window.Runtime.Router;
      self.current = self.current || self.router.current().url;
      self.links = self.links || [
        new model_link('home', '/', 'Home', 'home', true, function () {
          this.router = self.router;
        }),
        new model_link('about', '/about', 'About Me', 'about', true, function () {
          this.router = self.router;
        }),
        new model_link('projects', '/projects', 'Projects', 'projects', true, function () {
          this.router = self.router;
        }),
        new model_link('contact', '/contact', 'Contact', 'contact', false, function () {
          this.router = self.router;
        }),
        new model_link('long', '/long', 'Long Test', 'long', true, function () {
          this.router = self.router;
          this.chocolate = 'There will a scroll to top someday :D';
        })
      ];
    }
    rivets.binders.active = function(el, value) {
      $(el)[$(el).data('url') == value ? 'addClass' : 'removeClass']('active');
    };
    rivets.binders.activelanguage = function(el, value) {
      $(el)[$(el).attr("data-name") == value ? 'addClass' : 'removeClass']('active');
    };
    rivets.binders.link = function(el, value) {
      $(el).attr("href", '#' + value);
    };
    rivets.binders.href = function(el, value) {
      $(el).attr("href", value);
    };
    rivets.binders.mailto = function(el, value) {
      $(el).off("click");
      $(el).on("click", function(e) {
        e.preventDefault();
        var iframe = $('<iframe id="mailtoFrame" src="mailto:' + new window.Email().decode(value) + '" style="display:none;"></iframe>');
        $('body').append(iframe);
        window.setTimeout(function(){
          iframe.remove();
        }, 500);
      });
    };
    createViewModel();
    loadLanguage(function() {
      loadRouter(function() {
        updateViewModel();
        window.Runtime.Router.route('default', '404', function() {
          this.router = window.Runtime.Model.router;
          this.current = this.router.current().url;
        });

        $.each(window.Runtime.Model.links, function (i, link) {
          window.Runtime.Router.route(link.url, link.template, link.callback);
        });
        window.Runtime.Language.reloadLanguage();
        loadTheme(function() {

          window.Runtime.Binding = rivets.bind($('#body'), {data: window.Runtime.Model});

          $(window).on('scroll', function(e) {
            $('#scrolltop')[$('#body').scrollTop() < 300 ? 'addClass' : 'removeClass']('scrolltop-hidden');
          });

          $('#scrolltop').click(function(e) {
            e.preventDefault();
            $('#body').animate({ scrollTop: "0px" }, 500);
          });

          $('.languagelink').each(function() {
            var el = $(this);
            el.click(function(e) {
              e.preventDefault();
              if (window.Runtime.Language.changeLanguage(el.attr('data-name'))) {
                window.Runtime.Model.language = el.attr('data-name');
              }
            });
          });

          $('.themelink').each(function() {
            var el = $(this);
            el.click(function(e) {
              e.preventDefault();
              window.Runtime.theme.changeTheme(el.attr('data-name'));
            });
          });
        }, true);
      });
    }, true);
  });
})(window, jQuery);
