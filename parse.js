function parseHtml() {
  
  // Need to get the HTML content of the Doc so that Archie & co can parse it
  // See: https://stackoverflow.com/questions/14663852/get-google-document-as-html
  function exportAsHTML(){
    var forDriveScope = DriveApp.getStorageUsed(); //needed to get Drive Scope requested
    var docID = DocumentApp.getActiveDocument().getId();
    var url = "https://docs.google.com/feeds/download/documents/export/Export?id="+docID+"&exportFormat=html";
    var param = {
      method      : "get",
      headers     : {"Authorization": "Bearer " + ScriptApp.getOAuthToken()},
      muteHttpExceptions:true,
    };
    var html = UrlFetchApp.fetch(url,param).getContentText();
    return html;
  }
  
  var parsed;
  
  // Parser code adapted from: https://github.com/newsdev/archieml-js/blob/master/examples/google_drive.js
  
  var htmlparser = htmlparser2.init();
  var handler = new htmlparser.DomHandler(function(error, dom) {
	var tagHandlers = {
		_base: function(tag) {
			var str = '';
			tag.children.forEach(function(child) {
				if ((func = tagHandlers[child.name || child.type]))
					str += func(child);
			});
			return str;
		},
		text: function(textTag) {
			return textTag.data;
		},
		span: function(spanTag) {
			return tagHandlers._base(spanTag);
		},
		p: function(pTag) {
			return tagHandlers._base(pTag) + '\n';
		},
		a: function(aTag) {
			var href = aTag.attribs.href;
			if (href === undefined) return '';

			// extract real URLs from Google's tracking
			// from: http://www.google.com/url?q=http%3A%2F%2Fwww.nytimes.com...
			// to: http://www.nytimes.com...
			if (
				aTag.attribs.href &&
				url('query', aTag.attribs.href) &&
				url('?q', aTag.attribs.href)
			) {
				href = url('?q', aTag.attribs.href);
			}

			var str = '<a href="' + href + '">';
			str += tagHandlers._base(aTag);
			str += '</a>';
			return str;
		},
		li: function(tag) {
			return '* ' + tagHandlers._base(tag) + '\n';
		}
	};

	['ul', 'ol'].forEach(function(tag) {
		tagHandlers[tag] = tagHandlers.span;
	});
	['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(function(tag) {
		tagHandlers[tag] = tagHandlers.p;
	});

	var body = dom[0].children[1];
	var parsedText = tagHandlers._base(body);

	// Convert html entities into the characters as they exist in the google doc
	// var entities = new Entities();
	// parsedText = entities.decode(parsedText);

	// Remove smart quotes from inside tags
	parsedText = parsedText.replace(/<[^<>]*>/g, function(match) {
		return match.replace(/”|“/g, '"').replace(/‘|’/g, "'");
	});

	parsed = archieml.load(parsedText);
    
});

  var parser = new htmlparser.Parser(handler, {decodeEntities: true});

  parser.write(exportAsHTML());
  parser.end();
  
  return parsed;
  
}
