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

(function (window, module, undefined) {
  var Email = function() {
    // default rotation
    this.rot = 42;
    var caesar = function(str, amount) {
      if (amount < 0) {
		    return caesar(str, amount + 26);
      }
    	var output = '';
    	for (var i = 0; i < str.length; i ++) {
    		var c = str[i];
    		if (c.match(/[a-z]/i)) {
    			var code = str.charCodeAt(i);
    			// Uppercase letters
    			if ((code >= 65) && (code <= 90)) {
    				c = String.fromCharCode(((code - 65 + amount) % 26) + 65);
    			// Lowercase letters
          } else if ((code >= 97) && (code <= 122)) {
    				c = String.fromCharCode(((code - 97 + amount) % 26) + 97);
          }
    		}
    		output += c;
    	}
      return output;
    };
    this.encode = function(input, delimiter, rot) {
      rot = (rot === undefined) ? this.rot : rot;
      var str = caesar(input, rot);
      return (typeof delimiter === "undefined") ? encodeURIComponent(str).split('') : encodeURIComponent(str.split('').join(delimiter));
    };
    this.decode = function(input, delimiter, rot) {
      delimiter = delimiter || '';
      rot = (rot === undefined) ? -this.rot : -rot;
      if(typeof input === 'string' ) {
          input = decodeURIComponent(input).split(delimiter);
      }
      return caesar(decodeURIComponent(input.join('')), rot);
    };
    return this;
  };
  if (window) {
    window.Email = Email;
  } else if (module) {
    module.exports = Email;
  } else {
    return Email;
  }
})((typeof window !== "undefined") ? window : undefined, (typeof module  !== "undefined" && module.exports) ? module : undefined);
