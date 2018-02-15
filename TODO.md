# TODO
- Create script to create authentication token and add to data/tokens.json
- Create bash script to paste text or image

# DONE
- POST to / should add a new text paste
- DELETE to /:paste should delete a paste
- GET /:paste should display a raw version of the paste
- Check metadata before displaying file
  - If text, display raw file
  - If image, display image
- Require basic authentication for POST and DELETE
- Allow pasting of images (jpg, png)
