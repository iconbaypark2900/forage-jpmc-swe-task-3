// Importing the type definition for server responses.
import { ServerRespond } from './DataStreamer';

// Defining the Row interface to structure the data processed by DataManipulator.
export interface Row {
  price_abc: number, // The average price of asset ABC.
  price_def: number, // The average price of asset DEF.
  ratio: number, // The ratio of price_abc to price_def.
  timestamp: Date, // The most recent timestamp from the data.
  upper_bound: number, // The upper threshold for the ratio to trigger an alert.
  lower_bound: number, // The lower threshold for the ratio to trigger an alert.
  trigger_alert: number | undefined, // The value of the ratio if it triggers an alert, otherwise undefined.
}

// DataManipulator class provides a static method to transform server response into a structured Row.
export class DataManipulator {
  // generateRow transforms an array of ServerRespond objects into a Row object.
  static generateRow(serverResponds: ServerRespond[]): Row {
    // Calculating the average price for asset ABC by averaging its top ask and bid prices.
    const priceABC = (serverResponds[0].top_ask.price + serverResponds[0].top_bid.price) / 2;
    // Calculating the average price for asset DEF by averaging its top ask and bid prices.
    const priceDEF = (serverResponds[1].top_ask.price + serverResponds[1].top_bid.price) / 2;
    // Calculating the ratio of the average prices of assets ABC to DEF.
    const ratio = priceABC / priceDEF;
    // Defining the upper and lower bounds for the ratio, beyond which an alert should be triggered.
    const upperBound = 1 + 0.05; // Upper bound set to 5% above 1
    const lowerBound = 1 - 0.05; // Lower bound set to 5% below 1
    // Returning a Row object with calculated fields, including determining the most recent timestamp
    // and whether the current ratio triggers an alert based on defined bounds.
    return {
      price_abc: priceABC,
      price_def: priceDEF,
      ratio,
      timestamp: serverResponds[0].timestamp > serverResponds[1].timestamp ?
                 serverResponds[0].timestamp : serverResponds[1].timestamp, // Choosing the latest timestamp.
      upper_bound: upperBound,
      lower_bound: lowerBound,
      trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined, // Setting trigger_alert based on ratio bounds.
    };
  }
}
