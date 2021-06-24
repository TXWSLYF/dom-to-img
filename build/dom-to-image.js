"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function domToImage(el) {
    return __awaiter(this, void 0, void 0, function* () {
        const { width, height } = el.getBoundingClientRect();
        const imgElPoll = [];
        traverse(el, imgElPoll);
        yield Promise.all(imgElPoll.map((imgEl) => __awaiter(this, void 0, void 0, function* () {
            try {
                const rowData = yield fetch(imgEl.src)
                    .then((res) => {
                    return res.blob();
                })
                    .then((blob) => {
                    return blobToBase64(blob);
                });
                imgEl.src = rowData;
            }
            catch (err) { }
        })));
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <style>
  ${getStyles().join("")}
  </style>
  <foreignObject width="${width}" height="${height}">
  ${new XMLSerializer().serializeToString(el)}
  </foreignObject>
  </svg>`;
        return svgElToImageBase64(svgString);
    });
}
function blobToBase64(blob) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = (e) => {
                resolve(e.target && e.target.result);
            };
            fileReader.onerror = () => {
                reject(new Error("blobToBase64 error"));
            };
            fileReader.readAsDataURL(blob);
        });
    });
}
function traverse(el, imgElPoll) {
    if (el.tagName === "IMG") {
        imgElPoll.push(el);
    }
    [...el.childNodes].forEach((childNode) => {
        traverse(childNode, imgElPoll);
    });
}
function svgElToImageBase64(svgString) {
    // svg格式的 base64 编码
    const imgSvgBase64 = `data:image/svg+xml;charset=utf-8,${svgString}`;
    const imgEl = new Image();
    return new Promise((resolve) => {
        imgEl.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = imgEl.width;
            canvas.height = imgEl.height;
            const context = canvas.getContext("2d");
            context === null || context === void 0 ? void 0 : context.drawImage(imgEl, 0, 0);
            const imgPngBase64 = canvas.toDataURL("image/png");
            resolve(imgPngBase64);
        };
        imgEl.src = imgSvgBase64;
    });
}
function getStyles() {
    return [...document.querySelectorAll("style")].map((i) => {
        return i.innerHTML;
    });
}
