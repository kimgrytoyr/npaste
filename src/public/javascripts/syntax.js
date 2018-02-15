const ready = (fn) => {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();

  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(() => {
  const block = document.getElementById('paste');
  hljs.highlightBlock(block);
  hljs.lineNumbersBlock(block);
});
