# MovieMatch

## Description

**MovieMatch** is the perfect solution for those moments when you don't know what movie to watch. Whether with friends, family, or your partner, this app helps you quickly and interactively find the ideal movie. With a friendly and dynamic interface, you can explore options and decide in seconds what to watch.

## Implemented Technologies

- **Next.js**: React framework for modern web applications.
- **Tailwind CSS**: CSS framework for efficient and responsive design.
- **TypeScript**: Superset of JavaScript that adds static typing.
- **WebSockets**: For real-time communication with the backend, which is connected to APIs that provide movie listings and information.

## How to Access and Use the Application

### You can access the functional application at the following link:
🔗 [MovieMatch - Functional App](https://main.d2bnyg9ki64z5a.amplifyapp.com/)

### You can also try it locally by following these steps:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/SebasBarrientos/MovieMatch.git
   cd MovieMatch
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start the development server**:

   ```bash
   npm run dev
   ```

4. **Access the application**:

   Open your browser and go to `http://localhost:3000` to interact with the app in development mode.

## Instructions

1. **Create or Join a Room**: Click "Join room" to create a new one or enter an existing room by completing the "Join room" field and click the button to join.
2. **Select up to 3 Categories**: Click on different options to select them and press submit. If there is a match, everyone will proceed to the movie match page!
3. **Vote for a Movie**: Use the app’s dynamic interface to make a quick decision without wasting time searching. Clicking "Next" will move all participants to the next option.
4. **MovieMatch**: If everyone chooses the same movie, a pop-up will appear showing where to watch it, access to IMDb, or an option to continue searching.

## Backend WebSocket

MovieMatch uses a WebSocket-based backend to provide real-time communication. The source code for this backend is available at the following repository:

🔗 [MovieDateApp - Backend WebSocket](https://github.com/SebasBarrientos/MovieDateApp)

This backend manages real-time connections, allowing users to interact without delays. It is developed with **Node.js** and specialized WebSocket libraries, ensuring efficient and scalable communication.
