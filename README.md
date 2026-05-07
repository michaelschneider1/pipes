**Pipes**
<img width="498" height="685" alt="Screenshot 2026-05-06 at 9 35 41 PM" src="https://github.com/user-attachments/assets/f3c13149-f6e9-42ac-85be-64e4a646ff9f" />

A daily puzzle inspired by games such as the NYT games (like Wordle, Connections, Strands, etc...) and the LinkedIn games (Zip, Patches, Queens, Tango, etc...) built with HTML, CSS, and JavaScript.
A new puzzle is available daily at midnight.

🔗 Live Site: https://michaelschneider1.github.io/pipes/

**About**
Pipes is a grid-based puzzle where players rotate tiles to connect a flow from source to end with no leaks. Each day features a new handcrafted puzzle that resets at midnight.

**Features**
- Daily puzzle system tied to the calendar date
- Fully solvable puzzles generated with a Hamiltonian path algorithm
- Flood fill algorithm to trace live pipe connections
- Canvas-based rendering for smooth pipe drawing
- Clean responsive UI built without any frameworks
- Local tester for previewing any puzzle by date
- 
**Built With**
1. HTML
2. CSS
3. JavaScript
4. HTML5 Canvas API

**How To Run Locally**
1. Clone the repository
2. Open index.html with Live Server in VS Code
3. (Optional) Open tester.html with Liver Server in VS Code to practice future date's games

**Generate New Puzzles**
New puzzle batches can be generated using the following:
node generate-puzzles.js
- Update the `START` variable in the script to generate the next batch (31, 61, etc.)
After generating a new batch, update the `totalPuzzles` variable in two places:
- `js/game.js` inside the `loadPuzzle` function
- `test.html` inside the `loadTestPuzzle` function
Change the value to match the new total number of puzzles you have.
For example, after generating puzzles 31-60, change `totalPuzzles` to `60`.
