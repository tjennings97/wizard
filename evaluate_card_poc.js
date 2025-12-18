const readline = require('node:readline')

let winning_card = undefined;
let lead_suit = undefined;
let trump_suit = undefined;

function rankValue(rank) {
    const rankOrder = {
        "2": 2, "3": 3, "4": 4, "5": 5,
        "6": 6, "7": 7, "8": 8, "9": 9,
        "10": 10, "J": 11, "Q": 12, "K": 13, "A": 14
    }
    return rankOrder[rank]
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let continueLoop = true;

evaluatePlayedCard = (played_card) => {
    if (lead_suit === undefined) {
        lead_suit = played_card.suit;
        winning_card = played_card;
    } else if (winning_card.suit === "wizard"){
        // do nothing, wizard already winning
        console.log("wizard already takes the trick")
    } else if (played_card.suit === "wizard") {
        console.log("this wizard takes the trick")
        winning_card = played_card;
    } else if (winning_card.suit === "jester") {
        if (played_card.suit !== "jester") {
            console.log("this card beats the jester")
            lead_suit = played_card.suit;
            winning_card = played_card;
        } else {
            console.log("jester already takes the trick")
            // do nothing, current winning card (jester) remains
        }
    } else if (played_card.suit === winning_card.suit) {
        console.log(`played card rank: ${rankValue(played_card.rank)}, winning card rank: ${rankValue(winning_card.rank)}`)
        if (rankValue(played_card.rank) > rankValue(winning_card.rank)) {
            console.log("same suit but this is higher")
            winning_card = played_card;
        } else {
            console.log("same suit but this is lower")
            // do nothing, current winning card remains
        }
    } else if (played_card.suit === trump_suit) {
        console.log("the trump wins")
        winning_card = played_card;
    } else {
        // do nothing, current winning card remains
        console.log("else - lose")
    }
}

function askQuestion() {
    rl.question('Play card (type "exit" to quit): ', (card) => {
        if (card.toLowerCase() === 'exit') {
            continueLoop = false;
            rl.close();
            console.log('Exiting program.');
        } else {
            console.log(`You entered ${card}`);
            const [rank, suit, player] = card.split(' ');
            const played_card = { rank: rank, suit: suit, player: player};
            evaluatePlayedCard(played_card);
            console.log(`Winning card: ${winning_card.rank}, of ${winning_card.suit}, played by ${winning_card.player}`);
            if (continueLoop) {
                askQuestion();
            }
        }
    });
}

// Ask a question and handle the response
rl.question('trump suit: ', (trump) => {
    console.log(`Trump suid set to ${trump}`);
    trump_suit = trump;
    askQuestion();
});

