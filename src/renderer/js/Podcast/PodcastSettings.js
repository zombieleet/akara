const savepodcast = async (podcasturl,callback) => {

  const { podcast } = _require("./configuration.js");
  const pod = require(podcast);
  const podson = require("podson");

  let conhttp_s = require("http");

  if ( Array.isArray(podcasturl) )
      ;
  else if ( typeof(podcasturl) === "string" )
      podcasturl = [ podcasturl ];
  else
      return callback("first argument is not a string or an array",null);

  let errs = [];
  let succ = [];

  akara_emit.on("akara::podcast:image", ({ description , title, language, owner, categories, image, podlink }) => {
      pod[title] = {
          title,
          description,
          language,
          owner,
          categories,
          image,
          podlink,
          isDone: podcasturl[podcasturl.length - 1] === podlink ? true : false
      };
      fs.writeFileSync(podcast, JSON.stringify(pod));
      callback(null,pod[title]);
  });


  for ( let pod__ of podcasturl ) {

      let result;

      try {

          callback(null,null, {
              message: `Getting Podcast from podcast rss feed ${pod__}`
          });

          result = await podson.getPodcast(pod__);

      } catch(ex) {
          result = ex;
      }

      if ( Error[Symbol.hasInstance](result) ) {
          callback({
              podcastLink: pod__,
              message: `An error occured while adding this podcast ${pod__}`,
              moreMessage: result.message,
              isDone: podcasturl[podcasturl.length - 1] === pod__ ? true : false
          });
          continue;
      }

      if ( Object.keys(pod).indexOf(result.title) === -1 ) {

          callback(null,null, {
              message: `Processing ${pod__}`,
              isDone: podcasturl[podcasturl.length - 1] === pod__ ? true : false
          });

          result.podlink = pod__;

          console.log(result, result.image);

          if ( ! result.image || result.image.length === 0 ) {
              result.image = base64Img.base64Sync(path.join(app.getAppPath(), "app", "renderer", "img", "posters", "default_poster.jpg"));
              akara_emit.emit("akara::podcast:image", result);
              continue;
          }
          //http://feeds.feedburner.com/boagworldpodcast/

          base64Img.requestBase64(result.image, (err,res,body) => {

              if ( err ) {
                  result.image = base64Img.base64Sync(path.join(app.getAppPath(), "app", "renderer", "img", "posters", "default_poster.jpg"));
                  akara_emit.emit("akara::podcast:image", result);
                  return;
              }

              result.image = body;
              akara_emit.emit("akara::podcast:image", result);
          });
      }
  }
};

module.exports.savepodcast = savepodcast;

module.exports.loadpodcast = () => {
  const { podcast } = _require("./configuration.js");
  const pod = require(podcast);
  return Object.keys(pod).length > 0 ? pod : {};
};

module.exports.removepodcast = podtoremove => {

  const { podcast } = _require("./configuration.js");
  let pod = require(podcast);

  if ( ! Object.keys(pod).includes(podtoremove) )
      return false;


  for ( let _pods of Object.keys(pod) ) {
      if ( _pods === podtoremove )
          delete pod[podtoremove];
  }


  fs.writeFileSync(podcast, JSON.stringify(pod));

  return true;
};