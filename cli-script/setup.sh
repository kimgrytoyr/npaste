#!/bin/bash
#########################################################
#
#   curl https://src.grytoyr.io/kim/npaste/raw/branch/master/cli-script/setup.sh | sudo env CFG_DIR=/home/user/.config/npaste bash
#
#########################################################


## Get correct group name
case "$(uname -s)" in
    Darwin*)    GROUPNAME=staff;;
    *)          GROUPNAME="$SUDO_USER";;
esac

if [ -z "$TAG" ]; then
	TAG=v0.6.5
fi

if [ -z "$CFG_DIR"  ]; then
    CFG_DIR=$HOME/.config/npaste
fi

if [ -z "$INSTALL_DIR"  ]; then
    INSTALL_DIR=$HOME/bin
fi

if [ ! -d "$INSTALL_DIR" ]; then
    echo "INSTALL_DIR not found. You need to create it first ($INSTALL_DIR)"
    exit
fi

if [ ! -d "$CFG_DIR" ]; then
    echo "Creating $CFG_DIR ..."
    mkdir -p "$CFG_DIR"
    chown $SUDO_USER:$GROUPNAME "$CFG_DIR"
else
    echo "$CFG_DIR already exists ..."
fi

if [ ! -f "$CFG_DIR/cli.conf" ]; then
    echo "Creating config file ..."
    curl -s -o "$CFG_DIR/cli.conf" "https://src.grytoyr.io/kim/npaste/raw/tag/$TAG/cli-script/cli.conf.example"
    chown $SUDO_USER:$GROUPNAME "$CFG_DIR/cli.conf"
else
    echo "Config file already exists ..."
fi

if [ ! -f "$CFG_DIR/vaults" ]; then
    echo "Creating vaults file ..."
    touch "$CFG_DIR/vaults"
    chown $SUDO_USER:$GROUPNAME "$CFG_DIR/vaults"
else
    echo "Vaults file already exists ..."
fi

echo "Downloading npaste script $TAG ..."
curl -s -o "$INSTALL_DIR/npaste" "https://src.grytoyr.io/kim/npaste/raw/tag/$TAG/cli-script/npaste"
chmod +x "$INSTALL_DIR/npaste"

echo
echo "Installation complete! Remember to edit the config file:"
echo "  $CFG_DIR/cli.conf"
echo
