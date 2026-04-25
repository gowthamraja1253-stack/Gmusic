import ytdl from "@distube/ytdl-core";
import YTMusic from "ytmusic-api";

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  const res = await ytmusic.searchSongs("tamil");
  const firstVideoId = res[0].videoId;
  console.log("Found videoId:", firstVideoId);

  const info = await ytdl.getInfo(firstVideoId);
  const audioFormats = ytdl.filterFormats(info.formats, "audioonly");
  console.log(audioFormats[0].url);
}

test();
