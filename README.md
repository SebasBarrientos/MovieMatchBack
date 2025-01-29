# MovieDateApp - WebSocket Backend

## Description

**MovieDateApp** is the real-time backend that powers **MovieMatch**, enabling seamless and interactive movie selection among users. Using WebSockets, it ensures instant communication between participants, allowing them to vote on movies and synchronize their choices effortlessly.

## Technologies Used

- **Node.js**: Server-side runtime environment.
- **Express.js**: Web framework for handling API requests.
- **WebSockets (Socket.io)**: Enables real-time, bidirectional communication.
- **Dotenv**: Manages environment variables securely.

## How to Install and Run Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/SebasBarrientos/MovieDateApp.git
   cd MovieDateApp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Create a `.env` file in the root directory.
   - Add the necessary configurations (e.g., database URL, API keys, and WebSocket settings).

4. **Start the server**:
   ```bash
   npm start
   ```

5. **Access the WebSocket server**:
   The backend will be running on `http://localhost:3000` (or the specified port in the `.env` file).

## WebSocket Endpoints

- **Connection**: Clients can establish a WebSocket connection to join rooms.
- **Room Management**: Create and join rooms in real time.
- **Movie Voting**: Users can vote on movies, and results are updated instantly.
- **Match Found**: When a consensus is reached, the app notifies all participants.

## Deployment

This backend is deployed in Render

## Related Project

This WebSocket backend is built for use with **MovieMatch**:
🔗 [MovieMatch - Interactive Movie Selection App](https://github.com/SebasBarrientos/MovieMatch)

