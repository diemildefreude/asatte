var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { usePage, Head, Link, router, useForm, useRemember, createInertiaApp } from "@inertiajs/react";
import React, { useRef, useEffect, useCallback, useState, createContext, useContext, useMemo } from "react";
import { Editor } from "@tinymce/tinymce-react";
import DOMPurify from "isomorphic-dompurify";
import axios from "axios";
import createServer from "@inertiajs/react/server";
import { renderToString } from "react-dom/server";
function PageHead({
  title = "",
  description = "The premiere hub for internet art.",
  ogType = "website",
  ogImg
}) {
  const { url } = usePage();
  const fullUrl = `${usePage().props.app_url}${url}`;
  const domain = usePage().props.app_url;
  const ogImage = ogImg ?? `${domain}/storage/images/og_image.webp`;
  return /* @__PURE__ */ jsxs(Head, { title, children: [
    /* @__PURE__ */ jsx("meta", { "head-key": "description", name: "description", content: description }),
    /* @__PURE__ */ jsx("link", { "head-key": "canonical", rel: "canonical", href: fullUrl }),
    /* @__PURE__ */ jsx("meta", { "head-key": "og:url", property: "og:url", content: fullUrl }),
    /* @__PURE__ */ jsx("meta", { "head-key": "og:type", property: "og:type", content: ogType }),
    /* @__PURE__ */ jsx("meta", { "head-key": "og:title", property: "og:title", content: title || "asatte.io" }),
    /* @__PURE__ */ jsx("meta", { "head-key": "og:description", property: "og:description", content: description }),
    /* @__PURE__ */ jsx("meta", { "head-key": "og:image", property: "og:image", content: ogImage }),
    /* @__PURE__ */ jsx("meta", { "head-key": "og:image:width", property: "og:image:width", content: "1920" }),
    /* @__PURE__ */ jsx("meta", { "head-key": "og:image:height", property: "og:image:height", content: "1080" }),
    /* @__PURE__ */ jsx("meta", { "head-key": "twitter:card", name: "twitter:card", content: "summary_large_image" }),
    /* @__PURE__ */ jsx("meta", { "head-key": "twitter:domain", property: "twitter:domain", content: domain }),
    /* @__PURE__ */ jsx("meta", { "head-key": "twitter:url", property: "twitter:url", content: fullUrl }),
    /* @__PURE__ */ jsx("meta", { "head-key": "twitter:title", name: "twitter:title", content: title || "asatte.io" }),
    /* @__PURE__ */ jsx("meta", { "head-key": "twitter:description", name: "twitter:description", content: description }),
    /* @__PURE__ */ jsx("meta", { "head-key": "twitter:image", name: "twitter:image", content: ogImage })
  ] });
}
function RichTextEditor({ onChange, value, quotedMessage, onQuoteApplied, placeholder = " ", autoFocus = false, disabled = false }) {
  const editorRef = useRef(null);
  const localCssPath = "/tinymce/my-tinymce-styles.css";
  const localScriptSrc = "/tinymce/tinymce.min.js";
  useEffect(() => {
    var _a;
    if (quotedMessage && editorRef.current) {
      const editor = editorRef.current;
      const safeContent = quotedMessage.content || "";
      const username = ((_a = quotedMessage.sender) == null ? void 0 : _a.username) || null;
      let quoteHtml = username ? `<sub><em>${quotedMessage.sender.username} wrote:</em></sub>` : "";
      quoteHtml += `
              <blockquote >
                  ${safeContent}
              </blockquote>
              <p>&nbsp;</p>
          `;
      editor.focus();
      editor.selection.select(editor.getBody(), true);
      editor.selection.collapse(true);
      editor.execCommand("mceInsertContent", false, quoteHtml);
      onQuoteApplied();
    }
  }, [quotedMessage, onQuoteApplied]);
  return /* @__PURE__ */ jsx(
    Editor,
    {
      tinymceScriptSrc: localScriptSrc,
      onEditorChange: onChange,
      disabled,
      licenseKey: "gpl",
      value: typeof value === "string" ? value : "",
      editorRef,
      onInit: (evt, editor) => {
        editorRef.current = editor;
        if (autoFocus) {
          editor.focus();
        }
      },
      init: {
        min_height: 100,
        convert_urls: false,
        menubar: false,
        link_assume_external_targets: "http",
        link_default_protocol: "http",
        plugins: "autoresize image link media",
        autoresize_bottom_margin: 50,
        toolbar: disabled ? false : ["styles | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | image media link"],
        extended_valid_elements: "blockquote[class|data-instgrm-permalink|data-instgrm-version|data-instgrm-captioned|data-instgrm-payload-id|data-video-id|cite|data-theme|data-dnt|data-media-max-width],iframe[src|title|width|height|frameborder|allowfullscreen|scrolling|allow|style]",
        toolbar_mode: "wrap",
        mobile: {
          toolbar_mode: "wrap"
        },
        placeholder,
        // image_title: true,
        // automatic_uploads: true,
        sandbox_iframes: false,
        file_picker_types: "image",
        media_live_embeds: true,
        setup: (editor) => {
          editor.on("BeforeSetContent", (e) => {
            if (!e.content) return;
            if (e.content.includes("twitter-tweet")) {
              e.content = e.content.replace(/<blockquote class="[^"]*twitter-tweet[^"]*"[^>]*>[\s\S]*?href="https:\/\/(?:twitter|x)\.com\/[^\/]+\/status\/(\d+)[^"]*"[\s\S]*?<\/blockquote>(?:\s*<script[^>]*>[\s\S]*?<\/script>)?/ig, (match, tweetId) => {
                return `<iframe src="https://platform.twitter.com/embed/Tweet.html?id=${tweetId}" width="550" height="600" frameborder="0" scrolling="no" style="max-width: 100%; overflow: hidden;"></iframe>`;
              });
            }
            if (e.content.includes("instagram-media")) {
              e.content = e.content.replace(/<blockquote class="[^"]*instagram-media[^"]*"[^>]*data-instgrm-permalink="https:\/\/(?:www\.)?instagram\.com\/(?:[^\/]+\/)?(?:p|reel|tv)\/([a-zA-Z0-9_-]+)[^"]*"[\s\S]*?<\/blockquote>(?:\s*<script[^>]*>[\s\S]*?<\/script>)?/ig, (match, igId) => {
                return `<iframe src="https://www.instagram.com/p/${igId}/embed/captioned" width="540" height="700" frameborder="0" scrolling="no" style="max-width: 100%; overflow: hidden;"></iframe>`;
              });
            }
            if (e.content.includes("tiktok-embed")) {
              e.content = e.content.replace(/<blockquote class="[^"]*tiktok-embed[^"]*"[^>]*cite="https:\/\/(?:www\.)?tiktok\.com\/[^\/]+\/video\/(\d+)[^"]*"[\s\S]*?<\/blockquote>(?:\s*<script[^>]*>[\s\S]*?<\/script>)?/ig, (match, videoId) => {
                return `<iframe src="https://www.tiktok.com/embed/v2/${videoId}" width="325" height="740" frameborder="0" scrolling="no" allow="fullscreen" style="max-width: 100%; overflow: hidden;"></iframe>`;
              });
            }
            if (e.content.includes("iframe-container") || e.content.includes("statement")) {
              const tempDiv = document.createElement("div");
              tempDiv.innerHTML = e.content;
              const unwrapClasses = [".iframe-container-container", ".iframe-container", ".statement"];
              unwrapClasses.forEach((selector) => {
                const elements = Array.from(tempDiv.querySelectorAll(selector));
                elements.reverse().forEach((el) => {
                  if (el.parentNode) {
                    while (el.firstChild) {
                      el.parentNode.insertBefore(el.firstChild, el);
                    }
                    el.parentNode.removeChild(el);
                  }
                });
              });
              e.content = tempDiv.innerHTML;
            }
          });
          editor.on("init", () => {
            const editorWin = editor.getWin();
            const editorDoc = editor.getDoc();
            if (!editorWin || !editorDoc) return;
            editorWin.addEventListener("message", (event) => {
              let data;
              try {
                data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
              } catch (e) {
                return;
              }
              if (data && data["twttr.embed"] && data["twttr.embed"].method === "twttr.private.resize") {
                const height = data["twttr.embed"].params[0].height;
                const iframes = editorDoc.querySelectorAll('iframe[src*="platform.twitter.com/embed/Tweet.html"]');
                for (let i = 0; i < iframes.length; i++) {
                  if (iframes[i].contentWindow === event.source) {
                    iframes[i].style.height = `${height + 4}px`;
                    break;
                  }
                }
              }
              if (data && data.type === "MEASURE" && data.details && data.details.height) {
                const height = data.details.height;
                const iframes = editorDoc.querySelectorAll('iframe[src*="instagram.com"]');
                for (let i = 0; i < iframes.length; i++) {
                  if (iframes[i].contentWindow === event.source) {
                    iframes[i].style.height = `${height + 4}px`;
                    break;
                  }
                }
              }
            });
          });
          editor.on("click", (e) => {
            if (e.target.nodeName === "BODY" || e.target.nodeName === "HTML") {
              const body = editor.getBody();
              if (!body || !body.lastElementChild) return;
              const rect = body.lastElementChild.getBoundingClientRect();
              if (e.clientY > rect.bottom - 10) {
                let lastEl = body.lastElementChild;
                if (lastEl.querySelector(".mce-preview-object, iframe, img") || ["IFRAME", "IMG", "VIDEO"].includes(lastEl.nodeName)) {
                  const newP = editor.getDoc().createElement("p");
                  newP.innerHTML = '<br data-mce-bogus="1">';
                  body.appendChild(newP);
                  lastEl = newP;
                }
                editor.selection.setCursorLocation(lastEl, 0);
              }
            }
          });
          const handleBackspace = (e) => {
            const isBackspace = e.type === "keydown" && (e.key === "Backspace" || e.keyCode === 8);
            const isDeleteBackward = e.type === "beforeinput" && e.inputType === "deleteContentBackward";
            if (isBackspace || isDeleteBackward) {
              const sel = editor.selection;
              const rng = sel.getRng();
              let currentNode = rng.startContainer;
              let offset = rng.startOffset;
              const isEmbedNode = (node) => node && (["IFRAME", "IMG", "VIDEO", "FIGURE"].includes(node.nodeName) || node.classList && node.classList.contains("mce-preview-object"));
              let embedToDelete = null;
              let wrapperToClean = null;
              if (!sel.isCollapsed()) {
                const selectedNode = sel.getNode();
                if (isEmbedNode(selectedNode)) {
                  embedToDelete = selectedNode;
                }
              }
              if (!embedToDelete && currentNode.nodeType === 1 && offset > 0) {
                const prevNode = currentNode.childNodes[offset - 1];
                if (isEmbedNode(prevNode)) {
                  embedToDelete = prevNode;
                } else if (prevNode && prevNode.nodeType === 1 && isEmbedNode(prevNode.lastChild)) {
                  embedToDelete = prevNode.lastChild;
                  wrapperToClean = prevNode;
                }
              }
              if (!embedToDelete && currentNode.nodeType === 3 && offset === 0) {
                if (currentNode.previousSibling && isEmbedNode(currentNode.previousSibling)) {
                  embedToDelete = currentNode.previousSibling;
                } else if (currentNode.previousSibling && currentNode.previousSibling.nodeType === 1 && isEmbedNode(currentNode.previousSibling.lastChild)) {
                  embedToDelete = currentNode.previousSibling.lastChild;
                  wrapperToClean = currentNode.previousSibling;
                }
              }
              if (!embedToDelete && offset === 0) {
                let currentBlock = currentNode.nodeType === 3 ? currentNode.parentNode : currentNode;
                while (currentBlock && !editor.dom.isBlock(currentBlock) && currentBlock.nodeName !== "BODY") {
                  currentBlock = currentBlock.parentNode;
                }
                if (currentBlock && currentBlock.previousSibling) {
                  const prevBlock = currentBlock.previousSibling;
                  if (isEmbedNode(prevBlock)) {
                    embedToDelete = prevBlock;
                  } else if (prevBlock.lastChild && isEmbedNode(prevBlock.lastChild)) {
                    embedToDelete = prevBlock.lastChild;
                    wrapperToClean = prevBlock;
                  } else if (prevBlock.querySelector) {
                    const embeds = prevBlock.querySelectorAll("iframe, img, video, figure, .mce-preview-object");
                    if (embeds.length > 0) {
                      embedToDelete = embeds[embeds.length - 1];
                      wrapperToClean = prevBlock;
                    }
                  }
                }
              }
              if (embedToDelete) {
                e.preventDefault();
                e.stopPropagation();
                let targetBlock = wrapperToClean ? wrapperToClean.previousSibling : embedToDelete.previousSibling;
                if (targetBlock) {
                  editor.selection.select(targetBlock, true);
                  editor.selection.collapse(false);
                }
                editor.dom.remove(embedToDelete);
                if (wrapperToClean && wrapperToClean !== embedToDelete && !wrapperToClean.textContent.trim() && !wrapperToClean.querySelector("img, iframe, video")) {
                  editor.dom.remove(wrapperToClean);
                }
              }
            }
          };
          editor.on("init", () => {
            const doc = editor.getDoc();
            doc.addEventListener("keydown", handleBackspace, true);
            doc.addEventListener("beforeinput", handleBackspace, true);
          });
        },
        media_url_resolver: (data) => {
          return new Promise((resolve, reject) => {
            if (data.url && data.url.includes("youtube.com/shorts/")) {
              const match = data.url.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
              if (match && match[1]) {
                const videoId = match[1];
                const embedHtml = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
                resolve({ html: embedHtml });
                return;
              }
            }
            if (data.url && (data.url.includes("instagram.com/") && (data.url.includes("/p/") || data.url.includes("/reel/")))) {
              const match = data.url.match(/instagram\.com\/(?:[^\/]+\/)?(p|reel)\/([a-zA-Z0-9_-]+)/);
              if (match && match[2]) {
                const embedHtml = `<iframe src="https://www.instagram.com/p/${match[2]}/embed/captioned" width="540" height="700" frameborder="0" scrolling="no" style="max-width: 100%; overflow: hidden;"></iframe>`;
                resolve({ html: embedHtml });
                return;
              }
            }
            if (data.url && data.url.includes("tiktok.com/")) {
              const match = data.url.match(/tiktok\.com\/.*\/video\/(\d+)/);
              if (match && match[1]) {
                const embedHtml = `<iframe src="https://www.tiktok.com/embed/v2/${match[1]}" width="325" height="740" frameborder="0" scrolling="no" allow="fullscreen" style="max-width: 100%; overflow: hidden;"></iframe>`;
                resolve({ html: embedHtml });
                return;
              }
            }
            if (data.url && (data.url.includes("twitter.com/") || data.url.includes("x.com/"))) {
              const match = data.url.match(/(twitter\.com|x\.com)\/([^/]+)\/status\/(\d+)/);
              if (match && match[3]) {
                const embedHtml = `<iframe src="https://platform.twitter.com/embed/Tweet.html?id=${match[3]}" width="550" height="600" frameborder="0" scrolling="no" style="max-width: 100%; overflow: hidden;"></iframe>`;
                resolve({ html: embedHtml });
                return;
              }
            }
            if (data.url && data.url.includes("vimeo.com/")) {
              const match = data.url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
              if (match && match[1]) {
                const embedHtml = `<iframe src="https://player.vimeo.com/video/${match[1]}" width="560" height="315" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
                resolve({ html: embedHtml });
                return;
              }
            }
            resolve({ html: "" });
          });
        },
        file_picker_callback: (cb, value2, meta) => {
          const editor = window.tinymce.activeEditor;
          const input = document.createElement("input");
          input.setAttribute("type", "file");
          input.setAttribute("accept", "image/*");
          input.addEventListener("change", (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
              const id = "blobid" + (/* @__PURE__ */ new Date()).getTime();
              const blobCache = editor.editorUpload.blobCache;
              const base64 = reader.result.split(",")[1];
              const blobInfo = blobCache.create(id, file, base64);
              blobCache.add(blobInfo);
              cb(blobInfo.blobUri(), { title: file.name });
            };
            reader.readAsDataURL(file);
          });
          input.click();
        },
        toolbar_mode: "wrap",
        object_resizing: "img,iframe,video,figure",
        content_css: localCssPath + "?v=" + (/* @__PURE__ */ new Date()).getTime()
      }
    }
  );
}
function EditButton({ onClick, disabled = false, className = "" }) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick,
      disabled,
      className: className + " edit-button",
      type: "button",
      title: "edit",
      children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-pen-to-square" })
    }
  );
}
function UserLink({ user, readOnly = false, onClick = null, additionalClasses = "", url = null, returnUser = false }) {
  const { props } = usePage();
  const target = url ?? `/${user == null ? void 0 : user.username}/profile`;
  const avatar = (user == null ? void 0 : user.avatar) ? `${props.app_url}/storage/images/uploaded/users/${user.username}/avatar/thumb/${user == null ? void 0 : user.avatar}` : `${props.app_url}/storage/images/defaults/avatar.webp?v=1`;
  let classes = `user-link ${additionalClasses}`;
  classes = readOnly ? classes + " read-only" : classes;
  const handleOnClickOverride = useCallback((e) => {
    if (onClick && returnUser) {
      onClick(e, user);
    } else if (onClick) {
      onClick(e);
    }
  }, [onClick, user, readOnly, returnUser]);
  return /* @__PURE__ */ jsx(Fragment, { children: user ? /* @__PURE__ */ jsxs(
    Link,
    {
      href: target,
      className: classes,
      draggable: "false",
      onClick: handleOnClickOverride,
      children: [
        /* @__PURE__ */ jsxs("span", { className: "avatar-container", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              className: "round-image",
              src: avatar,
              alt: `${user.username}'s avatar`,
              draggable: "false"
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "notice-light small" })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "username", children: user.username })
      ]
    }
  ) : /* @__PURE__ */ jsx("span", { className: "loading bold", children: /* @__PURE__ */ jsx("em", { children: "deleted user" }) }) });
}
function Header() {
  var _a;
  const { props, url } = usePage();
  props.app_url;
  const user = (_a = props == null ? void 0 : props.auth) == null ? void 0 : _a.user;
  const unread = (props == null ? void 0 : props.unread) ?? {};
  const hasUnread = !!unread.has_unread_notifications || !!unread.has_unread_mail;
  const dashboardUrl = `/dashboard`;
  const isClient = typeof window !== "undefined";
  const isAuthenticated = !!user;
  const [isNavOpen, setIsNavOpen] = useState(false);
  const headerRef = useRef(null);
  const buttonClasses = isNavOpen ? "nav-button-container open" : "nav-button-container";
  const navClasses = isNavOpen ? "open" : "";
  const lastScrollTopRef = useRef(isClient ? window.scrollY : 0);
  const didScrollRef = useRef(false);
  const scrollDeltaThreshold = 5;
  const pathname = url.split("?")[0];
  const searchString = url.includes("?") ? url.split("?")[1] : "";
  const urlParams = new URLSearchParams(searchString);
  const currentSearchTerm = urlParams.get("q");
  const [searchTerm, setSearchTerm] = useState("");
  const isSearchPage = pathname === "/search";
  const searchInputRef = useRef(null);
  let searchClasses = "nav-item nav-search-container";
  searchClasses = isSearchPage || searchTerm.length > 0 ? searchClasses + " always-open" : searchClasses;
  const toggleMenu = () => {
    setIsNavOpen((prev) => !prev);
  };
  useEffect(() => {
    if (pathname == "/search" && currentSearchTerm) {
      setSearchTerm(currentSearchTerm);
    }
  }, []);
  useEffect(() => {
    document.body.classList.toggle("nav-open", isNavOpen);
    return () => {
      document.body.classList.toggle("nav-open", false);
    };
  }, [isNavOpen]);
  useEffect(() => {
    const detectScroll = () => {
      didScrollRef.current = true;
    };
    const handleScroll = () => {
      if (!headerRef.current) {
        return;
      }
      const scrollTop = window.scrollY;
      const diff = Math.abs(lastScrollTopRef - scrollTop);
      if (diff <= scrollDeltaThreshold) {
        return;
      }
      if (scrollTop > lastScrollTopRef.current) {
        headerRef.current.classList.toggle("header-out", true);
        headerRef.current.classList.toggle("header-in", false);
      } else {
        headerRef.current.classList.toggle("header-out", false);
        headerRef.current.classList.toggle("header-in", true);
      }
      lastScrollTopRef.current = scrollTop;
    };
    const scrollCheckInterval = setInterval(() => {
      if (didScrollRef.current) {
        didScrollRef.current = false;
        handleScroll();
      }
    }, 150);
    window.addEventListener("scroll", detectScroll);
    return () => {
      window.removeEventListener("scroll", detectScroll);
      clearInterval(scrollCheckInterval);
    };
  }, []);
  const handleSearch = useCallback(
    /*async*/
    (e) => {
      e.preventDefault();
      if (!searchTerm || searchTerm.length < 2) {
        return;
      }
      const encodedQuery = encodeURIComponent(searchTerm);
      setIsNavOpen(false);
      router.visit(`/search?q=${encodedQuery}`);
    },
    [searchTerm]
  );
  return /* @__PURE__ */ jsxs("header", { ref: headerRef, children: [
    /* @__PURE__ */ jsx("div", { className: buttonClasses, children: /* @__PURE__ */ jsx(
      "button",
      {
        title: "nav-button",
        className: "js-nav-button nav-button",
        type: "button",
        "aria-controls": "nav-button",
        "aria-expanded": isNavOpen,
        onClick: toggleMenu,
        children: /* @__PURE__ */ jsxs("div", { className: "hamburger", children: [
          /* @__PURE__ */ jsx("span", { className: "bar bar1" }),
          /* @__PURE__ */ jsx("span", { className: "bar bar2" }),
          /* @__PURE__ */ jsx("span", { className: "bar bar3" })
        ] })
      }
    ) }),
    /* @__PURE__ */ jsxs("nav", { className: navClasses, children: [
      /* @__PURE__ */ jsxs("div", { className: "nav-half first", children: [
        /* @__PURE__ */ jsxs(
          "form",
          {
            tabIndex: "0",
            onFocus: () => {
              var _a2;
              return (_a2 = searchInputRef.current) == null ? void 0 : _a2.focus();
            },
            onSubmit: handleSearch,
            className: searchClasses,
            children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  id: "search",
                  name: "search",
                  className: "nav-search",
                  type: "text",
                  placeholder: "search",
                  onChange: (e) => setSearchTerm(e.target.value),
                  value: searchTerm,
                  ref: searchInputRef,
                  "aria-label": "search"
                }
              ),
              /* @__PURE__ */ jsx("button", { type: "submit", tabIndex: "-1", "aria-label": "Submit search", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-magnifying-glass", "aria-hidden": "true" }) })
            ]
          }
        ),
        /* @__PURE__ */ jsx(Link, { href: "/", className: "nav-item", onClick: () => setIsNavOpen(false), children: "home" }),
        /* @__PURE__ */ jsx(Link, { href: "/news", className: "nav-item", onClick: () => setIsNavOpen(false), children: "news" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "nav-half second", children: [
        /* @__PURE__ */ jsx(Link, { href: "/contact", className: "nav-item", onClick: () => setIsNavOpen(false), children: "contact" }),
        /* @__PURE__ */ jsx(Link, { href: "/about", className: "nav-item", onClick: () => setIsNavOpen(false), children: "about" }),
        isAuthenticated ? /* @__PURE__ */ jsx(
          UserLink,
          {
            user,
            additionalClasses: `nav-item ${hasUnread ? "has-unread" : ""}`,
            url: dashboardUrl,
            onClick: () => setIsNavOpen(false)
          }
        ) : /* @__PURE__ */ jsx(Link, { href: "/login", className: "nav-item", onClick: () => setIsNavOpen(false), children: "log in" })
      ] })
    ] })
  ] });
}
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);
function InertiaAuthBridge() {
  var _a;
  const { props } = usePage();
  const inertiaUser = ((_a = props == null ? void 0 : props.auth) == null ? void 0 : _a.user) ?? null;
  const { syncInertiaUser } = useAuth() || {};
  useEffect(() => {
    if (typeof syncInertiaUser === "function") {
      syncInertiaUser(inertiaUser);
    }
  }, [inertiaUser, syncInertiaUser]);
  return null;
}
function Layout({ children, isDashboard = false, classes = "" }) {
  const { props } = usePage();
  const APP_NAME = props.app_name;
  const [isTouchDevice, setIsTouchDevice] = useState();
  let classNames = isTouchDevice ? "touch-device content" : "content";
  classNames += ` ${classes}`;
  useEffect(() => {
    let ticking = false;
    let isFooterVisible = false;
    const footerElement = document.querySelector("footer");
    const updateFooter = () => {
      if (footerElement) {
        const rect = footerElement.getBoundingClientRect();
        const bottomOffset = window.innerHeight - rect.bottom;
        document.body.style.setProperty("--footer-bottom", `${bottomOffset}px`);
      }
    };
    const handleResize = () => {
      const isCurrentlyTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(isCurrentlyTouch);
      updateFooter();
    };
    handleResize();
    const onScroll = () => {
      if (window.scrollX !== 0) {
        document.body.style.setProperty("--scroll-x", `-${window.scrollX}px`);
      } else {
        document.body.style.removeProperty("--scroll-x");
      }
      if (isFooterVisible) {
        updateFooter();
      }
      ticking = false;
    };
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    };
    let observer;
    if (footerElement) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isFooterVisible = entry.isIntersecting;
            if (isFooterVisible) {
              updateFooter();
            }
          });
        },
        {
          rootMargin: "500px"
        }
      );
      observer.observe(footerElement);
    }
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    onScroll();
    return () => {
      if (observer && footerElement) {
        observer.unobserve(footerElement);
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Header, {}),
    /* @__PURE__ */ jsx(InertiaAuthBridge, {}),
    /* @__PURE__ */ jsx("div", { className: classNames, children: isDashboard ? children : /* @__PURE__ */ jsx("main", { children }) }),
    /* @__PURE__ */ jsxs("footer", { children: [
      /* @__PURE__ */ jsx("div", { className: "footer-background" }),
      /* @__PURE__ */ jsx("div", { className: "copyright", children: /* @__PURE__ */ jsxs("small", { children: [
        APP_NAME,
        " © 2026"
      ] }) })
    ] })
  ] });
}
const LoginType = {
  Email: "email"
};
function isSafeVideoIframeSrc(src) {
  try {
    const url = new URL(src, window.location.origin);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    return true;
  } catch {
    return false;
  }
}
function sanitizeRichHtml(html) {
  if (!html) return "";
  DOMPurify.addHook("uponSanitizeElement", (node, data) => {
    var _a;
    if (data.tagName === "iframe") {
      const src = node.getAttribute("src") || "";
      if (!isSafeVideoIframeSrc(src)) {
        (_a = node.parentNode) == null ? void 0 : _a.removeChild(node);
      }
    }
  });
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "strike",
      "sub",
      "sup",
      "blockquote",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "span",
      "div",
      "iframe"
    ],
    ALLOWED_ATTR: [
      "href",
      "title",
      "target",
      "rel",
      "src",
      "alt",
      "width",
      "height",
      "style",
      "class",
      "frameborder",
      "allowfullscreen",
      "allow",
      "referrerpolicy",
      "scrolling"
    ],
    ALLOW_DATA_ATTR: true
  });
  DOMPurify.removeHook("uponSanitizeElement");
  return clean;
}
function addFetchedPostsToExcludes(posts, previous) {
  const excludes = previous;
  posts.forEach((post) => {
    excludes.push(post.id);
  });
  return excludes;
}
function getPostsFetchParams(amount, category, fetchOrder, fetchIndexRef = null, fetchExcludesRef = null, userId = null, username = null, searchTerm = "") {
  const params = new URLSearchParams();
  params.append("amount", amount);
  params.append("fetch_order", fetchOrder);
  params.append("category", category);
  params.append("search_term", searchTerm);
  if (fetchOrder == FetchOrder.Random) {
    params.append("excludes", fetchExcludesRef.current);
  } else if (fetchIndexRef.current) {
    params.append("start_id", fetchIndexRef.current);
  }
  if (userId) {
    params.append("user_id", userId);
  } else if (username) {
    params.append("username", username);
  }
  return params;
}
function scrollToElement(currentUrl, id, replaceState = true) {
  var _a;
  const newUrl = `${currentUrl}#${id}`;
  if (replaceState) {
    window.history.replaceState(null, "", newUrl);
  }
  (_a = document.getElementById(id)) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
}
function getDateAsYYYYMMDD(dateTimeString) {
  const dateObj = new Date(dateTimeString);
  const offsetDate = new Intl.DateTimeFormat("en-CA", {
    // 'en-CA' uses YYYY-MM-DD format!
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(dateObj);
  return offsetDate;
}
function getTimeAsHHMM(dateTimeString) {
  const dateObj = new Date(dateTimeString);
  const timeString = new Intl.DateTimeFormat("en-CA", {
    hour: "2-digit",
    minute: "2-digit"
    //hour12: false // 24-hour (military) format
  }).format(dateObj);
  return timeString.replace(" AM", "am").replace(" PM", "pm");
}
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
function handleResizeWithCanvas(img, mimeType, isGallery = false) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const maxWidth = isGallery ? 1920 : 1280;
    const maxHeight = isGallery ? 1920 : 1280;
    let width = img.width;
    let height = img.height;
    if (width > height) {
      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width *= maxHeight / height;
        height = maxHeight;
      }
    }
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    canvas.toBlob((blob) => {
      resolve(blob);
    }, mimeType, 0.7);
  });
}
function resizeImage(source, isGallery = false) {
  if (typeof source === "string") {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const blob = await handleResizeWithCanvas(img, "image/jpeg", isGallery);
          resolve(blob);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = reject;
      img.src = source;
    });
  } else if (source instanceof File || source instanceof Blob) {
    if (!source.type.match("^image/")) {
      return Promise.reject("Invalid file type. Not an image.");
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const img = new Image();
        img.onload = async () => {
          try {
            const blob = await handleResizeWithCanvas(img, source.type, isGallery);
            resolve(blob);
          } catch (error) {
            reject(error);
          }
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    });
  } else {
    return Promise.reject("Invalid source. Must be a File, Blob, or Blob URL.");
  }
}
function dehydrateEditorImagePaths(htmlString, appUrl = "") {
  if (!htmlString) return htmlString;
  const BACKEND = appUrl ? appUrl.replace(/\/$/, "") : "";
  return htmlString.replace(/<img\s+[^>]*src=(["'])(.*?)\1[^>]*>/gi, (match, quote, currentSrc) => {
    let newSrc = currentSrc;
    const m1 = currentSrc.match(/(?:https?:\/\/[^\/]+)?\/?storage\/(images\/uploaded\/.+)/i);
    if (m1 && m1[1]) {
      newSrc = m1[1];
    } else {
      const m2 = currentSrc.match(/^storage\/(images\/uploaded\/.+)/i);
      if (m2 && m2[1]) {
        newSrc = m2[1];
      } else if (BACKEND && currentSrc.startsWith(`${BACKEND}/storage`)) {
        newSrc = currentSrc.replace(`${BACKEND}/storage`, "").replace(/^\/+/, "");
      }
    }
    if (newSrc !== currentSrc) {
      return match.replace(`src=${quote}${currentSrc}${quote}`, `src=${quote}${newSrc}${quote}`);
    }
    return match;
  });
}
function hydrateEditorImagePaths(htmlString, appUrl = "") {
  if (!htmlString) return htmlString;
  const BACKEND = appUrl ? appUrl.replace(/\/$/, "") : "";
  const STORAGE_BASE_URL = BACKEND ? `${BACKEND}/storage` : "/storage";
  return htmlString.replace(/<img\s+[^>]*src=(["'])(.*?)\1[^>]*>/gi, (match, quote, rawPath) => {
    if (!rawPath || rawPath.startsWith("http") || rawPath.startsWith("www") || rawPath.startsWith("data:")) {
      return match;
    }
    let cleanPath = null;
    const m1 = rawPath.match(/(?:https?:\/\/[^\/]+)?\/?storage\/(images\/uploaded\/.+)/i);
    if (m1 && m1[1]) {
      cleanPath = m1[1];
    } else if (/^storage\/(images\/uploaded\/.+)/i.test(rawPath)) {
      cleanPath = rawPath.replace(/^storage\//i, "");
    } else if (/^images\/uploaded\/.+/i.test(rawPath)) {
      cleanPath = rawPath;
    }
    if (!cleanPath) return match;
    const absoluteUrl = `${STORAGE_BASE_URL}/${cleanPath.replace(/^[\/]+/, "")}`;
    return match.replace(`src=${quote}${rawPath}${quote}`, `src=${quote}${absoluteUrl}${quote}`);
  });
}
async function processEditorImages(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  const images = doc.querySelectorAll("img");
  for (const img of images) {
    if (img.src.startsWith("data:image/")) {
      const response = await fetch(img.src);
      const blob = await response.blob();
      const resizedBlob = await resizeImage(blob);
      img.src = await blobToBase64(resizedBlob);
    }
  }
  return doc.body.innerHTML;
}
function isValidImageType(file) {
  if (!file) {
    return false;
  }
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/bmp"
  ];
  const isValidImageType2 = allowedMimeTypes.includes(file.type);
  return isValidImageType2;
}
function getImageFilesFromInput(e) {
  let inputs = e.dataTransfer ? e.dataTransfer.items : e.target.files;
  const outputs = [];
  let error = "";
  for (let i = 0; i < inputs.length; ++i) {
    const file = e.dataTransfer ? inputs[i].getAsFile() : inputs[i];
    const isValid = isValidImageType(file);
    if (!isValid) {
      error = "Files must be images of type jpg, png, webp or bmp.";
      continue;
    }
    outputs.push(file);
  }
  return { images: outputs, error };
}
function getImageFileFromInput(e) {
  const file = e.dataTransfer ? e.dataTransfer.items[0].getAsFile() : e.target.files[0];
  const isValid = isValidImageType(file);
  if (!isValid) {
    return null;
  }
  return file;
}
function getImageUrlFromFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target.result;
      resolve(imageDataUrl);
    };
    reader.readAsDataURL(file);
  });
}
function addImageDragListeners(element, counterRef, handleDrop) {
  if (!element) {
    return;
  }
  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  function handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    counterRef.current++;
    if (counterRef.current === 1) {
      element.classList.add("dragged-over");
    }
  }
  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    counterRef.current--;
    if (counterRef.current === 0) {
      element.classList.remove("dragged-over");
    }
  }
  element.addEventListener("dragover", handleDragOver);
  element.addEventListener("dragenter", handleDragEnter);
  element.addEventListener("dragleave", handleDragLeave);
  element.addEventListener("drop", handleDrop);
  return () => {
    element.removeEventListener("dragover", handleDragOver);
    element.removeEventListener("dragenter", handleDragEnter);
    element.removeEventListener("dragleave", handleDragLeave);
    element.removeEventListener("drop", handleDrop);
  };
}
function getVideoEmbedUrl(url) {
  const youTubePatterns = [
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
    // youtu.be/VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    // youtube.com/watch?v=VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    // youtube.com/embed/VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
    // youtube.com/embed/VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    // youtube.com/v/VIDEO_ID (older embed)
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    // youtube.com/shorts/VIDEO_ID
  ];
  const vimeoPatterns = [
    /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d{8,11})/,
    // Standard URL: https://vimeo.com/123456789
    /(?:https?:\/\/)?(?:www\.)?player\.vimeo\.com\/video\/(\d{8,11})/
    // Embed URL: https://player.vimeo.com/video/123456789
  ];
  const dailyMotionPatterns = [
    /(?:https?:\/\/)?(?:www\.)?dailymotion\.com\/video\/([a-zA-Z0-9]{1,18})/,
    // Standard URL: https://dailymotion.com/video/x123abc
    /(?:https?:\/\/)?(?:www\.)?dai\.ly\/([a-zA-Z0-9]{1,18})/
    // Shortened URL: https://dai.ly/x123abc
  ];
  const youkuPatterns = [
    /(?:https?:\/\/)?(?:www\.)?youku\.com\/v_show\/id_([a-zA-Z0-9=]+)/,
    // Common URL format
    /(?:https?:\/\/)?(?:v\.youku\.com\/v_show\/id_)?([a-zA-Z0-9=]+)\.html/
    // Another common URL format
  ];
  let videoId = getVideoId(url, youTubePatterns);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  videoId = getVideoId(url, vimeoPatterns);
  if (videoId) {
    return `https://player.vimeo.com/video/${videoId}?transparent=0`;
  }
  videoId = getVideoId(url, dailyMotionPatterns);
  if (videoId) {
    return `https://www.dailymotion.com/embed/video/${videoId}`;
  }
  videoId = getVideoId(url, youkuPatterns);
  if (videoId) {
    return `https://player.youku.com/embed/${videoId}`;
  }
  return "";
}
function getVideoId(url, patterns) {
  if (!url || typeof url !== "string") {
    return null;
  }
  let videoId = null;
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      videoId = match[1];
      break;
    }
  }
  return videoId;
}
function getErrorMessage(err) {
  let displayErrorMessage = "An unexpected error occurred. Please try again.";
  if (err.response && err.response.data) {
    const apiResponseData = err.response.data;
    if (apiResponseData.message) {
      displayErrorMessage = apiResponseData.message;
    }
    if (apiResponseData.errors) {
      let concatenatedErrors = "";
      for (const key in apiResponseData.errors) {
        concatenatedErrors += apiResponseData.errors[key][0] + " ";
      }
      displayErrorMessage += " | " + concatenatedErrors.trim();
    } else if (err.response.data.error) {
      displayErrorMessage = err.response.data.error;
    }
  }
  return displayErrorMessage;
}
function isUrl(string) {
  try {
    const fullUrl = string.includes("://") ? string : `http://${string}`;
    new URL(fullUrl);
    return true;
  } catch (err) {
    return false;
  }
}
function isAlphaDash(str) {
  return /^[a-zA-Z0-9_-]+$/.test(str);
}
function isValidPassword(passwordString) {
  if (typeof passwordString !== "string") {
    return false;
  }
  const minLength = 8;
  if (passwordString.length < minLength) {
    return false;
  }
  const hasLowercase = /[a-z]/.test(passwordString);
  const hasUppercase = /[A-Z]/.test(passwordString);
  const hasDigit = /[0-9]/.test(passwordString);
  const meetsCharacterDiversity = hasLowercase && hasUppercase && hasDigit;
  return meetsCharacterDiversity;
}
function isValidEmail(emailString) {
  if (typeof emailString !== "string") {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(emailString);
}
function getDateString(date = /* @__PURE__ */ new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function openPopup(url, windowName, left, top, width, height) {
  const features = `width=${width},height=${height},left=${left},top=${top},
                      resizable=yes,scrollbars=yes,status=no,menubar=no,toolbar=no,location=no`;
  return window.open(url, windowName, features);
}
const MemberType = {
  Admin: "admin",
  Webmaster: "web_master"
};
const ScreenSize = {
  Nothing: 0,
  Narrow: 1,
  Small: 2,
  Mid: 3,
  Wide: 4
};
const Category = {
  News: "news",
  Archive: "archive"
};
const FetchOrder = {
  Ascending: "ascending",
  Descending: "descending",
  Random: "random"
};
const NotificationType = {
  Comment: "comment",
  Reply: "reply",
  Follower: "follower",
  Unhidden: "unhidden"
};
function getNextFetchIndex(fetchedPosts, fetchOrder) {
  const post = fetchedPosts[fetchedPosts.length - 1];
  const id = post.pivot_id ?? post.id;
  if (fetchOrder === FetchOrder.Ascending) {
    return id + 1;
  }
  if (fetchOrder === FetchOrder.Descending) {
    return id - 1;
  }
}
function getScreenSize() {
  const NARROW_SCREEN_BREAKPOINT = 1;
  const SMALL_SCREEN_BREAKPOINT = 600;
  const MID_SCREEN_BREAKPOINT = 950;
  const WIDE_SCREEN_BREAKPOINT = 1200;
  let screenSize;
  if (window.innerWidth >= WIDE_SCREEN_BREAKPOINT) {
    screenSize = ScreenSize.Wide;
  } else if (window.innerWidth >= MID_SCREEN_BREAKPOINT) {
    screenSize = ScreenSize.Mid;
  } else if (window.innerWidth >= SMALL_SCREEN_BREAKPOINT) {
    screenSize = ScreenSize.Small;
  } else if (window.innerWidth >= NARROW_SCREEN_BREAKPOINT) {
    screenSize = ScreenSize.Narrow;
  } else {
    screenSize = ScreenSize.Nothing;
  }
  return screenSize;
}
function monitorScreenSize(setScreenSize, delay = 500) {
  const intervalId = setInterval(() => {
    const currentSize = getScreenSize();
    setScreenSize((prev) => prev !== currentSize ? currentSize : prev);
  }, delay);
  return () => clearInterval(intervalId);
}
function checkIfFetchNeeded(prevScreenSizeRef, screenSize, fetchedScreenSize) {
  const prevScreenSize = prevScreenSizeRef.current;
  let shouldFetch = screenSize > prevScreenSize && screenSize > fetchedScreenSize.current;
  prevScreenSizeRef.current = screenSize;
  return shouldFetch;
}
function getPostUrl(post) {
  var _a;
  if (!post) return "";
  if (post.is_news && post.created_at) {
    const date = new Date(post.created_at);
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(date.getUTCDate()).padStart(2, "0");
    return `/news/${yyyy}${mm}${dd}/${post.post_url}`;
  }
  return `/${(_a = post.user) == null ? void 0 : _a.username}/${post.post_url}`;
}
function About({ about, status }) {
  var _a;
  const { props } = usePage();
  const flash = (props == null ? void 0 : props.flash) || {};
  const user = (_a = props == null ? void 0 : props.auth) == null ? void 0 : _a.user;
  const isWebmaster = user ? user.member_type == MemberType.Webmaster : false;
  const appUrl = props.app_url;
  const initialHydratedStatement = status === "about_fetched" && (about == null ? void 0 : about.statement) ? hydrateEditorImagePaths(about.statement, appUrl) : null;
  const [isInEditMode, setIsInEditMode] = useState(false);
  const [hasStatementChanged, setHasStatementChanged] = useState(false);
  const [statement, setStatement] = useState(initialHydratedStatement);
  const [initialStatement, setInitialStatement] = useState(initialHydratedStatement);
  const [dataLoaded, setDataLoaded] = useState(true);
  const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
    statement: initialHydratedStatement || ""
  });
  const handleStatementChange = useCallback((newStatement) => {
    setStatement(newStatement);
    setHasStatementChanged(initialStatement !== newStatement);
  }, [initialStatement]);
  const handleStatementUpdate = useCallback(async (e) => {
    e.preventDefault();
    const dehydratedStatement = dehydrateEditorImagePaths(statement, appUrl);
    const statementWithResizedImages = await processEditorImages(dehydratedStatement);
    setData("statement", statementWithResizedImages);
    post("/update-about", {
      preserveState: false,
      preserveScroll: true,
      onSuccess: (page) => {
        var _a2;
        const newAbout = ((_a2 = page.props) == null ? void 0 : _a2.about) ?? null;
        if (newAbout && newAbout.statement) {
          const hydratedStatement = hydrateEditorImagePaths(newAbout.statement, appUrl);
          setInitialStatement(hydratedStatement);
          setStatement(hydratedStatement);
        }
        setHasStatementChanged(false);
        setIsInEditMode(false);
        setDataLoaded(true);
      },
      onError: (err) => {
        const displayErrorMessage = getErrorMessage(err);
        setError("general", displayErrorMessage.trim());
      }
    });
  }, [statement, post, setData, setError]);
  useEffect(() => {
    const hydrated = status === "about_fetched" && (about == null ? void 0 : about.statement) ? hydrateEditorImagePaths(about.statement, appUrl) : null;
    setStatement(hydrated);
    setInitialStatement(hydrated);
    setData("statement", hydrated || "");
    setHasStatementChanged(false);
  }, [about, status]);
  useEffect(() => {
    if (!isInEditMode && statement) {
      if (window.twttr && window.twttr.widgets) {
        window.twttr.widgets.load();
      }
      if (window.instgrm && window.instgrm.Embeds) {
        window.instgrm.Embeds.process();
      }
    }
  }, [statement, isInEditMode]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      PageHead,
      {
        title: "about",
        ogType: "article"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "rte-container borderless limited-width", children: dataLoaded ? /* @__PURE__ */ jsxs("article", { children: [
      /* @__PURE__ */ jsxs("div", { className: "centered-header-box", children: [
        isInEditMode && hasStatementChanged && /* @__PURE__ */ jsx("div", { className: "left-item", children: /* @__PURE__ */ jsx(
          "button",
          {
            className: "save-button",
            type: "submit",
            disabled: processing,
            onClick: handleStatementUpdate,
            children: "save"
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "centered-content", children: /* @__PURE__ */ jsx("h1", { children: "about" }) }),
        /* @__PURE__ */ jsx("div", { className: "right-item padded", children: !isInEditMode && isWebmaster && /* @__PURE__ */ jsx(
          EditButton,
          {
            onClick: (e) => {
              e.preventDefault();
              setIsInEditMode(true);
            }
          }
        ) })
      ] }),
      errors.general && /* @__PURE__ */ jsx("div", { className: "error", children: errors.general }),
      flash.success && /* @__PURE__ */ jsx("div", { className: "notice", children: flash.success }),
      isInEditMode ? /* @__PURE__ */ jsx(
        RichTextEditor,
        {
          disabled: !isInEditMode || processing,
          onChange: handleStatementChange,
          value: statement,
          autoFocus: true
        }
      ) : /* @__PURE__ */ jsx(
        "div",
        {
          dangerouslySetInnerHTML: { __html: sanitizeRichHtml(statement) },
          className: "article-text"
        }
      )
    ] }) : /* @__PURE__ */ jsx("p", { className: "centered-content", children: "loading..." }) })
  ] });
}
About.layout = (page) => /* @__PURE__ */ jsx(Layout, { children: page });
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: About
}, Symbol.toStringTag, { value: "Module" }));
function FormField({
  classes = "",
  id,
  label,
  placeholder,
  value = "",
  onChange,
  onBlur,
  disabled,
  min,
  max,
  type = "text",
  onValidate,
  isTextArea = false,
  error = "",
  onErrorUpdate = () => {
  }
}) {
  let fieldClasses = "form-field ";
  fieldClasses = isTextArea ? fieldClasses + "text-area " : fieldClasses;
  fieldClasses += classes;
  let labelClasses = isTextArea ? "main-label centered-content no-margin" : "main-label";
  const handleInternalChange = (e) => {
    const inputValue = e.target.value.trimEnd();
    onChange(e);
    if (onValidate) {
      onValidate(inputValue, (msg) => onErrorUpdate(id, msg));
    } else {
      onErrorUpdate(id, "");
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: fieldClasses, children: [
    /* @__PURE__ */ jsxs("div", { className: "label-input-container", children: [
      label && /* @__PURE__ */ jsx(
        "label",
        {
          htmlFor: id,
          className: labelClasses,
          children: label
        }
      ),
      isTextArea ? /* @__PURE__ */ jsx(
        "textarea",
        {
          name: id,
          id,
          value,
          min,
          max,
          onChange: handleInternalChange,
          onBlur,
          disabled,
          placeholder
        }
      ) : /* @__PURE__ */ jsx(
        "input",
        {
          type,
          placeholder,
          name: id,
          value,
          min,
          max,
          id,
          onChange: handleInternalChange,
          onBlur,
          disabled
        }
      )
    ] }),
    error && /* @__PURE__ */ jsx("div", { className: "error small", children: error })
  ] });
}
function Contact() {
  const { props } = usePage();
  const flash = (props == null ? void 0 : props.flash) || {};
  const form = useForm({
    name: "",
    email: "",
    website: "",
    subject: "",
    content: ""
  });
  const [isEmailFieldValid, setIsEmailFieldValid] = useState(false);
  const [isNameFieldValid, setIsNameFieldValid] = useState(false);
  const [isSubjectFieldValid, setIsSubjectFieldValid] = useState(false);
  const [isContentFieldValid, setIsContentFieldValid] = useState(false);
  const canSubmit = form.data.email && isEmailFieldValid && form.data.name && isNameFieldValid && form.data.subject && isSubjectFieldValid && form.data.content && isContentFieldValid;
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    form.post("/contact");
  }, [form]);
  const handleEmailFormatValidation = (proposedEmail, setFieldLocalError) => {
    const isValid = isValidEmail(proposedEmail);
    if (!isValid) {
      setFieldLocalError("enter a valid email address");
    } else {
      setFieldLocalError("");
    }
    setIsEmailFieldValid(isValid);
    return isValid;
  };
  const createValidationHandler = (setValidState) => (proposedText, setFieldLocalError) => {
    const isValid = proposedText.length > 0;
    if (!isValid) {
      setFieldLocalError("field required");
    } else {
      setFieldLocalError("");
    }
    setValidState(isValid);
    return isValid;
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHead, { title: "contact" }),
    /* @__PURE__ */ jsxs("div", { className: "form-container", children: [
      /* @__PURE__ */ jsx("div", { className: "centered-content no-margin", children: /* @__PURE__ */ jsx("h1", { children: "contact" }) }),
      (flash == null ? void 0 : flash.error) && /* @__PURE__ */ jsx("div", { className: "error", children: flash.error }),
      (flash == null ? void 0 : flash.success) && /* @__PURE__ */ jsx("div", { className: "notice", children: flash.success }),
      flash.success ? null : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("p", { className: "centered-content no-margin", children: "Questions about the site? Send us a message." }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
          /* @__PURE__ */ jsxs("div", { className: "field-groups-container", children: [
            /* @__PURE__ */ jsxs("div", { className: "field-group", children: [
              /* @__PURE__ */ jsx(
                FormField,
                {
                  id: "name",
                  label: "name",
                  placeholder: "your name",
                  value: form.data.name,
                  onChange: (e) => form.setData("name", e.target.value),
                  onValidate: createValidationHandler(setIsNameFieldValid),
                  disabled: form.processing,
                  error: form.errors.name,
                  onErrorUpdate: (id, msg) => msg ? form.setError(id, msg) : form.clearErrors(id),
                  min: 2,
                  max: 25,
                  type: "text"
                }
              ),
              /* @__PURE__ */ jsx(
                FormField,
                {
                  id: "email",
                  label: "email",
                  placeholder: "your e-mail address",
                  value: form.data.email,
                  onChange: (e) => form.setData("email", e.target.value),
                  onValidate: handleEmailFormatValidation,
                  disabled: form.processing,
                  error: form.errors.email,
                  onErrorUpdate: (id, msg) => msg ? form.setError(id, msg) : form.clearErrors(id),
                  min: 2,
                  max: 50,
                  type: "email"
                }
              ),
              /* @__PURE__ */ jsx(
                FormField,
                {
                  id: "website",
                  label: "website",
                  placeholder: "your website",
                  value: form.data.website,
                  onChange: (e) => form.setData("website", e.target.value),
                  disabled: form.processing,
                  error: form.errors.website,
                  onErrorUpdate: (id, msg) => msg ? form.setError(id, msg) : form.clearErrors(id),
                  min: 5,
                  max: 100,
                  type: "text",
                  classes: "bonus"
                }
              ),
              /* @__PURE__ */ jsx(
                FormField,
                {
                  id: "subject",
                  label: "subject",
                  placeholder: "subject of inquiry",
                  value: form.data.subject,
                  onChange: (e) => form.setData("subject", e.target.value),
                  onValidate: createValidationHandler(setIsSubjectFieldValid),
                  disabled: form.processing,
                  error: form.errors.subject,
                  onErrorUpdate: (id, msg) => msg ? form.setError(id, msg) : form.clearErrors(id),
                  min: 2,
                  max: 50,
                  type: "text"
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              FormField,
              {
                id: "content",
                label: "message",
                placeholder: "your message",
                value: form.data.content,
                onChange: (e) => form.setData("content", e.target.value),
                onValidate: createValidationHandler(setIsContentFieldValid),
                disabled: form.processing,
                error: form.errors.content,
                onErrorUpdate: (id, msg) => msg ? form.setError(id, msg) : form.clearErrors(id),
                min: 10,
                max: 1e3,
                isTextArea: true
              }
            )
          ] }),
          /* @__PURE__ */ jsx("button", { type: "submit", disabled: form.processing || !canSubmit, children: "submit" })
        ] })
      ] })
    ] })
  ] });
}
Contact.layout = (page) => /* @__PURE__ */ jsx(Layout, { isDashboard: false, children: page });
const __vite_glob_0_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Contact
}, Symbol.toStringTag, { value: "Module" }));
function CreatePostForm() {
  const [title, setTitle] = useState("");
  function handleSubmit(e) {
    e.preventDefault();
    const data = JSON.stringify({ title });
    fetch("http://localhost/website/netart/public/api/posts", {
      method: "POST",
      // Or 'POST', 'PUT', 'DELETE', etc., depending on your controller action
      //mode: 'cors',
      headers: {
        "Content-Type": "application/json"
        // If you're sending JSON data
        // You might need other headers like 'Authorization' for authentication
      },
      body: data
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }).then((data2) => {
    }).catch((error) => {
      console.error("There was an error fetching data:", error);
    });
  }
  function handleChange(e) {
    setTitle(e.target.value);
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("h1", { children: "make a new post" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsx("input", { placeholder: "title", value: title, onChange: handleChange }),
      /* @__PURE__ */ jsx("button", { type: "submit", children: "post" })
    ] }),
    /* @__PURE__ */ jsx("iframe", { src: "https://justfuckingusehtml.com", title: "'faces' by stephan e perez" })
  ] });
}
const __vite_glob_0_2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: CreatePostForm
}, Symbol.toStringTag, { value: "Module" }));
function DashboardTab({ iconClasses, tabName, currentTab, targetPath, noticeLight = null }) {
  let tabClasses = "dashboard-tab link-button";
  if (tabName === "activity" || tabName === "mail") {
    tabClasses += ` ${tabName}`;
  }
  const isSelected = tabName === currentTab;
  if (isSelected) {
    tabClasses += " selected";
  }
  return /* @__PURE__ */ jsxs(
    Link,
    {
      className: tabClasses,
      href: targetPath,
      children: [
        /* @__PURE__ */ jsx("i", { className: iconClasses, children: (tabName === "activity" || tabName === "mail") && /* @__PURE__ */ jsx("div", { className: "notice-light" }) }),
        /* @__PURE__ */ jsx("p", { children: tabName })
      ]
    }
  );
}
function DashboardLayout({ currentTab, headerText, children, headerHasMargin = true }) {
  var _a, _b, _c, _d;
  const page = usePage();
  const user = ((_b = (_a = page.props) == null ? void 0 : _a.auth) == null ? void 0 : _b.user) ?? null;
  const isAuthenticated = !!user;
  const currentUrl = page.url || (typeof window !== "undefined" ? window.location.pathname : "");
  const appUrl = page.props.app_url || "http://localhost";
  const parsedUrl = new URL(currentUrl, typeof window !== "undefined" ? window.location.origin : appUrl);
  const pathname = parsedUrl.pathname;
  const [success, setSuccess] = useState("");
  const { post, processing, errors, setError, clearErrors } = useForm();
  const unread = ((_c = page.props) == null ? void 0 : _c.unread) ?? {};
  const hasUnreadNotifications = !!unread.has_unread_notifications;
  const hasUnreadMail = !!unread.has_unread_mail;
  const headerClasses = headerHasMargin ? "centered-content bottom-1rem" : "centered-content no-margin";
  useEffect(() => {
    const handlePopState = () => {
      setTimeout(() => {
        router.reload({ preserveScroll: true, preserveState: true });
      }, 0);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  let containerClasses = "dashboard-container";
  if (hasUnreadNotifications) {
    containerClasses += " has-new-notifications";
  }
  if (hasUnreadMail) {
    containerClasses += " has-new-mail";
  }
  useEffect(() => {
    if (isAuthenticated && !user.profile_completed) {
      router.visit(
        "/register",
        {
          replace: true
        }
      );
      return;
    }
  }, [isAuthenticated, user]);
  useEffect(() => {
    const msg = sessionStorage.getItem("completion_message");
    if (msg) {
      setSuccess(msg);
      sessionStorage.removeItem("completion_message");
      router.visit(pathname, { replace: true });
    }
  }, [page.url, pathname]);
  useEffect(() => {
    var _a2;
    const flash = ((_a2 = page.props) == null ? void 0 : _a2.flash) || {};
    const params = new URLSearchParams(window.location.search);
    const status = flash.status || params.get("status");
    if (params.has("status")) {
      params.delete("status");
      const newUrl = window.location.pathname + (params.toString() ? "?" + params.toString() : "");
      window.history.replaceState({}, document.title, newUrl);
    }
    let message = flash.message || flash.success || "";
    let localError = flash.error || "";
    async function logoutOnCancel() {
      await router.post("/logout");
      setSuccess("Your registration has been successfully cancelled.");
    }
    if (status) {
      if (status === "verify_verified") {
        message = "Your email has been successfully verified!";
      } else if (status === "verify_already_verified") {
        message = "Your email is already verified.";
      } else if (status === "verify_already_canceled") {
        message = "This registration has already been canceled or the link is invalid";
      } else if (status === "invalid_link") {
        localError = "Invalid link.";
        localError = isAuthenticated && !(user == null ? void 0 : user.is_email_verified) ? localError + " Please click above to resend verification e-mail." : localError;
      } else if (status === "cancel_canceled") {
        logoutOnCancel();
        return;
      } else if (status === "cancel_already_verified") {
        message = "Your email address is already verified. No action was taken.";
      } else if (status === "cancel_user_not_found") {
        localError = "User not found.";
      } else if (status === "cancel_error") {
        localError = "There was an error processing your request.";
        localError = isAuthenticated && !(user == null ? void 0 : user.is_email_verified) ? localError + " Please click above to resend verification e-mail." : localError;
      } else if (status === "send_link_sent") {
        message = "Verification e-mail sent!";
      } else if (status === "send_link_already_verified") {
        message = "Your email is already verified.";
      }
    }
    if (message) {
      setSuccess(message);
    } else {
      setSuccess("");
    }
    if (localError) {
      setError("general", localError);
    } else {
      clearErrors("general");
    }
  }, [page.url, isAuthenticated, user, (_d = page.props) == null ? void 0 : _d.flash]);
  const handleResendVerificationEmail = (e) => {
    e.preventDefault();
    clearErrors("general");
    setSuccess("");
    post("/resend-verification", {
      preserveScroll: true,
      preserveState: true,
      onError: () => setError("general", "Unable to send verification e-mail."),
      onSuccess: () => setSuccess("verification e-mail sent!")
    });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHead, { title: "Dashboard Layout" }),
    isAuthenticated ? /* @__PURE__ */ jsxs("div", { className: containerClasses, children: [
      user && !(user == null ? void 0 : user.is_email_verified) && /* @__PURE__ */ jsxs("div", { className: "main-info-box notice-container", children: [
        /* @__PURE__ */ jsx("p", { className: "notice", children: "Please check your e-mail to verify your address." }),
        /* @__PURE__ */ jsx("button", { onClick: handleResendVerificationEmail, disabled: processing, children: "resend" })
      ] }),
      errors.general && /* @__PURE__ */ jsx("div", { className: "error", children: errors.general }),
      success && /* @__PURE__ */ jsx("div", { className: "notice", children: success }),
      /* @__PURE__ */ jsxs("div", { className: "dashboard-nav-content-container", children: [
        /* @__PURE__ */ jsxs("div", { className: "dashboard-tabs-container", children: [
          /* @__PURE__ */ jsx(
            DashboardTab,
            {
              tabName: "profile",
              iconClasses: "fa-regular fa-user",
              targetPath: "/dashboard/profile",
              currentTab
            }
          ),
          user.member_type == MemberType.Webmaster && /* @__PURE__ */ jsx(
            DashboardTab,
            {
              tabName: "news",
              iconClasses: "fa-regular fa-newspaper",
              targetPath: "/dashboard/news-posts",
              currentTab
            }
          ),
          /* @__PURE__ */ jsx(
            DashboardTab,
            {
              tabName: "posts",
              iconClasses: "fa-solid fa-images",
              targetPath: "/dashboard/posts",
              currentTab
            }
          ),
          /* @__PURE__ */ jsx(
            DashboardTab,
            {
              tabName: "activity",
              iconClasses: "fa-regular fa-star",
              targetPath: "/dashboard/activity",
              currentTab
            }
          ),
          /* @__PURE__ */ jsx(
            DashboardTab,
            {
              tabName: "mail",
              iconClasses: "fa-regular fa-envelope ",
              targetPath: "/dashboard/mail",
              currentTab
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("main", { className: "heading-profile-container", children: [
          headerText && /* @__PURE__ */ jsx("div", { className: headerClasses, children: /* @__PURE__ */ jsx("h1", { children: headerText }) }),
          children
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      errors.general && /* @__PURE__ */ jsx("div", { className: "error", children: errors.general }),
      success && /* @__PURE__ */ jsx("div", { className: "notice", children: success }),
      /* @__PURE__ */ jsxs("div", { className: "centered-content", children: [
        /* @__PURE__ */ jsx("h1", { children: "Welcome to netart.io." }),
        /* @__PURE__ */ jsxs("p", { children: [
          "Click ",
          /* @__PURE__ */ jsx(Link, { href: "/login", children: "here" }),
          " to log in, or ",
          /* @__PURE__ */ jsx(Link, { href: "/register", children: "here" }),
          " to register."
        ] })
      ] })
    ] })
  ] });
}
DashboardLayout.layout = (page) => /* @__PURE__ */ jsx(Layout, { isDashboard: true, children: page });
const __vite_glob_0_22 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: DashboardLayout
}, Symbol.toStringTag, { value: "Module" }));
function calculateInitialTransform(zoomContainer, outerContainer, imgWidth, imgHeight) {
  if (!zoomContainer) return { scale: 1, posX: 0, posY: 0 };
  const conW = outerContainer ? outerContainer.offsetWidth : window.innerWidth;
  const conH = outerContainer ? outerContainer.offsetHeight : window.innerHeight;
  const scaleX = conW / imgWidth;
  const scaleY = conH / imgHeight;
  const scale = Math.min(scaleX, scaleY);
  const posX = (conW - imgWidth * scale) / 2;
  const posY = (conH - imgHeight * scale) / 2;
  return { scale, posX, posY };
}
function ImageZoom({ src, smallSrc, alt, isZoomed, clickFunc, outerContainerRef = null, isImageCropper = false, nextSrc, nextSmallSrc, prevSrc, prevSmallSrc, onNavigateNext, onNavigatePrev }) {
  const zoomContainerRef = useRef(null);
  const zoomedImageRef = useRef(null);
  const slideContainerRef = useRef(null);
  const nextImgRef = useRef(null);
  const prevImgRef = useRef(null);
  const tempOverlayRef = useRef(null);
  const [loadedSrc, setLoadedSrc] = useState(null);
  const currentSrcRef = useRef(src);
  const [transform, setTransformState] = useState({ scale: 1, posX: 0, posY: 0 });
  const transformRef = useRef({ scale: 1, posX: 0, posY: 0 });
  const setTransform = useCallback((newTransform) => {
    if (typeof newTransform === "function") {
      setTransformState((prev) => {
        const updated = newTransform(prev);
        transformRef.current = updated;
        return updated;
      });
    } else {
      transformRef.current = newTransform;
      setTransformState(newTransform);
    }
  }, []);
  const [naturalSize, setNaturalSize] = useState(null);
  const [initialTransform, setInitialTransform] = useState(null);
  const isPanningRef = useRef(false);
  const lastPanPositionRef = useRef(null);
  const lastPinchDistanceRef = useRef(null);
  const hasDraggedRef = useRef(false);
  const dragDistanceRef = useRef(0);
  const lastMoveTimeRef = useRef(0);
  const lastMovePosRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef(null);
  const virtualPosXRef = useRef(0);
  const transitionDragXRef = useRef(0);
  const updateTransitionVisuals = useCallback((dragX) => {
    const width = zoomContainerRef.current ? zoomContainerRef.current.offsetWidth : window.innerWidth;
    if (nextImgRef.current) {
      if (dragX < 0) {
        nextImgRef.current.style.transform = `translateX(${width + dragX}px)`;
        nextImgRef.current.style.opacity = 1;
        nextImgRef.current.style.display = "block";
      } else {
        nextImgRef.current.style.display = "none";
      }
    }
    if (prevImgRef.current) {
      if (dragX > 0) {
        prevImgRef.current.style.transform = `translateX(${-width + dragX}px)`;
        prevImgRef.current.style.opacity = 1;
        prevImgRef.current.style.display = "block";
      } else {
        prevImgRef.current.style.display = "none";
      }
    }
    if (slideContainerRef.current) {
      slideContainerRef.current.style.transform = `translateX(${dragX}px)`;
    }
  }, []);
  const containerClasses = isImageCropper ? "zoomed-image" : `zoomed-image ${!isZoomed ? "hidden" : ""}`;
  const MIN_SCALE_FACTOR = 1;
  const MAX_SCALE_FACTOR = 5;
  const WHEEL_ZOOM_SENSITIVITY = 4e-3;
  const TOUCH_ZOOM_SENSITIVITY = 0.01;
  const PAN_SENSITIVITY = 1;
  const clampPosition = useCallback((newPosX, newPosY, currentScale) => {
    if (!naturalSize || !initialTransform) return { x: newPosX, y: newPosY };
    const scaledWidth = naturalSize.width * currentScale;
    const scaledHeight = naturalSize.height * currentScale;
    const conW = outerContainerRef ? outerContainerRef.current.offsetWidth : window.innerWidth;
    const conH = outerContainerRef ? outerContainerRef.current.offsetHeight : window.innerHeight;
    let minX = conW - scaledWidth;
    let maxX = 0;
    if (scaledWidth <= conW) {
      minX = (conW - scaledWidth) / 2;
      maxX = (conW - scaledWidth) / 2;
    }
    let minY = conH - scaledHeight;
    let maxY = 0;
    if (scaledHeight <= conH) {
      minY = (conH - scaledHeight) / 2;
      maxY = (conH - scaledHeight) / 2;
    }
    return {
      x: Math.max(minX, Math.min(maxX, newPosX)),
      y: Math.max(minY, Math.min(maxY, newPosY))
    };
  }, [naturalSize, initialTransform]);
  const updateZoom = useCallback((scaleDelta, clientX, clientY) => {
    if (!naturalSize || !initialTransform || !zoomContainerRef.current) return;
    const newScale = transform.scale * scaleDelta;
    const clampedScale = Math.max(
      initialTransform.scale * MIN_SCALE_FACTOR,
      Math.min(initialTransform.scale * MAX_SCALE_FACTOR, newScale)
    );
    if (clampedScale === transform.scale) return;
    const rect = zoomContainerRef.current.getBoundingClientRect();
    const imageRect = zoomedImageRef.current.getBoundingClientRect();
    const mouseRelX = clientX - imageRect.left;
    const mouseRelY = clientY - imageRect.top;
    const newPosX = clientX - rect.left - mouseRelX / transform.scale * clampedScale;
    const newPosY = clientY - rect.top - mouseRelY / transform.scale * clampedScale;
    const clamped = clampPosition(newPosX, newPosY, clampedScale);
    setTransform({ scale: clampedScale, posX: clamped.x, posY: clamped.y });
  }, [transform, naturalSize, initialTransform, clampPosition]);
  useRef(null);
  const handleTouchStart = useCallback((event) => {
    hasDraggedRef.current = false;
    dragDistanceRef.current = 0;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (!zoomContainerRef.current) return;
    virtualPosXRef.current = transformRef.current.posX;
    transitionDragXRef.current = 0;
    updateTransitionVisuals(0);
    if (event.touches.length === 1) {
      isPanningRef.current = true;
      lastPanPositionRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      lastMoveTimeRef.current = performance.now();
      lastMovePosRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      velocityRef.current = { x: 0, y: 0 };
      zoomContainerRef.current.style.setProperty("touch-action", "none");
    } else if (event.touches.length === 2) {
      isPanningRef.current = false;
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      lastPinchDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
      zoomContainerRef.current.style.setProperty("touch-action", "none");
    }
  }, []);
  const handleTouchMove = useCallback((event) => {
    if (!zoomContainerRef.current) return;
    event.preventDefault();
    if (isPanningRef.current && event.touches.length === 1 && lastPanPositionRef.current) {
      const deltaX = event.touches[0].clientX - lastPanPositionRef.current.x;
      const deltaY = event.touches[0].clientY - lastPanPositionRef.current.y;
      lastPanPositionRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      dragDistanceRef.current += Math.abs(deltaX) + Math.abs(deltaY);
      if (dragDistanceRef.current > 10) {
        hasDraggedRef.current = true;
      }
      const now = performance.now();
      const dt = now - lastMoveTimeRef.current;
      if (dt > 0) {
        velocityRef.current = {
          x: (event.touches[0].clientX - lastMovePosRef.current.x) / dt,
          y: (event.touches[0].clientY - lastMovePosRef.current.y) / dt
        };
      }
      lastMovePosRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      lastMoveTimeRef.current = now;
      virtualPosXRef.current += deltaX;
      const newPosY = transformRef.current.posY + deltaY;
      const clamped = clampPosition(virtualPosXRef.current, newPosY, transformRef.current.scale);
      let overPan = virtualPosXRef.current - clamped.x;
      if (overPan < 0 && !nextSrc) overPan = 0;
      if (overPan > 0 && !prevSrc) overPan = 0;
      const maxWidth = zoomContainerRef.current ? zoomContainerRef.current.offsetWidth * 0.8 : window.innerWidth * 0.8;
      if (overPan < -maxWidth) overPan = -maxWidth;
      if (overPan > maxWidth) overPan = maxWidth;
      virtualPosXRef.current = clamped.x + overPan;
      transitionDragXRef.current = overPan;
      updateTransitionVisuals(overPan);
      setTransform((prev) => ({ ...prev, posX: clamped.x, posY: clamped.y }));
    } else if (event.touches.length === 2 && lastPinchDistanceRef.current) {
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      const scaleDelta = 1 + (currentDist - lastPinchDistanceRef.current) * TOUCH_ZOOM_SENSITIVITY;
      const midX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
      const midY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
      updateZoom(scaleDelta, midX, midY);
      lastPinchDistanceRef.current = currentDist;
    }
  }, [transform, clampPosition, updateZoom]);
  const startMomentum = useCallback(() => {
    const now = performance.now();
    if (now - lastMoveTimeRef.current > 100) {
      velocityRef.current = { x: 0, y: 0 };
    }
    let vx = velocityRef.current.x;
    let vy = velocityRef.current.y;
    const width = zoomContainerRef.current ? zoomContainerRef.current.offsetWidth : window.innerWidth;
    const dragX = transitionDragXRef.current;
    const isSwipingNext = dragX < 0 && (dragX < -width * 0.2 || vx < -0.5);
    const isSwipingPrev = dragX > 0 && (dragX > width * 0.2 || vx > 0.5);
    let lastFrameTime = performance.now();
    const momentumLoop = (time) => {
      const dt = time - lastFrameTime;
      lastFrameTime = time;
      if (isSwipingNext || isSwipingPrev) {
        const targetX = isSwipingNext ? -width : width;
        transitionDragXRef.current += (targetX - transitionDragXRef.current) * 0.15;
        updateTransitionVisuals(transitionDragXRef.current);
        if (Math.abs(targetX - transitionDragXRef.current) > 2) {
          animationFrameRef.current = requestAnimationFrame(momentumLoop);
        } else {
          animationFrameRef.current = null;
          if (isSwipingNext && onNavigateNext) onNavigateNext();
          if (isSwipingPrev && onNavigatePrev) onNavigatePrev();
        }
      } else if (transitionDragXRef.current !== 0) {
        transitionDragXRef.current += (0 - transitionDragXRef.current) * 0.2;
        updateTransitionVisuals(transitionDragXRef.current);
        if (Math.abs(transitionDragXRef.current) > 1) {
          animationFrameRef.current = requestAnimationFrame(momentumLoop);
        } else {
          transitionDragXRef.current = 0;
          updateTransitionVisuals(0);
          animationFrameRef.current = null;
        }
      } else if (!isPanningRef.current && (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05)) {
        setTransform((prev) => {
          const newPosX = prev.posX + vx * dt;
          const newPosY = prev.posY + vy * dt;
          const clamped = clampPosition(newPosX, newPosY, prev.scale);
          if (newPosX !== clamped.x) vx = 0;
          if (newPosY !== clamped.y) vy = 0;
          return { ...prev, posX: clamped.x, posY: clamped.y };
        });
        vx *= 0.92;
        vy *= 0.92;
        if (Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05) {
          animationFrameRef.current = requestAnimationFrame(momentumLoop);
        } else {
          animationFrameRef.current = null;
        }
      } else {
        animationFrameRef.current = null;
      }
    };
    animationFrameRef.current = requestAnimationFrame(momentumLoop);
  }, [clampPosition, onNavigateNext, onNavigatePrev, updateTransitionVisuals]);
  const handleTouchEnd = useCallback(() => {
    isPanningRef.current = false;
    lastPinchDistanceRef.current = null;
    if (zoomContainerRef.current) zoomContainerRef.current.style.removeProperty("touch-action");
    startMomentum();
  }, [startMomentum]);
  const handleMouseDown = useCallback((event) => {
    if (event.button !== 0) return;
    hasDraggedRef.current = false;
    dragDistanceRef.current = 0;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    isPanningRef.current = true;
    lastPanPositionRef.current = { x: event.clientX, y: event.clientY };
    virtualPosXRef.current = transformRef.current.posX;
    transitionDragXRef.current = 0;
    updateTransitionVisuals(0);
    lastMoveTimeRef.current = performance.now();
    lastMovePosRef.current = { x: event.clientX, y: event.clientY };
    velocityRef.current = { x: 0, y: 0 };
    zoomContainerRef.current.classList.toggle("dragging", true);
  }, []);
  const handleMouseMove = useCallback((event) => {
    if (!isPanningRef.current || !lastPanPositionRef.current) return;
    const deltaX = event.clientX - lastPanPositionRef.current.x;
    const deltaY = event.clientY - lastPanPositionRef.current.y;
    lastPanPositionRef.current = { x: event.clientX, y: event.clientY };
    dragDistanceRef.current += Math.abs(deltaX) + Math.abs(deltaY);
    if (dragDistanceRef.current > 10) {
      hasDraggedRef.current = true;
    }
    const now = performance.now();
    const dt = now - lastMoveTimeRef.current;
    if (dt > 0) {
      velocityRef.current = {
        x: (event.clientX - lastMovePosRef.current.x) / dt,
        y: (event.clientY - lastMovePosRef.current.y) / dt
      };
    }
    lastMovePosRef.current = { x: event.clientX, y: event.clientY };
    lastMoveTimeRef.current = now;
    virtualPosXRef.current += deltaX;
    const newPosY = transformRef.current.posY + deltaY;
    const clamped = clampPosition(virtualPosXRef.current, newPosY, transformRef.current.scale);
    let overPan = virtualPosXRef.current - clamped.x;
    if (overPan < 0 && !nextSrc) overPan = 0;
    if (overPan > 0 && !prevSrc) overPan = 0;
    const maxWidth = zoomContainerRef.current ? zoomContainerRef.current.offsetWidth * 0.8 : window.innerWidth * 0.8;
    if (overPan < -maxWidth) overPan = -maxWidth;
    if (overPan > maxWidth) overPan = maxWidth;
    virtualPosXRef.current = clamped.x + overPan;
    transitionDragXRef.current = overPan;
    updateTransitionVisuals(overPan);
    setTransform((prev) => ({ ...prev, posX: clamped.x, posY: clamped.y }));
  }, [transform, clampPosition]);
  const handleMouseUpOrLeave = useCallback(() => {
    isPanningRef.current = false;
    if (zoomContainerRef.current) zoomContainerRef.current.classList.toggle("dragging", false);
    startMomentum();
  }, [startMomentum]);
  const handleWheel = useCallback((e) => {
    if (!isZoomed && !isImageCropper || !zoomContainerRef.current) return;
    e.preventDefault();
    if (e.ctrlKey) {
      const scaleDelta = 1 - e.deltaY * WHEEL_ZOOM_SENSITIVITY;
      updateZoom(scaleDelta, e.clientX, e.clientY);
    } else {
      setTransform((prev) => {
        const newPosX = prev.posX - e.deltaX * PAN_SENSITIVITY;
        const newPosY = prev.posY - e.deltaY * PAN_SENSITIVITY;
        const clamped = clampPosition(newPosX, newPosY, prev.scale);
        return { ...prev, posX: clamped.x, posY: clamped.y };
      });
    }
  }, [isZoomed, isImageCropper, updateZoom, clampPosition]);
  const handleClick = useCallback((e) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasDraggedRef.current = false;
      return;
    }
    if (clickFunc) clickFunc(e);
  }, [clickFunc]);
  useEffect(() => {
    if (isZoomed) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [isZoomed]);
  useEffect(() => {
    const zoomContRef = zoomContainerRef.current;
    if (isZoomed || isImageCropper) {
      zoomContRef.addEventListener("wheel", handleWheel, { passive: false });
      zoomContRef.addEventListener("touchstart", handleTouchStart, { passive: false });
      zoomContRef.addEventListener("touchmove", handleTouchMove, { passive: false });
      zoomContRef.addEventListener("touchend", handleTouchEnd);
      zoomContRef.addEventListener("touchcancel", handleTouchEnd);
      zoomContRef.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUpOrLeave);
      window.addEventListener("mouseleave", handleMouseUpOrLeave);
      return () => {
        zoomContRef.removeEventListener("wheel", handleWheel);
        zoomContRef.removeEventListener("touchstart", handleTouchStart);
        zoomContRef.removeEventListener("touchmove", handleTouchMove);
        zoomContRef.removeEventListener("touchend", handleTouchEnd);
        zoomContRef.removeEventListener("touchcancel", handleTouchEnd);
        zoomContRef.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUpOrLeave);
        window.removeEventListener("mouseleave", handleMouseUpOrLeave);
      };
    }
  }, [isZoomed, handleWheel, handleTouchEnd, handleTouchMove, handleTouchStart]);
  useEffect(() => {
    currentSrcRef.current = src;
    if (transitionDragXRef.current !== 0 && zoomContainerRef.current) {
      const overlay = document.createElement("img");
      overlay.src = smallSrc || src;
      overlay.className = "zoom-transition-img";
      overlay.style.display = "block";
      overlay.style.transform = "translateX(0px)";
      overlay.style.opacity = "1";
      overlay.style.zIndex = "10";
      overlay.draggable = false;
      zoomContainerRef.current.appendChild(overlay);
      if (tempOverlayRef.current) tempOverlayRef.current.remove();
      tempOverlayRef.current = overlay;
    }
    if (zoomedImageRef.current) zoomedImageRef.current.style.opacity = 0;
    if (slideContainerRef.current) slideContainerRef.current.style.transform = `translateX(0px)`;
    transitionDragXRef.current = 0;
    updateTransitionVisuals(0);
    if (!src) {
      setLoadedSrc(null);
      if (tempOverlayRef.current) {
        tempOverlayRef.current.remove();
        tempOverlayRef.current = null;
      }
      return;
    }
    setLoadedSrc(null);
    const targetSrc = smallSrc || src;
    const img = new Image();
    img.onload = () => {
      if (currentSrcRef.current === src) {
        const natSize = { width: img.naturalWidth, height: img.naturalHeight };
        const initialT = calculateInitialTransform(zoomContainerRef == null ? void 0 : zoomContainerRef.current, outerContainerRef == null ? void 0 : outerContainerRef.current, natSize.width, natSize.height);
        setNaturalSize(natSize);
        setTransform(initialT);
        setInitialTransform(initialT);
        setLoadedSrc(targetSrc);
        if (smallSrc && src !== smallSrc) {
          const largeImg = new Image();
          largeImg.onload = () => {
            if (currentSrcRef.current === src) {
              const largeNatSize = { width: largeImg.naturalWidth, height: largeImg.naturalHeight };
              const largeInitialT = calculateInitialTransform(zoomContainerRef == null ? void 0 : zoomContainerRef.current, outerContainerRef == null ? void 0 : outerContainerRef.current, largeNatSize.width, largeNatSize.height);
              setNaturalSize((prevNatSize) => {
                setTransform((prevTransform) => {
                  if (!prevNatSize) return largeInitialT;
                  const scaleRatio = largeNatSize.width / prevNatSize.width;
                  return {
                    scale: prevTransform.scale / scaleRatio,
                    posX: prevTransform.posX,
                    posY: prevTransform.posY
                  };
                });
                return largeNatSize;
              });
              setInitialTransform(largeInitialT);
              setLoadedSrc(src);
            }
          };
          largeImg.src = src;
        }
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (tempOverlayRef.current) {
              tempOverlayRef.current.remove();
              tempOverlayRef.current = null;
            }
          });
        });
      }
    };
    img.onerror = () => {
      if (tempOverlayRef.current) {
        tempOverlayRef.current.remove();
        tempOverlayRef.current = null;
      }
    };
    img.src = targetSrc;
  }, [src, smallSrc, updateTransitionVisuals, outerContainerRef, setTransform]);
  useEffect(() => {
    if (!isZoomed || !zoomContainerRef.current) return;
    const focusableElements = zoomContainerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
    const handleKeyDown = (e) => {
      if (e.key === "Tab") {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      } else if (e.key === "Escape") {
        clickFunc(e);
      } else if (e.key === "ArrowRight" && onNavigateNext) {
        onNavigateNext();
      } else if (e.key === "ArrowLeft" && onNavigatePrev) {
        onNavigatePrev();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isZoomed, clickFunc, onNavigateNext, onNavigatePrev]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: containerClasses,
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Image gallery",
      draggable: "false",
      onClick: handleClick,
      ref: zoomContainerRef,
      children: [
        /* @__PURE__ */ jsx("div", { ref: slideContainerRef, className: "zoom-slide-container", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: loadedSrc,
            alt,
            draggable: "false",
            ref: zoomedImageRef,
            style: {
              transform: `translate(${transform.posX}px, ${transform.posY}px) scale(${transform.scale})`,
              transformOrigin: "top left",
              opacity: loadedSrc ? 1 : 0
            }
          }
        ) }),
        prevSrc && /* @__PURE__ */ jsx(
          "img",
          {
            src: prevSmallSrc || prevSrc,
            ref: prevImgRef,
            className: "zoom-transition-img",
            alt: "Previous",
            draggable: "false"
          }
        ),
        nextSrc && /* @__PURE__ */ jsx(
          "img",
          {
            src: nextSmallSrc || nextSrc,
            ref: nextImgRef,
            className: "zoom-transition-img",
            alt: "Next",
            draggable: "false"
          }
        ),
        /* @__PURE__ */ jsx("button", { className: "sr-only", onClick: (e) => {
          e.stopPropagation();
          clickFunc(e);
        }, children: "Close gallery" }),
        prevSrc && /* @__PURE__ */ jsx("button", { className: "sr-only", onClick: (e) => {
          e.stopPropagation();
          onNavigatePrev();
        }, children: "Previous image" }),
        nextSrc && /* @__PURE__ */ jsx("button", { className: "sr-only", onClick: (e) => {
          e.stopPropagation();
          onNavigateNext();
        }, children: "Next image" })
      ]
    }
  );
}
function parseTransformString(transformString) {
  const scaleMatch = transformString.match(/scale\(([^)]+)\)/);
  const translateMatch = transformString.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
  const scale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
  const posX = translateMatch ? parseFloat(translateMatch[1]) : 0;
  const posY = translateMatch ? parseFloat(translateMatch[2]) : 0;
  return { scale, posX, posY };
}
function getCroppedImage(cropperElement) {
  const img = cropperElement.querySelector("img");
  const transformString = img.style.transform;
  const imageTransform = parseTransformString(transformString);
  const imageNaturalSize = { width: img.naturalWidth, height: img.naturalHeight };
  const cropperWidth = cropperElement.clientWidth;
  const cropperHeight = cropperElement.clientHeight;
  const outputSize = 300;
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d");
  let sx = (0 - imageTransform.posX) / imageTransform.scale;
  if (sx < 0) sx = 0;
  let sy = (0 - imageTransform.posY) / imageTransform.scale;
  if (sy < 0) sy = 0;
  let sWidth = cropperWidth / imageTransform.scale;
  if (sx + sWidth > imageNaturalSize.width) {
    sWidth = imageNaturalSize.width - sx;
  }
  let sHeight = cropperHeight / imageTransform.scale;
  if (sy + sHeight > imageNaturalSize.height) {
    sHeight = imageNaturalSize.height - sy;
  }
  const dx = 0;
  const dy = 0;
  const dWidth = canvas.width;
  const dHeight = canvas.height;
  ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  const dataURL = canvas.toDataURL("image/webp");
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const base64Data = arr[1];
  const bstr = atob(base64Data);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  const blob = new Blob([u8arr], { type: mime });
  return blob;
}
function AvatarSetter({ user }) {
  const { props } = usePage();
  const [isImageCropperOpen, setIsImageCropperOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const fileInputRef = useRef(null);
  const imageCropContainerContainerRef = useRef(null);
  const imageCropContainerRef = useRef(null);
  const imageCropButtonRef = useRef(null);
  const avatarContainerRef = useRef(null);
  const avatar = (user == null ? void 0 : user.avatar) ? `${props.app_url}/storage/images/uploaded/users/${user.username}/avatar/small/${user == null ? void 0 : user.avatar}` : `${props.app_url}/storage/images/defaults/avatar.webp?v=2`;
  const { data, setData, post, processing, errors, setError, clearErrors } = useForm({ avatar: null });
  const closeCropperAndClearInput = useCallback(() => {
    setIsImageCropperOpen(false);
    setSelectedAvatar(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [setIsImageCropperOpen, setSelectedAvatar]);
  const handleCropAndUpload = useCallback(async () => {
    setIsImageCropperOpen(false);
    const resizedImage = getCroppedImage(imageCropContainerRef.current);
    clearErrors();
    setData("avatar", resizedImage);
    post("/update-avatar", {
      preserveScroll: true,
      onSuccess: () => {
        setSelectedAvatar(null);
      },
      onError: (err) => {
        const errMsg = getErrorMessage(err);
        setError("avatar", errMsg.trim());
      }
    });
  }, [setIsImageCropperOpen, post, setData, setError, clearErrors]);
  const handleFileSelect = useCallback(async (e) => {
    clearErrors();
    const file = getImageFileFromInput(e);
    if (!file) {
      setError("avatar", "Must be .jpeg, .png, .webp, or .bmp");
      return;
    }
    setIsImageCropperOpen(true);
    const selectedFileUrl = await getImageUrlFromFile(file);
    setSelectedAvatar(selectedFileUrl);
  }, [setIsImageCropperOpen, setSelectedAvatar, clearErrors, setError]);
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    avatarContainerRef.current.classList.toggle("dragged-over", true);
  }, [avatarContainerRef.current]);
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    avatarContainerRef.current.classList.toggle("dragged-over", false);
  }, [avatarContainerRef.current]);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    avatarContainerRef.current.classList.toggle("dragged-over", false);
    handleFileSelect(e);
  }, [avatarContainerRef.current]);
  useEffect(() => {
    if (!avatarContainerRef.current) {
      return;
    }
    const avRef = avatarContainerRef.current;
    avRef.addEventListener("dragover", handleDragOver);
    avRef.addEventListener("dragleave", handleDragLeave);
    avRef.addEventListener("drop", handleDrop);
    return () => {
      avRef.removeEventListener("dragover", handleDragOver);
      avRef.removeEventListener("dragleave", handleDragLeave);
      avRef.removeEventListener("drop", handleDrop);
    };
  }, [avatarContainerRef.current]);
  useEffect(() => {
    document.body.classList.toggle("no-scroll", isImageCropperOpen);
  }, [isImageCropperOpen]);
  const handleClickOut = useCallback((e) => {
    if (!imageCropContainerRef.current || !imageCropButtonRef.current) {
      return;
    }
    if (imageCropContainerRef.current.contains(e.target) || imageCropButtonRef.current.contains(e.target)) {
      return;
    }
    closeCropperAndClearInput();
  }, [closeCropperAndClearInput, imageCropContainerRef.current]);
  const handleEscOut = useCallback((e) => {
    if (!imageCropContainerRef.current || !imageCropButtonRef.current) {
      return;
    }
    if (e.key === "Escape") {
      closeCropperAndClearInput();
    }
  }, [closeCropperAndClearInput, imageCropContainerRef.current]);
  const handleTouchOut = useCallback((e) => {
    if (e.touches.length !== 1) {
      return;
    }
    if (imageCropContainerRef.current && imageCropContainerRef.current.contains(e.touches[0].target)) {
      return;
    }
    if (imageCropButtonRef.current && imageCropButtonRef.current.contains(e.touches[0].target)) {
      return;
    }
    closeCropperAndClearInput();
  }, [closeCropperAndClearInput, imageCropContainerRef.current, imageCropButtonRef.current]);
  useEffect(() => {
    const contContRef = imageCropContainerContainerRef.current;
    if (!contContRef) {
      return;
    }
    contContRef.addEventListener("mousedown", handleClickOut);
    contContRef.addEventListener("touchstart", handleTouchOut);
    window.addEventListener("keydown", handleEscOut);
    return () => {
      contContRef.removeEventListener("mousedown", handleClickOut);
      contContRef.removeEventListener("touchstart", handleTouchOut);
      window.removeEventListener("keydown", handleEscOut);
    };
  }, [handleClickOut, handleTouchOut, handleEscOut]);
  const handleUpdateClick = useCallback(() => {
    fileInputRef.current.click();
  }, [fileInputRef.current]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    isImageCropperOpen && /* @__PURE__ */ jsxs(
      "div",
      {
        className: "image-crop-container-container",
        ref: imageCropContainerContainerRef,
        children: [
          /* @__PURE__ */ jsx("h3", { children: "Zoom or drag to crop image." }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "image-crop-container",
              ref: imageCropContainerRef,
              children: [
                /* @__PURE__ */ jsx("div", { className: "image-crop-circle" }),
                /* @__PURE__ */ jsx(
                  ImageZoom,
                  {
                    src: selectedAvatar,
                    alt: "selected profile image",
                    isImageCropper: true,
                    outerContainerRef: imageCropContainerRef
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: handleCropAndUpload,
              disabled: !(user == null ? void 0 : user.is_email_verified) || processing,
              ref: imageCropButtonRef,
              children: "update"
            }
          )
        ]
      }
    ),
    errors.avatar && /* @__PURE__ */ jsx("div", { className: "error", children: errors.avatar }),
    /* @__PURE__ */ jsxs("div", { className: "profile-avatar-container", ref: avatarContainerRef, children: [
      /* @__PURE__ */ jsx(
        "label",
        {
          htmlFor: "profile_image",
          className: "hidden"
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "file",
          accept: ".jpg, .jpeg, .png, .webp, .bmp",
          name: "profile_image",
          id: "profile_image",
          style: { display: "none" },
          ref: fileInputRef,
          onChange: handleFileSelect,
          placeholder: null
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          className: "avatar-button",
          onClick: handleUpdateClick,
          disabled: !(user == null ? void 0 : user.is_email_verified) || processing,
          type: "button",
          children: [
            "update",
            /* @__PURE__ */ jsx("div", { className: "image-drag-panel" })
          ]
        }
      ),
      /* @__PURE__ */ jsx("img", { src: avatar, alt: `${user == null ? void 0 : user.username}'s avatar`, className: "round-image fuck" })
    ] })
  ] });
}
const __vite_glob_0_20 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: AvatarSetter
}, Symbol.toStringTag, { value: "Module" }));
function ProfileItem({
  name,
  value,
  onChange = null,
  disabled = false,
  isLink = false,
  isEditingThisField = false,
  onEditClick,
  isPublic = false,
  isArray = false,
  maxArrayLength = 3,
  onAddArrayItem = null
}) {
  const isUpdatable = onChange ? true : false;
  const inputRef = useRef(null);
  useEffect(() => {
    if (isEditingThisField && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingThisField]);
  const renderInput = (val, idx) => /* @__PURE__ */ jsx(
    "input",
    {
      id: idx === 0 ? name : `${name}_${idx}`,
      defaultValue: val,
      disabled: !isEditingThisField || disabled,
      onChange: (e) => onChange(e, idx),
      ref: idx === 0 ? inputRef : null
    }
  );
  const renderValue = (val) => isLink ? /* @__PURE__ */ jsx(
    "a",
    {
      href: val,
      target: "_blank",
      children: val
    }
  ) : /* @__PURE__ */ jsx("span", { children: val });
  if (isArray) {
    const values = Array.isArray(value) ? value : [];
    const displayValues = values.length === 0 && !isPublic ? [""] : values;
    const labelText = displayValues.length === 1 ? "website" : "websites";
    const nameToUse = name === "website" || name === "websites" ? labelText : name;
    return /* @__PURE__ */ jsxs("div", { className: "profile-item-array", children: [
      displayValues.map((val, idx) => /* @__PURE__ */ jsxs("div", { className: "inline-form-field", children: [
        idx === 0 ? /* @__PURE__ */ jsxs("label", { htmlFor: name, className: "field-name", children: [
          nameToUse,
          ":"
        ] }) : /* @__PURE__ */ jsxs("label", { className: "field-name invisible", htmlFor: `${name}_${idx}`, children: [
          nameToUse,
          ":"
        ] }),
        isUpdatable ? renderInput(val, idx) : renderValue(val),
        idx === 0 && !isPublic && /* @__PURE__ */ jsx(
          EditButton,
          {
            onClick: (e) => {
              e.preventDefault();
              onEditClick();
            },
            disabled: !isUpdatable || isEditingThisField || disabled,
            className: isUpdatable ? "" : "hidden"
          }
        )
      ] }, idx)),
      isEditingThisField && values.length < maxArrayLength && /* @__PURE__ */ jsxs("div", { className: "inline-form-field right-aligned", children: [
        /* @__PURE__ */ jsxs("label", { className: "field-name hidden", children: [
          nameToUse,
          ":"
        ] }),
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: (e) => {
              e.preventDefault();
              if (onAddArrayItem) onAddArrayItem();
            },
            className: "plus-button small link-button",
            children: "+"
          }
        ) })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "inline-form-field", children: [
    isUpdatable ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("label", { htmlFor: name, className: "field-name", children: [
        name,
        ":"
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          id: name,
          defaultValue: value,
          disabled: !isEditingThisField || disabled,
          onChange,
          ref: inputRef
        }
      )
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("label", { htmlFor: name, className: "field-name", children: [
        name,
        ":"
      ] }),
      isLink ? /* @__PURE__ */ jsx(
        "a",
        {
          href: value,
          target: "_blank",
          children: value
        }
      ) : /* @__PURE__ */ jsx("span", { children: value })
    ] }),
    !isPublic && /* @__PURE__ */ jsx(
      EditButton,
      {
        onClick: (e) => {
          e.preventDefault();
          onEditClick();
        },
        disabled: !isUpdatable || isEditingThisField || disabled,
        className: isUpdatable ? "" : "hidden"
      }
    )
  ] });
}
function CheckboxField({ name, label, value, onChange, disabled, classes = "" }) {
  const classNames = "inline-form-field checkbox " + classes;
  return /* @__PURE__ */ jsxs("div", { className: classNames, children: [
    /* @__PURE__ */ jsx(
      "label",
      {
        htmlFor: name,
        className: "main-label",
        children: label
      }
    ),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "checkbox",
        name,
        id: name,
        onChange,
        disabled,
        checked: !!value
      }
    )
  ] });
}
function EditProfile() {
  var _a, _b;
  const { props } = usePage();
  const user = (_a = props == null ? void 0 : props.auth) == null ? void 0 : _a.user;
  ((_b = props == null ? void 0 : props.flash) == null ? void 0 : _b.from) || "/";
  const flash = (props == null ? void 0 : props.flash) || {};
  const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
    websites: [],
    location: "",
    show_email_in_profile: false,
    accepts_emails: true
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [websitesField, setWebsitesField] = useState([]);
  const [locationField, setLocationField] = useState("");
  const [showEmailInProfile, setShowEmailInProfile] = useState(false);
  const [acceptsEmails, setAcceptsEmails] = useState(true);
  const [editingField, setEditingField] = useState(null);
  useEffect(() => {
    if (!user) return;
    let userWebsites = [];
    if (user.websites && Array.isArray(user.websites)) {
      userWebsites = user.websites;
    } else if (typeof user.website === "string") {
      userWebsites = [user.website];
    }
    setWebsitesField(userWebsites);
    setLocationField(user.location || "");
    setShowEmailInProfile(!!user.show_email_in_profile);
    setAcceptsEmails(!!user.accepts_emails);
    setData({
      websites: userWebsites,
      location: user.location || "",
      show_email_in_profile: !!user.show_email_in_profile,
      accepts_emails: !!user.accepts_emails
    });
  }, [user]);
  const handleEditClick = useCallback((fieldName) => {
    setEditingField(fieldName);
    clearErrors();
  }, [clearErrors]);
  const handleLogoutSubmit = (e) => {
    e.preventDefault();
    setIsLoggingOut(true);
    router.post(
      "/logout",
      {},
      {
        onFinish: () => setIsLoggingOut(false)
      }
    );
  };
  const handleProfileChangesSubmit = (e) => {
    e.preventDefault();
    clearErrors();
    if (!hasChanges) {
      setError("general", "No changes to submit.");
      return;
    }
    const currentData = {
      websites: websitesField,
      location: locationField,
      show_email_in_profile: showEmailInProfile,
      accepts_emails: acceptsEmails
    };
    router.post(
      "/update-profile",
      currentData,
      {
        preserveState: true,
        preserveScroll: true,
        onSuccess: () => {
          setHasChanges(false);
          setEditingField(null);
        },
        onError: (err) => {
          const displayErrorMessage = getErrorMessage(err);
          setError("general", displayErrorMessage.trim());
        }
      }
    );
  };
  console.log("user", user);
  return /* @__PURE__ */ jsxs("div", { className: "main-info-box transparent-background sticky", children: [
    /* @__PURE__ */ jsx(PageHead, { title: "Edit Profile" }),
    /* @__PURE__ */ jsxs("div", { className: "avatar-section", children: [
      errors.general && /* @__PURE__ */ jsx("div", { className: "error", children: errors.general }),
      flash.success_profile && /* @__PURE__ */ jsx("div", { className: "notice", children: flash.success_profile }),
      /* @__PURE__ */ jsx("h3", { className: "centered-content no-margin", children: "avatar:" }),
      /* @__PURE__ */ jsx(AvatarSetter, { user })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "info-section", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleProfileChangesSubmit, children: [
      /* @__PURE__ */ jsx(
        ProfileItem,
        {
          name: "username",
          value: user == null ? void 0 : user.username
        }
      ),
      /* @__PURE__ */ jsx(
        ProfileItem,
        {
          name: "websites",
          value: websitesField,
          isArray: true,
          maxArrayLength: 3,
          onChange: (e, idx) => {
            const newWebsites = [...websitesField];
            newWebsites[idx] = e.target.value;
            setHasChanges(true);
            setWebsitesField(newWebsites);
          },
          onAddArrayItem: () => {
            if (websitesField.length < 3) {
              setWebsitesField([...websitesField, ""]);
              setHasChanges(true);
            }
          },
          disabled: !(user == null ? void 0 : user.is_email_verified) || processing,
          isEditingThisField: editingField === "websites",
          onEditClick: () => handleEditClick("websites")
        }
      ),
      /* @__PURE__ */ jsx(
        ProfileItem,
        {
          name: "location",
          value: locationField,
          setValue: setLocationField,
          onChange: (e) => {
            setHasChanges(e.target.value !== user.location);
            setLocationField(e.target.value);
          },
          disabled: !(user == null ? void 0 : user.is_email_verified) || processing,
          isEditingThisField: editingField === "location",
          onEditClick: () => handleEditClick("location")
        }
      ),
      /* @__PURE__ */ jsx(
        ProfileItem,
        {
          name: "email",
          value: user == null ? void 0 : user.email
        }
      ),
      /* @__PURE__ */ jsx(
        CheckboxField,
        {
          name: "show-email",
          label: "show e-mail in profile:",
          value: showEmailInProfile,
          onChange: (e) => {
            setHasChanges(e.target.checked !== !!user.show_email_in_profile);
            setShowEmailInProfile(e.target.checked);
          },
          disabled: !(user == null ? void 0 : user.is_email_verified) || processing
        }
      ),
      /* @__PURE__ */ jsx(
        CheckboxField,
        {
          name: "accepts-emails",
          label: "accept e-mail notifications:",
          value: acceptsEmails,
          onChange: (e) => {
            setHasChanges(e.target.checked !== !!user.accepts_emails);
            setAcceptsEmails(e.target.checked);
          },
          disabled: !(user == null ? void 0 : user.is_email_verified) || processing
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex-row", children: [
        /* @__PURE__ */ jsxs("div", { className: "button-container", children: [
          /* @__PURE__ */ jsx("button", { onClick: handleLogoutSubmit, disabled: processing || isLoggingOut, children: "log out" }),
          hasChanges && /* @__PURE__ */ jsx("button", { type: "submit", disabled: processing, children: "save changes" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-column", children: [
          (user == null ? void 0 : user.is_email_verified) && (user == null ? void 0 : user.login_type) == LoginType.Email && /* @__PURE__ */ jsx(Link, { href: "/password-change", className: "centered-content no-margin", children: "change password" }),
          /* @__PURE__ */ jsx(Link, { href: `/${user == null ? void 0 : user.username}`, className: "centered-content no-margin", children: "preview profile" })
        ] })
      ] })
    ] }) })
  ] });
}
const __vite_glob_0_26 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: EditProfile
}, Symbol.toStringTag, { value: "Module" }));
function EditBio() {
  var _a;
  const { props } = usePage();
  const user = (_a = props == null ? void 0 : props.auth) == null ? void 0 : _a.user;
  const appUrl = props.app_url;
  const flash = (props == null ? void 0 : props.flash) || {};
  const [isInEditMode, setIsInEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bio, setBio] = useState(null);
  const [initialBio, setInitialBio] = useState(null);
  const [hasBioChanged, setHasBioChanged] = useState(false);
  const { data, setData, post, processing, errors, setError, clearErrors } = useForm({ bio: "" });
  useEffect(() => {
    const hydratedBio = hydrateEditorImagePaths(user == null ? void 0 : user.bio, appUrl);
    setBio(hydratedBio);
    setInitialBio(hydratedBio);
    setData("bio", hydratedBio || "");
  }, [user, setData]);
  const handleBioChange = useCallback((newBio) => {
    setBio(newBio);
    setHasBioChanged(initialBio !== newBio);
  }, [initialBio]);
  const handleBioSubmit = async (e) => {
    e.preventDefault();
    clearErrors();
    const dehydratedBio = dehydrateEditorImagePaths(bio, appUrl);
    const bioWithResizedImages = await processEditorImages(dehydratedBio);
    setIsSubmitting(true);
    router.post("/update-bio", { bio: bioWithResizedImages }, {
      preserveScroll: true,
      onSuccess: (page) => {
        var _a2, _b, _c;
        const updatedBio = hydrateEditorImagePaths(((_c = (_b = (_a2 = page.props) == null ? void 0 : _a2.auth) == null ? void 0 : _b.user) == null ? void 0 : _c.bio) || bioWithResizedImages, appUrl);
        setInitialBio(updatedBio);
        setBio(updatedBio);
        setHasBioChanged(false);
        setIsInEditMode(false);
      },
      onError: (err) => {
        if (err && typeof err === "object" && !err.response && !err.message) {
          for (const key in err) {
            setError(key, err[key]);
          }
        } else {
          const displayErrorMessage = getErrorMessage(err);
          setError("general", displayErrorMessage.trim());
        }
      },
      onFinish: () => setIsSubmitting(false)
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "rte-container", children: [
    /* @__PURE__ */ jsx(PageHead, { title: "Edit Bio" }),
    /* @__PURE__ */ jsxs("div", { className: "centered-header-box", children: [
      isInEditMode && hasBioChanged && /* @__PURE__ */ jsx("div", { className: "left-item padded", children: /* @__PURE__ */ jsx(
        "button",
        {
          className: "save-button",
          type: "submit",
          disabled: isSubmitting,
          onClick: handleBioSubmit,
          children: "save"
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: "centered-content", children: /* @__PURE__ */ jsx("h3", { children: "bio" }) }),
      /* @__PURE__ */ jsx("div", { className: "right-item padded", children: !isInEditMode && /* @__PURE__ */ jsx(
        EditButton,
        {
          onClick: (e) => {
            e.preventDefault();
            setIsInEditMode(true);
          },
          disabled: !(user == null ? void 0 : user.is_email_verified)
        }
      ) })
    ] }),
    errors.general && /* @__PURE__ */ jsx("div", { className: "error", children: errors.general }),
    flash.success_bio && /* @__PURE__ */ jsx("div", { className: "notice", children: flash.success_bio }),
    isInEditMode ? /* @__PURE__ */ jsx(
      RichTextEditor,
      {
        disabled: !isInEditMode || isSubmitting,
        onChange: handleBioChange,
        value: bio,
        autoFocus: true
      }
    ) : /* @__PURE__ */ jsx(
      "div",
      {
        className: "padded article-text",
        dangerouslySetInnerHTML: { __html: sanitizeRichHtml(bio) }
      }
    )
  ] });
}
const __vite_glob_0_24 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: EditBio
}, Symbol.toStringTag, { value: "Module" }));
function Dashboard() {
  const { auth } = usePage().props;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleAccountRestore = useCallback(() => {
    setIsSubmitting(true);
    router.post("/dashboard/restore-account", {}, {
      onFinish: () => setIsSubmitting(false)
    });
  }, []);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHead, { title: "Dashboard" }),
    /* @__PURE__ */ jsxs(DashboardLayout, { currentTab: "profile", headerText: "your profile", children: [
      auth.user.profile_hidden_at && /* @__PURE__ */ jsxs("div", { className: "main-info-box notice-container red-gradient-background", children: [
        /* @__PURE__ */ jsxs("p", { className: "notice", children: [
          "Your profile is hidden and your account set to be deleted in ",
          Math.max(0, Math.ceil((new Date(auth.user.profile_hidden_at).getTime() + 30 * 24 * 60 * 60 * 1e3 - (/* @__PURE__ */ new Date()).getTime()) / (1e3 * 60 * 60 * 24))),
          " days."
        ] }),
        /* @__PURE__ */ jsx("div", { className: "centered-content no-margin", children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleAccountRestore,
            disabled: isSubmitting,
            className: "yellow-button",
            children: "Restore account"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "profile-boxes-container", children: [
        /* @__PURE__ */ jsx(EditProfile, {}),
        /* @__PURE__ */ jsx(EditBio, {})
      ] }),
      /* @__PURE__ */ jsx("div", { className: "account-deletion-section centered-content", children: !auth.user.profile_hidden_at && /* @__PURE__ */ jsx(Link, { href: "/dashboard/delete-account", className: "button", children: "delete account" }) })
    ] })
  ] });
}
const __vite_glob_0_3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Dashboard
}, Symbol.toStringTag, { value: "Module" }));
const MAX_PAGE_NUMBERS = 5;
function getUrlWithPage(url, i) {
  const parsed = new URL(url, "http://localhost");
  const params = new URLSearchParams(parsed.search);
  params.set("page", i);
  return `${parsed.pathname}?${params}`;
}
function getPageNumbers(currentPage, pageCount) {
  if (pageCount <= 1) return [1];
  const half = Math.floor(MAX_PAGE_NUMBERS / 2);
  let start = currentPage - half;
  let end = currentPage + half;
  if (start < 1) {
    start = 1;
    end = Math.min(pageCount, MAX_PAGE_NUMBERS);
  } else if (end > pageCount) {
    end = pageCount;
    start = Math.max(1, pageCount - MAX_PAGE_NUMBERS + 1);
  }
  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
}
function Paginator({ itemsPerPage, totalCount, currentPage, onNumberClick }) {
  const { url } = usePage();
  const pageCount = Math.ceil(totalCount / itemsPerPage);
  const pageNumbers = getPageNumbers(currentPage, pageCount);
  return pageCount > 1 && /* @__PURE__ */ jsxs("div", { className: "paginator", children: [
    currentPage != 1 && /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(
      "a",
      {
        onClick: (e) => {
          e.preventDefault();
          onNumberClick(1);
        },
        href: getUrlWithPage(url, 1),
        className: "arrow",
        children: "<<"
      }
    ) }),
    currentPage > 1 && /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(
      "a",
      {
        onClick: (e) => {
          e.preventDefault();
          onNumberClick(currentPage - 1);
        },
        href: getUrlWithPage(url, currentPage - 1),
        className: "arrow",
        children: "<"
      }
    ) }),
    pageNumbers.map((i) => {
      const isEllipsisBefore = pageNumbers[0] > 1 && i === pageNumbers[0];
      const isEllipsisAfter = pageNumbers[pageNumbers.length - 1] < pageCount && pageNumbers[pageNumbers.length - 1] === i;
      return /* @__PURE__ */ jsxs("span", { children: [
        isEllipsisBefore && /* @__PURE__ */ jsx(Fragment, { children: "…" }),
        /* @__PURE__ */ jsx(
          "a",
          {
            className: i === currentPage ? "current-page" : "",
            onClick: (e) => {
              e.preventDefault();
              onNumberClick(i);
            },
            href: getUrlWithPage(url, i),
            children: i
          }
        ),
        isEllipsisAfter && /* @__PURE__ */ jsx(Fragment, { children: "…" })
      ] }, i);
    }),
    currentPage < pageCount && /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(
      "a",
      {
        onClick: (e) => {
          e.preventDefault();
          onNumberClick(currentPage + 1);
        },
        href: getUrlWithPage(url, currentPage + 1),
        className: "arrow",
        children: ">"
      }
    ) }),
    currentPage != pageCount && /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(
      "a",
      {
        onClick: (e) => {
          e.preventDefault();
          onNumberClick(pageCount);
        },
        href: getUrlWithPage(url, pageCount),
        className: "arrow",
        children: ">>"
      }
    ) })
  ] });
}
function ItemList({ items, Component, buildProps }) {
  return /* @__PURE__ */ jsx(Fragment, { children: items.map((item, i) => /* @__PURE__ */ jsx(Component, { ...buildProps(item, i) }, item.id ?? i)) });
}
function LoadItems({
  initialItems = null,
  partialProp = null,
  renderMethod,
  Component,
  itemString,
  isFullPage = false,
  classes = "",
  fetchAmount = 10,
  headingText = "",
  viewAllLink = "",
  headerClasses = ""
}) {
  const { props } = usePage();
  const partial = isFullPage && partialProp ? props[partialProp] : null;
  const normalizeItems = (source) => {
    if (!source) return [];
    if (source.data && Array.isArray(source.data)) return source.data;
    if (Array.isArray(source)) return source;
    return [];
  };
  const classNames = isFullPage ? classes : classes + " preview";
  const initialItemsFromProp = !isFullPage ? normalizeItems(initialItems) : normalizeItems(partial);
  const [items, setItems] = useState(initialItemsFromProp);
  const [currentPage, setCurrentPage] = useState((partial == null ? void 0 : partial.current_page) || 1);
  const [totalCount, setTotalCount] = useState((partial == null ? void 0 : partial.total) || initialItemsFromProp.length);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (isFullPage && partialProp && partial) {
      setItems(normalizeItems(partial));
      setCurrentPage(partial.current_page || 1);
      setTotalCount(partial.total || normalizeItems(partial).length);
      setIsLoading(false);
    } else if (!isFullPage && initialItems) {
      setItems(normalizeItems(initialItems));
      setTotalCount(normalizeItems(initialItems).length);
    }
  }, [partial, isFullPage, partialProp, initialItems]);
  const onNumberClick = useCallback((pageNum) => {
    if (pageNum !== currentPage) {
      setIsLoading(true);
      router.get(window.location.pathname, { page: pageNum }, {
        only: [partialProp],
        preserveState: true,
        preserveScroll: true
      });
    }
  }, [currentPage, partialProp]);
  return /* @__PURE__ */ jsxs("div", { className: "items-heading-container", children: [
    isFullPage && /* @__PURE__ */ jsx(
      Paginator,
      {
        itemsPerPage: fetchAmount,
        totalCount,
        currentPage,
        onNumberClick
      }
    ),
    headingText && /* @__PURE__ */ jsx("h2", { className: `centered-content ${headerClasses}`, children: /* @__PURE__ */ jsx(Link, { href: viewAllLink, children: headingText }) }),
    /* @__PURE__ */ jsx("div", { className: `${itemString}-container ${classNames}`, children: isLoading ? /* @__PURE__ */ jsxs("p", { className: "centered-content", children: [
      "loading ",
      itemString,
      "..."
    ] }) : items && items.length > 0 ? /* @__PURE__ */ jsx(
      ItemList,
      {
        items,
        Component,
        buildProps: renderMethod
      }
    ) : /* @__PURE__ */ jsxs("p", { className: "centered-content", children: [
      "no ",
      itemString
    ] }) }),
    isFullPage && /* @__PURE__ */ jsx(
      Paginator,
      {
        itemsPerPage: fetchAmount,
        totalCount,
        currentPage,
        onNumberClick
      }
    ),
    !isFullPage && viewAllLink && /* @__PURE__ */ jsx(Link, { href: viewAllLink, className: "centered-content", children: "view all" })
  ] });
}
function UserCircle({ user }) {
  const { props } = usePage();
  const avatar = (user == null ? void 0 : user.avatar) ? `${props.app_url}/storage/images/uploaded/users/${user.username}/avatar/small/${user == null ? void 0 : user.avatar}` : `${props.app_url}/storage/images/defaults/avatar.webp?v=1`;
  return user && /* @__PURE__ */ jsxs(
    Link,
    {
      href: `/${user.username}`,
      className: "user-circle",
      children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: avatar,
            alt: `${user.username}'s profile image`,
            className: "round-image"
          }
        ),
        /* @__PURE__ */ jsx("span", { children: user.username })
      ]
    }
  );
}
const MEMBERS_PER_PAGE = 100;
const HEADER_TEXT$1 = "your followers";
function Followers({ memberProp }) {
  var _a;
  const { url, props } = usePage();
  const isDashboardUrl = url.startsWith("/dashboard/followers");
  const user = (_a = props.auth) == null ? void 0 : _a.user;
  const member = memberProp || user;
  if (!isDashboardUrl && !member && !user) {
    router.visit("/login");
    return null;
  }
  const content = /* @__PURE__ */ jsxs(Fragment, { children: [
    !isDashboardUrl && /* @__PURE__ */ jsx("h2", { className: "centered-content" }),
    /* @__PURE__ */ jsx(
      LoadItems,
      {
        isFullPage: true,
        partialProp: "usersList",
        renderMethod: (u) => ({ user: u }),
        Component: UserCircle,
        itemString: "users",
        fetchAmount: MEMBERS_PER_PAGE,
        classes: "side-padded"
      }
    )
  ] });
  return member && /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHead, { title: "Followers" }),
    user ? /* @__PURE__ */ jsx(
      DashboardLayout,
      {
        headerText: isDashboardUrl ? HEADER_TEXT$1 : "",
        currentTab: "activity",
        children: content
      }
    ) : content
  ] });
}
const __vite_glob_0_4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Followers
}, Symbol.toStringTag, { value: "Module" }));
const FOLLOWERS_PER_PAGE = 100;
const HEADER_TEXT = "users you follow";
function Following({ memberProp }) {
  const { url, props } = usePage();
  const isDashboardUrl = url.startsWith("/dashboard/following");
  const user = props.auth.user;
  const member = memberProp || user;
  if (!isDashboardUrl && !member && !user) {
    router.visit("/login");
    return null;
  }
  const content = /* @__PURE__ */ jsxs(Fragment, { children: [
    !isDashboardUrl && /* @__PURE__ */ jsx("h2", { className: "centered-content" }),
    /* @__PURE__ */ jsx(
      LoadItems,
      {
        isFullPage: true,
        partialProp: "usersList",
        renderMethod: (u) => ({ user: u }),
        Component: UserCircle,
        itemString: "users",
        fetchAmount: FOLLOWERS_PER_PAGE,
        classes: "side-padded"
      }
    )
  ] });
  return member && (user ? /* @__PURE__ */ jsx(
    DashboardLayout,
    {
      headerText: isDashboardUrl ? HEADER_TEXT : "",
      currentTab: "activity",
      children: content
    }
  ) : content);
}
const __vite_glob_0_5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Following
}, Symbol.toStringTag, { value: "Module" }));
function Tile({ post, isSliderDraggedPointerUp, user = null, isDashboard = false }) {
  const { props } = usePage();
  if (!post || !user && !post.user) return null;
  const author = user ?? post.user;
  let viewText = "info";
  if (isDashboard) {
    viewText = "view";
  } else if (post.is_news) {
    viewText = "read";
  }
  const directory = `${props.app_url}/storage/images/uploaded/users/${author.username}/posts/${post.post_url}/gallery/small`;
  let imageUrls = [];
  try {
    imageUrls = (post == null ? void 0 : post.gallery_image_urls) ?? [];
  } catch (err) {
    console.error("Invalid gallery_image_urls JSON", err);
    imageUrls = [];
  }
  function handleLinkClick(e) {
    if (isSliderDraggedPointerUp == null ? void 0 : isSliderDraggedPointerUp.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  }
  return /* @__PURE__ */ jsxs("article", { className: "work-tile", children: [
    imageUrls && imageUrls.length > 0 && /* @__PURE__ */ jsx(
      "img",
      {
        className: "tile-image",
        src: `${directory}/${imageUrls[0]}`,
        alt: `Thumbnail for ${post.title}`,
        draggable: "false"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "info-panel", children: [
      (post == null ? void 0 : post.is_hidden_by_admin) ? /* @__PURE__ */ jsx("div", { className: "centered-icon red", children: /* @__PURE__ */ jsx(
        "i",
        {
          title: "hidden",
          className: "fa-regular fa-eye-slash"
        }
      ) }) : isDashboard && (post == null ? void 0 : post.is_draft) ? /* @__PURE__ */ jsx("div", { className: "centered-icon blue", children: /* @__PURE__ */ jsx(
        "i",
        {
          title: "draft",
          className: "fa-solid fa-file-pen"
        }
      ) }) : isDashboard && (post == null ? void 0 : post.is_private) ? /* @__PURE__ */ jsx("div", { className: "centered-icon blue", children: /* @__PURE__ */ jsx(
        "i",
        {
          title: "private",
          className: "fa-regular fa-eye-slash"
        }
      ) }) : null,
      /* @__PURE__ */ jsxs("div", { className: "panel-top", children: [
        post.is_news ? /* @__PURE__ */ jsxs("div", { className: "tile-title-news-icon-container", children: [
          /* @__PURE__ */ jsx("div", { className: "info-item title", children: post.title }),
          /* @__PURE__ */ jsx("div", { className: "icon-container", children: /* @__PURE__ */ jsx(
            "i",
            {
              className: "fa-regular fa-newspaper",
              title: "news post"
            }
          ) })
        ] }) : /* @__PURE__ */ jsx("div", { className: "info-item title", children: post.title }),
        /* @__PURE__ */ jsx("div", { className: "info-item subtitle", children: post.subtitle }),
        !isDashboard && /* @__PURE__ */ jsx("div", { className: "info-item link-container", children: /* @__PURE__ */ jsx(UserLink, { user: author }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "panel-bottom", children: [
        isDashboard && /* @__PURE__ */ jsx("div", { className: "info-item action-links link-container", children: /* @__PURE__ */ jsxs(
          Link,
          {
            href: `/dashboard/edit-post/${post.post_url}`,
            className: "post-link",
            onClick: handleLinkClick,
            draggable: "false",
            "aria-label": "Edit post",
            children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-pen-to-square" }),
              /* @__PURE__ */ jsx("span", { children: "edit" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "info-item action-links link-container", children: [
          !post && /* @__PURE__ */ jsx("p", { children: "Post not loaded yet" }),
          /* @__PURE__ */ jsxs(
            Link,
            {
              href: getPostUrl(post),
              className: "post-link",
              onClick: handleLinkClick,
              draggable: "false",
              "aria-label": `View ${post.is_news ? "news " : ""}post`,
              children: [
                post.is_news ? /* @__PURE__ */ jsx("i", { className: "fa-brands fa-readme" }) : /* @__PURE__ */ jsx("i", { className: "fa-solid fa-magnifying-glass" }),
                /* @__PURE__ */ jsx("span", { children: viewText })
              ]
            }
          )
        ] }),
        post.website && !isDashboard && /* @__PURE__ */ jsx("div", { className: "info-item action-links link-container", children: /* @__PURE__ */ jsxs(
          "a",
          {
            href: post.website,
            className: "post-link",
            draggable: "false",
            "aria-label": "Visit external website",
            onClick: (e) => {
              if (isSliderDraggedPointerUp == null ? void 0 : isSliderDraggedPointerUp.current) {
                e.stopPropagation();
                e.preventDefault();
                return;
              }
              e.preventDefault();
              openPopup(
                post.website,
                `${post.id} : ${post.title}`,
                window.screen.width * 0.2,
                window.screen.height * 0.2,
                window.screen.width * 0.8,
                window.screen.height * 0.8
              );
            },
            children: [
              /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-up-right-from-square" }),
              /* @__PURE__ */ jsx("span", { children: "visit" })
            ]
          }
        ) })
      ] })
    ] })
  ] });
}
const gridPostCounts = {
  [ScreenSize.Nothing]: 0,
  [ScreenSize.Narrow]: 5,
  [ScreenSize.Small]: 6,
  [ScreenSize.Mid]: 8,
  [ScreenSize.Wide]: 11
};
function HeroTilesContainer({ screenSize, category, fetchOrder = FetchOrder.Ascending, initialPosts = null, fetchMethod = null }) {
  const [posts, setPosts] = useState(initialPosts || []);
  function getPostAmount(currentSize) {
    return gridPostCounts[currentSize];
  }
  const prevScreenSizeRef = useRef(ScreenSize.Nothing);
  const fetchedScreenSize = useRef(ScreenSize.Nothing);
  const fetchIndexRef = useRef(1);
  const fetchExcludesRef = useRef([]);
  const [areNoMorePosts, setAreNoMorePosts] = useState(false);
  useEffect(() => {
    if (areNoMorePosts) {
      return;
    }
    const shouldFetch = checkIfFetchNeeded(prevScreenSizeRef, screenSize, fetchedScreenSize);
    if (!shouldFetch) {
      return;
    }
    if (initialPosts && initialPosts.length > 0 && posts.length > 0) {
      return;
    }
    const amount = getPostAmount(screenSize) - posts.length;
    const params = getPostsFetchParams(
      amount,
      category,
      fetchOrder,
      fetchIndexRef,
      fetchExcludesRef
    );
    const fetchedSize = fetchedScreenSize.current;
    if (!fetchMethod) {
      return;
    }
    fetchMethod(params).then((data) => {
      if (data.status === "no_more_posts") {
        setAreNoMorePosts(true);
        return;
      }
      setPosts((prev) => [...prev, ...data]);
      if (fetchOrder === FetchOrder.Random) {
        fetchExcludesRef.current = addFetchedPostsToExcludes(data, fetchExcludesRef.current);
      } else {
        fetchIndexRef.current = getNextFetchIndex(data, fetchOrder);
      }
      fetchedScreenSize.current = screenSize > fetchedSize ? screenSize : fetchedSize;
    });
  }, [screenSize, category, posts, areNoMorePosts, setAreNoMorePosts, fetchOrder]);
  const postsToDisplay = posts.length > 0 ? posts.slice(0, getPostAmount(screenSize)) : posts;
  return /* @__PURE__ */ jsx("div", { className: "tiles-container first-row-taller", children: postsToDisplay.length > 0 ? postsToDisplay.map((post) => {
    return /* @__PURE__ */ jsx(Tile, { post }, post.id);
  }) : /* @__PURE__ */ jsx("p", { className: "loading", children: "loading posts..." }) });
}
const postsPerRow = {
  [ScreenSize.Nothing]: 0,
  [ScreenSize.Narrow]: 1,
  [ScreenSize.Small]: 2,
  [ScreenSize.Mid]: 3,
  [ScreenSize.Wide]: 4
};
function AutoloadTilesContainer({
  screenSize,
  category = Category.Archive,
  userId = null,
  username = null,
  isDashboard = false,
  fetchOrder = FetchOrder.Ascending,
  searchTerm = "",
  isSearch = false,
  initialPosts = null,
  partialProp = "archivePosts",
  loadOnScroll = true,
  maxItems = null
}) {
  const { props, component, version } = usePage();
  const serverPartial = props[partialProp];
  const normalize = (p) => {
    if (!p) return [];
    if (p.data && Array.isArray(p.data)) return p.data;
    if (Array.isArray(p)) return p;
    return [];
  };
  const initialFromServer = initialPosts ? initialPosts.data && Array.isArray(initialPosts.data) ? initialPosts.data : Array.isArray(initialPosts) ? initialPosts : [] : normalize(serverPartial);
  const initialDisplayed = initialFromServer;
  const initialAreNoMore = isSearch && !searchTerm || initialFromServer.length === 0;
  const { url } = usePage();
  const pathname = typeof window !== "undefined" ? window.location.pathname : new URL(url, "http://localhost").pathname;
  const rememberKey = `${partialProp}-${pathname}${searchTerm ? "-" + searchTerm : ""}`;
  const [posts, setPosts] = useRemember(initialDisplayed || [], `posts-${rememberKey}`);
  const [areNoMorePosts, setAreNoMorePosts] = useRemember(initialAreNoMore, `noMore-${rememberKey}`);
  const getPostAmount = useCallback((currentSize) => {
    return postsPerRow[currentSize];
  }, []);
  const prevScreenSizeRef = useRef(ScreenSize.Nothing);
  const fetchedScreenSizeRef = useRef(ScreenSize.Nothing);
  const pageRef = useRef(serverPartial && serverPartial.current_page ? serverPartial.current_page : 1);
  const lastPageRef = useRef(serverPartial && serverPartial.last_page ? serverPartial.last_page : null);
  const fetchExcludesRef = useRef(posts.map((p) => p.id));
  const isFetchingOnScroll = useRef(false);
  const isFetchingOnWidthChange = useRef(false);
  const pendingRequestRef = useRef(null);
  const requestNext = useCallback((kind = "scroll", amountOverride = null) => {
    if (isSearch && searchTerm.length < 2) {
      setAreNoMorePosts(true);
      return;
    }
    if (areNoMorePosts) return;
    if (isFetchingOnScroll.current || isFetchingOnWidthChange.current) return;
    const amount = amountOverride ?? getPostAmount(screenSize);
    const query = { amount };
    if (isSearch && searchTerm) query.q = searchTerm;
    if (fetchOrder === FetchOrder.Random) {
      const excludes = fetchExcludesRef.current.join(",");
      if (excludes) query.excludes = excludes;
      query.fetch_order = "random";
    } else {
      const nextPage = (pageRef.current || 1) + 1;
      query.page = nextPage;
    }
    pendingRequestRef.current = { kind };
    isFetchingOnScroll.current = kind === "scroll";
    isFetchingOnWidthChange.current = kind === "resize";
    axios.get(window.location.pathname, {
      params: query,
      headers: {
        "X-Inertia": "true",
        "X-Inertia-Partial-Data": partialProp,
        "X-Inertia-Partial-Component": component,
        "X-Inertia-Version": version
      }
    }).then((response) => {
      if (!response.data || !response.data.props) return;
      const partial = response.data.props[partialProp];
      const isPaginator = partial && partial.data && Array.isArray(partial.data);
      let newItems = [];
      if (isPaginator) {
        newItems = partial.data;
        const current = partial.current_page || 1;
        const last = partial.last_page || null;
        pageRef.current = current;
        lastPageRef.current = last;
        if (last && current >= last) setAreNoMorePosts(true);
      } else if (partial && Array.isArray(partial)) {
        newItems = partial;
      } else {
        newItems = [];
      }
      if (newItems.length === 0) {
        setAreNoMorePosts(true);
      } else {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const filtered = newItems.filter((p) => !existingIds.has(p.id));
          if (fetchOrder === FetchOrder.Random) {
            fetchExcludesRef.current = addFetchedPostsToExcludes(filtered, fetchExcludesRef.current);
          }
          return [...prev, ...filtered];
        });
      }
      if (kind === "resize") {
        fetchedScreenSizeRef.current = screenSize;
      }
    }).catch((err) => {
      if (err.response && err.response.status === 409) {
        window.location.reload();
      } else {
        console.error("Autoload error:", err);
      }
    }).finally(() => {
      pendingRequestRef.current = null;
      isFetchingOnScroll.current = false;
      isFetchingOnWidthChange.current = false;
    });
  }, [getPostAmount, screenSize, areNoMorePosts, fetchOrder, isSearch, searchTerm, partialProp, component]);
  const handleScroll = useCallback(() => {
    if (!loadOnScroll) return;
    const yThreshold = document.documentElement.scrollHeight * 0.95;
    if (window.scrollY + window.innerHeight > yThreshold && !isFetchingOnScroll.current && !isFetchingOnWidthChange.current) {
      requestNext("scroll");
    }
  }, [requestNext, loadOnScroll]);
  useEffect(() => {
    if (!loadOnScroll) return;
    const scrollInterval = setInterval(handleScroll, 200);
    return () => {
      clearInterval(scrollInterval);
    };
  }, [handleScroll, loadOnScroll]);
  useEffect(() => {
    if (!loadOnScroll) return;
    if (isSearch && !searchTerm) {
      setAreNoMorePosts(true);
      return;
    }
    if (isFetchingOnScroll.current || isFetchingOnWidthChange.current) return;
    if (areNoMorePosts) return;
    if (prevScreenSizeRef.current === ScreenSize.Nothing) {
      prevScreenSizeRef.current = screenSize;
      return;
    }
    const shouldFetch = checkIfFetchNeeded(prevScreenSizeRef, screenSize, fetchedScreenSizeRef);
    if (!shouldFetch) return;
    const ppr2 = getPostAmount(screenSize);
    const missing = posts.length < ppr2 ? ppr2 - posts.length : 0;
    if (missing <= 0) return;
    if (fetchOrder !== FetchOrder.Random) return;
    requestNext("resize", missing);
  }, [screenSize, posts, getPostAmount, isSearch, searchTerm, areNoMorePosts, requestNext, fetchOrder, loadOnScroll]);
  const ppr = getPostAmount(screenSize);
  let displayAmount = Math.floor(posts.length / ppr) * ppr;
  displayAmount = displayAmount === 0 || areNoMorePosts ? posts.length : displayAmount;
  let postsToDisplay = posts;
  if (!loadOnScroll && maxItems) {
    postsToDisplay = posts.length > 0 ? posts.slice(0, maxItems[screenSize] || posts.length) : posts;
  } else {
    postsToDisplay = posts.length > ppr ? posts.slice(0, displayAmount) : posts;
  }
  return /* @__PURE__ */ jsxs("div", { className: "tiles-container", children: [
    postsToDisplay.length == 0 && areNoMorePosts ? /* @__PURE__ */ jsx("p", { className: "centered-content padding-1rem", children: "no posts to load." }) : postsToDisplay.length > 0 ? postsToDisplay.map((post) => {
      return /* @__PURE__ */ jsx(Tile, { post, isDashboard }, post.id);
    }) : /* @__PURE__ */ jsx("p", { className: "centered-content padding-1rem", children: "loading posts..." }),
    loadOnScroll && (areNoMorePosts || isSearch) && postsToDisplay.length > 0 && /* @__PURE__ */ jsx("div", { className: "centered-content padding-1rem work-tile", children: /* @__PURE__ */ jsx("span", { className: "info-text", children: "no more posts to load" }) })
  ] });
}
class Point {
  constructor(x, y) {
    __publicField(this, "distanceTo", (point) => {
      const distance = Math.sqrt(Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2));
      return distance;
    });
    this.x = x;
    this.y = y;
  }
}
function CarouselContainer({ size, className, children }) {
  const sliderContainerRef = useRef(null);
  const innerSliderRef = useRef(null);
  const isDraggingRef = useRef(false);
  const isDraggedPointerUpRef = useRef(false);
  const isPointerDownRef = useRef(false);
  const sliderEndLeftRef = useRef(null);
  const sliderEndRightRef = useRef(null);
  const startPosRef = useRef(new Point(0, 0));
  const currentTranslateXRef = useRef(0);
  const initialTranslateXRef = useRef(0);
  const mouseDownTargetRef = useRef(null);
  const distanceThreshold = 5;
  const lastMoveTimeRef = useRef(0);
  const lastMoveXRef = useRef(0);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef(null);
  const checkBoundary = useCallback((x) => {
    if (!innerSliderRef.current || !sliderContainerRef.current) return x;
    const innerW = innerSliderRef.current.offsetWidth;
    const outerW = sliderContainerRef.current.offsetWidth;
    if (innerW < outerW) {
      return 0;
    }
    const innerSliderMax = innerW - outerW;
    let newTranslateX = Math.min(x, 0);
    newTranslateX = Math.max(newTranslateX, -innerSliderMax);
    return newTranslateX;
  }, []);
  const updateSliderEnds = useCallback(() => {
    if (!innerSliderRef.current || !sliderContainerRef.current) {
      return;
    }
    const FADE_WIDTH = 200;
    const currentX = currentTranslateXRef.current;
    const opacityLeft = Math.min(-currentX / FADE_WIDTH, 1);
    const sliderLeft = sliderEndLeftRef.current;
    sliderLeft.style.setProperty("--left-opacity", opacityLeft);
    const innerW = innerSliderRef.current.offsetWidth;
    const outerW = sliderContainerRef.current.offsetWidth;
    const innerSliderMax = innerW - outerW;
    const rightFadePoint = innerSliderMax - FADE_WIDTH;
    const opacityRight = 1 - Math.max((-currentX - rightFadePoint) / FADE_WIDTH, 0);
    const sliderRight = sliderEndRightRef.current;
    sliderRight.style.setProperty("--right-opacity", opacityRight);
  }, []);
  useEffect(() => {
    updateSliderEnds();
    window.addEventListener("resize", updateSliderEnds);
    let resizeObserver = null;
    if (innerSliderRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateSliderEnds();
      });
      resizeObserver.observe(innerSliderRef.current);
    }
    return () => {
      window.removeEventListener("resize", updateSliderEnds);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [updateSliderEnds]);
  const handleFocusIn = useCallback(() => {
    const focusedEl = document.activeElement;
    if (!innerSliderRef.current || !sliderContainerRef.current || !focusedEl || !innerSliderRef.current.contains(focusedEl)) {
      return;
    }
    const sliderRect = sliderContainerRef.current.getBoundingClientRect();
    const focusRect = focusedEl.getBoundingClientRect();
    const overLeft = focusRect.left < sliderRect.left;
    const overRight = focusRect.right > sliderRect.right;
    let deltaX = 0;
    if (overLeft) {
      deltaX = focusRect.left - sliderRect.left;
    } else if (overRight) {
      deltaX = focusRect.right - sliderRect.right;
    }
    if (deltaX !== 0) {
      currentTranslateXRef.current -= deltaX;
      currentTranslateXRef.current = checkBoundary(currentTranslateXRef.current);
      innerSliderRef.current.style.transform = `translateX(${currentTranslateXRef.current}px)`;
    }
  }, [checkBoundary]);
  const renderContent = typeof children === "function" ? children({
    isDragging: isDraggingRef,
    isDraggedPointerUp: isDraggedPointerUpRef,
    handleFocusIn
  }) : children;
  const handlePointerDown = useCallback((e) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    isPointerDownRef.current = true;
    isDraggedPointerUpRef.current = false;
    isDraggingRef.current = false;
    if (sliderContainerRef.current) sliderContainerRef.current.classList.add("dragging");
    if (innerSliderRef.current) innerSliderRef.current.classList.add("dragging");
    startPosRef.current = new Point(e.pageX, e.pageY);
    initialTranslateXRef.current = currentTranslateXRef.current;
    mouseDownTargetRef.current = e.target;
    lastMoveXRef.current = e.pageX;
    lastMoveTimeRef.current = performance.now();
    velocityRef.current = 0;
  }, []);
  const handlePointerMove = useCallback((e) => {
    if (!isPointerDownRef.current || !sliderContainerRef.current) {
      return;
    }
    let isDraggingCurrent = isDraggingRef.current;
    const diff = startPosRef.current.distanceTo(new Point(e.pageX, e.pageY));
    if (!isDraggingRef.current && diff > distanceThreshold) {
      isDraggingRef.current = true;
      isDraggingCurrent = true;
      if (mouseDownTargetRef.current && mouseDownTargetRef.current.tagName !== "A") {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    if (!isDraggingCurrent) {
      return;
    }
    isDraggedPointerUpRef.current = true;
    e.preventDefault();
    e.stopPropagation();
    const now = performance.now();
    const dt = now - lastMoveTimeRef.current;
    if (dt > 0) {
      velocityRef.current = (e.pageX - lastMoveXRef.current) / dt;
    }
    lastMoveXRef.current = e.pageX;
    lastMoveTimeRef.current = now;
    const deltaX = e.pageX - startPosRef.current.x;
    let newTranslateX = initialTranslateXRef.current + deltaX;
    newTranslateX = checkBoundary(newTranslateX);
    currentTranslateXRef.current = newTranslateX;
    innerSliderRef.current.style.transform = `translateX(${currentTranslateXRef.current}px)`;
    updateSliderEnds();
  }, [checkBoundary]);
  const handlePointerUp = useCallback(() => {
    isPointerDownRef.current = false;
    if (sliderContainerRef.current) sliderContainerRef.current.classList.remove("dragging");
    if (innerSliderRef.current) innerSliderRef.current.classList.remove("dragging");
    const now = performance.now();
    if (now - lastMoveTimeRef.current > 100) {
      velocityRef.current = 0;
    }
    if (Math.abs(velocityRef.current) > 0.1 && isDraggingRef.current) {
      let v = velocityRef.current;
      let lastFrameTime = performance.now();
      const momentumLoop = (time) => {
        if (!innerSliderRef.current || !sliderContainerRef.current) return;
        const dt = time - lastFrameTime;
        lastFrameTime = time;
        if (!isPointerDownRef.current && Math.abs(v) > 0.05) {
          let newTranslateX = currentTranslateXRef.current + v * dt;
          let boundedX = checkBoundary(newTranslateX);
          if (newTranslateX !== boundedX) {
            v = 0;
          }
          currentTranslateXRef.current = boundedX;
          innerSliderRef.current.style.transform = `translateX(${currentTranslateXRef.current}px)`;
          updateSliderEnds();
          v *= 0.92;
          if (Math.abs(v) > 0.05) {
            animationFrameRef.current = requestAnimationFrame(momentumLoop);
          } else {
            animationFrameRef.current = null;
            isDraggingRef.current = false;
          }
        } else {
          animationFrameRef.current = null;
          isDraggingRef.current = false;
        }
      };
      animationFrameRef.current = requestAnimationFrame(momentumLoop);
    } else {
      isDraggingRef.current = false;
    }
  }, [checkBoundary]);
  useEffect(() => {
    const containerElement = sliderContainerRef.current;
    if (!containerElement) return;
    containerElement.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointermove", handlePointerMove);
    return () => {
      containerElement.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointermove", handlePointerMove);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);
  useEffect(() => {
    const sliderContRef = sliderContainerRef.current;
    if (!sliderContRef) {
      return;
    }
    const handleWheel = (e) => {
      let delta = e.deltaX;
      if (e.shiftKey && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        delta = e.deltaY;
      } else if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        return;
      }
      if (innerSliderRef.current.style.left === "") {
        innerSliderRef.current.style.left = "0px";
      }
      const oldPos = currentTranslateXRef.current;
      let newPos = oldPos - delta;
      newPos = checkBoundary(newPos);
      currentTranslateXRef.current = newPos;
      innerSliderRef.current.style.transform = `translateX(${currentTranslateXRef.current}px)`;
      updateSliderEnds();
      e.stopPropagation();
      e.preventDefault();
    };
    sliderContRef.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      if (sliderContRef) {
        sliderContRef.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);
  useEffect(() => {
    const inner = innerSliderRef.current;
    if (inner) {
      inner.addEventListener("focusin", handleFocusIn);
    }
    return () => {
      if (inner) {
        inner.removeEventListener("focusin", handleFocusIn);
      }
    };
  }, [handleFocusIn]);
  return /* @__PURE__ */ jsx("div", { className, children: /* @__PURE__ */ jsxs(
    "div",
    {
      className: "carousel-container " + size,
      tabIndex: "0",
      role: "region",
      "aria-label": "",
      ref: sliderContainerRef,
      children: [
        /* @__PURE__ */ jsx("div", { className: "slider-container gallery-slider", children: /* @__PURE__ */ jsx("div", { className: "inner-slider", ref: innerSliderRef, children: renderContent }) }),
        /* @__PURE__ */ jsx("div", { className: "slider-end-left", ref: sliderEndLeftRef }),
        /* @__PURE__ */ jsx("div", { className: "slider-end-right", ref: sliderEndRightRef })
      ]
    }
  ) });
}
function TileCarousel({ size, title = "", posts = [] }) {
  return (posts == null ? void 0 : posts.length) > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
    title && /* @__PURE__ */ jsx("h2", { children: title }),
    /* @__PURE__ */ jsx(
      CarouselContainer,
      {
        className: "carousel-container-container",
        size,
        isTileCarousel: true,
        children: ({ isDragging, isDraggedPointerUp }) => posts.map(
          (post) => /* @__PURE__ */ jsx("div", { className: "slide", children: /* @__PURE__ */ jsx(
            Tile,
            {
              post,
              isSliderDragging: isDragging,
              isSliderDraggedPointerUp: isDraggedPointerUp
            }
          ) }, post.id)
        )
      }
    )
  ] }) : null;
}
function Home({ heroPosts = [], carouselArchive = [], carouselNews = [], carouselFollowing = [], archivePosts = [] }) {
  const [screenSize, setScreenSize] = useState(getScreenSize());
  useEffect(() => {
    const cleanup = monitorScreenSize(setScreenSize);
    return cleanup;
  }, [setScreenSize]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHead, { title: "home" }),
    /* @__PURE__ */ jsxs("div", { className: "hero", children: [
      /* @__PURE__ */ jsx("h1", { children: "asatte.io" }),
      /* @__PURE__ */ jsx("p", { children: "the premier hub for internet art" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "page-section top-tile-grid", children: /* @__PURE__ */ jsx(
      HeroTilesContainer,
      {
        screenSize,
        category: Category.Archive,
        fetchOrder: FetchOrder.Random,
        initialPosts: heroPosts
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "page-section carousel", children: /* @__PURE__ */ jsx(TileCarousel, { size: "small", title: "newest works:", posts: carouselArchive }) }),
    carouselFollowing && carouselFollowing.length > 0 && /* @__PURE__ */ jsx("div", { className: "page-section carousel", children: /* @__PURE__ */ jsx(TileCarousel, { size: "small", title: "users you follow:", posts: carouselFollowing }) }),
    carouselNews && carouselNews.length > 0 && /* @__PURE__ */ jsx("div", { className: "page-section carousel", children: /* @__PURE__ */ jsx(TileCarousel, { size: "small", title: "netart news:", posts: carouselNews }) }),
    /* @__PURE__ */ jsxs("div", { className: "page-section", children: [
      /* @__PURE__ */ jsx("h2", { className: "big-title centered-content no-margin padded", children: "explore" }),
      /* @__PURE__ */ jsx(
        AutoloadTilesContainer,
        {
          screenSize,
          category: Category.Archive,
          fetchOrder: FetchOrder.Random,
          initialPosts: archivePosts,
          partialProp: "archivePosts"
        }
      )
    ] })
  ] });
}
Home.layout = (page) => /* @__PURE__ */ jsx(Layout, { children: page });
const __vite_glob_0_6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Home
}, Symbol.toStringTag, { value: "Module" }));
function OAuth({ headerText, onClick, originPage, isSubmittingForm, setIsSubmittingForm }) {
  const isLoading = false;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSocialLogin = useCallback((provider) => {
    setIsSubmitting(true);
    setIsSubmittingForm(true);
    const authURI = `/auth/${provider}/redirect?origin_page=${originPage}`;
    window.location.href = authURI;
  }, [originPage, setIsSubmittingForm]);
  useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted) {
        setIsSubmitting(false);
        if (setIsSubmittingForm) {
          setIsSubmittingForm(false);
        }
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [setIsSubmittingForm]);
  return /* @__PURE__ */ jsxs("div", { className: "field-group social-login-options", children: [
    /* @__PURE__ */ jsx("h3", { children: headerText }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        className: "small-text",
        onClick: () => {
          onClick();
          handleSocialLogin("melonland");
        },
        disabled: isSubmitting || isSubmittingForm || isLoading,
        children: [
          /* @__PURE__ */ jsx("div", { className: "buttonContent", children: "melonland" }),
          /* @__PURE__ */ jsx("div", { className: "icon-container", children: /* @__PURE__ */ jsx("img", { src: "https://forum.melonland.net/Themes/pimp-my-classic/images/post/xx.gif", alt: "melonland icon" }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => {
          onClick();
          handleSocialLogin("google");
        },
        disabled: isSubmitting || isSubmittingForm || isLoading,
        children: [
          /* @__PURE__ */ jsx("div", { className: "button-content", children: "google" }),
          /* @__PURE__ */ jsx("div", { className: "icon-container", children: /* @__PURE__ */ jsx("img", { src: "/google.png", alt: "google icon" }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => {
          onClick();
          handleSocialLogin("github");
        },
        disabled: isSubmitting || isSubmittingForm || isLoading,
        children: [
          /* @__PURE__ */ jsx("div", { className: "buttonContent", children: "github" }),
          /* @__PURE__ */ jsx("div", { className: "icon-container", children: /* @__PURE__ */ jsx("img", { src: "/github.png", alt: "github icon" }) })
        ]
      }
    )
  ] });
}
function Login() {
  const { props } = usePage();
  const flash = (props == null ? void 0 : props.flash) || {};
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusError, setStatusError] = useState(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const status = params.get("status");
      if (status === "cancel_success") {
        setStatusMessage("Your registration has been successfully cancelled.");
      } else if (status === "cancel_already_verified") {
        setStatusError("Account is already verified and cannot be cancelled.");
      } else if (status === "invalid_link") {
        setStatusError("Invalid link or account already cancelled.");
      } else if (status === "cancel_error") {
        setStatusError("An unexpected error occurred while cancelling your registration.");
      }
    }
  }, []);
  const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
    login_field: "",
    password: ""
  });
  const canLogInWithEmail = data.login_field && data.password && !processing;
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    post("/login", {
      preserveState: true,
      preserveScroll: true
      // backend will redirect via session logic on success; Inertia handles it
    });
  };
  const handleSocialLoginSubmit = (type) => {
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHead, { title: "Login" }),
    /* @__PURE__ */ jsxs("div", { className: "form-container", children: [
      /* @__PURE__ */ jsx("div", { className: "sub-form-text", children: /* @__PURE__ */ jsxs("p", { children: [
        "New? ",
        /* @__PURE__ */ jsx(Link, { href: "/register", children: "Click here to join." })
      ] }) }),
      /* @__PURE__ */ jsx("h1", { className: "centered-content no-margin", children: "log in" }),
      errors.general && /* @__PURE__ */ jsx("div", { className: "error", children: errors.general }),
      (flash.success || statusMessage) && /* @__PURE__ */ jsx("div", { className: "notice", children: flash.success || statusMessage }),
      (flash.error || statusError) && /* @__PURE__ */ jsx("div", { className: "error", children: flash.error || statusError }),
      /* @__PURE__ */ jsxs("div", { className: "field-groups-container", children: [
        /* @__PURE__ */ jsx("form", { onSubmit: handleLoginSubmit, children: /* @__PURE__ */ jsxs("div", { className: "field-group", children: [
          /* @__PURE__ */ jsx(
            FormField,
            {
              id: "login_field",
              label: "username or e-mail",
              placeholder: "your e-mail or username",
              value: data.login_field,
              onChange: (e) => setData("login_field", e.target.value),
              disabled: processing,
              type: "text",
              classes: "centered-content no-margin vertical-field",
              error: errors.login_field,
              onErrorUpdate: (id, msg) => msg ? setError(id, msg) : clearErrors(id)
            }
          ),
          /* @__PURE__ */ jsx(
            FormField,
            {
              id: "password",
              label: "password",
              placeholder: "your password",
              value: data.password,
              onChange: (e) => setData("password", e.target.value),
              disabled: processing,
              type: "password",
              classes: "centered-content no-margin vertical-field",
              error: errors.password,
              onErrorUpdate: (id, msg) => msg ? setError(id, msg) : clearErrors(id)
            }
          ),
          /* @__PURE__ */ jsx("button", { type: "submit", disabled: !canLogInWithEmail, children: processing ? "logging in..." : "log in" }),
          /* @__PURE__ */ jsx(Link, { href: "/password-recovery", className: "sub-field-link", children: "Forgot your password?" })
        ] }) }),
        /* @__PURE__ */ jsx(
          OAuth,
          {
            headerText: "or continue with:",
            onClick: handleSocialLoginSubmit,
            setError: (msg) => setError("general", msg),
            isSubmittingForm: processing,
            setIsSubmittingForm: () => {
            }
          }
        )
      ] })
    ] })
  ] });
}
Login.layout = (page) => /* @__PURE__ */ jsx(Layout, { children: page });
const __vite_glob_0_7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Login
}, Symbol.toStringTag, { value: "Module" }));
function News({ newsPosts = [] }) {
  const [screenSize, setScreenSize] = useState(getScreenSize());
  useEffect(() => {
    const cleanup = monitorScreenSize(setScreenSize);
    return cleanup;
  }, [setScreenSize]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHead, { title: "news" }),
    /* @__PURE__ */ jsx("div", { className: "centered-content", children: /* @__PURE__ */ jsx("h1", { children: "news" }) }),
    /* @__PURE__ */ jsx(
      AutoloadTilesContainer,
      {
        screenSize,
        category: Category.News,
        fetchOrder: FetchOrder.Descending,
        initialPosts: newsPosts,
        partialProp: "newsPosts"
      }
    )
  ] });
}
News.layout = (page) => /* @__PURE__ */ jsx(Layout, { children: page });
const __vite_glob_0_8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: News
}, Symbol.toStringTag, { value: "Module" }));
function NotFound() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHead, { title: "Not Found" }),
    /* @__PURE__ */ jsx("p", { className: "centered-content top-offset", children: "Page not found. Check your spelling." })
  ] });
}
NotFound.layout = (page) => /* @__PURE__ */ jsx(Layout, { children: page });
const __vite_glob_0_9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: NotFound
}, Symbol.toStringTag, { value: "Module" }));
function OAuthCallback() {
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const userDataString = searchParams.get("user");
    const status = searchParams.get("status");
    const originPage = searchParams.get("origin_page");
    if (accessToken && userDataString) {
      try {
        const user = JSON.parse(userDataString);
        let targetPath;
        let stateMessage;
        if (status === "social_registration_incomplete") {
          targetPath = "/register";
          stateMessage = "Welcome! Please complete your profile.";
        } else if (status === "social_registration_complete") {
          targetPath = "/dashboard";
          stateMessage = "Registration complete. Welcome!";
        } else {
          targetPath = "/dashboard";
          stateMessage = "Successfully logged in.";
        }
        router.visit(targetPath, { replace: true, state: { status, message: stateMessage } });
      } catch (error) {
        console.error("Error processing social user data from popup:", error);
        const errorMessage = getErrorMessage(error);
        router.visit(`/${originPage}`, { replace: true, state: { status, message: errorMessage } });
      }
    } else {
      let errorMessage = "Social login failed. Please try again.";
      if (status === "email_already_registered_social") {
        errorMessage = "An account already exists for this e-mail. Please log in using the same method used at registration.";
      }
      router.visit(`/login`, { replace: true, state: { status, message: errorMessage } });
    }
  }, [searchParams, router]);
  return /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", padding: "50px" }, children: [
    /* @__PURE__ */ jsx(PageHead, { title: "O Auth Callback" }),
    /* @__PURE__ */ jsx("h2", { children: "Processing Social Login..." }),
    /* @__PURE__ */ jsx("p", { children: "Please wait while we log you in." })
  ] });
}
const __vite_glob_0_10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: OAuthCallback
}, Symbol.toStringTag, { value: "Module" }));
function PasswordChange() {
  var _a;
  const { props } = usePage();
  const user = ((_a = props.auth) == null ? void 0 : _a.user) ?? null;
  const isAuthenticated = !!user;
  const [isOldPasswordFieldValid, setIsOldPasswordFieldValid] = useState(false);
  const [isNewPasswordFieldValid, setIsNewPasswordFieldValid] = useState(false);
  const [arePasswordsMatching, setArePasswordsMatching] = useState(false);
  const [success, setSuccess] = useState("");
  const { data, setData, post, processing, errors, setError, clearErrors, reset } = useForm({
    old_password: "",
    new_password: "",
    new_password_confirmation: ""
  });
  const flash = props.flash || {};
  const message = flash.message || "";
  useEffect(() => {
    if (!isAuthenticated) {
      router.visit("/login", { replace: true });
    }
  }, [isAuthenticated]);
  useEffect(() => {
    if (message) {
      setSuccess(message);
    } else {
      setSuccess("");
    }
  }, [message]);
  const canChangePassword = data.old_password && data.new_password && data.new_password_confirmation && isOldPasswordFieldValid && isNewPasswordFieldValid && arePasswordsMatching && !processing;
  const handleOldPasswordFormatValidation = (enteredPassword) => {
    const isSomething = enteredPassword.length > 0;
    if (!isSomething) {
      setError("old_password", "cannot be empty");
    } else {
      clearErrors("old_password");
    }
    setIsOldPasswordFieldValid(isSomething);
    return isSomething;
  };
  const handleNewPasswordFormatValidation = (proposedPassword) => {
    const isValid = isValidPassword(proposedPassword);
    if (!isValid) {
      setError("new_password", "password must contain at least 8 characters, 1 lower-case letter, 1 upper-case letter, and 1 number");
    } else {
      clearErrors("new_password");
    }
    setIsNewPasswordFieldValid(isValid);
    return isValid;
  };
  useEffect(() => {
    if (data.new_password_confirmation === "") return;
    const areMatching = data.new_password === data.new_password_confirmation;
    setArePasswordsMatching(areMatching);
    if (!areMatching) {
      setError("new_password_confirmation", "Password and confirmation do not match.");
    } else {
      clearErrors("new_password_confirmation");
    }
  }, [data.new_password, data.new_password_confirmation]);
  const handlePasswordChangeSubmit = (e) => {
    e.preventDefault();
    setSuccess("");
    post("/change-password", {
      preserveScroll: true,
      preserveState: true
    });
  };
  if (!user) return null;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHead, { title: "Password Change" }),
    user.is_email_verified && user.login_type === "email" ? /* @__PURE__ */ jsxs("div", { className: "form-container limited-width", children: [
      /* @__PURE__ */ jsx("h1", { className: "centered-content", children: "change password" }),
      errors.general && /* @__PURE__ */ jsx("div", { className: "error", children: errors.general }),
      success && /* @__PURE__ */ jsx("div", { className: "notice", children: success }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handlePasswordChangeSubmit, children: [
        /* @__PURE__ */ jsx(
          FormField,
          {
            id: "old_password",
            placeholder: "your current password",
            label: "old password",
            value: data.old_password,
            onChange: (e) => setData("old_password", e.target.value),
            onValidate: handleOldPasswordFormatValidation,
            disabled: processing,
            type: "password",
            error: errors.old_password,
            onErrorUpdate: (id, msg) => msg ? setError(id, msg) : clearErrors(id)
          }
        ),
        /* @__PURE__ */ jsx(
          FormField,
          {
            id: "new_password",
            placeholder: "requires: a-z, A-Z, and 0-9",
            label: "new password",
            value: data.new_password,
            onChange: (e) => setData("new_password", e.target.value),
            onValidate: handleNewPasswordFormatValidation,
            disabled: processing,
            type: "password",
            error: errors.new_password,
            onErrorUpdate: (id, msg) => msg ? setError(id, msg) : clearErrors(id)
          }
        ),
        /* @__PURE__ */ jsx(
          FormField,
          {
            id: "new_password_confirmation",
            label: "confirm new password",
            placeholder: "same as above",
            value: data.new_password_confirmation,
            onChange: (e) => setData("new_password_confirmation", e.target.value.trimEnd()),
            disabled: processing,
            type: "password",
            error: errors.new_password_confirmation
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "horizontal-buttons-container", children: [
          /* @__PURE__ */ jsx("button", { type: "submit", disabled: !canChangePassword, children: processing ? "updating password..." : "update" }),
          /* @__PURE__ */ jsx(Link, { href: "/dashboard", className: "link-button", children: "back" })
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsx("div", { className: "notice centered-content", children: /* @__PURE__ */ jsxs("p", { children: [
      "You cannot change your password as your login type is ",
      /* @__PURE__ */ jsx("em", { className: "bold", children: user == null ? void 0 : user.login_type })
    ] }) })
  ] });
}
PasswordChange.layout = (page) => /* @__PURE__ */ jsx(Layout, { children: page });
const __vite_glob_0_11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: PasswordChange
}, Symbol.toStringTag, { value: "Module" }));
function PasswordRecovery() {
  const { props } = usePage();
  const flash = (props == null ? void 0 : props.flash) || {};
  const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
    login_field: ""
  });
  const canSubmit = data.login_field && !processing;
  const handleRecoverySubmit = (e) => {
    e.preventDefault();
    post("/request-recovery", {
      preserveState: true,
      preserveScroll: true
    });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHead, { title: "Password Recovery" }),
    /* @__PURE__ */ jsxs("div", { className: "form-container limited-width", children: [
      /* @__PURE__ */ jsx("h1", { className: "centered-content no-margin", children: "account recovery" }),
      /* @__PURE__ */ jsx("p", { className: "centered-content no-margin", children: "Enter your email or username. We’ll send you a link to recover your account." }),
      errors.general && /* @__PURE__ */ jsx("div", { className: "error", children: errors.general }),
      flash.success && /* @__PURE__ */ jsx("div", { className: "notice", children: flash.success }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleRecoverySubmit, children: [
        /* @__PURE__ */ jsx(
          FormField,
          {
            id: "login_field",
            placeholder: "your e-mail or username",
            value: data.login_field,
            onChange: (e) => setData("login_field", e.target.value),
            disabled: processing,
            type: "text",
            classes: "centered-content",
            error: errors.login_field,
            onErrorUpdate: (id, msg) => msg ? setError(id, msg) : clearErrors(id)
          }
        ),
        /* @__PURE__ */ jsx("button", { type: "submit", disabled: !canSubmit, children: processing ? "sending..." : "send e-mail" })
      ] })
    ] })
  ] });
}
PasswordRecovery.layout = (page) => /* @__PURE__ */ jsx(Layout, { children: page });
const __vite_glob_0_12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: PasswordRecovery
}, Symbol.toStringTag, { value: "Module" }));
function PasswordReset() {
  const { props } = usePage();
  const flash = (props == null ? void 0 : props.flash) || {};
  const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
    email: "",
    token: "",
    password: "",
    password_confirmation: ""
  });
  const [localError, setLocalError] = useState("");
  const [formDisabled, setFormDisabled] = useState(false);
  const [isPasswordFieldValid, setIsPasswordFieldValid] = useState(false);
  const [arePasswordsMatching, setArePasswordsMatching] = useState(false);
  const canReset = data.email && data.token && data.password && data.password_confirmation && isPasswordFieldValid && arePasswordsMatching && !processing;
  const handlePasswordFormatValidation = (proposedPassword, setFieldLocalError) => {
    const isValid = isValidPassword(proposedPassword);
    if (!isValid) {
      setFieldLocalError("password must contain at least 8 characters, 1 lower-case letter, 1 upper-case letter, and 1 number");
    } else {
      setFieldLocalError("");
    }
    setIsPasswordFieldValid(isValid);
    return isValid;
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get("email");
      const tokenParam = params.get("token");
      if (!emailParam || !tokenParam) {
        setLocalError("Invalid or missing password reset link. Please request a new one.");
        setFormDisabled(true);
      } else {
        setData({
          ...data,
          email: emailParam,
          token: tokenParam
        });
        setLocalError("");
        setFormDisabled(false);
      }
    }
  }, []);
  useEffect(() => {
    if (data.password_confirmation === "") {
      return;
    }
    const areMatching = data.password === data.password_confirmation;
    setArePasswordsMatching(areMatching);
    if (!areMatching) {
      setLocalError("Password and confirmation do not match.");
    } else {
      setLocalError("");
    }
  }, [data.password, data.password_confirmation]);
  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError("");
    post("/reset-password", {
      preserveState: true,
      preserveScroll: true
    });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHead, { title: "Password Reset" }),
    /* @__PURE__ */ jsxs("div", { className: "form-container limited-width", children: [
      /* @__PURE__ */ jsx("h1", { className: "centered-content", children: "set new password" }),
      localError && /* @__PURE__ */ jsx("div", { className: "error", children: localError }),
      errors.general && /* @__PURE__ */ jsx("div", { className: "error", children: errors.general }),
      errors.email && /* @__PURE__ */ jsx("div", { className: "error", children: errors.email }),
      flash.success && /* @__PURE__ */ jsx("div", { className: "notice", children: flash.success }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsx(
          FormField,
          {
            id: "password",
            label: "choose a new password",
            placeholder: "requires: a-z, A-Z, and 0-9",
            value: data.password,
            onChange: (e) => setData("password", e.target.value.trimEnd()),
            onValidate: handlePasswordFormatValidation,
            disabled: formDisabled || processing,
            type: "password",
            classes: "centered-content vertical-field",
            error: errors.password,
            onErrorUpdate: (id, msg) => msg ? setError(id, msg) : clearErrors(id)
          }
        ),
        /* @__PURE__ */ jsx(
          FormField,
          {
            id: "password_confirmation",
            label: "confirm password",
            placeholder: "",
            value: data.password_confirmation,
            onChange: (e) => setData("password_confirmation", e.target.value.trimEnd()),
            disabled: formDisabled || processing,
            type: "password",
            classes: "centered-content vertical-field"
          }
        ),
        /* @__PURE__ */ jsx("button", { type: "submit", disabled: !canReset || formDisabled || processing, children: processing ? "resetting..." : "reset password" })
      ] })
    ] })
  ] });
}
PasswordReset.layout = (page) => /* @__PURE__ */ jsx(Layout, { children: page });
const __vite_glob_0_13 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: PasswordReset
}, Symbol.toStringTag, { value: "Module" }));
function ImageCarousel({ size, post, title = "" }) {
  const { props } = usePage();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const slideRefs = useRef([]);
  const IMAGE_ROOT = `${props.app_url}/storage/images/uploaded/users/${post.user.username}/posts/${post.post_url}/gallery`;
  slideRefs.current = [];
  const imageUrls = useMemo(() => {
    try {
      return (post == null ? void 0 : post.gallery_image_urls) ?? [];
    } catch {
      return [];
    }
  }, [post]);
  function handleClick(e) {
    setIsZoomed((prev) => !prev);
  }
  return /* @__PURE__ */ jsx(Fragment, { children: (imageUrls == null ? void 0 : imageUrls.map) && /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("h2", { children: title }),
    /* @__PURE__ */ jsx(
      CarouselContainer,
      {
        className: "carousel-container-container image-carousel",
        size,
        children: ({ isDragging, isDraggedPointerUp, handleFocusIn }) => imageUrls.map((url, i) => /* @__PURE__ */ jsx(
          "div",
          {
            className: "slide",
            ref: (el) => slideRefs.current[i] = el,
            tabIndex: "0",
            onFocus: () => setCurrentSlideIndex(i),
            onClick: (e) => {
              if (isDragging.current || isDraggedPointerUp.current) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              setCurrentSlideIndex(i);
              handleClick();
            },
            onKeyDown: (e) => {
              var _a, _b;
              if (e.key === "Enter") {
                e.preventDefault();
                setCurrentSlideIndex(i);
                handleClick();
                return;
              }
              if (e.key === "Escape") {
                if (isZoomed) {
                  handleClick();
                }
                return;
              }
              if (e.key === "ArrowLeft") {
                const newInd = Math.max(0, currentSlideIndex - 1);
                setCurrentSlideIndex(newInd);
                (_a = slideRefs.current[newInd]) == null ? void 0 : _a.focus();
                handleFocusIn();
                return;
              }
              if (e.key === "ArrowRight") {
                const newInd = Math.min(imageUrls.length - 1, currentSlideIndex + 1);
                setCurrentSlideIndex(newInd);
                (_b = slideRefs.current[newInd]) == null ? void 0 : _b.focus();
                handleFocusIn();
                return;
              }
            },
            children: /* @__PURE__ */ jsx(
              "img",
              {
                src: `${IMAGE_ROOT}/small/${url}`,
                alt: post.gallery_alts[i],
                draggable: "false"
              }
            )
          },
          i
        ))
      }
    ),
    /* @__PURE__ */ jsx(
      ImageZoom,
      {
        src: isZoomed ? `${IMAGE_ROOT}/large/${imageUrls[currentSlideIndex]}` : null,
        smallSrc: isZoomed ? `${IMAGE_ROOT}/small/${imageUrls[currentSlideIndex]}` : null,
        nextSrc: isZoomed && currentSlideIndex < imageUrls.length - 1 ? `${IMAGE_ROOT}/large/${imageUrls[currentSlideIndex + 1]}` : null,
        nextSmallSrc: isZoomed && currentSlideIndex < imageUrls.length - 1 ? `${IMAGE_ROOT}/small/${imageUrls[currentSlideIndex + 1]}` : null,
        prevSrc: isZoomed && currentSlideIndex > 0 ? `${IMAGE_ROOT}/large/${imageUrls[currentSlideIndex - 1]}` : null,
        prevSmallSrc: isZoomed && currentSlideIndex > 0 ? `${IMAGE_ROOT}/small/${imageUrls[currentSlideIndex - 1]}` : null,
        onNavigateNext: () => {
          var _a;
          const newInd = Math.min(imageUrls.length - 1, currentSlideIndex + 1);
          setCurrentSlideIndex(newInd);
          (_a = slideRefs.current[newInd]) == null ? void 0 : _a.focus();
        },
        onNavigatePrev: () => {
          var _a;
          const newInd = Math.max(0, currentSlideIndex - 1);
          setCurrentSlideIndex(newInd);
          (_a = slideRefs.current[newInd]) == null ? void 0 : _a.focus();
        },
        alt: post == null ? void 0 : post.gallery_alts[currentSlideIndex],
        clickFunc: handleClick,
        isZoomed
      }
    )
  ] }) });
}
function Comment({ comment, isDashboard = false, onReply = null, id, parentLocalId = null, currentUrl = null }) {
  var _a, _b, _c;
  const user = (_a = usePage().props.auth) == null ? void 0 : _a.user;
  if (!comment) return null;
  const isAuthenticated = !!user;
  const [isEditing, setIsEditing] = useState(false);
  const { data, setData, put: submitUpdate, delete: submitDelete, processing, errors, clearErrors } = useForm({
    content: comment.content
  });
  const elementId = `comment-${id}`;
  const parentElementId = parentLocalId ? `comment-${parentLocalId}` : null;
  const handleCommentEdit = useCallback(() => {
    setIsEditing(true);
    setData("content", comment.content);
    clearErrors();
  }, [setIsEditing, setData, comment, clearErrors]);
  const handleEditCancel = useCallback(() => {
    const isConfirmed = window.confirm("Revert changes?");
    if (!isConfirmed) return;
    setIsEditing(false);
    setData("content", comment.content);
  }, [setIsEditing, setData, comment]);
  const handleCommentUpdate = useCallback(() => {
    submitUpdate(`/posts/${comment.post_id}/comments/${comment.id}`, {
      preserveScroll: true,
      onSuccess: () => setIsEditing(false)
    });
  }, [submitUpdate, comment]);
  const handleCommentDelete = useCallback(() => {
    const isConfirmed = window.confirm("Delete comment?");
    if (!isConfirmed) return;
    submitDelete(`/posts/${comment.post_id}/comments/${comment.id}`, {
      preserveScroll: true
    });
  }, [submitDelete, comment]);
  return /* @__PURE__ */ jsxs("div", { className: "comment", id: elementId, children: [
    /* @__PURE__ */ jsx("p", { children: isDashboard && comment.post ? /* @__PURE__ */ jsxs(Fragment, { children: [
      "in ",
      /* @__PURE__ */ jsx(
        Link,
        {
          href: getPostUrl(comment.post),
          className: "bold",
          children: comment.post.title
        }
      ),
      " ",
      /* @__PURE__ */ jsxs("em", { children: [
        "on ",
        getDateAsYYYYMMDD(comment.created_at),
        /* @__PURE__ */ jsxs("span", { className: "notice small", children: [
          " at ",
          getTimeAsHHMM(comment.created_at)
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(UserLink, { user: comment.user }),
      " ",
      /* @__PURE__ */ jsxs("em", { children: [
        "on ",
        getDateAsYYYYMMDD(comment.created_at),
        /* @__PURE__ */ jsxs("span", { className: "notice small", children: [
          " at ",
          getTimeAsHHMM(comment.created_at)
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "comment-notice-container", children: [
      !isDashboard && comment.created_at !== comment.updated_at && /* @__PURE__ */ jsx("span", { className: "notice small greyed-out", children: "(edited)" }),
      comment.parent_id && parentLocalId != null && currentUrl ? /* @__PURE__ */ jsxs("span", { className: "notice small", children: [
        " replied to ",
        /* @__PURE__ */ jsx(
          "a",
          {
            href: `${currentUrl}/comment-${parentLocalId}`,
            onClick: (e) => {
              e.preventDefault();
              scrollToElement(currentUrl, parentElementId);
            },
            children: "this"
          }
        ),
        " comment"
      ] }) : null,
      isDashboard && comment.post && comment.post.user && //post is only included when using fetchUserComments
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: `${getPostUrl(comment.post)}?comment_id=${comment.id}`,
          className: "notice small",
          children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-up-right-from-square" }),
            " go to comment"
          ]
        }
      )
    ] }),
    isEditing ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "textarea",
        {
          name: `comment-edit-${id}`,
          id: `comment-edit-${id}`,
          className: "comment-edit-area",
          onChange: (e) => setData("content", e.target.value),
          value: data.content,
          disabled: processing
        }
      ),
      errors.content && /* @__PURE__ */ jsx("div", { className: "error", children: errors.content })
    ] }) : /* @__PURE__ */ jsx(
      "p",
      {
        className: "comment-text",
        dangerouslySetInnerHTML: { __html: sanitizeRichHtml(comment.content_html) }
      }
    ),
    isAuthenticated && /* @__PURE__ */ jsxs("div", { className: "comment-buttons-container", children: [
      !isEditing && onReply && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onReply(comment, elementId, true),
            className: "small-button",
            title: "quote reply",
            disabled: processing,
            children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-quote-left" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onReply(comment, elementId),
            className: "small-button",
            title: "reply",
            disabled: processing,
            children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-reply" })
          }
        )
      ] }),
      !isDashboard && (user == null ? void 0 : user.id) === ((_b = comment == null ? void 0 : comment.user) == null ? void 0 : _b.id) && /* @__PURE__ */ jsx(Fragment, { children: isEditing ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "small-button",
            onClick: handleCommentUpdate,
            title: "save",
            disabled: processing || !data.content,
            children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-floppy-disk" })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "small-button",
            onClick: handleEditCancel,
            title: "cancel",
            disabled: processing,
            children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-rotate-left" })
          }
        )
      ] }) : /* @__PURE__ */ jsx(
        EditButton,
        {
          className: "small-button",
          onClick: handleCommentEdit,
          disabled: processing
        }
      ) }),
      !isDashboard && ((user == null ? void 0 : user.id) === ((_c = comment == null ? void 0 : comment.user) == null ? void 0 : _c.id) || (user == null ? void 0 : user.member_type) == MemberType.Admin || (user == null ? void 0 : user.member_type) == MemberType.Webmaster) && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleCommentDelete,
          className: "small-button",
          title: "delete",
          disabled: processing,
          children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-trash" })
        }
      )
    ] })
  ] });
}
function CommentSection({ post, likeCount }) {
  var _a, _b;
  const [originalComment, setOriginalComment] = useState(null);
  const [originalCommentElement, setOriginalCommentElement] = useState(null);
  const [quoteText, setQuoteText] = useState("");
  const textAreaRef = useRef(null);
  const { data, setData, post: submitComment, processing, reset, errors, clearErrors } = useForm({
    content: "",
    parent_id: null
  });
  const user = (_a = usePage().props.auth) == null ? void 0 : _a.user;
  const isAuthenticated = !!user;
  const page = usePage();
  const success = (_b = page.props.flash) == null ? void 0 : _b.success;
  const comments = post.comments || [];
  const parsed = typeof window !== "undefined" ? new URL(page.url || window.location.href, window.location.origin) : new URL(page.url, page.props.app_url || "http://localhost");
  const currentUrl = `${parsed.origin}${parsed.pathname}${parsed.search}`;
  const queryParams = new URLSearchParams(parsed.search);
  const commentId = queryParams.get("comment_id");
  useEffect(() => {
    var _a2;
    if (!commentId || !comments.length) return;
    const index = comments.findIndex((c) => c.id === Number(commentId));
    if (index === -1) return;
    (_a2 = document.getElementById(`comment-${index}`)) == null ? void 0 : _a2.scrollIntoView();
    const params = new URLSearchParams(parsed.search);
    params.delete("comment_id");
    window.history.replaceState(
      null,
      "",
      `${parsed.pathname}?${params.toString()}#comment-${index}`
    );
  }, [commentId, comments]);
  const handleCommentSubmit = useCallback((e) => {
    e.preventDefault();
    if (!post) return;
    submitComment(`/posts/${post.id}/comments`, {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        setOriginalComment(null);
        setOriginalCommentElement(null);
      }
    });
  }, [data, post.id]);
  const handleReply = useCallback((comment, elementId, isQuote = false) => {
    clearErrors();
    setOriginalComment(comment);
    setOriginalCommentElement(elementId);
    setData("parent_id", comment.id);
    setData((prevData) => {
      let newText = prevData.content || "";
      if (quoteText) {
        newText = newText.replace(quoteText, "");
      }
      if (isQuote) {
        let formattedOriginal = "@" + comment.user.username + " wrote:\n";
        formattedOriginal += comment.content.split("\n").map((line) => `> ${line}`).join("\n") + "\n\n";
        setQuoteText(formattedOriginal);
        newText = formattedOriginal + newText;
      } else {
        setQuoteText(null);
      }
      return { ...prevData, content: newText };
    });
    const el = document.getElementById("leave-comment-container");
    if (el) {
      const rect = el.getBoundingClientRect();
      const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight;
      if (!isInView) {
        scrollToElement(currentUrl, "leave-comment-container", false);
      }
      textAreaRef.current.focus();
    }
  }, [setOriginalComment, setOriginalCommentElement, quoteText, setQuoteText]);
  const handleReplyCancel = useCallback((e) => {
    e.preventDefault();
    setOriginalComment(null);
    setOriginalCommentElement(null);
    setData("parent_id", null);
  }, [setOriginalComment, setOriginalCommentElement]);
  return (post || comments) && /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "icons-leave-comment-container", children: [
      /* @__PURE__ */ jsxs("div", { className: "icon-group", children: [
        /* @__PURE__ */ jsxs("div", { className: "icon", children: [
          /* @__PURE__ */ jsx("i", { className: "fa-regular fa-eye" }),
          /* @__PURE__ */ jsxs("span", { className: "metric-number", children: [
            " ",
            post.view_count
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "icon", children: [
          /* @__PURE__ */ jsx("i", { className: "fa-regular fa-comment" }),
          /* @__PURE__ */ jsxs("span", { className: "metric-number", children: [
            " ",
            comments.length
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "icon", children: [
          /* @__PURE__ */ jsx("i", { className: "fa-regular fa-star" }),
          /* @__PURE__ */ jsxs("span", { className: "metric-number", children: [
            " ",
            likeCount
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "leave-comment-container", id: "leave-comment-container", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleCommentSubmit, children: [
        /* @__PURE__ */ jsxs("div", { className: "header-button-container", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: isAuthenticated ? "" : "greyed-out", children: "leave a comment" }),
            errors.content && /* @__PURE__ */ jsx("div", { className: "error", children: errors.content }),
            success && /* @__PURE__ */ jsx("div", { className: "notice", children: success }),
            !isAuthenticated && /* @__PURE__ */ jsxs("div", { className: "notice", children: [
              /* @__PURE__ */ jsx(Link, { href: "/login", children: "Log in" }),
              " or ",
              /* @__PURE__ */ jsx(Link, { href: "/register", children: "register" }),
              " to comment."
            ] }),
            originalCommentElement != null && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "notice thin", children: /* @__PURE__ */ jsxs(
                "a",
                {
                  href: `${currentUrl}/${originalCommentElement}`,
                  onClick: (e) => {
                    e.preventDefault();
                    scrollToElement(currentUrl, originalCommentElement);
                  },
                  children: [
                    "replying to ",
                    originalComment.user.username
                  ]
                }
              ) }),
              " ",
              /* @__PURE__ */ jsx("span", { className: "error thin", children: /* @__PURE__ */ jsx(
                "a",
                {
                  href: "#",
                  onClick: handleReplyCancel,
                  children: "cancel"
                }
              ) })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "button-container", children: /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: processing || !data.content,
              children: "submit"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            name: "comment",
            id: "comment",
            onChange: (e) => setData("content", e.target.value),
            value: data.content,
            disabled: !isAuthenticated,
            ref: textAreaRef
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "comments-container", children: [
      /* @__PURE__ */ jsx("h2", { children: "comments:" }),
      comments && comments.map((comment, i) => {
        let parentElement = comments.findIndex((c) => c.id === comment.parent_id);
        parentElement = parentElement === -1 ? null : parentElement;
        return /* @__PURE__ */ jsx(
          Comment,
          {
            comment,
            id: i,
            onReply: handleReply,
            parentLocalId: parentElement,
            currentUrl
          },
          i
        );
      })
    ] })
  ] });
}
function VideoIframe({ url }) {
  return /* @__PURE__ */ jsx("div", { className: "iframe-container-container", children: /* @__PURE__ */ jsxs("div", { className: "iframe-container", children: [
    /* @__PURE__ */ jsx(
      "iframe",
      {
        title: "video preview",
        loading: "lazy",
        allow: "accelerometer; fullscreen; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        src: url
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "iframe-text", children: "video preview" })
  ] }) });
}
function HiddenPostNotice({ classes, isAdmin = false }) {
  const classNames = "red-gradient-background main-info-box centered-content " + classes;
  return /* @__PURE__ */ jsxs("div", { className: classNames, children: [
    /* @__PURE__ */ jsx("h3", { children: "Post has been hidden by an admin." }),
    !isAdmin && /* @__PURE__ */ jsxs("p", { children: [
      "To contest this, please reply to the message in your ",
      /* @__PURE__ */ jsx(Link, { href: "/dashboard/mail", children: "mailbox" }),
      " or use the ",
      /* @__PURE__ */ jsx(Link, { href: "/contact", children: "contact form" }),
      "."
    ] })
  ] });
}
function Post({ post, carouselPosts: userPosts = [] }) {
  var _a;
  const { props } = usePage();
  const appUrl = props.app_url;
  const isLiked = !!(post == null ? void 0 : post.have_liked);
  const likeCount = (post == null ? void 0 : post.users_who_liked_count) || 0;
  const [adminMessageIsVisible, setAdminMessageIsVisible] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminSuccess, setAdminSuccess] = useState("");
  const [adminError, setAdminError] = useState("");
  const user = (_a = props.auth) == null ? void 0 : _a.user;
  const isAuthenticated = !!user;
  const isAdmin = (user == null ? void 0 : user.member_type) == MemberType.Webmaster || (user == null ? void 0 : user.member_type) == MemberType.Admin;
  useEffect(() => {
    if (!post) return;
    router.post(`/posts/${post.id}/record-view`, {}, {
      preserveScroll: true,
      preserveState: true,
      replace: true
    });
  }, [post.id]);
  const imageUrls = useMemo(() => {
    try {
      return (post == null ? void 0 : post.gallery_image_urls) ?? [];
    } catch (err) {
      getErrorMessage(err);
      return [];
    }
  }, [post]);
  const mainImg = `${appUrl}/storage/images/uploaded/users/${post.user.username}/posts/${post.post_url}/gallery/large/${imageUrls[0]}`;
  const mainAlt = (post == null ? void 0 : post.gallery_alts[0]) ?? "";
  const videoUrl = useMemo(() => {
    try {
      return (post == null ? void 0 : post.main_video) ?? null;
    } catch (err) {
      getErrorMessage(err);
      return [];
    }
  }, [post]);
  const handleLikeToggle = useCallback(() => {
    if (!post) return;
    router.post(`/posts/${post.id}/like`, {}, {
      preserveScroll: true,
      preserveState: true
    });
  }, [post.id]);
  const handleHideSubmit = useCallback(async (e, hide) => {
    e.preventDefault();
    setAdminSuccess("");
    setAdminError("");
    if (!hide) {
      const isConfirmed = window.confirm("Make post visible?");
      if (!isConfirmed) return;
    }
    setIsSubmitting(true);
    try {
      router.post(
        `/set-admin-hide/${post.id}`,
        {
          _method: "PUT",
          is_hidden_by_admin: hide,
          reason: adminMessage
        },
        {
          preserveScroll: true,
          preserveState: true,
          onSuccess: () => {
            setAdminMessage("");
            setAdminMessageIsVisible(false);
            setIsSubmitting(false);
            setAdminSuccess(hide ? "Post successfully hidden." : "Post successfully unhidden.");
          },
          onError: (errs) => {
            setIsSubmitting(false);
            if (errs && errs.error) setAdminError(errs.error);
            else setAdminError("An error occurred.");
          }
        }
      );
    } catch (err) {
      setIsSubmitting(false);
    }
  }, [adminMessage, post.id]);
  const handleHideClick = useCallback(() => {
    setAdminMessage("Not Internet-related.");
    setAdminMessageIsVisible(true);
  }, []);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      PageHead,
      {
        title: `${post.title} by ${post.user.username}`,
        description: post.subtitle,
        ogType: "article",
        ogImg: mainImg
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "post", children: post ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("article", { children: [
        /* @__PURE__ */ jsxs("div", { className: "image-info-statement-container", children: [
          post.is_hidden_by_admin && /* @__PURE__ */ jsx(
            HiddenPostNotice,
            {
              classes: "top-3rem",
              isAdmin: true
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "image-info-container", children: [
            /* @__PURE__ */ jsx("div", { className: "main-image-container", children: /* @__PURE__ */ jsxs("div", { className: "image-link-subcontainer", children: [
              /* @__PURE__ */ jsx("img", { className: "main-image", src: mainImg, alt: mainAlt }),
              /* @__PURE__ */ jsx("div", { className: "main-image-link-container", children: /* @__PURE__ */ jsxs("div", { className: "info-panel", children: [
                (post == null ? void 0 : post.is_private) || (post == null ? void 0 : post.is_draft) ? /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "big-icon blue",
                    title: (post == null ? void 0 : post.is_private) ? "private" : "draft",
                    children: /* @__PURE__ */ jsx("i", { className: (post == null ? void 0 : post.is_private) ? "fa-regular fa-eye-slash" : "fa-solid fa-file-pen" })
                  }
                ) : isAuthenticated && /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: isLiked ? "like-button liked" : "like-button",
                    onClick: handleLikeToggle,
                    "aria-label": "Toggle Like",
                    "aria-pressed": isLiked,
                    children: /* @__PURE__ */ jsx("i", { className: isLiked ? "fa-solid fa-star" : "fa-regular fa-star" })
                  }
                ),
                post.website ? /* @__PURE__ */ jsx("div", { className: "info-item action-links link-container", children: /* @__PURE__ */ jsxs(
                  "a",
                  {
                    className: "post-link",
                    href: post.website,
                    onClick: (e) => {
                      e.preventDefault();
                      openPopup(
                        post.website,
                        `${post.id} : ${post.title}`,
                        window.screen.width * 0.2,
                        window.screen.height * 0.2,
                        window.screen.width * 0.8,
                        window.screen.height * 0.8
                      );
                    },
                    children: [
                      /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-up-right-from-square" }),
                      /* @__PURE__ */ jsx("span", { children: "visit site" })
                    ]
                  }
                ) }) : /* @__PURE__ */ jsx(Fragment, {})
              ] }) })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "page-section main-info-container top-version", children: /* @__PURE__ */ jsxs("div", { className: "main-info-box", children: [
              /* @__PURE__ */ jsx("div", { className: "centered-content", children: /* @__PURE__ */ jsx("h1", { children: post.title }) }),
              /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("em", { children: post.subtitle }) }) }),
              /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("p", { className: "post-date", children: [
                " posted by ",
                /* @__PURE__ */ jsx(UserLink, { user: post.user }),
                " ",
                /* @__PURE__ */ jsxs("em", { children: [
                  "on ",
                  getDateAsYYYYMMDD(post.created_at)
                ] })
              ] }) }),
              post.premiere_date && /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("p", { className: "post-date", children: /* @__PURE__ */ jsxs("em", { children: [
                "premiered on ",
                getDateAsYYYYMMDD(post.premiere_date)
              ] }) }) }),
              post.source_code && /* @__PURE__ */ jsx("div", { className: "source-link", children: /* @__PURE__ */ jsxs("a", { href: post.source_code, target: "_blank", children: [
                /* @__PURE__ */ jsx("i", { className: "fa-solid fa-code" }),
                /* @__PURE__ */ jsx("span", { children: "source" })
              ] }) })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "main-info-statement-container", children: [
            /* @__PURE__ */ jsx("div", { className: "page-section main-info-container sticky-version", children: /* @__PURE__ */ jsxs("div", { className: "main-info-box", children: [
              /* @__PURE__ */ jsx("div", { className: "centered-content no-margin", children: /* @__PURE__ */ jsx("h1", { children: post.title }) }),
              /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("em", { children: post.subtitle }) }) }),
              /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("p", { className: "post-date", children: [
                " posted by ",
                /* @__PURE__ */ jsx(UserLink, { user: post.user }),
                " on 2025.5.12"
              ] }) }),
              post.premiere_date && /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("p", { className: "post-date", children: /* @__PURE__ */ jsxs("em", { children: [
                "premiered on ",
                getDateAsYYYYMMDD(post.premiere_date)
              ] }) }) }),
              post.source_code && /* @__PURE__ */ jsx("div", { className: "source-link", children: /* @__PURE__ */ jsxs("a", { href: post.source_code, target: "_blank", children: [
                /* @__PURE__ */ jsx("i", { className: "fa-solid fa-code" }),
                /* @__PURE__ */ jsx("span", { children: "source" })
              ] }) })
            ] }) }),
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "page-section statement rte-container article-text",
                dangerouslySetInnerHTML: { __html: sanitizeRichHtml(hydrateEditorImagePaths(post.statement, appUrl)) }
              }
            )
          ] })
        ] }),
        videoUrl && /* @__PURE__ */ jsx("div", { className: "page-section video", children: /* @__PURE__ */ jsx(VideoIframe, { url: videoUrl }) }),
        /* @__PURE__ */ jsx("div", { className: "page-section carousel", children: /* @__PURE__ */ jsx(ImageCarousel, { size: "small", post, title: "gallery:" }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "page-section comment-section", children: /* @__PURE__ */ jsx(CommentSection, { post, likeCount }) }),
      isAdmin && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("h3", { className: "centered-content", children: "admin:" }),
        /* @__PURE__ */ jsxs(Fragment, { children: [
          adminError && /* @__PURE__ */ jsx("div", { className: "error", children: adminError }),
          adminSuccess && /* @__PURE__ */ jsx("div", { className: "notice", children: adminSuccess }),
          post.is_hidden_by_admin ? /* @__PURE__ */ jsx("div", { className: "centered-content", children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: (e) => handleHideSubmit(e, false),
              className: "red-button",
              children: "unhide post"
            }
          ) }) : /* @__PURE__ */ jsx("div", { className: "centered-content", children: !adminMessageIsVisible ? /* @__PURE__ */ jsx(
            "button",
            {
              className: "red-button",
              onClick: handleHideClick,
              children: "hide post"
            }
          ) : /* @__PURE__ */ jsxs("form", { onSubmit: (e) => handleHideSubmit(e, true), children: [
            /* @__PURE__ */ jsx("div", { className: "notice", children: /* @__PURE__ */ jsx("em", { children: "Let the user know why you're hiding their post." }) }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                required: true,
                className: "w-100",
                style: { minHeight: "100px", padding: "10px" },
                disabled: isSubmitting,
                onChange: (e) => setAdminMessage(e.target.value),
                value: adminMessage
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "horizontal-buttons-container", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "red-button",
                  type: "submit",
                  children: "confirm"
                }
              ),
              /* @__PURE__ */ jsx("button", { onClick: () => setAdminMessageIsVisible(false), children: "cancel" })
            ] })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: post.is_news ? "page-section carousel" : "page-section carousel small-heading", children: /* @__PURE__ */ jsx(
        TileCarousel,
        {
          size: "small",
          title: post.is_news ? "more news:" : `more from ${post.user.username}:`,
          posts: userPosts
        }
      ) })
    ] }) : /* @__PURE__ */ jsx("p", { className: "loading", children: "loading post..." }) })
  ] });
}
Post.layout = (page) => /* @__PURE__ */ jsx(Layout, { children: page });
const __vite_glob_0_14 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Post
}, Symbol.toStringTag, { value: "Module" }));
function Posts({ username, archivePosts }) {
  const [screenSize, setScreenSize] = useState(getScreenSize());
  useEffect(() => {
    const cleanup = monitorScreenSize(setScreenSize);
    return cleanup;
  }, [setScreenSize]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHead, { title: "Posts" }),
    /* @__PURE__ */ jsx("h2", { className: "centered-content padded-responsive", children: `${username}'s posts` }),
    /* @__PURE__ */ jsx(
      AutoloadTilesContainer,
      {
        screenSize,
        isDashboard: false,
        username,
        fetchOrder: FetchOrder.Descending,
        initialPosts: archivePosts,
        partialProp: "archivePosts"
      }
    )
  ] });
}
Posts.layout = (page) => /* @__PURE__ */ jsx(Layout, { children: page });
const __vite_glob_0_15 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Posts
}, Symbol.toStringTag, { value: "Module" }));
function UserAgreement({
  onAgreeChange,
  onHumanChange,
  onRobotChange,
  agreeVal,
  isSocialLogin = false,
  humanVal,
  robotVal,
  isSubmitting
}) {
  const { props } = usePage();
  const APP_NAME = props.app_name;
  const AGREEMENT_VERSION = props.app_user_agreement_version;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "user-agreement article-text", children: [
      /* @__PURE__ */ jsx("div", { className: "centered-content vert-1rem", children: /* @__PURE__ */ jsx("h2", { children: "user agreement" }) }),
      /* @__PURE__ */ jsxs("div", { className: "footnote bottom-1rem", children: [
        "version ",
        AGREEMENT_VERSION
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        "As a member of ",
        APP_NAME,
        ", you agree to only post content qualifying as Internet Art. As outlined in the ",
        /* @__PURE__ */ jsx(Link, { href: "/about", children: "about" }),
        " section, this is any work that requires the Internet for its realization. Furthermore, all posted work should be primarily artistic in nature. Eg. a work can contain nudity but should distinguish itself clearly from pornography in its concept and realization. Likewise, any post whose primary goal is to promote a business or make money is not acceptable. In any and all cases, it is at the final discretion of the webmaster and administrators to temporarily hide or delete any content or user found to not abide by these principles."
      ] }),
      /* @__PURE__ */ jsx("p", { children: "Users whose content has been temporarily hidden will be notified so that they can make changes or appeal the decision." }),
      /* @__PURE__ */ jsxs("p", { children: [
        "Users must have the right to archive the work they post. ",
        APP_NAME,
        " complies with DMCA takedown requests and will remove infringing material upon valid notice."
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        APP_NAME,
        " will not leak your personal information to anyone or use it for anything but your ",
        APP_NAME,
        " account."
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        "Without receiving your explicit agreement, ",
        APP_NAME,
        " will not use images and information from your posts for anything but the following :"
      ] }),
      /* @__PURE__ */ jsxs("ol", { children: [
        /* @__PURE__ */ jsx("li", { children: "The posts themselves on the website" }),
        /* @__PURE__ */ jsxs("li", { children: [
          "Images of posts may appear in screenshots of the ",
          APP_NAME,
          " without explicit credit."
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          "For any promotional content that explicitly highlights the work of a ",
          APP_NAME,
          " user, credit will be given."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        APP_NAME,
        " is not responsible for any user-generated content that violates our terms or is otherwise perceived as offensive. Once discovered, we will hide or delete such content as we see fit."
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        "Users posting their own work are the copyright-holders thereof and ",
        APP_NAME,
        " makes no claim thereto."
      ] })
    ] }),
    !isSocialLogin && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        CheckboxField,
        {
          name: "user-agree",
          label: "I am a robot",
          value: robotVal,
          onChange: onRobotChange,
          disabled: isSubmitting
        }
      ),
      /* @__PURE__ */ jsx(
        CheckboxField,
        {
          name: "user-human",
          label: "I am a human",
          value: humanVal,
          onChange: onHumanChange,
          disabled: isSubmitting,
          classes: "bonus"
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      CheckboxField,
      {
        name: "user-agree",
        label: "I agree to the above terms.",
        value: agreeVal,
        onChange: onAgreeChange,
        disabled: isSubmitting
      }
    )
  ] });
}
function Registration() {
  var _a, _b, _c, _d;
  const LoginType2 = {
    Email: "email"
  };
  const { props } = usePage();
  const APP_NAME = props.app_name;
  const user = ((_a = props == null ? void 0 : props.auth) == null ? void 0 : _a.user) ?? null;
  const isAuthenticated = !!user;
  const isLoading = false;
  const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
    email: "",
    show_email_in_profile: false,
    username: "",
    password: "",
    password_confirmation: "",
    birthdate: "",
    website: "",
    is_user_human: false,
    is_user_robot: true,
    login_type: null,
    user_agrees: false
  });
  const [isValidating, setIsValidating] = useState(false);
  const [success, setSuccess] = useState("");
  const [formPage, setFormPage] = useState(0);
  const [isEmailFieldValid, setIsEmailFieldValid] = useState(false);
  const [isPasswordFieldValid, setIsPasswordFieldValid] = useState(false);
  const [isUsernameFieldValid, setIsUsernameFieldValid] = useState(false);
  const [isBirthdateFieldValid, setIsBirthdateFieldValid] = useState(false);
  const [arePasswordsMatching, setArePasswordsMatching] = useState(false);
  const from = ((_b = props == null ? void 0 : props.flash) == null ? void 0 : _b.from) || "/dashboard";
  const message = (_c = props == null ? void 0 : props.flash) == null ? void 0 : _c.message;
  let formContainerClasses = "form-container";
  formContainerClasses = formPage === 1 ? formContainerClasses + " limited-width" : formContainerClasses;
  const hasErrors = Object.keys(errors).length > 0;
  const canContinueWithEmail = data.email && isEmailFieldValid && !processing && !hasErrors && !isValidating;
  const canRegisterWithEmail = data.login_type === LoginType2.Email && data.email && data.username && data.birthdate && data.password && data.password_confirmation && isEmailFieldValid && isUsernameFieldValid && isPasswordFieldValid && arePasswordsMatching && isBirthdateFieldValid && !processing && !hasErrors && !isValidating ? true : false;
  const canCompleteSocialRegistration = data.username && isUsernameFieldValid && data.user_agrees && data.birthdate && isBirthdateFieldValid && isAuthenticated && !processing && !hasErrors && !isValidating;
  useEffect(() => {
    if (isAuthenticated && !user.profile_completed) {
      setFormPage(3);
    } else if (isAuthenticated && user.profile_completed) {
      router.visit(from, { replace: true });
    }
  }, [user, isAuthenticated, isLoading, from, formPage]);
  useEffect(() => {
    var _a2;
    if (message) {
      const status = (_a2 = props == null ? void 0 : props.flash) == null ? void 0 : _a2.status;
      if (status === "social_registration_incomplete") {
        setFormPage(3);
        setSuccess(message);
      } else {
        setError("general", message);
      }
    }
  }, [message, (_d = props == null ? void 0 : props.flash) == null ? void 0 : _d.status, user, setError]);
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setIsValidating(true);
    router.post("/register/check", { email: data.email }, {
      preserveState: true,
      preserveScroll: true,
      only: ["errors"],
      onError: (errs) => {
        if (errs.email) setError("email", errs.email);
      },
      onSuccess: () => {
        clearErrors("email");
        setFormPage(1);
        setData("login_type", LoginType2.Email);
      },
      onFinish: () => setIsValidating(false)
    });
  };
  const handleEmailFormatValidation = (proposedEmail, setFieldLocalError) => {
    const isValid = isValidEmail(proposedEmail);
    if (!isValid) {
      setFieldLocalError("please enter a valid email address");
    } else {
      setFieldLocalError("");
    }
    setIsEmailFieldValid(isValid);
    return isValid;
  };
  const handleUsernameFormatValidation = (proposedName, setFieldLocalError) => {
    const isEmpty = proposedName.length < 1;
    const isValid = !isEmpty && isAlphaDash(proposedName);
    if (!isValid) {
      if (isEmpty) {
        setFieldLocalError("username cannot be empty");
      } else {
        setFieldLocalError("username may only contain letters, numbers, _ and -");
      }
    } else {
      setFieldLocalError("");
    }
    setIsUsernameFieldValid(isValid);
    return isValid;
  };
  const handlePasswordFormatValidation = (proposedPassword, setFieldLocalError) => {
    const isValid = isValidPassword(proposedPassword);
    if (!isValid) {
      setFieldLocalError("Password must contain at least 8 characters, 1 lower-case letter, 1 upper-case letter, and 1 number.");
    } else {
      setFieldLocalError("");
    }
    setIsPasswordFieldValid(isValid);
    return isValid;
  };
  const handlePasswordConfirmValidation = (val, setFieldLocalError) => {
    const areMatching = data.password === val;
    setArePasswordsMatching(areMatching);
    if (!areMatching && val !== "") {
      setFieldLocalError("Password and confirmation do not match.");
    } else {
      setFieldLocalError("");
    }
  };
  const handleBirthdateFormatValidation = async (proposedBirthdate, setFieldLocalError) => {
    const bd = new Date(proposedBirthdate);
    const today = /* @__PURE__ */ new Date();
    let age = today.getFullYear() - bd.getFullYear();
    const monthDifference = today.getMonth() - bd.getMonth();
    const dayDifference = today.getDate() - bd.getDate();
    if (monthDifference < 0 || monthDifference === 0 && dayDifference < 0) {
      age--;
    }
    const isValid = age >= 13 && age < 120;
    if (!isValid) {
      if (age >= 120) {
        setFieldLocalError("Please enter your real birthdate.");
      } else {
        setFieldLocalError("you must be 13 years or older to register");
      }
    } else {
      setFieldLocalError("");
    }
    setIsBirthdateFieldValid(isValid);
    return isValid;
  };
  useEffect(() => {
    if (data.password_confirmation === "") {
      return;
    }
    const areMatching = data.password === data.password_confirmation;
    setArePasswordsMatching(areMatching);
    if (!areMatching) {
      setError("password_confirmation", "Password and confirmation do not match.");
    } else {
      if (errors.password_confirmation === "Password and confirmation do not match.") {
        clearErrors("password_confirmation");
      }
    }
  }, [data.password, data.password_confirmation, setError, clearErrors, errors.password_confirmation]);
  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    setIsValidating(true);
    router.post("/register/check", { email: data.email, username: data.username }, {
      preserveState: true,
      preserveScroll: true,
      only: ["errors"],
      onError: (errs) => {
        if (errs.email) setError("email", errs.email);
        if (errs.username) setError("username", errs.username);
      },
      onSuccess: () => {
        clearErrors("email", "username");
        setFormPage(2);
      },
      onFinish: () => setIsValidating(false)
    });
  };
  const handleEmailRegistrationSubmit = (e) => {
    e.preventDefault();
    clearErrors("general");
    setSuccess("");
    post("/register", {
      preserveState: true,
      onError: (errs) => {
        if (errs.email || errs.username || errs.password || errs.birthdate || errs.password_confirmation) {
          setFormPage(1);
        }
      },
      onSuccess: () => {
      }
    });
  };
  const handleSocialRegistrationSubmit = () => {
  };
  const handleSocialCompletionSubmit = (e) => {
    e.preventDefault();
    clearErrors("general");
    post("/complete-social-profile", {
      preserveState: true,
      replace: true
      // onSuccess: () => {
      //     router.visit('/dashboard', { replace: true });
      // }
    });
  };
  const handleBlur = (field, value) => {
    if (value) {
      router.post("/register/check", { [field]: value }, {
        preserveState: true,
        preserveScroll: true,
        only: ["errors"],
        onError: (errs) => {
          if (errs[field]) {
            setError(field, errs[field]);
          }
        },
        onSuccess: () => {
          clearErrors(field);
        }
      });
    }
  };
  const handleFormErrorUpdate = (field, msg) => {
    if (msg) {
      setError(field, msg);
    } else {
      clearErrors(field);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHead, { title: "Registration" }),
    /* @__PURE__ */ jsxs("div", { className: formContainerClasses, children: [
      /* @__PURE__ */ jsxs("h1", { className: "centered-content no-margin", children: [
        "join ",
        APP_NAME
      ] }),
      errors.general && /* @__PURE__ */ jsx("div", { className: "error", children: errors.general }),
      success && /* @__PURE__ */ jsx("div", { className: "notice", children: success }),
      formPage === 0 ? /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "field-groups-container", children: [
        /* @__PURE__ */ jsxs("form", { onSubmit: handleEmailSubmit, children: [
          /* @__PURE__ */ jsx("h3", { children: "type your e-mail:" }),
          /* @__PURE__ */ jsxs("div", { className: "field-group", children: [
            /* @__PURE__ */ jsx(
              FormField,
              {
                id: "email",
                placeholder: "valid@email.address",
                value: data.email,
                onChange: (e) => setData("email", e.target.value),
                onBlur: (e) => handleBlur("email", e.target.value),
                onValidate: handleEmailFormatValidation,
                onErrorUpdate: handleFormErrorUpdate,
                error: errors.email,
                disabled: processing || isValidating,
                type: "email"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "submit",
                disabled: !canContinueWithEmail,
                children: /* @__PURE__ */ jsx("div", { className: "button-content", children: "continue with e-mail" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          OAuth,
          {
            headerText: "or continue with:",
            onClick: handleSocialRegistrationSubmit,
            setOnError: (msg) => setError("general", msg),
            isSubmittingForm: processing || isValidating,
            setIsSubmittingForm: () => {
            }
          }
        )
      ] }) }) : formPage === 1 ? /* @__PURE__ */ jsxs("form", { onSubmit: handleDetailsSubmit, children: [
        /* @__PURE__ */ jsx(
          FormField,
          {
            id: "email",
            label: "type your e-mail address",
            placeholder: "valid@email.address",
            value: data.email,
            onChange: (e) => setData("email", e.target.value.trimEnd()),
            onBlur: (e) => handleBlur("email", e.target.value),
            onValidate: handleEmailFormatValidation,
            onErrorUpdate: handleFormErrorUpdate,
            error: errors.email,
            disabled: processing || isValidating,
            type: "email",
            classes: "limited-width"
          }
        ),
        /* @__PURE__ */ jsx(
          CheckboxField,
          {
            name: "show-email",
            label: "show e-mail in profile?",
            value: data.show_email_in_profile,
            onChange: (e) => setData("show_email_in_profile", e.target.checked),
            disabled: processing || isValidating,
            classes: "centered"
          }
        ),
        /* @__PURE__ */ jsx(
          FormField,
          {
            id: "username",
            placeholder: "a-z, A-Z, 0-9, -, _",
            label: "pick a username",
            value: data.username,
            onChange: (e) => setData("username", e.target.value.trimEnd()),
            onBlur: (e) => handleBlur("username", e.target.value),
            onValidate: handleUsernameFormatValidation,
            onErrorUpdate: handleFormErrorUpdate,
            error: errors.username,
            disabled: processing || isValidating,
            type: "text",
            classes: "limited-width"
          }
        ),
        /* @__PURE__ */ jsx(
          FormField,
          {
            id: "password",
            label: "choose a password",
            placeholder: "requires: a-z, A-Z, and 0-9",
            value: data.password,
            onChange: (e) => setData("password", e.target.value.trimEnd()),
            onValidate: handlePasswordFormatValidation,
            onErrorUpdate: handleFormErrorUpdate,
            error: errors.password,
            disabled: processing || isValidating,
            type: "password",
            classes: "limited-width"
          }
        ),
        /* @__PURE__ */ jsx(
          FormField,
          {
            id: "password_confirmation",
            label: "confirm password",
            placeholder: "same as above",
            value: data.password_confirmation,
            onChange: (e) => setData("password_confirmation", e.target.value.trimEnd()),
            onValidate: handlePasswordConfirmValidation,
            onErrorUpdate: handleFormErrorUpdate,
            error: errors.password_confirmation,
            disabled: processing || isValidating,
            type: "password",
            classes: "limited-width"
          }
        ),
        /* @__PURE__ */ jsx(
          FormField,
          {
            id: "birthdate",
            label: "date of birth",
            min: "1920-01-01",
            max: getDateString(),
            value: data.birthdate,
            onValidate: handleBirthdateFormatValidation,
            onChange: (e) => setData("birthdate", e.target.value.trimEnd()),
            onErrorUpdate: handleFormErrorUpdate,
            error: errors.birthdate,
            disabled: processing || isValidating,
            type: "date",
            classes: "limited-width"
          }
        ),
        /* @__PURE__ */ jsx(
          FormField,
          {
            id: "website",
            label: "your website url",
            placeholder: "www.yoursite.com",
            value: data.website,
            onChange: (e) => setData("website", e.target.value.trimEnd()),
            onErrorUpdate: handleFormErrorUpdate,
            error: errors.website,
            disabled: processing || isValidating,
            type: "text",
            classes: "bonus limited-width"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex-row", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              disabled: processing || isValidating,
              onClick: (e) => {
                e.preventDefault();
                setFormPage(0);
              },
              children: "back"
            }
          ),
          /* @__PURE__ */ jsx("button", { type: "submit", disabled: !canRegisterWithEmail, children: "continue" })
        ] })
      ] }) : formPage === 2 ? /* @__PURE__ */ jsxs("form", { onSubmit: handleEmailRegistrationSubmit, children: [
        /* @__PURE__ */ jsx(
          UserAgreement,
          {
            onAgreeChange: (e) => setData("user_agrees", e.target.checked),
            onHumanChange: (e) => setData("is_user_human", e.target.checked),
            onRobotChange: (e) => setData("is_user_robot", e.target.checked),
            agreeVal: data.user_agrees,
            humanVal: data.is_user_human,
            robotVal: data.is_user_robot,
            isSubmitting: processing || isValidating
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex-row", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              disabled: processing || isValidating,
              onClick: (e) => {
                e.preventDefault();
                setFormPage(1);
              },
              children: "back"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: !canRegisterWithEmail || !data.user_agrees || processing || hasErrors || isValidating,
              children: processing || isValidating ? "registering..." : "register"
            }
          )
        ] })
      ] }) : (
        //page 3: Profile Completion for Social Login
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSocialCompletionSubmit, children: [
          /* @__PURE__ */ jsx(
            FormField,
            {
              id: "username",
              placeholder: "a-z, A-Z, 0-9, -, _",
              label: "pick a username",
              value: data.username,
              onChange: (e) => setData("username", e.target.value.trimEnd()),
              onBlur: (e) => handleBlur("username", e.target.value),
              onValidate: handleUsernameFormatValidation,
              onErrorUpdate: handleFormErrorUpdate,
              error: errors.username,
              disabled: processing,
              type: "text",
              classes: "limited-width"
            }
          ),
          /* @__PURE__ */ jsx(
            FormField,
            {
              id: "birthdate",
              label: "date of birth",
              min: "1920-01-01",
              max: getDateString(),
              value: data.birthdate,
              onValidate: handleBirthdateFormatValidation,
              onChange: (e) => setData("birthdate", e.target.value.trimEnd()),
              onErrorUpdate: handleFormErrorUpdate,
              error: errors.birthdate,
              disabled: processing,
              type: "date",
              classes: "limited-width"
            }
          ),
          /* @__PURE__ */ jsx(
            CheckboxField,
            {
              name: "show-email",
              label: "show e-mail address in profile?",
              value: data.show_email_in_profile,
              onChange: (e) => setData("show_email_in_profile", e.target.checked),
              disabled: processing,
              classes: "centered"
            }
          ),
          /* @__PURE__ */ jsx(
            UserAgreement,
            {
              onAgreeChange: (e) => setData("user_agrees", e.target.checked),
              agreeVal: data.user_agrees,
              isSubmitting: processing,
              isSocialLogin: true
            }
          ),
          /* @__PURE__ */ jsx("button", { type: "submit", disabled: !canCompleteSocialRegistration, children: processing ? "submitting..." : "submit" })
        ] })
      )
    ] })
  ] });
}
Registration.layout = (page) => /* @__PURE__ */ jsx(Layout, { children: page });
const __vite_glob_0_16 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Registration
}, Symbol.toStringTag, { value: "Module" }));
function SearchResults({ searchTerm = "", searchPosts = [] }) {
  const [screenSize, setScreenSize] = useState(getScreenSize());
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageHead, { title: "Search Results" }),
    /* @__PURE__ */ jsxs("div", { className: "page-section", children: [
      /* @__PURE__ */ jsx("h3", { className: "padded centered-content", children: searchTerm ? `search results for "${searchTerm}"` : "Please enter a search term." }),
      /* @__PURE__ */ jsx(
        AutoloadTilesContainer,
        {
          screenSize,
          category: Category.Archive,
          fetchOrder: FetchOrder.Random,
          searchTerm,
          initialPosts: searchPosts,
          isSearch: true,
          partialProp: "searchPosts"
        },
        searchTerm
      )
    ] })
  ] });
}
SearchResults.layout = (page) => /* @__PURE__ */ jsx(Layout, { children: page });
const __vite_glob_0_17 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: SearchResults
}, Symbol.toStringTag, { value: "Module" }));
function UserProfile({ user: profileUserProp }) {
  var _a;
  const { props } = usePage();
  const user = (_a = props.auth) == null ? void 0 : _a.user;
  const appUrl = props.app_url;
  const username = profileUserProp == null ? void 0 : profileUserProp.username;
  const [screenSize, setScreenSize] = useState(getScreenSize());
  const [profileUser, setProfileUser] = useState(profileUserProp);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isFollowing, setIsFollowing] = useState((profileUserProp == null ? void 0 : profileUserProp.is_following) || false);
  const avatar = (profileUser == null ? void 0 : profileUser.avatar) ? `${appUrl}/storage/images/uploaded/users/${username}/avatar/small/${profileUser == null ? void 0 : profileUser.avatar}` : `${appUrl}/storage/images/defaults/avatar.webp?v=1`;
  useEffect(() => {
    const cleanup = monitorScreenSize(setScreenSize);
    return cleanup;
  }, []);
  const handleFollowToggle = useCallback(() => {
    setIsSubmitting(true);
    router.post(`/${profileUserProp.id}/follow`, {}, {
      preserveScroll: true,
      onSuccess: (page) => {
        var _a2;
        setIsSubmitting(false);
        if ((_a2 = page.props.flash) == null ? void 0 : _a2.success) {
          setSuccess(page.props.flash.success);
          setError("");
        }
      },
      onError: (errors) => {
        setIsSubmitting(false);
        setError(errors.error || "Failed to toggle follow.");
        setSuccess("");
      }
    });
  }, [profileUserProp, setIsSubmitting, setError, setSuccess]);
  useEffect(() => {
    setIsFollowing((profileUserProp == null ? void 0 : profileUserProp.is_following) || false);
  }, [profileUserProp]);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUser.email);
      alert("Email copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      PageHead,
      {
        title: `${username}'s profile`
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "heading-profile-container public-profile", children: [
      /* @__PURE__ */ jsx("div", { className: "centered-content vert-1rem", children: /* @__PURE__ */ jsx("h1", { children: username }) }),
      profileUser ? (
        // false ? (
        /* @__PURE__ */ jsxs("div", { className: "profile-boxes-container", children: [
          /* @__PURE__ */ jsxs("div", { className: "main-info-box yellow-gradient-background sticky", children: [
            error && /* @__PURE__ */ jsx("div", { className: "error", children: error }),
            success && /* @__PURE__ */ jsx("div", { className: "notice", children: success }),
            /* @__PURE__ */ jsxs("div", { className: "avatar-section", children: [
              user && user.id !== profileUser.id && /* @__PURE__ */ jsx(
                "button",
                {
                  className: "avatar-button public-corner small-button",
                  type: "button",
                  onClick: handleFollowToggle,
                  disabled: isSubmitting,
                  children: isFollowing ? /* @__PURE__ */ jsx("i", { className: "fa-solid fa-minus" }) : /* @__PURE__ */ jsx("i", { className: "fa-solid fa-plus" })
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "profile-avatar-container", children: [
                /* @__PURE__ */ jsx("img", { src: avatar, alt: `${user == null ? void 0 : user.username}'s avatar`, className: "round-image" }),
                user && user.id !== profileUser.id && /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: "avatar-button public-hover",
                    type: "button",
                    onClick: handleFollowToggle,
                    disabled: isSubmitting,
                    children: isFollowing ? /* @__PURE__ */ jsx("span", { children: "unfollow" }) : /* @__PURE__ */ jsx("span", { children: "follow" })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "info-section", children: [
              /* @__PURE__ */ jsx(
                ProfileItem,
                {
                  name: "websites",
                  value: profileUser.websites || (profileUser.website ? [profileUser.website] : []),
                  isPublic: true,
                  isLink: true,
                  isArray: true
                }
              ),
              /* @__PURE__ */ jsx(
                ProfileItem,
                {
                  name: "location",
                  value: profileUser.location,
                  isPublic: true
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex-row", children: [
                /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsxs(
                  Link,
                  {
                    href: "/dashboard/mail/new",
                    data: { addressee: username },
                    className: "link-with-icon",
                    children: [
                      /* @__PURE__ */ jsx("i", { className: "fa-regular fa-envelope medium-icon" }),
                      " ",
                      /* @__PURE__ */ jsx("span", { children: "send DM" })
                    ]
                  }
                ) }),
                !!profileUser.show_email_in_profile && /* @__PURE__ */ jsxs("span", { children: [
                  /* @__PURE__ */ jsxs(
                    "a",
                    {
                      href: `mailto:${profileUser.email}`,
                      className: "link-with-icon",
                      children: [
                        /* @__PURE__ */ jsx("i", { className: "fa-solid fa-envelopes-bulk medium-icon" }),
                        " ",
                        /* @__PURE__ */ jsx("span", { children: "e-mail" })
                      ]
                    }
                  ),
                  " ",
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      className: "button-link",
                      "aria-label": "copy to clipboard",
                      title: "copy to clipboard",
                      onClick: handleCopy,
                      children: /* @__PURE__ */ jsx("i", { className: "fa-regular fa-copy medium-icon" })
                    }
                  )
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rte-container black-gradient-background", children: [
            /* @__PURE__ */ jsx("div", { className: "centered-header-box", children: /* @__PURE__ */ jsx("div", { className: "centered-content top-2rem", children: /* @__PURE__ */ jsx("h2", { children: "bio" }) }) }),
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "article-text padded",
                dangerouslySetInnerHTML: { __html: sanitizeRichHtml(hydrateEditorImagePaths(profileUser.bio, appUrl)) }
              }
            )
          ] })
        ] })
      ) : /* @__PURE__ */ jsx("p", { className: "centered-content", children: " loading user..." })
    ] }),
    profileUser ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("h2", { className: "centered-content padded", children: `${username}'s posts` }),
      /* @__PURE__ */ jsx(
        AutoloadTilesContainer,
        {
          screenSize,
          initialPosts: props.initialPosts || [],
          loadOnScroll: false,
          maxItems: {
            [ScreenSize.Nothing]: 0,
            [ScreenSize.Narrow]: 3,
            [ScreenSize.Small]: 6,
            [ScreenSize.Mid]: 8,
            [ScreenSize.Wide]: 12
          },
          userId: profileUser == null ? void 0 : profileUser.id,
          fetchOrder: FetchOrder.Descending
        },
        profileUser == null ? void 0 : profileUser.id
      ),
      /* @__PURE__ */ jsx("div", { className: "centered-content", children: /* @__PURE__ */ jsx(
        Link,
        {
          href: `/${username}/posts`,
          children: "view all"
        }
      ) })
    ] }) : null
  ] });
}
UserProfile.layout = (page) => /* @__PURE__ */ jsx(Layout, { children: page });
const __vite_glob_0_18 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: UserProfile
}, Symbol.toStringTag, { value: "Module" }));
function Notification({ notification }) {
  var _a, _b;
  if (((notification == null ? void 0 : notification.type) == NotificationType.Comment || (notification == null ? void 0 : notification.type) == NotificationType.Reply) && !notification.comment) {
    return null;
  }
  return notification ? /* @__PURE__ */ jsxs("div", { className: "comment", children: [
    notification.type == NotificationType.Unhidden && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("span", { className: "bold notice", children: /* @__PURE__ */ jsx("em", { children: "admin notice" }) }),
        /* @__PURE__ */ jsxs("em", { children: [
          " on ",
          getDateAsYYYYMMDD(notification.created_at),
          /* @__PURE__ */ jsxs("span", { className: "notice small", children: [
            " at ",
            getTimeAsHHMM(notification.created_at)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("br", {}),
      /* @__PURE__ */ jsx("p", { children: notification.post ? /* @__PURE__ */ jsxs(Fragment, { children: [
        "Your post, ",
        /* @__PURE__ */ jsx(Link, { href: getPostUrl(notification.post), children: notification.post.title }),
        ", has been unhidden."
      ] }) : "Your post, [post not found], has been unhidden." })
    ] }),
    notification.type == NotificationType.Follower && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("span", { className: "bold notice", children: /* @__PURE__ */ jsx("em", { children: "new follower" }) }) }),
      /* @__PURE__ */ jsx("br", {}),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx(
          UserLink,
          {
            user: notification.follower
          }
        ),
        " started following you ",
        /* @__PURE__ */ jsxs("em", { children: [
          "on ",
          getDateAsYYYYMMDD(notification.created_at),
          /* @__PURE__ */ jsxs("span", { className: "notice small", children: [
            " at ",
            getTimeAsHHMM(notification.created_at)
          ] })
        ] })
      ] })
    ] }),
    notification.type == NotificationType.Comment && /* @__PURE__ */ jsxs("p", { children: [
      /* @__PURE__ */ jsx(
        UserLink,
        {
          user: notification.comment.user
        }
      ),
      " commented on ",
      /* @__PURE__ */ jsx(
        Link,
        {
          href: getPostUrl(notification.comment.post),
          children: (_a = notification.comment.post) == null ? void 0 : _a.title
        }
      ),
      " ",
      /* @__PURE__ */ jsxs("em", { children: [
        "on ",
        getDateAsYYYYMMDD(notification.created_at),
        /* @__PURE__ */ jsxs("span", { className: "notice small", children: [
          " at ",
          getTimeAsHHMM(notification.created_at)
        ] })
      ] })
    ] }),
    notification.type == NotificationType.Reply && /* @__PURE__ */ jsxs("p", { children: [
      /* @__PURE__ */ jsx(
        UserLink,
        {
          user: notification.comment.user
        }
      ),
      " replied to ",
      /* @__PURE__ */ jsx(
        Link,
        {
          href: `${getPostUrl(notification.comment.post)}?comment_id=${notification.comment.parent_id}`,
          children: "your comment"
        }
      ),
      " in ",
      /* @__PURE__ */ jsx(
        Link,
        {
          href: getPostUrl(notification.comment.post),
          children: (_b = notification.comment.post) == null ? void 0 : _b.title
        }
      ),
      " ",
      /* @__PURE__ */ jsxs("em", { children: [
        "on ",
        getDateAsYYYYMMDD(notification.created_at),
        /* @__PURE__ */ jsxs("span", { className: "notice small", children: [
          " at ",
          getTimeAsHHMM(notification.created_at)
        ] })
      ] })
    ] }),
    (notification.type == NotificationType.Comment || notification.type == NotificationType.Reply) && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "comment-notice-container", children: /* @__PURE__ */ jsxs(
        Link,
        {
          href: `${getPostUrl(notification.comment.post)}?comment_id=${notification.comment.id}`,
          className: "notice small",
          children: [
            /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-up-right-from-square" }),
            " go to comment"
          ]
        }
      ) }),
      /* @__PURE__ */ jsx(
        "p",
        {
          className: "comment-text",
          dangerouslySetInnerHTML: { __html: sanitizeRichHtml(notification.comment.content_html) }
        }
      )
    ] })
  ] }) : /* @__PURE__ */ jsx("p", { children: "loading..." });
}
const __vite_glob_0_39 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Notification
}, Symbol.toStringTag, { value: "Module" }));
function Activity() {
  const [screenSize, setScreenSize] = useState(getScreenSize());
  const { props } = usePage();
  const {
    initialLikedPosts,
    initialComments,
    initialNotifications,
    initialFollowers,
    initialFollowing,
    auth: { user }
  } = props;
  useEffect(() => {
    const cleanup = monitorScreenSize(setScreenSize);
    return cleanup;
  }, []);
  return /* @__PURE__ */ jsxs(DashboardLayout, { currentTab: "activity", headerText: "activity", children: [
    /* @__PURE__ */ jsx(PageHead, { title: "Activity" }),
    /* @__PURE__ */ jsxs("div", { className: "activity-box-container", children: [
      /* @__PURE__ */ jsxs("div", { className: "notifications-comments-container", children: [
        /* @__PURE__ */ jsx("div", { className: "main-info-box transparent-background orange-border", children: /* @__PURE__ */ jsx(
          LoadItems,
          {
            initialItems: initialNotifications,
            renderMethod: (notification) => ({
              notification
            }),
            Component: Notification,
            itemString: "notifications",
            headingText: "notifications",
            viewAllLink: "/dashboard/notifications",
            headerClasses: "teal"
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "main-info-box transparent-background teal-border", children: /* @__PURE__ */ jsx(
          LoadItems,
          {
            initialItems: initialComments,
            renderMethod: (comment, i) => ({
              comment,
              id: i,
              isDashboard: true
            }),
            Component: Comment,
            itemString: "comments",
            headingText: "your comments",
            viewAllLink: "/dashboard/comments"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "posts-follows-container", children: [
        /* @__PURE__ */ jsxs("div", { className: "main-info-box transparent-background bright-blue-border", children: [
          /* @__PURE__ */ jsx("h2", { className: "centered-content", children: /* @__PURE__ */ jsx(Link, { href: "/dashboard/liked-posts", children: "liked posts" }) }),
          /* @__PURE__ */ jsx(
            AutoloadTilesContainer,
            {
              screenSize,
              initialPosts: initialLikedPosts,
              loadOnScroll: false,
              fetchOrder: FetchOrder.Descending,
              maxItems: {
                [ScreenSize.Nothing]: 0,
                [ScreenSize.Narrow]: 3,
                [ScreenSize.Small]: 4,
                [ScreenSize.Mid]: 4,
                [ScreenSize.Wide]: 4
              }
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: "/dashboard/liked-posts",
              className: "centered-content",
              children: "view all"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "main-info-box follows transparent-background yellow-border", children: [
          /* @__PURE__ */ jsx(
            LoadItems,
            {
              initialItems: initialFollowing,
              renderMethod: (user2) => ({ user: user2 }),
              Component: UserCircle,
              itemString: "users",
              headingText: "users you follow",
              viewAllLink: "/dashboard/following"
            }
          ),
          /* @__PURE__ */ jsx(
            LoadItems,
            {
              initialItems: initialFollowers,
              renderMethod: (user2) => ({ user: user2 }),
              Component: UserCircle,
              itemString: "users",
              headingText: "followers",
              viewAllLink: "/dashboard/followers"
            }
          )
        ] })
      ] })
    ] })
  ] });
}
const __vite_glob_0_19 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Activity
}, Symbol.toStringTag, { value: "Module" }));
function Message({
  message,
  onReply = null,
  onDelete = null,
  id,
  parentLocalId = null,
  currentUrl = null,
  setConversation = null,
  quoteText = ""
}) {
  var _a;
  const user = (_a = usePage().props.auth) == null ? void 0 : _a.user;
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { props } = usePage();
  const appUrl = props.app_url;
  const initialHydratedContent = useMemo(() => hydrateEditorImagePaths(message.content, appUrl), [message.content, appUrl]);
  const [content, setContent] = useState(initialHydratedContent);
  const [initialContent, setInitialContent] = useState(initialHydratedContent);
  const [hasChanged, setHasChanged] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const elementId = `message-${id}`;
  const messageSender = message.sender ?? { id: -27, username: "[deleted user]", avatar: null };
  const handleMessageEdit = useCallback(() => {
    setIsEditing(true);
  }, []);
  const handleEditCancel = useCallback(() => {
    if (hasChanged) {
      const isConfirmed = window.confirm("Revert changes?");
      if (!isConfirmed) {
        return;
      }
    }
    setIsEditing(false);
    setContent(initialContent);
    setResetKey((k) => k + 1);
  }, [initialContent]);
  const handleMessageUpdate = useCallback(async () => {
    setIsSubmitting(true);
    const dehydratedContent = dehydrateEditorImagePaths(content, appUrl);
    const newContentWithResizedImages = await processEditorImages(dehydratedContent);
    setError("");
    router.put(`/dashboard/mail/${message.id}`, { content: newContentWithResizedImages }, {
      preserveScroll: true,
      onSuccess: () => {
        setIsSubmitting(false);
        setIsEditing(false);
      },
      onError: (err) => {
        console.error(err);
        const errM = getErrorMessage(err);
        setError(errM);
        setIsSubmitting(false);
      }
    });
  }, [content, setIsSubmitting, message, setIsEditing]);
  useEffect(() => {
    setContent(initialHydratedContent);
    setInitialContent(initialHydratedContent);
    setHasChanged(false);
    setResetKey((k) => k + 1);
  }, [initialHydratedContent]);
  return /* @__PURE__ */ jsxs("div", { className: "comment dm", id: elementId, children: [
    /* @__PURE__ */ jsxs("p", { children: [
      /* @__PURE__ */ jsx(UserLink, { user: messageSender }),
      " ",
      /* @__PURE__ */ jsxs("em", { children: [
        "on ",
        getDateAsYYYYMMDD(message.created_at),
        /* @__PURE__ */ jsxs("span", { className: "notice small", children: [
          " at ",
          getTimeAsHHMM(message.created_at)
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "comment-notice-container", children: [
      message.created_at !== message.updated_at && /* @__PURE__ */ jsx("span", { className: "notice small greyed-out", children: "(edited)" }),
      error && /* @__PURE__ */ jsxs("span", { className: "error", children: [
        " ",
        error
      ] })
    ] }),
    isEditing ? /* @__PURE__ */ jsx(
      RichTextEditor,
      {
        id,
        readOnly: !isEditing || isSubmitting,
        onChange: (editedMessage) => {
          setHasChanged(editedMessage != initialContent);
          setContent(editedMessage);
        },
        value: content,
        quotedMessage: quoteText,
        resetKey
      }
    ) : /* @__PURE__ */ jsx(
      "div",
      {
        dangerouslySetInnerHTML: { __html: sanitizeRichHtml(content) },
        className: "message-text"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "comment-buttons-container", children: [
      !isEditing && onReply && /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => onReply(message, elementId, true),
          className: "small-button",
          title: "quote reply",
          disabled: isSubmitting,
          children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-quote-left" })
        }
      ) }),
      user.id === messageSender.id && /* @__PURE__ */ jsxs(Fragment, { children: [
        isEditing ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "small-button",
              onClick: handleMessageUpdate,
              title: "save",
              disabled: isSubmitting || !hasChanged || content.trim().length < 1,
              children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-floppy-disk" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "small-button",
              onClick: handleEditCancel,
              title: "cancel",
              disabled: isSubmitting,
              children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-arrow-rotate-left" })
            }
          )
        ] }) : /* @__PURE__ */ jsx(
          EditButton,
          {
            className: "small-button",
            onClick: handleMessageEdit,
            disabled: isSubmitting
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => onDelete(message.id),
            className: "small-button",
            title: "delete",
            disabled: isSubmitting,
            children: /* @__PURE__ */ jsx("i", { className: "fa-regular fa-trash-can" })
          }
        )
      ] })
    ] })
  ] });
}
const areEqual = (prevProps, nextProps) => {
  return prevProps.id === nextProps.id && prevProps.parentLocalId === nextProps.parentLocalId && prevProps.quoteText === nextProps.quoteText && prevProps.message.id === nextProps.message.id && prevProps.message.content === nextProps.message.content && prevProps.message.updated_at === nextProps.message.updated_at;
};
const Message$1 = React.memo(Message, areEqual);
function Conversation({ conversation: conversationProp, addressee }) {
  var _a, _b, _c, _d, _e;
  const { props, url } = usePage();
  const conversation = conversationProp || props.conversationProp || null;
  const user = props.auth.user;
  const [recipients, setRecipients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchResultSelection, setSearchResultSelection] = useState(-1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const recipientSpanRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const resultsContainer = useRef(null);
  const [doesMessageExist, setDoesMessageExist] = useState(false);
  const isNew = !conversationProp && url.startsWith("/dashboard/mail/new");
  const canSubmit = (!isNew || (recipients == null ? void 0 : recipients.length) > 0) && doesMessageExist;
  const [error, setError] = useState("");
  useRef(conversationProp ?? null);
  const [quotedMessage, setQuotedMessage] = useState("");
  const [originalMessage, setOriginalMessage] = useState(null);
  const [originalMessageElement, setOriginalMessageElement] = useState(null);
  const [pendingScrollId, setPendingScrollId] = useState(((_a = props.flash) == null ? void 0 : _a.new_message_id) || null);
  let convoName = isNew ? "new conversation" : "conversation";
  convoName = (conversation == null ? void 0 : conversation.name) ?? convoName;
  useEffect(() => {
    if (!addressee || conversation) {
      return;
    }
    setRecipients([addressee]);
  }, [addressee, conversation]);
  useEffect(() => {
    if (pendingScrollId) {
      const element = document.getElementById(`message-${pendingScrollId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        setPendingScrollId(null);
      }
    }
  }, [conversation, pendingScrollId]);
  useEffect(() => {
    var _a2;
    if ((_a2 = props.flash) == null ? void 0 : _a2.new_message_id) {
      setPendingScrollId(props.flash.new_message_id);
    }
  }, [(_b = props.flash) == null ? void 0 : _b.new_message_id]);
  const handleRTEChange = useCallback((editedMessage) => {
    setDoesMessageExist(editedMessage.length > 0);
    setMessage(editedMessage);
  }, []);
  const handleCandidateHover = useCallback((i) => {
    setSearchResultSelection(i);
  }, [setSearchResultSelection]);
  const handleRecipientKeyPresses = useCallback((e) => {
    const selection = window.getSelection();
    let caretPosition;
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      caretPosition = range.startOffset;
    }
    if (e.key === "Backspace") {
      if (caretPosition === 0) {
        setSearchResults([]);
        if (recipients.length > 0) {
          setRecipients((prev) => prev.slice(0, prev.length - 1));
        }
      }
      return;
    }
    const resultsRef = resultsContainer.current;
    if (e.key === "Escape") {
      e.preventDefault();
      setSearchResults([]);
      setSearchTerm("");
      setSearchResultSelection(-1);
      return;
    }
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      if (!resultsRef.children[searchResultSelection]) {
        return;
      }
      e.preventDefault();
      const link = resultsRef.children[searchResultSelection].querySelector("a");
      link.click();
      return;
    }
    if (e.key === "ArrowDown") {
      if (searchResults.length <= 0 || resultsRef.children.length <= 0) {
        return;
      }
      e.preventDefault();
      let newInd = searchResultSelection;
      if (newInd === -1) {
        newInd = 0;
      } else {
        newInd = (newInd + 1) % resultsRef.children.length;
      }
      setSearchResultSelection(newInd);
      return;
    }
    if (e.key === "ArrowUp") {
      if (searchResults.length <= 0 || resultsRef.children.length <= 0) {
        return;
      }
      e.preventDefault();
      let newInd = searchResultSelection;
      if (newInd === -1) {
        newInd = Math.max(0, resultsRef.children.length - 1);
      } else {
        newInd = newInd - 1;
        newInd = newInd < 0 ? newInd + resultsRef.children.length : newInd;
      }
      setSearchResultSelection(newInd);
      return;
    }
  }, [
    recipients,
    setRecipients,
    searchResultSelection,
    setSearchTerm,
    searchResults,
    setSearchResults
  ]);
  const handleXButton = useCallback((e, ind) => {
    e.preventDefault();
    setRecipients((prev) => prev.filter((r, i) => i !== ind));
  }, [setRecipients]);
  const handleRecipientSelect = useCallback((e, user2) => {
    e.preventDefault();
    recipientSpanRef.current.innerHTML = "";
    setSearchTerm("");
    setRecipients((prev) => [...prev, user2]);
    setSearchResults([]);
    setSearchResultSelection(-1);
    recipientSpanRef.current.focus();
  }, [setRecipients, setSearchResults, searchResultSelection]);
  const handleRecipientSearchTermChange = useCallback((e) => {
    if (recipients.length >= 5) {
      recipientSpanRef.current.innerText = "";
      setError("You can mail up to five people.");
      return;
    }
    const search = () => {
      const newVal = recipientSpanRef.current.innerText.trim();
      const hasChanged = newVal !== searchTerm;
      setSearchTerm(newVal);
      if (newVal.length <= 0) {
        setSearchResults([]);
        setSearchResultSelection(-1);
        return;
      }
      if (hasChanged) {
        axios.get(`/api/usersearch/${encodeURIComponent(newVal)}`).then((res) => res.data).then((data) => {
          const existingIds = new Set(recipients.map((r) => r.id));
          const filtered = data.filter((datum) => !existingIds.has(datum.id) && datum.id !== user.id);
          setSearchResults(filtered);
          setSearchResultSelection(0);
        }).catch((err) => console.error("Search error:", err));
      }
    };
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(search, 200);
  }, [searchTerm, setSearchTerm, setSearchResults, recipients, user]);
  useEffect(() => {
    if (!recipientSpanRef.current) {
      return;
    }
    const spanRef = recipientSpanRef.current;
    spanRef.addEventListener("keydown", handleRecipientKeyPresses);
    spanRef.addEventListener("input", handleRecipientSearchTermChange);
    return () => {
      spanRef.removeEventListener("keydown", handleRecipientKeyPresses);
      spanRef.removeEventListener("input", handleRecipientSearchTermChange);
    };
  }, [handleRecipientSearchTermChange, handleRecipientKeyPresses]);
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const appUrl = props.app_url;
    const dehydratedMessage = dehydrateEditorImagePaths(message, appUrl);
    const messageWithResizedImages = await processEditorImages(dehydratedMessage);
    setError("");
    setIsSubmitting(true);
    try {
      if (!isNew && conversation) {
        router.post("/dashboard/mail", {
          conversation_id: conversation.id,
          content: messageWithResizedImages,
          parent_id: originalMessage == null ? void 0 : originalMessage.id
        }, {
          preserveScroll: true,
          onSuccess: () => {
            setMessage("");
            setIsSubmitting(false);
          },
          onError: (err) => {
            setError(getErrorMessage(err));
            setIsSubmitting(false);
          }
        });
      } else {
        router.post("/dashboard/mail", {
          content: messageWithResizedImages,
          parent_id: originalMessage == null ? void 0 : originalMessage.id,
          recipients: recipients.map((r) => r.id),
          subject
        }, {
          onSuccess: () => {
            setMessage("");
            setIsSubmitting(false);
          },
          onError: (err) => {
            setError(getErrorMessage(err));
            setIsSubmitting(false);
          }
        });
      }
    } catch (err) {
      const msg = getErrorMessage(error);
      setError(msg);
      setIsSubmitting(false);
    }
  }, [originalMessage, message, recipients, subject, getErrorMessage, conversation]);
  const handleDelete = useCallback(async (id) => {
    const isConfirmed = window.confirm("Delete message?");
    if (!isConfirmed) {
      return;
    }
    setError("");
    setIsSubmitting(true);
    router.delete(`/dashboard/mail/${id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setIsSubmitting(false);
      },
      onError: (err) => {
        setError(getErrorMessage(err));
        setIsSubmitting(false);
      }
    });
  }, []);
  const handleReply = useCallback((message2, elementID, isQuote = false) => {
    setOriginalMessage(message2);
    setOriginalMessageElement(elementID);
    if (isQuote) {
      const appUrl = props.app_url;
      const hydrated = hydrateEditorImagePaths(message2.content, appUrl);
      setQuotedMessage({
        ...message2,
        content: hydrated
      });
    }
  }, []);
  const handleClearQuote = useCallback(() => {
    setQuotedMessage(null);
  }, []);
  return /* @__PURE__ */ jsxs(DashboardLayout, { currentTab: "mail", children: [
    /* @__PURE__ */ jsx(PageHead, { title: "Conversation" }),
    /* @__PURE__ */ jsx("div", { className: "centered-content no-margin side-padded", children: /* @__PURE__ */ jsx("h1", { dangerouslySetInnerHTML: { __html: convoName } }) }),
    !isNew && /* @__PURE__ */ jsxs("div", { className: "footnote", children: [
      "with",
      " ",
      ((_c = conversation == null ? void 0 : conversation.other_users) == null ? void 0 : _c.length) < 1 ? /* @__PURE__ */ jsx("span", { children: "[deleted user(s)]" }) : (_d = conversation == null ? void 0 : conversation.other_users) == null ? void 0 : _d.map((u, index) => /* @__PURE__ */ jsxs("span", { children: [
        /* @__PURE__ */ jsx(Link, { href: `/${u.username}`, children: u.username }),
        index < conversation.other_users.length - 1 && ", "
      ] }, u.id))
    ] }),
    user && user.is_email_verified ? !isNew && !conversation ? /* @__PURE__ */ jsx("p", { className: "centered-content padding-1rem", children: "Loading conversation..." }) : /* @__PURE__ */ jsxs("div", { className: "messages-container", children: [
      conversation && ((_e = conversation == null ? void 0 : conversation.messages) == null ? void 0 : _e.map((message2, i) => {
        let parentElement = conversation.messages.findIndex((m) => m.id === message2.parent_id);
        parentElement = parentElement === -1 ? null : parentElement;
        return /* @__PURE__ */ jsx(
          Message$1,
          {
            message: message2,
            id: i,
            onReply: handleReply,
            onDelete: handleDelete,
            parentLocalId: parentElement
          },
          message2.id
        );
      })),
      /* @__PURE__ */ jsxs("form", { className: "message-form", onSubmit: handleSubmit, children: [
        error && /* @__PURE__ */ jsx("div", { className: "error", children: error }),
        isNew && /* @__PURE__ */ jsxs("dl", { className: "side-padded-on-mobile", children: [
          /* @__PURE__ */ jsx("dt", { children: /* @__PURE__ */ jsx("label", { className: "main-label", htmlFor: "", children: "recipients" }) }),
          /* @__PURE__ */ jsx("dd", { children: /* @__PURE__ */ jsxs("div", { className: "tags-container", children: [
            recipients.map((r, i) => /* @__PURE__ */ jsxs("div", { className: "tag", children: [
              /* @__PURE__ */ jsx(
                UserLink,
                {
                  user: r,
                  readOnly: true
                }
              ),
              " ",
              /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: (e) => handleXButton(e, i),
                  className: "x-button",
                  disabled: isSubmitting,
                  children: "x"
                }
              ) })
            ] }, i)),
            /* @__PURE__ */ jsx(
              "span",
              {
                contentEditable: true,
                ref: recipientSpanRef,
                tabIndex: "0"
              }
            )
          ] }) })
        ] }),
        isNew && searchResults && /* @__PURE__ */ jsx("div", { className: "results-container", ref: resultsContainer, children: searchResults.map((r, i) => /* @__PURE__ */ jsx(
          "div",
          {
            className: `tag ${searchResultSelection === i ? "selected" : ""}`,
            onMouseOver: () => handleCandidateHover(i),
            children: /* @__PURE__ */ jsx(
              UserLink,
              {
                user: r,
                onClick: handleRecipientSelect,
                returnUser: true,
                preventDefault: true
              }
            )
          },
          i
        )) }),
        isNew && /* @__PURE__ */ jsx(
          FormField,
          {
            id: "subject",
            label: "subject",
            placeholder: "(optional)",
            value: subject,
            onChange: (e) => setSubject(e.target.value),
            disabled: isSubmitting,
            type: "text",
            isInline: false,
            classes: "side-padded-on-mobile"
          }
        ),
        /* @__PURE__ */ jsx(
          RichTextEditor,
          {
            placeholder: "your message",
            disabled: isSubmitting,
            onChange: handleRTEChange,
            value: message,
            quotedMessage,
            onQuoteApplied: handleClearQuote
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: isSubmitting || !canSubmit,
            className: "side-margin-on-mobile",
            children: "send"
          }
        )
      ] })
    ] }) : /* @__PURE__ */ jsx("p", { className: "centered-content padding-1rem", children: "Please verify your e-mail to begin mailing other users." })
  ] });
}
const __vite_glob_0_21 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Conversation
}, Symbol.toStringTag, { value: "Module" }));
function DeleteAccount() {
  const { app_name } = usePage().props;
  const [agreeVal, setAgreeVal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const onAgreeChange = (e) => {
    setAgreeVal(e.target.checked);
  };
  const handleDelete = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    router.post("/dashboard/delete-account", {}, {
      onFinish: () => setIsSubmitting(false)
    });
  };
  return /* @__PURE__ */ jsxs(DashboardLayout, { currentTab: "profile", headerText: "delete account", headerHasMargin: false, children: [
    /* @__PURE__ */ jsx(Head, { title: "Delete Account" }),
    /* @__PURE__ */ jsxs("div", { className: "article-text no-bottom-padding limited-width", children: [
      /* @__PURE__ */ jsxs("p", { children: [
        " ",
        app_name,
        " will keep your data for 30 days and give you the option to reverse your decision from the dashboard. "
      ] }),
      /* @__PURE__ */ jsx("p", { children: " Your profile and posts will all be immediately hidden from other users. " }),
      /* @__PURE__ */ jsx("p", { children: " If no action is taken, your member information and all posts & uploaded media will be completely removed from our database after 30 days." })
    ] }),
    /* @__PURE__ */ jsx("form", { onSubmit: handleDelete, children: /* @__PURE__ */ jsxs("div", { className: "flex-column", children: [
      /* @__PURE__ */ jsx(
        CheckboxField,
        {
          name: "account-deletion-agree",
          label: "Yes, I want to permanently delete my account",
          value: agreeVal,
          onChange: onAgreeChange,
          disabled: isSubmitting,
          classes: "centered-content no-margin auto-width wrappable"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex-row", children: [
        /* @__PURE__ */ jsx("button", { type: "submit", className: "red-button", disabled: !agreeVal || isSubmitting, children: "delete account" }),
        /* @__PURE__ */ jsx(Link, { href: "/dashboard", className: "link-button", children: "cancel" })
      ] })
    ] }) })
  ] });
}
const __vite_glob_0_23 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: DeleteAccount
}, Symbol.toStringTag, { value: "Module" }));
function ImageField({ index, image = null, file = null, alt = "", setArray, onImageChange, onAltChange, onRemove, disabled = false }) {
  const [previewImage, setPreviewImage] = useState(image);
  const [imageError, setImageError] = useState("");
  const [altError, setAltError] = useState("");
  const imageFieldRef = useRef(null);
  const imageInputRef = useRef(null);
  const dragCounterRef = useRef(0);
  useEffect(() => {
    if (image) {
      setPreviewImage(image);
    }
  }, [image, setPreviewImage]);
  useEffect(() => {
    if (!file) {
      return;
    }
    const dT = new DataTransfer();
    dT.items.add(file);
    imageInputRef.current.files = dT.files;
  }, [
    file
    /*imageInputRef.current*/
  ]);
  const handleDroppedImage = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    if (imageFieldRef.current) {
      imageFieldRef.current.classList.toggle("dragged-over", false);
    }
    setImageError("");
    const file2 = getImageFileFromInput(e);
    if (!file2) {
      setImageError("Files must be images of type jpg, png, webp or bmp.");
      return;
    }
    const url = await getImageUrlFromFile(file2);
    onImageChange(index, file2, url);
    setPreviewImage(url);
  }, [
    dragCounterRef,
    imageFieldRef,
    index,
    setImageError,
    onImageChange,
    setPreviewImage
  ]);
  useEffect(() => {
    const fieldCont = imageFieldRef.current;
    if (!fieldCont) {
      return;
    }
    const cleanup = addImageDragListeners(fieldCont, dragCounterRef, handleDroppedImage);
    return cleanup;
  }, [imageFieldRef, dragCounterRef, handleDroppedImage]);
  const removeSelf = useCallback((e) => {
    onRemove();
    e.preventDefault();
    setArray((prevFields) => {
      const filteredArray = prevFields.filter((field) => field.index !== index);
      const reindexedArray = filteredArray.map((field, i) => {
        return { ...field, index: i };
      });
      return reindexedArray;
    });
  }, [index, setArray, onRemove]);
  const handleFileChange = useCallback(async (e) => {
    setImageError("");
    const file2 = getImageFileFromInput(e);
    if (!file2) {
      setImageError("Must be .jpeg, .png, .webp, or .bmp");
      return;
    }
    const selectedFileUrl = await getImageUrlFromFile(file2);
    setPreviewImage(selectedFileUrl);
    onImageChange(index, file2, selectedFileUrl);
  }, [setImageError, onImageChange, index]);
  const handleAltChange = useCallback((e) => {
    setAltError("");
    let altText = e.target.value;
    if (altText.length > 500) {
      altText = altText.substring(0, 500);
      setAltError("alt text cannot be longer than 500 characters");
    }
    onAltChange(index, altText);
  }, [setAltError, index, onAltChange]);
  return /* @__PURE__ */ jsxs("div", { className: "image-field", ref: imageFieldRef, children: [
    /* @__PURE__ */ jsx(PageHead, { title: "Image Field" }),
    imageError && /* @__PURE__ */ jsx("div", { className: "error", children: imageError }),
    altError && /* @__PURE__ */ jsx("div", { className: "error", children: altError }),
    /* @__PURE__ */ jsxs("div", { className: "sub-field", children: [
      /* @__PURE__ */ jsxs("div", { className: "remove-input-container", children: [
        /* @__PURE__ */ jsx("span", { className: "button-container", children: /* @__PURE__ */ jsx("button", { type: "button", onClick: removeSelf, disabled, children: "-" }) }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "file",
            accept: ".jpg, .jpeg, .png, .webp, .bmp",
            name: "gal_images[]",
            id: `gal_image_${index}`,
            onChange: handleFileChange,
            ref: imageInputRef,
            disabled
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "alt-input-container", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: `alt_${index}`, children: "alt text" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            name: "alts[]",
            id: `alt_${index}`,
            value: alt ?? "",
            onChange: handleAltChange,
            disabled
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: previewImage ? "img-preview-container" : "img-preview-container hidden", children: [
      /* @__PURE__ */ jsx("img", { src: previewImage, alt }),
      /* @__PURE__ */ jsx("div", { className: "loading hidden", children: "loading" })
    ] })
  ] });
}
const __vite_glob_0_27 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ImageField
}, Symbol.toStringTag, { value: "Module" }));
const IMAGE_LIMIT = 15;
const createInitialImageFields = (post = null, user, postUrl, appUrl) => {
  if (post) {
    const images = post.gallery_image_urls;
    if (!images) {
      return null;
    }
    const alts = post.gallery_alts;
    return images.map((image, i) => ({
      index: i,
      image: `${appUrl}/storage/images/uploaded/users/${user.username}/posts/${postUrl}/gallery/thumb/${image}`,
      alt: !alts || alts[i] == "null" ? "" : alts[i],
      value: image,
      type: "old"
    }));
  } else {
    return [];
  }
};
function hasImages(fields) {
  let hasImg = false;
  for (let i = 0; i < fields.length; ++i) {
    if (fields[i].image) {
      hasImg = true;
      break;
    }
  }
  return hasImg;
}
function PostForm({ isCreateForm = true, post = null, user, category = Category.Archive }) {
  const { props } = usePage();
  const appUrl = props.app_url;
  const hydratedStatement = (post == null ? void 0 : post.statement) ? hydrateEditorImagePaths(post.statement, appUrl) : null;
  const { data, setData, errors, setError, clearErrors } = useForm({
    post_url: (post == null ? void 0 : post.post_url) || "",
    title: (post == null ? void 0 : post.title) || "",
    subtitle: (post == null ? void 0 : post.subtitle) || "",
    website: (post == null ? void 0 : post.website) || "",
    source_code: (post == null ? void 0 : post.sourceCode) || "",
    main_video: (post == null ? void 0 : post.main_video) || "",
    main_video_raw: (post == null ? void 0 : post.main_video) || "",
    premiere_date: (post == null ? void 0 : post.premiere_date) || "",
    is_private: post ? !!post.is_private : false,
    is_draft: post ? !!post.is_draft : true,
    is_news: post ? !!post.is_news : category == Category.News,
    statement: hydratedStatement
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [hasChanged, setHasChanged] = useState(false);
  const [initialStatement, setInitialStatement] = useState(hydratedStatement);
  const [isTitleValid, setIsTitleValid] = useState(!!post);
  const [isPostUrlValid, setIsPostUrlValid] = useState(!!post);
  const [isSubtitleValid, setIsSubtitleValid] = useState(!!post);
  const [isWebsiteValid, setIsWebsiteValid] = useState(true);
  const [isSourceCodeValid, setIsSourceCodeValid] = useState(true);
  const [isMainVideoValid, setIsMainVideoValid] = useState(!!(post == null ? void 0 : post.main_video));
  const galleryContainerRef = useRef(null);
  const [imageFields, setImageFields] = useState(createInitialImageFields(post, user, (post == null ? void 0 : post.post_url) || "", appUrl));
  const dragCounterRef = useRef(0);
  const canSubmit = data.title && isTitleValid && data.post_url && isPostUrlValid && data.subtitle && isSubtitleValid && (data.website && isWebsiteValid || !data.website) && (data.source_code && isSourceCodeValid || !data.source_code) && imageFields.length > 0 && hasImages(imageFields) && (hasChanged || (post == null ? void 0 : post.is_draft));
  const buttonText = !post || post.is_draft ? "publish" : "update";
  const loadingText = "loading form...";
  const isFormReady = isCreateForm || post;
  useEffect(() => {
    if (!post) return;
    const hydr = hydrateEditorImagePaths(post.statement, appUrl);
    setData({
      post_url: post.post_url || "",
      title: post.title || "",
      subtitle: post.subtitle || "",
      website: post.website || "",
      source_code: post.sourceCode || "",
      main_video: post.main_video || "",
      main_video_raw: post.main_video || "",
      premiere_date: post.premiere_date || "",
      is_private: !!post.is_private,
      is_draft: !!post.is_draft,
      is_news: !!post.is_news,
      statement: hydr
    });
    setIsTitleValid(true);
    setIsPostUrlValid(true);
    setIsSubtitleValid(true);
    setIsWebsiteValid(true);
    setIsSourceCodeValid(true);
    setIsMainVideoValid(!!post.main_video);
    setInitialStatement(hydr);
    setImageFields(createInitialImageFields(post, user, post.post_url, appUrl));
    setHasChanged(false);
  }, [post, user, setData]);
  const onSubmit = useCallback(async (e, asDraft = false) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess("");
    clearErrors();
    const resizedGalleryImages = [];
    for (let i = 0; i < imageFields.length; ++i) {
      const file = imageFields[i].value;
      if (!file || imageFields[i].type === "old") {
        resizedGalleryImages.push(imageFields[i]);
        continue;
      }
      const resizedBlob = await resizeImage(file, true);
      const resizedImageFile = new File([resizedBlob], file.name, { type: file.type });
      const newField = { ...imageFields[i], value: resizedImageFile };
      resizedGalleryImages.push(newField);
    }
    const dehydratedStatement = dehydrateEditorImagePaths(data.statement, appUrl);
    const statementWithResizedImages = await processEditorImages(dehydratedStatement);
    try {
      const message = isCreateForm ? "Post successfully created." : "Post successfully updated.";
      const formData = new FormData();
      formData.append("post_url", data.post_url);
      formData.append("title", data.title);
      formData.append("subtitle", data.subtitle);
      formData.append("website", data.website || "");
      formData.append("source_code", data.source_code || "");
      formData.append("main_video", data.main_video || "");
      formData.append("premiere_date", data.premiere_date || "");
      formData.append("is_private", data.is_private ? "1" : "0");
      formData.append("is_draft", asDraft ? "1" : "0");
      formData.append("is_news", data.is_news ? "1" : "0");
      formData.append("statement", statementWithResizedImages || "");
      resizedGalleryImages.forEach((field, idx) => {
        if (field.type === "new" && field.value) {
          formData.append(`gallery_images[${idx}][file]`, field.value);
        } else if (field.type === "old") {
          formData.append(`gallery_images[${idx}][url]`, field.value);
        }
        formData.append(`gallery_images[${idx}][alt]`, field.alt || "");
      });
      if (isCreateForm) {
        router.post("/posts", formData, {
          preserveState: false,
          preserveScroll: true,
          onError: (errs) => {
            for (const key in errs) {
              setError(key, errs[key]);
            }
            setIsSubmitting(false);
          }
        });
      } else {
        formData.append("_method", "PUT");
        router.post(`/posts/${post.id}`, formData, {
          preserveState: false,
          preserveScroll: true,
          onError: (errs) => {
            for (const key in errs) {
              setError(key, errs[key]);
            }
            setIsSubmitting(false);
          }
        });
      }
    } catch (err) {
      if (err && typeof err === "object" && !err.response && !err.message) {
        for (const key in err) {
          setError(key, err[key]);
        }
      } else {
        const msg = getErrorMessage(err);
        setError("general", msg);
      }
      setIsSubmitting(false);
    }
  }, [isCreateForm, post, data, imageFields, clearErrors, setError]);
  const handleDelete = useCallback(async () => {
    clearErrors();
    setSuccess("");
    if (!window.confirm("Delete post?")) return;
    setIsSubmitting(true);
    try {
      await new Promise((resolve, reject) => {
        router.delete(`/posts/${post.id}`, {}, {
          preserveState: false,
          preserveScroll: true,
          onSuccess: () => resolve(),
          onError: (errs) => reject(errs),
          onFinish: () => setIsSubmitting(false)
        });
      });
    } catch (err) {
      if (err && typeof err === "object" && !err.response && !err.message) {
        for (const key in err) {
          setError(key, err[key]);
        }
      } else {
        const msg = getErrorMessage(err);
        setError("general", msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [post, setError, clearErrors]);
  const handleMainVideoValidation = useCallback((proposedUrl, setFieldLocalError) => {
    setFieldLocalError("");
    const embedUrl = getVideoEmbedUrl(proposedUrl);
    setIsMainVideoValid(!!embedUrl);
    if (embedUrl) {
      setData("main_video", embedUrl);
    } else {
      setFieldLocalError("Must be a valid link from YouTube, DailyMotion, or Vimeo.");
    }
  }, [setData]);
  const handlePostUrlValidation = useCallback((proposedUrl, setFieldLocalError) => {
    if (proposedUrl.length < 1) {
      setFieldLocalError("URL required.");
      setIsPostUrlValid(false);
      return;
    }
    const isValid = isAlphaDash(proposedUrl);
    setIsPostUrlValid(isValid);
    if (!isValid) {
      setFieldLocalError("URL may only contain letters, numbers, _ and -");
      return;
    }
    setFieldLocalError("");
  }, []);
  const handleWebsiteValidation = useCallback((proposedUrl, setFieldLocalError) => {
    const isValid = isUrl(proposedUrl);
    setIsWebsiteValid(isValid);
    if (proposedUrl && !isValid) {
      setFieldLocalError("Not a valid URL.");
      return;
    }
    setFieldLocalError("");
  }, []);
  const handleSourceCodeValidation = useCallback((proposedUrl, setFieldLocalError) => {
    const isValid = isUrl(proposedUrl);
    setIsSourceCodeValid(isValid);
    if (proposedUrl && !isValid) {
      setFieldLocalError("Not a valid URL.");
      return;
    }
    setFieldLocalError("");
  }, []);
  const handleSubtitleValidation = useCallback((proposedSubtitle, setFieldLocalError) => {
    if (!proposedSubtitle) {
      setFieldLocalError("Subtitle required.");
      setIsSubtitleValid(false);
      return;
    }
    if (proposedSubtitle.length > 255) {
      setFieldLocalError("Must be less than 255 characters.");
      setIsSubtitleValid(false);
      return;
    }
    setFieldLocalError("");
    setIsSubtitleValid(true);
  }, []);
  const handleTitleValidation = useCallback((proposedTitle, setFieldLocalError) => {
    if (!proposedTitle) {
      setFieldLocalError("Title required.");
      setIsTitleValid(false);
      return;
    }
    if (proposedTitle.length > 255) {
      setFieldLocalError("Must be less than 255 characters.");
      setIsTitleValid(false);
      return;
    }
    setFieldLocalError("");
    setIsTitleValid(true);
  }, []);
  const handleAddImage = useCallback(() => {
    clearErrors("general");
    if (imageFields.length >= IMAGE_LIMIT) {
      setError("general", "Max amount of images is 15. Input truncated.");
      return;
    }
    setImageFields((prev) => [...prev, { index: prev.length, image: null, alt: "", value: null, type: "new" }]);
    setHasChanged(true);
  }, [imageFields.length, setError, clearErrors]);
  const onImageChange = useCallback((index, file, imageUrl) => {
    setHasChanged(true);
    setImageFields((prev) => prev.map((field) => field.index === index ? { ...field, value: file, image: imageUrl, type: "new" } : field));
  }, []);
  const onAltChange = useCallback((index, altText) => {
    setHasChanged(true);
    setImageFields((prev) => prev.map((field) => field.index === index ? { ...field, alt: altText } : field));
  }, []);
  const handleDroppedImages = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    if (galleryContainerRef.current) galleryContainerRef.current.classList.toggle("dragged-over", false);
    clearErrors("general");
    let localErr = "";
    const input = getImageFilesFromInput(e);
    if (input.error) localErr = input.error;
    const imagesToProcess = input.images || [];
    let newFields = [];
    for (const file of imagesToProcess) {
      const url = await getImageUrlFromFile(file);
      newFields.push({ index: -1, image: url, alt: "", value: file, type: "new" });
    }
    setImageFields((prev) => {
      let combined = [...prev, ...newFields];
      let reindexed = combined.map((f, i) => ({ ...f, index: i }));
      if (reindexed.length >= IMAGE_LIMIT) {
        localErr = (localErr ? localErr + " " : "") + "Max amount of images is 15.";
        reindexed = reindexed.slice(0, IMAGE_LIMIT);
      }
      if (localErr) setError("general", localErr);
      return reindexed;
    });
    setHasChanged(true);
  }, [clearErrors, setError]);
  useEffect(() => {
    const galCont = galleryContainerRef.current;
    if (!galCont) return;
    return addImageDragListeners(galCont, dragCounterRef, handleDroppedImages);
  }, [handleDroppedImages]);
  return /* @__PURE__ */ jsxs("div", { className: "main-info-delete-container", children: [
    /* @__PURE__ */ jsx(PageHead, { title: "Post Form" }),
    isFormReady ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "main-info-box transparent-background stretch", children: /* @__PURE__ */ jsxs("form", { onSubmit: (e) => onSubmit(e, false), children: [
        /* @__PURE__ */ jsxs("div", { className: "text-fields-container", children: [
          errors.general && /* @__PURE__ */ jsx("div", { className: "error", children: errors.general }),
          success && /* @__PURE__ */ jsx("div", { className: "notice", children: success }),
          /* @__PURE__ */ jsxs("div", { className: "horizontal-buttons-container", children: [
            (!post || post.is_draft) && /* @__PURE__ */ jsx("button", { type: "button", onClick: (e) => onSubmit(e, true), disabled: isSubmitting || !canSubmit, children: "save draft" }),
            /* @__PURE__ */ jsx("button", { type: "submit", disabled: isSubmitting || !canSubmit, children: buttonText })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "footnote", children: "Fields with an * are required." }),
          /* @__PURE__ */ jsx(
            FormField,
            {
              id: "post_url",
              label: "post url*",
              placeholder: "used in page url",
              value: data.post_url,
              onChange: (e) => {
                setHasChanged(true);
                setData("post_url", e.target.value);
              },
              onValidate: handlePostUrlValidation,
              disabled: isSubmitting,
              type: "text",
              isInline: true,
              classes: "inline-form-field",
              error: errors.post_url,
              onErrorUpdate: (id, msg) => msg ? setError(id, msg) : clearErrors(id)
            }
          ),
          /* @__PURE__ */ jsx(
            FormField,
            {
              id: "title",
              label: "title*",
              placeholder: "work title",
              value: data.title,
              onChange: (e) => {
                setHasChanged(true);
                setData("title", e.target.value);
              },
              onValidate: handleTitleValidation,
              disabled: isSubmitting,
              type: "text",
              isInline: true,
              classes: "inline-form-field",
              error: errors.title,
              onErrorUpdate: (id, msg) => msg ? setError(id, msg) : clearErrors(id)
            }
          ),
          /* @__PURE__ */ jsx(
            FormField,
            {
              id: "subtitle",
              label: "subtitle*",
              placeholder: "short description",
              value: data.subtitle,
              onChange: (e) => {
                setHasChanged(true);
                setData("subtitle", e.target.value);
              },
              onValidate: handleSubtitleValidation,
              disabled: isSubmitting,
              type: "text",
              isInline: true,
              classes: "inline-form-field",
              error: errors.subtitle,
              onErrorUpdate: (id, msg) => msg ? setError(id, msg) : clearErrors(id)
            }
          ),
          /* @__PURE__ */ jsx(
            FormField,
            {
              id: "premiere_date",
              label: "premiere date",
              placeholder: "e.g. YYYY-MM-DD",
              value: data.premiere_date,
              onChange: (e) => {
                setHasChanged(true);
                setData("premiere_date", e.target.value);
              },
              disabled: isSubmitting,
              type: "date",
              isInline: true,
              classes: "inline-form-field",
              error: errors.premiere_date,
              onErrorUpdate: (id, msg) => msg ? setError(id, msg) : clearErrors(id)
            }
          ),
          /* @__PURE__ */ jsx(
            FormField,
            {
              id: "website",
              label: "website",
              placeholder: "url of the work",
              value: data.website,
              onChange: (e) => {
                setHasChanged(true);
                setData("website", e.target.value);
              },
              onValidate: handleWebsiteValidation,
              disabled: isSubmitting,
              type: "text",
              isInline: true,
              classes: "inline-form-field",
              error: errors.website,
              onErrorUpdate: (id, msg) => msg ? setError(id, msg) : clearErrors(id)
            }
          ),
          /* @__PURE__ */ jsx(
            FormField,
            {
              id: "source_code",
              label: "source code",
              placeholder: "eg. Github repo",
              value: data.source_code,
              onChange: (e) => {
                setHasChanged(true);
                setData("source_code", e.target.value);
              },
              onValidate: handleSourceCodeValidation,
              disabled: isSubmitting,
              type: "text",
              isInline: true,
              classes: "inline-form-field",
              error: errors.source_code,
              onErrorUpdate: (id, msg) => msg ? setError(id, msg) : clearErrors(id)
            }
          ),
          /* @__PURE__ */ jsx(
            FormField,
            {
              id: "main_video_raw",
              label: "main video",
              placeholder: "YouTube, DailyMotion, or Vimeo",
              value: data.main_video_raw,
              onChange: (e) => {
                setHasChanged(true);
                setData("main_video_raw", e.target.value);
              },
              onValidate: handleMainVideoValidation,
              disabled: isSubmitting,
              type: "text",
              isInline: true,
              classes: "inline-form-field",
              error: errors.main_video,
              onErrorUpdate: (id, msg) => msg ? setError("main_video", msg) : clearErrors("main_video")
            }
          ),
          isMainVideoValid && data.main_video && /* @__PURE__ */ jsx(VideoIframe, { url: data.main_video }),
          /* @__PURE__ */ jsx(
            CheckboxField,
            {
              name: "is-private",
              label: "is private",
              onChange: (e) => {
                setHasChanged(true);
                setData("is_private", e.target.checked);
              },
              disabled: isSubmitting,
              value: data.is_private
            }
          ),
          user.member_type == MemberType.Webmaster && /* @__PURE__ */ jsx(
            CheckboxField,
            {
              name: "is-news",
              label: "is news",
              onChange: (e) => {
                setHasChanged(true);
                setData("is_news", e.target.checked);
              },
              disabled: isSubmitting,
              value: data.is_news
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "rte-container", children: [
            /* @__PURE__ */ jsx("div", { className: "centered-content", children: /* @__PURE__ */ jsx("h3", { children: "artist statement" }) }),
            /* @__PURE__ */ jsx(
              RichTextEditor,
              {
                placeholder: "description of the work",
                disabled: isSubmitting,
                onChange: (val) => {
                  setData("statement", val);
                  setHasChanged(val !== initialStatement);
                },
                value: data.statement
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "multi-field-container", ref: galleryContainerRef, children: [
          /* @__PURE__ */ jsxs("div", { className: "field-button-image-fields-container", children: [
            /* @__PURE__ */ jsx("div", { className: "field-button-container top-align", children: /* @__PURE__ */ jsxs("div", { className: "main-label-container", children: [
              /* @__PURE__ */ jsx("label", { className: "main-label", children: "gallery images*" }),
              /* @__PURE__ */ jsx("span", { className: "button-container", children: /* @__PURE__ */ jsx(
                "button",
                {
                  className: "small-but",
                  type: "button",
                  onClick: handleAddImage,
                  disabled: isSubmitting || imageFields.length >= IMAGE_LIMIT,
                  children: "+"
                }
              ) }),
              /* @__PURE__ */ jsx("p", { children: "drag & drop" })
            ] }) }),
            imageFields.map((field) => /* @__PURE__ */ jsx(
              ImageField,
              {
                index: field.index,
                image: field.image,
                file: field.type === "new" ? field.value : null,
                alt: field.alt,
                setArray: setImageFields,
                onImageChange,
                onAltChange,
                onRemove: () => setHasChanged(true),
                disabled: isSubmitting
              },
              field.index
            ))
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "horizontal-buttons-container reverse-row", children: [
            (!post || post.is_draft) && /* @__PURE__ */ jsx("button", { type: "button", onClick: (e) => onSubmit(e, true), disabled: isSubmitting || !canSubmit, children: "save draft" }),
            /* @__PURE__ */ jsx("button", { type: "submit", disabled: isSubmitting || !canSubmit, children: buttonText })
          ] })
        ] })
      ] }) }),
      !isCreateForm && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "red-button",
          onClick: handleDelete,
          disabled: isSubmitting,
          children: "delete"
        }
      )
    ] }) : /* @__PURE__ */ jsx("p", { className: "loading", children: loadingText })
  ] });
}
const __vite_glob_0_35 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: PostForm
}, Symbol.toStringTag, { value: "Module" }));
function EditPost({ post: initialPost }) {
  var _a;
  const { props } = usePage();
  const user = (_a = props == null ? void 0 : props.auth) == null ? void 0 : _a.user;
  const [post, setPost] = useState(initialPost);
  return /* @__PURE__ */ jsxs(
    DashboardLayout,
    {
      currentTab: "",
      headerText: "edit post",
      children: [
        /* @__PURE__ */ jsx(PageHead, { title: "Edit Post" }),
        (post == null ? void 0 : post.is_hidden_by_admin) && /* @__PURE__ */ jsx(HiddenPostNotice, { classes: "no-margin" }),
        /* @__PURE__ */ jsx(
          PostForm,
          {
            isCreateForm: false,
            user,
            post
          }
        )
      ]
    }
  );
}
const __vite_glob_0_25 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: EditPost
}, Symbol.toStringTag, { value: "Module" }));
function LikedPosts() {
  const [screenSize, setScreenSize] = useState(getScreenSize());
  return /* @__PURE__ */ jsxs(DashboardLayout, { currentTab: "activity", headerText: "liked posts", children: [
    /* @__PURE__ */ jsx(PageHead, { title: "Liked Posts" }),
    /* @__PURE__ */ jsx(
      AutoloadTilesContainer,
      {
        screenSize,
        isDashboard: false,
        partialProp: "likedPosts",
        fetchOrder: FetchOrder.Descending
      }
    )
  ] });
}
const __vite_glob_0_28 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: LikedPosts
}, Symbol.toStringTag, { value: "Module" }));
function ConversationPreview({ conversation }) {
  const { props } = usePage();
  const otherUser = conversation.other_users[0];
  const avatar = (otherUser == null ? void 0 : otherUser.avatar) ? `${props.app_url}/storage/images/uploaded/users/${otherUser.username}/avatar/small/${otherUser == null ? void 0 : otherUser.avatar}` : `${props.app_url}/storage/images/defaults/avatar.webp?v=1`;
  const avatarAlt = (otherUser == null ? void 0 : otherUser.username) ? `${otherUser.username}'s avatar` : "Deleted user. Showing default avatar.";
  const latestSenderName = conversation.latest_message.sender ? conversation.latest_message.sender.username : "[deleted user]";
  const usersString = conversation.users.map((user) => user.username).join(", ");
  const convoLink = `/dashboard/mail/${conversation.id}`;
  let avatarClasses = "convo-avatar";
  avatarClasses += conversation.is_unread ? " has-new-mail" : "";
  return conversation ? /* @__PURE__ */ jsxs(
    Link,
    {
      href: convoLink,
      className: "convo-preview",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "convo-avatar-key-info", children: [
          /* @__PURE__ */ jsxs("div", { className: avatarClasses, children: [
            /* @__PURE__ */ jsx("img", { className: "round-image", src: avatar, alt: avatarAlt }),
            /* @__PURE__ */ jsx("div", { className: "notice-light" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "convo-key-info", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "convo-title",
                dangerouslySetInnerHTML: { __html: conversation.name }
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "other-users subtext", children: `${usersString}・${getDateAsYYYYMMDD(conversation.created_at)}` })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "convo-latest-info", children: [
          /* @__PURE__ */ jsx("div", { className: "convo-latest-date", children: getDateAsYYYYMMDD(conversation.latest_message.created_at) }),
          /* @__PURE__ */ jsx("div", { className: "convo-latest-sender subtext", children: latestSenderName })
        ] })
      ]
    }
  ) : /* @__PURE__ */ jsx("p", { children: "loading..." });
}
const __vite_glob_0_37 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ConversationPreview
}, Symbol.toStringTag, { value: "Module" }));
function DashboardCreateHeader({ headerText, createLink, isVerified = true }) {
  return /* @__PURE__ */ jsxs("div", { className: "centered-header-box", children: [
    /* @__PURE__ */ jsx(PageHead, { title: "Dashboard Create Header" }),
    /* @__PURE__ */ jsx("div", { className: "centered-content no-margin", children: /* @__PURE__ */ jsx("h1", { children: headerText }) }),
    isVerified && /* @__PURE__ */ jsx("div", { className: "right-item", children: /* @__PURE__ */ jsx(
      Link,
      {
        href: createLink,
        className: "plus-button link-button",
        children: "+"
      }
    ) })
  ] });
}
const __vite_glob_0_38 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: DashboardCreateHeader
}, Symbol.toStringTag, { value: "Module" }));
function Mail() {
  var _a;
  const { props } = usePage();
  const user = (_a = props.auth) == null ? void 0 : _a.user;
  const { conversations } = props;
  useEffect(() => {
    const removeListener = router.on("restore", () => {
      router.reload({ only: ["conversations", "unread"] });
    });
    return () => removeListener();
  }, []);
  return /* @__PURE__ */ jsxs(DashboardLayout, { currentTab: "mail", children: [
    /* @__PURE__ */ jsx(PageHead, { title: "Mail" }),
    user && user.is_email_verified ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        DashboardCreateHeader,
        {
          headerText: "mailbox",
          createLink: "/dashboard/mail/new"
        }
      ),
      /* @__PURE__ */ jsx(
        LoadItems,
        {
          partialProp: "conversations",
          initialItems: conversations,
          renderMethod: (item) => ({
            conversation: item
          }),
          Component: ConversationPreview,
          itemString: "conversations",
          isFullPage: true,
          classes: ""
        }
      )
    ] }) : /* @__PURE__ */ jsx("p", { className: "centered-content padding-1rem", children: "Please verify your e-mail to begin mailing other users." })
  ] });
}
const __vite_glob_0_29 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Mail
}, Symbol.toStringTag, { value: "Module" }));
function MyPosts() {
  var _a;
  const [screenSize, setScreenSize] = useState(getScreenSize());
  const { props } = usePage();
  const user = (_a = props == null ? void 0 : props.auth) == null ? void 0 : _a.user;
  const initialPosts = (props == null ? void 0 : props.myPosts) ?? null;
  useEffect(() => {
    const cleanup = monitorScreenSize(setScreenSize);
    return cleanup;
  }, [setScreenSize]);
  return /* @__PURE__ */ jsxs(DashboardLayout, { currentTab: "posts", children: [
    /* @__PURE__ */ jsx(PageHead, { title: "My Posts" }),
    /* @__PURE__ */ jsx(
      DashboardCreateHeader,
      {
        headerText: "your posts",
        createLink: "/dashboard/new-post",
        isVerified: user == null ? void 0 : user.is_email_verified
      }
    ),
    /* @__PURE__ */ jsx(
      AutoloadTilesContainer,
      {
        screenSize,
        isDashboard: true,
        initialPosts,
        partialProp: "myPosts",
        fetchOrder: FetchOrder.Descending,
        category: Category.Archive
      }
    )
  ] });
}
const __vite_glob_0_30 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: MyPosts
}, Symbol.toStringTag, { value: "Module" }));
function NewNewsPost() {
  var _a;
  const { props } = usePage();
  const user = (_a = props.auth) == null ? void 0 : _a.user;
  return /* @__PURE__ */ jsxs(DashboardLayout, { currentTab: "post", headerText: "new post", children: [
    /* @__PURE__ */ jsx(PageHead, { title: "New News Post" }),
    user && user.is_email_verified ? /* @__PURE__ */ jsx(
      PostForm,
      {
        isCreateForm: true,
        category: Category.News,
        user
      }
    ) : /* @__PURE__ */ jsx("p", { className: "centered-content padding-1rem", children: "Verify your e-mail to begin posting." })
  ] });
}
const __vite_glob_0_31 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: NewNewsPost
}, Symbol.toStringTag, { value: "Module" }));
function NewPost() {
  var _a;
  const { props } = usePage();
  const user = (_a = props == null ? void 0 : props.auth) == null ? void 0 : _a.user;
  return /* @__PURE__ */ jsxs(
    DashboardLayout,
    {
      currentTab: "post",
      headerText: "new post",
      children: [
        /* @__PURE__ */ jsx(PageHead, { title: "New Post" }),
        user && user.is_email_verified ? /* @__PURE__ */ jsx(
          PostForm,
          {
            isCreateForm: true,
            user
          }
        ) : /* @__PURE__ */ jsx("p", { className: "centered-content padding-1rem", children: "Verify your e-mail to begin posting." })
      ]
    }
  );
}
const __vite_glob_0_32 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: NewPost
}, Symbol.toStringTag, { value: "Module" }));
function NewsPosts() {
  var _a;
  const [screenSize, setScreenSize] = useState(getScreenSize());
  const { props } = usePage();
  const user = (_a = props == null ? void 0 : props.auth) == null ? void 0 : _a.user;
  const initialPosts = (props == null ? void 0 : props.newsPosts) ?? null;
  useEffect(() => {
    const cleanup = monitorScreenSize(setScreenSize);
    return cleanup;
  }, [setScreenSize]);
  return /* @__PURE__ */ jsxs(DashboardLayout, { currentTab: "news", children: [
    /* @__PURE__ */ jsx(PageHead, { title: "News Posts" }),
    /* @__PURE__ */ jsx(
      DashboardCreateHeader,
      {
        headerText: "news posts",
        createLink: "/dashboard/new-news-post",
        isVerified: (user == null ? void 0 : user.member_type) === MemberType.Webmaster || (user == null ? void 0 : user.member_type) === MemberType.Admin
      }
    ),
    /* @__PURE__ */ jsx(
      AutoloadTilesContainer,
      {
        screenSize,
        isDashboard: true,
        initialPosts,
        partialProp: "newsPosts",
        fetchOrder: FetchOrder.Descending,
        category: Category.News
      }
    )
  ] });
}
const __vite_glob_0_33 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: NewsPosts
}, Symbol.toStringTag, { value: "Module" }));
function Notifications() {
  return /* @__PURE__ */ jsxs(DashboardLayout, { currentTab: "activity", headerText: "notifications", children: [
    /* @__PURE__ */ jsx(PageHead, { title: "Notifications" }),
    /* @__PURE__ */ jsx(
      LoadItems,
      {
        partialProp: "notifications",
        renderMethod: (notification) => ({
          notification
        }),
        fetchAmount: 10,
        Component: Notification,
        itemString: "notifications",
        isFullPage: true,
        classes: "side-padded"
      }
    )
  ] });
}
const __vite_glob_0_34 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Notifications
}, Symbol.toStringTag, { value: "Module" }));
function UserComments() {
  return /* @__PURE__ */ jsxs(DashboardLayout, { currentTab: "activity", headerText: "your comments", children: [
    /* @__PURE__ */ jsx(PageHead, { title: "User Comments" }),
    /* @__PURE__ */ jsx(
      LoadItems,
      {
        partialProp: "comments",
        renderMethod: (comment, i) => ({
          comment,
          id: i,
          isDashboard: true
        }),
        Component: Comment,
        itemString: "comments",
        isFullPage: true,
        classes: "side-padded",
        fetchAmount: 10
      }
    )
  ] });
}
const __vite_glob_0_36 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: UserComments
}, Symbol.toStringTag, { value: "Module" }));
async function resolvePageComponent(path, pages) {
  for (const p of Array.isArray(path) ? path : [path]) {
    const page = pages[p];
    if (typeof page === "undefined") {
      continue;
    }
    return typeof page === "function" ? page() : page;
  }
  throw new Error(`Page not found: ${path}`);
}
const appName = "Laravel";
createServer(
  (page) => createInertiaApp({
    page,
    render: renderToString,
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
      const pagePromise = resolvePageComponent(`./Pages/${name}.jsx`, /* @__PURE__ */ Object.assign({ "./Pages/About.jsx": __vite_glob_0_0, "./Pages/Contact.jsx": __vite_glob_0_1, "./Pages/CreatePostForm.jsx": __vite_glob_0_2, "./Pages/Dashboard.jsx": __vite_glob_0_3, "./Pages/Followers.jsx": __vite_glob_0_4, "./Pages/Following.jsx": __vite_glob_0_5, "./Pages/Home.jsx": __vite_glob_0_6, "./Pages/Login.jsx": __vite_glob_0_7, "./Pages/News.jsx": __vite_glob_0_8, "./Pages/NotFound.jsx": __vite_glob_0_9, "./Pages/OAuthCallback.jsx": __vite_glob_0_10, "./Pages/PasswordChange.jsx": __vite_glob_0_11, "./Pages/PasswordRecovery.jsx": __vite_glob_0_12, "./Pages/PasswordReset.jsx": __vite_glob_0_13, "./Pages/Post.jsx": __vite_glob_0_14, "./Pages/Posts.jsx": __vite_glob_0_15, "./Pages/Registration.jsx": __vite_glob_0_16, "./Pages/SearchResults.jsx": __vite_glob_0_17, "./Pages/UserProfile.jsx": __vite_glob_0_18, "./Pages/dashboard/Activity.jsx": __vite_glob_0_19, "./Pages/dashboard/AvatarSetter.jsx": __vite_glob_0_20, "./Pages/dashboard/Conversation.jsx": __vite_glob_0_21, "./Pages/dashboard/DashboardLayout.jsx": __vite_glob_0_22, "./Pages/dashboard/DeleteAccount.jsx": __vite_glob_0_23, "./Pages/dashboard/EditBio.jsx": __vite_glob_0_24, "./Pages/dashboard/EditPost.jsx": __vite_glob_0_25, "./Pages/dashboard/EditProfile.jsx": __vite_glob_0_26, "./Pages/dashboard/ImageField.jsx": __vite_glob_0_27, "./Pages/dashboard/LikedPosts.jsx": __vite_glob_0_28, "./Pages/dashboard/Mail.jsx": __vite_glob_0_29, "./Pages/dashboard/MyPosts.jsx": __vite_glob_0_30, "./Pages/dashboard/NewNewsPost.jsx": __vite_glob_0_31, "./Pages/dashboard/NewPost.jsx": __vite_glob_0_32, "./Pages/dashboard/NewsPosts.jsx": __vite_glob_0_33, "./Pages/dashboard/Notifications.jsx": __vite_glob_0_34, "./Pages/dashboard/PostForm.jsx": __vite_glob_0_35, "./Pages/dashboard/UserComments.jsx": __vite_glob_0_36, "./Pages/dashboard/common/ConversationPreview.jsx": __vite_glob_0_37, "./Pages/dashboard/common/DashboardCreateHeader.jsx": __vite_glob_0_38, "./Pages/dashboard/common/Notification.jsx": __vite_glob_0_39 }));
      return pagePromise.then((module) => {
        if (module.default.layout === void 0) {
          module.default.layout = (page2) => {
            const isDash = page2.url.startsWith("/dashboard");
            return /* @__PURE__ */ jsx(Layout, { isDashboard: isDash, children: page2 });
          };
        }
        return module;
      }).catch(() => {
        const module = pagePromise;
        if (module && module.default && module.default.layout === void 0) {
          module.default.layout = (page2) => {
            var _a, _b;
            ((_b = (_a = page2.props.ziggy) == null ? void 0 : _a.location) == null ? void 0 : _b.startsWith("/dashboard")) || false;
            return /* @__PURE__ */ jsx(Layout, { children: page2 });
          };
        }
        return module;
      });
    },
    setup: ({ App, props }) => /* @__PURE__ */ jsx(App, { ...props })
  })
);
