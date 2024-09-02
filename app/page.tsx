"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, BarChart2, Percent, Activity } from "lucide-react";
import { AdditionalInfoCard } from "@/components/additional-info-card";

const CryptoAnalyticsPlatform = () => {
  const [cryptoData, setCryptoData] = useState({});
  const [selectedCrypto, setSelectedCrypto] = useState("bitcoin");
  const [timeRange, setTimeRange] = useState("30");
  const [loading, setLoading] = useState(true);
  const [coinInfo, setCoinInfo] = useState(null);
  const [allCoins, setAllCoins] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const timeRanges = [
    { value: "1", label: "24h" },
    { value: "7", label: "7d" },
    { value: "30", label: "30d" },
    { value: "365", label: "1y" },
  ];

  const observer = useRef();
  const lastCoinElementRef = useCallback(
    (node) => {
      if (isLoadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoadingMore, hasMore]
  );

  useEffect(() => {
    const fetchCoins = async () => {
      setIsLoadingMore(true);
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=${page}&sparkline=false`
        );
        setAllCoins((prevCoins) => [
          ...prevCoins,
          ...response.data.map((coin) => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
          })),
        ]);
        setHasMore(response.data.length > 0);
      } catch (error) {
        console.error("Error fetching coins:", error);
      } finally {
        setIsLoadingMore(false);
      }
    };
    fetchCoins();
  }, [page]);

  useEffect(() => {
    const fetchCryptoData = async () => {
      setLoading(true);
      try {
        const [priceResponse, infoResponse] = await Promise.all([
          axios.get(
            `https://api.coingecko.com/api/v3/coins/${selectedCrypto}/market_chart?vs_currency=usd&days=${timeRange}`
          ),
          axios.get(`https://api.coingecko.com/api/v3/coins/${selectedCrypto}`),
        ]);

        setCryptoData((prevData) => ({
          ...prevData,
          [selectedCrypto]: priceResponse.data.prices.map(
            ([timestamp, price]) => ({
              timestamp: new Date(timestamp).toLocaleString(),
              price,
            })
          ),
        }));

        setCoinInfo(infoResponse.data);
      } catch (error) {
        console.error("Error fetching crypto data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCryptoData();
  }, [selectedCrypto, timeRange]);

  const handleCryptoChange = (value) => {
    setSelectedCrypto(value);
  };

  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
  };

  const getPercentageChange = () => {
    if (!cryptoData[selectedCrypto] || cryptoData[selectedCrypto].length < 2)
      return 0;
    const firstPrice = cryptoData[selectedCrypto][0].price;
    const lastPrice =
      cryptoData[selectedCrypto][cryptoData[selectedCrypto].length - 1].price;
    return (((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2);
  };

  const percentageChange = getPercentageChange();

  const formatLargeNumber = (num) => {
    if (num > 1000000000) return (num / 1000000000).toFixed(2) + "B";
    if (num > 1000000) return (num / 1000000).toFixed(2) + "M";
    if (num > 1000) return (num / 1000).toFixed(2) + "K";
    return num.toFixed(2);
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Crypto Analytics Dashboard
      </h1>
      <div className="flex flex-col md:flex-row justify-between mb-6">
        <Select onValueChange={handleCryptoChange} value={selectedCrypto}>
          <SelectTrigger className="w-full md:w-[200px] mb-2 md:mb-0">
            <SelectValue placeholder="Select cryptocurrency" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto">
            {allCoins.map((crypto, index) => (
              <SelectItem
                key={crypto.id}
                value={crypto.id}
                ref={index === allCoins.length - 1 ? lastCoinElementRef : null}
              >
                {crypto.name} ({crypto.symbol.toUpperCase()})
              </SelectItem>
            ))}
            {isLoadingMore && <SelectItem disabled>Loading more...</SelectItem>}
          </SelectContent>
        </Select>
        <Tabs
          defaultValue="30"
          onValueChange={handleTimeRangeChange}
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full grid-cols-4">
            {timeRanges.map((range) => (
              <TabsTrigger key={range.value} value={range.value}>
                {range.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${coinInfo?.market_data.current_price.usd.toFixed(2) || "N/A"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${formatLargeNumber(coinInfo?.market_data.market_cap.usd || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              24h Trading Vol
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${formatLargeNumber(coinInfo?.market_data.total_volume.usd || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Change</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                coinInfo?.market_data.price_change_percentage_24h >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {coinInfo?.market_data.price_change_percentage_24h.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* <Card>
          <CardHeader>Additional Information</CardHeader>
          <CardContent>
            <p><strong>Circulating Supply:</strong> {formatLargeNumber(coinInfo?.market_data.circulating_supply || 0)} {coinInfo?.symbol.toUpperCase()}</p>
            <p><strong>Total Supply:</strong> {formatLargeNumber(coinInfo?.market_data.total_supply || 0)} {coinInfo?.symbol.toUpperCase()}</p>
            <p><strong>Max Supply:</strong> {coinInfo?.market_data.max_supply ? formatLargeNumber(coinInfo.market_data.max_supply) : 'Unlimited'} {coinInfo?.symbol.toUpperCase()}</p>
            <p><strong>All-Time High:</strong> ${coinInfo?.market_data.ath.usd.toFixed(2)} (Date: {new Date(coinInfo?.market_data.ath_date.usd).toLocaleDateString()})</p>
            <p><strong>All-Time Low:</strong> ${coinInfo?.market_data.atl.usd.toFixed(2)} (Date: {new Date(coinInfo?.market_data.atl_date.usd).toLocaleDateString()})</p>
          </CardContent>
        </Card> */}
        <AdditionalInfoCard
          coinInfo={coinInfo}
          formatLargeNumber={formatLargeNumber}
        />
        <Card>
          <CardHeader>Price Chart</CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-[300px]">
                Loading...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cryptoData[selectedCrypto]}>
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(tick) =>
                      new Date(tick).toLocaleDateString()
                    }
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    tickFormatter={(tick) => `$${tick.toLocaleString()}`}
                  />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip
                    labelFormatter={(label) => new Date(label).toLocaleString()}
                    formatter={(value) => [
                      `$${value.toLocaleString()}`,
                      "Price",
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#8884d8"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CryptoAnalyticsPlatform;

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   ArrowUpDown,
//   DollarSign,
//   TrendingUp,
//   BarChart2,
//   Percent,
//   Activity,
// } from "lucide-react";
// import { AdditionalInfoCard } from "@/components/additional-info-card";

// const CryptoAnalyticsPlatform = () => {
//   const [cryptoData, setCryptoData] = useState({});
//   const [selectedCrypto, setSelectedCrypto] = useState("bitcoin");
//   const [timeRange, setTimeRange] = useState("30");
//   const [loading, setLoading] = useState(true);
//   const [coinInfo, setCoinInfo] = useState(null);

//   const cryptocurrencies = [
//     { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
//     { id: "ethereum", name: "Ethereum", symbol: "ETH" },
//     { id: "cardano", name: "Cardano", symbol: "ADA" },
//     { id: "dogecoin", name: "Dogecoin", symbol: "DOGE" },
//     { id: "ripple", name: "XRP", symbol: "XRP" },
//     { id: "solana", name: "Solana", symbol: "SOL" },
//     { id: "polkadot", name: "Polkadot", symbol: "DOT" },
//     { id: "binancecoin", name: "Binance Coin", symbol: "BNB" },
//     { id: "litecoin", name: "Litecoin", symbol: "LTC" },
//     { id: "chainlink", name: "Chainlink", symbol: "LINK" },
//   ];

//   const timeRanges = [
//     { value: "1", label: "24h" },
//     { value: "7", label: "7d" },
//     { value: "30", label: "30d" },
//     { value: "365", label: "1y" },
//   ];

//   useEffect(() => {
//     const fetchCryptoData = async () => {
//       setLoading(true);
//       try {
//         const [priceResponse, infoResponse] = await Promise.all([
//           axios.get(
//             `https://api.coingecko.com/api/v3/coins/${selectedCrypto}/market_chart?vs_currency=usd&days=${timeRange}`
//           ),
//           axios.get(`https://api.coingecko.com/api/v3/coins/${selectedCrypto}`),
//         ]);

//         setCryptoData((prevData) => ({
//           ...prevData,
//           [selectedCrypto]: priceResponse.data.prices.map(
//             ([timestamp, price]) => ({
//               timestamp: new Date(timestamp).toLocaleString(),
//               price,
//             })
//           ),
//         }));

//         setCoinInfo(infoResponse.data);
//       } catch (error) {
//         console.error("Error fetching crypto data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCryptoData();
//   }, [selectedCrypto, timeRange]);

//   const handleCryptoChange = (value) => {
//     setSelectedCrypto(value);
//   };

//   const handleTimeRangeChange = (value) => {
//     setTimeRange(value);
//   };

//   const getPercentageChange = () => {
//     if (!cryptoData[selectedCrypto] || cryptoData[selectedCrypto].length < 2)
//       return 0;
//     const firstPrice = cryptoData[selectedCrypto][0].price;
//     const lastPrice =
//       cryptoData[selectedCrypto][cryptoData[selectedCrypto].length - 1].price;
//     return (((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2);
//   };

//   const percentageChange = getPercentageChange();

//   const formatLargeNumber = (num) => {
//     if (num > 1000000000) return (num / 1000000000).toFixed(2) + "B";
//     if (num > 1000000) return (num / 1000000).toFixed(2) + "M";
//     if (num > 1000) return (num / 1000).toFixed(2) + "K";
//     return num.toFixed(2);
//   };

//   return (
//     <div className="p-4 bg-gray-100 min-h-screen">
//       <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
//         Crypto Analytics Dashboard
//       </h1>
//       <div className="flex flex-col md:flex-row justify-between mb-6">
//         <Select onValueChange={handleCryptoChange} value={selectedCrypto}>
//           <SelectTrigger className="w-full md:w-[200px] mb-2 md:mb-0">
//             <SelectValue placeholder="Select cryptocurrency" />
//           </SelectTrigger>
//           <SelectContent>
//             {cryptocurrencies.map((crypto) => (
//               <SelectItem key={crypto.id} value={crypto.id}>
//                 {crypto.name} ({crypto.symbol})
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         <Tabs
//           defaultValue="30"
//           onValueChange={handleTimeRangeChange}
//           className="w-full md:w-auto"
//         >
//           <TabsList className="grid w-full grid-cols-4">
//             {timeRanges.map((range) => (
//               <TabsTrigger key={range.value} value={range.value}>
//                 {range.label}
//               </TabsTrigger>
//             ))}
//           </TabsList>
//         </Tabs>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Current Price</CardTitle>
//             <DollarSign className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               ${coinInfo?.market_data.current_price.usd.toFixed(2) || "N/A"}
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
//             <BarChart2 className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               ${formatLargeNumber(coinInfo?.market_data.market_cap.usd || 0)}
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               24h Trading Vol
//             </CardTitle>
//             <Activity className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               ${formatLargeNumber(coinInfo?.market_data.total_volume.usd || 0)}
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">24h Change</CardTitle>
//             <Percent className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div
//               className={`text-2xl font-bold ${
//                 coinInfo?.market_data.price_change_percentage_24h >= 0
//                   ? "text-green-600"
//                   : "text-red-600"
//               }`}
//             >
//               {coinInfo?.market_data.price_change_percentage_24h.toFixed(2)}%
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//         <AdditionalInfoCard
//           coinInfo={coinInfo}
//           formatLargeNumber={formatLargeNumber}
//         />
//         <Card>
//           <CardHeader>Price Chart</CardHeader>
//           <CardContent>
//             {loading ? (
//               <div className="flex justify-center items-center h-[300px]">
//                 Loading...
//               </div>
//             ) : (
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={cryptoData[selectedCrypto]}>
//                   <XAxis
//                     dataKey="timestamp"
//                     tickFormatter={(tick) =>
//                       new Date(tick).toLocaleDateString()
//                     }
//                   />
//                   <YAxis
//                     domain={["auto", "auto"]}
//                     tickFormatter={(tick) => `$${tick.toLocaleString()}`}
//                   />
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <Tooltip
//                     labelFormatter={(label) => new Date(label).toLocaleString()}
//                     formatter={(value) => [
//                       `$${value.toLocaleString()}`,
//                       "Price",
//                     ]}
//                   />
//                   <Legend />
//                   <Line
//                     type="monotone"
//                     dataKey="price"
//                     stroke="#8884d8"
//                     dot={false}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default CryptoAnalyticsPlatform;
