// DOM selector helpers (전역 노출)
window.$id = (id) => document.getElementById(id);
window.$one = (sel, root = document) => root.querySelector(sel);
window.$all = (sel, root = document) => Array.from(root.querySelectorAll(sel));
