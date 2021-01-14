const fs = require('fs');
const fetch = require('node-fetch');
const config = require('../config.json');

const getSettings = async () => {
  try {
    const homeserverUrl = config["default_server_config"]["m.homeserver"]["base_url"]

    if (!homeserverUrl) {
      throw new Error("The matrix server url is not provided")
    }

    const url = `${config.settings_endpoint}?homeserver=${encodeURIComponent(homeserverUrl)}`;

    console.log(`Fetching settings for ${homeserverUrl}`);

    const res = await fetch(url);
    const data = await res.json();

    const { fields } = data;

    const settingsObj = {
      "welcomeUserId": fields.web_botId,
      "brand": fields.platform_title,
      "branding": {
        "authHeaderLogoUrl": fields.platform_logoUrl,
        "welcomeBackgroundUrl": fields.platform_loginBackgroundUrl,
        "authFooterLinks": [
          {"text": fields.platform_footerLink1Text, "url": fields.platform_footerLink1Url },
          {"text": fields.platform_footerLink2Text, "url": fields.platform_footerLink2Url },
          {"text": fields.platform_footerLink3Text, "url": fields.platform_footerLink3Url }
        ]
      }
    }

    return settingsObj
  } catch (err) {
    console.log("Error fetching settings", err);
    return null
  }
};

const writeConfig = async () => {
  const settings = await getSettings()
  if (!settings) {
    return console.log('No settings to update')
  }

  const updatedSettings = Object.assign(config, settings)

  fs.writeFile('config.json', JSON.stringify(updatedSettings, null, 4), function (err) {
    if (err) return console.log("Error updating settings", err);
    console.log(`Updated settings to config.json`);
    console.log(updatedSettings);
  });
}

writeConfig();