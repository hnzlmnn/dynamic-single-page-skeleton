
var email         = require('./app/js/email.js');

module.exports = {
  "preprocess": {
    context: {
      SOCIAL_EMAIL: new email().encode('someone@example.com', ''), //cqbjuxt%40wcqyb.sec
      SOCIAL_TWITTER: '#twitter',
      SOCIAL_GOOGLEPLUS: '#googleplus',
      SOCIAL_FACEBOOK: '#facebook'
    }
  }
}
