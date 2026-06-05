import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useInventoryItem } from "../../src/hooks/useCardScan";
import { format, isValid } from "date-fns";

function GradeChip({ gradeKey }: { gradeKey?: string }) {
  if (!gradeKey) return null;
  const configs: Record<string, { bg: string; color: string; label: string }> =
    {
      PSA_10: { bg: "#FFD700", color: "#000000", label: "PSA 10" },
      PSA_9: { bg: "#1A1A1A", color: "#FFD700", label: "PSA 9" },
      BGS_9: { bg: "#0057FF", color: "#FFFFFF", label: "BGS 9" },
      BGS_9_5: { bg: "#0057FF", color: "#FFFFFF", label: "BGS 9.5" },
      SGC_10: { bg: "#1A1A1A", color: "#00C853", label: "SGC 10" },
      RAW: { bg: "#2A2A2A", color: "#888888", label: "RAW" },
    };
  const cfg = configs[gradeKey] ?? {
    bg: "#2A2A2A",
    color: "#888888",
    label: gradeKey,
  };
  return (
    <View
      style={{
        backgroundColor: cfg.bg,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
      }}
    >
      <Text style={{ color: cfg.color, fontSize: 13, fontWeight: "700" }}>
        {cfg.label}
      </Text>
    </View>
  );
}

export default function CardDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: card, isLoading, isError } = useInventoryItem(id ?? "");

  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#000000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color="#E8001C" size="large" />
      </SafeAreaView>
    );
  }

  if (isError || !card) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#000000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#555555", fontSize: 15 }}>Card not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 16 }}
        >
          <Text style={{ color: "#E8001C", fontWeight: "700" }}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const costBasis = parseFloat(card.cost_basis ?? "0");
  const marketValue = parseFloat(card.current_market_value ?? "0");
  const unrealizedGain = marketValue > 0 ? marketValue - costBasis : 0;
  const unrealizedGainPct =
    costBasis > 0 && marketValue > 0
      ? Math.round(((marketValue - costBasis) / costBasis) * 100)
      : 0;
  const _addedAtRaw = card.added_at ? new Date(card.added_at) : null;
  const addedAt =
    _addedAtRaw && isValid(_addedAtRaw) ? _addedAtRaw : new Date();
  const daysHeld = Math.floor((Date.now() - addedAt.getTime()) / 86400000);
  const gainColor = unrealizedGain >= 0 ? "#00C853" : "#E8001C";

  const initials = (card.player_name ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // All data from DB — no live API calls
  const localEbaySales = card.ebay_sales_completed ? JSON.parse(card.ebay_sales_completed) : [];
  const localMyslabsSales = card.myslabs_sales_completed ? JSON.parse(card.myslabs_sales_completed) : [];
  const localSales = [...localEbaySales, ...localMyslabsSales]
    .sort((a, b) => new Date(b.endDate ?? 0).getTime() - new Date(a.endDate ?? 0).getTime());

  const recentSales = localSales
    .filter((s: any) => parseFloat(s.soldPrice?.value ?? "0") > 0)
    .slice(0, 8);

  const localEbayActive = card.ebay_active_listings ? JSON.parse(card.ebay_active_listings) : [];
  const localMyslabsActive = card.myslabs_active_listings ? JSON.parse(card.myslabs_active_listings) : [];
  const localActiveListings = [...localEbayActive, ...localMyslabsActive]
    .sort((a, b) => parseFloat(a.price?.value ?? "0") - parseFloat(b.price?.value ?? "0"))
    .slice(0, 5);

  const avgSold = recentSales.length > 0
    ? recentSales.reduce(
        (sum: number, s: any) => sum + parseFloat(s.soldPrice?.value ?? "0"),
        0,
      ) / recentSales.length
    : 0;

  const stats = [
    {
      label: "Cost Basis",
      value: `$${costBasis.toFixed(2)}`,
      color: "#888888",
    },
    {
      label: "Market Value",
      value: marketValue > 0 ? `$${marketValue.toFixed(2)}` : "—",
      color: "white",
    },
    {
      label: "Days Held",
      value: `${daysHeld}d`,
      color: daysHeld >= 60 ? "#FFB300" : "white",
    },
    {
      label: "Unrealized P&L",
      value:
        marketValue > 0
          ? `${unrealizedGain >= 0 ? "+" : ""}$${unrealizedGain.toFixed(2)} (${unrealizedGainPct >= 0 ? "+" : ""}${unrealizedGainPct}%)`
          : "—",
      color: marketValue > 0 ? gainColor : "#555555",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000000" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Card Detail</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Card image */}
        <View style={styles.imageArea}>
          {card.photos?.[0] ? (
            <Image
              source={{ uri: card.photos[0] }}
              style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.imageInitials}>{initials}</Text>
          )}
          {card.cert_number && (
            <View style={styles.certBadge}>
              <Text style={styles.certText}>Cert #{card.cert_number}</Text>
            </View>
          )}
          {card.listing_status && card.listing_status !== "unlisted" && (
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    card.listing_status === "listed"
                      ? "rgba(0,87,255,0.8)"
                      : "rgba(0,200,83,0.8)",
                },
              ]}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 11,
                  fontWeight: "700",
                  textTransform: "uppercase",
                }}
              >
                {card.listing_status}
              </Text>
            </View>
          )}
        </View>

        {/* Player info */}
        <View
          style={{
            paddingHorizontal: 24,
            marginTop: 20,
            alignItems: "center",
            gap: 8,
          }}
        >
          <Text style={styles.playerName}>{card.player_name}</Text>
          <Text style={styles.cardSubtitle}>
            {[
              card.year,
              card.set_name,
              card.variation && card.variation !== "Base"
                ? card.variation
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Text>
          {card.card_number && (
            <Text style={{ color: "#555555", fontSize: 12 }}>
              #{card.card_number}
            </Text>
          )}
          <GradeChip gradeKey={card.grade_key} />
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCell}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>
                {s.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Card details row */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <Text style={styles.sectionLabel}>CARD DETAILS</Text>
          <View style={styles.sectionCard}>
            {[
              { label: "Sport", value: card.sport },
              { label: "Manufacturer", value: card.manufacturer ?? "—" },
              { label: "Payment", value: card.notes ?? "—" },
              { label: "Added", value: format(addedAt, "MMM d, yyyy") },
            ].map((row, i, arr) => (
              <View
                key={row.label}
                style={[
                  styles.detailRow,
                  i < arr.length - 1 && styles.saleRowBorder,
                ]}
              >
                <Text style={styles.detailLabel}>{row.label}</Text>
                <Text style={styles.detailValue}>{row.value ?? "—"}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* eBay avg + recent sales */}
        {avgSold > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "baseline",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <Text style={styles.sectionLabel}>RECENT SALES</Text>
              <Text
                style={{ color: "#00C853", fontSize: 12, fontWeight: "700" }}
              >
                avg ${avgSold.toFixed(2)}
              </Text>
            </View>
            <View style={styles.sectionCard}>
              {recentSales.map((sale: any, i: number) => (
                <TouchableOpacity
                  key={sale.itemId}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (sale.itemWebUrl) {
                      WebBrowser.openBrowserAsync(sale.itemWebUrl);
                    }
                  }}
                  style={[
                    styles.saleRow,
                    i < recentSales.length - 1 && styles.saleRowBorder,
                  ]}
                >
                  <View style={{ flex: 1, flexDirection: "row", alignItems: "center", marginRight: 8 }}>
                    {sale.image?.imageUrl && (
                      <Image
                        source={{ uri: sale.image.imageUrl }}
                        style={{
                          width: 36,
                          height: 50,
                          borderRadius: 4,
                          marginRight: 10,
                          backgroundColor: "#222222",
                        }}
                        resizeMode="cover"
                      />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{ color: "white", fontSize: 13, fontWeight: "600" }}
                        numberOfLines={2}
                      >
                        {sale.title}
                      </Text>
                      {sale.condition && (
                        <Text style={{ color: "#555555", fontSize: 10, marginTop: 2 }}>
                          {sale.condition}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.salePrice}>
                      ${parseFloat(sale.soldPrice?.value ?? "0").toFixed(2)}
                    </Text>
                    {sale.endDate && (
                      <Text
                        style={{
                          color: "#555555",
                          fontSize: 10,
                          marginTop: 4,
                        }}
                      >
                        {format(new Date(sale.endDate), "MMM d, yyyy")}
                      </Text>
                    )}
                    {sale.platform && (
                      <View
                        style={[
                          styles.platformBadge,
                          { backgroundColor: sale.platform === "eBay" ? "rgba(0,87,255,0.15)" : "rgba(224,31,43,0.15)", marginRight: 0, marginTop: 6, paddingHorizontal: 6, paddingVertical: 2 },
                        ]}
                      >
                        <Text
                          style={[styles.platformBadgeText, { color: sale.platform === "eBay" ? "#0057FF" : "#E01F2B", fontSize: 9 }]}
                        >
                          {sale.platform}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Active listings at purchase */}
        {localActiveListings.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <Text style={styles.sectionLabel}>ACTIVE LISTINGS</Text>
            <View style={styles.sectionCard}>
              {localActiveListings.map((item: any, i: number) => (
                <TouchableOpacity
                  key={item.itemId}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (item.itemWebUrl) {
                      WebBrowser.openBrowserAsync(item.itemWebUrl);
                    }
                  }}
                  style={[
                    styles.saleRow,
                    i < localActiveListings.length - 1 && styles.saleRowBorder,
                  ]}
                >
                  <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                    {item.image?.imageUrl && (
                      <Image
                        source={{ uri: item.image.imageUrl }}
                        style={{
                          width: 36,
                          height: 50,
                          borderRadius: 4,
                          marginRight: 10,
                          backgroundColor: "#222222",
                        }}
                        resizeMode="cover"
                      />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{ color: "white", fontSize: 13, fontWeight: "600" }}
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                      {item.condition && (
                        <Text style={{ color: "#555555", fontSize: 10, marginTop: 2 }}>
                          {item.condition}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={{ alignItems: "flex-end", paddingLeft: 8 }}>
                    <Text style={styles.salePrice}>
                      ${parseFloat(item.price?.value ?? "0").toFixed(2)}
                    </Text>
                    {item.platform && (
                      <View
                        style={[
                          styles.platformBadge,
                          { backgroundColor: item.platform === "eBay" ? "rgba(0,87,255,0.15)" : "rgba(224,31,43,0.15)", marginRight: 0, marginTop: 6, paddingHorizontal: 6, paddingVertical: 2 },
                        ]}
                      >
                        <Text
                          style={[styles.platformBadgeText, { color: item.platform === "eBay" ? "#0057FF" : "#E01F2B", fontSize: 9 }]}
                        >
                          {item.platform}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {recentSales.length === 0 && localActiveListings.length === 0 && !!card.player_name && (
          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <Text style={styles.sectionLabel}>COMPS DATA</Text>
            <View
              style={[
                styles.sectionCard,
                { padding: 20, alignItems: "center" },
              ]}
            >
              <Text style={{ color: "#555555", fontSize: 13 }}>
                No comps data stored for this card
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[
            styles.listBtn,
            card?.listing_status === "listed" && { borderColor: "#555555", opacity: 0.6 }
          ]}
          onPress={() => {
            if (card?.listing_status !== "listed") {
              router.push({
                pathname: "/listings/create",
                params: { inventoryId: card?.id },
              });
            }
          }}
          activeOpacity={card?.listing_status === "listed" ? 1 : 0.85}
          disabled={card?.listing_status === "listed"}
        >
          <Text 
            style={[
              styles.listBtnText, 
              card?.listing_status === "listed" && { color: "#555555" }
            ]}
          >
            {card?.listing_status === "listed" ? "Listed" : "List for Sale"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sellBtn}
          onPress={() => router.push("/sell/scan")}
          activeOpacity={0.85}
        >
          <Text style={styles.sellBtnText}>Quick Sell</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  backText: { color: "white", fontSize: 28 },
  headerTitle: { color: "white", fontSize: 17, fontWeight: "600" },
  imageArea: {
    height: 280,
    marginHorizontal: 20,
    backgroundColor: "#111111",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    overflow: "hidden",
  },
  imageInitials: { color: "#2A2A2A", fontSize: 64, fontWeight: "900" },
  certBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  certText: { color: "#555555", fontSize: 11 },
  statusBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  detailRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    padding: 14,
  },
  detailLabel: { color: "#555555", fontSize: 13 },
  detailValue: { color: "white", fontSize: 13, fontWeight: "600" as const },
  playerName: {
    fontSize: 26,
    fontWeight: "700",
    color: "white",
    marginBottom: 6,
    textAlign: "center",
  },
  cardSubtitle: { color: "#888888", fontSize: 14, marginBottom: 12 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 24,
  },
  statCell: {
    width: "47%",
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  statLabel: {
    color: "#555555",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  statValue: { fontSize: 16, fontWeight: "700" },
  sectionLabel: {
    color: "#888888",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: "#111111",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    overflow: "hidden",
  },
  saleRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    justifyContent: "space-between",
  },
  saleRowBorder: { borderBottomWidth: 1, borderBottomColor: "#2A2A2A" },
  salePrice: { color: "white", fontWeight: "700", fontSize: 15, flex: 1 },
  platformBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 12,
  },
  platformBadgeText: { fontSize: 11, fontWeight: "700" },
  saleDate: { color: "#555555", fontSize: 12 },
  platformRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  platformName: { color: "white", fontWeight: "600", fontSize: 14 },
  platformAvg: { color: "white", fontSize: 14, fontWeight: "700" },
  platformLowest: { color: "#888888", fontSize: 11, marginTop: 2 },
  aiCard: {
    backgroundColor: "#111111",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#E8001C",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    padding: 20,
    backgroundColor: "#000000",
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
  },
  listBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#0057FF",
    alignItems: "center",
    justifyContent: "center",
  },
  listBtnText: { color: "#0057FF", fontWeight: "700", fontSize: 15 },
  sellBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#E8001C",
    alignItems: "center",
    justifyContent: "center",
  },
  sellBtnText: { color: "white", fontWeight: "700", fontSize: 15 },
});
