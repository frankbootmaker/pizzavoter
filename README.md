# PizzaVoter App

A web application designed to facilitate voting on pizza preferences. This project leverages modern web technologies to provide a smooth and interactive user experience for both voters and administrators.

## Features

*   **Interactive Voting:** Users can cast their votes for various pizza options.
*   **Emoji Picker:** Enhance voting with expressive emoji reactions (likely for options or votes).
*   **Admin Panel:** A dedicated interface for managing pizza options, viewing results, or other administrative tasks.

## Technologies Used

*   **Next.js:** A React framework for production-grade applications, enabling server-side rendering and static site generation.
*   **React:** A JavaScript library for building user interfaces.
*   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript, enhancing code quality and maintainability.
*   **Tailwind CSS:** A utility-first CSS framework for rapidly building custom designs.

## Getting Started

Follow these instructions to set up and run the project locally on your machine.

### Prerequisites

*   Node.js (LTS version recommended)
*   npm or Yarn

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/pizzavoter-app.git
    cd pizzavoter-app
    ```

    *(Note: Replace `https://github.com/your-username/pizzavoter-app.git` with the actual repository URL once it's hosted.)*

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

## Running the Application

### Development Mode

To run the application in development mode with hot-reloading:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

To build the application for production:

```bash
npm run build
# or
yarn build
```

This will create an optimized build in the `.next` directory.

### Starting the Production Server

To start the production server after building:

```bash
npm run start
# or
yarn start
```

## Tailwind CSS (compiled)

The app now uses compiled Tailwind instead of the CDN script.

- Root layout imports styles: `src/app/layout.tsx` → `import './globals.css'`.
- CDN script removed from layout to prevent duplicate styles and improve performance.
- Tailwind/PostCSS config is already set up (`tailwind.config.ts`, `postcss.config.js`).

If styles don’t load in development, restart the dev server: `npm run dev`.

## Chart Colors

The pie chart now supports all admin-selectable Tailwind colors (500 shade):

- Supported: `bg-red-500`, `bg-green-500`, `bg-yellow-500`, `bg-emerald-500`, `bg-orange-500`, `bg-blue-500`, `bg-indigo-500`, `bg-purple-500`, `bg-pink-500`.
- Add more mappings in `src/app/page.tsx` (`getHexColor`) if you introduce additional colors.

## Admin Management API (server-side)

This app exposes serverless routes to manage admins using the Firebase Admin SDK. Only existing admins can add/remove admins.

Routes (App Router):
- `GET /api/admins` – List admins (admin only)
- `POST /api/admins` – Add admin by `{ email }` or `{ uid }` (admin only)
- `DELETE /api/admins/:uid` – Remove admin, with guard against deleting the last admin

Requirements:
- Install dependency: `npm install firebase-admin`
- Set server-only environment variables (no `NEXT_PUBLIC_` prefix):
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY` (use a JSON private key; if providing via `.env`, replace line breaks with `\n`)

Example `.env.local` (server keys should be kept secret and not committed):
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Bootstrap the first admin:
- Manually create `admins/{yourUid}` in Firestore via the Firebase Console, or
- Temporarily create the document via a script. The API requires an existing admin to authorize further changes.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).

---

# PizzaVoter App (Magyarul)

Egy webes alkalmazás, amely a pizza preferenciákról szóló szavazást segíti elő. Ez a projekt modern webes technológiákat használ a zökkenőmentes és interaktív felhasználói élmény biztosítására mind a szavazók, mind az adminisztrátorok számára.

## Funkciók

*   **Interaktív Szavazás:** A felhasználók szavazhatnak különböző pizza opciókra.
*   **Emoji Választó:** Fejlessze a szavazást kifejező emoji reakciókkal (valószínűleg opciókhoz vagy szavazatokhoz).
*   **Admin Panel:** Egy dedikált felület a pizza opciók kezelésére, az eredmények megtekintésére vagy egyéb adminisztratív feladatokra.

## Használt technológiák

*   **Next.js:** Egy React keretrendszer éles alkalmazásokhoz, amely lehetővé teszi a szerveroldali renderelést és a statikus oldalgenerálást.
*   **React:** Egy JavaScript könyvtár felhasználói felületek építéséhez.
*   **TypeScript:** A JavaScript egy tipizált szuperhalmaza, amely egyszerű JavaScript-re fordítódik, javítva a kód minőségét és karbantarthatóságát.
*   **Tailwind CSS:** Egy segédprogram-központú CSS keretrendszer az egyedi tervek gyors elkészítéséhez.

## Első lépések

Kövesse ezeket az utasításokat a projekt helyi beállításához és futtatásához.

### Előfeltételek

*   Node.js (LTS verzió ajánlott)
*   npm vagy Yarn

### Telepítés

1.  **Klónozza a tárolót:**

    ```bash
    git clone https://github.com/your-username/pizzavoter-app.git
    cd pizzavoter-app
    ```

    *(Megjegyzés: Cserélje le a `https://github.com/your-username/pizzavoter-app.git` címet a tényleges tároló URL-jére, amint az üzembe helyezésre kerül.)*

2.  **Telepítse a függőségeket:**

    ```bash
    npm install
    # vagy
    yarn install
    ```

## Az alkalmazás futtatása

### Fejlesztői mód

Az alkalmazás futtatásához fejlesztői módban, hot-reloadinggal: 

```bash
npm run dev
# vagy
yarn dev
```

Nyissa meg a [http://localhost:3000](http://localhost:3000) címet a böngészőjében az alkalmazás megtekintéséhez.

### Éles környezetbe való építés

Az alkalmazás éles környezetbe való építéséhez:

```bash
npm run build
# vagy
yarn build
```

Ez egy optimalizált buildet hoz létre a `.next` könyvtárban.

### Az éles szerver indítása

Az éles szerver indításához az építés után:

```bash
npm run start
# vagy
yarn start
```

## Közreműködés

A hozzájárulásokat szívesen fogadjuk! Kérjük, küldjön be egy pull requestet vagy nyisson egy issue-t.

## Licenc

Ez a projekt nyílt forráskódú, és az [MIT licenc](https://opensource.org/licenses/MIT) alatt érhető el.
