import Deck, { Card } from './deck.js';
import { createInterface } from 'node:readline';
import Player from './player.js';

export default class Wizard {
    constructor(names) {
        this.deck = new Deck("wizard");
        this.players = names.map(name => (new Player(name)));
        this.player_count = this.players.length
        this.max_rounds = this.deck.numberOfCards / this.player_count;
        this.round = 0;
        this.trick = 0;
        this.lead_suit = null;
        this.dealer_id = this.round % this.player_count;
        this.first_player = ((this.round % this.player_count) + 1) % this.player_count;
        this.winning_card = null;
        this.winning_player = null;
        this.trump_suit = null;
    }

    nextTrick() {
        // set values for next trick
        this.first_player = this.winning_player;
        this.lead_suit = null;
        this.winning_card = null;
        this.winning_player = null;

        for (const player of this.players) {
            player.resetPlayableCards();
        }
        this.trick++;
    }

    nextRound() {

        // set values for next round
        this.round++;
        this.lead_suit = null;
        this.dealer_id = this.round % this.player_count;
        this.first_player = ((this.round % this.player_count) + 1) % this.player_count;
        this.winning_card = null;
        this.winning_player = null;
        this.trump_suit = null;
        this.trick = 0;

        for (const player of this.players) {
            player.newRound()
        }
    }

    dealRound() {
        this.deck.shuffle(); this.deck.shuffle(); this.deck.shuffle();
        let count = 0
        while (count <= this.round) {
            for (let i = 0; i < this.player_count; i++) {
                // Circular index: start at first_player_index, wrap around
                let player_index = (this.first_player + i) % this.player_count;
                let dealtCard = this.deck.dealCard();
                this.players[player_index].cards.push(dealtCard);
            }
            count += 1;
        }
    }

    async getTrump() {
        if (this.deck.numberOfCards > 0) {
            let trump_card = this.deck.dealCard();
            this.deck.returnCard(trump_card);
            console.log(`Flipped card: ${trump_card.value} of ${trump_card.suit}`)
            if (trump_card.suit === "E") {
                console.log("There is no trump this round.");
            } else if (trump_card.suit === "W") {
                console.log(`${this.players[this.dealer_id].name}, here are your cards:`);
                console.log(this.players[this.dealer_id].cards);
                let picked_suit = await ask(`${this.players[this.dealer_id].name}, pick a suit: `);
                this.trump_suit = picked_suit;
                console.log(`The trump for the round is ${this.trump_suit}`)
            } else {
                this.trump_suit = trump_card.suit;
                console.log(`The trump for the round is ${this.trump_suit}`)
            }
        } else {
            console.log("There is no trump this round.");
        }

    }

    async placeBets() {
        for (const i in this.players) {
            console.log(`${this.players[(this.first_player + i) % this.player_count].name}, here are your cards:`);
            console.log(this.players[(this.first_player + i) % this.player_count].cards);
            let bet = await ask(`${this.players[(this.first_player + i) % this.player_count].name}, enter bet: `);
            this.players[(this.first_player + i) % this.player_count].currentBet = bet;
        }
    }

    evaluatePlayedCard(played_card, player_index) {
        let win = false;
        if (this.lead_suit === null) { // first card always becomes the winning card
            this.lead_suit = played_card.suit;
            win = true;
        } else if (this.winning_card.suit === "W") { // do nothing, wizard already winning
        } else if (played_card.suit === "W") { // first wizard becomes the winning card
            win = true;
        } else if (this.winning_card.suit === "E") {
            if (played_card.suit !== "E") { // first non-jester after all jesters becomes the winning card
                this.lead_suit = played_card.suit;
                win = true;
            } else { // do nothing, current winning card (jester) remains
            }
        } else if (played_card.suit === this.winning_card.suit) {
            if (played_card.rankValue() > this.winning_card.rankValue()) {
                win = true;
            } else { // do nothing, current winning card remains
            }
        } else if (played_card.suit === this.trump_suit) {
            win = true;
        } else { // do nothing, current winning card remains
        }

        if (win) {
            this.winning_card = played_card;
            this.winning_player = player_index;
        }

        console.log(`Winning card: ${this.winning_card.value}, of ${this.winning_card.suit}, played by ${this.players[this.winning_player].name}`);
    }

    async playTrick() {
        for (let i = 0; i < this.player_count; i++) {
            // Circular index: start at first_player_index, wrap around
            let player_index = (this.first_player + i) % this.player_count;

            // get playable status for each card in hand
            this.players[player_index].getPlayable(this.lead_suit);

            console.log("Here are your playable cards")
            for (const i in this.players[player_index].cards) {
                if (this.players[player_index].cards[i].playable === true) {
                    console.log(`[${i}] ${this.players[player_index].cards[i].value} of ${this.players[player_index].cards[i].suit}`)
                } else {
                    console.log(`[x] ${this.players[player_index].cards[i].value} of ${this.players[player_index].cards[i].suit}`)
                }
            }

            let card = await ask(`${this.players[player_index].name}, enter the index of the card you wish to play: `);
            if (card.toLowerCase() === 'exit') {
                rl.close();
                console.log('Exiting program.');
            } else {
                console.log(`\t>>> You entered [${card}] ${this.players[player_index].cards[card].value} of ${this.players[player_index].cards[card].suit}`);
                let played_card = new Card(this.players[player_index].cards[card].suit, this.players[player_index].cards[card].value)
                played_card.playable = null;
                this.players[player_index].removeCard(played_card, this.deck)

                // game_details = evaluatePlayedCard(played_card, game_details, player_index);
                this.evaluatePlayedCard(played_card, player_index)

            }
        }
    }

    calculateScore() {
        // calculate scores for previous round
        for (const player of this.players) {
            player.scoreRound();
        }
    }

    getWinner() {
        let winner = [];
        for (const player of this.players) {
            if (winner.length == 0) {
                winner.push(player);
            } else if (winner[0].totalScore < player.totalScore) {
                winner = [player]
            } else if (winner[0].totalScore == player.totalScore) {
                winner.push(player)
            } else { // do nothing
            }
        }

        if (winner.length == 1) {
            console.log(`The winner is ${winner[0].name} with ${winner[0].totalScore} points`)
        } else {
            console.log(`The winners are ${winner.map(w => w.name).join(", ")} with ${winner[0].totalScore} points each`)
        }
    }
}

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

let names = [
    "T",
    "C",
    "CL"
]

let wizard = new Wizard(names);

do {
    console.log("=======================")
    console.log(`round: ${wizard.round + 1}`);
    console.log(`dealer: ${wizard.players[wizard.dealer_id].name}`);
    console.log("=======================")

    wizard.dealRound();
    await wizard.getTrump();
    await wizard.placeBets();

    const tricksThisRound = wizard.round + 1;
    // play round
    do {
        console.log("---------------------")
        console.log(`trick: ${wizard.trick + 1}`);
        console.log("---------------------")

        await wizard.playTrick();
        wizard.players[wizard.winning_player].winTrick();

        wizard.nextTrick();

    } while (wizard.trick < tricksThisRound);

    wizard.calculateScore();
    wizard.nextRound();

} while (wizard.round < wizard.max_rounds);

// determine winner
wizard.getWinner()

rl.close();

function ask(question) {
    return new Promise(resolve => {
        rl.question(question, answer => resolve(answer));
    });
}
