# MMM-Pull
MMM-Pull is a module for the [MagicMirror](https://github.com/MichMich/MagicMirror) project by [Michael Teeuw](https://github.com/MichMich).

This module enables the user to pull updates for modules and/or MagicMirror itself via Telegram commands.

## Installation
Clone the module into your MagicMirror modules folder and execute `npm install` in the module's directory.
```
git clone https://github.com/mboskamp/MMM-Pull.git
cd MMM-Pull
npm install
```
## Configuration
To start the module insert it in the config.js file. Here is an example:
```
{
    module: 'MMM-Pull',
    position: 'bottom_center',
    config: {
        excludeModules: ['MMM-Pull'],
        restartScript: 'pm2 restart ~/mm.sh'
    }
}
```

<br>

| Option  | Description | Type | Default |
| ------- | --- | --- | --- |
| excludeModules | Array of module names that should not be pulled via this module. | **Array of Strings**  | **none** |
| restartScript | Script to restart your MagicMirror after pulling changes. If not specified the MagicMirror will not restart after successfully pulling changes. | **none** | **required** |
