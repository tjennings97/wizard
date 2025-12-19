// const SUITS = ["♠", "♣", "♥", "♦"]
const SUITS = ["spades", "clubs", "hearts", "diamonds"]
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

function freshDeck() {
    return SUITS.flatMap(suit => {
        return VALUES.map(value => {
            return new Card(suit, value)
        })
    })
}

export default class Deck {
    constructor(wizard = null) {
        let cards = freshDeck()
        if (wizard === "wizard") {
            for (let i = 0; i < 4; i++) {
                cards.push(new Card("W", "W"));
                cards.push(new Card("E", "E"));
            }
        }
        this.cards = cards
    }

    get numberOfCards() {
        return this.cards.length
    }

    shuffle() {
        for (let i = this.numberOfCards - 1; i > 0; i--) {
            const newIndex = Math.floor(Math.random() * (i + 1))
            const oldValue = this.cards[newIndex]
            this.cards[newIndex] = this.cards[i]
            this.cards[i] = oldValue
        }

    }

    dealCard() {
        if (this.cards.length > 0) {
            return this.cards.pop();
        } else {
            throw new Error("No cards remaining!");
        }
    }

    returnCard(card) {
        this.cards.push(card);
    }

}

export class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
        this.playable = null;
    }
    
    rankValue() {
        const rankOrder = {
            "2": 2, "3": 3, "4": 4, "5": 5,
            "6": 6, "7": 7, "8": 8, "9": 9,
            "10": 10, "J": 11, "Q": 12, "K": 13, "A": 14
        }
        return rankOrder[this.value]
    }

}