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

ready(() => {
  const block = document.getElementById('paste');
  hljs.highlightBlock(block);
  hljs.lineNumbersBlock(block);

  const toggleWrappingLink = document.getElementById('toggleWrapping');
  if (toggleWrappingLink) {
    toggleWrappingLink.addEventListener('click', toggleWrapping);
  }
});
