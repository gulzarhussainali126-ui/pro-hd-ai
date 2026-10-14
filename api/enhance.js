export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST' });
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return res.status(500).json({ error: 'Token missing in Vercel' });

  try {
    const start = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "f121d640bd286e1fdc8f18bf063830449ac1353a",
        input: { image: req.body.image, scale: 4, face_enhance: true }
      })
    });

    let prediction = await start.json();
    if(prediction.error) return res.status(500).json(prediction);

    while (prediction.status !== "succeeded" && prediction.status !== "failed") {
      await new Promise(r => setTimeout(r, 2000));
      const poll = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { "Authorization": `Token ${token}` }
      });
      prediction = await poll.json();
    }

    res.json(prediction);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
