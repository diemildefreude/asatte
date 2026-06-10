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
function RichTextEditor({ onChange, isReadOnly, value, quotedMessage, onQuoteApplied, placeholder = " " }) {
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
      console.log("editor", editor);
      const currentContent = editor.getContent() || "";
      editor.setContent(quoteHtml + currentContent);
      editor.focus();
      onQuoteApplied();
    }
  }, [quotedMessage, onQuoteApplied]);
  return /* @__PURE__ */ jsx(
    Editor,
    {
      tinymceScriptSrc: localScriptSrc,
      onEditorChange: onChange,
      disabled: isReadOnly,
      licenseKey: "gpl",
      value: typeof value === "string" ? value : "",
      onInit: (evt, editor) => editorRef.current = editor,
      init: {
        height: 500,
        convert_urls: false,
        menubar: false,
        plugins: "image link media",
        toolbar: isReadOnly ? false : ["styles | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | image media link"],
        toolbar_mode: "wrap",
        placeholder,
        // image_title: true,
        // automatic_uploads: true,
        file_picker_types: "image",
        media_live_embeds: true,
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
        object_resizing: true,
        content_css: localCssPath,
        content_style: `
          body 
          { 
            font-family: "Cascadia Code", sans-serif;
            font-weight: 1
          }
        `
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
        /* @__PURE__ */ jsx("span", { className: "avatar-container", children: /* @__PURE__ */ jsx(
          "img",
          {
            className: "round-image",
            src: avatar,
            alt: `RipplyScottttttttttttttttttttttttttttttttt's avatar`,
            draggable: "false"
          }
        ) }),
        /* @__PURE__ */ jsx("span", { className: "username", children: user.username })
      ]
    }
  ) : /* @__PURE__ */ jsx("p", { className: "loading", children: "loading user..." }) });
}
function Header() {
  var _a;
  const { props, url } = usePage();
  const appUrl = props.app_url;
  const user = (_a = props == null ? void 0 : props.auth) == null ? void 0 : _a.user;
  const dashboardUrl = `${appUrl}/dashboard/`;
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
      } else {
        headerRef.current.classList.toggle("header-out", false);
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
                  placeholder: " search",
                  onChange: (e) => setSearchTerm(e.target.value),
                  value: searchTerm,
                  ref: searchInputRef
                }
              ),
              /* @__PURE__ */ jsx("button", { type: "submit", tabIndex: "-1", children: /* @__PURE__ */ jsx("i", { className: "fa-solid fa-magnifying-glass" }) })
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
            additionalClasses: "nav-item",
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
    const handleResize = () => {
      const isCurrentlyTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(isCurrentlyTouch);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
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
const SAFE_VIDEO_IFRAME_HOSTS = [
  /^(?:www\.)?youtube\.com$/i,
  /^(?:www\.)?youtube-nocookie\.com$/i,
  /^player\.vimeo\.com$/i,
  /^(?:www\.)?vimeo\.com$/i,
  /^(?:www\.)?dailymotion\.com$/i,
  /^geo\.dailymotion\.com$/i,
  /^(?:www\.)?youku\.com$/i,
  /^player\.youku\.com$/i,
  /^v\.youku\.com$/i
];
const LoginType = {};
function isSafeVideoIframeSrc(src) {
  try {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost";
    const url = new URL(src, origin);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    return SAFE_VIDEO_IFRAME_HOSTS.some((re) => re.test(url.hostname));
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
      "referrerpolicy"
    ],
    ALLOW_DATA_ATTR: false
  });
  DOMPurify.removeHook("uponSanitizeElement");
  return clean;
}
function addFetchedPostsToExcludes(posts, previous) {
  console.log("afpte: posts, previous", posts, previous);
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
function handleResizeWithCanvas(img, mimeType) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const maxWidth = 1280;
    const maxHeight = 1280;
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
function resizeImage(source) {
  if (typeof source === "string") {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const blob = await handleResizeWithCanvas(img, "image/jpeg");
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
            const blob = await handleResizeWithCanvas(img, source.type);
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
    return `https://player.vimeo.com/video/${videoId}`;
  }
  videoId = getVideoId(url, dailyMotionPatterns);
  console.log("dailyMotion?!", videoId);
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
  console.log("err?", err);
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
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      PageHead,
      {
        title: "about",
        ogType: "article"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "rte-container borderless", children: dataLoaded ? /* @__PURE__ */ jsxs("article", { children: [
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
        /* @__PURE__ */ jsx("div", { className: "right-item", children: !isInEditMode && isWebmaster && /* @__PURE__ */ jsx(
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
          isReadOnly: !isInEditMode || processing,
          onChange: handleStatementChange,
          value: statement
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
      console.log("Data received:", data2);
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
function DashboardLayout({ currentTab, headerText, children }) {
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
          headerText && /* @__PURE__ */ jsx("div", { className: "centered-content bottom-1rem", children: /* @__PURE__ */ jsx("h1", { children: headerText }) }),
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
function ImageZoom({ src, alt, isZoomed, clickFunc, outerContainerRef = null, isImageCropper = false }) {
  const zoomContainerRef = useRef(null);
  const zoomedImageRef = useRef(null);
  const [transform, setTransform] = useState({ scale: 1, posX: 0, posY: 0 });
  const [naturalSize, setNaturalSize] = useState(null);
  const [initialTransform, setInitialTransform] = useState(null);
  const isPanningRef = useRef(false);
  const lastPanPositionRef = useRef(null);
  const lastPinchDistanceRef = useRef(null);
  const containerClasses = isImageCropper ? "zoomed-image" : `zoomed-image ${!isZoomed ? "hidden" : ""}`;
  const MIN_SCALE_FACTOR = 1;
  const MAX_SCALE_FACTOR = 5;
  const WHEEL_ZOOM_SENSITIVITY = 4e-3;
  const TOUCH_ZOOM_SENSITIVITY = 0.01;
  const PAN_SENSITIVITY = 1;
  const handleImageLoad = useCallback((event) => {
    const img = event.currentTarget;
    const natSize = { width: img.naturalWidth, height: img.naturalHeight };
    setNaturalSize(natSize);
    const initialT = calculateInitialTransform(zoomContainerRef == null ? void 0 : zoomContainerRef.current, outerContainerRef == null ? void 0 : outerContainerRef.current, natSize.width, natSize.height);
    setTransform(initialT);
    setInitialTransform(initialT);
  }, [setTransform, isZoomed]);
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
  }, [isZoomed, updateZoom, clampPosition]);
  const handleTouchStart = useCallback((event) => {
    console.log("touch start");
    if (!zoomContainerRef.current) return;
    if (event.touches.length === 1) {
      isPanningRef.current = true;
      lastPanPositionRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
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
      const newPosX = transform.posX + deltaX;
      const newPosY = transform.posY + deltaY;
      const clamped = clampPosition(newPosX, newPosY, transform.scale);
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
  const handleTouchEnd = useCallback(() => {
    isPanningRef.current = false;
    lastPinchDistanceRef.current = null;
    if (zoomContainerRef.current) zoomContainerRef.current.style.removeProperty("touch-action");
  }, []);
  const handleMouseDown = useCallback((event) => {
    if (event.button !== 0) return;
    isPanningRef.current = true;
    lastPanPositionRef.current = { x: event.clientX, y: event.clientY };
    zoomContainerRef.current.classList.toggle("dragging", true);
  }, []);
  const handleMouseMove = useCallback((event) => {
    if (!isPanningRef.current || !lastPanPositionRef.current) return;
    const deltaX = event.clientX - lastPanPositionRef.current.x;
    const deltaY = event.clientY - lastPanPositionRef.current.y;
    lastPanPositionRef.current = { x: event.clientX, y: event.clientY };
    const newPosX = transform.posX + deltaX;
    const newPosY = transform.posY + deltaY;
    const clamped = clampPosition(newPosX, newPosY, transform.scale);
    setTransform((prev) => ({ ...prev, posX: clamped.x, posY: clamped.y }));
  }, [transform, clampPosition]);
  const handleMouseUpOrLeave = useCallback(() => {
    isPanningRef.current = false;
    zoomContainerRef.current.classList.toggle("dragging", false);
  }, []);
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
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: containerClasses,
      draggable: "false",
      onClick: clickFunc,
      ref: zoomContainerRef,
      children: /* @__PURE__ */ jsx(
        "img",
        {
          src,
          alt,
          draggable: "false",
          ref: zoomedImageRef,
          onLoad: handleImageLoad,
          style: {
            transform: `translate(${transform.posX}px, ${transform.posY}px) scale(${transform.scale})`,
            transformOrigin: "top left"
          }
        }
      )
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
    console.log("opening");
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
    closeCropperAndClearInput();
  }, [closeCropperAndClearInput, imageCropContainerRef.current]);
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
              disabled: processing,
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
          disabled: processing,
          type: "button",
          children: [
            "update",
            /* @__PURE__ */ jsx("div", { className: "image-drag-panel" })
          ]
        }
      ),
      /* @__PURE__ */ jsx("img", { src: avatar, alt: "", className: "round-image" })
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
  isSubmitting = false,
  isLink = false,
  isEditingThisField = false,
  onEditClick,
  isPublic = false
}) {
  const isUpdatable = onChange ? true : false;
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
          disabled: !isEditingThisField || isSubmitting,
          onChange
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
        disabled: !isUpdatable || isEditingThisField || isSubmitting,
        className: isUpdatable ? "" : "invisible"
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
    website: "",
    location: "",
    show_email_in_profile: false
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [websiteField, setWebsiteField] = useState("");
  const [locationField, setLocationField] = useState("");
  const [showEmailInProfile, setShowEmailInProfile] = useState(false);
  const [editingField, setEditingField] = useState(null);
  useEffect(() => {
    if (!user) return;
    setWebsiteField(user.website || "");
    setLocationField(user.location || "");
    setShowEmailInProfile(!!user.show_email_in_profile);
    setData("website", user.website || "");
    setData("location", user.location || "");
    setData("show_email_in_profile", !!user.show_email_in_profile);
  }, [user]);
  const handleEditClick = useCallback((fieldName) => {
    setEditingField(fieldName);
    clearErrors();
  }, [clearErrors]);
  const handleLogoutSubmit = (e) => {
    e.preventDefault();
    setIsLoggingOut(true);
    router.post("/logout", {}, {
      onFinish: () => setIsLoggingOut(false)
    });
  };
  const handleProfileChangesSubmit = (e) => {
    e.preventDefault();
    clearErrors();
    if (websiteField === user.website && locationField === user.location && showEmailInProfile === !!user.show_email_in_profile) {
      setError("general", "No changes to submit.");
      return;
    }
    setData("website", websiteField || "");
    setData("location", locationField || "");
    setData("show_email_in_profile", !!showEmailInProfile);
    router.post("/update-profile", {
      website: websiteField || "",
      location: locationField || "",
      show_email_in_profile: !!showEmailInProfile
    }, {
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
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "main-info-box sticky", children: [
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
          name: "website",
          value: websiteField,
          setValue: setWebsiteField,
          onChange: (e) => {
            setHasChanges(e.target.value !== user.website);
            setWebsiteField(e.target.value);
          },
          isSubmitting: processing,
          isEditingThisField: editingField === "website",
          onEditClick: () => handleEditClick("website")
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
          isSubmitting: processing,
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
          disabled: processing
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex-row", children: [
        /* @__PURE__ */ jsxs("div", { className: "button-container", children: [
          /* @__PURE__ */ jsx("button", { onClick: handleLogoutSubmit, disabled: processing || isLoggingOut, children: "log out" }),
          hasChanges && /* @__PURE__ */ jsx("button", { type: "submit", disabled: processing, children: "save changes" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-column", children: [
          (user == null ? void 0 : user.is_email_verified) && (user == null ? void 0 : user.login_type) === LoginType.Email && /* @__PURE__ */ jsx(Link, { href: "/password-change", className: "centered-content no-margin", children: "change password" }),
          /* @__PURE__ */ jsx(Link, { href: `/${user == null ? void 0 : user.username}`, className: "centered-content no-margin", children: "preview profile" })
        ] })
      ] })
    ] }) })
  ] });
}
const __vite_glob_0_25 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
      isInEditMode && hasBioChanged && /* @__PURE__ */ jsx("div", { className: "left-item", children: /* @__PURE__ */ jsx(
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
      /* @__PURE__ */ jsx("div", { className: "right-item", children: !isInEditMode && /* @__PURE__ */ jsx(
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
    flash.success_bio && /* @__PURE__ */ jsx("div", { className: "notice", children: flash.success_bio }),
    isInEditMode ? /* @__PURE__ */ jsx(
      RichTextEditor,
      {
        isReadOnly: !isInEditMode || isSubmitting,
        onChange: handleBioChange,
        value: bio
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
const __vite_glob_0_23 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: EditBio
}, Symbol.toStringTag, { value: "Module" }));
function Dashboard() {
  return /* @__PURE__ */ jsxs(DashboardLayout, { currentTab: "profile", headerText: "your profile", children: [
    /* @__PURE__ */ jsx(PageHead, { title: "Dashboard" }),
    /* @__PURE__ */ jsxs("div", { className: "profile-boxes-container", children: [
      /* @__PURE__ */ jsx(EditProfile, {}),
      /* @__PURE__ */ jsx(EditBio, {})
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
  viewAllLink = ""
}) {
  const { props } = usePage();
  const partial = isFullPage && partialProp ? props[partialProp] : null;
  const normalizeItems = (source) => {
    if (!source) return [];
    if (source.data && Array.isArray(source.data)) return source.data;
    if (Array.isArray(source)) return source;
    return [];
  };
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
    headingText && /* @__PURE__ */ jsx("h3", { className: "centered-content", children: headingText }),
    /* @__PURE__ */ jsx("div", { className: `${itemString}-container ${classes}`, children: isLoading ? /* @__PURE__ */ jsxs("p", { className: "centered-content", children: [
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
    viewText = "preview";
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
    console.log("clicking link", e);
    if (isSliderDraggedPointerUp == null ? void 0 : isSliderDraggedPointerUp.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "work-tile", children: [
    imageUrls && imageUrls.length > 0 && /* @__PURE__ */ jsx(
      "img",
      {
        className: "tile-image",
        src: `${directory}/${imageUrls[0]}`,
        alt: post.title,
        draggable: "false"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "info-panel", children: [
      (post == null ? void 0 : post.is_hidden_by_admin) && /* @__PURE__ */ jsx("div", { className: "centered-icon red", children: /* @__PURE__ */ jsx(
        "i",
        {
          title: "hidden",
          className: "fa-regular fa-eye-slash"
        }
      ) }),
      isDashboard && !(post == null ? void 0 : post.is_hidden) && (post == null ? void 0 : post.is_private) ? /* @__PURE__ */ jsx("div", { className: "centered-icon blue", children: /* @__PURE__ */ jsx(
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
              href: `/${post.user.username}/${post.post_url}`,
              className: "post-link",
              onClick: handleLinkClick,
              draggable: "false",
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
        console.log("no more posts");
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
  const { props } = usePage();
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
    router.get(window.location.pathname, query, {
      only: [partialProp],
      preserveState: true,
      preserveScroll: true,
      replace: true,
      onSuccess: (page) => {
        if (!isSearch && page) {
          page.url = window.location.pathname;
        }
      }
    });
  }, [getPostAmount, screenSize, areNoMorePosts, fetchOrder, isSearch, searchTerm, partialProp]);
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
  useEffect(() => {
    const partial = props[partialProp];
    const pending = pendingRequestRef.current;
    if (!pending) {
      return;
    }
    const kind = pending.kind;
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
    pendingRequestRef.current = null;
    isFetchingOnScroll.current = false;
    isFetchingOnWidthChange.current = false;
  }, [props[partialProp], partialProp, fetchOrder, screenSize]);
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
  const startPosRef = useRef(new Point(0, 0));
  const currentTranslateXRef = useRef(0);
  const initialTranslateXRef = useRef(0);
  const mouseDownTargetRef = useRef(null);
  const distanceThreshold = 5;
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
  }, []);
  const renderContent = typeof children === "function" ? children({
    isDragging: isDraggingRef,
    isDraggedPointerUp: isDraggedPointerUpRef,
    handleFocusIn
  }) : children;
  const handlePointerDown = useCallback((e) => {
    isPointerDownRef.current = true;
    isDraggedPointerUpRef.current = false;
    isDraggingRef.current = false;
    sliderContainerRef.current.classList.add("dragging");
    innerSliderRef.current.classList.add("dragging");
    startPosRef.current = new Point(e.pageX, e.pageY);
    initialTranslateXRef.current = currentTranslateXRef.current;
    mouseDownTargetRef.current = e.target;
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
    const deltaX = e.pageX - startPosRef.current.x;
    let newTranslateX = initialTranslateXRef.current + deltaX;
    newTranslateX = checkBoundary(newTranslateX);
    currentTranslateXRef.current = newTranslateX;
    innerSliderRef.current.style.transform = `translateX(${currentTranslateXRef.current}px)`;
  }, []);
  const handlePointerUp = useCallback(() => {
    isPointerDownRef.current = false;
    isDraggingRef.current = false;
    sliderContainerRef.current.classList.remove("dragging");
    innerSliderRef.current.classList.remove("dragging");
  }, []);
  function checkBoundary(x) {
    const innerW = innerSliderRef.current.offsetWidth;
    const outerW = sliderContainerRef.current.offsetWidth;
    if (innerW < outerW) {
      return 0;
    }
    const innerSliderMax = innerW - outerW;
    let newTranslateX = Math.min(x, 0);
    newTranslateX = Math.max(newTranslateX, -innerSliderMax);
    return newTranslateX;
  }
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
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        return;
      }
      if (innerSliderRef.current.style.left === "") {
        innerSliderRef.current.style.left = "0px";
      }
      const oldPos = currentTranslateXRef.current;
      let newPos = oldPos - e.deltaX;
      newPos = checkBoundary(newPos);
      currentTranslateXRef.current = newPos;
      innerSliderRef.current.style.transform = `translateX(${currentTranslateXRef.current}px)`;
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
  return /* @__PURE__ */ jsx("div", { className, children: /* @__PURE__ */ jsx(
    "div",
    {
      className: "carousel-container " + size,
      tabIndex: "0",
      role: "region",
      "aria-label": "",
      ref: sliderContainerRef,
      children: /* @__PURE__ */ jsx("div", { className: "slider-container gallery-slider", children: /* @__PURE__ */ jsx("div", { className: "inner-slider", ref: innerSliderRef, children: renderContent }) })
    }
  ) });
}
function TileCarousel({ size, category = Category.Archive, userId = null, title = "", excludePostId = null, initialPosts = null, fetchMethod = null }) {
  const carouselPostCount = 6;
  const [posts, setPosts] = useState(initialPosts || []);
  useEffect(() => {
    if (initialPosts && initialPosts.length > 0) return;
    if (!fetchMethod) return;
    const params = new URLSearchParams();
    const amount = carouselPostCount;
    params.append("amount", amount);
    params.append("start_id", 1);
    params.append("category", category);
    if (userId) {
      params.append("user_id", userId);
    }
    fetchMethod(params).then((data) => {
      if (data.status === "no_more_posts") {
        return;
      }
      let fetchedPosts = data;
      if (excludePostId) {
        fetchedPosts = fetchedPosts.filter((post) => post["id"] !== excludePostId);
      }
      setPosts(fetchedPosts);
    });
  }, [category, userId, setPosts]);
  return (posts == null ? void 0 : posts.length) > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("h2", { children: title }),
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
  ] }) : /* @__PURE__ */ jsx(Fragment, {});
}
function Home({ heroPosts = [], carouselArchive = [], carouselNews = [], archivePosts = [] }) {
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
    /* @__PURE__ */ jsx("div", { className: "page-section carousel", children: /* @__PURE__ */ jsx(TileCarousel, { size: "small", category: Category.Archive, title: "works from new users:", initialPosts: carouselArchive }) }),
    /* @__PURE__ */ jsx("div", { className: "page-section carousel", children: /* @__PURE__ */ jsx(TileCarousel, { size: "small", category: Category.News, title: "netart news:", initialPosts: carouselNews }) }),
    /* @__PURE__ */ jsxs("div", { className: "page-section", children: [
      /* @__PURE__ */ jsx("h1", { className: "centered-content no-margin padded", children: "explore" }),
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
  return /* @__PURE__ */ jsxs("div", { className: "field-group social-login-options", children: [
    /* @__PURE__ */ jsx("h3", { children: headerText }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => {
          onClick();
          handleSocialLogin("google");
        },
        disabled: isSubmitting || isSubmittingForm || isLoading,
        children: [
          /* @__PURE__ */ jsx("div", { className: "button-content", children: "continue with google" }),
          /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("img", { src: "/google.png", alt: "google icon" }) })
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
          /* @__PURE__ */ jsx("div", { className: "buttonContent", children: "continue with github" }),
          /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("img", { src: "/github.png", alt: "github icon" }) })
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
            headerText: "or:",
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
        alt: "",
        clickFunc: handleClick,
        isZoomed
      }
    )
  ] }) });
}
function Comment({ comment, isDashboard = false, onReply = null, id, parentLocalId = null, currentUrl = null }) {
  var _a;
  const user = (_a = usePage().props.auth) == null ? void 0 : _a.user;
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
          href: `/${comment.post.user.username}/${comment.post.post_url}`,
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
      isDashboard && comment.post && //post is only included when using fetchUserComments
      /* @__PURE__ */ jsxs(
        Link,
        {
          href: `/${comment.post.user.username}/${comment.post.post_url}?comment_id=${comment.id}`,
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
      !isDashboard && user.id === comment.user.id && /* @__PURE__ */ jsx(Fragment, { children: isEditing ? /* @__PURE__ */ jsxs(Fragment, { children: [
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
      !isDashboard && (user.id === comment.user.id || user.member_type == MemberType.Admin || user.member_type == MemberType.Webmaster) && /* @__PURE__ */ jsx(
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
    setData("content", (prev) => {
      let newText = prev;
      if (quoteText) {
        newText = newText.replace(quoteText, "");
      }
      if (isQuote) {
        let formattedOriginal = "@" + comment.user.username + " wrote:\n";
        formattedOriginal += comment.content.split("\n").map((line) => `> ${line}`).join("\n") + "\n\n";
        setQuoteText(formattedOriginal);
        newText = formattedOriginal + newText;
      } else {
        setQuoteText("");
      }
      return newText;
    });
    const el = document.getElementById("leave-comment-container");
    if (el) {
      const rect = el.getBoundingClientRect();
      const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight;
      if (!isInView) {
        scrollToElement(currentUrl, "leave-comment-container", false);
      }
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
            disabled: !isAuthenticated
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
function Post({ post }) {
  var _a, _b, _c, _d;
  const { props } = usePage();
  const appUrl = props.app_url;
  const isLiked = !!(post == null ? void 0 : post.have_liked);
  const likeCount = (post == null ? void 0 : post.users_who_liked_count) || 0;
  const [adminMessageIsVisible, setAdminMessageIsVisible] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const success = (_a = props.flash) == null ? void 0 : _a.success;
  const error = ((_b = props.errors) == null ? void 0 : _b.error) || ((_c = props.flash) == null ? void 0 : _c.error);
  const user = (_d = props.auth) == null ? void 0 : _d.user;
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
      const msg = getErrorMessage(err);
      console.log(msg);
      return [];
    }
  }, [post]);
  const mainImg = `${appUrl}/storage/images/uploaded/users/${post.user.username}/posts/${post.post_url}/gallery/large/${imageUrls[0]}`;
  const videoUrl = useMemo(() => {
    try {
      return (post == null ? void 0 : post.main_video) ?? null;
    } catch (err) {
      const msg = getErrorMessage(err);
      console.log(msg);
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
    if (!hide) {
      const isConfirmed = window.confirm("Make post visible?");
      if (!isConfirmed) return;
    }
    setIsSubmitting(true);
    try {
      const messageWithProcessedPhotos = await processEditorImages(adminMessage);
      router.post(
        `/set-admin-hide/${post.id}`,
        {
          _method: "PUT",
          is_hidden_by_admin: hide,
          message_to_user: messageWithProcessedPhotos
        },
        {
          preserveScroll: true,
          preserveState: true,
          onSuccess: () => {
            setAdminMessage("");
            setAdminMessageIsVisible(false);
            setIsSubmitting(false);
          },
          onError: () => {
            setIsSubmitting(false);
          }
        }
      );
    } catch (err) {
      setIsSubmitting(false);
    }
  }, [adminMessage, post.id]);
  console.log("Aroo?!", props.app_url, post.user.username, post.post_url);
  const handleHideClick = useCallback(() => {
    const adminStarterText = `<p>Your post, <a href="${props.app_url}/${post.user.username}/${post.post_url}"><em>${post.title}</em></a> has been hidden.</p>
            <p> reason: </p>    
            <p> If you wish to dispute this decision, please reply to this message.</p>
            `;
    setAdminMessage(adminStarterText);
    setAdminMessageIsVisible(true);
  }, [props, post]);
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
              /* @__PURE__ */ jsx("img", { className: "main-image", src: mainImg, alt: "" }),
              /* @__PURE__ */ jsx("div", { className: "main-image-link-container", children: /* @__PURE__ */ jsxs("div", { className: "info-panel", children: [
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
                ) }) : /* @__PURE__ */ jsx(Fragment, {}),
                isAuthenticated && /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: isLiked ? "like-button liked" : "like-button",
                    onClick: handleLikeToggle,
                    "aria-label": "Toggle Like",
                    "aria-pressed": isLiked,
                    children: /* @__PURE__ */ jsx("i", { className: isLiked ? "fa-solid fa-star" : "fa-regular fa-star" })
                  }
                ) })
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
          error && /* @__PURE__ */ jsx("div", { className: "error", children: error }),
          success && /* @__PURE__ */ jsx("div", { className: "notice", children: success }),
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
              RichTextEditor,
              {
                placeholder: "Let the user know why you're hiding their post.",
                readOnly: isSubmitting,
                onChange: (m) => setAdminMessage(m),
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
      /* @__PURE__ */ jsx("div", { className: "page-section carousel", children: /* @__PURE__ */ jsx(
        TileCarousel,
        {
          size: "small",
          userId: post.user.id,
          title: "more from this user:",
          excludePostId: post.id
        },
        post.user.id
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
      /* @__PURE__ */ jsx("h1", { className: "centered-content no-margin", children: "join netart.io" }),
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
            headerText: "or:",
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
          /* @__PURE__ */ jsxs("div", { className: "main-info-box sticky", children: [
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
                /* @__PURE__ */ jsx("img", { src: avatar, alt: "", className: "round-image" }),
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
                  name: "website",
                  value: profileUser.website,
                  isPublic: true,
                  isLink: true
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
                user && (user == null ? void 0 : user.id) != (profileUser == null ? void 0 : profileUser.id) && /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(
                  Link,
                  {
                    href: "/dashboard/mail/new",
                    data: { addressee: username },
                    className: "link-with-icon",
                    children: [
                      /* @__PURE__ */ jsx("i", { className: "fa-regular fa-envelope big-icon" }),
                      " ",
                      /* @__PURE__ */ jsx("span", { children: "send DM" })
                    ]
                  }
                ) }),
                !!profileUser.show_email_in_profile && /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs(
                    "a",
                    {
                      href: `mailto:${profileUser.email}`,
                      className: "link-with-icon",
                      children: [
                        /* @__PURE__ */ jsx("i", { className: "fa-solid fa-envelopes-bulk big-icon" }),
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
                      children: /* @__PURE__ */ jsx("i", { className: "fa-regular fa-copy big-icon" })
                    }
                  )
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rte-container", children: [
            /* @__PURE__ */ jsx("div", { className: "centered-header-box", children: /* @__PURE__ */ jsx("div", { className: "centered-content", children: /* @__PURE__ */ jsx("h2", { children: "bio" }) }) }),
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
      /* @__PURE__ */ jsxs("p", { children: [
        "Your post, ",
        /* @__PURE__ */ jsx(Link, { href: `/${notification.post.user.username}/${notification.post.post_url}`, children: notification.post.title }),
        ", has been unhidden."
      ] })
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
          href: `/${notification.comment.post.user.username}/${notification.comment.post.post_url}`,
          children: notification.comment.post.title
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
          href: `/${notification.comment.post.user.username}/${notification.comment.post.post_url}?comment_id=${notification.comment.parent_id}`,
          children: "your comment"
        }
      ),
      " in ",
      /* @__PURE__ */ jsx(
        Link,
        {
          href: `/${notification.comment.user.username}/${notification.comment.post.post_url}`,
          children: notification.comment.post.title
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
          href: `/${notification.comment.post.user.username}/${notification.comment.post.post_url}?comment_id=${notification.comment.id}`,
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
const __vite_glob_0_38 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
        /* @__PURE__ */ jsx("div", { className: "main-info-box", children: /* @__PURE__ */ jsx(
          LoadItems,
          {
            initialItems: initialNotifications,
            renderMethod: (notification) => ({
              notification
            }),
            Component: Notification,
            itemString: "notifications",
            headingText: "notifications",
            viewAllLink: "/dashboard/notifications"
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "main-info-box", children: /* @__PURE__ */ jsx(
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
        /* @__PURE__ */ jsxs("div", { className: "main-info-box", children: [
          /* @__PURE__ */ jsx("h3", { className: "centered-content", children: "liked posts" }),
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
        /* @__PURE__ */ jsxs("div", { className: "main-info-box follows", children: [
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
  const { props } = usePage();
  const appUrl = props.app_url;
  const initialHydratedContent = useMemo(() => hydrateEditorImagePaths(message.content, appUrl), [message.content, appUrl]);
  const [content, setContent] = useState(initialHydratedContent);
  const [initialContent, setInitialContent] = useState(initialHydratedContent);
  const [hasChanged, setHasChanged] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const elementId = `message-${id}`;
  const parentElementId = parentLocalId ? `message-${parentLocalId}` : null;
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
    console.log("m.c", initialContent);
    setContent(initialContent);
    setResetKey((k) => k + 1);
  }, [initialContent]);
  const handleMessageUpdate = useCallback(async () => {
    setIsSubmitting(true);
    const dehydratedContent = dehydrateEditorImagePaths(content, appUrl);
    const newContentWithResizedImages = await processEditorImages(dehydratedContent);
    router.put(`/dashboard/mail/${message.id}`, { content: newContentWithResizedImages }, {
      preserveScroll: true,
      onSuccess: () => {
        setIsSubmitting(false);
        setIsEditing(false);
      },
      onError: (err) => {
        console.error(err);
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
  return /* @__PURE__ */ jsxs("div", { className: "comment", id: elementId, children: [
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
      message.parent_id && parentLocalId != null && currentUrl ? /* @__PURE__ */ jsxs("span", { className: "notice small", children: [
        " replied to ",
        /* @__PURE__ */ jsx(
          "a",
          {
            href: `${currentUrl}/message-${parentLocalId}`,
            onClick: (e) => {
              e.preventDefault();
              scrollToElement(currentUrl, parentElementId);
            },
            children: "this"
          }
        ),
        " message"
      ] }) : null
    ] }),
    isEditing ? /* @__PURE__ */ jsx(
      RichTextEditor,
      {
        id,
        readOnly: !isEditing || isSubmitting,
        onChange: (editedMessage) => {
          console.log("initial", initialContent);
          console.log("edited", editedMessage);
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
        className: "article-text"
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
              disabled: isSubmitting || !hasChanged,
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
    console.log("hover: i", i);
    setSearchResultSelection(i);
  }, [setSearchResultSelection]);
  const handleRecipientKeyPresses = useCallback((e) => {
    console.log("hrkp", searchResultSelection);
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
      console.log("selection", searchResultSelection);
      if (!resultsRef.children[searchResultSelection]) {
        return;
      }
      e.preventDefault();
      const link = resultsRef.children[searchResultSelection].querySelector("a");
      console.log("clicking link", searchResultSelection);
      link.click();
      return;
    }
    if (e.key === "ArrowDown") {
      console.log("rr.c.l", searchResults.length, resultsRef.children.length);
      if (searchResults.length <= 0 || resultsRef.children.length <= 0) {
        return;
      }
      e.preventDefault();
      console.log("srs", searchResultSelection);
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
      console.log("srs", searchResultSelection);
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
    const search = () => {
      const newVal = recipientSpanRef.current.innerText.trim();
      const hasChanged = newVal !== searchTerm;
      setSearchTerm(newVal);
      if (newVal.length <= 0) {
        setSearchResults([]);
        setSearchResultSelection(-1);
        return;
      }
      console.log("has changed?", hasChanged);
      if (hasChanged) {
        console.log("searching");
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
    console.log("submit", message, recipients, subject);
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
    /* @__PURE__ */ jsx("div", { className: "centered-content no-margin", children: /* @__PURE__ */ jsx("h2", { dangerouslySetInnerHTML: { __html: convoName } }) }),
    !isNew && /* @__PURE__ */ jsxs("div", { className: "footnote", children: [
      "with",
      " ",
      ((_c = conversation == null ? void 0 : conversation.other_users) == null ? void 0 : _c.length) < 1 ? /* @__PURE__ */ jsx("span", { children: "[deleted user(s)]" }) : (_d = conversation == null ? void 0 : conversation.other_users) == null ? void 0 : _d.map((u, index) => /* @__PURE__ */ jsxs("span", { children: [
        /* @__PURE__ */ jsx(Link, { href: `/${u.username}`, children: u.username }),
        index < conversation.other_users.length - 1 && ", "
      ] }, u.id))
    ] }),
    user && user.is_email_verified ? !isNew && !conversation ? /* @__PURE__ */ jsx("p", { className: "centered-content padding-1rem", children: "Loading conversation..." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
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
        isNew && /* @__PURE__ */ jsxs("dl", { children: [
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
            classes: "form-field"
          }
        ),
        /* @__PURE__ */ jsx(
          RichTextEditor,
          {
            placeholder: "your message",
            readOnly: isSubmitting,
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
function ImageField({ index, image = null, file = null, alt = "", setArray, onImageChange, onAltChange, onRemove }) {
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
        /* @__PURE__ */ jsx("span", { className: "button-container", children: /* @__PURE__ */ jsx("button", { type: "button", onClick: removeSelf, children: "-" }) }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "file",
            accept: ".jpg, .jpeg, .png, .webp, .bmp",
            name: "gal_images[]",
            id: `gal_image_${index}`,
            onChange: handleFileChange,
            ref: imageInputRef
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
            onChange: handleAltChange
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
const __vite_glob_0_26 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ImageField
}, Symbol.toStringTag, { value: "Module" }));
const createInitialImageFields = (post = null, user, postUrl, appUrl) => {
  if (post) {
    const images = post.gallery_image_urls;
    const alts = post.gallery_alts;
    return images.map((image, i) => ({
      index: i,
      image: `${appUrl}/storage/images/uploaded/users/${user.username}/posts/${postUrl}/gallery/thumb/${image}`,
      alt: alts[i] == "null" ? "" : alts[i],
      value: image,
      type: "old"
    }));
  } else {
    return [{ index: 0, image: null, alt: null, value: null, type: "new" }];
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
    is_private: post ? !!post.is_private : false,
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
  const canSubmit = data.title && isTitleValid && data.post_url && isPostUrlValid && data.subtitle && isSubtitleValid && (data.website && isWebsiteValid || !data.website) && (data.source_code && isSourceCodeValid || !data.source_code) && imageFields.length > 0 && hasImages(imageFields) && hasChanged;
  const buttonText = isCreateForm ? "create" : "update";
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
      is_private: !!post.is_private,
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
  const onSubmit = useCallback(async (e) => {
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
      const resizedBlob = await resizeImage(file);
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
      formData.append("is_private", data.is_private ? "1" : "0");
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
        await new Promise((resolve, reject) => {
          router.post("/posts", formData, {
            preserveState: false,
            preserveScroll: true,
            onSuccess: (page) => resolve(page),
            onError: (errs) => reject(errs),
            onFinish: () => setIsSubmitting(false)
          });
        });
      } else {
        formData.append("_method", "PUT");
        await new Promise((resolve, reject) => {
          router.post(`/posts/${post.id}`, formData, {
            preserveState: false,
            preserveScroll: true,
            onSuccess: (page) => resolve(page),
            onError: (errs) => reject(errs),
            onFinish: () => setIsSubmitting(false)
          });
        });
      }
      setSuccess(message);
      router.visit("/dashboard/posts", { state: { message } });
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
      setHasChanged(false);
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
      router.visit("/dashboard/posts", { state: { message: "Post successfully deleted." } });
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
      setFieldLocalError("Must be a valid link from YouTube, DailyMotion, Vimeo, or Youku.");
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
    if (imageFields.length >= 15) {
      setError("general", "Max amount of images is 15. Input truncated.");
      return;
    }
    setImageFields((prev) => [...prev, { index: prev.length, image: null, alt: "", value: null, type: "new" }]);
    setHasChanged(true);
  }, [imageFields.length, setError, clearErrors]);
  const onImageChange = useCallback((index, file, imageUrl) => {
    setHasChanged(true);
    setImageFields((prev) => prev.map((field) => field.index === index ? { ...field, value: file, image: imageUrl } : field));
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
      if (reindexed.length >= 15) {
        localErr = (localErr ? localErr + " " : "") + "Max amount of images is 15.";
        reindexed = reindexed.slice(0, 15);
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
      /* @__PURE__ */ jsx("div", { className: "main-info-box stretch", children: /* @__PURE__ */ jsxs("form", { onSubmit, children: [
        /* @__PURE__ */ jsxs("div", { className: "text-fields-container", children: [
          errors.general && /* @__PURE__ */ jsx("div", { className: "error", children: errors.general }),
          success && /* @__PURE__ */ jsx("div", { className: "notice", children: success }),
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
              placeholder: "YouTube, Vimeo, DailyMotion, or Youku",
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
                isReadOnly: isSubmitting,
                onChange: (val) => {
                  setData("statement", val);
                  setHasChanged(val !== initialStatement);
                },
                value: data.statement
              }
            )
          ] }),
          /* @__PURE__ */ jsx("button", { type: "submit", disabled: isSubmitting || !canSubmit, children: buttonText })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "multi-field-container", ref: galleryContainerRef, children: [
          /* @__PURE__ */ jsx("div", { className: "field-button-container top-align", children: /* @__PURE__ */ jsxs("div", { className: "main-label-container", children: [
            /* @__PURE__ */ jsx("label", { className: "main-label", children: "gallery images*" }),
            /* @__PURE__ */ jsx("span", { className: "button-container", children: /* @__PURE__ */ jsx("button", { className: "small-but", type: "button", onClick: handleAddImage, children: "+" }) }),
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
              onRemove: () => setHasChanged(true)
            },
            field.index
          )),
          /* @__PURE__ */ jsx("button", { type: "submit", disabled: isSubmitting || !canSubmit, children: buttonText })
        ] })
      ] }) }),
      !isCreateForm && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "delete-button",
          onClick: handleDelete,
          disabled: isSubmitting,
          children: "delete"
        }
      )
    ] }) : /* @__PURE__ */ jsx("p", { className: "loading", children: loadingText })
  ] });
}
const __vite_glob_0_34 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
const __vite_glob_0_24 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
const __vite_glob_0_27 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
  console.log("conversation", conversation);
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
const __vite_glob_0_36 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ConversationPreview
}, Symbol.toStringTag, { value: "Module" }));
function DashboardCreateHeader({ headerText, createLink, isVerified = true }) {
  return /* @__PURE__ */ jsxs("div", { className: "centered-header-box", children: [
    /* @__PURE__ */ jsx(PageHead, { title: "Dashboard Create Header" }),
    /* @__PURE__ */ jsx("div", { className: "centered-content no-margin", children: /* @__PURE__ */ jsx("h1", { children: headerText }) }),
    isVerified && /* @__PURE__ */ jsx(
      Link,
      {
        href: createLink,
        className: "right-item link-button plus-button",
        children: "+"
      }
    )
  ] });
}
const __vite_glob_0_37 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: DashboardCreateHeader
}, Symbol.toStringTag, { value: "Module" }));
function Mail() {
  var _a;
  const { props } = usePage();
  const user = (_a = props.auth) == null ? void 0 : _a.user;
  const { conversations } = props;
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
const __vite_glob_0_28 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
const __vite_glob_0_29 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
const __vite_glob_0_30 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
const __vite_glob_0_31 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
const __vite_glob_0_32 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
const __vite_glob_0_33 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
const __vite_glob_0_35 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
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
      const pagePromise = resolvePageComponent(`./Pages/${name}.jsx`, /* @__PURE__ */ Object.assign({ "./Pages/About.jsx": __vite_glob_0_0, "./Pages/Contact.jsx": __vite_glob_0_1, "./Pages/CreatePostForm.jsx": __vite_glob_0_2, "./Pages/Dashboard.jsx": __vite_glob_0_3, "./Pages/Followers.jsx": __vite_glob_0_4, "./Pages/Following.jsx": __vite_glob_0_5, "./Pages/Home.jsx": __vite_glob_0_6, "./Pages/Login.jsx": __vite_glob_0_7, "./Pages/News.jsx": __vite_glob_0_8, "./Pages/NotFound.jsx": __vite_glob_0_9, "./Pages/OAuthCallback.jsx": __vite_glob_0_10, "./Pages/PasswordChange.jsx": __vite_glob_0_11, "./Pages/PasswordRecovery.jsx": __vite_glob_0_12, "./Pages/PasswordReset.jsx": __vite_glob_0_13, "./Pages/Post.jsx": __vite_glob_0_14, "./Pages/Posts.jsx": __vite_glob_0_15, "./Pages/Registration.jsx": __vite_glob_0_16, "./Pages/SearchResults.jsx": __vite_glob_0_17, "./Pages/UserProfile.jsx": __vite_glob_0_18, "./Pages/dashboard/Activity.jsx": __vite_glob_0_19, "./Pages/dashboard/AvatarSetter.jsx": __vite_glob_0_20, "./Pages/dashboard/Conversation.jsx": __vite_glob_0_21, "./Pages/dashboard/DashboardLayout.jsx": __vite_glob_0_22, "./Pages/dashboard/EditBio.jsx": __vite_glob_0_23, "./Pages/dashboard/EditPost.jsx": __vite_glob_0_24, "./Pages/dashboard/EditProfile.jsx": __vite_glob_0_25, "./Pages/dashboard/ImageField.jsx": __vite_glob_0_26, "./Pages/dashboard/LikedPosts.jsx": __vite_glob_0_27, "./Pages/dashboard/Mail.jsx": __vite_glob_0_28, "./Pages/dashboard/MyPosts.jsx": __vite_glob_0_29, "./Pages/dashboard/NewNewsPost.jsx": __vite_glob_0_30, "./Pages/dashboard/NewPost.jsx": __vite_glob_0_31, "./Pages/dashboard/NewsPosts.jsx": __vite_glob_0_32, "./Pages/dashboard/Notifications.jsx": __vite_glob_0_33, "./Pages/dashboard/PostForm.jsx": __vite_glob_0_34, "./Pages/dashboard/UserComments.jsx": __vite_glob_0_35, "./Pages/dashboard/common/ConversationPreview.jsx": __vite_glob_0_36, "./Pages/dashboard/common/DashboardCreateHeader.jsx": __vite_glob_0_37, "./Pages/dashboard/common/Notification.jsx": __vite_glob_0_38 }));
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
