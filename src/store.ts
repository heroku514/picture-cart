import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseCart, type SavedCart } from "./cart";

const KEY = "picture-cart-v1";

export async function loadCart(): Promise<SavedCart> {
  const raw = await AsyncStorage.getItem(KEY);
  return parseCart(raw);
}

export async function saveCart(cart: SavedCart): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(cart));
}
