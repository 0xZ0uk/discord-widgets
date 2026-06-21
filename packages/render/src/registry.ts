import type { ComponentType } from "react";
import { CryptoPrices } from "./components/CryptoPrices.js";
import { RssFeedCard } from "./components/RssFeedCard.js";
import { WeatherCard } from "./components/WeatherCard.js";

/**
 * Registry mapping widget names (from catalog YAML) to their React components.
 * Add new components here as they are created.
 */
export const widgetRegistry: Record<string, ComponentType<unknown>> = {
	weather: WeatherCard as unknown as ComponentType<unknown>,
	"rss-feed": RssFeedCard as unknown as ComponentType<unknown>,
	"crypto-prices": CryptoPrices as unknown as ComponentType<unknown>,
};
