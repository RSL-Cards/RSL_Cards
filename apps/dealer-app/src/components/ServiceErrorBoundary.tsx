import React, { Component, ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { ENDPOINTS } from "../config/api";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  children: ReactNode;
  serviceName: string;
  endpoints?: string[];
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * Service-aware Error Boundary
 * Catches errors and identifies which microservice likely failed
 */
export class ServiceErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });

    // Log to console in dev, could send to analytics in prod
    console.error(`[${this.props.serviceName}] Error Boundary caught:`, error);
  }

  private identifyFailedService(error: Error): string {
    const message = error.message?.toLowerCase() || "";
    const stack = error.stack?.toLowerCase() || "";
    const errorString = message + stack;

    // Map error patterns to services
    const servicePatterns: Record<string, string[]> = {
      "Auth Service": ["/v1/auth", "login", "register", "token", "jwt"],
      "User Service": [
        "/v1/users",
        "payment-methods",
        "connected-platforms",
        "profile",
      ],
      "Inventory Service": ["/v1/inventory", "cards", "bulk-import"],
      "Transaction Service": ["/v1/transactions", "buy", "sell", "trade"],
      "Listing Service": ["/v1/listings", "ebay", "whatnot", "marketplace"],
      "Card DB Service": ["/v1/cards", "scan", "search", "comps"],
      "Notification Service": ["/v1/notifications", "shows"],
      "Analytics Service": ["/v1/analytics", "reports", "tax"],
      "AI Narrative Service": ["/v1/narratives", "insights"],
    };

    for (const [service, patterns] of Object.entries(servicePatterns)) {
      if (patterns.some((p) => errorString.includes(p))) {
        return service;
      }
    }

    return this.props.serviceName || "Unknown Service";
  }

  private getServicePort(serviceName: string): string {
    return "8080";
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const failedService = this.identifyFailedService(this.state.error);
      const port = this.getServicePort(failedService);

      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <Ionicons name="warning" size={40} color="#E8001C" style={styles.errorIcon} />
            <Text style={styles.title}>Service Unavailable</Text>

            <View style={styles.serviceCard}>
              <Text style={styles.serviceLabel}>FAILED DOMAIN</Text>
              <Text style={styles.serviceName}>{failedService}</Text>
              <Text style={styles.servicePort}>Backend Port: {port}</Text>
            </View>

            {this.props.endpoints && (
              <View style={styles.endpointsCard}>
                <Text style={styles.endpointsLabel}>AFFECTED ENDPOINTS</Text>
                {this.props.endpoints.map((ep, i) => (
                  <Text key={i} style={styles.endpoint}>
                    {ep}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.errorDetails}>
              <Text style={styles.errorLabel}>ERROR DETAILS</Text>
              <Text style={styles.errorMessage} numberOfLines={3}>
                {this.state.error.message}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.retryBtn}
              onPress={this.handleReset}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>

            <Text style={styles.hint}>
              Check Backend Docker logs:{"\n"}
              docker logs rsl-backend-dev
            </Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

// Pre-configured boundaries for common services
export const AuthErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ServiceErrorBoundary
    serviceName="Auth Service"
    endpoints={[
      ENDPOINTS.auth.login,
      ENDPOINTS.auth.register,
      ENDPOINTS.auth.onboarding,
    ]}
  >
    {children}
  </ServiceErrorBoundary>
);

export const UserErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ServiceErrorBoundary
    serviceName="User Service"
    endpoints={[
      ENDPOINTS.users.me,
      ENDPOINTS.users.paymentMethods,
      ENDPOINTS.users.connectedPlatforms,
    ]}
  >
    {children}
  </ServiceErrorBoundary>
);

export const InventoryErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ServiceErrorBoundary
    serviceName="Inventory Service"
    endpoints={[ENDPOINTS.inventory.list, ENDPOINTS.inventory.create]}
  >
    {children}
  </ServiceErrorBoundary>
);

export const AnalyticsErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ServiceErrorBoundary
    serviceName="Analytics Service"
    endpoints={[
      ENDPOINTS.analytics.daily,
      ENDPOINTS.analytics.dashboard,
    ]}
  >
    {children}
  </ServiceErrorBoundary>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    padding: 20,
    alignItems: "center",
    paddingTop: 60,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#E8001C",
    marginBottom: 24,
  },
  serviceCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8001C40",
  },
  serviceLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#E8001C",
    letterSpacing: 1,
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  servicePort: {
    fontSize: 13,
    color: "#888888",
    marginTop: 4,
  },
  endpointsCard: {
    backgroundColor: "#111111",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  endpointsLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#555555",
    letterSpacing: 1,
    marginBottom: 8,
  },
  endpoint: {
    fontSize: 12,
    color: "#888888",
    fontFamily: "monospace",
    marginBottom: 4,
  },
  errorDetails: {
    backgroundColor: "#111111",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  errorLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#555555",
    letterSpacing: 1,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 12,
    color: "#AAAAAA",
  },
  retryBtn: {
    backgroundColor: "#E8001C",
    borderRadius: 12,
    height: 48,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  hint: {
    fontSize: 11,
    color: "#555555",
    textAlign: "center",
    fontFamily: "monospace",
    lineHeight: 18,
  },
});
