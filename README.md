This is very much in the development phase, it shoudln't be used in prod without heavy changes and further testing. It's more a proof of concept for now.

The aim is to have a js version of tiddl, for use with web interfaces mainly (ie react + expressjs). Main features are intended as auth/login, auth/logout, auth/refresh and download. 

Config file management and features are aimed to be similar to and/or the same as tiddl.


### Required
- Make it honor config tags such as embed_lyrics, "download_video": false, etc 
- Update downloadTest.js to fullTest.js and have it also check file metadata is correct (including testing the above)

### Possible Features
- A solution to output periodic updates via means other than console, for easy monitoring in express.js / react webUIs
- Show speed in MB/s in progress
