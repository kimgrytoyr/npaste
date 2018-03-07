#!/bin/bash
#########################################################
#
#   curl https://paste.grytoyr.io/setup.sh | sudo env CFG_DIR=/home/user/.config/npaste bash
#
#########################################################


## Get correct group name
case "$(uname -s)" in
    Darwin*)    GROUPNAME=staff;;
    *)          GROUPNAME="$SUDO_USER";;
esac

if [ -z "$TAG" ]; then
	TAG=v0.6
fi

if [ -z "$CFG_DIR"  ]; then
    echo "You must specify the CFG_DIR environment variable"
    exit
fi

if [ ! -d "$CFG_DIR" ]; then
    echo "Creating $CFG_DIR ..."
    mkdir -p $CFG_DIR
    chown $SUDO_USER:$SUDO_USER $CFG_DIR
else
    echo "$CFG_DIR already exists ..."
fi

if [ ! -f "$CFG_DIR/cli.conf" ]; then
    echo "Creating config file ..."
    curl -s -o "$CFG_DIR/cli.conf" "https://git.grytoyr.io/npaste/plain/cli-script/cli.conf.example?h=$TAG"
    chown $SUDO_USER:$SUDO_USER $CFG_DIR/cli.conf
else
    echo "Config file already exists ..."
fi

if [ ! -f "$CFG_DIR/vaults" ]; then
    echo "Creating vaults file ..."
    touch "$CFG_DIR/vaults"
    chown $SUDO_USER:$SUDO_USER $CFG_DIR/vaults
else
    echo "Vaults file already exists ..."
fi

echo "Downloading npaste script $TAG ..."
curl -s -o /usr/local/bin/npaste "https://git.grytoyr.io/npaste/plain/cli-script/npaste?h=$TAG"
chmod +x /usr/local/bin/npaste

echo
echo "Installation complete! Remember to edit the config file:"
echo "  $CFG_DIR/cli.conf"
echo
