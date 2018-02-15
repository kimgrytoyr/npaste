# npaste
Simple personal pastebin and imagebin.

## Endpoints

`POST /`  
Allows you to post a new paste. Requires authentication.

### Posting a text file
```
curl --basic --user user:pass -F "paste=@test.txt" "http://localhost:3000/"
```

### Posting an image file (jpg/png)
```
curl --basic --user user:pass -F "paste=@image.jpg" "http://localhost:3000/"
```

`DELETE /<ID>`  
Deletes the paste with the given ID. Requires authentication.
```
curl --basic --user user:pass -X DELETE -F "paste=@test.txt" "http://localhost:3000/someidhere"
```

`GET /<ID>`  
Displays a paste with the given ID. Both text and images.

`GET /<ID>/meta`  
Displays metadata about the paste.
