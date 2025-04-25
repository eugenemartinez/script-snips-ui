# Script Snips - Frontend

This is the frontend for the Script Snips application, built with Vue 3, TypeScript, and Vite. It allows users to browse and view short, fictional script snippets.

## Features

*   View a list of script snippets.
*   View individual script snippet details.
*   Fetch random script snippets.

## Technologies Used

*   [Vue 3](https://vuejs.org/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Vite](https://vitejs.dev/)
*   [Axios](https://axios-http.com/) (or your fetch library) for API calls

## Project Setup

1.  **Navigate to the client directory:**
    ```bash
    cd client
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables:**
    *   Create a `.env` file in the `client` directory.
    *   Add the base URL for your backend API:
        ```env
        VITE_API_BASE_URL=http://localhost:5001/api
        ```
        *(Adjust the URL and port if your backend runs elsewhere)*

## Development Server

Run the following command to start the Vite development server:

```bash
npm run dev
# or
yarn dev
```

The application will typically be available at `http://localhost:5173` (Vite's default port, check the terminal output).

## Build for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The production-ready files will be located in the `dist` directory.
