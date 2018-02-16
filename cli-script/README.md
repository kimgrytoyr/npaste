# CLI script
Put the script somewhere in your `PATH` and put the config file in `~/.config/npaste/cli.conf`.

## Use cases

### Pipe a program's output
`echo "test" | npaste --age=2h`

Could be used to grep some log files and pipe the desired result.

### Pipe a program's output and copy link
`echo "test" | npaste --age=2h | xsel -i -b`

### Cat
`cat | npaste --age=2h`

Will give you a "text box". End with a blank line and `Ctrl + D`. Cancel at any time with `Ctrl + C`.

### Screenshots with scrot
`IMAGE_TEMP_FILE=$(mktemp --suffix=".png") && scrot -s -z $IMAGE_TEMP_FILE && npaste --age=2h $IMAGE_TEMP_FILE | xsel -i -b && rm $IMAGE_TEMP_FILE`

Let you select a region on the screen with the mouse and puts the resulting URL into your clipboard.

