
var email         = require('./app/js/email.js');

module.exports = {
  "logprefix": "exampleapp",
  "preprocess": {
    context: {
      PAGETITLE: 'example.com',
      MENUTITLE: 'Example Page',
      NAME: 'Example Name',
      SOCIAL_EMAIL: new email().encode('someone@example.com', ''),
      SOCIAL_TWITTER: '#twitter',
      SOCIAL_GOOGLEPLUS: '#googleplus',
      SOCIAL_FACEBOOK: '#facebook'
    }
  }
}
