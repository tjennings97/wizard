import Deck, { Card } from './deck.js';

export default class Player {
    constructor(name) {
        this.name = name;
        this.cards = [];
        this.currentBet = 0;
        this.tricksWon = 0;
        this.totalScore = 0;
    }

    removeCard(card, deck) {
        const index = this.cards.findIndex(
            c => c.suit === card.suit && c.value === card.value
        );

        this.cards[index].playable = null

        deck.returnCard(this.cards[index]);

        if (index !== -1) {
            this.cards.splice(index, 1);
        }
    }

    getPlayable(lead_suit) {
        let match_lead = 0;
        if (lead_suit === null || lead_suit === "E" || lead_suit === "W") {
            if (match_lead == 0) {
                for (const card of this.cards) {
                    card.playable = true;
                }
            }
        } else {
            console.log(`lead suit is defined: ${lead_suit}`)
            for (const card of this.cards) {
                if (card.suit === lead_suit) {
                    card.playable = true;
                    match_lead = match_lead + 1;
                }
                if (card.suit === "W" || card.suit === "E") {
                    card.playable = true;
                }
            }
            if (match_lead == 0) {
                for (const card of this.cards) {
                    card.playable = true;
                }
            }
        }
    }

    resetPlayableCards() {
        for (const card of this.cards) {
            card.playable = null;
        }
    }

    newRound(deck) {
        for (const card of this.cards) {
            card.playable = null;
            deck.returnCard(card);
        }
        this.cards = []
        this.currentBet = 0;
        this.tricksWon = 0;
    }

    placeBet(amount) {
        this.currentBet = amount;
    }

    winTrick() {
        this.tricksWon++;
    }

    scoreRound() {
        if (this.tricksWon == this.currentBet) {
            this.totalScore += 20 + (this.currentBet * 10);
        } else {
            this.totalScore -= Math.abs(this.tricksWon - this.currentBet) * 10;
        }
        console.log(`${this.name} bet ${this.currentBet} and won ${this.tricksWon}.\n\tCurrent Score: ${this.totalScore}`)
    }
}