'use client';

import type { ComponentType } from 'react';
import type { LabId } from '../../lib/journey/types';
import type { LabProps } from './types';
import ShareSplitLab from './ShareSplitLab';
import PoolVsDirectLab from './PoolVsDirectLab';
import InvestVsTradeLab from './InvestVsTradeLab';
import VolatilityPathLab from './VolatilityPathLab';
import MarketOrderBookLab from './MarketOrderBookLab';
import LimitOrderSimLab from './LimitOrderSimLab';
import OrderDepthLab from './OrderDepthLab';
import BrokerAppTourLab from './BrokerAppTourLab';
import ChargesExplorerLab from './ChargesExplorerLab';
import OrderLifecycleLab from './OrderLifecycleLab';

export const LABS: Record<LabId, ComponentType<LabProps>> = {
  'share-split': ShareSplitLab,
  'pool-vs-direct': PoolVsDirectLab,
  'invest-vs-trade': InvestVsTradeLab,
  'volatility-path': VolatilityPathLab,
  'market-order-book': MarketOrderBookLab,
  'limit-order-sim': LimitOrderSimLab,
  'order-depth': OrderDepthLab,
  'broker-app-tour': BrokerAppTourLab,
  'charges-explorer': ChargesExplorerLab,
  'order-lifecycle': OrderLifecycleLab
};
