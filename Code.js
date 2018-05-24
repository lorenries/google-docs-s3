// most of this is heavily stolen from https://github.com/liddiard/google-sheet-s3

function createMenu() {
  var ui = DocumentApp.getUi();
  ui.createMenu('Publish to S3')
  .addItem('Configure...', 'showConfig')
  .addItem('Publish!', 'publish')
  .addItem('Copy Link to S3', 'copyLink')
  .addToUi();
}

function onInstall() { 
  createMenu();
}

function onOpen() { 
  createMenu();
}

// publish updated JSON to S3 if changes were made to the first sheet
// event object passed if called from trigger
function publish() {
  // do nothing if required configuration settings are not present
  if (!hasRequiredProps()) {
    return;
  }

  // Parse the document from hmtl and convert it to ArchieML
  
  var parsed = parseHtml();
  
  // upload to S3
  // https://engetc.com/projects/amazon-s3-api-binding-for-google-apps-script/
  var props = PropertiesService.getDocumentProperties().getProperties();
  var s3 = S3.getInstance(props.awsAccessKeyId, props.awsSecretKey);
  s3.putObject(props.bucketName, [props.path, DocumentApp.getActiveDocument().getId()].join('/'), parsed);
}

// show the configuration modal dialog UI
function showConfig() {
  var ui = DocumentApp.getUi();
  var props = PropertiesService.getDocumentProperties().getProperties();
  var template = HtmlService.createTemplateFromFile('config');
  template.bucketName = props.bucketName || '';
  template.path = props.path || '';
  template.awsAccessKeyId = props.awsAccessKeyId || '';
  template.awsSecretKey = props.awsSecretKey || '';
  ui.showModalDialog(template.evaluate(), 'Amazon S3 publish configuration');
}

// update document configuration with values from form UI
function updateConfig(form) {
  PropertiesService.getDocumentProperties().setProperties({
    bucketName: form.bucketName,
    path: form.path,
    awsAccessKeyId: form.awsAccessKeyId,
    awsSecretKey: form.awsSecretKey
  });
  var message;
  if (hasRequiredProps()) {
    message = 'Published document will be accessible at: \nhttps://' + form.bucketName + '.s3.amazonaws.com/' + form.path + '/' + DocumentApp.getActiveDocument().getId();
    publish();
    // Create an onChange trigger programatically instead of manually because 
    // manual triggers disappear for no reason. See:
    // https://code.google.com/p/google-apps-script-issues/issues/detail?id=4854
    // https://code.google.com/p/google-apps-script-issues/issues/detail?id=5831
    //var sheet = SpreadsheetApp.getActive();
    //ScriptApp.newTrigger("publish")
    //         .forSpreadsheet(sheet)
    //         .onChange()
    //         .create();
  }
  else {
    message = 'You will need to fill out all configuration options for your spreadsheet to be published to S3.';
  }
  var ui = DocumentApp.getUi();
  ui.alert('✓ Configuration updated', message, ui.ButtonSet.OK);
}

// checks if document has the required configuration settings to publish to S3
// does not check if the config is valid
function hasRequiredProps() {
  var props = PropertiesService.getDocumentProperties().getProperties();
  return props.bucketName && props.awsAccessKeyId && props.awsSecretKey;
}

function copyLink() {
  var form = PropertiesService.getDocumentProperties().getProperties();
  var link = 'https://' + form.bucketName + '.s3.amazonaws.com/' + form.path + '/' + DocumentApp.getActiveDocument().getId()
  var ui = DocumentApp.getUi();
  ui.alert('Link: ', link, ui.ButtonSet.OK)
}