class SpiderSolitaire {
    constructor() {
        this.deck = [];
        this.columns = Array(10).fill().map(() => []);
        this.completedSets = 0;
        this.moves = 0;
        this.selectedCards = [];
        this.gameMode = 1;

        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        this.deck = [];
        this.columns = Array(10).fill().map(() => []);
        this.completedSets = 0;
        this.moves = 0;
        this.selectedCards = [];
        this.updateStats();

        // 根据游戏模式创建卡牌
        const suits = ['♠', '♥', '♣', '♦'].slice(0, this.gameMode);
        const decksNeeded = Math.floor(8 / this.gameMode); // 确保总共有104张牌

        for (let deck = 0; deck < decksNeeded; deck++) {
            for (let suit of suits) {
                for (let i = 1; i <= 13; i++) {
                    this.deck.push({ value: i, suit, faceUp: false });
                }
            }
        }

        // 洗牌
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }

        // 发牌
        for (let i = 0; i < 54; i++) {
            const column = i % 10;
            const card = this.deck.pop();
            if (card) {
                if (i >= 44) { // 最后一行牌正面朝上
                    card.faceUp = true;
                }
                this.columns[column].push(card);
            }
        }

        this.renderGame();
    }

    setupEventListeners() {
        document.getElementById('newGame').addEventListener('click', () => {
            this.initializeGame();
        });

        document.getElementById('gameMode').addEventListener('change', (e) => {
            this.gameMode = parseInt(e.target.value);
            this.initializeGame();
        });

        document.querySelector('.card-columns').addEventListener('click', (e) => {
            const cardElement = e.target.closest('.card');
            if (!cardElement) return;

            const columnIndex = parseInt(cardElement.dataset.column);
            const cardIndex = parseInt(cardElement.dataset.index);
            this.handleCardClick(columnIndex, cardIndex);
        });

        document.querySelector('.deck').addEventListener('click', () => {
            if (this.deck.length > 0) {
                this.dealCards();
            }
        });
    }

    handleCardClick(columnIndex, cardIndex) {
        const column = this.columns[columnIndex];
        if (!column[cardIndex].faceUp) return;

        if (this.selectedCards.length === 0) {
            if (this.isValidSelection(columnIndex, cardIndex)) {
                this.selectCards(columnIndex, cardIndex);
            }
        } else {
            const [selectedColumn] = this.selectedCards[0];
            if (selectedColumn === columnIndex) {
                this.deselectCards();
            } else if (this.canMoveCards(columnIndex)) {
                this.moveCards(columnIndex);
                this.moves++;
                this.updateStats();
                this.checkForCompletedSets();
            } else {
                this.deselectCards();
            }
        }

        this.renderGame();
    }

    isValidSelection(columnIndex, cardIndex) {
        const column = this.columns[columnIndex];
        if (cardIndex === column.length - 1) return true;

        for (let i = cardIndex; i < column.length - 1; i++) {
            if (column[i].value !== column[i + 1].value + 1 ||
                column[i].suit !== column[i + 1].suit) {
                return false;
            }
        }
        return true;
    }

    selectCards(columnIndex, cardIndex) {
        const cards = this.columns[columnIndex].slice(cardIndex);
        this.selectedCards = cards.map(card => [columnIndex, card]);
    }

    deselectCards() {
        this.selectedCards = [];
    }

    canMoveCards(targetColumnIndex) {
        const targetColumn = this.columns[targetColumnIndex];
        if (targetColumn.length === 0) return true;

        const [, firstSelectedCard] = this.selectedCards[0];
        const targetCard = targetColumn[targetColumn.length - 1];
        return targetCard.value === firstSelectedCard.value + 1;
    }

    moveCards(targetColumnIndex) {
        const [sourceColumnIndex] = this.selectedCards[0];
        const sourceColumn = this.columns[sourceColumnIndex];
        const cardsToMove = sourceColumn.splice(sourceColumn.length - this.selectedCards.length);
        this.columns[targetColumnIndex].push(...cardsToMove);

        if (sourceColumn.length > 0 && !sourceColumn[sourceColumn.length - 1].faceUp) {
            sourceColumn[sourceColumn.length - 1].faceUp = true;
        }

        this.deselectCards();
    }

    dealCards() {
        if (this.deck.length >= 10) {
            for (let i = 0; i < 10; i++) {
                const card = this.deck.pop();
                card.faceUp = true;
                this.columns[i].push(card);
            }
            this.moves++;
            this.updateStats();
            this.renderGame();
        }
    }

    checkForCompletedSets() {
        for (let i = 0; i < this.columns.length; i++) {
            const column = this.columns[i];
            if (column.length >= 13) {
                for (let j = column.length - 13; j < column.length; j++) {
                    if (j === column.length - 13) continue;
                    if (column[j].value !== column[j - 1].value - 1 ||
                        column[j].suit !== column[j - 1].suit) {
                        break;
                    }
                    if (j === column.length - 1) {
                        this.removeCompletedSet(i);
                    }
                }
            }
        }
    }

    removeCompletedSet(columnIndex) {
        this.columns[columnIndex].splice(this.columns[columnIndex].length - 13, 13);
        this.completedSets++;
        this.updateStats();

        if (this.columns[columnIndex].length > 0 && 
            !this.columns[columnIndex][this.columns[columnIndex].length - 1].faceUp) {
            this.columns[columnIndex][this.columns[columnIndex].length - 1].faceUp = true;
        }

        if (this.completedSets === 8) {
            setTimeout(() => {
                alert('恭喜你赢得了游戏！');
                this.initializeGame();
            }, 500);
        }
    }

    updateStats() {
        document.getElementById('moves').textContent = this.moves;
        document.getElementById('completedSets').textContent = this.completedSets;
    }

    renderGame() {
        const columnsContainer = document.querySelector('.card-columns');
        columnsContainer.innerHTML = '';

        this.columns.forEach((column, columnIndex) => {
            column.forEach((card, cardIndex) => {
                const cardElement = document.createElement('div');
                cardElement.className = `card${card.faceUp ? '' : ' back'}`;
                if (this.selectedCards.some(([col, c]) => col === columnIndex && c === card)) {
                    cardElement.classList.add('selected');
                }
                cardElement.dataset.column = columnIndex;
                cardElement.dataset.index = cardIndex;
                cardElement.style.gridColumn = columnIndex + 1;
                cardElement.style.gridRow = cardIndex + 1;
                if (card.faceUp) {
                    const valueMap = {
                        1: 'A', 11: 'J', 12: 'Q', 13: 'K'
                    };
                    const displayValue = valueMap[card.value] || card.value.toString();
                    cardElement.innerHTML = `${displayValue}<br>${card.suit}`;
                    cardElement.style.color = ['♥', '♦'].includes(card.suit) ? '#e74c3c' : '#2c3e50';
                }
                columnsContainer.appendChild(cardElement);
            });
        });

        const deckContainer = document.querySelector('.deck');
        deckContainer.innerHTML = '';
        if (this.deck.length > 0) {
            const deckPile = document.createElement('div');
            deckPile.className = 'deck-pile';
            const deckCount = document.createElement('div');
            deckCount.className = 'deck-count';
            deckCount.textContent = `剩余发牌次数: ${Math.floor(this.deck.length / 10)}`;
            deckPile.appendChild(deckCount);
            deckContainer.appendChild(deckPile);
        }
    }
}

// 初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    new SpiderSolitaire();
});