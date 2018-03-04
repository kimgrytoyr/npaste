const ready = (fn) => {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();

  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(() => {
  const openpgp = window.openpgp;
  openpgp.initWorker({ path:'/javascripts/openpgp.worker.min.js' });

  // Encryption stuff
  if (window.location.hash) {
    console.log("Decrypting image..");
    const data = document.getElementById('data').innerHTML;

    try {
      options = {
        message: openpgp.message.readArmored(data),
        password: window.location.hash.substr(1),
      };
    }
    catch (e) {
      const errorDiv = document.getElementById('error');
      errorDiv.innerHTML = 'Unable to decrypt message. The original content has probably been tampered with.';
      errorDiv.style.display = 'block';
      document.getElementById('decrypting').style.display = 'none';
      return;
    }

    openpgp.decrypt(options).then(function(plaintext) {
      const src = 'data:image/jpeg;base64, ' + window.btoa(plaintext.data);
      document.getElementById('image').src = src;
      document.getElementById('decrypting').style.display = 'none';
    }).catch(function(error) {
      const errorDiv = document.getElementById('error');
      errorDiv.innerHTML = 'Unable to decrypt message. You probably have the wrong decryption key.';
      errorDiv.style.display = 'block';
      document.getElementById('decrypting').style.display = 'none';
    });
  }
});

