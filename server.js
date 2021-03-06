const express = require('express');
const request = require('request');
const querystring = require('query-string');

const app = express();

const tokenCallbackUri = process.env.TOKEN_CALLBACK_URI || 'http://localhost:3003/callback';

app.get('/login', function(req, res) {
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: 'user-read-private user-read-email user-top-read user-read-recently-played user-library-read user-modify-playback-state user-read-currently-playing user-read-playback-state playlist-read-private',
      redirect_uri : tokenCallbackUri,
    }))
})

app.get('/callback', (req, res) => {
    const code = req.query.code || null;
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
        code: code,
        redirect_uri: tokenCallbackUri,
        grant_type: 'authorization_code'
        },
        headers: {
        'Authorization': 'Basic ' + (new Buffer(
            process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64'))
        },
        json: true
    }
    request.post(authOptions, (error, response, body) => {
         if(error) console.log(error);

         const accessToken = body.access_token || undefined;
         const uriToApp = process.env.REDIRECT_URI

         res.redirect(`${uriToApp}?access_token=${accessToken}`);
    })
});

const port = process.env.PORT || 3003
console.log(`Listening on port ${port}.`)
app.listen(port)