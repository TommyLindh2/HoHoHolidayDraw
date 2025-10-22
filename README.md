# 🎄 HoHoHolidayDraw

A festive holiday gift exchange application that helps organize Secret Santa draws and gift exchanges for groups of people. The application features an animated drawing interface with customizable settings and group management capabilities.

## 🌟 Features

-   **Group Management**: Organize people into different groups for separate gift exchanges
-   **Animated Drawing**: Interactive shuffle animation for revealing gift assignments
-   **Person Profiles**: Support for profile pictures and person details
-   **Customizable Animation**: Adjustable animation speed, count, and layout
-   **Mobile-Friendly**: Responsive design built with Ionic components
-   **RESTful API**: Clean backend API for data management

## 🏗️ Architecture

This project consists of two main components:

-   **Frontend**: Ionic + Stencil.js web application
-   **Backend**: Node.js + Express API server

### Frontend Tech Stack

-   [Stencil.js](https://stenciljs.com/) - Compiler for web components
-   [Ionic Framework](https://ionicframework.com/) - UI components and theming
-   TypeScript - Type-safe JavaScript
-   SASS - CSS preprocessing

### Backend Tech Stack

-   [Node.js](https://nodejs.org/) - JavaScript runtime
-   [Express.js](https://expressjs.com/) - Web framework
-   TypeScript - Type-safe JavaScript
-   In-memory storage (with plans for database integration)

## 🚀 Getting Started

### Prerequisites

-   Node.js (v16 or higher)
-   npm or yarn package manager

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/TommyLindh2/HoHoHolidayDraw.git
    cd HoHoHolidayDraw
    ```

2. **Install backend dependencies**

    ```bash
    cd backend
    npm install
    ```

3. **Install frontend dependencies**
    ```bash
    cd ../frontend
    npm install
    ```

### Development

#### Backend Development Server

```bash
cd backend
npm start
```

The API server will start on `http://localhost:3000`

#### Frontend Development Server

```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:3333` with hot reload enabled.

### Building for Production

#### Backend Build

```bash
cd backend
npm run build
```

#### Frontend Build

```bash
cd frontend
npm run build
```

The built files will be available in the `www` directory.

## 📡 API Endpoints

### Persons

-   `GET /api/person` - Get all persons
-   `GET /api/person/:id` - Get person by ID

### Groups

-   `GET /api/group` - Get all groups
-   `GET /api/group/:id` - Get group by ID
-   `GET /api/group/:id/person` - Get all persons in a group

## 🎨 Usage

1. **Access the Application**: Navigate to the frontend URL after starting both servers
2. **View Groups**: Browse available groups from the group list
3. **Select a Group**: Choose a group to start a gift exchange draw
4. **Customize Settings**: Adjust animation speed, count, and layout columns
5. **Start the Draw**: Click "Shuffle" to begin the animated gift assignment process
6. **View Results**: Watch as the animation reveals who gives gifts to whom

## 🗂️ Project Structure

```
HoHoHolidayDraw/
├── README.md
├── backend/                 # Node.js API server
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── app.ts          # Express application setup
│       ├── models/         # Data models (Person, Group)
│       ├── storage/        # Data storage layer
│       └── errors/         # Error handling
└── frontend/               # Ionic + Stencil application
    ├── package.json
    ├── stencil.config.ts
    ├── scripts/
    │   └── deploy.sh       # Deployment script
    └── src/
        ├── components/     # Stencil components
        ├── models/         # TypeScript interfaces
        ├── services/       # API client services
        └── global/         # Global styles and scripts
```

## 🔧 Configuration

### Backend Configuration

The backend server can be configured using environment variables:

-   `PORT` - Server port (default: 3000)

### Frontend Configuration

Frontend configuration is handled in `src/config.ts` and `stencil.config.ts`.

## 🚢 Deployment

### Frontend Deployment

The project includes a deployment script for Surge.sh:

```bash
cd frontend
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

For other hosting platforms, build the project and serve the `www` directory.

### Backend Deployment

Deploy the backend to any Node.js hosting platform. Ensure to:

1. Run `npm run build` to compile TypeScript
2. Set the appropriate `PORT` environment variable
3. Install production dependencies with `npm install --production`

## 🎯 Roadmap

### Frontend Improvements

-   [ ] Add/update/delete functionality for groups and persons
-   [ ] Prevent endless loops when shuffling
-   [ ] Enhanced mobile responsiveness
-   [ ] Offline support with service workers

### Backend Improvements

-   [ ] Database integration (PostgreSQL/MongoDB)
-   [ ] DELETE endpoints for data management
-   [ ] User authentication and authorization
-   [ ] Data validation and sanitization
-   [ ] API rate limiting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](frontend/LICENSE) file for details.

## 🎄 Happy Holidays!

Built with ❤️ for organizing memorable holiday gift exchanges.
