# mvs-plugin-cli
CLI for Metaverse Blockchain plugin development

## Installation
Install the cli globally with npm:
``` bash
sudo npm i -g mvs-plugin-cli
```

## Get started
To bootstrap a new project you can use the init command.
``` bash
mvs-plugin-cli init your-project
```
It will ask you some questions and generate a minimal project setup.

In the created folder you can see the generated files.

![GIF to show how to start](https://raw.githubusercontent.com/canguruhh/mvs-plugin-cli/master/images/how-to-start.gif)

## Run
Within a project folder you can use the CLI to host the plugin:
``` bash
mvs-plugin-cli serve
```
By default the server will listen to port 8080 but you can also define a custom port:
``` bash
mvs-plugin-cli serve --port 8000
```

## Open in lightwallet
You can use the MyETPWallet testnet, go to settings and enter the path to your config.json file. By default it is http://127.0.0.1:8080/config.json.
