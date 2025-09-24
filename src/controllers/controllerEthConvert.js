import axios from "axios";

let cachedData = null;
let lastFetchTimestamp = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; //5 menit

export const getEthIdrPrice = async (req, res) => {
  try {
    const now = Date.now();

    if (cachedData && now - lastFetchTimestamp < CACHE_DURATION_MS) {
      return res.status(200).json(cachedData);
    }

    const response = await axios.get(
      "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest",
      {
        headers: {
          "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY,
        },
        params: {
          symbol: "ETH",
          convert: "IDR",
        },
      }
    );

    const price = response.data.data.ETH[0].quote.IDR.price;

    const formattedData = {
      ethereum: {
        idr: price,
      },
    };

    cachedData = formattedData;
    lastFetchTimestamp = now;

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Gagal mengambil harga:", error.message);
    res.status(500).json({ error: "Gagal mengambil data harga dari server." });
  }
};
