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

    let passphrase = '';
    if (window.vault) {
      passphrase = prompt("Enter passphrase for vault '" + window.vault + "':");
    }

    const data = document.getElementById('data').innerHTML;

    try {
      options = {
        message: openpgp.message.readArmored(data),
        password: window.location.hash.substr(1) + passphrase,
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
      const src = 'data:image/jpeg;base64, ' + plaintext.data;
      document.getElementById('image').src = src;
      document.getElementById('decrypting').style.display = 'none';
    }).catch(function(error) {
      const errorDiv = document.getElementById('error');
      errorDiv.innerHTML = 'Unable to decrypt message. You probably have the wrong decryption key or passphrase.';
      errorDiv.style.display = 'block';
      document.getElementById('decrypting').style.display = 'none';
    });
  }
});

