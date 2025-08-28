# Admin Manual

This manual provides instructions for administrators on managing the PizzaVoter application.

## Accessing the Admin Panel

*   To access the admin panel, navigate to the `/admin` route of the application (e.g., `http://localhost:3000/admin`).
*   **Important:** Only users with administrative privileges can access this page. If you are not an admin, you will see a message indicating you do not have permission.

## Managing Pizzas

### Adding a New Pizza

1.  **Fill in the details:**
    *   **Pizza Neve (Pizza Name):** Enter the name of the new pizza.
    *   **Emoji:** Enter an emoji that represents the pizza. You can also click the "Válassz Emojit" (Choose Emoji) button to open an emoji picker modal and select one.
    *   **Color:** Select a background color for the pizza option from the dropdown list. This color will be used in the voting interface and results.
2.  **Add Pizza:** Click the "Pizza Hozzáadása" (Add Pizza) button to save the new pizza to the database. It will immediately appear in the list of current pizzas and on the main voting page.

### Deleting an Existing Pizza

1.  **Locate the pizza:** In the "Jelenlegi Pizzák" (Current Pizzas) section, find the pizza you wish to delete.
2.  **Delete:** Click the "Törlés" (Delete) button next to the pizza's entry. The pizza will be removed from the database and the voting interface.

## Resetting Voting

*   On the main voting page (accessible to admins), there is a "Nullázás 🔄" (Reset) button.
*   Clicking this button will reset all vote counts for all pizzas to zero and clear all user votes, allowing for a new voting round.
*   This action can only be performed by an administrator.

---

# Admin Kézikönyv

Ez a kézikönyv útmutatót nyújt az adminisztrátoroknak a PizzaVoter alkalmazás kezeléséhez.

## Az Admin Panel elérése

*   Az admin panel eléréséhez navigáljon az alkalmazás `/admin` útvonalára (pl. `http://localhost:3000/admin`).
*   **Fontos:** Csak adminisztrátori jogosultságokkal rendelkező felhasználók férhetnek hozzá ehhez az oldalhoz. Ha nem Ön az admin, egy üzenet jelenik meg, amely jelzi, hogy nincs engedélye.

## Pizzák kezelése

### Új pizza hozzáadása

1.  **Töltse ki az adatokat:**
    *   **Pizza Neve:** Adja meg az új pizza nevét.
    *   **Emoji:** Adjon meg egy emojit, amely a pizzát reprezentálja. Kattintson a "Válassz Emojit" gombra az emoji választó megnyitásához és egy emoji kiválasztásához.
    *   **Szín:** Válasszon háttérszínt a pizza opcióhoz a legördülő listából. Ez a szín a szavazási felületen és az eredményekben is használni fog.
2.  **Pizza Hozzáadása:** Kattintson a "Pizza Hozzáadása" gombra az új pizza adatbázisba mentéséhez. Azonnal megjelenik az aktuális pizzák listájában és a fő szavazási oldalon.

### Meglévő pizza törlése

1.  **Keresse meg a pizzát:** A "Jelenlegi Pizzák" részben keresse meg a törölni kívánt pizzát.
2.  **Törlés:** Kattintson a "Törlés" gombra a pizza bejegyzése mellett. A pizza eltávolításra kerül az adatbázisból és a szavazási felületről.

## Szavazás visszaállítása

*   A fő szavazási oldalon (amely az adminok számára elérhető) található egy "Nullázás 🔄" gomb.
*   Erre a gombra kattintva az összes pizza szavazatszáma nullázódik, és az összes felhasználói szavazat törlődik, lehetővé téve egy új szavazási fordulót.
*   Ezt a műveletet csak adminisztrátor hajthatja végre.
