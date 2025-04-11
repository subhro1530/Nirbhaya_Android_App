# 🛡️ Nirbhaya – Women’s Safety App


## 📲 Features

🚨 Emergency SOS  
- One-tap SOS button to instantly send alerts  
- Sends a Google Maps link with your live location  
- Choose specific trusted contacts to notify  
- Includes personal info (Name, Blood Group, Phone, DOB) in the alert  
- WhatsApp integration for direct sharing  

📇 Trusted Contacts  
- Add, edit, or delete emergency contacts  
- Fully functional CRUD interface with smooth UI  
- Stores contact data in local storage  

🏠 Personal Dashboard  
- Displays user info like Email, Blood Group, Phone, DOB  
- User can edit profile info directly on the Home screen  
- Data is stored in local storage  

📰 Articles for Awareness  
- Fetches real-time news related to women’s safety, laws, and tragedies  
- Uses free public API with filters  
- Images and headlines displayed in a card view  

👤 Authentication  
- Signup and Login screens  
- Sign up collects all info shown on the dashboard  
- User ID derived from email prefix  
- Profile image shown in top navigation  

🌐 Smooth Navigation  
- Custom bottom tab navigation with:  
  🏠 Home  
  📇 Contacts  
  📰 Articles  
  👤 Profile  
- Middle button is a prominent SOS shortcut  

---

## 🧑‍💻 Tech Stack

- React Native (Expo)  
- React Navigation  
- AsyncStorage (for local data persistence)  
- Expo Location (live GPS tracking)  
- Linking API (WhatsApp intent)  
- News API for live articles  
- @env for secure API key management  

---

## 🗂️ Folder Structure

/screens  
├── HomeScreen.js  
├── ContactsScreen.js  
├── ArticlesScreen.js  
├── ProfileScreen.js  
├── LoginScreen.js  
└── SignupScreen.js  

/components  
└── BottomTabNavigator.js  

/context  
└── ContactContext.js  

/env  
└── .env (Add your News API Key here)  

---

## 🔐 Setup Instructions

1. Clone the Repository:
```bash
git clone https://github.com/yourusername/nirbhaya-safety-app.git
cd nirbhaya-safety-app
```

2. Install Dependencies:
```bash
npm install
```

3. Add Environment Variables:  
Create a `.env` file in the root:
```
NEWS_API_KEY=pub_79197297a3399a45d6a710681b65584db6084
```

4. Run the App:
```bash
npm start
```
or
```bash
expo start
```

> Make sure WhatsApp is installed on your device for SOS messaging to work.

---

### To build the apk
---
> npx eas build --platform android --profndroid --profile apndroid --profile apk 
---

## 📸 Screenshots

[You can include screenshots for Home, Contacts, Articles views here in your repo or app store listing]

---

## 🙌 Credits

- Designed & Developed by [Your Name]  
- React Native  
- NewsData.io API  
- Expo  

---

## 📃 License

This project is licensed under the MIT License.

---

## 💡 Future Enhancements

- Cloud Firestore integration for user data  
- Background SOS with shake detection  
- AI-based article summarization  
- Native call/SMS fallback option  

> “Empower one woman, and she will empower the world.”

---