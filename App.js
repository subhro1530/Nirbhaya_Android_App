// App.js

import React from "react";
import RootNavigator from "./navigation";
import { ContactsProvider } from "./ContactsContext";

export default function App() {
  return (
    <ContactsProvider>
      <RootNavigator />
    </ContactsProvider>
  );
}
