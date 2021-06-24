async function domToImage(el: HTMLElement) {
  const { width, height } = el.getBoundingClientRect();

  const imgElPoll: HTMLImageElement[] = [];
  traverse(el, imgElPoll);

  await Promise.all(
    imgElPoll.map(async (imgEl) => {
      try {
        const rowData = await fetch(imgEl.src)
          .then((res) => {
            return res.blob();
          })
          .then((blob) => {
            return blobToBase64(blob);
          });

        imgEl.src = rowData as string;
      } catch (err) {}
    })
  );

  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <style>
  ${getStyles().join("")}
  </style>
  <foreignObject width="${width}" height="${height}">
  ${new XMLSerializer().serializeToString(el)}
  </foreignObject>
  </svg>`;

  return svgElToImageBase64(svgString);
}

async function blobToBase64(blob: Blob) {
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
}

function traverse(el: HTMLElement, imgElPoll: HTMLImageElement[]) {
  if (el.tagName === "IMG") {
    imgElPoll.push(el as HTMLImageElement);
  }
  [...el.childNodes].forEach((childNode) => {
    traverse(childNode as HTMLElement, imgElPoll);
  });
}

function svgElToImageBase64(svgString: string): Promise<string> {
  // svg格式的 base64 编码
  const imgSvgBase64 = `data:image/svg+xml;charset=utf-8,${
svgString
  }`;
  const imgEl = new Image();

  return new Promise((resolve) => {
    imgEl.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = imgEl.width;
      canvas.height = imgEl.height;
      const context = canvas.getContext("2d");
      context?.drawImage(imgEl, 0, 0);
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
