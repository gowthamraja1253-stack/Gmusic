import YTMusic from "ytmusic-api";

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  const res = await ytmusic.searchSongs("tamil");
  console.log(JSON.stringify(res.slice(0, 2), null, 2));
}

test();
