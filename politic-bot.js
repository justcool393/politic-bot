var RSVP = require('rsvp'), fs = require('fs'), Handlebars = require('handlebars'),
var PoliticBot = require('./lib/main');
config = require('./config'), pkg = require('./package'), templates = {};
config.userAgent = pkg.name+'/'+pkg.version+' by '+pkg.author;
['mirror', 'report', 'comments'].forEach(function(name) {
  templates[name] = function(ctx) {
    return Handlebars.compile(fs.readFileSync('./templates/'+name+'.md.hbs')+'')(ctx);
  }
});

PoliticBot(config, function(bot) {
  var commentRemovals = PoliticBot.commentRemovals(bot, templates);
  return RSVP.all([
    PoliticBot.otherDiscussions(bot, templates),
    PoliticBot.mirrorTopic(bot),
    PoliticBot.commander(bot, templates).pollForCommands({
      postRemovedComments: function(user, reportSub, depth) {
        console.log('postRemovedComments', user, reportSub, depth);
        if (!user || !reportSub) {return;}
        return commentRemovals.checkUser(user, reportSub, depth);
      }
    });
  ]);
});
