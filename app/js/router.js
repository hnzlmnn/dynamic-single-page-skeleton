/*
  Define Templates (see https://github.com/olado/doT/ for further instructions):
  <script type="text/html" id="def_<defname>">
    <h1>{{=it.header}}}}</h1>
  </script>
  <script type="text/html" id="page_<templatename>">
    <h1>Router FTW!</h1>
  </script>
  Usage:
  router = new window.Router(<viewholderid>);
  router.def(<defname>);
  router.route(<route>, <templatename>, <controller>);
*/

(function (window, $, undefined) {
  window.Router = function(viewholderId, onChange) {
    this.routes = {};
    this.def = {};
    this.viewholderId = viewholderId || 'viewholder';
    this.viewholder = undefined;
    this.old = undefined;
    this.onChange = onChange;
    function handleRemoteTemplate(data, resolve, reject) {
      var el = $('<script></script>');
      el.attr('type', 'text/html');
      el.attr('id', 'page_' + template);
      el.html(data);
      $('head').append(el);
      resolve(el);
    }
    this.getTemplate = function(templateId) {
      return new Promise(function(resolve, reject) {
        var language = "";
        if (window.Runtime.Language && window.Runtime.Language.current) {
          language = "." + window.Runtime.Language.current().name;
        } else {
          console.log("Language module not loaded!");
        }
        template = templateId + language;
        var el = $('#page_' + template);
        if (el.length) {
          resolve(el);
        } else {
          // Maybe there is an use-for-all element
          el = $('#page_' + templateId);
          if (el.length) {
            resolve(el);
          } else {
            // Try to load it with ajax
            $.get('content/templates/' + template + '.html', function(data) {
              handleRemoteTemplate(data, resolve, reject);
            }).fail(function() {
              $.get('content/templates/' + templateId + '.html', function(data) {
                handleRemoteTemplate(data, resolve, reject);
              }).fail(function() {
                reject(new Error('There is no template with id "page_' + template + '"'));
              });
            });
          }
        }
      });
    };
    this.viewUpdate = function(viewholder, templateId, data) {
      return new Promise(function(resolve, reject) {
        this.getTemplate(templateId).then(function(el) {
          $(viewholder).html(doT.compile(el.html(), this.def)(data));
          resolve('C===3');
        }.bind(this), function(error) {
          console.log(error);
          reject(new Error('8===D'));
        });
      }.bind(this));
    };
    this.defaultRoute = function() {
      var defaultRoute = this.routes['default'];
      if (defaultRoute) {
        this.viewUpdate(this.viewholder, defaultRoute.templateId, new defaultRoute.controller()).then(function() {
          if (this.onChange) {
            this.onChange(this, true);
          }
        }.bind(this), function() {
          console.log("Something bad happened! I couldn't even find the fallback element. This should be defined in the head of index.html");
          if (this.onChange) {
            this.onChange(this, false);
          }
        }.bind(this));
      } else {
        if (this.onChange) {
          this.onChange(this, false);
        }
      }
    };
    this.onRouteChanged = function (force) {
      force = (force !== undefined);
      this.viewholder = this.viewholder || document.getElementById(this.viewholderId);
      var url = location.hash.slice(1) || '/';
      if (!this.routes) {
        console.log('Something is wrong with this router!');
        return;
      }
      var route = this.routes[url];
      if (this.viewholder && (this.old === undefined || this.old.url != url || force)) {
        if (route) {
          this.viewUpdate(this.viewholder, route.templateId, new route.controller()).then(function() {
            if (this.onChange) {
              this.onChange(this, true);
            }
          }.bind(this), function() {
            this.defaultRoute();
          }.bind(this));
        } else {
          this.defaultRoute();
        }
      }
      this.old = this.current();
    };
    this.route = function(path, templateId, controller) {
      this.routes[path] = {templateId: templateId, controller: controller || function() {}};
    };
    this.define = function(name) {
      return new Promise(function(resolve, reject) {
        var el = $('#def_' + name);
        if (el.length) {
          this.def[name] = el.html();
          resolve();
        } else {
          // Try to load it with ajax
          $.get('content/defines/' + name + '.html', function(data) {
            var el = $('<script></script>');
            el.attr('type', 'text/html');
            el.attr('id', 'def_' + name);
            el.html(data);
            $('head').append(el);
            this.def[name] = el.html();
            resolve();
          }).fail(function() {
            reject(new Error('There is no define with the id "def_' + id + '"'));
          });
        }
      }.bind(this));
    };
    this.current = function() {
      url = location.hash.slice(1) || '/';
      route = this.routes[url] || this.routes['default'];
      name = (route) ? route.templateId : undefined;
      return {
        url: url,
        name: name,
        urlname: url.slice(1)
      };
    };
    this.navigate = function(url) {
      window.location.hash = '#' + url;
    };
    window.addEventListener('hashchange', function() {
      this.onRouteChanged();
    }.bind(this), false);
    window.addEventListener('load', function() {
      this.onRouteChanged();
    }.bind(this), false);
    return this;
  };
})(window, jQuery);
