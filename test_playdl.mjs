import play from 'play-dl';
import YTMusic from "ytmusic-api";

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  const res = await ytmusic.searchSongs("tamil");
  const firstVideoId = res[0].videoId;
  console.log("Found videoId:", firstVideoId);

  play.setToken({
    youtube : {
        cookie : ""
    }
  })

  try {
    const stream = await play.stream(firstVideoId);
    console.log("Stream URL:", stream.url);
  } catch (err) {
    console.error("play-dl error:", err);
  }
}

test();
