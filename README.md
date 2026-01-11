# 💻 Splitwise Clone - Frontend (React)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

This is the client-side application for the Splitwise Clone. It provides a clean, intuitive interface for managing shared expenses, built with modern React patterns.

## 🚀 Live Application
[Visit the Live Web App](https://splitwise-frontend-ten.vercel.app)

---

## ✨ Key Features
- **Dynamic Group Management:** View and switch between different groups seamlessly.
- **Smart Member Parsing:** Intelligent handling of comma-separated inputs when adding friends.
- **Persistent Sessions:** Leverages `localStorage` and React hooks to maintain user login state.
- **Environment-Aware API:** Automatically switches between `localhost:5000` and the production API based on the hosting environment.

---

## 🛠️ Technical Highlights
- **Hooks:** Extensively uses `useState`, `useEffect`, and `useCallback` for optimized rendering.
- **API Client:** Axios used for handling asynchronous requests with custom header authorization.
- **State Flow:** Centralized state in `App.js` to manage authentication and shared group data.



---

## 📁 Folder Structure
```text
src/
├── components/
│   ├── Groups.js     # Sidebar/List of active groups
│   └── Expenses.js   # Main feed for adding/viewing bills
├── App.js            # Main logic, Auth, and Routing
└── index.js          # React entry point
