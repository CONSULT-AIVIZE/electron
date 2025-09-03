import { RealtimeAgent, tool } from '@openai/agents/realtime'

const getStockPrice = tool({
  name: 'getStockPrice',
  description: 'Return the latest stock price for a given ticker.',
  parameters: {
    type: 'object',
    properties: {
      ticker: { type: 'string', description: 'Ticker symbol, e.g., AAPL' },
    },
    required: ['ticker'],
    additionalProperties: false,
  },
  execute: async (args: any) => {
    const { ticker } = args as { ticker: string };
    console.log('[Stock Tool] Fetching price for:', ticker);
    
    // Mock stock price data since the example URL is dummy
    const mockPrices: { [key: string]: number } = {
      'AAPL': 175.43,
      'GOOGL': 2847.56,
      'MSFT': 378.92,
      'TSLA': 248.17,
      'NVDA': 890.45,
      'AMZN': 3456.78
    };
    
    const price = mockPrices[ticker.toUpperCase()] || Math.floor(Math.random() * 1000) + 10;
    
    return { 
      ticker: ticker.toUpperCase(), 
      price: price,
      currency: 'USD',
      timestamp: new Date().toISOString()
    };
  },
});

export const stockTools = [getStockPrice]

export const createDefaultAgent = (customTools = []) => {
  return new RealtimeAgent({
    name: 'assistant',
    voice: 'sage',
    instructions: `You are a helpful stock price assistant.
- When the user asks for a stock price, call getStockPrice with the ticker symbol
- Support common stocks like AAPL, GOOGL, MSFT, TSLA, NVDA, AMZN
- Respond naturally and conversationally in Chinese
- Keep responses concise but friendly
- 用中文回答`,
    tools: [...stockTools, ...customTools],
    handoffs: [],
  })
}