# TODO
- Refactor code. Move stuff to modules etc (WIP)
- Create script to create authentication token and add to data/tokens.json

# DONE
- POST to / should add a new text paste
- DELETE to /:paste should delete a paste
- GET /:paste should display a raw version of the paste
- Check metadata before displaying file
  - If text, display raw file
  - If image, display image
- Require basic authentication for POST and DELETE
- Allow pasting of images (jpg, png)
- Add basic syntax highlighting
- Implement plain text flag when pasting text to ensure correct syntax highlighting
- Implement "age" field when pasting. This allows pastes to automatically expire at a certain age.
- Create bash script to paste text or image

# WONTFIX
- Add boolean config "real_delete". If set to false, pastes will be archived instead of deleted when they expire.
  Reason for WONTFIX: When a user sets a paste to expire, they should never be misled to believe that it will be
                      deleted without it actually being deleted from the server.
