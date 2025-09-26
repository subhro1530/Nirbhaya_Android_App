// App.js

import React from "react";
import RootNavigator from "./navigation";
import { ContactsProvider } from "./ContactsContext";
import { AuthProvider } from "./contexts/AuthContext"; // NEW

export default function App() {
  return (
    <AuthProvider>
      <ContactsProvider>
        <RootNavigator />
      </ContactsProvider>
    </AuthProvider>
  );
}
