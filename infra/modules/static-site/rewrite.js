// CloudFront Function (viewer request): map folder-style URLs to their index.html.
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  var parts = uri.split("/");
  var last = parts.pop();

  if (uri.endsWith("/")) {
    request.uri = uri + "index.html";
  } else if (last.indexOf("__next.") === 0 && last.endsWith(".txt")) {
    // Next.js asks for page data as __next.about.__PAGE__.txt,
    // but the static export saves it as __next.about/__PAGE__.txt.
    var segments = last.slice(7, -4).split(".");
    if (segments.length > 1) {
      parts.push("__next." + segments.join("/") + ".txt");
      request.uri = parts.join("/");
    }
  } else if (!last.includes(".")) {
    request.uri = uri + "/index.html";
  }
  return request;
}
