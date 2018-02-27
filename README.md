# npaste
Simple personal pastebin and imagebin.

## Endpoints
`POST` and `DELETE` requires authentication. Set your credentials in `data/tokens.json`.

### Posting a text file
`POST /`

```
curl --basic --user user:pass -F "paste=@test.txt" "http://localhost:3000/"
```

### Posting an image file (jpg/png)
`POST /`

```
curl --basic --user user:pass -F "paste=@image.jpg" "http://localhost:3000/"
```

####  Options
You can provide the following options as POST fields:

`plain=1`  
Do not use syntax highlighting

`age=X[y|d|h|m]`  
Set expiration time. `X` is an integer. Example: `1d` will make the paste self destruct after one day. If no time unit is provided, it will be parsed as seconds. Be aware that pastes are deleted only once per minute.

### Delete a paste
`DELETE /<ID>`  
Deletes the paste with the given ID.

```
curl --basic --user user:pass -X DELETE -F "paste=@test.txt" "http://localhost:3000/someidhere"
```
### Display paste
`GET /<ID>`  
Displays a paste with the given ID.

`GET /<ID>/`  
Displays a paste in raw format.

`GET /<ID>/meta`  
Displays metadata about the paste.

## Installation

### Install local development environment
Requires: `git`, `docker`, `docker-compose`.

```
git clone https://git.grytoyr.io/npaste
cd npaste
docker-compose up
```

The server will be accessible via http://localhost:3000.

### Install in production
Requires: `git`, `docker`.

Decide which version (git tag) to run and check out the tag.
```
git clone https://git.grytoyr.io/npaste
cd npaste
git checkout $TAG_NAME
```

Modify the values in `data/config.production.json`.

Build the docker image with (remember the dot at the end):
`docker build -t npaste:latest .`

Run the container: `docker run --init --name npaste_1 --restart=always --volume="$(pwd)/data:/home/node/app/data" --publish="3000:3000" -d npaste:latest`

This will start the container and accept connections on port 3000. It's advised to use nginx or another reverse proxy to add features such as TLS, etc.

### Upgrading in production
Run `git pull` and checkout the tag you wish to upgrade to. Run the same build command (`docker build etc...`) as described in `Install in production`.

Upgrading will at this time lead to some downtime.

Stop and remove the container: `docker stop npaste_1 && docker rm npaste_1`

After the commands above are done, issue the run command (`docker run etc...`) as described in `Install in production`.

## Discussion and feedback
If you have any questions, feedback or patches, use the [mailing list](mailto:npaste@lists.grytoyr.io).
