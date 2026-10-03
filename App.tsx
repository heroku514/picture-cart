import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
} from "react-native";
import { AISLES } from "./src/catalog";
import {
  addCustom,
  clearFinished,
  markFound,
  markNeeded,
  pageCount,
  PAGE_SIZE,
  scaleFor,
  toggleCatalog,
  undone,
  type Entry,
  type TextSize,
} from "./src/cart";
import { loadCart, saveCart } from "./src/store";

type Tab = "pick" | "shop" | "bag" | "size";

const TABS: { id: Tab; label: string }[] = [
  { id: "pick", label: "Pick" },
  { id: "shop", label: "Shop" },
  { id: "bag", label: "Bag" },
  { id: "size", label: "Size" },
];

export default function App() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("pick");
  const [textSize, setTextSize] = useState<TextSize>("regular");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [aisleIndex, setAisleIndex] = useState(0);
  const [bagPage, setBagPage] = useState(0);
  const [shopCursor, setShopCursor] = useState(0);
  const [custom, setCustom] = useState("");
  const [note, setNote] = useState("Tap a picture to add it.");
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    loadCart()
      .then((saved) => {
        setTextSize(saved.textSize);
        setEntries(saved.entries);
        setNote(saved.entries.length === 0 ? "Tap a picture to add it." : "Saved list loaded.");
      })
      .catch(() => setNote("Could not read the saved list."))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveCart({ textSize, entries }).catch(() => setNote("Could not save the list."));
  }, [ready, textSize, entries]);

  const scale = scaleFor(textSize);
  const aisle = AISLES[aisleIndex];
  const remaining = undone(entries);
  const cursor = remaining.length === 0 ? 0 : shopCursor % remaining.length;
  const shopItem = remaining[cursor];
  const pages = pageCount(entries.length);
  const safePage = Math.min(bagPage, pages - 1);
  const pageEntries = entries.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  function onPick(item: (typeof aisle.items)[number]) {
    const exists = entries.some((entry) => entry.id === item.id);
    setEntries(toggleCatalog(entries, item));
    setNote(exists ? `${item.name} removed.` : `${item.name} added.`);
    setConfirmClear(false);
  }

  function onAddCustom() {
    Keyboard.dismiss();
    const result = addCustom(entries, custom);
    setEntries(result.entries);
    setNote(result.note);
    if (result.note === "Added to the cart.") setCustom("");
    setConfirmClear(false);
  }

  function onFound() {
    if (!shopItem) return;
    setEntries(markFound(entries, shopItem.id));
    setShopCursor(0);
    setNote(`${shopItem.name} found.`);
  }

  function onSkip() {
    if (remaining.length <= 1) {
      setNote("Still looking for this.");
      return;
    }
    setShopCursor(cursor + 1);
    setNote("Skipped for now.");
  }

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading the cart</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.body}>
        <Text style={[styles.title, { fontSize: 28 * scale }]}>Picture Cart</Text>
        <Text style={[styles.note, { fontSize: 18 * scale }]}>{note}</Text>

        {tab === "pick" ? (
          <View>
            <Text style={[styles.aisle, { fontSize: 22 * scale }]}>{aisle.title}</Text>
            <View style={styles.row}>
              <BigButton
                label="Previous aisle"
                scale={scale}
                inRow
                onPress={() => {
                  if (aisleIndex === 0) setNote("This is the first aisle.");
                  else {
                    setAisleIndex(aisleIndex - 1);
                    setNote("Showing the aisle.");
                  }
                }}
              />
              <BigButton
                label="Next aisle"
                scale={scale}
                inRow
                onPress={() => {
                  if (aisleIndex === AISLES.length - 1) setNote("This is the last aisle.");
                  else {
                    setAisleIndex(aisleIndex + 1);
                    setNote("Showing the aisle.");
                  }
                }}
              />
            </View>
            <View style={styles.form}>
              <BigButton label="Add custom item" scale={scale} onPress={onAddCustom} filled />
              <Text style={[styles.note, { fontSize: 20 * scale }]}>{custom.trim() ? custom.trim() : "Nothing typed yet."}</Text>
              <TextInput
                value={custom}
                onChangeText={setCustom}
                placeholder="Type an item"
                placeholderTextColor="#8A7560"
                accessibilityLabel="Custom item name"
                style={[styles.input, { fontSize: 20 * scale }]}
                autoCorrect={false}
                spellCheck={false}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={onAddCustom}
              />
            </View>
            {[0, 2].map((start) => (
              <View key={start} style={styles.row}>
                {aisle.items.slice(start, start + 2).map((item) => {
                  const on = entries.some((entry) => entry.id === item.id);
                  return (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={on ? `Remove ${item.name}` : `Add ${item.name}`}
                      onPress={() => onPick(item)}
                      style={[styles.tile, on && styles.tileOn]}
                    >
                      <Text style={styles.emoji}>{item.emoji}</Text>
                      <Text style={[styles.tileName, on && styles.tileNameOn, { fontSize: 18 * scale }]}>
                        {item.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        ) : null}

        {tab === "shop" ? (
          <View style={styles.panel}>
            {!shopItem ? (
              <>
                <Text style={[styles.hero, { fontSize: 26 * scale }]}>
                  {entries.length === 0 ? "The cart is empty." : "All found."}
                </Text>
                <BigButton
                  label={entries.length === 0 ? "Pick pictures" : "Back to the bag"}
                  scale={scale}
                  filled
                  onPress={() => setTab(entries.length === 0 ? "pick" : "bag")}
                />
              </>
            ) : (
              <>
                <Text style={styles.shopEmoji}>{shopItem.emoji}</Text>
                <Text style={[styles.hero, { fontSize: 34 * scale }]}>{shopItem.name}</Text>
                <Text style={[styles.note, { fontSize: 18 * scale }]}>
                  {remaining.length} still to find
                </Text>
                <BigButton label="Found it" scale={scale} filled onPress={onFound} />
                <BigButton label="Not yet" scale={scale} onPress={onSkip} />
              </>
            )}
          </View>
        ) : null}

        {tab === "bag" ? (
          <View style={styles.panel}>
            {entries.length === 0 ? (
              <Text style={[styles.hero, { fontSize: 24 * scale }]}>Nothing in the cart yet.</Text>
            ) : (
              pageEntries.map((entry) => (
                <Pressable
                  key={entry.id}
                  accessibilityRole="button"
                  accessibilityLabel={entry.done ? `${entry.name} still needed` : `Got ${entry.name}`}
                  onPress={() => {
                    setEntries(entry.done ? markNeeded(entries, entry.id) : markFound(entries, entry.id));
                    setNote(entry.done ? `${entry.name} still needed.` : `${entry.name} is in the bag.`);
                    setConfirmClear(false);
                  }}
                  style={[styles.line, entry.done && styles.lineDone]}
                >
                  <Text style={styles.lineEmoji}>{entry.emoji}</Text>
                  <Text style={[styles.lineName, { fontSize: 22 * scale }]}>{entry.name}</Text>
                  <Text style={[styles.lineMark, { fontSize: 18 * scale }]}>{entry.done ? "Got" : "Need"}</Text>
                </Pressable>
              ))
            )}
            <View style={styles.row}>
              <BigButton
                label="Previous page"
                scale={scale}
                inRow
                onPress={() => {
                  if (safePage === 0) setNote("This is the first page.");
                  else {
                    setBagPage(safePage - 1);
                    setNote("");
                  }
                }}
              />
              <BigButton
                label="Next page"
                scale={scale}
                inRow
                onPress={() => {
                  if (safePage >= pages - 1) setNote("This is the last page.");
                  else {
                    setBagPage(safePage + 1);
                    setNote("");
                  }
                }}
              />
            </View>
            {confirmClear ? (
              <View style={styles.row}>
                <BigButton
                  label="Confirm clear"
                  scale={scale}
                  inRow
                  filled
                  onPress={() => {
                    setEntries([]);
                    setBagPage(0);
                    setShopCursor(0);
                    setConfirmClear(false);
                    setNote("List cleared.");
                  }}
                />
                <BigButton
                  label="Cancel clear"
                  scale={scale}
                  inRow
                  onPress={() => {
                    setConfirmClear(false);
                    setNote("Clear canceled.");
                  }}
                />
              </View>
            ) : (
              <View style={styles.row}>
                <BigButton
                  label="Clear finished"
                  scale={scale}
                  inRow
                  onPress={() => {
                    const result = clearFinished(entries);
                    setEntries(result.entries);
                    setNote(result.note);
                  }}
                />
                <BigButton label="Clear the list" scale={scale} inRow onPress={() => setConfirmClear(true)} />
              </View>
            )}
          </View>
        ) : null}

        {tab === "size" ? (
          <View style={styles.panel}>
            <Text style={[styles.hero, { fontSize: 24 * scale }]}>
              Text size is {textSize === "extra" ? "Extra large" : textSize === "large" ? "Large" : "Regular"}
            </Text>
            {(["regular", "large", "extra"] as TextSize[]).map((size) => (
              <BigButton
                key={size}
                label={size === "extra" ? "Extra large" : size === "large" ? "Large" : "Regular"}
                scale={scale}
                filled={textSize === size}
                onPress={() => {
                  setTextSize(size);
                  setNote("Text size saved.");
                }}
              />
            ))}
          </View>
        ) : null}
      </View>
      <View style={styles.tabs}>
        {TABS.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: tab === item.id }}
            onPress={() => {
              setTab(item.id);
              setConfirmClear(false);
            }}
            style={[styles.tab, tab === item.id && styles.tabOn]}
          >
            <Text style={[styles.tabText, tab === item.id && styles.tabTextOn, { fontSize: 16 * scale }]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

function BigButton({
  label,
  onPress,
  scale,
  filled,
  inRow,
}: {
  label: string;
  onPress: () => void;
  scale: number;
  filled?: boolean;
  inRow?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.button, inRow && styles.buttonRow, filled && styles.buttonFilled]}
    >
      <Text style={[styles.buttonText, filled && styles.buttonTextFilled, { fontSize: 18 * scale }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFF6EA" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { fontSize: 28, color: "#1A1208", fontWeight: "700" },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  title: { fontWeight: "800", color: "#1A1208" },
  note: { color: "#5C4634", minHeight: 28, marginTop: 4, marginBottom: 8 },
  aisle: { fontWeight: "700", color: "#1A1208", marginBottom: 8 },
  row: { flexDirection: "row", gap: 8, marginBottom: 8 },
  form: { gap: 8, marginBottom: 12 },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E2CDB8",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#1A1208",
  },
  tile: {
    flex: 1,
    minHeight: 96,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#E2CDB8",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  tileOn: { backgroundColor: "#1B7F4E", borderColor: "#1B7F4E" },
  emoji: { fontSize: 36 },
  tileName: { fontWeight: "700", color: "#1A1208", marginTop: 4 },
  tileNameOn: { color: "#FFFFFF" },
  panel: { flex: 1, gap: 10 },
  hero: { fontWeight: "800", color: "#1A1208" },
  shopEmoji: { fontSize: 84, textAlign: "center" },
  line: {
    minHeight: 72,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E2CDB8",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 10,
  },
  lineDone: { backgroundColor: "#E5F6EC", borderColor: "#1B7F4E" },
  lineEmoji: { fontSize: 28 },
  lineName: { flex: 1, fontWeight: "700", color: "#1A1208" },
  lineMark: { fontWeight: "800", color: "#1B7F4E" },
  button: {
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#C2410C",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
  },
  buttonRow: { flex: 1 },
  buttonFilled: { backgroundColor: "#C2410C" },
  buttonText: { fontWeight: "800", color: "#C2410C", textAlign: "center" },
  buttonTextFilled: { color: "#FFFFFF" },
  tabs: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2CDB8",
    backgroundColor: "#FFF6EA",
  },
  tab: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3E4D4",
  },
  tabOn: { backgroundColor: "#1A1208" },
  tabText: { fontWeight: "800", color: "#1A1208" },
  tabTextOn: { color: "#FFF6EA" },
});
