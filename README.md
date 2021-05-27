# gh-pr-reports
A script to generate a changelog report based on tags and pull requests.

# Setup

The use this script you need first some preparation so we give permissions to the script to access your repositories.
For that you need to have a GH App to be approved by the user generating a token that will be used later for the script.

## Create GH OAuth App

Create a GitHub OAuth application [here](https://github.com/settings/applications/new). Take note of the **Authorization callback URL** you specify here. A good default is `http://localhost:3000/ Since you need to start the webapp here in that same URL. Also take note of the two fields GH generates: **CLIENT ID** and **CLIENT SECRET**.

## Authorize the app

Create a config file. There is a template file called `config.json.template` here.

```bash
cp config.json.template config.json
````

Edit that file to past CLIENT_ID and CLIENT_SECRET from your app

```json
{
  "PORT": 3000,
  "CLIENT_ID": "<< ... >>",
  "CLIENT_SECRET": "<< ... >>"
}
```

Now start the oauth webapp

```bash
yarn start-oauth-server
```

And head to [http://localhost:3000/login](http://localhost:3000/login)
You will be redirected to github to authorize the app.
After that you should see a JSON output with a token. Take note of the token.
You can now stop the webapp.

Edit again `config.json` to specify the token and repository

```json
{
  "TOKEN": "<< ... >>",

  "PORT": 3000,
  "CLIENT_ID": "<< ... >>",
  "CLIENT_SECRET": "<< ... >>"
}
```



# Run (generate a report)

Once we have the token we can now generate a report

```bash
yarn start
```

It will show you a list of organizations to pick one, then a list of repositories, and finally a tag.
Releases are created for a specific tag.
It will create a document in both pdf and html format that contains an index of all PR's merged into master
between the previous tag's date and the selected one.

Here a video showing how to use it
![gh-report-generator](https://user-images.githubusercontent.com/4428120/119832043-35ce7880-bed4-11eb-81d7-3ba4d8ccb209.gif)






