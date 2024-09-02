import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { InfoIcon } from 'lucide-react';

export const AdditionalInfoCard = ({ coinInfo, formatLargeNumber }) => {
  const [showTooltip, setShowTooltip] = useState('');

  const infoItems = [
    { label: 'Circulating Supply', value: coinInfo?.market_data.circulating_supply, tooltip: 'The amount of coins currently in circulation' },
    { label: 'Total Supply', value: coinInfo?.market_data.total_supply, tooltip: 'The total amount of coins in existence' },
    { label: 'Max Supply', value: coinInfo?.market_data.max_supply, tooltip: 'The maximum amount of coins that will ever exist' },
  ];

  const calculateSupplyPercentage = (supply, maxSupply) => {
    if (!supply || !maxSupply) return 0;
    return (supply / maxSupply) * 100;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="bg-gray-100 dark:bg-gray-800">
          <h3 className="text-lg font-semibold">Additional Information</h3>
        </CardHeader>
        <CardContent className="p-6">
          {infoItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="mb-4"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className="font-medium mr-2">{item.label}:</span>
                  <div className="relative">
                    <InfoIcon
                      className="h-4 w-4 text-gray-400 cursor-help"
                      onMouseEnter={() => setShowTooltip(item.label)}
                      onMouseLeave={() => setShowTooltip('')}
                    />
                    {showTooltip === item.label && (
                      <div className="absolute z-10 w-48 p-2 mt-1 text-sm text-white bg-gray-800 rounded-md shadow-lg">
                        {item.tooltip}
                      </div>
                    )}
                  </div>
                </div>
                <span className="font-bold">
                  {item.value ? formatLargeNumber(item.value) : 'Unlimited'} {coinInfo?.symbol.toUpperCase()}
                </span>
              </div>
              <Progress
                value={calculateSupplyPercentage(item.value, coinInfo?.market_data.max_supply)}
                className="h-2 bg-gray-200"
              />
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
          >
            <h4 className="font-semibold mb-2">Price Milestones</h4>
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">All-Time High</p>
                <p className="font-bold text-green-600">
                  ${coinInfo?.market_data.ath.usd.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(coinInfo?.market_data.ath_date.usd).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">All-Time Low</p>
                <p className="font-bold text-red-600">
                  ${coinInfo?.market_data.atl.usd.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(coinInfo?.market_data.atl_date.usd).toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};


