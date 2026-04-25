import { Innertube, UniversalCache } from "youtubei.js";

async function test() {
  const yt = await Innertube.create({ cache: new UniversalCache(false) });
  try {
    const info = await yt.getBasicInfo("sng0VbBxlJk"); // some tamil song
    const format = info.chooseFormat({ type: "audio", quality: "best" });
    console.log("Audio URL:", format.decipher(yt.session.player));
  } catch (error) {
    console.log("Error:", error);
  }
}
test();
