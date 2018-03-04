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
    options = {
      message: openpgp.message.readArmored(data),
      password: window.location.hash.substr(1),
    };

    openpgp.decrypt(options).then(function(plaintext) {
      const src = 'data:image/jpeg;base64, ' + window.btoa(plaintext.data);
      document.getElementById('image').src = src;
    }).catch(function(error) {
      const errorDiv = document.getElementById('error');
      errorDiv.innerHTML = 'Unable to decrypt message.';
      errorDiv.style.display = 'block';
    });
  }
});

