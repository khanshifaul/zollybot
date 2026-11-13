import { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { useMobileSession } from "@/features/auth/context/mobile-session-context";
import type { MobileSession } from "@/features/auth/api/mobile-auth";

export default function ConnectScreen() {
  const { connect } = useMobileSession();
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");

  function handleConnect() {
    if (!url.trim()) return;
    const session: MobileSession = {
      apiUrl: url.trim(),
      sessionToken: token.trim() || "local",
      user: { id: "local", email: "local@zollybot.local", name: "Local User", avatarUrl: null, analyticsEnabled: false, chatColor: null },
    };
    connect(session);
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <Text>Connect to a ZollyBot host on your private network</Text>
      <TextInput placeholder="Host URL (e.g. http://192.168.1.10:3100)" value={url} onChangeText={setUrl} autoCapitalize="none" />
      <TextInput placeholder="Machine token (optional)" value={token} onChangeText={setToken} autoCapitalize="none" secureTextEntry />
      <Button title="Connect" onPress={handleConnect} />
    </View>
  );
}