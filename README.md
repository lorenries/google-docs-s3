# Google Docs to S3 (ArchieML)

A [Google Apps Script](https://developers.google.com/apps-script/) that publishes a Google Doc written in [ArchieML](http://archieml.org/) to Amazon S3 as a JSON file. Heavily based on [liddiard/google-sheet-s3](https://github.com/liddiard/google-sheet-s3/).

<!--Get the add-on [here on the Chrome Web Store](#).-->

## Benefits

A free backend on Google Docs for frontend projects (I mostly use it for data visualizations), converted to JSON and published to S3 for easy integration with your web apps.


*   Doesn't require OAuth.
*   No need for a server or middleware, like [Driveshaft](https://github.com/newsdev/driveshaft) or  [aml-gdoc-server](https://github.com/Quartz/aml-gdoc-server), or whatever else.
*   Content can be updated after your frontend has already been built and deployed, unlike if you were going to pull in your Google Doc content on build with [Gulp](https://github.com/dallasmorningnews/gulp-archieml), [Grunt](https://github.com/achavez/grunt-archieml), or [Webpack](https://github.com/newsdev/archieml-loader).
*   Goes well with [liddiard/google-sheet-s3](https://github.com/liddiard/google-sheet-s3/) to use with your data.

## Setup

### Prerequisites

*   An Amazon S3 bucket for which you have:
    *   [Created security credentials](https://console.aws.amazon.com/iam/home?nc2=h_m_sc#users) that have write permissions to the bucket.
    *   Added a CORS policy that allows GET requests from whatever origin (domain name) you want to access the data from. The default policy allows access from any origin. To enable, go to your S3 Management Console, right-click your bucket name, click Properties > Permissions > Add CORS Configuration > Save (modal dialog) > Save (again) (blue button in sidebar)
    *   Added a bucket policy that enables public viewing of the published JSON. To enable, go to your S3 Management Console, right-click your bucket name, click Properties > Permissions > Add bucket policy > [Paste the text below to allow everyone public view access] > Save (modal dialog) > Save (again) (blue button in sidebar)

#### Bucket policy for public read-only access

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Sid": "AddPerm",
			"Effect": "Allow",
			"Principal": "*",
			"Action": "s3:GetObject",
			"Resource": "arn:aws:s3:::PUT-YOUR-BUCKET-NAME-HERE/*"
		}
	]
}
```

### Instructions

1.  Create or open an existing Google Doc.
2.  Make sure your content is written in [ArchieML syntax](http://archieml.org/).
3.  Install and enable [the add-on](#) (not published yet).
4.  In the docs's menu, go to Add-ons > Publish to S3 > Configure...
5.  Fill in the S3 bucket name, path within the bucket (leave blank if none), and AWS credentials that allow write access to the bucket.
6.  Click "Save". The S3 URL of your JSON-ified document will be shown.

To publish changes, go to Add-ons > Publish to S3 > Publish!. This will overwrite the JSON file in your S3 bucket. The JSON file's filename is taken from the document's internal ID, so the spreadsheet can be renamed without breaking the URL.

## Development setup instructions

1.  Create a new Google Apps Script with files whose names and content matches the ones in this repo (minus this readme).
2.  Add the [Amazon S3 API Binding](https://engetc.com/projects/amazon-s3-api-binding-for-google-apps-script/).
3. Add the [hmtlparser2 Apps Script Library] (https://github.com/Spencer-Easton/Apps-Script-htmlparser2-library). 
3.  In the menu bar, click Publish > Test as add-on...
4.  Select a version, for "Installation Config", choose "Installed and enabled", and select a document (must be a spreadsheet). Save.
