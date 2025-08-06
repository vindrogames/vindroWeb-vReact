

function Game42() {

    return (
        <main class="game-42">
            <div id="end-game-42">
                <h4>42</h4>
                <h4>The meaning of life, the universe and everything</h4>
                <div id="end-game-42-buttons">
                    <a id="end-game-42-play-again" href="javascript:;" class="btn btn-black">Play again</a>
                    <a id="end-game-42-more-games" href="../../games.html" class="btn btn-black">More games</a>
                </div>
            </div>
            <section id="game-42-buttons" class="">
                <button id="1" class="pos-42 open">1.</button>
                <button id="2" class="pos-42 open">2.</button>
                <button id="3" class="pos-42 open">3.</button>
                <button id="4" class="pos-42 open">4.</button>
                <button id="5" class="pos-42 open">5.</button>
                <button id="6" class="pos-42 open">6.</button>
                <button id="7" class="pos-42 open">7.</button>
                <button id="8" class="pos-42 open">8.</button>
                <button id="9" class="pos-42 open">9.</button>
                <button id="10" class="pos-42 open">10.</button>
                <button id="11" class="pos-42 open">11.</button>
                <button id="12" class="pos-42 open">12.</button>
                <button id="13" class="pos-42 open">13.</button>
                <button id="14" class="pos-42 open">14.</button>
            </section>

            <section id="display-42">
                <div class="instructions-42">
                    <h1 class="title-42"><span class="inline-teal inline-bold">42</span> the game</h1>
                    <h2 class="sub-title-42">Reach the meaning of life, the universe and of everything</h2>
                    <p>Inspired by the boardgame <a href="https://boardgamegeek.com/boardgame/244992/mind" target="_blank">The Mind</a> you will have to place 14 random numbers from 1-42 in ascending order in the list on the left. Position 1 is for the lowest and number and position 14 is the highest. Each number will appear one after another and you decide at which position to place it. You lose if you cannot place a number in ascending order. <a class="inline-yellow" href="https://youtu.be/ZwyAUVebZM0" target="_blank">Watch how to play</a></p>
                </div>
                <div class="showcase-42">
                    <div class="game-42-play-container">
                        <button id="game-42-play-button">Start</button>
                    </div>
                    <div class="game-42-results">
                        <div class="game-42-results-container">
                            <h3 class="current-game-42-header">Points:</h3>
                            <h3 class="current-game-42-points"></h3>
                        </div>
                        <div class="game-42-results-container">
                            <h3 class="prev-game-42-header">Previous:</h3>
                            <h3 class="prev-game-42-points"></h3>
                        </div>
                        <div class="game-42-results-container">
                            <h3 class="best-game-42-header">Best:</h3>
                            <h3 class="best-game-42-points"></h3>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Game42;