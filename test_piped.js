async function test() {
  try {
    const res = await fetch("https://pipedapi.smnz.de/search?q=tamil&filter=music_songs");
    const data = await res.json();
    console.log(JSON.stringify(data.items.slice(0, 1), null, 2));
  } catch (err) {
    console.error(err);
  }
}
test();
