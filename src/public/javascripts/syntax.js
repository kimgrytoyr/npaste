let markdownHighlighted = false;

const ready = (fn) => {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();

  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

const addClass = (className, el) => {
  if (el.classList)
    el.classList.add(className);
  else
    el.className += ' ' + className;
}

const removeClass = (className, el) => {
  if (el.classList)
    el.classList.remove(className);
  else
    el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}

const hasClass = (className, el) => {
  if (el.classList)
    return el.classList.contains(className);
  else
    return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
}

const parseQueryString = () => {
    const vars = []
    let hash;
    let q = document.URL.split('?')[1];
    if(q !== undefined){
        q = q.split('&');
        for(let i = 0; i < q.length; i++){
            hash = q[i].split('=');
            vars.push(hash[1]);
            vars[hash[0]] = hash[1];
        }
    }
    return vars;
}

const toggleWrapping = (e) => {
  e.preventDefault();
  const elements = document.getElementsByClassName('hljs-ln-line');
  const className = 'wrapped';

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (hasClass(className, el)) {
      // Remove class
      removeClass(className, el);
    } else {
      // Add class
      addClass(className, el);
    }
  }
}

const toggleMarkdown = (e) => {
  if (e) {
    e.preventDefault();
  }
  const paste = document.getElementById('paste');
  const markdown = document.getElementById('markdown');

  const hash = window.location.hash.substr(1);

  if (paste.style.display === 'none') {
    // Hide Markdown
    paste.style.display = 'block';
    markdown.style.display = 'none';
    window.location.hash = '#' + window.location.hash.substr(1).split('#')[0] + '#code';
  } else {
    // Show markdown
    paste.style.display = 'none';
    markdown.style.display = 'block';
    window.location.hash = '#' + window.location.hash.substr(1).split('#')[0] + '#markdown';

    if (markdownHighlighted === false) {
      const pre_elements = document.getElementsByTagName('pre');
      for (let i = 0; i < pre_elements.length; i++) {
        const el = pre_elements[i].getElementsByTagName('code')[0];
        hljs.highlightBlock(el);
        hljs.lineNumbersBlock(el);
      }
      markdownHighlighted = true;
    }
  }
}

ready(() => {
  const toggleWrappingLink = document.getElementById('toggleWrapping');
  const toggleMarkdownLink = document.getElementById('toggleMarkdown');
  if (toggleWrappingLink) {
    toggleWrappingLink.addEventListener('click', toggleWrapping);
  }
  if (toggleMarkdownLink) {
    toggleMarkdownLink.addEventListener('click', toggleMarkdown);
    console.log(parseQueryString());
    if (parseQueryString().view === 'markdown') {
      toggleMarkdown();
    }
  }

  // Encryption stuff
  if (window.location.hash) {
    const openpgp = window.openpgp;
    openpgp.initWorker({ path:'/javascripts/openpgp.worker.min.js' });

    console.log("Decrypting text..");
    let passphrase = '';
    if (window.vault) {
      passphrase = prompt("Enter passphrase for vault '" + window.vault + "':");
    }

    const data = document.getElementById('paste').innerHTML;
    const password = window.location.hash.substr(1).split('#')[0];
    const viewAs = window.location.hash.substr(1).split('#')[1];

    try {
      options = {
        message: openpgp.message.readArmored(data),
        password: password + passphrase,
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
      const data = decodeURIComponent(escape(window.atob(plaintext.data)));
      const converter = new showdown.Converter();
      converter.setFlavor('github');
      document.getElementById('markdown').innerHTML = converter.makeHtml(data);
      document.getElementById('paste').innerHTML = data;
      const block = document.getElementById('paste');
      hljs.highlightBlock(block);
      hljs.lineNumbersBlock(block);
      block.style.display = 'block';
      document.getElementById('decrypting').style.display = 'none';

      if (viewAs === 'markdown') {
        toggleMarkdown();
      }
    }).catch(function(error) {
      const errorDiv = document.getElementById('error');
      errorDiv.innerHTML = 'Unable to decrypt message. You probably have the wrong decryption key or passphrase.';
      errorDiv.style.display = 'block';
      document.getElementById('decrypting').style.display = 'none';
    });
  } else {
      const block = document.getElementById('paste');
      hljs.highlightBlock(block);
      hljs.lineNumbersBlock(block);
      block.style.display = 'block';
  }
});
